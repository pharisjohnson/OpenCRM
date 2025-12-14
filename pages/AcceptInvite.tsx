
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const AcceptInvite: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Simulate API call to update user
    setTimeout(() => {
        login();
        navigate('/');
    }, 1500);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
       <div className="mb-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                O
            </div>
            <span className="text-2xl font-bold text-gray-900">OpenCRM</span>
       </div>

       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-8">
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to the Team!</h2>
                        <p className="text-gray-500 mt-2">You've been invited to join the workspace. Let's set up your profile.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-gray-400" size={32} />
                                )}
                            </div>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                            <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full shadow-sm">
                                <Camera size={12} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Upload a profile photo</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                             <input type="text" defaultValue="New User" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            Next Step <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Secure Your Account</h2>
                        <p className="text-gray-500 mt-2">Create a strong password to access your dashboard.</p>
                    </div>

                    <form onSubmit={handleComplete} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="password" 
                                    required
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="password" 
                                    required
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                         <div className="pt-2">
                             <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                                Complete Setup
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800">
                                Back
                            </button>
                         </div>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-8 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">All Set!</h2>
                    <p className="text-gray-500 mt-2">Redirecting you to the dashboard...</p>
                </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
             <p className="text-xs text-gray-400">© 2024 OpenCRM. All rights reserved.</p>
          </div>
       </div>
    </div>
  );
};
