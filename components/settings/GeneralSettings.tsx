"use client";

import React from 'react';
import { Building, Bell } from 'lucide-react';
import { AppConfig } from '@/types';

interface GeneralSettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building size={20} className="text-gray-400" />
          Workspace Details
        </h3>
        <div className="grid gap-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => onConfigChange('appName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Family
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => onConfigChange('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-gray-400" />
          Notifications
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Email digest of new leads (Daily)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Push notifications for assigned tasks</span>
          </label>
        </div>
      </div>
    </div>
  );
};
