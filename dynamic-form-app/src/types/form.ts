// src/types/form.ts

export interface FormResponse {
  message: string;
  form: {
    formTitle: string;
    formId: string;
    version: string;
    sections: FormSection[];
  };
}

export interface FormSection {
  sectionId: number;
  title: string;
  description: string;
  fields: FormField[];
}

export type FieldType =
  | "text"
  | "tel"
  | "email"
  | "textarea"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox";

export interface FormFieldOption {
  value: string;
  label: string;
  dataTestId?: string;
}

export interface FormField {
  fieldId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  dataTestId: string;
  validation?: {
    message: string; // Often the required message, specific messages handled separately
  };
  options?: Array<FormFieldOption>;
  maxLength?: number;
  minLength?: number;
  // pattern?: string; // Could add pattern validation if needed
}

// Type for form data state
export type FormData = Record<string, any>;

// Type for validation errors state
export type FormErrors = Record<string, string | null>;
