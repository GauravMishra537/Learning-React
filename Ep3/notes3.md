# React Notes — Part 3 (Episode 3)
### Laying the Foundation — JSX & Components

---

## 1. npm Scripts — Cleaning Up How We Run the Project

Instead of typing the full bundler command every time:
```bash
npx parcel index.html
```
we define **npm scripts** inside `package.json`, under a `"scripts"` section:
```json
"scripts": {
    "start": "parcel index.html",
    "build": "parcel build index.html"
}
```

Now the project runs with:
```bash
npm run start     # or the shortcut: npm start
npm run build
```

**Important detail:** `npm start` (without `run`) works as a shortcut ONLY for the script named `start` — this is a reserved keyword npm special-cases. For any other script name (like `build`), you must write the full `npm run build`.

**Why this matters in the real world:** this is genuinely an industry-standard convention — when joining any new project, the very first thing to do is open its `package.json` and look at the `"scripts"` section to learn exactly how to run/build it, rather than guessing bundler commands.

---

## 2. Recap — React Elements

```javascript
const heading = React.createElement("h1", { id: "heading" }, "Hello!");
```
- `React.createElement` returns a **React element** — a plain JavaScript object, NOT an actual HTML element.
- It only becomes a real, visible HTML element once it's passed to `root.render()`, which converts that object into HTML and inserts it into the page — replacing whatever was already there.

**A useful debugging habit:** put a placeholder like `Not rendered` inside your root `<div>` in the HTML file. If you ever see that text on the page, it's an instant signal that something in your render logic failed.

---

## 3. The Problem `React.createElement` Creates

Building even a moderately nested structure using `React.createElement` directly gets messy fast:
```javascript
React.createElement("div", { id: "parent" },
    React.createElement("div", { id: "child" },
        React.createElement("h1", {}, "Heading")
    )
);
```
This is hard to read and hard to visualize compared to how the actual HTML output will look. This exact readability problem is why **JSX** was created.

---

## 4. What Is JSX? (And What It Is NOT)

**Definition:** JSX is a syntax extension for JavaScript that lets you write markup that *looks* like HTML, directly inside your JS code — making it much easier to describe UI structure.

```jsx
const heading = <h1 id="heading">Hello!</h1>;
```

**Two very important myths to bust here:**

1. **JSX is NOT part of React.** They are two separate things. You CAN write React entirely using `React.createElement` without ever touching JSX — JSX is just a convenience layer developers use on top of React because it's dramatically easier to read and write.

2. **JSX is NOT "HTML inside JavaScript."** It only *looks* like HTML (more precisely, it resembles XML). It is its own distinct syntax — call it "HTML-like syntax," not HTML.

**Proof that it's genuinely different from HTML:** in JSX, you write `className` instead of `class`, and multi-word attributes use `camelCase` (e.g., `tabIndex` instead of `tabindex`) — small but real syntax differences from actual HTML.

```jsx
<div className="container" tabIndex={0}>...</div>
```

---

## 5. How Does JSX Actually Work? — Transpilation via Babel

Browsers and JavaScript engines only understand plain **ECMAScript** (standard JS) — they have **no built-in understanding of JSX** whatsoever. So how does writing `<h1>Hello</h1>` inside a `.js` file actually work?

**Definition:** JSX code is **transpiled** — converted into browser-understandable code — before it ever reaches the JavaScript engine. This transpilation job is done by a tool called **Babel**.

**The full chain, step by step:**
```
JSX  →  (transpiled by Babel)  →  React.createElement(...)  →  React element (a JS object)  →  rendered as real HTML
```

```jsx
const heading = <h1 id="heading">Hello!</h1>;

// Babel converts this, behind the scenes, into EXACTLY:
const heading = React.createElement("h1", { id: "heading" }, "Hello!");
```

This is precisely why logging a JSX-created element and a `React.createElement`-created element side by side shows **identical objects** — they end up as the exact same thing; JSX is just a friendlier way to write it.

**Babel isn't specific to this course's bundler** — it's installed as one of the bundler's own dependencies (recall "transitive dependencies" from the previous episode), and its job is broader than just JSX: it's a general-purpose JavaScript compiler, also used to convert modern JS syntax into older syntax that legacy browsers can understand. You can try this transpilation live at Babel's own online playground (babeljs.io/repl) — paste in JSX and watch it convert to `React.createElement` calls in real time.

---

## 6. JSX Syntax Rules

### Single line vs. multi-line
```jsx
// Single line — parentheses optional
const heading = <h1>Hello</h1>;

// Multi-line — parentheses REQUIRED
const heading = (
    <div className="container">
        <h1>Hello</h1>
    </div>
);
```
Wrapping in `()` for multi-line JSX isn't just a style choice — it's necessary so Babel can clearly identify exactly where the JSX expression starts and ends.

### Embedding JavaScript inside JSX — the real superpower
Anywhere inside JSX, wrapping something in `{ }` lets you drop in **any JavaScript expression**:
```jsx
const number = 10000;
const heading = <h1>{number}</h1>;                  // renders: 10000
const heading2 = <h2>{100 + 200}</h2>;                // renders: 300
console.log("this runs too!");                          // even side-effect statements execute when placed like this
```
This is what makes JSX so powerful — it isn't a limited templating mini-language; it's genuine, full JavaScript, embeddable directly inside markup-like syntax.

---

## 7. Components — Two Types

**A component is any reusable, self-contained piece of UI** — a button, a header, a card, a whole page section. In a real interface, essentially everything can be modeled as a component.

There are two ways to build one:

| Type | How it's written | Status today |
|---|---|---|
| **Class-based component** | Uses a JavaScript `class` | The old approach — still found in legacy/older codebases, occasionally asked about in interviews, but rarely used in new projects |
| **Functional component** | Uses a JavaScript function | The modern standard — this is what the overwhelming majority of new React code uses today |

The focus going forward is on functional components, with class-based components covered later mainly so legacy code and certain interview questions aren't a surprise.

---

## 8. Functional Components — The Definition

**A functional component is just a normal JavaScript function that returns some JSX (equivalently, a React element).** That's the entire definition — nothing more exotic than that.

```jsx
const Heading = () => {
    return <h1 id="heading">Hello from a functional component!</h1>;
};
```

**Important naming rule:** a component's name must start with a **capital letter** — this is how JSX (via Babel) distinguishes a custom component (`<Heading />`) from a regular HTML tag (`<h1>`).

### Rendering a Functional Component
```jsx
root.render(<Heading />);
```
Note the difference from rendering a plain element: a component is rendered using **JSX tag syntax** (`<Heading />`), not by passing the function reference directly.

### Equivalent Ways to Write the Same Component
```jsx
// Explicit return (most common, most readable — used throughout this course)
const Heading = () => {
    return <h1>Hello!</h1>;
};

// Implicit return (valid, common shorthand seen elsewhere)
const Heading = () => <h1>Hello!</h1>;

// A plain "function" keyword works too — React doesn't require arrow functions
function Heading() {
    return <h1>Hello!</h1>;
}
```
All three are functionally identical. Arrow functions are simply the more common, modern convention.

### Components Can Return Nested JSX
```jsx
const Heading = () => {
    return (
        <div className="container">
            <h1>Hello!</h1>
        </div>
    );
};
```

---

## 9. Component Composition

**Definition:** Component composition means building a bigger component by combining/nesting smaller components (or elements) inside it — putting a component inside another component.

```jsx
const Title = () => {
    return <h1>I am the title</h1>;
};

const HeadingComponent = () => {
    return (
        <div id="container">
            <Title />
        </div>
    );
};

root.render(<HeadingComponent />);
```

Here, `Title` is nested inside `HeadingComponent` — this nesting is exactly what "component composition" refers to. It's a simple, natural idea, but it's also a genuine interview term worth recognizing by name.

**A crucial thing to understand:** the actual browser has **zero awareness** of any of this component structure. All of this — components inside components, elements inside components — gets fully transpiled and flattened down into plain HTML by the time it reaches the browser. Component composition is purely a development-time organizational tool.

**Mixing and matching:** a React element, a functional component, or plain JavaScript expressions can all be freely combined inside one another:
```jsx
const element = <span>a plain element</span>;

const Title = () => {
    return <h1>{element}</h1>;   // an element used inside a component
};
```
**One real gotcha worth knowing:** if a component tries to render itself (directly or indirectly, via another component that renders it back), it creates an **infinite loop** and can freeze the browser tab — a genuine, easy-to-hit mistake worth being careful about, especially when components reference each other.

---

## 10. Security — JSX Automatically Escapes Data

Suppose data displayed via JSX comes from an external source (an API response):
```jsx
const data = fetchedApiData; // imagine this comes from a network call
const element = <h1>{data}</h1>;
```

**The real risk this raises:** if that data were ever malicious (attacker-controlled) JavaScript/HTML, and it got executed in a user's browser, the attacker could steal cookies, read local storage, or otherwise compromise the session. This class of vulnerability is called **Cross-Site Scripting (XSS)**.

**The reassurance:** JSX automatically **sanitizes/escapes** any value placed inside `{ }` before rendering it — it does not blindly execute arbitrary injected code. This protection is built into JSX/React by default, with no extra effort required from the developer, for exactly this class of attack.

---

## 11. A Few Curiosities Worth Knowing

**A functional component can be "called" like a normal function, directly inside JSX:**
```jsx
const Title = () => <h1>I am the title</h1>;

const HeadingComponent = () => {
    return (
        <div>
            {Title()}
        </div>
    );
};
```
Since a functional component IS just a JavaScript function under the hood, calling it directly (`Title()`) instead of using JSX tag syntax (`<Title />`) also works — because at the end of the day, this is all still just JavaScript. (In real projects, the `<Title />` JSX syntax is what's actually used — this is more a demonstration of "why it works" than a recommended pattern.)

**A component can be reused any number of times, freely:**
```jsx
<div>
    <Title />
    <Title />
    <Title />
</div>
```
There's no restriction on how many times a given component can be rendered within the same tree.

---

## Quick Recap Table

| Concept | One-line summary |
|---|---|
| npm scripts | Named shortcuts (`start`, `build`) in `package.json`, run via `npm run <name>` (or `npm start` for the reserved `start` script) |
| React element | A plain JS object describing UI — produced either by `React.createElement` directly, or by JSX after transpilation |
| JSX | An HTML-like syntax extension for JavaScript — NOT part of React itself, and NOT literally HTML |
| Babel | The transpiler that converts JSX into `React.createElement` calls before the browser ever sees it |
| `className`, camelCase attributes | Concrete proof JSX is a distinct syntax, not real HTML |
| `{ }` in JSX | Lets you embed any JavaScript expression directly inside markup |
| Functional component | A JavaScript function that returns JSX; name must start with a capital letter |
| Component composition | Nesting components/elements inside one another to build larger UI |
| JSX auto-escaping | Values inside `{ }` are automatically sanitized, protecting against XSS by default |

---

*Next: Episode 4 — building actual components with real, more substantial UI. Send the transcript whenever you're ready to continue.*