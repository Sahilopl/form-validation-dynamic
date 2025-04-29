// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Check path and casing
import "./App.css"; // Check CSS import

const rootElement = document.getElementById("root");

if (rootElement) {
  // Add a log to see if this part is reached
  console.log("Found root element, attempting to render App...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Add a log for this case too
  console.error(
    "Fatal: Could not find root element with id 'root' in index.html"
  );
}
