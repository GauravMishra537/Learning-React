# React Notes — Part 6 (Episode 6)
### Let's Explore the World — useEffect, API Calls & Controlled Inputs

---

## 1. Quick Context — Monolith vs Microservices

Before diving into API calls, a brief architectural context (genuinely useful for understanding WHY a frontend app calls separate backend services):

| | Monolith | Microservices |
|---|---|---|
| Structure | One single, large codebase containing everything — UI, APIs, auth, DB access, notifications, all together | Separate, independent services — one for UI, one for backend/API, one for auth, one for notifications, etc. |
| Deployment | Deploying even a tiny change requires rebuilding/redeploying the ENTIRE project | Each service is built, deployed, and scaled independently |
| Tech stack | Forced to use one language/stack for everything | Each service can use whichever language/stack fits it best (UI in React, backend in Java, another service in Python, etc.) |
| Principle | — | Follows **separation of concerns** and the **single responsibility principle** — each service does one job |

**How these services talk to each other:** each runs on its own port (recall the frontend project running on port 1234) and is typically mapped to a path on a shared domain — e.g., `yourapp.com/` serves the UI, `yourapp.com/api` routes to the backend service. Services communicate with each other over these URLs.

**Why this matters for this episode:** the React app being built is essentially **one microservice — the UI service** — and this episode is about making it talk to an external backend service (a live API) to fetch real data, instead of relying on hardcoded mock data.

---

## 2. Two Approaches to Loading Data on Page Load

**Approach 1 — Wait, then render:**
```
Page loads → make API call → WAIT for data → render the UI with that data
```
The user sees nothing (or a blank page) until the API responds — a poor experience if the call takes any noticeable time.

**Approach 2 — Render first, then update (the one React apps use):**
```
Page loads → render the UI immediately with whatever is available → make an API call → once data arrives, re-render with the real data
```

**Why Approach 2 is preferred:** it gives a better perceived user experience — the user sees *something* right away (even just a skeleton/placeholder), rather than a frozen blank screen. React re-rendering a second time once data arrives is not a performance concern, precisely because **React's rendering mechanism is highly efficient** (a theme carried over from Episode 5's reconciliation discussion) — a second render is cheap, and the UX gain is well worth it.

---

## 3. The `useEffect` Hook

**Definition:** `useEffect` is a React Hook — a special function, imported (as a named import) from `react` — that lets you run some code **after** a component has rendered.

```jsx
import { useEffect } from "react";

const Body = () => {
    useEffect(() => {
        console.log("useEffect called");
    }, []);

    // ...
};
```

`useEffect` takes **two arguments**:
1. A **callback function** — the code to run after render.
2. A **dependency array** — controls WHEN the callback re-runs (covered more in a later episode; an empty array `[]` means "run once, only after the first render").

### The Critical Timing Detail — Proven, Not Just Stated
A common point of confusion: does the `useEffect` callback run *before* or *after* the component renders?

```jsx
const Body = () => {
    console.log("Body rendered");
    useEffect(() => {
        console.log("useEffect called");
    }, []);
    return ( /* JSX */ );
};
```

**Console output order:** `"Body rendered"` prints FIRST, then `"useEffect called"` prints SECOND.

**The rule, stated precisely:** React first renders the component (runs the function body, produces the JSX, updates the DOM), and only *after* that render cycle finishes does it invoke the `useEffect` callback. This can be directly verified by stepping through the code with browser DevTools breakpoints — watching the component's JSX appear on the page *before* the `useEffect` callback fires.

**Why this matters:** this timing is exactly what's needed to implement Approach 2 above — render the component first (with empty/placeholder data), and only afterward trigger the API call inside `useEffect`.

---

## 4. Fetching Data — Plain JavaScript, Nothing React-Specific

**Definition:** `fetch` is a Web API — a capability provided by the **browser**, not by JavaScript the language itself, and not by React (recap from earlier JS notes on Web APIs). Making an API call inside React uses exactly the same `fetch` syntax as in plain JavaScript — there is no special "React way" to fetch data.

```jsx
const fetchData = async () => {
    const data = await fetch("https://api.example.com/restaurants");
    const json = await data.json();
    console.log(json);
};

useEffect(() => {
    fetchData();
}, []);
```

- `fetch(url)` returns a Promise, resolved using `async`/`await` (the modern, industry-preferred syntax over `.then()`/`.catch()` chains).
- A second `await` is needed to parse the response body into usable JSON — `fetch` itself only resolves once the response headers arrive, not the full body (recap from earlier async JS notes).

### The CORS Roadblock
Calling a real, external website's API (e.g., a food delivery site's live API) directly from a local development server typically fails with an error like:
> *"Access to fetch at [API URL] from origin [localhost] has been blocked by CORS policy."*

**Definition: CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that blocks a webpage from freely making requests to a different **origin** (a different domain) than the one it was loaded from, unless that other origin explicitly allows it. The *browser* is what enforces this block — not the API server itself, and not JavaScript.

**A practical (development-only) workaround:** a browser extension exists that disables CORS enforcement for local testing purposes. This is strictly a local development convenience — real production apps solve CORS properly on the server side (by having the API explicitly allow the calling origin), not by asking users to install browser extensions.

**An honest, important caveat:** any specific third-party API URL used for learning purposes can change or stop working at any time — the API provider owns it and can modify or remove it without notice. The reusable, durable knowledge here is the **process**: open a real website's Network tab, find the API call returning the data you want, and copy that URL to experiment with — this skill remains valid regardless of which specific API happens to work today.

---

## 5. Updating State With Fetched Data

Once fetched, the JSON response replaces the hardcoded mock data by updating the state variable:
```jsx
const [listOfRestaurants, setListOfRestaurants] = useState([]);

useEffect(() => {
    fetchData();
}, []);

const fetchData = async () => {
    const data = await fetch("https://api.example.com/restaurants");
    const json = await data.json();
    setListOfRestaurants(json?.data?.cards[2]?.data?.data?.cards);
};
```

**A real-world observation worth internalizing:** actual production API responses are often deeply nested and messy (multiple levels of `data`, various card "types" mixed together for different UI sections) — this is exactly what the earlier **Config-Driven UI** discussion predicted. Extracting just the specific piece needed (here, the restaurant list) from a much larger, more complex payload is a completely normal, everyday part of real frontend work.

**Optional chaining (`?.`)** — a plain JavaScript feature (not React-specific) — is used here to safely access deeply nested properties without the code crashing if an intermediate value happens to be `undefined`.

Since `listOfRestaurants` is a **state variable**, calling `setListOfRestaurants(...)` triggers React's rule from Episode 5: **whenever a state variable updates, React re-renders the component** — so the page automatically updates from the initial empty state to display the live, fetched data.

---

## 6. Conditional Rendering & Shimmer UI

While the API call is in flight, `listOfRestaurants` is still empty — this can be used to show a loading state:
```jsx
if (listOfRestaurants.length === 0) {
    return <Shimmer />;
}

return (
    <div className="body">
        {/* actual restaurant cards */}
    </div>
);
```

**Definition: Conditional rendering** simply means rendering different JSX depending on a condition — a general concept, not a special React feature (an `if` statement, or a ternary operator, deciding what gets returned).

### A More Compact Form — Ternary Operator
```jsx
return listOfRestaurants.length === 0 ? <Shimmer /> : (
    <div className="body">
        {/* actual restaurant cards */}
    </div>
);
```
Purely a JavaScript syntax choice (the ternary `condition ? a : b`) — functionally identical to the `if`/early-return version above, just more compact.

### Shimmer UI — A Real Industry Standard
**Definition: Shimmer UI is a placeholder loading state that visually mimics the shape of the real content that will eventually load** (e.g., gray card-shaped blocks where actual restaurant cards will appear) — as opposed to a generic spinner or a plain "Loading..." message.

```jsx
const Shimmer = () => {
    return (
        <div className="shimmer-container">
            <div className="shimmer-card"></div>
            <div className="shimmer-card"></div>
            {/* repeated as many times as needed */}
        </div>
    );
};
export default Shimmer;
```

**Why this is preferred over a plain spinner (a genuine UX principle, not just decoration):** it sets a visual expectation for the user about what's coming and roughly how much content to expect, making the loading period feel less jarring than content abruptly popping in all at once. This pattern is widely used across major real-world products.

---

## 7. Deepening `useState` — A Login/Logout Toggle Example

To build real intuition for *why* state variables are necessary (not just *how* to use them), consider a simple login/logout button:

```jsx
// ❌ Using a plain variable — does NOT work
let btnNameJS = "Login";

<button onClick={() => { btnNameJS = "Logout"; }}>
    {btnNameJS}
</button>
```
Clicking this button visibly does nothing — even though logging `btnNameJS` inside the click handler confirms the variable's value genuinely changed internally. **The plain variable changed, but nothing told React to re-render the component**, so the displayed UI never updates. This is the same core lesson from Episode 5, reinforced with a second, independent example.

```jsx
// ✅ Using useState — works correctly
const [btnNameReact, setBtnNameReact] = useState("Login");

<button
    onClick={() => {
        setBtnNameReact(btnNameReact === "Login" ? "Logout" : "Login");
    }}
>
    {btnNameReact}
</button>
```

### What Actually Happens Behind the Scenes (Proven, Not Just Asserted)
Adding a `console.log` at the top of the `Header` component reveals that clicking the button causes the **entire `Header` function to run again** — proving that "re-render" literally means React calls the component function again from scratch:
```jsx
const Header = () => {
    console.log("Header rendered");
    // ...
};
```
Clicking the button repeatedly logs `"Header rendered"` each time — confirming a fresh call to the component function on every state update.

**The subtlety that resolves the "how can a constant update?" confusion:** each time `Header()` is called again, it's a **brand new execution** of that function — with a brand-new `btnNameReact` variable, initialized this time not with the original default value, but with whatever value `useState` currently holds internally after the last update. The "constant" isn't being mutated — an entirely new instance of it is created on each fresh call, holding the latest value. This is precisely why direct reassignment of a `const` variable is never needed or attempted.

**And yet, only the button's text actually changes on screen — nothing else in the header re-draws (the logo doesn't flicker, the nav list doesn't reload).** This is the diffing/reconciliation process from Episode 5 in direct action: React re-runs the whole function, builds a new Virtual DOM, compares it against the previous one, finds that only the button's text differs, and updates **only that specific piece of the real DOM** — this selective, minimal DOM update is the concrete reason React is considered fast, not the mere existence of a Virtual DOM by itself.

---

## 8. Controlled Inputs — Binding an `<input>` to State

Building a search box surfaces another common point of confusion.

### The Broken First Attempt
```jsx
const [searchText, setSearchText] = useState("");

<input type="text" value={searchText} />
```
Typing into this input box **does nothing** — the characters typed don't appear at all.

**Why:** setting `value={searchText}` **binds** (ties) the input's displayed value directly to the `searchText` state variable. Since nothing is updating `searchText` when the user types, the input's displayed value stays permanently frozen at its initial value (`""`), no matter what the user tries to type. Typing into a bound input, on its own, does not automatically update the state — a listener has to be added explicitly to do that.

### The Fix — `onChange`
```jsx
<input
    type="text"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
/>
```
- `onChange` fires on every keystroke.
- `e.target.value` reads the input's current raw value from the native browser event object at that moment.
- Calling `setSearchText(...)` updates the state — which (per the now-familiar rule) triggers a re-render, and the input redisplays with the just-typed character included.

**This input/state pairing (`value` + `onChange` together) is known as a "controlled input"** — React state is the single source of truth for the input's value, rather than the DOM element managing its own value independently.

### A Genuinely Mind-Bending Realization
Adding a `console.log` at the top of `Body` reveals that **every single keystroke** in the search box causes the **entire `Body` component to re-render** — not just the input box:
```jsx
const Body = () => {
    console.log("Body rendered");
    // ...
};
```
Typing five characters logs `"Body rendered"` five separate times. This can feel alarming at first — but it's precisely the same efficient reconciliation mechanism from Section 7: React re-runs the whole component function on every keystroke, but the **diffing algorithm** ensures only the actual changed DOM node (the input's value) gets touched in the real DOM — nothing else re-paints. This is exactly why typing rapidly still feels instant and smooth despite dozens of "re-renders" happening under the hood.

**The genuinely important, interview-ready takeaway:** React being fast is NOT simply "because it has a Virtual DOM" (a common but shallow answer) — it's specifically because the **reconciliation/diffing process finds the minimal set of real DOM changes needed and applies only those**, regardless of how many times the surrounding component logic re-runs.

---

## 9. A Real, Hands-On Bug — Mutating the Wrong State Variable

Implementing search filtering naively introduces a subtle, realistic bug:

```jsx
// ❌ Buggy version
const filterRestaurants = () => {
    const filteredList = listOfRestaurants.filter((res) =>
        res.data.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setListOfRestaurants(filteredList); // overwrites the ORIGINAL full list!
};
```

**The bug:** the first search works correctly — but searching a *second* time (for something different) fails, because the first search already **permanently overwrote** `listOfRestaurants` with just the filtered subset. The second search now filters against that already-narrowed list, not the original full dataset from the API.

### The Fix — Keep Two Separate State Variables
```jsx
const [listOfRestaurants, setListOfRestaurants] = useState([]);     // the untouched, full original list
const [filteredRestaurants, setFilteredRestaurants] = useState([]); // only what's currently displayed

useEffect(() => {
    fetchData();
}, []);

const fetchData = async () => {
    const data = await fetch("...");
    const json = await data.json();
    const restaurants = json?.data?.cards[2]?.data?.data?.cards;
    setListOfRestaurants(restaurants);     // both get the full data initially
    setFilteredRestaurants(restaurants);
};

const filterRestaurants = () => {
    const filtered = listOfRestaurants.filter((res) =>   // always filters from the UNTOUCHED original
        res.data.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRestaurants(filtered);   // only the DISPLAYED list changes
};

// Render using filteredRestaurants, not listOfRestaurants
```

**The core lesson:** `listOfRestaurants` is kept as an untouched "source of truth" copy of everything fetched from the API; `filteredRestaurants` is a separate state variable representing only what should currently be visible. Filtering always reads from the untouched original, guaranteeing repeated searches work correctly no matter how many times the user searches.

---

## 10. A Closing Life Lesson — "Code Slow"

A genuinely practical piece of advice, worth carrying forward: **deliberately writing code slowly — questioning every line ("why am I writing this? is this really needed? could this be written differently?") — tends to produce far fewer bugs than rushing.** Developers who habitually code quickly often end up spending disproportionately more time later debugging avoidable mistakes; slowing down during writing tends to reduce total time spent overall, debugging included.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| Monolith vs Microservices | One giant shared codebase vs many small, independently deployable services |
| Two data-loading approaches | Render-then-wait (poor UX) vs render-first-then-update (React's standard approach) |
| `useEffect(callback, deps)` | Runs `callback` AFTER the component renders; empty `[]` means "once, after first render" |
| CORS | A browser security mechanism blocking cross-origin requests unless explicitly permitted |
| Optional chaining (`?.`) | Safely access deeply nested data without crashing on `undefined` |
| Conditional rendering | Returning different JSX based on a condition (`if` or ternary) |
| Shimmer UI | A loading placeholder that mimics the real content's shape — better UX than a spinner |
| "Re-render" (proven) | React re-invokes the ENTIRE component function again, from scratch, on every state update |
| Controlled input | An `<input>` whose `value` is bound to state, kept in sync via `onChange` |
| Why React is fast (precise answer) | Diffing/reconciliation finds and applies only the minimal real DOM changes, even though the component function itself re-runs fully every time |
| State-mutation bug | Never overwrite an original "source of truth" state variable with a filtered subset — keep them separate |

