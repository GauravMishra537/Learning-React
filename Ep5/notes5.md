# React Notes — Part 5 (Episode 5)
### Let's Get Hooked — File Structuring, useState & Reconciliation

---

## 1. Restructuring the Project — Best Practices for File Organization

Up to this point, every component (`AppLayout`, `Header`, `Body`, `RestaurantCard`) lived inside a single, growing `app.js` file — nearly 1000 lines. This isn't sustainable: real projects have thousands of components, and a huge single file is hard for humans (not machines) to work with.

### The Standard Folder Convention
```
project-root/
├── index.html
├── src/
│   ├── app.js
│   └── components/
│       ├── Header.js
│       ├── Body.js
│       └── RestaurantCard.js
```
- An `src` folder to hold all source code — a near-universal convention, though not strictly required by React itself.
- A `components` folder holding one file per component.
- **File naming convention:** name the file exactly after the component it contains, starting with a capital letter (`Header.js` contains the `Header` component) — so any developer instantly knows what's inside a file just from its name.

**Important, myth-busting detail:** React's own official documentation explicitly states there is **no single recommended folder structure** — React doesn't care how files are organized. Different companies group files differently (by feature/route, e.g. a `feed/` folder holding all feed-related files, or by type, e.g. all components in one folder, all API files in another). The advice: **don't overthink this early on** — pick something reasonable and simple, and restructure later as the app grows.

**`.js` vs `.jsx` file extensions:** also a matter of team/personal preference, not a hard rule — both work identically. Consistency within a project matters more than which one is chosen.

### Export & Import — Making Components Usable Across Files

Once a component moves to its own file, it must be **exported** from that file and **imported** wherever it's used.

#### Default Export/Import
```javascript
// Header.js
const Header = () => { /* ... */ };
export default Header;
```
```javascript
// app.js
import Header from "./components/Header";
```
- **A file can only have ONE default export.**
- This is the standard, most common way to export a single component from its file.

#### Named Export/Import
```javascript
// constants.js
export const CDN_URL = "https://...";
export const LOGO_URL = "https://...";
```
```javascript
// Header.js
import { LOGO_URL } from "../utils/constants";
```
- Used when a file needs to export **multiple** things — a file can have any number of named exports, but only one default export.
- **Syntax difference to remember:** named imports require curly braces `{ }` around the name; default imports do not.

**A genuinely useful mental shortcut:** *"first give, then take"* — a component or value must be exported from its source file before it can be imported anywhere else.

---

## 2. Never Hardcode Data or URLs Inside Component Files

A real best practice: hardcoded strings (CDN URLs, logo image links, mock data objects) should **never** live directly inside a component's file — they belong in dedicated files instead.

```
src/
└── utils/
    ├── constants.js   (CDN_URL, LOGO_URL, and other shared string constants)
    └── mockData.js    (the hardcoded restaurant list, exported for now)
```

- A folder commonly named `utils` (or `common`, or `config` in other codebases) holds these shared, non-component files.
- Constants are conventionally named in **UPPER_SNAKE_CASE** (`CDN_URL`, `LOGO_URL`) to visually distinguish them from regular variables.
- Keeping mock/hardcoded data in one clearly-separated file makes it trivial to later swap it for real API data without touching component logic.

---

## 3. Adding Interactivity — Event Handlers

A `<button>` can respond to a click using the `onClick` attribute, which takes a **callback function**:
```jsx
<button
    className="filter-btn"
    onClick={() => {
        console.log("Button clicked");
    }}
>
    Top Rated Restaurants
</button>
```
- The callback is wrapped in `{ }` because it's a JavaScript expression (a function) being embedded in JSX.
- Other DOM events work the same way — `onMouseOver`, `onBlur`, `onChange`, etc. — each is React's equivalent of the corresponding native browser event, just written in camelCase.

---

## 4. The Problem: Updating a Plain Variable Doesn't Update the UI

**The feature being built:** a "Top Rated Restaurants" button that filters the visible list down to only restaurants with a rating above 4.

The natural first instinct: use `.filter()` (a plain JavaScript array method) on the restaurant list, and reassign it:
```jsx
let listOfRestaurants = mockData; // a plain 'let' variable

const filterTopRated = () => {
    const filteredList = listOfRestaurants.filter(
        (res) => res.data.avgRating > 4
    );
    listOfRestaurants = filteredList; // reassigning the plain variable
};
```

**Result: nothing visibly changes on the page**, even though logging the variable confirms it WAS correctly filtered internally. This is the exact, hands-on demonstration of a core problem: **a plain JavaScript variable has no mechanism to tell React "hey, re-draw the UI, my value changed."** The UI and the underlying data have become out of sync.

**This is precisely the problem every UI framework (React included) exists to solve:** keeping the UI layer automatically, reliably in sync with the data layer, without the developer manually rewriting the DOM by hand every time data changes.

---

## 5. The Fix — React Hooks & `useState`

**Definition: A React Hook is simply a normal JavaScript function, pre-built and provided by React, that gives a functional component extra capabilities** ("superpowers") it wouldn't have as a plain function. Hooks are imported from the `react` package, exactly like any other named export.

There are two hooks used constantly throughout React development — **`useState`** and **`useEffect`** (the second is covered in a later episode). This episode focuses on `useState`.

### Creating a State Variable
```jsx
import { useState } from "react";

const Body = () => {
    const [listOfRestaurants, setListOfRestaurants] = useState([]);
    // ...
};
```

- `useState(initialValue)` is called with the variable's **starting/default value** (here, an empty array).
- It returns an **array with exactly two elements**: the current value, and a function to update it.
- `const [listOfRestaurants, setListOfRestaurants] = useState([])` uses **array destructuring** (plain JavaScript, not React-specific syntax) to pull those two values out into individually named variables in one line.

**Naming convention:** the updater function is conventionally named `set` + the variable name (`listOfRestaurants` → `setListOfRestaurants`) — not mandatory, but a strong, widely-followed industry convention.

**What `useState` actually returns, unpacked manually (to demystify the destructuring):**
```jsx
const stateArray = useState([]);
const listOfRestaurants = stateArray[0];
const setListOfRestaurants = stateArray[1];
// ...is exactly equivalent to the one-line destructured version above
```

### Reading and Updating a State Variable

**Reading** a state variable works exactly like reading any normal variable — use it directly in JSX, pass it to `.map()`, etc.

**Updating** a state variable is different from a normal variable — direct reassignment (`listOfRestaurants = ...`) is not allowed and won't trigger anything. Instead, the updater function returned by `useState` must be called:
```jsx
const filterTopRated = () => {
    const filteredList = listOfRestaurants.filter(
        (res) => res.data.avgRating > 4
    );
    setListOfRestaurants(filteredList);
};
```

**The result this time: the UI genuinely, visibly updates** — clicking the button immediately shows only the filtered restaurants. This is the exact same filtering logic as before; the only change is calling `setListOfRestaurants` instead of a plain reassignment — and that single difference is what makes React aware a re-render is needed.

---

## 6. The Core Rule — "State Update Triggers Re-render"

**The formal rule, worth memorizing exactly: whenever a state variable updates, React re-renders the component.**

- A **re-render** means React re-runs the component function and updates the UI to reflect the new state — automatically, without any manual DOM manipulation code being written by the developer.
- This works specifically because `listOfRestaurants` was created via `useState` — React actively tracks state variables created this way. A plain `let`/`const` variable has no such tracking, which is exactly why the earlier attempt silently failed.

---

## 7. Why This Makes React Fast — Virtual DOM, Diffing & Reconciliation

This is the deeper mechanism behind "React re-renders efficiently" — a genuinely important system-design/interview topic.

### Virtual DOM
**Definition: The Virtual DOM is a plain JavaScript object representation of the actual DOM** — NOT the real, rendered HTML elements themselves. Recall from earlier episodes that a React element (built via JSX/`React.createElement`) is just an object with a `type` and `props`; a whole component tree is just a larger, nested version of that same kind of object. That nested object structure IS the Virtual DOM.

### The Diffing Algorithm
When a state variable updates:
1. React builds a **new** Virtual DOM object reflecting the updated state.
2. It compares this new Virtual DOM against the **previous** Virtual DOM (from before the state change) — this comparison step is the **diffing algorithm**, essentially finding the difference between two JavaScript objects.
3. Comparing two plain JavaScript objects is fast; comparing raw HTML/DOM structures directly would be much slower.
4. Once the differences are identified, React updates **only the specific parts of the real DOM that actually changed** — not the entire page.

### Reconciliation & React Fiber
**Definition: Reconciliation is the overall process of figuring out what changed and updating the real DOM to match.** The specific algorithm React currently uses to do this (since React 16) is called **React Fiber** — an ongoing, evolving implementation that introduced capabilities like **incremental rendering** (splitting rendering work into smaller chunks across multiple frames, rather than blocking everything at once).

**The core, interview-ready one-liner:** *React is fast not because it magically "does everything," but because it efficiently identifies exactly what changed (via a Virtual DOM diff) and updates only that part of the real DOM* — real DOM manipulation is expensive (recall Part 1's discussion of this), so minimizing it is the whole point.

**Important, recurring myth to keep busting:** React does NOT perform bundling, minification, or code-splitting — that's the bundler's job (recall Parts 1–2). React's own specific superpower is this efficient DOM update mechanism, nothing more, nothing less.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| `src`/`components` folders | Standard (but not React-mandated) convention for organizing files by component |
| Default export/import | One per file; no curly braces on import |
| Named export/import | Multiple per file; curly braces required on import |
| Constants/mock data files | Hardcoded strings and data should never live directly inside component files |
| React Hook | A pre-built JavaScript function, provided by React, giving components extra capabilities |
| `useState(initialValue)` | Returns `[currentValue, updaterFunction]` via array destructuring |
| Updating state | Must use the updater function (`setX(...)`) — direct reassignment does nothing |
| "State update triggers re-render" | The core rule explaining why UI and data stay in sync |
| Virtual DOM | A plain JS object representation of the UI, not real DOM elements |
| Diffing / Reconciliation / React Fiber | The process and algorithm React uses to find what changed and update only that part of the real DOM |

