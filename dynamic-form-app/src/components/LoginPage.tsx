// src/components/LoginPage.tsx
import React, { useState } from "react";
import { createUser } from "../services/api";

interface LoginPageProps {
  onLoginSuccess: (rollNumber: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const trimmedRoll = rollNumber.trim();
    const trimmedName = name.trim();

    if (!trimmedRoll || !trimmedName) {
      setError("Roll Number and Name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      // API call returns the actual response data now
      const result = await createUser(trimmedRoll, trimmedName);
      console.log("API Result:", result); // Log for debugging

      // Check the API message to determine the outcome
      // *** Adjust these strings based on ACTUAL API responses ***
      if (
        result.message &&
        (result.message.toLowerCase().includes("user created") ||
          result.message.toLowerCase().includes("already exists"))
      ) {
        if (result.message.toLowerCase().includes("already exists")) {
          console.warn(
            "User already exists, proceeding with login:",
            result.message
          );
        } else {
          console.log("Registration successful:", result.message);
        }
        // Treat both "created" and "already exists" as successful login for this app flow
        onLoginSuccess(trimmedRoll);
      } else {
        // Handle other unexpected success messages from the API
        console.error(
          "Registration API returned success status but unexpected message:",
          result.message
        );
        setError(
          result.message ||
            "An unexpected response occurred during registration."
        );
      }
    } catch (err: any) {
      // Handles errors thrown by createUser (network, 4xx, 5xx, or specific errors thrown in api.ts)
      console.error("Login/Registration failed:", err);
      setError(err.message || "Failed to register or login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Student Login / Register</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="rollNumber">Roll Number:</label>
          <input
            type="text"
            id="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
            disabled={isLoading}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div className="form-field">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        {error && (
          <p id="login-error" className="error-message" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Login / Register"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
