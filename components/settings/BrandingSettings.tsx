"use client";

import React, { useRef } from 'react';
import { Palette, Upload } from 'lucide-react';
import { AppConfig } from '@/types';

interface BrandingSettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ config, onConfigChange }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onConfigChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette size={20} className="text-gray-400" />
          Brand Identity
        </h3>
        
        <div className="grid gap-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-dark-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl font-bold">
                  {config.appName.charAt(0)}
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Upload size={16} />
                Upload Logo
              </button>
              {config.logoUrl && (
                <button
                  onClick={() => onConfigChange('logoUrl', undefined)}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => onConfigChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 dark:border-dark-border cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => onConfigChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono"
                placeholder="#0ea5e9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Logo URL (Optional)
            </label>
            <input
              type="url"
              value={config.invoiceLogoUrl || ''}
              onChange={(e) => onConfigChange('invoiceLogoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
