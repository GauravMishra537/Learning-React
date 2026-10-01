React Notes — Part 9 (Episode 9)
### Optimizing Our App — Custom Hooks & Lazy Loading

---

## 1. Single Responsibility Principle (SRP)

Important computer science principle — a function, class, or component should have SINGLE responsibility.

Example — `RestaurantCard` — only job is display restaurant card (get props, return JSX). Same with `Header.js` — only job is display header. Good, modular components.

Benefits of following SRP / modular code:
- **Reusable** — a well-made single-responsibility component (like `RestaurantCard`) can be reused anywhere in app.
- **Maintainable** — easy to update, easy for colleagues to read.
- **Testable** — small units can have focused test cases; a bug in one small piece gets caught by that piece's test, no need to hunt through whole giant component.

No hard-and-fast rule for what counts as "single responsibility" — but general goal: keep components as light and readable as possible.

---

## 2. Problem — `RestaurantMenu` Doing Too Much

`RestaurantMenu` component currently has TWO major responsibilities:
1. **Fetching the data** (API call logic)
2. **Displaying the data** (UI/JSX)

Ideally, component should ONLY worry about displaying data — not how/where data comes from. This is where **custom hooks** come in.

---

## 3. What Is a Hook (Recap)

Hooks are just normal JavaScript functions — special utility functions given to us by React (or by other libraries, like `useParams` from `react-router-dom`). Nothing to fear — a hook is just a utility/helper function.

Since hooks are just utility functions, we can create OUR OWN custom hooks too.

---

## 4. Creating Custom Hook — `useRestaurantMenu`

**Goal:** extract the "fetch menu data" logic out of `RestaurantMenu` component into its own hook. Component then just calls the hook, gets back `resInfo`, and only worries about displaying it.

**Convention / rules for naming custom hooks:**
- Create hooks inside `utils` folder.
- One separate file per hook — good pattern to follow.
- File name same as hook name.
- Hook name MUST start with lowercase `use` (e.g. `useRestaurantMenu`) — this is how React (and linters) recognize it as a hook vs normal function.

**`utils/useRestaurantMenu.js`:**
```jsx
import { useEffect, useState } from "react";

const useRestaurantMenu = (resId) => {
    const [resInfo, setResInfo] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await fetch(MENU_API + resId);
        const json = await data.json();
        setResInfo(json.data);
    };

    return resInfo;
};

export default useRestaurantMenu;
```

**Contract of the hook:** think of every custom hook in terms of INPUT and OUTPUT.
- Input: `resId` (restaurant ID)
- Output: `resInfo` (restaurant menu data)

Component calling the hook doesn't need to know/worry about HOW data fetched — just gets `resInfo` back "magically."

**Using it inside `RestaurantMenu.js`:**
```jsx
import useRestaurantMenu from "../utils/useRestaurantMenu";

const RestaurantMenu = () => {
    const { resId } = useParams();
    const resInfo = useRestaurantMenu(resId);

    if (!resInfo) return <Shimmer />;

    // ...rest of display logic only
};
```

Now `RestaurantMenu` no longer manages its own state or fetch logic — single responsibility restored: just display data.

**Common bug while doing this:** forgetting `.data` when destructuring JSON response (`json.data` not just `json`) — causes "cannot read property of undefined" type errors. Double check exact API response shape.

**Benefit — testability:** if there's a bug in fetching logic, go check `useRestaurantMenu`. If bug in display, go check `RestaurantMenu`. Clear separation of concern.

**Homework:** create own custom hook, practice extracting fetch-logic pattern wherever found in own code.

---

## 5. Custom Hook Example 2 — `useOnlineStatus`

**Feature to build:** track whether user's internet connection is online or offline — like green/red dot seen in chat apps (Facebook Messenger, etc.). Show fallback message if user goes offline instead of random blank/broken page.

**Contract:**
- Input: nothing needed (hook doesn't need any info from caller — gets browser's own online/offline event, doesn't depend on props from calling component).
- Output: a boolean (`true` = online, `false` = offline).

**`utils/useOnlineStatus.js`:**
```jsx
import { useState, useEffect } from "react";

const useOnlineStatus = () => {
    const [onlineStatus, setOnlineStatus] = useState(true);

    useEffect(() => {
        window.addEventListener("online", () => {
            setOnlineStatus(true);
        });
        window.addEventListener("offline", () => {
            setOnlineStatus(false);
        });
    }, []);

    return onlineStatus;
};

export default useOnlineStatus;
```

Browser's `window` object already gives access to `online`/`offline` events — hook just listens once (empty dependency array `[]` — add listener only once).

**Using it in `Body.js`:**
```jsx
import useOnlineStatus from "../utils/useOnlineStatus";

const Body = () => {
    const onlineStatus = useOnlineStatus();

    if (onlineStatus === false) {
        return (
            <h1>
                Looks like you're offline. Please check your internet connection.
            </h1>
        );
    }

    // ...rest of normal display
};
```

**Testing offline behavior:** don't need to physically turn off wifi — Chrome DevTools → Network tab → throttling dropdown → select "Offline" — simulates offline experience directly in browser.

**Reusability demo:** since it's a hook, can reuse SAME `useOnlineStatus` anywhere in app — e.g. also show a green/red dot in `Header.js`:
```jsx
import useOnlineStatus from "../utils/useOnlineStatus";

const Header = () => {
    const onlineStatus = useOnlineStatus();

    return (
        <div className="header">
            {/* ... */}
            <li>Online Status: {onlineStatus ? "🟢" : "🔴"}</li>
        </div>
    );
};
```
This is power of custom hooks — build logic once, use everywhere, no duplication.

**Real-world relevance:** this is exact type of logic behind Chrome's offline dinosaur game — checks online status behind scenes, shows game when offline instead of blank error page. Can build similar creative fallback (game, better UI) instead of plain error message.

---

## 6. Hook Naming Convention — Is `use` Mandatory?

Technically NOT mandatory — code still works even without `use` prefix (e.g. renaming to `getOnlineStatus` won't break functionality). But strongly recommended:
1. React's official docs recommend starting custom hook names with `use`.
2. Many projects set up **linters** (ESLint) that will throw errors/warnings if hook naming convention not followed.
3. Readability — when another developer sees `useOnlineStatus`, they immediately know it's a React hook (has its own internal state/lifecycle managed in "React way"), not just a plain utility function like `getOnlineStatus`.

Same convention applies to component names — must start with Capital letter.

**Recommendation:** always follow library/framework's recommended naming conventions — good practice, avoid unnecessary arguments about it.

---

## 7. App Optimization — Bundling & Bundle Size Problem

**Recap — what does a bundler (Parcel) do:** takes all separate files in project and bundles them into fewer files (ideally one main JS file) for the browser to load. Also does minification, compression, caching, etc.

**The problem with large-scale apps:** real-world apps (e.g. MakeMyTrip, Swiggy) have THOUSANDS of components across many verticals (flights, hotels, homestays / food delivery, grocery delivery, etc.) — all bundled into ONE single JS file.

Problem: this single JS file's size keeps growing as more components added — can become several MB. Large file = slow to download = slow initial page load = bad user experience.

**Cannot go to either extreme:**
- Can't have thousands of separate files loading individually (browser has to make thousands of requests — inefficient).
- Can't cram everything into one giant file either (bloated, slow initial load).

**Solution: smaller, LOGICAL bundles** — split app into smaller chunks based on feature/vertical. E.g., for MakeMyTrip: one bundle just for Flights components, one just for Hotels, one just for Homestays. For Swiggy-like app: one bundle for main food delivery, separate bundle for Grocery/Instamart vertical.

This process has MANY different names (all mean the same thing — important for interviews):
- **Chunking**
- **Code Splitting**
- **Dynamic Bundling**
- **Lazy Loading**
- **On-Demand Loading**
- **Dynamic Import**

---

## 8. Implementing Lazy Loading — `React.lazy`

**Demo setup:** created a hypothetical `Grocery.js` component (imagine it's a huge feature with tons of sub-components), added a `/grocery` route in `App.js`, and a link in `Header.js`.

**Problem without lazy loading:** even though Grocery is a separate feature, importing it normally (`import Grocery from "./components/Grocery"`) still bundles its code into the SAME main JS bundle — defeats the purpose.

**Fix — dynamic import using `React.lazy`:**

```jsx
import { lazy } from "react";

const Grocery = lazy(() => import("./components/Grocery"));
```

- `lazy` — a function given to us by React, named export from `react` package.
- Takes a callback function.
- Inside callback, use `import(...)` — this is NOT the regular static import statement; it's a special FUNCTION form of import that takes the path of the component and dynamically loads it only when needed.

**Effect:** now Grocery's code does NOT get bundled into the main `index.js` bundle at all — a SEPARATE JS file (e.g. `grocery.[hash].js`) gets created. Verified in Network tab — initial page load has only main bundle; clicking the `/grocery` route triggers a NEW network request for the separate grocery bundle, loaded only on demand.

**Error encountered:** "A component suspended while responding to a synchronous input" — happens because at the moment user navigates to `/grocery`, the separate bundle hasn't finished downloading yet (network takes time, even if just milliseconds) — React doesn't know what to render in that gap.

---

## 9. Handling the Loading Gap — `Suspense`

**Fix — wrap lazily-loaded component in React's `Suspense` component:**

```jsx
import { lazy, Suspense } from "react";

const Grocery = lazy(() => import("./components/Grocery"));

// inside route config:
{
    path: "/grocery",
    element: (
        <Suspense fallback={<h1>Loading...</h1>}>
            <Grocery />
        </Suspense>
    ),
},
```

- `Suspense` — component given by React, used to wrap a lazily-loaded component that "is not available at the moment."
- `fallback` prop — takes any JSX (a loading message, a spinner, even a full `Shimmer` component) — this is what gets shown WHILE the separate bundle is still downloading.
- Once bundle finishes downloading, React automatically swaps fallback out for the real component.

**Testing on slow network:** Chrome DevTools → Network tab → throttling → "Slow 3G" — makes the loading gap visible (e.g. bundle takes ~2 seconds), fallback message clearly shows during that wait. On fast network, gap so small it's barely noticeable — but still technically happens (and would throw the suspend error without `Suspense` wrapper).

**Applied to `About` page too (as another example)** — same pattern: `lazy(() => import("./components/About"))` + wrap route element in `<Suspense fallback={...}>`. Even though About is a small component (doesn't really need its own bundle in practice), done here purely to demonstrate reusability of the pattern.

---

## 10. Why This Matters — Interview Relevance

This is genuinely important knowledge for **frontend system design interviews**, especially for senior frontend roles. Talking points to mention in interview:
- "Bundle size" / "app bloating" as a real production concern.
- Use of **code splitting / dynamic import / lazy loading** to break a large app into smaller logical bundles.
- Explaining `React.lazy` + `Suspense` pattern as the concrete implementation.

Cannot build a large-scale, production-ready frontend application without accounting for this — small apps with 10-20 components are fine as one bundle, but as component count and bundle size grows (e.g. crossing several MB), this optimization becomes necessary.

## Full Example — Lazy Loaded Route in `App.js`

```jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Body from "./components/Body";
import RestaurantMenu from "./components/RestaurantMenu";
import Error from "./components/Error";

const About = lazy(() => import("./components/About"));
const Grocery = lazy(() => import("./components/Grocery"));

const AppLayout = () => {
    return (
        <div className="app">
            <Header />
            <Outlet />
        </div>
    );
};

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        errorElement: <Error />,
        children: [
            { path: "/", element: <Body /> },
            {
                path: "/about",
                element: (
                    <Suspense fallback={<h1>Loading...</h1>}>
                        <About />
                    </Suspense>
                ),
            },
            {
                path: "/grocery",
                element: (
                    <Suspense fallback={<h1>Loading...</h1>}>
                        <Grocery />
                    </Suspense>
                ),
            },
            { path: "/restaurants/:resId", element: <RestaurantMenu /> },
        ],
    },
]);

export default appRouter;
```

---

## Quick Recap Table

| Concept | Purpose | Key Code |
|---|---|---|
| Single Responsibility Principle | Keep components/functions focused on one job | — |
| Custom Hook | Extract reusable logic (e.g. data fetching) out of component | `const useX = (input) => { ...; return output; }` |
| `useRestaurantMenu` | Extracts menu-fetching logic from `RestaurantMenu` | Input: `resId` → Output: `resInfo` |
| `useOnlineStatus` | Tracks browser online/offline status, reusable anywhere | Input: none → Output: boolean |
| Hook naming | Must start with lowercase `use` (convention, not hard rule) | Helps React/linters/readers identify hooks |
| Bundling problem | One giant JS bundle for whole large-scale app = slow load | — |
| Code Splitting / Chunking / Lazy Loading / Dynamic Import / On-Demand Loading | All same concept — split code into smaller bundles loaded only when needed | — |
| `React.lazy` | Dynamically import a component into its own separate bundle | `lazy(() => import("./Component"))` |
| `Suspense` | Show fallback UI while a lazy-loaded bundle is still downloading | `<Suspense fallback={<X/>}><LazyComp/></Suspense>` |

---