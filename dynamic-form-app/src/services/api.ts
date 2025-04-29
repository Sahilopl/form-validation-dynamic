// src/services/api.ts
import { FormResponse, CreateUserResponse } from "../types/form";

const API_BASE_URL = "https://dynamic-form-generator-9rl7.onrender.com";

/**
 * Registers or logs in a user. Returns the server message.
 */
export const createUser = async (
  rollNumber: string,
  name: string
): Promise<CreateUserResponse> => {
  console.log(`API: Attempting user creation/login for Roll: ${rollNumber}`);
  const response = await fetch(`${API_BASE_URL}/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rollNumber, name }),
  });

  const responseData: CreateUserResponse = await response.json(); // Always parse JSON

  if (!response.ok) {
    // Handle HTTP-level errors (4xx, 5xx)
    console.error(
      `API Error createUser (${response.status}): ${
        responseData.message || "Unknown server error"
      }`
    );
    throw new Error(
      responseData.message || `HTTP error! status: ${response.status}`
    );
  }

  // Return the full response for logical checks in the component
  console.log(`API Success createUser: ${responseData.message}`);
  return responseData;
};

/**
 * Fetches the dynamic form structure for a given roll number.
 */
export const getFormStructure = async (
  rollNumber: string
): Promise<FormResponse> => {
  console.log(`API: Fetching form structure for Roll: ${rollNumber}`);
  const response = await fetch(
    `${API_BASE_URL}/get-form?rollNumber=${encodeURIComponent(rollNumber)}`
  );

  if (!response.ok) {
    // Handle HTTP-level errors, try to parse error message from body
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      console.error("API Error getForm: Could not parse error response JSON");
    }
    const errorMessage =
      errorData?.message || `HTTP error! status: ${response.status}`;
    console.error(`API Error getForm (${response.status}): ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const data: FormResponse = await response.json();
  console.log("API Success getForm: Structure received.");
  // Basic validation of received structure (optional but good practice)
  if (!data || !data.form || !Array.isArray(data.form.sections)) {
    console.error("API Error getForm: Received invalid data structure", data);
    throw new Error("Received invalid form structure from API.");
  }
  return data;
};
