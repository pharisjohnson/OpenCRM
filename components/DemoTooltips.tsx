"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

interface TooltipStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const DEMO_STEPS: TooltipStep[] = [
  {
    target: '[data-demo="dashboard"]',
    title: 'Welcome to Your Dashboard',
    description: 'Get a bird\'s-eye view of your business metrics, recent activities, and important updates.'
  },
  {
    target: '[data-demo="contacts"]',
    title: 'Manage Contacts',
    description: 'Store and organize all your business relationships. Add custom fields, tags, and track interactions.'
  },
  {
    target: '[data-demo="deals"]',
    title: 'Track Deals',
    description: 'Visual pipeline to move deals through stages. Track values, probabilities, and close dates.'
  },
  {
    target: '[data-demo="companies"]',
    title: 'Company Profiles',
    description: 'Manage company information, see all associated contacts, and track business relationships.'
  },
  {
    target: '[data-demo="projects"]',
    title: 'Project Management',
    description: 'Create projects, assign tasks, track progress, and collaborate with your team.'
  },
  {
    target: '[data-demo="chat"]',
    title: 'Team Chat',
    description: 'Communicate with your team. Use @ mentions and / commands for faster workflows.'
  },
];

export const DemoTooltips: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if in demo mode
    const demoMode = localStorage.getItem('demoMode');
    const searchParams = new URLSearchParams(window.location.search);
    const isDemo = demoMode === 'true' || searchParams.get('demo') === 'true';
    
    setIsDemoMode(isDemo);
    
    if (isDemo) {
      // Show first tooltip after a short delay
      setTimeout(() => setShowTooltip(true), 1000);
    }
  }, []);

  if (!isDemoMode || completed) return null;

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
      setShowTooltip(false);
    }
  };

  const handleSkip = () => {
    setCompleted(true);
    setShowTooltip(false);
    localStorage.removeItem('demoMode');
  };

  if (!showTooltip) return null;

  const step = DEMO_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={handleSkip} />
      
      {/* Tooltip */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-md w-full mx-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                STEP {currentStep + 1} OF {DEMO_STEPS.length}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {step.description}
          </p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {DEMO_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-primary-600' 
                    : index < currentStep
                    ? 'w-1.5 bg-primary-400'
                    : 'w-1.5 bg-gray-300 dark:bg-dark-border'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {currentStep < DEMO_STEPS.length - 1 ? (
                <>
                  Next <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Finish <CheckCircle size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
