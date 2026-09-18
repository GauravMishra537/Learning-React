// Write all the react 

            const heading=React.createElement("h1",{ id: "heading" },"Hello Gaurav from react inside it");

            const root=ReactDOM.createRoot(document.getElementById("root"));

            root.render(heading);

           
            // const head=React.createElement("h1",{},"Hello i am nested");
            // const child=React.createElement("div",{id:"child"},head);
            // const parent=React.createElement("div",{id:"parent"},child);

            const parent=React.createElement("div",{id:"parent"},
                React.createElement("div",{id:"child"},
                    [React.createElement("h1",{},"I am nested"),React.createElement("h2",{},"I am sibling")]
                )
            )

            root.render(parent);