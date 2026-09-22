import React from "react";
import ReactDOM from "react-dom/client";
// Write all the react 

//img and anchor tag in jsx
// root.render(
//   <>
//     {/* Standalone Image Tag */}
//     <img 
//       src="https://picsum.photos" 
//       alt="Placeholder Visual" 
//     />

//     {/* Separate Anchor Link Tag */}
//     <a href="https://github.com">
//       Go to GitHub Repository
//     </a>
//   </>
// );


//React.createElement=>Object=>htmlElement(render)
//   const heading=React.createElement("h1",{id:"heading"},"Learning React");        

//   const root=ReactDOM.createRoot(document.getElementById("root"));

//   root.render(heading);

  //JSX

    // const number = 10000;
    // const heading1= <h1>{number}</h1>; // renders: 10000
    // const heading2 = <h2>{100 + 200}</h2>;// renders: 300
    // console.log("this runs too!");// even side-effect statements execute when placed like this
    

    // 1. Defining a Class-based Component
// class Heading extends React.Component {
//   render() {
//     return (
//       <h1 className="heading" tabIndex={5}>
//         Learning React (Class Component)
//       </h1>
//     );
//   }
// }

// // 2. Rendering it to the DOM
// const root = ReactDOM.createRoot(document.getElementById("root"));

// // In JSX, you render a class component just like a custom HTML tag!
// root.render(<Heading />);


//   const heading=(<h1 className="heading" tabIndex={5}>
//     Learning React
//     </h1>);

//     const Heading = () => {
//     return <h1 id="heading">Hello from a functional component!</h1>;
//     };
//     const root=ReactDOM.createRoot(document.getElementById("root"));

//    root.render(<Heading />); 


//Component Composition
const Title=()=>{
 return <h1 className="title">Hello Gaurav</h1>
}
const element = <span>Have you completed Javascript</span>;

const Mixing=()=>{
    return <h3>{element}</h3>; 
}
const Heading=()=>{
    return (
        <>

             <Title/>
            <Mixing />
         
            <h2 className="heading">How is your React learning going on</h2>
        </>
    );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<Heading/>)