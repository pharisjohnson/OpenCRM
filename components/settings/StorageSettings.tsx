"use client";

import React from 'react';
import { HardDrive, Cloud, Database as DatabaseIcon } from 'lucide-react';
import { AppConfig } from '@/types';

interface StorageSettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const StorageSettings: React.FC<StorageSettingsProps> = ({ config, onConfigChange }) => {
  const storageOptions = [
    {
      id: 'local' as const,
      name: 'Local Storage',
      description: 'Data stays on your device browser. Good for demos and testing.',
      icon: HardDrive,
      recommended: false
    },
    {
      id: 'supabase' as const,
      name: 'Supabase (PostgreSQL)',
      description: 'Cloud database with real-time sync. Best for production.',
      icon: Cloud,
      recommended: true
    },
    {
      id: 'google_drive' as const,
      name: 'Google Drive',
      description: 'Store data in your Google Drive. Limited features.',
      icon: DatabaseIcon,
      recommended: false
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Data Storage
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose where your application data is stored.
        </p>

        <div className="grid gap-4">
          {storageOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = config.storageType === option.id;

            return (
              <button
                key={option.id}
                onClick={() => onConfigChange('storageType', option.id)}
                className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {option.recommended && (
                  <span className="absolute -top-2 right-4 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-primary-100 dark:bg-primary-900/30' 
                      : 'bg-gray-100 dark:bg-dark-border'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{option.name}</h4>
                      {isSelected && (
                        <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                          ● ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Supabase Configuration */}
      {config.storageType === 'supabase' && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Supabase Configuration</h4>
          <div className="grid gap-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supabase URL
              </label>
              <input
                type="url"
                value={config.supabaseUrl || ''}
                onChange={(e) => onConfigChange('supabaseUrl', e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anon Key
              </label>
              <input
                type="password"
                value={config.supabaseKey || ''}
                onChange={(e) => onConfigChange('supabaseKey', e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
