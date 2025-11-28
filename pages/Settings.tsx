

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Globe, 
  Save, 
  Plus, 
  Trash2, 
  Mail,
  Check,
  Building,
  Bell,
  Database,
  X,
  Copy,
  ArrowRight,
  Palette,
  HardDrive,
  Cloud,
  Server
} from 'lucide-react';
import { User, CustomFieldDefinition, AppConfig } from '../types';
import { MOCK_USERS, CURRENT_USER } from '../constants';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { useConfig } from '../contexts/ConfigContext';
import { testSupabaseConnection } from '../lib/supabase';
import { testGoogleDriveConnection } from '../lib/googleDrive';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSentData, setInviteSentData] = useState<{email: string, link: string} | null>(null);
  
  // Custom Fields Context
  const { fields, addField, removeField } = useCustomFields();
  // Config Context
  const { config, updateConfig, resetConfig } = useConfig();

  // Local state for settings inputs before save
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'users', label: 'Users & Teams', icon: UserIcon },
    { id: 'email', label: 'Email (SMTP)', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'fields', label: 'Custom Fields', icon: Database },
    { id: 'storage', label: 'Storage', icon: HardDrive },
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Persist all config changes
    updateConfig(tempConfig);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setTempConfig(prev => ({ ...prev, [key]: value }));
  };

  const deleteUser = (id: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleInviteUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    
    // In a real app, this sends an email. Here we simulate it.
    const newUser: User = {
      id: `u${Date.now()}`,
      name: name,
      email: email,
      role: formData.get('role') as 'admin' | 'user',
      avatarUrl: '' // Will be set by user on Accept Invite page
    };

    setUsers([...users, newUser]);
    
    // Show success state
    setInviteSentData({
      email: email,
      link: `${window.location.origin}/#/accept-invite`
    });
  };

  const handleAddField = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get('label') as string;
    
    // Create a safe key from label
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');

    addField({
      entityType: formData.get('entityType') as CustomFieldDefinition['entityType'],
      label: label,
      key: key,
      type: formData.get('type') as CustomFieldDefinition['type'],
      required: formData.get('required') === 'on',
    });
    
    e.currentTarget.reset();
  };

  const copyLink = () => {
    if (inviteSentData) {
      navigator.clipboard.writeText(inviteSentData.link);
      alert('Link copied to clipboard!');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    let success = false;

    if (activeTab === 'storage') {
        if (tempConfig.storageType === 'supabase') {
            if (!tempConfig.supabaseUrl || !tempConfig.supabaseKey) {
                alert("Please enter both URL and Key.");
                setConnectionStatus('idle');
                return;
            }
            success = await testSupabaseConnection(tempConfig.supabaseUrl, tempConfig.supabaseKey);
        } else if (tempConfig.storageType === 'google_drive') {
             if (!tempConfig.googleDriveClientId || !tempConfig.googleDriveApiKey) {
                alert("Please enter both Client ID and API Key.");
                setConnectionStatus('idle');
                return;
            }
            success = await testGoogleDriveConnection(tempConfig.googleDriveClientId, tempConfig.googleDriveApiKey);
        }
    } else if (activeTab === 'email') {
        // Simulate SMTP Test
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (tempConfig.smtpHost && tempConfig.smtpUser) {
            success = true;
        } else {
            success = false;
        }
    }
    
    setConnectionStatus(success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your workspace configuration.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
        >
          {isSaving ? <Check size={18} /> : <Save size={18} />}
          {isSaving ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white text-primary-600 shadow-sm ring-1 ring-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <tab.icon size={18} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-gray-400" />
                  Workspace Details
                </h3>
                <div className="grid gap-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input 
                      type="email" 
                      defaultValue="support@opencrm.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={20} className="text-gray-400" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Email digest of new leads (Daily)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Push notifications for assigned tasks</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Branding / White Label */}
          {activeTab === 'branding' && (
            <div className="p-6 space-y-8">
                <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-1">Custom Branding</h3>
                   <p className="text-sm text-gray-500 mb-6">Customize the look and feel of your CRM.</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                        <input 
                            value={tempConfig.appName}
                            onChange={(e) => handleConfigChange('appName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input 
                            value={tempConfig.logoUrl || ''}
                            onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                        <div className="flex items-center gap-3">
                           <input 
                              type="color"
                              value={tempConfig.primaryColor}
                              onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                              className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer"
                           />
                           <span className="text-sm font-mono text-gray-600 uppercase">{tempConfig.primaryColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                        <select 
                            value={tempConfig.fontFamily}
                            onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                   <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                      <div>
                         <span className="text-sm font-medium text-gray-900">Reset to Defaults</span>
                         <p className="text-xs text-gray-500 mt-1">Revert all branding changes to original OpenCRM settings.</p>
                      </div>
                      <button 
                         onClick={() => { resetConfig(); setTempConfig(config); }}
                         className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                         Reset
                      </button>
                   </div>
                </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  <p className="text-sm text-gray-500">Manage who has access to your workspace.</p>
                </div>
                <button 
                  onClick={() => { setInviteSentData(null); setIsInviteModalOpen(true); }}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Invite User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            defaultValue={user.role}
                            className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={user.id === CURRENT_USER.id} // Prevent changing own role in this demo
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {user.avatarUrl ? (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               Active
                             </span>
                          ) : (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                               Pending
                             </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.id !== CURRENT_USER.id && (
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Remove user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Email SMTP Settings */}
          {activeTab === 'email' && (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Email Configuration</h3>
                <p className="text-sm text-gray-500 mb-6">Configure SMTP settings to enable sending emails from the CRM.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                        <div className="relative">
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                value={tempConfig.smtpHost || ''}
                                onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                                placeholder="smtp.example.com"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                        <input 
                            value={tempConfig.smtpPort || ''}
                            onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
                            placeholder="587"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex items-center pt-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={tempConfig.smtpSecure || false}
                                onChange={(e) => handleConfigChange('smtpSecure', e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Use Secure Connection (SSL/TLS)</span>
                         </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            value={tempConfig.smtpUser || ''}
                            onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
                            placeholder="user@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password"
                            value={tempConfig.smtpPassword || ''}
                            onChange={(e) => handleConfigChange('smtpPassword', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">Test Configuration</h4>
                        <p className="text-xs text-blue-700 mt-1">Send a test email to verify your SMTP settings.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                             {connectionStatus === 'testing' && <span className="text-xs text-gray-500">Connecting...</span>}
                             {connectionStatus === 'success' && <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><Check size={12}/> Connected</span>}
                             {connectionStatus === 'error' && <span className="text-xs text-red-600 flex items-center gap-1 font-medium"><X size={12}/> Connection Failed</span>}
                        </div>
                        <button 
                            onClick={testConnection}
                            className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            Send Test Email
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-gray-400" />
                  Access Control
                </h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Enforce Two-Factor Authentication (2FA)</div>
                      <div className="text-sm text-gray-500 mt-1">Require all users to set up 2FA before accessing the dashboard.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Allow Public Signup</div>
                      <div className="text-sm text-gray-500 mt-1">If disabled, only invited users can join the workspace.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <div className="p-4 border border-red-100 bg-red-50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-900">Delete Workspace</div>
                    <div className="text-sm text-red-700 mt-1">Permanently delete all data and revoke access for all users.</div>
                  </div>
                  <button className="bg-white border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Delete Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {activeTab === 'fields' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
                <p className="text-sm text-gray-500 mb-6">Create new input fields for your entities.</p>
                
                <form onSubmit={handleAddField} className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                    <select name="entityType" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="contact">Contact</option>
                      <option value="company">Company</option>
                      <option value="deal">Deal</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Field Label</label>
                    <input name="label" required placeholder="e.g. Skype ID" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select name="type" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="tel">Phone</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <input type="checkbox" name="required" id="req_field" className="w-4 h-4 text-primary-600 rounded" />
                    <label htmlFor="req_field" className="text-sm text-gray-700">Required</label>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex-1 overflow-auto p-6">
                 {fields.length === 0 ? (
                   <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                     No custom fields configured yet.
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {fields.map(field => (
                       <div key={field.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-primary-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {field.entityType}
                            </span>
                            <div>
                              <div className="font-medium text-gray-900">{field.label}</div>
                              <div className="text-xs text-gray-500 font-mono">key: {field.key} | type: {field.type} {field.required ? '| required' : ''}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeField(field.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
          )}

           {/* Storage Settings */}
           {activeTab === 'storage' && (
             <div className="p-6 space-y-8">
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Data Storage</h3>
                    <p className="text-sm text-gray-500 mb-6">Choose where your application data is stored.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
                        <div 
                           onClick={() => { handleConfigChange('storageType', 'local'); setConnectionStatus('idle'); }}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${tempConfig.storageType === 'local' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <HardDrive size={20} className={tempConfig.storageType === 'local' ? 'text-primary-600' : 'text-gray-500'} />
                                <span className="font-semibold text-gray-900">Local Storage</span>
                            </div>
                            <p className="text-xs text-gray-500">Data stays on your device browser. Good for demos and testing.</p>
                        </div>

                        <div 
                           onClick={() => { handleConfigChange('storageType', 'supabase'); setConnectionStatus('idle'); }}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${tempConfig.storageType === 'supabase' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Database size={20} className={tempConfig.storageType === 'supabase' ? 'text-green-600' : 'text-gray-500'} />
                                <span className="font-semibold text-gray-900">Supabase</span>
                            </div>
                            <p className="text-xs text-gray-500">Cloud PostgreSQL database with realtime updates. Production ready.</p>
                        </div>

                        <div 
                           onClick={() => { handleConfigChange('storageType', 'google_drive'); setConnectionStatus('idle'); }}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${tempConfig.storageType === 'google_drive' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Cloud size={20} className={tempConfig.storageType === 'google_drive' ? 'text-blue-600' : 'text-gray-500'} />
                                <span className="font-semibold text-gray-900">Google Drive</span>
                            </div>
                            <p className="text-xs text-gray-500">Store data as JSON files in your personal Google Drive.</p>
                        </div>
                    </div>

                    {tempConfig.storageType === 'supabase' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                             <h4 className="font-medium text-gray-900 mb-4">Supabase Configuration</h4>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                                    <input 
                                        value={tempConfig.supabaseUrl || ''}
                                        onChange={(e) => handleConfigChange('supabaseUrl', e.target.value)}
                                        placeholder="https://your-project.supabase.co"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Anon Public Key</label>
                                    <input 
                                        type="password"
                                        value={tempConfig.supabaseKey || ''}
                                        onChange={(e) => handleConfigChange('supabaseKey', e.target.value)}
                                        placeholder="eyJh..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        {connectionStatus === 'testing' && <span className="text-sm text-gray-500">Connecting...</span>}
                                        {connectionStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14}/> Connected Successfully</span>}
                                        {connectionStatus === 'error' && <span className="text-sm text-red-600 flex items-center gap-1"><X size={14}/> Connection Failed</span>}
                                    </div>
                                    <button 
                                        onClick={testConnection}
                                        type="button"
                                        className="text-gray-700 hover:text-gray-900 text-sm font-medium hover:underline"
                                    >
                                        Test Connection
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {tempConfig.storageType === 'google_drive' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                             <h4 className="font-medium text-gray-900 mb-4">Google Drive Configuration</h4>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                                    <input 
                                        value={tempConfig.googleDriveClientId || ''}
                                        onChange={(e) => handleConfigChange('googleDriveClientId', e.target.value)}
                                        placeholder="123456789-abc.apps.googleusercontent.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <input 
                                        type="password"
                                        value={tempConfig.googleDriveApiKey || ''}
                                        onChange={(e) => handleConfigChange('googleDriveApiKey', e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        {connectionStatus === 'testing' && <span className="text-sm text-gray-500">Verifying...</span>}
                                        {connectionStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14}/> Connected</span>}
                                        {connectionStatus === 'error' && <span className="text-sm text-red-600 flex items-center gap-1"><X size={14}/> Connection Failed</span>}
                                    </div>
                                    <button 
                                        onClick={testConnection}
                                        type="button"
                                        className="text-gray-700 hover:text-gray-900 text-sm font-medium hover:underline"
                                    >
                                        Test Access
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                 </div>
             </div>
           )}
        </div>
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {inviteSentData ? (
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Invitation Sent!</h3>
                    <p className="text-gray-500 text-sm">
                        An email has been sent to <span className="font-medium text-gray-900">{inviteSentData.email}</span> with instructions to join the workspace.
                    </p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left mt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Demo Simulation Link</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-white border border-gray-200 rounded p-1.5 truncate text-gray-600 font-mono">
                                {inviteSentData.link}
                            </code>
                            <button onClick={copyLink} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500">
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsInviteModalOpen(false)}
                        className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            ) : (
                <form onSubmit={handleInviteUser} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                     <select name="role" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                     </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};