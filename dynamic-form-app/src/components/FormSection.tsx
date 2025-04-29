// src/components/FormSection.tsx
import React from 'react';
import { FormSection as FormSectionData, FormData, FormErrors } from '../types/form'; // Renamed type import slightly
import FormField from './FormField';

interface FormSectionProps {
  section: FormSectionData; // Use the renamed type
  formData: FormData;
  errors: FormErrors;
  handleInputChange: (fieldId: string, value: any) => void;
}

const FormSection: React.FC<FormSectionProps> = ({ section, formData, errors, handleInputChange }) => {
  return (
    <div className="form-section" aria-labelledby={`section-title-${section.sectionId}`}>
      <h2 id={`section-title-${section.sectionId}`}>{section.title}</h2>
      {section.description && <p className="section-description">{section.description}</p>}
      {section.fields.map(field => (
        <FormField
          key={field.fieldId}
          field={field}
          value={formData[field.fieldId]} // Pass current value
          error={errors[field.fieldId] || null} // Pass current error or null
          onChange={handleInputChange} // Pass handler down
        />
      ))}
    </div>
  );
};

export default FormSection;