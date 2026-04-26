"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Target, 
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const Onboarding: React.FC = () => {
  const router = useRouter();
  const { currentOrganization, updateCurrentUser } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [workspaceInfo, setWorkspaceInfo] = useState({
    industry: '',
    teamSize: '',
    primaryGoal: ''
  });

  const handleNext = () => setStep(prev => prev + 1);
  
  const handleFinish = async () => {
    setLoading(true);
    // Simulate saving preferences
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.removeItem('needsOnboarding');
    router.push('/dashboard');
  };

  const goals = [
    { id: 'leads', title: 'Manage Leads', icon: Target, description: 'Track and convert potential customers' },
    { id: 'deals', title: 'Close Deals', icon: Zap, description: 'Manage your sales pipeline effectively' },
    { id: 'ai', title: 'AI Insights', icon: Sparkles, description: 'Use AI to analyze customer behavior' },
    { id: 'support', title: 'Customer Support', icon: Users, description: 'Manage tickets and helpdesk' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-1/3 h-1.5 rounded-full mx-1 transition-all ${
                s <= step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
        <div className="p-8 md:p-12">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to {currentOrganization?.name || 'OpenCRM'}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Let's personalize your workspace to fit your business.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">What's your industry?</label>
                  <select 
                    value={workspaceInfo.industry}
                    onChange={(e) => setWorkspaceInfo({...workspaceInfo, industry: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
                  >
                    <option value="">Select Industry</option>
                    <option value="tech">Technology</option>
                    <option value="realestate">Real Estate</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team Size</label>
                  <select 
                    value={workspaceInfo.teamSize}
                    onChange={(e) => setWorkspaceInfo({...workspaceInfo, teamSize: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
                  >
                    <option value="">Select Size</option>
                    <option value="1">Just me</option>
                    <option value="2-10">2-10 members</option>
                    <option value="11-50">11-50 members</option>
                    <option value="51+">51+ members</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!workspaceInfo.industry || !workspaceInfo.teamSize}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
              >
                Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">What's your primary goal?</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">We'll tailor your dashboard based on your selection.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setWorkspaceInfo({...workspaceInfo, primaryGoal: goal.id})}
                    className={`p-6 text-left rounded-2xl border-2 transition-all ${
                      workspaceInfo.primaryGoal === goal.id 
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' 
                        : 'border-gray-100 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-800'
                    }`}
                  >
                    <goal.icon className={`mb-3 ${workspaceInfo.primaryGoal === goal.id ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                    <h3 className="font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goal.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 px-6 py-4 border border-gray-200 dark:border-dark-border rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all">
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!workspaceInfo.primaryGoal}
                  className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">You're all set!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Your trial is active. You have 7 days of full access to all features.</p>
              </div>

              <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-2xl border border-gray-100 dark:border-dark-border space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">AI Assistant Ready</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your personal AI growth partner is enabled.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Unlimited Contacts</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start importing your leads immediately.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleFinish}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Go to Dashboard <LayoutDashboard size={20} />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
        <Shield size={14} /> Powered by OpenCRM Enterprise Security
      </p>
    </div>
  );
};
