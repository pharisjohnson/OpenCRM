"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  User as UserIcon,
  Shield,
  Globe,
  Save,
  Database,
  Palette,
  HardDrive,
  BrainCircuit,
  Mail,
  Crown,
  AlertCircle
} from 'lucide-react';
import { CustomFieldDefinition, AppConfig } from '../types';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { useConfig } from '../contexts/ConfigContext';
import { useUser } from '../contexts/UserContext';
import { useSubscription } from '../hooks/useSubscription';
import { TeamManagement } from '../components/TeamManagement';
import { UpgradeModal } from '../components/UpgradeModal';

// Tab Components
import {
  GeneralSettings,
  BrandingSettings,
  AISettings,
  EmailSettings,
  SecuritySettings,
  CustomFieldsSettings,
  StorageSettings,
} from '../components/settings';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { currentUser, currentOrganization } = useUser();
  const { config, updateConfig } = useConfig();
  const { status, loading: subscriptionLoading } = useSubscription();
  const { fields, addField, removeField } = useCustomFields();

  const [tempConfig, setTempConfig] = useState<AppConfig>(config);

  // Sync config changes
  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const isAdmin = currentUser.role === 'admin' || (currentUser.role as any) === 'owner';

  const tabs = useMemo(() => [
    { id: 'general', label: 'General', icon: Globe, requiresAdmin: false },
    { id: 'branding', label: 'Branding', icon: Palette, requiresAdmin: true },
    { id: 'users', label: 'Users & Teams', icon: UserIcon, requiresAdmin: true },
    { id: 'ai', label: 'AI & Intelligence', icon: BrainCircuit, requiresAdmin: false },
    { id: 'email', label: 'Email (SMTP)', icon: Mail, requiresAdmin: true },
    { id: 'security', label: 'Security', icon: Shield, requiresAdmin: true },
    { id: 'fields', label: 'Custom Fields', icon: Database, requiresAdmin: true },
    { id: 'storage', label: 'Storage', icon: HardDrive, requiresAdmin: true },
  ].filter(tab => !tab.requiresAdmin || isAdmin), [isAdmin]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      updateConfig(tempConfig);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setTempConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your workspace configuration and preferences
            </p>
          </div>
          {/* Subscription Badge */}
          <div className="flex items-center gap-3">
            {!subscriptionLoading && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-900/30">
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {status.plan === 'trial' ? `Trial (${status.daysRemaining}d left)` : `${status.plan} Plan`}
                </span>
                {(status.plan === 'trial' || status.plan === 'free') && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        }`}>
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{saveMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'general' && (
              <GeneralSettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}

            {activeTab === 'branding' && (
              <BrandingSettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}

            {activeTab === 'users' && isAdmin && (
              <div className="p-6">
                <TeamManagement />
              </div>
            )}

            {activeTab === 'ai' && (
              <AISettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}

            {activeTab === 'email' && isAdmin && (
              <EmailSettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}

            {activeTab === 'security' && isAdmin && (
              <SecuritySettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}

            {activeTab === 'fields' && isAdmin && (
              <CustomFieldsSettings 
                fields={fields} 
                onAddField={addField} 
                onRemoveField={removeField} 
              />
            )}

            {activeTab === 'storage' && isAdmin && (
              <StorageSettings 
                config={tempConfig} 
                onConfigChange={handleConfigChange} 
              />
            )}
          </div>

          {/* Save Bar */}
          {activeTab !== 'users' && (
            <div className="border-t border-gray-200 dark:border-dark-border p-4 bg-gray-50 dark:bg-dark-bg flex justify-end gap-3">
              <button
                onClick={() => setTempConfig(config)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};
