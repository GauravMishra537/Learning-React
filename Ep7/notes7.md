 React Notes — Part 7 (Episode 7)
### Finding the Path — Deeper into Hooks & React Router

---

## 1. `useEffect` — The Three Dependency Array Cases (Deep Dive)

Recap: `useEffect(callback, dependencyArray)` runs `callback` after a render. The **second argument (dependency array) is optional** — only the callback is mandatory — and changing what's passed here fundamentally changes WHEN the callback fires.

### Case 1 — No Dependency Array at All
```jsx
useEffect(() => {
    console.log("useEffect called");
});
```
**Behavior:** the callback runs after **every single render** of the component — including every re-render triggered by any state update.

### Case 2 — Empty Dependency Array
```jsx
useEffect(() => {
    console.log("useEffect called");
}, []);
```
**Behavior:** the callback runs **only once** — after the component's very first (initial) render. Subsequent re-renders (e.g., from clicking a button that updates state) do NOT trigger it again.

### Case 3 — Dependency Array With a Value
```jsx
useEffect(() => {
    console.log("useEffect called");
}, [btnNameReact]);
```
**Behavior:** the callback runs after the initial render, AND again **every time the specific value(s) listed in the array change** — and only then, not on unrelated re-renders.

**Why this matters, precisely:** this is a genuinely common interview question, and the distinction between these three cases is exactly what separates a correct answer from a shaky one. Case 2 (empty array) is what makes `useEffect` suitable for "run this once, when the component first loads" tasks like an initial API call; Case 3 is what enables re-running specific logic only when a particular piece of state changes (useful in more advanced patterns, like re-fetching when a search term updates).

---

## 2. `useState` — Best Practices (Rules That Prevent Real Bugs)

### Rule 1: Never call `useState` outside a component
```jsx
// ❌ Outside any component
const [x, setX] = useState(0);

const MyComponent = () => { /* ... */ };
```
This throws an error: *"Invalid hook call. Hooks can only be called inside the body of a function component."* **`useState` exists specifically to create local state for a functional component** — calling it outside one is meaningless and unsupported.

### Rule 2: Always call hooks at the top level of the component
```jsx
const MyComponent = () => {
    const [count, setCount] = useState(0); // ✅ at the top, first thing
    // ...rest of the component
};
```
Placing state declarations at the top, before other logic, is a hygiene practice — it keeps the component's code predictable and consistent for both other developers and for React itself (which relies on hooks being called in the same order on every render).

### Rule 3: Never call `useState` conditionally
```jsx
// ❌ Never do this
if (someCondition) {
    const [x, setX] = useState(0);
}
```
Technically valid JavaScript, but explicitly against React's own rules of hooks. **Reason:** if the condition is sometimes true and sometimes false across different renders, React ends up calling a different number/order of hooks each time — creating internal inconsistency that breaks React's ability to correctly track state.

### Rule 4: Never call `useState` inside a loop or inside a nested function
```jsx
// ❌ Never do this
for (let i = 0; i < 5; i++) {
    const [x, setX] = useState(0);
}

// ❌ Never do this either
function helper() {
    const [x, setX] = useState(0);
}
```
Same underlying reason as Rule 3 — hooks must be called in a consistent, predictable order on every single render, at the top level of the component function, never nested inside conditionals, loops, or other functions.

**The unifying principle behind all four rules:** state variables belong exclusively at the top level of a functional component's body — nowhere else. Following this consistently avoids an entire category of confusing, hard-to-diagnose bugs.

---

## 3. Introducing Routing — React Router DOM

**The feature being built:** distinct URLs within the app — `/about` shows an About page, `/contact` shows a Contact page — without which the app only has one single "page" (route) available.

### Installation
```bash
npm install react-router-dom
```
This adds `react-router-dom` to `package.json`/`package-lock.json` as a normal dependency — a hugely popular, widely-used routing library in the React ecosystem, currently on a modern major version (v6) that significantly simplified the API compared to its predecessor.

### Step 1 — Building the Routing Configuration
```jsx
import { createBrowserRouter } from "react-router-dom";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
    },
    {
        path: "/about",
        element: <About />,
    },
    {
        path: "/contact",
        element: <Contact />,
    },
]);
```
- `createBrowserRouter` takes an **array of route objects** — each defining a `path` and the `element` (component) to render when that path is active.
- `About` and `Contact` here are just ordinary components — recall: "a page is just a component," nothing more exotic.

### Step 2 — Actually Rendering the Router
```jsx
import { RouterProvider } from "react-router-dom";

root.render(<RouterProvider router={appRouter} />);
```
Simply defining the configuration isn't enough — `RouterProvider` is the component that actually **applies** this routing configuration to the app, replacing what used to be a direct `<AppLayout />` render.

**Why `createBrowserRouter` specifically:** React Router offers several router types (hash router, memory router, static router, etc.) for different use cases, but `createBrowserRouter` is the one the library's own documentation explicitly recommends for standard web projects — a reasonable, sensible default choice.

---

## 4. Handling Errors — `errorElement` & `useRouteError`

Navigating to an undefined route (e.g., `/xyz`) shows React Router's own default error page — a reasonably polished built-in fallback, rather than a raw, ugly crash.

### A Custom Error Page
```jsx
const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        errorElement: <Error />,
    },
    // ...
]);

const Error = () => {
    return (
        <div>
            <h1>Oops! Something went wrong.</h1>
        </div>
    );
};
```
`errorElement` on a route tells React Router: "if anything goes wrong on this path, render THIS component instead."

### Getting Details About the Error — `useRouteError`
```jsx
import { useRouteError } from "react-router-dom";

const Error = () => {
    const err = useRouteError();

    return (
        <div>
            <h1>Oops! Something went wrong.</h1>
            <h3>{err.status}: {err.statusText}</h3>
        </div>
    );
};
```
**Definition:** `useRouteError` is a hook (recognizable by its `use` prefix — a consistent naming convention across all React and React Router hooks) provided by React Router, giving access to details about whatever error occurred on the current route (e.g., a 404 status and message) — allowing a custom error page to show more specific, useful information instead of a generic message.

---

## 5. Children Routes & `<Outlet>`

**The problem this section solves:** with the basic setup above, navigating to `/about` shows ONLY the About page — losing the shared `Header`/`Footer` that should ideally persist across every page.

### Nesting Routes
```jsx
const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        errorElement: <Error />,
        children: [
            { path: "/", element: <Body /> },
            { path: "/about", element: <About /> },
            { path: "/contact", element: <Contact /> },
        ],
    },
]);
```
- A route can have a `children` array — nested routes that render **inside** the parent route's own layout, rather than replacing it entirely.
- `AppLayout` remains the constant, outer "shell" (containing `Header`, `Footer`); `Body`, `About`, and `Contact` become interchangeable content rendered based on the current path.

### `<Outlet>` — Where the Children Actually Render
```jsx
import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="app">
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
};
```
**Definition:** `Outlet` is a component from React Router that acts as a **placeholder** — whichever child route currently matches the URL gets rendered exactly where `<Outlet />` sits in the parent's JSX. The end user never sees any trace of "Outlet" in the actual rendered HTML — it's fully replaced by the matching child component's own markup at render time.

**Real-world result:** navigating between `/`, `/about`, and `/contact` now keeps `Header`/`Footer` visibly constant, while only the middle section swaps — exactly matching how most real multi-page-feeling apps actually behave.

---

## 6. `<Link>` vs `<a>` — Why It Matters

```jsx
// ❌ Avoid inside a React Router app
<a href="/about">About</a>

// ✅ Use instead
import { Link } from "react-router-dom";
<Link to="/about">About</Link>
```

**The critical, directly observable difference:** clicking a plain `<a href="...">` causes a **full page reload** — the browser makes a fresh request, the whole app re-initializes, and any transient UI state is lost. Clicking a `<Link to="...">` does **not** reload the page at all — only the relevant component(s) update, near-instantly.

### A Genuinely Interesting Reveal — Link IS an Anchor Tag Underneath
Inspecting the actual rendered HTML shows that `<Link>` still produces a real `<a>` tag in the DOM. **The browser only understands native HTML elements — it has no built-in concept of a "Link" component.** What `<Link>` actually is: a wrapper around a normal anchor tag that **additionally** hooks into React Router's internal tracking, intercepting the click to perform client-side navigation instead of letting the browser's default full-page-reload behavior happen.

**The practical rule this leads to:** inside any React Router–powered app, always use `<Link>` (or the related `<NavLink>`) instead of a raw `<a>` tag for internal navigation — reserving plain `<a>` tags for genuine external links where a full navigation IS actually desired.

---

## 7. Client-Side Routing vs Server-Side Routing

| | Server-Side Routing (traditional) | Client-Side Routing (React Router) |
|---|---|---|
| What happens on navigation | Browser makes a network request for a whole new HTML page (`about.html`), full page reload | No network request for a new page; React swaps which already-loaded component is displayed |
| Speed | Slower — full reload each time | Fast — only the necessary DOM parts update |
| What's loaded | A new page is fetched from the server for every navigation | The entire app's JS (including every route's component code) was already loaded once, upfront |

**This directly explains the term "Single Page Application" (SPA):** technically, there is only ONE actual HTML page ever loaded from the server — every subsequent "page" the user navigates to is really just a different component being swapped in by client-side JavaScript, with the URL updated to match (via the History API, behind the scenes) — no new page is ever fetched from a server during that navigation.

---

## 8. Dynamic Routing — One Component, Many Restaurants

**The goal:** clicking any restaurant card leads to a menu page specific to that restaurant — `/restaurants/395939` shows one restaurant's menu, `/restaurants/505182` shows a different one — all using the **same** reusable component, populated with different data.

### Defining a Dynamic Path Segment
```jsx
{
    path: "/restaurants/:resId",
    element: <RestaurantMenu />,
}
```
**The colon (`:resId`) marks a dynamic segment** — this path matches `/restaurants/` followed by ANY value, and that value becomes accessible inside the component under the name `resId`.

### Reading the Dynamic Value — `useParams`
```jsx
import { useParams } from "react-router-dom";

const RestaurantMenu = () => {
    const { resId } = useParams();
    // resId now holds whatever value was in the URL, e.g. "395939"
};
```
**Definition:** `useParams` is a hook from React Router that returns an object containing all the dynamic segments matched in the current URL — here, destructured directly to pull out `resId`.

### Using the Dynamic ID to Fetch Restaurant-Specific Data
```jsx
import { MENU_API } from "../utils/constants";

const RestaurantMenu = () => {
    const { resId } = useParams();
    const [resInfo, setResInfo] = useState(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        const data = await fetch(MENU_API + resId);
        const json = await data.json();
        setResInfo(json.data);
    };

    if (resInfo === null) return <Shimmer />;

    const { name, cuisines, costForTwoMessage } =
        resInfo?.cards[2]?.card?.card?.info;

    return (
        <div className="menu">
            <h1>{name}</h1>
            <h3>{cuisines.join(", ")}</h3>
            <h3>{costForTwoMessage}</h3>
            {/* ...menu items */}
        </div>
    );
};
```

**A critical ordering detail (a real, hands-on bug worth learning from):** the early-return guard (`if (resInfo === null) return <Shimmer />;`) must come **before** any code that tries to destructure/access properties from `resInfo` — otherwise, on the very first render (while `resInfo` is still `null`), the destructuring line crashes immediately, since you can't read properties off `null`. Placing the guard first ensures that line is never reached until real data actually exists.

**Another real, honest observation:** live production APIs are often deeply, inconsistently nested (as seen again here — the menu data required drilling through several layers of `cards[x].card.card...`), and the exact structure can and does change over time as the API provider updates their backend. The durable skill is knowing HOW to explore a live API's response in DevTools and adapt the code to whatever shape it currently has — not memorizing one specific path forever.

### Making Each Restaurant Card Link to Its Own Dynamic Route
```jsx
import { Link } from "react-router-dom";

const RestaurantContainer = () => {
    return (
        <div className="res-container">
            {filteredRestaurants.map((restaurant) => (
                <Link
                    key={restaurant.info.id}
                    to={"/restaurants/" + restaurant.info.id}
                >
                    <RestaurantCard resData={restaurant} />
                </Link>
            ))}
        </div>
    );
};
```
- Each card is wrapped in a `<Link>` pointing to a URL built dynamically from that specific restaurant's own ID — string concatenation (`"/restaurants/" + id`) needs `{ }` since it's a JavaScript expression inside JSX.
- **Important placement detail:** since the `.map()` is now iterating over `<Link>` elements (not directly over `<RestaurantCard>`), the required `key` prop moves to the `<Link>` — the outermost element actually being mapped — not to the component nested inside it.

**The payoff, made concrete:** clicking any restaurant card now navigates to that restaurant's own unique menu page, fetched live from the API, using the SAME `RestaurantMenu` component and the SAME route definition — all without a single full-page reload, thanks to `<Link>` and client-side routing.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| `useEffect` with no deps | Runs after every single render |
| `useEffect` with `[]` | Runs once, after the initial render only |
| `useEffect` with `[value]` | Runs after initial render, and again whenever `value` changes |
| `useState` placement rules | Always top-level of a component; never outside, never conditional, never in a loop/nested function |
| `createBrowserRouter` | Builds a routing configuration from an array of `{ path, element }` objects |
| `RouterProvider` | Actually applies a routing configuration to the rendered app |
| `errorElement` / `useRouteError` | Custom error pages per route, with access to real error details |
| `children` + `<Outlet>` | Nested routes render inside a shared parent layout, at the `<Outlet />` placeholder |
| `<Link>` vs `<a>` | `<Link>` avoids full page reloads via client-side routing; still renders as an `<a>` underneath |
| Client-side vs server-side routing | No new page fetched vs a fresh page request on every navigation — the basis of "Single Page Application" |
| `:paramName` + `useParams` | Defines and reads a dynamic segment of the URL, enabling one component to serve many different pages of data |

