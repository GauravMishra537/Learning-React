# React Notes — Part 4 (Episode 4)
### Building a Real App — Planning, Props, Config-Driven UI & Keys

---

## 1. Planning Before Coding

**The first rule for building any real application: plan before writing a single line of code.** Jumping straight into coding a header or a card without a plan leads to messy, unstructured work. Good planning makes the actual coding step almost trivial by comparison.

### Step 1 — UI Design / Wireframe
Sketch (on paper or otherwise) roughly how the app should look: a header at the top (logo on one side, navigation links on the other), a body in the middle, and a footer at the bottom. Within the body, sketch out major sections too — e.g., a search bar, followed by a list of cards.

### Step 2 — Component Breakdown
Once the visual layout is clear, break it down into components:
```
App (top-level component)
├── Header
│   ├── Logo
│   └── Nav Items
├── Body
│   ├── Search
│   └── RestaurantContainer
│       └── RestaurantCard (repeated many times)
└── Footer
```

**Why this two-step planning process matters:** once this structure exists on paper, coding becomes a matter of translating each labeled box into a component — there's no ambiguity about what "the header" or "the card" refers to once it's time to write code.

---

## 2. Building the Skeleton — Component Composition in Practice

```jsx
const AppLayout = () => {
    return (
        <div className="app">
            <Header />
            <Body />
            <Footer />
        </div>
    );
};

const Header = () => {
    return (
        <div className="header">
            <div className="logo-container">
                <img className="logo" src="LOGO_URL_HERE" />
            </div>
            <ul className="nav-items">
                <li>Home</li>
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Cart</li>
            </ul>
        </div>
    );
};

root.render(<AppLayout />);
```
This is exactly **component composition** (from the previous episode) put into practice — a top-level component (`AppLayout`) assembled from smaller, purpose-specific components (`Header`, `Body`, `Footer`).

**A very common beginner slip, worth flagging explicitly:** writing `class="header"` (plain HTML) instead of `className="header"` (JSX) — JSX will throw a warning ("invalid DOM property `class`, did you mean `className`?") for this exact mistake.

---

## 3. Two Ways to Write CSS in JSX

### Inline styles — via a JavaScript object
```jsx
const styleCard = {
    backgroundColor: "#f0f0f0",
};

const RestaurantCard = () => {
    return <div style={styleCard}>...</div>;
};

// or inline directly:
<div style={{ backgroundColor: "#f0f0f0" }}>...</div>
```
**Key detail:** the `style` attribute in JSX does NOT accept a CSS string like plain HTML does — it expects a **JavaScript object**, with camelCase property names (`backgroundColor`, not `background-color`). The double curly braces (`style={{ ... }}`) can look confusing at first — the **outer** `{ }` says "this is a JavaScript expression," and the **inner** `{ }` is simply a JavaScript object literal.

**This is generally NOT the preferred way to style components** — it's shown here mainly for completeness.

### External CSS file with class names
```jsx
<div className="rest-card">...</div>
```
```css
.rest-card {
    width: 200px;
    border: 1px solid black;
    padding: 5px;
}
```
This remains the standard approach for this stage of learning. (A separate, dedicated styling approach using a utility-first CSS framework is generally covered later in a full curriculum.)

---

## 4. Looking at Real Production Data

Real APIs (like a food delivery app's restaurant-listing endpoint) don't return simple, flat objects — inspecting one in the browser's Network tab reveals a deeply nested structure: an object with a `cards` array, where different cards represent different UI sections (a promotional carousel, a "see all restaurants" section, etc.), and each restaurant's actual details are buried several levels deep (e.g., `restaurant.data.name`, not just `name`).

**Why real APIs look like this: Config-Driven UI**

**Definition: Config-Driven UI** means the application's UI structure and content are controlled by data (a "config") coming from the backend, rather than being hardcoded in the frontend. The exact same frontend code can render a completely different UI — different promotional banners, different sections, different content — purely based on what config the backend sends, without needing separate app builds for different cities, regions, or user segments.

**Why this matters (a genuinely important system-design talking point):** a food delivery app might show different promotional carousels in different cities, or show no carousel at all in a city with no active promotions — this is achieved by controlling what the backend sends back as data, not by writing different frontend code per city. This is standard practice at real, large-scale product companies, and is a common front-end system-design interview topic.

**A related, practical point:** a good frontend engineer should still understand and be able to question the shape of the data an API returns — noticing redundant or duplicated fields (e.g., an API returning both a raw number AND a pre-formatted string version of the same value) is a sign of engaged, senior-level thinking about the full stack, not just the UI layer.

---

## 5. Props — Passing Dynamic Data Into Components

**Definition: Props (short for "properties") are how data is passed into a component — conceptually identical to passing arguments into a function.**

```jsx
const RestaurantCard = (props) => {
    return (
        <div className="rest-card">
            <h3>{props.restName}</h3>
            <h4>{props.cuisine}</h4>
        </div>
    );
};

<RestaurantCard restName="Sample Kitchen" cuisine="Biryani, North Indian" />
<RestaurantCard restName="Fast Bites" cuisine="Burgers, Fast Food" />
```

- Each attribute written on the component tag (`restName="..."`, `cuisine="..."`) becomes a key on a single object, which React automatically bundles and passes in as the function's argument — conventionally named `props`.
- Accessing a value is just normal JavaScript object property access: `props.restName`.

### Destructuring Props (Common, Cleaner Convention)
```jsx
// Instead of accessing props.restName, props.cuisine everywhere...
const RestaurantCard = (props) => {
    return <h3>{props.restName}</h3>;
};

// ...destructure directly in the function signature:
const RestaurantCard = ({ restName, cuisine }) => {
    return <h3>{restName}</h3>;
};
```
**Important clarification:** this destructuring is NOT special React syntax — it's plain JavaScript object destructuring, applied to the `props` object right at the point it's received as a function argument. Both styles are common in real codebases; the explicit `props.xyz` form is arguably more readable for beginners, while destructuring is a widely-used, more concise convention.

### Passing an Entire Object as a Single Prop
Rather than passing many individual primitive props, it's common (and far more scalable) to pass one whole data object:
```jsx
const RestaurantCard = ({ restData }) => {
    const { name, avgRating, cuisines, costForTwo, cloudinaryImageId } = restData.data;

    return (
        <div className="rest-card">
            <img className="rest-logo" src={"CDN_URL/" + cloudinaryImageId} />
            <h3>{name}</h3>
            <h4>{cuisines.join(", ")}</h4>
            <h4>{avgRating} stars</h4>
            <h4>₹{costForTwo / 100} for two</h4>
        </div>
    );
};

<RestaurantCard restData={someRestaurantObject} />
```

**Key details worth internalizing:**
- The prop's value is wrapped in `{ }` (not quotes) because it's a genuine JavaScript object/variable being passed, not a plain string.
- `cuisines.join(", ")` — a plain JavaScript array method — turns an array of strings into a single, comma-separated display string.
- String concatenation for a dynamic image URL (a fixed CDN base + a per-restaurant image ID) must be wrapped in `{ }`, since it's a JavaScript expression, not static text: `src={cdnBaseUrl + cloudinaryImageId}`.
- Destructuring a full object like this — pulling out just the specific fields actually needed (`name`, `avgRating`, etc.) — keeps the JSX markup clean and readable, rather than repeating `restData.data.xxxx` everywhere.

---

## 6. Rendering a List of Components Dynamically — `.map()`

Manually writing out `<RestaurantCard restData={obj1} />`, `<RestaurantCard restData={obj2} />`, and so on for every restaurant doesn't scale — the number of restaurants isn't known ahead of time. The fix: **loop over the data array using `.map()`** and render one component per item.

```jsx
const RestaurantContainer = () => {
    return (
        <div className="rest-container">
            {restaurantList.map((restaurant) => (
                <RestaurantCard key={restaurant.data.id} restData={restaurant} />
            ))}
        </div>
    );
};
```

- `{ }` is required because `.map(...)` is a JavaScript expression being embedded inside JSX.
- `.map()` is preferred over a manual `for` loop here — this is standard, idiomatic React/JavaScript style (functional array methods over manual loops), and is worth being comfortable with (`map`, `filter`, `reduce` show up constantly in real React code).
- The real power of this pattern: however many items are in `restaurantList` — 5, 50, or 500 — the exact same few lines of code render all of them correctly, with zero hardcoding.

---

## 7. The `key` Prop — Why React Needs It

Running the code above without a `key` prop produces a console warning: *"Each child in a list should have a unique key prop."*

**Definition:** `key` is a special, reserved prop that gives React a stable, unique identifier for each item in a list — allowing React to efficiently track which items were added, removed, or reordered between renders, instead of having to blindly re-render the entire list every time.

**Why this matters (the real mechanism, not just "React tells you to"):** without unique keys, if a single new item is inserted anywhere in a list — even at the very front — React has no way to tell which items are "the same as before" and which are new. Its only safe option is to re-render the **entire list** from scratch. With unique keys, React can precisely detect "these existing items are unchanged, only this one new item needs to be inserted" — and update only what's actually necessary. For a list with dozens or hundreds of items, this is a genuine, significant performance difference, not just a cosmetic requirement.

```jsx
<RestaurantCard key={restaurant.data.id} restData={restaurant} />
```

### Why NOT to Use the Array Index as the Key
```jsx
// Works, but NOT recommended:
{restaurantList.map((restaurant, index) => (
    <RestaurantCard key={index} restData={restaurant} />
))}
```
Using the loop index as a key technically silences the warning and often appears to work — but React's own official documentation explicitly advises against it whenever list order can change (items added, removed, or reordered), because the index doesn't actually track a specific item's identity — item at "index 2" today might be a completely different underlying item after a re-order, confusing React's optimization logic.

### The Priority Order (Best Practice, Worth Memorizing)
```
No key at all           →  Not acceptable (React warns/errors)
Index used as key        →  Works, but is an anti-pattern — acceptable only as a last resort
A genuinely unique ID     →  The correct, recommended approach
```
If the underlying data has no stable unique identifier at all, the right fix is to ask for one to be added at the data/API level — not to quietly fall back to index-based keys as a long-term solution.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| Planning first | Sketch the UI, then break it into a component tree, before writing any code |
| Component composition (in practice) | Assembling a page from small, focused components like Header/Body/Footer |
| Inline styles | `style={{ jsObject }}` — camelCase properties, not a CSS string |
| Config-Driven UI | Backend data controls what UI renders — same frontend code, different output per config |
| Props | Data passed into a component, bundled as one object argument (destructurable) |
| Passing a whole object as a prop | Scales better than many individual primitive props for complex data |
| `.map()` for lists | Renders one component per data item, scaling automatically with the data |
| `key` prop | A stable unique identifier per list item, letting React update lists efficiently instead of full re-renders |
| Index as key | Works, but is an anti-pattern per React's own docs — use only when no real unique ID exists |

