
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Copy
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_COMPANIES, CURRENT_USER, MOCK_CREDENTIALS } from '../constants';
import { Document, SecureCredential } from '../types';

export const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'internal' | 'secure'>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCUMENTS);
  const [credentials, setCredentials] = useState<SecureCredential[]>(MOCK_CREDENTIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCredentialIds, setVisibleCredentialIds] = useState<Set<string>>(new Set());

  const getCompanyName = (id: string) => {
    return MOCK_COMPANIES.find(c => c.id === id)?.name || 'Unknown Company';
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getCompanyName(doc.companyId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.category === activeTab;
    return matchesSearch && matchesTab;
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
            url: '#'
        };
        
        setDocs([...docs, newDoc]);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-500">Centralized storage for all client and internal resources.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {activeTab === 'secure' ? <Key size={18} /> : <Upload size={18} />}
          {activeTab === 'secure' ? 'Add Credential' : 'Upload Document'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex bg-gray-200/50 p-1 rounded-lg overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab('client')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Client Docs
            </button>
            <button 
              onClick={() => setActiveTab('internal')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'internal' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {activeTab === 'internal' && <ShieldAlert size={14} />}
              Internal Resources
            </button>
            <button 
              onClick={() => setActiveTab('secure')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'secure' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {activeTab === 'secure' && <Lock size={14} />}
              Secure Vault
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Files
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder={activeTab === 'secure' ? "Search credentials..." : "Search files..."}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white bg-white flex items-center gap-2">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'secure' ? (
            <div className="p-0">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Credential Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3">Last Updated</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCredentials.map(cred => (
                       <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                   <Lock size={16} />
                                </div>
                                {cred.title}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 capitalize">{cred.type.replace('_', ' ')}</td>
                          <td className="px-6 py-4 font-mono text-xs">
                             <div className="flex items-center gap-3">
                                <span className={visibleCredentialIds.has(cred.id) ? "text-gray-900" : "text-gray-400 tracking-widest"}>
                                   {visibleCredentialIds.has(cred.id) ? cred.value : '••••••••••••'}
                                </span>
                                <button 
                                  onClick={() => toggleCredentialVisibility(cred.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                   {visibleCredentialIds.has(cred.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{cred.lastUpdated}</td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => copyToClipboard(cred.value)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Copy"
                             >
                                <Copy size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                    {filteredCredentials.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Lock className="text-gray-300" size={48} />
                            <p>No credentials stored.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Document Name</th>
                  <th className="px-6 py-3">Associated Company</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Uploaded By</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${doc.category === 'internal' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary-100 text-primary-700'}`}>
                          {doc.category === 'internal' ? <ShieldAlert size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.uploadDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/companies/${doc.companyId}`);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors group/company"
                      >
                        <Building2 size={16} className="text-gray-400 group-hover/company:text-primary-500" />
                        <span className="font-medium">{getCompanyName(doc.companyId)}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                           {doc.uploadedBy.charAt(0)}
                         </div>
                         <span>{doc.uploadedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <File className="text-gray-300" size={48} />
                        <p>No documents found.</p>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Upload your first document
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'secure' ? 'Add Secure Credential' : 'Upload Document'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {activeTab === 'secure' ? (
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input 
                        name="title"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. AWS Production Keys"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="login">Login Details</option>
                        <option value="api_key">API Key</option>
                        <option value="tax_id">Tax ID / PIN</option>
                        <option value="other">Other Secret</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Value</label>
                      <input 
                        name="value"
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="Secret value here..."
                      />
                    </div>
                 </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                     <Upload className="text-gray-400 mb-2" size={32} />
                     <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                     <p className="text-xs text-gray-500 mt-1">PDF, DOC, Images up to 10MB</p>
                     <input type="file" name="file" className="hidden" id="file-upload" required />
                     <label htmlFor="file-upload" className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                       Select File
                     </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                    <input 
                      name="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Q4 Contract"
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                     <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="client">Client Document</option>
                        <option value="internal">Internal Resource</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Associated Company</label>
                     <select name="companyId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {MOCK_COMPANIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                     </select>
                  </div>
                </div>
              )}

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
                  {activeTab === 'secure' ? 'Save Credential' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
