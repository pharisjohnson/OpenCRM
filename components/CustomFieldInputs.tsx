
import React from 'react';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { CustomFieldDefinition } from '../types';

interface CustomFieldInputsProps {
  entityType: CustomFieldDefinition['entityType'];
  currentData?: Record<string, any>; // The entire object (e.g., Contact)
}

export const CustomFieldInputs: React.FC<CustomFieldInputsProps> = ({ entityType, currentData }) => {
  const { getFieldsByEntity } = useCustomFields();
  const fields = getFieldsByEntity(entityType);

  if (fields.length === 0) return null;

  const existingValues = currentData?.customFields || {};

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              name={`custom_${field.key}`}
              defaultValue={existingValues[field.key] || ''}
              required={field.required}
              placeholder={field.label}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
