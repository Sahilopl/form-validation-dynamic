// src/components/DynamicForm.tsx
import React, { useState, useEffect } from 'react'; // Ensure React is imported if using React.FC etc.
import { getFormStructure } from '../services/api';
import {
  FormResponse,
  FormField as FormFieldType, // Use alias as it's used below
  FormData,
  FormErrors,
  FormSection as SectionData, // Use alias for clarity
} from '../types/form';
import FormSection from './FormSection'; // The component

interface DynamicFormProps {
  rollNumber: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ rollNumber }) => {
  const [formStructure, setFormStructure] = useState<
    FormResponse['form'] | null
  >(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Added Log 1
    console.log(`DynamicForm useEffect triggered for rollNumber: ${rollNumber}`);

    const fetchForm = async () => {
      setIsLoading(true);
      setApiError(null);
      setFormStructure(null); // Reset form structure on new fetch
      setFormData({}); // Reset form data
      setErrors({}); // Reset errors
      setCurrentSectionIndex(0); // Reset to first section
      try {
        // Added Log 2
        console.log(`DynamicForm: Calling getFormStructure with rollNumber: ${rollNumber}`);
        const response = await getFormStructure(rollNumber);
        // Added Log 3 (using stringify for detail)
        console.log("DynamicForm: Raw response from getFormStructure:", JSON.stringify(response, null, 2));

        if (response && response.form && response.form.sections) {
          setFormStructure(response.form);
          // Added Log: After setting structure state
          console.log("DynamicForm: setFormStructure called with:", JSON.stringify(response.form, null, 2));

          // Initialize form data based on structure
          const initialData: FormData = {};
          response.form.sections.forEach((section) => {
            section.fields.forEach((field) => {
              // Set default based on type
              initialData[field.fieldId] =
                field.type === 'checkbox' ? false : '';
            });
          });
          setFormData(initialData);
          console.log('Initialized form data:', initialData);
        } else {
           // Added Log 7
           console.error("DynamicForm: Invalid or incomplete form structure received", response);
           throw new Error('Received invalid form structure from API.');
        }
      } catch (error: any) {
        // Enhanced Log 4
        console.error("DynamicForm: Failed inside fetchForm try/catch:", error);
        setApiError(
          error.message || 'Could not load the form. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (rollNumber) {
      // Only fetch if rollNumber is available
      fetchForm();
    } else {
       // Added Log 5
       console.warn("DynamicForm useEffect: No rollNumber provided.");
       setIsLoading(false); // Don't show loading if no roll number
       setApiError('Roll number is missing to fetch form.'); // Optional: Show an error if expected
    }
  }, [rollNumber]); // Dependency array ensures fetch runs when rollNumber changes

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldId]: value,
    }));
    // Clear error for the field being changed as user types
    if (errors[fieldId]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldId]: null,
      }));
    }
  };

  // Validation function for a single field
  const validateField = (field: FormFieldType, value: any): string | null => {
    const stringValue = String(value ?? '').trim(); // Handle null/undefined, trim spaces

    // Required check
    if (field.required) {
      if (field.type === 'checkbox' && value === false) {
        return field.validation?.message || `${field.label} is required.`;
      }
      if (field.type !== 'checkbox' && !value && typeof value !== 'number') {
        // Check for empty string, null, undefined, but allow 0
        return field.validation?.message || `${field.label} is required.`;
      }
    }

    // MinLength check (only if there's a value)
    if (
      field.minLength &&
      stringValue &&
      stringValue.length < field.minLength
    ) {
      return `${field.label} must be at least ${field.minLength} characters long.`;
    }

    // MaxLength check
    if (field.maxLength && stringValue.length > field.maxLength) {
      return `${field.label} must be no more than ${field.maxLength} characters long.`;
    }

    // Email format check (only if there's a value)
    if (field.type === 'email' && stringValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return `Please enter a valid email address for ${field.label}.`;
      }
    }

    // Tel format check (basic - adjust regex as needed) (only if there's a value)
    if (field.type === 'tel' && stringValue) {
      const phoneRegex =
        /^[+]?[(]?[0-9]{3}[)]?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4,10}$/; // Example Regex
      if (!phoneRegex.test(stringValue)) {
        return `Please enter a valid phone number for ${field.label}. (e.g., +1-555-123-4567 or 5551234567)`;
      }
    }
    // Add other type-specific validations here if needed (e.g., date format, number range)

    return null; // No error
  };

  // Validate all fields within a specific section
  const validateSection = (sectionIndex: number): boolean => {
    if (!formStructure) return false; // Should not happen if called correctly
    const section = formStructure.sections[sectionIndex];
    // Ensure section and section.fields exist before proceeding
    if (!section || !Array.isArray(section.fields)) {
        console.error(`Validation Error: Section data invalid for index ${sectionIndex}`, section);
        return false;
    }

    let sectionIsValid = true;
    const sectionErrors: FormErrors = {}; // Errors specific to this section validation run

    console.log(`Validating Section ${sectionIndex + 1}: ${section.title}`);

    section.fields.forEach((field) => {
      const error = validateField(field, formData[field.fieldId]);
      sectionErrors[field.fieldId] = error; // Store result (error message or null)
      if (error) {
        console.log(` - Field "${field.label}" Error: ${error}`);
        sectionIsValid = false; // If any field has an error, section is invalid
      }
    });

    // Update the main errors state, merging new errors for the current section
    // Only update errors for the fields within the *current* section being validated
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      section.fields.forEach((field) => {
        updatedErrors[field.fieldId] = sectionErrors[field.fieldId];
      });
      return updatedErrors;
    });

    console.log(
      `Section ${sectionIndex + 1} Validation Result: ${sectionIsValid}`
    );
    return sectionIsValid;
  };

  const handleNext = () => {
    if (!formStructure) return; // Guard clause
    const isValid = validateSection(currentSectionIndex); // Validate the CURRENT section
    if (isValid && currentSectionIndex < formStructure.sections.length - 1) {
      setCurrentSectionIndex((prevIndex) => prevIndex + 1); // Move to next section index
    } else if (!isValid) {
      console.log('Cannot proceed to next section, validation errors found.');
      // Optionally, scroll to the first error field
    }
  };

  const handlePrev = () => {
    // No validation needed when going back
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!formStructure) return;

    console.log('Submit button clicked. Validating final section...');
    const isLastSectionValid = validateSection(currentSectionIndex); // Validate the LAST section

    if (isLastSectionValid) {
      // Potentially add a final validation across ALL sections if needed, though unlikely required here
      console.log('--- Form Submitted Successfully! ---');
      console.log('Collected Form Data:', JSON.stringify(formData, null, 2)); // Pretty print JSON
      alert(
        'Form submitted successfully! Check the browser console for the collected data.'
      );
      // In a real app, send formData to a backend API here
      // e.g., await submitFormApi(formData);
    } else {
      console.log(
        'Form submission failed. Validation errors in the current section.'
      );
      alert('Please fix the errors in the current section before submitting.');
      // Optionally, scroll to the first error field
    }
  };

  // --- Render Logic ---

  // Added Log: Before main return
  console.log(
    '%c DynamicForm Rendering State:',
    'color: blue; font-weight: bold;', // Style for visibility
    {
      isLoading,
      apiError,
      hasFormStructure: !!formStructure, // Convert to boolean for clarity
      sectionsLength: formStructure?.sections?.length ?? 'N/A',
      currentSectionIndex,
      formDataKeys: Object.keys(formData), // See if formData is populated
      errorsKeys: Object.keys(errors), // See if errors exist
      // formStructureData: formStructure // Optional: Log full structure if needed, can be large
    }
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading form data...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading form: {apiError}</p>
      </div>
    );
  }

  // Ensure formStructure and its sections are available before rendering the form
  if (
    !formStructure ||
    !formStructure.sections ||
    formStructure.sections.length === 0
  ) {
    // Added Log: Inside the check
     console.log("DynamicForm: Rendering 'No form structure' message.");
    return (
      <div className="error-container">
        <p>No form structure available or form is empty.</p>
      </div>
    );
  }

  // Ensure currentSectionIndex is valid relative to the loaded sections
  if (
    currentSectionIndex < 0 ||
    currentSectionIndex >= formStructure.sections.length
  ) {
    console.error(`Invalid currentSectionIndex (${currentSectionIndex}) for sections length (${formStructure.sections.length})`);
    // Optionally reset index or show error
     // setCurrentSectionIndex(0); // Reset to first section if invalid? Might cause loop.
    return (
      <div className="error-container">
        <p>An error occurred displaying the form section (Invalid Index).</p>
      </div>
    );
  }

  // Safely access the current section *after* validating the index
  const currentSection: SectionData = formStructure.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === formStructure.sections.length - 1;

  // Check if currentSection itself is valid (belt-and-suspenders)
   if (!currentSection) {
      console.error(`Error: Could not retrieve section data for index ${currentSectionIndex}`);
      return (
        <div className="error-container">
          <p>An error occurred retrieving section data.</p>
        </div>
      );
   }


  // *** ADDED DEBUG LOG AS REQUESTED ***
  console.log(
    '%c DynamicForm Rendering Section:',
    'color: green; font-weight: bold;', // Style for visibility
    {
      sectionTitle: currentSection?.title,
      fieldsLength: currentSection?.fields?.length ?? 'N/A',
      // sectionData: currentSection // Optional: Log full section if needed
    }
  );

  return (
    <div className="dynamic-form-container">
      <h1>{formStructure.formTitle}</h1>
      {formStructure.sections.length > 1 && ( // Only show section count if more than one section
        <p className="section-counter">
          Section {currentSectionIndex + 1} of {formStructure.sections.length}
        </p>
      )}
      {/* Use form element for semantics and potential native browser features */}
      <form onSubmit={handleSubmit} noValidate> {/* Use JS validation */}

        {/* Render only the current section */}
        <FormSection
          section={currentSection}
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSectionIndex === 0} // Disable Prev on first section
          >
            Previous
          </button>

          {!isLastSection && (
            <button type="button" onClick={handleNext}>
              Next
            </button>
          )}

          {isLastSection && (
            <button type="submit"> {/* Make this the submit button */}
              Submit Form
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;