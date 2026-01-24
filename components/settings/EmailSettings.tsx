"use client";

import React from 'react';
import { Mail, Server } from 'lucide-react';
import { AppConfig } from '@/types';

interface EmailSettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Mail size={20} className="text-gray-400" />
          Email Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configure SMTP settings to enable sending emails from the CRM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Host</label>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={config.smtpHost || ''}
                onChange={(e) => onConfigChange('smtpHost', e.target.value)}
                placeholder="smtp.example.com"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Port</label>
            <input
              value={config.smtpPort || ''}
              onChange={(e) => onConfigChange('smtpPort', e.target.value)}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secure Connection</label>
            <select
              value={config.smtpSecure ? 'true' : 'false'}
              onChange={(e) => onConfigChange('smtpSecure', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              <option value="true">TLS/SSL (Recommended)</option>
              <option value="false">None</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input
              value={config.smtpUser || ''}
              onChange={(e) => onConfigChange('smtpUser', e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={config.smtpPassword || ''}
              onChange={(e) => onConfigChange('smtpPassword', e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Note:</strong> Resend API is already configured for production use. These SMTP settings are optional for custom email servers.
        </p>
      </div>
    </div>
  );
};
