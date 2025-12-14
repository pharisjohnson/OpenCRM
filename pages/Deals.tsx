

import React, { useState } from 'react';
import { Plus, MoreHorizontal, Sparkles, X, Save } from 'lucide-react';
import { DealStage, Deal } from '../types';
import { MOCK_DEALS, MOCK_CONTACTS } from '../constants';
import { analyzeDealProbability } from '../services/aiService';
import { CustomFieldInputs } from '../components/CustomFieldInputs';
import { useCustomFields } from '../contexts/CustomFieldsContext';

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, text: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Fields Context
  const { getFieldsByEntity } = useCustomFields();

  const stages = Object.values(DealStage);

  const moveDeal = (dealId: string, direction: 'next' | 'prev') => {
    // Simple state move logic for demo
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      const currentIndex = stages.indexOf(d.stage);
      const nextIndex = direction === 'next' 
        ? Math.min(currentIndex + 1, stages.length - 1)
        : Math.max(currentIndex - 1, 0);
      return { ...d, stage: stages[nextIndex] };
    }));
  };

  const handleAIAnalyze = async (deal: Deal) => {
    setAnalyzingId(deal.id);
    setAnalysisResult(null);
    const advice = await analyzeDealProbability(deal.title, deal.stage, deal.value);
    setAnalysisResult({ id: deal.id, text: advice });
    setAnalyzingId(null);
  };

  const handleAddDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process Custom Fields
    const customFields: Record<string, any> = {};
    const fieldDefs = getFieldsByEntity('deal');
    fieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const newDeal: Deal = {
        id: `d${Date.now()}`,
        title: formData.get('title') as string,
        value: Number(formData.get('value')),
        stage: formData.get('stage') as DealStage,
        contactId: formData.get('contactId') as string,
        expectedCloseDate: formData.get('expectedCloseDate') as string,
        probability: Number(formData.get('probability')),
        customFields: customFields
    };
    setDeals([...deals, newDeal]);
    setIsModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-gray-500">Track your opportunities.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          New Deal
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full min-w-[1000px] pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div key={stage} className="w-80 flex flex-col bg-gray-100 rounded-xl">
                <div className="p-4 border-b border-gray-200/50">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-700">{stage}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{stageDeals.length}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">${totalValue.toLocaleString()}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                          {deal.probability}% Prob.
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{deal.title}</h4>
                      <p className="text-sm text-gray-500 mb-3">${deal.value.toLocaleString()}</p>
                      
                      {analysisResult?.id === deal.id && (
                        <div className="mb-3 p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-800">
                          ✨ {analysisResult.text}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                           <button 
                            onClick={() => handleAIAnalyze(deal)}
                            disabled={analyzingId === deal.id}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="AI Insights"
                           >
                             <Sparkles size={16} className={analyzingId === deal.id ? 'animate-pulse text-indigo-600' : ''} />
                           </button>
                        </div>
                        <div className="flex gap-1 text-xs">
                          <button 
                            onClick={() => moveDeal(deal.id, 'next')}
                            className="text-primary-600 hover:underline"
                          >
                            Move &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

       {/* Add Deal Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Create New Deal</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDeal} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                  <input 
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Q1 Software License"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                     <input 
                        name="value"
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="50000"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                     <input 
                        name="probability"
                        type="number"
                        min="0"
                        max="100"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="50"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                   <select name="stage" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {stages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                      ))}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                   <select name="contactId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {MOCK_CONTACTS.map(contact => (
                          <option key={contact.id} value={contact.id}>{contact.name} ({contact.company})</option>
                      ))}
                   </select>
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                     <input 
                        name="expectedCloseDate"
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                </div>
              </div>

              {/* Custom Fields */}
              <CustomFieldInputs entityType="deal" />

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
