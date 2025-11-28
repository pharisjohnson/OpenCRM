
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomFieldDefinition } from '../types';

interface CustomFieldsContextType {
  fields: CustomFieldDefinition[];
  addField: (field: Omit<CustomFieldDefinition, 'id'>) => void;
  removeField: (id: string) => void;
  getFieldsByEntity: (entityType: CustomFieldDefinition['entityType']) => CustomFieldDefinition[];
}

const CustomFieldsContext = createContext<CustomFieldsContextType | undefined>(undefined);

export const CustomFieldsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<CustomFieldDefinition[]>(() => {
    const saved = localStorage.getItem('opencrm_custom_fields');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('opencrm_custom_fields', JSON.stringify(fields));
  }, [fields]);

  const addField = (field: Omit<CustomFieldDefinition, 'id'>) => {
    const newField = {
      ...field,
      id: `cf_${Date.now()}`,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const getFieldsByEntity = (entityType: CustomFieldDefinition['entityType']) => {
    return fields.filter(f => f.entityType === entityType);
  };

  return (
    <CustomFieldsContext.Provider value={{ fields, addField, removeField, getFieldsByEntity }}>
      {children}
    </CustomFieldsContext.Provider>
  );
};

export const useCustomFields = () => {
  const context = useContext(CustomFieldsContext);
  if (context === undefined) {
    throw new Error('useCustomFields must be used within a CustomFieldsProvider');
  }
  return context;
};
