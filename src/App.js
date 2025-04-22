import React from "react";

const App = () => {
  const greeting = "Hello, Web3!";
  const description = "Welcome to the decentralized web. Let’s explore the future of the internet together.";

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>{greeting}</h1>
      <p>{description}</p>
    </div>
  );
};

export default App;
