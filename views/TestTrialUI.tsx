"use client";

import React, { useState } from 'react';
import { TrialBanner } from '../components/TrialBanner';
import { UpgradeModal } from '../components/UpgradeModal';
import { Crown, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export const TestTrialUI: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trial UI Component Gallery</h1>
        <p className="text-gray-500 dark:text-gray-400">Preview and test subscription-related components.</p>
      </div>

      {/* Banner Previews */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} /> Banner Variants
        </h2>
        
        <div className="space-y-4 border border-dashed border-gray-300 dark:border-dark-border p-4 rounded-xl">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Expired State (Red):</p>
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">Your free trial has ended. Upgrade now to continue using OpenCRM.</p>
              </div>
              <button className="bg-white text-red-600 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap">Upgrade Now</button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Warning State (Amber - 3 days left):</p>
            <div className="bg-amber-500 text-white px-4 py-3 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <p className="text-sm font-medium">3 days left in your free trial. Upgrade to unlock unlimited access.</p>
              </div>
              <button className="bg-white text-amber-600 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1">
                <Crown size={12} /> Upgrade
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Urgent State (Amber - 1 day left):</p>
            <div className="bg-amber-500 text-white px-4 py-3 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <p className="text-sm font-medium">Last day of your free trial! Upgrade to unlock unlimited access.</p>
              </div>
              <button className="bg-white text-amber-600 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1">
                <Crown size={12} /> Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Modal Trigger */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Crown className="text-purple-500" size={20} /> Upgrade Modal
        </h2>
        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-200 dark:border-dark-border text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to Scale?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Click below to preview the pricing tiers and upgrade experience.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25"
          >
            Open Upgrade Modal
          </button>
        </div>
      </section>

      {/* Plan Comparisons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} /> Feature Entitlements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Free/Trial</h4>
            <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> 5 Team Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> AI Growth Assistant</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Basic Pipelines</li>
            </ul>
          </div>
          <div className="p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
            <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-2">Starter/Pro</h4>
            <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Up to 25 Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Priority AI Tokens</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Custom Branding</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50/30 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Enterprise</h4>
            <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Unlimited Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Custom Integrations</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> 24/7 VIP Support</li>
            </ul>
          </div>
        </div>
      </section>

      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

const SparklesIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
