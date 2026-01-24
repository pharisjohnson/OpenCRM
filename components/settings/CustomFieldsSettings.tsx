"use client";

import React, { useState } from 'react';
import { Database, Plus, Trash2, X } from 'lucide-react';
import { CustomFieldDefinition, CustomFieldType } from '@/types';

interface CustomFieldsSettingsProps {
  fields: CustomFieldDefinition[];
  onAddField: (field: CustomFieldDefinition) => void;
  onRemoveField: (id: string) => void;
}

export const CustomFieldsSettings: React.FC<CustomFieldsSettingsProps> = ({ fields, onAddField, onRemoveField }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomFieldDefinition>>({
    entityType: 'contact',
    type: 'text',
    required: false
  });

  const handleAddField = () => {
    if (!newField.label || !newField.key) {
      alert('Please fill in all required fields');
      return;
    }

    onAddField({
      id: `field_${Date.now()}`,
      entityType: newField.entityType as any,
      label: newField.label,
      key: newField.key,
      type: newField.type as CustomFieldType,
      required: newField.required || false
    });

    setNewField({ entityType: 'contact', type: 'text', required: false });
    setIsModalOpen(false);
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.entityType]) acc[field.entityType] = [];
    acc[field.entityType].push(field);
    return acc;
  }, {} as Record<string, CustomFieldDefinition[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Database size={20} className="text-gray-400" />
            Custom Fields
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add custom fields to your CRM entities (contacts, companies, deals, etc.)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>

      {/* Fields by Entity Type */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([entityType, entityFields]) => (
          <div key={entityType} className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-dark-bg px-4 py-3 border-b border-gray-200 dark:border-dark-border">
              <h4 className="font-medium text-gray-900 dark:text-white capitalize">{entityType}s</h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-dark-border">
              {entityFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{field.label}</span>
                      {field.required && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Key: {field.key}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Type: {field.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveField(field.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-dark-border rounded-lg">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No custom fields yet</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              Add your first custom field
            </button>
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Custom Field</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entity Type</label>
                <select
                  value={newField.entityType}
                  onChange={(e) => setNewField({ ...newField, entityType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value="contact">Contact</option>
                  <option value="company">Company</option>
                  <option value="deal">Deal</option>
                  <option value="project">Project</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Label</label>
                <input
                  type="text"
                  value={newField.label || ''}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  placeholder="e.g., LinkedIn Profile"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Key</label>
                <input
                  type="text"
                  value={newField.key || ''}
                  onChange={(e) => setNewField({ ...newField, key: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                  placeholder="e.g., linkedin_profile"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Type</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value as CustomFieldType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="url">URL</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Required field</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddField}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
