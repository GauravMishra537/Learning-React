import React from "react";
import ReactDOM from "react-dom/client";
// Episode 2: React is now coming from node_modules (installed via npm),
// NOT from the CDN <script> tags we used in Episode 1.
//
//   npm install react
//   npm install react-dom
//
// That's why we now need "import" here instead of using the global
// React/ReactDOM that the CDN scripts used to attach to window.

// import React from "react";
// import ReactDOM from "react-dom/client";

// const heading = React.createElement(
//     "h1",
//     { id: "heading" },
//     "Namaste React 🚀 - Igniting our app with Parcel!"
// );

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(heading);

// Write all the react 

            const heading=React.createElement("h1",{ id: "heading" },"Hello Gaurav from react inside it.Completed learning react setup");

            const root=ReactDOM.createRoot(document.getElementById("root"));

            root.render(heading);
