# React Notes — Part 1 
### Inception — Building "Hello World" in HTML, JS, and Then React

---

## 1. Hello World Using Plain HTML

Before touching React at all, let's build the exact same "Hello World" three different ways — HTML, then JavaScript, then React — so we can see exactly what React is actually doing for us.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Namaste React</title>
</head>
<body>
    <div id="root">
        <h1>Hello World</h1>
    </div>
</body>
</html>
```
Nothing new here — a `div` with `id="root"` acting as a container, and a plain `<h1>` heading written directly.

---

## 2. Hello World Using JavaScript (DOM Manipulation)

Now let's build the SAME output, but by injecting the heading using JavaScript instead of writing it directly in HTML:

```javascript
const heading = document.createElement("h1");
heading.innerHTML = "Hello World from JavaScript";

const root = document.getElementById("root");
root.appendChild(heading);
```

- `document.createElement("h1")` creates an H1 tag.
- `heading.innerHTML = "..."` puts text inside it.
- `document.getElementById("root")` finds our container div.
- `root.appendChild(heading)` inserts our heading as a child of the root div.

This is plain DOM manipulation (recap earlier DOM notes) — no React involved yet.

---

## 3. Getting React Into Our Project — Via CDN

React doesn't come built into the browser — the browser has **no idea** what React is. So the first step is to actually bring React's code into our project. The simplest way to do this (before build tools) is via a **CDN (Content Delivery Network)** — a hosted location we can pull the React library from directly.

```html
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
```

**Why TWO separate files/libraries?**

| File | What it is |
|---|---|
| `react.development.js` | The **core** of React — the fundamental React algorithm, independent of any specific platform |
| `react-dom.development.js` | The library that acts as a **bridge** between React and the actual DOM (the browser) |

**The reason for this split:** React isn't limited to browsers — it also powers **React Native** (mobile apps) and other renderer targets. The core `react` package contains logic shared across ALL these platforms, while `react-dom` contains logic specific to rendering into a **web browser's DOM**. A different renderer (like React Native) would pair the same core `react` package with its own platform-specific "DOM"-equivalent library instead.

**What actually happens when these scripts load:** the browser executes this JS code (written by engineers at Facebook/Meta), and it attaches a global `React` object (and a `ReactDOM` object) onto the `window` — which is why, after adding these script tags, simply typing `React` in the console suddenly works and shows a real object with methods like `createElement`, `Component`, `Fragment`, etc. **At the end of the day, React is just JavaScript** — a library written by developers, just like any of us could write.

---

## 4. Our First Real React Code

```javascript
const heading = React.createElement("h1", {}, "Hello World from React");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(heading);
```

### `React.createElement(type, props, children)`
Takes **3 arguments**:
1. **The tag/type** — e.g., `"h1"`
2. **An object of attributes** (also called `props`) — e.g., `{ id: "heading" }`, or `{}` if none needed
3. **The children** — what goes inside the tag (text, or another React element)

### `ReactDOM.createRoot(domNode)`
React needs to know **where** on the actual page it's allowed to render/manage things. `createRoot`, given a real DOM node (found the normal JS way, via `document.getElementById`), creates a **root** — the entry point React will use for all its rendering.

### `root.render(reactElement)`
Takes the React element we built and actually **renders** it onto the page, inside the root we defined.

**The division of responsibility is important to note:** `React.createElement` is a **core React** feature (comes from the `react` package) — it just builds a description of UI. `ReactDOM.createRoot` and `.render()` come from **react-dom** — because actually touching the browser's DOM is exactly the "bridge" job react-dom exists for.

---

## 5. What Does `React.createElement` Actually Return?

```javascript
const heading = React.createElement("h1", {}, "Hello World from React");
console.log(heading);
```

A very common misconception: people assume this returns an actual `<h1>` HTML element. **It does not.** If you log it, you'll see a **plain JavaScript object**:

```javascript
{
    type: "h1",
    props: {
        children: "Hello World from React"
    },
    ...
}
```

**This object is called a React Element.** It is NOT a real DOM node — it's just a lightweight, plain-object **description** of what should eventually appear on the page. The `props` object bundles together both the attributes we passed in AND the children.

**So what actually turns this into real HTML?** That's `root.render()`'s job — it takes this plain JS object (the React element) and is responsible for converting it into the actual `<h1>` tag the browser understands, then inserting it into the DOM. This is the real, foundational answer to "how does React actually work behind the scenes" — it's all just JavaScript objects, until React (via react-dom) converts them into real DOM nodes at render time.

---

## 6. Structuring the Code — Moving to `app.js`

Writing all our React logic directly inside `<script>` tags in the HTML file isn't good practice. Let's extract it:

```html
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="./app.js"></script>
</body>
```
```javascript
// app.js
const heading = React.createElement("h1", {}, "Hello World from React");
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(heading);
```

**A critical, easy-to-miss detail: the ORDER of these script tags matters.** `app.js` uses the global `React`/`ReactDOM` objects — so those two CDN scripts **must** load and execute BEFORE `app.js`. If you reorder them, you'll get a `ReferenceError: React is not defined`, because `app.js` would run before `React` even exists on `window` yet.

**React's underlying philosophy, worth internalizing here:** DOM manipulation (adding/removing nodes) is one of the most **expensive** operations a browser performs. React's whole design is built around the idea of doing all UI work through JavaScript, using efficient patterns, rather than manually touching the DOM directly and repeatedly — this is a theme that will come back again and again as we go deeper (Virtual DOM, reconciliation, etc., in later episodes).

---

## 7. Passing Attributes — The Second Argument (`props`)

```javascript
const heading = React.createElement("h1", { id: "heading" }, "Hello World from React");
```
The second argument (previously an empty object `{}`) is where we supply **attributes** for the tag — `id`, `className`, or literally any custom attribute:
```javascript
const heading = React.createElement("h1", { id: "heading", "xyz": "abc" }, "Hello World");
```
Inspecting the rendered page's Elements tab will show `<h1 id="heading" xyz="abc">` — confirming these get applied as real HTML attributes.

### Linking a Stylesheet (Just Normal HTML/CSS — Nothing React-Specific Yet)
```html
<link rel="stylesheet" href="./index.css">
```
```css
/* index.css */
#heading {
    color: red;
}
```
This works exactly like any normal webpage — React doesn't change how CSS files are linked at this stage.

---

## 8. Creating Nested Elements

Real UIs are rarely one tag deep. Suppose we want this structure:
```html
<div id="parent">
    <div id="child">
        <h1>I am an H1 tag</h1>
    </div>
</div>
```

Using `React.createElement`, we build this from the **inside out**, since each element's children must already exist to be passed in:

```javascript
const heading = React.createElement("h1", {}, "I am an H1 tag");

const child = React.createElement("div", { id: "child" }, heading);

const parent = React.createElement("div", { id: "parent" }, child);

root.render(parent);
```
Each `createElement` call's 3rd argument (children) can itself be **another React element** — that's exactly how nesting works: the `child` div's children is the `heading` element; the `parent` div's children is the `child` element.

### Multiple Children (Siblings) — Using an Array

What if `child` needs to hold **two** siblings, say an `<h1>` AND an `<h2>`?

```javascript
const heading1 = React.createElement("h1", {}, "I am an H1 tag");
const heading2 = React.createElement("h2", {}, "I am an H2 tag");

const child = React.createElement("div", { id: "child" }, [heading1, heading2]);

const parent = React.createElement("div", { id: "parent" }, child);

root.render(parent);
```
**The rule:** the 3rd argument (`children`) can be EITHER a single React element, OR an **array** of them, if there's more than one child at the same level.

**A warning you'll see when doing this:** React will log a console warning about a missing **`key`** prop when rendering an array of elements. This is intentional — React needs a `key` to efficiently track list items (covered properly in a later episode) — for now, it's safe to ignore, but worth noting that it exists.

**The honest, important takeaway from this section:** building even a moderately nested UI this way (deeply nested `createElement` calls, manually wrapped in arrays) gets **extremely messy, unreadable, and tedious** very fast. This exact pain point is precisely why **JSX** exists — and it's introduced in the very next episode. `React.createElement` is the true, core mechanism underneath React — but in real, modern React development, you'll almost never write it by hand again after this episode.

---

## 9. `root.render()` REPLACES, It Doesn't Append

An important, testable behavior: whatever `root.render()` is given completely **replaces** whatever was already inside the root element — it does not append alongside existing content.

```html
<div id="root">
    <h1>Ashish is here</h1>
</div>
```
```javascript
root.render(parent); // whatever was inside #root before is REPLACED by 'parent'
```
If you refresh fast enough, you can briefly glimpse the original HTML content before React's script executes and swaps it out — confirming that React genuinely takes over and **replaces** the root's contents, rather than adding to them.

**Important scope detail:** React ONLY affects whatever element you designated as the root (`document.getElementById("root")`). Any other HTML on the page — content above or below that root div — is left completely untouched by React.

```html
<h1>Hello, above root</h1>
<div id="root"></div>
<h1>Hello, below root</h1>
```
Both of these headings remain exactly as written; only the content INSIDE `#root` is under React's control.

---

## 10. Why React is Called a "Library," Not a "Framework"

This scoping behavior (Section 9) is exactly what makes React a **library** rather than a full-fledged **framework**:

- A **framework** typically expects to own your ENTIRE application — you build your whole app the framework's way, from top to bottom.
- **React**, being a library, can be dropped into just **one small part** of an existing page — a header, a sidebar, a single widget/card — without needing to rewrite the rest of the application. You could even integrate React into an existing jQuery-based application, controlling just one section of the page, while everything else remains untouched.

This flexibility — being usable in a small, contained piece of a much larger, non-React application — is a genuine, practical advantage React has over many full frameworks, and a big part of why it became so widely adopted incrementally inside large, pre-existing codebases.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| `react` package | The core React library/algorithm — platform-independent |
| `react-dom` package | The bridge connecting React's core to the actual browser DOM |
| `React.createElement(type, props, children)` | Builds a plain JS object (a "React element") describing a piece of UI — NOT real HTML |
| React Element | A lightweight object with `type` and `props` (which includes `children`) — just a description, not a DOM node |
| `ReactDOM.createRoot(domNode)` | Designates a real DOM node as React's entry point for rendering |
| `root.render(element)` | Converts a React element into real DOM and inserts it, REPLACING the root's existing content |
| Nested children | Pass another React element as the 3rd argument; use an array for multiple siblings |
| React = library, not framework | Can be used in just a small portion of an existing page, not the whole app |

---
