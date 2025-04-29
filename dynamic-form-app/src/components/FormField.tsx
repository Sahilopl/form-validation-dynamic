// src/components/FormField.tsx
import React from 'react';
import { FormField as FormFieldType, FormFieldOption } from '../types/form';

interface FormFieldProps {
  field: FormFieldType;
  value: any;
  error: string | null;
  onChange: (fieldId: string, value: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, error, onChange }) => {
  const {
    fieldId,
    type,
    label,
    placeholder,
    required,
    options,
    minLength,
    maxLength,
    dataTestId,
  } = field;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement; // Type assertion for checkbox case
    const newValue = type === 'checkbox' ? target.checked : target.value;
    onChange(fieldId, newValue);
  };

  const renderInput = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
        return (
          <input
            type={type}
            id={fieldId}
            name={fieldId}
            value={value || ''}
            placeholder={placeholder}
            onChange={handleChange}
            required={required} // Native validation can be helpful but rely on JS validation
            minLength={minLength}
            maxLength={maxLength}
            data-testid={dataTestId}
            className={error ? 'input-error' : ''}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            name={fieldId}
            value={value || ''}
            placeholder={placeholder}
            onChange={handleChange}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            data-testid={dataTestId}
            className={error ? 'input-error' : ''}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
        );
      case 'dropdown':
        return (
          <select
            id={fieldId}
            name={fieldId}
            value={value || ''}
            onChange={handleChange}
            required={required}
            data-testid={dataTestId}
            className={error ? 'input-error' : ''}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          >
            <option value="" disabled>{placeholder || 'Select an option'}</option>
            {options?.map((option: FormFieldOption) => (
              <option key={option.value} value={option.value} data-testid={option.dataTestId}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div data-testid={dataTestId} className={`radio-group ${error ? 'input-error' : ''}`} role="radiogroup" aria-labelledby={`${fieldId}-label`}>
            {options?.map((option: FormFieldOption) => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name={fieldId} // All radios in group share same name
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  required={required}
                  data-testid={option.dataTestId}
                  aria-describedby={error ? `${fieldId}-error` : undefined}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        // Checkbox often stands alone or with label text integrated differently
        return (
           <label className="checkbox-label">
             <input
               type="checkbox"
               id={fieldId}
               name={fieldId}
               checked={!!value} // Ensure boolean evaluation
               onChange={handleChange}
               required={required}
               data-testid={dataTestId}
               className={error ? 'input-error' : ''} // Apply error style to input if desired
               aria-invalid={!!error}
               aria-describedby={error ? `${fieldId}-error` : undefined}
             />
             {/* Removed label text from here; main label is separate */}
           </label>
        );
      default:
        // Handle unknown field types gracefully
        console.warn("Unsupported field type:", type);
        return <p>Unsupported field type: {type}</p>;
    }
  };

  return (
    <div className="form-field">
      {/* For radio group, associate label with the group */}
      <label htmlFor={type !== 'radio' ? fieldId : undefined} id={type === 'radio' ? `${fieldId}-label` : undefined}>
        {label} {required && <span className="required-asterisk">*</span>}
      </label>
      {renderInput()}
      {error && <p id={`${fieldId}-error`} className="error-message" data-testid={`${dataTestId}-error`} role="alert">{error}</p>}
    </div>
  );
};

export default FormField;