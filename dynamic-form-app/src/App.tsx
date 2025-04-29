// src/App.tsx
import { useState } from "react";
import LoginPage from "./components/LoginPage";
import DynamicForm from "./components/DynamicForm";
import "./App.css"; // Import global styles

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Initialize userRollNumber as null
  const [userRollNumber, setUserRollNumber] = useState<string | null>(null);

  const handleLoginSuccess = (rollNumber: string) => {
    console.log(`Login successful for roll number: ${rollNumber}`);
    setUserRollNumber(rollNumber); // Set the roll number
    setIsLoggedIn(true); // Set logged in state
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        // Render LoginPage if not logged in
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : // Render DynamicForm only if logged in AND userRollNumber is set
      userRollNumber ? (
        <DynamicForm rollNumber={userRollNumber} />
      ) : (
        // Optional: Handle case where isLoggedIn is true but rollNumber is somehow null
        <p>Error: Logged in but user information is missing.</p>
      )}
    </div>
  );
}

export default App;
