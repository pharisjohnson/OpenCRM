"use client";

import React from 'react';
import { Shield, Key } from 'lucide-react';
import { AppConfig } from '@/types';

interface SecuritySettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={20} className="text-gray-400" />
          Security Settings
        </h3>
        
        <div className="space-y-6 max-w-xl">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Password Requirements</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Minimum 8 characters</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require uppercase and lowercase</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require numbers</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require special characters</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-dark-border pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Session Management</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-logout after 24 hours of inactivity</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require re-authentication for sensitive actions</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-dark-border pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Key size={18} className="text-gray-400" />
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add an extra layer of security to your account.
            </p>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          🔒 <strong>Security Notice:</strong> These are UI mockups. Security settings are managed at the database level via Supabase Row Level Security.
        </p>
      </div>
    </div>
  );
};
