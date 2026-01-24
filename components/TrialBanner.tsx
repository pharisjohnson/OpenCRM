"use client";

import React, { useState } from 'react';
import { AlertTriangle, Crown, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from './UpgradeModal';

export const TrialBanner: React.FC = () => {
  const { status, loading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (loading) return null;

  // Show nothing if subscription is active and not on trial
  if (status.isActive && status.plan !== 'trial' && status.plan !== 'free') {
    return null;
  }

  // Trial expired banner
  if (status.isTrialExpired) {
    return (
      <>
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                Your free trial has ended. Upgrade now to continue using OpenCRM.
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  // Trial active - show warning when 3 or fewer days remaining
  if (status.daysRemaining <= 3 && status.daysRemaining > 0) {
    return (
      <>
        <div className="bg-amber-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                {status.daysRemaining === 1 
                  ? 'Last day of your free trial!' 
                  : `${status.daysRemaining} days left in your free trial.`} 
                {' '}Upgrade to unlock unlimited access.
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-amber-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              <Crown className="w-4 h-4 inline mr-1" />
              Upgrade
            </button>
          </div>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  return null;
};
