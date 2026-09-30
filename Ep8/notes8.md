React Notes — Part 8 (Episode 8)
### Getting Classy — Class-Based Components

---

## 1. Class vs Functional Components

Class-based components — older way build component. Functional — new, latest way. Never build new project with class today. But learn class important — reason:
- Interview ask lot.
- Old company codebase still use class.
- Deepen understanding React internals (how life cycle, mount work under hood).

**Functional component** — normal JS function, return JSX.
**Class component** — normal JS class, extend `React.Component`, has `render()` method, return JSX.

```jsx
// Functional
const User = () => {
    return (
        <div className="user-card">
            <h2>Name: Akshay</h2>
            <h3>Location: Dehradun</h3>
        </div>
    );
};
export default User;
```

```jsx
// Class
import React from "react";

class UserClass extends React.Component {
    render() {
        return (
            <div className="user-card">
                <h2>Name: Akshay</h2>
                <h3>Location: Dehradun</h3>
            </div>
        );
    }
}
export default UserClass;
```

`React.Component` — base class given by React, tell React "this class-based component." Some write `Component` (destructure import) instead — same thing.

---

## 2. Passing Props to Class Component

**Functional — receive as argument:**
```jsx
const User = (props) => {
    return <h2>Name: {props.name}</h2>;
};
```
Usage: `<User name="Akshay" />`

**Class — receive via constructor, need `super(props)`:**
```jsx
class UserClass extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    render() {
        return <h2>Name: {this.props.name}</h2>;
    }
}
```
Usage: `<UserClass name="Akshay" />` — same as functional.

**Rule:** always call `super(props)` inside constructor — skip it, React throw error. (Homework: research why — related to `this` binding, without super `this` not set up properly before accessing `this.props`.)

Inside `render()`, always access props via `this.props.name` — need `this` keyword since inside class.

Can destructure too:
```jsx
const { name, location } = this.props;
```

---

## 3. State in Class Components

**Functional — `useState` hook:**
```jsx
const [count, setCount] = useState(0);
```

**Class — old way, no hooks. Use `this.state`, set inside constructor:**
```jsx
constructor(props) {
    super(props);
    this.state = {
        count: 0,
        count2: 2,
    };
}
```

**Important difference:** `this.state` is ONE big object holding ALL state variables — not multiple separate declarations like `useState` calls. Add more variable inside same object.

Usage in render:
```jsx
render() {
    return <h1>Count: {this.state.count}</h1>;
}
```
Can destructure: `const { count } = this.state;`

---

## 4. Updating State — `this.setState`

**Never update state directly:**
```jsx
// ❌ WRONG — never do this
this.state.count = this.state.count + 1;
```
Direct mutation — won't trigger re-render properly, cause inconsistency. Common beginner mistake.

**Correct way — use `this.setState`:**
```jsx
this.setState({
    count: this.state.count + 1,
});
```
Pass object with updated value(s). Behind scenes — React merge this object into existing state object, only update keys mention, leave other state variables untouched (even if there many other state variables, not sent ones stay same).

Button example:
```jsx
<button onClick={() => {
    this.setState({ count: this.state.count + 1 });
}}>
    Count Increase
</button>
```**Homework (research yourself):**
1. Why must always call `super(props)` in constructor?
2. Why can't `useEffect` callback be `async` directly, but `componentDidMount` can?

---

## 5. Class Component Life Cycle — Mounting

**Order of calls (single component):**
```
constructor → render → (React updates DOM) → componentDidMount
```

Two phases:
- **Render Phase** — `constructor` + `render` called. Everything happen in Virtual DOM (pure JS objects) — fast, cheap.
- **Commit Phase** — React actually update real DOM (expensive) → then `componentDidMount` called.

```jsx
class UserClass extends React.Component {
    constructor(props) {
        super(props);
        console.log("Child Constructor");
    }

    componentDidMount() {
        console.log("Child ComponentDidMount");
    }

    render() {
        console.log("Child Render");
        return <div>...</div>;
    }
}
```

**Parent-child mounting order (one child):**
```
Parent Constructor → Parent Render → Child Constructor → Child Render → Child ComponentDidMount → Parent ComponentDidMount
```
Parent's `componentDidMount` wait until child fully mounted.

**Parent-child with MULTIPLE children — React batches render phase:**
```
Parent Constructor → Parent Render
→ Child1 Constructor → Child1 Render
→ Child2 Constructor → Child2 Render
→ Child1 ComponentDidMount → Child2 ComponentDidMount
→ Parent ComponentDidMount
```
React batch render phase of ALL children first (cheap, virtual DOM), THEN commit phase (DOM update) happen together for all — because DOM manipulation expensive, batching optimize performance. This why React fast.

---

## 6. Why API Call Inside `componentDidMount`

Goal — render component FAST with default/dummy data first, don't make user wait for API. Same reason `useEffect` use for API call in functional component (but — **never say "useEffect equivalent to componentDidMount"** — different mechanism internally, not same thing, avoid this comparison in interview).

```jsx
class UserClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: {
                name: "Dummy Name",
                location: "Default Location",
            },
        };
    }

    async componentDidMount() {
        const data = await fetch("https://api.github.com/users/akshaymarch7");
        const json = await data.json();
        this.setState({ userInfo: json });
    }

    render() {
        const { name, location } = this.state.userInfo;
        return (
            <div className="user-card">
                <h2>Name: {name}</h2>
                <h3>Location: {location}</h3>
            </div>
        );
    }
}
```

`componentDidMount` can be marked `async` (unlike `useEffect` callback, which CANNOT be async directly — homework: research why).

---

## 7. Update Cycle — `componentDidUpdate`

After `this.setState` called (e.g. inside `componentDidMount` after API return) → triggers **Update Cycle**:
```
setState → render (called again, now with updated state) → React updates DOM → componentDidUpdate
```

```jsx
componentDidUpdate() {
    console.log("Component Did Update");
}
```

**Full sequence for one component with API call:**
```
Mounting: Constructor → Render (dummy data) → DOM updated (dummy) → ComponentDidMount → API call → setState
Updating: Render (real data) → DOM updated (real data) → ComponentDidUpdate
```

---

## 8. Unmounting — `componentWillUnmount`

Called just before component removed from UI (e.g. navigate away to different route/page).

```jsx
componentWillUnmount() {
    console.log("Component Will Unmount");
}
```

**Critical real-world use case — cleanup `setInterval`/`setTimeout`:**

Problem demo — set interval in `componentDidMount`, no cleanup:
```jsx
componentDidMount() {
    this.timer = setInterval(() => {
        console.log("Namaste React OP");
    }, 1000);
}
```
Navigate away — interval KEEP RUNNING (SPA doesn't reload page, component just unmount, interval stay hang in background). Navigate back to same page again — starts SECOND interval, now two running simultaneously. Keep navigating — 3, 4, 5+ intervals stack up — memory leak, performance killer.

**Fix — clear interval in `componentWillUnmount`:**
```jsx
componentWillUnmount() {
    clearInterval(this.timer);
}
```
Store interval reference on `this.timer` (this — shared across all methods in class) so accessible in unmount method.

**Same issue exist in functional component with `useEffect`** — fix via cleanup function, return function from `useEffect` callback:
```jsx
useEffect(() => {
    const timer = setInterval(() => {
        console.log("Namaste React OP");
    }, 1000);

    return () => {
        clearInterval(timer);
    };
}, []);
```
This returned function — called automatically by React when component unmount. Equivalent purpose to `componentWillUnmount`, different mechanism.

---

## Quick Recap Table

| Concept | Functional Component | Class Component |
|---|---|---|
| Definition | Function returning JSX | Class extending `React.Component`, has `render()` returning JSX |
| Receive props | Function argument `(props)` | Constructor `(props)`, must call `super(props)`, access via `this.props` |
| Create state | `useState()` hook, one call per variable | `this.state = {...}` object in constructor, ALL variables in one object |
| Update state | `setCount(newValue)` | `this.setState({ key: newValue })` — merges, never mutate directly |
| Run once on mount | `useEffect(() => {}, [])` | `componentDidMount()` |
| Run on every update | `useEffect(() => {})` (no array) / `componentDidUpdate` logic with prev-state check (old, painful way) | `componentDidUpdate()` |
| Run on specific value change | `useEffect(() => {}, [value])` | Manual `if (this.state.value !== prevState.value)` check inside `componentDidUpdate` (painful, old way) |
| Cleanup before unmount | `return () => {...}` inside `useEffect` | `componentWillUnmount()` |
| API call best practice | Inside `useEffect` with `[]` | Inside `componentDidMount` |

---

## Life Cycle Order Summary (Mounting → Updating → Unmounting)

```
MOUNTING:
Constructor → Render → (DOM updated) → ComponentDidMount

UPDATING (after setState called):
Render → (DOM updated) → ComponentDidUpdate

UNMOUNTING:
ComponentWillUnmount
```

**Two phases inside mount/update cycle:**
- Render Phase = Constructor + Render (Virtual DOM, cheap, fast)
- Commit Phase = Real DOM update + ComponentDidMount/ComponentDidUpdate (expensive)

React batches render phase across multiple sibling children before committing — key reason React perform fast.

**Important caution:** Never compare `useEffect` directly as "equivalent" to `componentDidMount`/`componentDidUpdate`/`componentWillUnmount` — different implementation, similar use-case only. Common mistake many blogs/teachers make — avoid saying this in interview.

