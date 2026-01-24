"use client";

import React, { useState } from 'react';
import { Crown, Check, Zap, Users, Shield, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradePlan, status } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise' | null>(null);
  const router = useRouter();

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small teams',
      icon: Zap,
      color: 'blue',
      features: [
        'Up to 10 team members',
        'Unlimited contacts & companies',
        'Basic analytics',
        'Email support',
        'Mobile app access'
      ]
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'For growing businesses',
      icon: Star,
      color: 'purple',
      popular: true,
      features: [
        'Up to 25 team members',
        'Advanced analytics & reports',
        'Custom fields unlimited',
        'Priority email support',
        'API access',
        'Advanced automation'
      ]
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      icon: Crown,
      color: 'amber',
      features: [
        'Unlimited team members',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
        'Custom training'
      ]
    }
  ];

  const handleUpgrade = async (planId: 'starter' | 'professional' | 'enterprise') => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      if (planId === 'enterprise') {
        // Redirect to contact sales
        window.open('mailto:sales@opencrm.com?subject=Enterprise Plan Inquiry', '_blank');
        return;
      }

      const result = await upgradePlan(planId);
      
      if (result.success) {
        alert(`Successfully upgraded to ${planId} plan!`);
        onClose();
        router.refresh();
      } else {
        alert(result.error || 'Failed to upgrade. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {status.isTrialExpired 
                  ? 'Your trial has ended. Choose a plan to continue.'
                  : `${status.daysRemaining} days left in your trial`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const isCurrentPlan = status.plan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 transition-all ${
                    plan.popular
                      ? 'border-purple-500 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-dark-border'
                  } ${isCurrentPlan ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-full bg-${plan.color}-100 dark:bg-${plan.color}-900/20 mb-4`}>
                      <Icon className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSelected ? 'Upgrading...' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All plans include 14-day money-back guarantee • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
