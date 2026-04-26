
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Upload,
  MoreHorizontal,
  Download,
  ShieldAlert,
  Building2,
  File,
  Eye,
  EyeOff,
  X,
  Save,
  Lock,
  Key,
  Copy,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  Edit2
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_COMPANIES, CURRENT_USER, MOCK_CREDENTIALS } from '../constants';
import { Document, SecureCredential } from '../types';
import { summarizeDocument } from '../services/aiService';

export const Documents: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'internal' | 'secure'>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCUMENTS);
  const [credentials, setCredentials] = useState<SecureCredential[]>(MOCK_CREDENTIALS);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [visibleCredentialIds, setVisibleCredentialIds] = useState<Set<string>>(new Set());

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCompanyName = (id: string) => {
    return MOCK_COMPANIES.find(c => c.id === id)?.name || 'Unknown Company';
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(doc.companyId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.category === activeTab;

    // Permission Filter: Admins see everything. Users only see Granted docs.
    const hasPermission = CURRENT_USER.role === 'admin' || doc.access === 'granted';

    return matchesSearch && matchesTab && hasPermission;
  });

  const filteredCredentials = credentials.filter(cred =>
    cred.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCredentialVisibility = (id: string) => {
    const newSet = new Set(visibleCredentialIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCredentialIds(newSet);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocs(docs.filter(d => d.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleDownload = (doc: Document) => {
    // Simulate file download
    const content = `Mock content for document: ${doc.title}\nUploaded by: ${doc.uploadedBy}\nDate: ${doc.uploadDate}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`; // Mocking as .txt
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSummarize = async (doc: Document) => {
    setActiveMenuId(null);
    // Simulate file content read
    const mockContent = `Content of ${doc.title}: This document outlines the key deliverables, milestones, and payment terms agreed upon between the parties. It includes detailed specifications for the project scope and risk mitigation strategies.`;

    const summary = await summarizeDocument(doc.title, mockContent);

    alert(`AI Summary for ${doc.title}:\n\n${summary}`);
  };

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (activeTab === 'secure') {
      const newCred: SecureCredential = {
        id: `sc${Date.now()}`,
        title: formData.get('title') as string,
        value: formData.get('value') as string,
        type: formData.get('type') as SecureCredential['type'],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setCredentials([...credentials, newCred]);
    } else {
      const file = (formData.get('file') as any);
      const title = formData.get('title') as string || file.name;

      const newDoc: Document = {
        id: `doc${Date.now()}`,
        title: title,
        category: formData.get('category') as 'client' | 'internal',
        type: 'pdf', // Mock type
        size: '1.2 MB', // Mock size
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: CURRENT_USER.name,
        companyId: formData.get('companyId') as string,
        url: '#',
        // Admins approve automatically, users need approval
        access: CURRENT_USER.role === 'admin' ? 'granted' : 'pending'
      };

      setDocs([...docs, newDoc]);
    }
    setIsModalOpen(false);
  };

  const toggleAccess = (doc: Document) => {
    const newAccess = doc.access === 'granted' ? 'denied' : 'granted';
    setDocs(docs.map(d => d.id === doc.id ? { ...d, access: newAccess } : d));
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Vault</h1>
          <p className="text-gray-500 dark:text-gray-400">Centralized storage for all client and internal resources.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          {activeTab === 'secure' ? <Key size={18} /> : <Upload size={18} />}
          <span className="hidden sm:inline">{activeTab === 'secure' ? 'Add Credential' : 'Upload Document'}</span>
          <span className="sm:hidden">{activeTab === 'secure' ? 'Add' : 'Upload'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-dark-bg/20">
          <div className="flex bg-gray-200/50 dark:bg-dark-bg p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'client' ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Client Docs
            </button>
            <button
              onClick={() => setActiveTab('internal')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'internal' ? 'bg-white dark:bg-dark-surface text-yellow-700 dark:text-yellow-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {activeTab === 'internal' && <ShieldAlert size={14} />}
              Internal Resources
            </button>
            {/* Secure Vault is Admin Only */}
            {CURRENT_USER.role === 'admin' && (
              <button
                onClick={() => setActiveTab('secure')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'secure' ? 'bg-white dark:bg-dark-surface text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {activeTab === 'secure' && <Lock size={14} />}
                Secure Vault
              </button>
            )}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              All Files
            </button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={activeTab === 'secure' ? "Search credentials..." : "Search files..."}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-bg bg-white dark:bg-dark-surface flex items-center gap-2 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Tab Context Info */}
        {activeTab === 'internal' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 px-6 py-3 border-b border-yellow-100 dark:border-yellow-900/20 flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <Info size={18} className="text-yellow-700 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Internal Business Resources</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-500/80 mt-0.5">
                This section contains sensitive business documents such as training materials, SOPs, and internal policies.
                Access is managed by administrators.
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'secure' ? (
            <div className="min-w-[800px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border text-gray-600 dark:text-gray-400 font-medium sticky top-0 z-10 border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4">Credential Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {filteredCredentials.map(cred => (
                    <tr key={cred.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                            <Lock size={16} />
                          </div>
                          {cred.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{cred.type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <span className={visibleCredentialIds.has(cred.id) ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600 tracking-widest"}>
                            {visibleCredentialIds.has(cred.id) ? cred.value : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleCredentialVisibility(cred.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {visibleCredentialIds.has(cred.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cred.lastUpdated}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => copyToClipboard(cred.value)}
                          className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all active:scale-95"
                          title="Copy"
                        >
                          <Copy size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCredentials.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-600">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Lock className="text-gray-300 dark:text-dark-border" size={48} />
                          <p>No credentials stored.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="min-w-[1000px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border text-gray-600 dark:text-gray-400 font-medium sticky top-0 z-10 border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4">Document Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Access</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${doc.category === 'internal' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'}`}>
                            {doc.category === 'internal' ? <ShieldAlert size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/companies/${doc.companyId}`);
                          }}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all group/company"
                        >
                          <Building2 size={16} className="text-gray-400 group-hover/company:text-primary-500" />
                          <span className="font-medium underline-offset-4 group-hover/company:underline">{getCompanyName(doc.companyId)}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="uppercase text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {doc.access === 'denied' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                            <Lock size={10} /> Restricted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={10} /> Granted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium dark:text-gray-300">{doc.uploadDate}</span>
                          <span className="text-[10px] text-gray-400">by {doc.uploadedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-all active:scale-90"
                            title="Quick Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-all active:scale-90"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>

                          {/* More Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === doc.id ? null : doc.id);
                              }}
                              className={`p-2 rounded-lg transition-all active:scale-90 ${activeMenuId === doc.id ? 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {activeMenuId === doc.id && (
                              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-100 dark:border-dark-border py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2 text-sm transition-colors"
                                  onClick={() => handleSummarize(doc)}
                                >
                                  <Sparkles size={14} className="text-purple-600 dark:text-purple-400 font-bold" />
                                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">AI Summary</span>
                                </button>

                                {CURRENT_USER.role === 'admin' && (
                                  <>
                                    <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2 text-sm transition-colors"
                                      onClick={() => toggleAccess(doc)}
                                    >
                                      {doc.access === 'granted' ? <Lock size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                                      {doc.access === 'granted' ? 'Restrict Access' : 'Approve Access'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDoc(doc.id)}
                                      className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm transition-colors"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-500 dark:text-gray-600">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <File className="text-gray-200 dark:text-dark-border" size={64} />
                          <p className="text-lg font-medium">No results found</p>
                          <p className="max-w-xs mx-auto text-sm">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between sticky top-0 bg-white dark:bg-dark-surface z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'secure' ? 'Add Secure Credential' : 'Upload Document'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {activeTab === 'secure' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                      placeholder="e.g. AWS Production Keys"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select name="type" className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white">
                      <option value="login">Login Details</option>
                      <option value="api_key">API Key</option>
                      <option value="tax_id">Tax ID / PIN</option>
                      <option value="other">Other Secret</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Value</label>
                    <input
                      name="value"
                      required
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm dark:text-white"
                      placeholder="Secret value here..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors group cursor-pointer relative overflow-hidden">
                    <Upload className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, Images up to 10MB</p>
                    <input type="file" name="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      // In a real app, handle file preview here
                    }} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Title</label>
                    <input
                      name="title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                      placeholder="e.g. Q4 Contract"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select name="category" className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white">
                      <option value="client">Client Document</option>
                      <option value="internal">Internal Resource</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Associated Company</label>
                    <select name="companyId" className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white">
                      {MOCK_COMPANIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Save size={18} />
                  {activeTab === 'secure' ? 'Save Credential' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${previewDoc.category === 'internal' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary-100 text-primary-700'}`}>
                  {previewDoc.category === 'internal' ? <ShieldAlert size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-none mb-1">{previewDoc.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="uppercase font-bold tracking-wider bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[10px]">{previewDoc.type}</span>
                    <span>•</span>
                    <span>{previewDoc.size}</span>
                    <span>•</span>
                    <span>Uploaded {previewDoc.uploadDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSummarize(previewDoc)}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95"
                >
                  <Sparkles size={16} />
                  AI Summary
                </button>
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl transition-all active:scale-95"
                  title="Download"
                >
                  <Download size={22} />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="ml-2 p-2.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all active:scale-95"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-dark-bg overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
              <div className="w-full max-w-3xl h-full bg-white dark:bg-dark-surface shadow-2xl rounded-lg border border-gray-200 dark:border-dark-border flex flex-col relative group">
                {/* Visual Placeholder for a real document viewer */}
                <div className="flex-1 overflow-y-auto p-12 select-none pointer-events-none opacity-40">
                  <div className="space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-3/4 mb-12"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-full"></div>
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-full"></div>
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-5/6"></div>
                    </div>
                    <div className="h-24 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border mt-12"></div>
                    <div className="space-y-4 mt-8">
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-full"></div>
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-full"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-[2px]">
                  <div className="p-6 bg-white dark:bg-dark-bg rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border max-w-sm">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400">
                      <FileText size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure Preview</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                      Full preview of <b>{previewDoc.title}</b> is currently disabled in this demonstration environment for safety.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleDownload(previewDoc)}
                        className="w-full bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                      >
                        <Download size={18} />
                        Download PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSummarize(previewDoc);
                        }}
                        className="w-full bg-white dark:bg-dark-border text-gray-700 dark:text-white px-6 py-3 rounded-xl font-bold border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                      >
                        Ask AI to Summarize
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated scrollbar */}
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gray-100 dark:bg-dark-bg/20 rounded-full">
                  <div className="w-full bg-gray-300 dark:bg-dark-border h-32 rounded-full absolute top-1/4"></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface flex justify-center text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">
              End of Document Preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
