"use client";

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, LogIn, CheckCircle } from 'lucide-react';
import { AppConfig } from '@/types';
import { signInToPuter, getPuterUser } from '@/services/aiService';

interface AISettingsProps {
  config: AppConfig;
  onConfigChange: (key: keyof AppConfig, value: any) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ config, onConfigChange }) => {
  const [puterUser, setPuterUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPuterUser().then(user => setPuterUser(user));
  }, []);

  const handlePuterLogin = async () => {
    setLoading(true);
    try {
      const user = await signInToPuter();
      setPuterUser(user);
      if (user) onConfigChange('aiProvider', 'puter');
    } catch (e) {
      alert("Failed to sign in to Puter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BrainCircuit size={20} className="text-gray-400" />
          AI Provider
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-dark-border rounded-xl cursor-pointer transition-all hover:border-primary-300 dark:hover:border-primary-700 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-500/10">
            <input
              type="radio"
              name="aiProvider"
              value="gemini"
              checked={config.aiProvider === 'gemini'}
              onChange={(e) => onConfigChange('aiProvider', e.target.value)}
              className="mt-1 w-4 h-4 text-primary-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Google Gemini</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Fast and powerful AI with multimodal capabilities. Requires API key.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-dark-border rounded-xl cursor-pointer transition-all hover:border-primary-300 dark:hover:border-primary-700 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-500/10">
            <input
              type="radio"
              name="aiProvider"
              value="puter"
              checked={config.aiProvider === 'puter'}
              onChange={(e) => onConfigChange('aiProvider', e.target.value)}
              className="mt-1 w-4 h-4 text-primary-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Puter AI</span>
                {puterUser && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Free AI service. Requires Puter account sign-in.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Gemini Configuration */}
      {config.aiProvider === 'gemini' && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Gemini API Configuration</h4>
          <div className="max-w-xl">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={config.geminiApiKey || ''}
              onChange={(e) => onConfigChange('geminiApiKey', e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Get your API key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Puter Sign In */}
      {config.aiProvider === 'puter' && !puterUser && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Connect to Puter</h4>
          <button
            onClick={handlePuterLogin}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? 'Connecting...' : 'Sign In to Puter'}
          </button>
        </div>
      )}

      {puterUser && config.aiProvider === 'puter' && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle size={18} />
              <span className="font-medium">Connected to Puter AI</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              Signed in as {puterUser.username || 'User'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
