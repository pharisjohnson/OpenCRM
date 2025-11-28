
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  History,
  MoreHorizontal,
  FileText,
  ShieldAlert,
  Download,
  Database,
  Plus,
  X,
  Save,
  Trash2,
  FolderKanban,
  DollarSign
} from 'lucide-react';
import { MOCK_COMPANIES, MOCK_CONTACTS, MOCK_DEALS, MOCK_ACTIVITIES, MOCK_DOCUMENTS, MOCK_PROJECTS } from '../constants';
import { ContactStatus, Deal, DealStage, Company, Project } from '../types';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { CustomFieldInputs } from '../components/CustomFieldInputs';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'documents'>('overview');
  
  // Custom Fields Context
  const { getFieldsByEntity } = useCustomFields();
  const customFieldDefs = getFieldsByEntity('company');

  // Initial Data
  const initialCompany = MOCK_COMPANIES.find(c => c.id === id);
  const initialContacts = MOCK_CONTACTS.filter(c => c.companyId === id);
  const initialDeals = MOCK_DEALS.filter(d => initialContacts.some(c => c.id === d.contactId));
  const activities = MOCK_ACTIVITIES.filter(a => a.companyId === id || initialContacts.some(c => c.id === a.contactId));
  const documents = MOCK_DOCUMENTS.filter(d => d.companyId === id);

  // State
  const [company, setCompany] = useState<Company | undefined>(initialCompany);
  const [companyDeals, setCompanyDeals] = useState<Deal[]>(initialDeals);
  const [contacts, setContacts] = useState(initialContacts);
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  if (!company) {
    return <div className="text-center py-10">Company not found</div>;
  }

  const clientDocs = documents.filter(d => d.category === 'client');
  const internalDocs = documents.filter(d => d.category === 'internal');
  const totalPipeline = companyDeals.reduce((sum, d) => sum + d.value, 0);

  // Handlers
  const handleDeleteCompany = () => {
    if (confirm('Are you sure you want to delete this company profile? This will unlink all contacts and deals.')) {
        navigate('/companies');
    }
  };

  const handleEditCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process Custom Fields
    const customFields: Record<string, any> = {};
    customFieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const updatedCompany: Company = {
        ...company,
        name: formData.get('name') as string,
        domain: formData.get('domain') as string,
        industry: formData.get('industry') as string,
        address: formData.get('address') as string,
        employeeCount: formData.get('employeeCount') as string,
        annualRevenue: formData.get('annualRevenue') as string,
        description: formData.get('description') as string,
        customFields: customFields
    };

    setCompany(updatedCompany);
    setIsEditModalOpen(false);
  };

  const handleCreateDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process Custom Fields for Deal
    const customFields: Record<string, any> = {};
    const dealFieldDefs = getFieldsByEntity('deal');
    dealFieldDefs.forEach(field => {
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
    
    setCompanyDeals([...companyDeals, newDeal]);
    setIsDealModalOpen(false);
    setActiveTab('deals');
  };

  const handleAddToProject = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // In a real app, this would make an API call to update the project
      alert("Company successfully added to the selected project.");
      setIsProjectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/companies')}
        className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        Back to Companies
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
             {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-gray-400" size={32} />
              )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Globe size={16} className="text-gray-400" />
                <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="hover:text-primary-600 hover:underline">
                  {company.domain}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                {company.address}
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} className="text-gray-400" />
                {company.industry}
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-gray-400" />
                {company.employeeCount} employees
              </div>
            </div>
          </div>
          <div className="flex gap-2 relative">
            <button 
                onClick={() => setIsDealModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={18} />
                New Deal
            </button>
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <MoreHorizontal size={20} />
                </button>
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-sm">
                            <button 
                                onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FileText size={16} className="text-gray-400" />
                                Edit Company
                            </button>
                            <button 
                                onClick={() => { setIsProjectModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FolderKanban size={16} className="text-gray-400" />
                                Add to Project
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                                onClick={() => { handleDeleteCompany(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete Company
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'contacts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Contacts ({contacts.length})
        </button>
        <button 
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deals' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Deals ({companyDeals.length})
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Documents ({documents.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  {company.description || "No description available."}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Annual Revenue</div>
                    <div className="text-lg font-semibold text-gray-900">{company.annualRevenue || '-'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Total Pipeline Value</div>
                    <div className="text-lg font-semibold text-gray-900">${totalPipeline.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Custom Fields Section */}
              {company.customFields && Object.keys(company.customFields).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <Database size={20} className="text-gray-400" />
                     Additional Information
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                      {customFieldDefs.map(def => {
                          const value = company.customFields?.[def.key];
                          if (!value) return null;
                          return (
                            <div key={def.id}>
                               <div className="text-sm text-gray-500 mb-1">{def.label}</div>
                               <div className="text-gray-900 font-medium break-words">
                                 {def.type === 'url' ? (
                                   <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{value}</a>
                                 ) : def.type === 'password' ? (
                                   '••••••••'
                                 ) : (
                                   value
                                 )}
                               </div>
                            </div>
                          );
                      })}
                   </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  Activity History
                </h3>
                <div className="space-y-6">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                       <div className={`
                         w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs
                         ${activity.type === 'email' ? 'bg-blue-500' : activity.type === 'meeting' ? 'bg-purple-500' : activity.type === 'call' ? 'bg-green-500' : 'bg-gray-500'}
                       `}>
                          {activity.type === 'email' && <Mail size={14} />}
                          {activity.type === 'meeting' && <Users size={14} />}
                          {activity.type === 'call' && <Phone size={14} />}
                          {activity.type === 'note' && <FileText size={14} />}
                       </div>
                       <div>
                         <div className="flex items-baseline gap-2">
                           <h4 className="font-medium text-gray-900">{activity.title}</h4>
                           <span className="text-xs text-gray-500">{activity.date}</span>
                         </div>
                         <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                         <div className="text-xs text-gray-400 mt-2">
                            Logged by User {activity.userId}
                         </div>
                       </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 italic">No recent activity.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'contacts' && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Title/Role</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                        <td className="px-6 py-4 text-gray-500">{contact.title || '-'}</td>
                        <td className="px-6 py-4 text-gray-500">{contact.email}</td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                              ${contact.status === ContactStatus.LEAD ? 'bg-yellow-100 text-yellow-800' : 
                                contact.status === ContactStatus.CUSTOMER ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {contact.status}
                            </span>
                        </td>
                      </tr>
                    ))}
                    {contacts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No contacts found for this company.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}

          {activeTab === 'deals' && (
             <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-end mb-2">
                    <button 
                        onClick={() => setIsDealModalOpen(true)}
                        className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Deal
                    </button>
                </div>
                {companyDeals.map(deal => (
                  <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                     <div>
                       <h4 className="font-medium text-gray-900">{deal.title}</h4>
                       <div className="text-sm text-gray-500 mt-1 flex gap-3">
                         <span>Value: ${deal.value.toLocaleString()}</span>
                         <span>•</span>
                         <span>Close Date: {deal.expectedCloseDate}</span>
                       </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700`}>
                       {deal.stage}
                     </span>
                  </div>
                ))}
                {companyDeals.length === 0 && (
                   <div className="text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500">No active deals found.</div>
                )}
             </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Client Documents Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Documents</h3>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {clientDocs.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {clientDocs.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-50 p-2 rounded-lg text-red-600">
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doc.title}</div>
                              <div className="text-xs text-gray-500">{doc.size} • {doc.uploadDate} • By {doc.uploadedBy}</div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-primary-600 p-2 hover:bg-white rounded-lg transition-colors">
                            <Download size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">No client documents uploaded.</div>
                  )}
                </div>
              </div>

              {/* Internal Documents Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Internal Resources</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Internal Only</span>
                </div>
                <div className="bg-yellow-50/50 rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
                   {internalDocs.length > 0 ? (
                    <div className="divide-y divide-yellow-100">
                      {internalDocs.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-yellow-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                              <ShieldAlert size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doc.title}</div>
                              <div className="text-xs text-gray-500">{doc.size} • {doc.uploadDate} • By {doc.uploadedBy}</div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-yellow-700 p-2 hover:bg-white rounded-lg transition-colors">
                            <Download size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">No internal resources available.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Key Stats</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Last Activity</span>
                   <span className="text-gray-900 font-medium">Oct 25, 2023</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Total Deals</span>
                   <span className="text-gray-900 font-medium">{companyDeals.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Won Revenue</span>
                   <span className="text-gray-900 font-medium">$0</span>
                </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Account Team</h3>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div>
                   <div className="text-sm font-medium text-gray-900">Alex Developer</div>
                   <div className="text-xs text-gray-500">Account Owner</div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* New Deal Modal */}
      {isDealModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Create New Deal</h2>
              <button 
                onClick={() => setIsDealModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateDeal} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                  <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        name="title"
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. Q1 Software License"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            name="value"
                            type="number"
                            required
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="50000"
                        />
                     </div>
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
                      {Object.values(DealStage).map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                      ))}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                   <select name="contactId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {contacts.length > 0 ? (
                        <>
                            <optgroup label={`${company.name} Contacts`}>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name} ({contact.title})</option>
                                ))}
                            </optgroup>
                        </>
                      ) : (
                         <option value="" disabled>No contacts available</option>
                      )}
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
                  onClick={() => setIsDealModalOpen(false)}
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

      {/* Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Company</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditCompany} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={company.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                     <input 
                        name="industry"
                        required
                        defaultValue={company.industry}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                     <input 
                        name="domain"
                        required
                        defaultValue={company.domain}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                   <input 
                      name="address"
                      required
                      defaultValue={company.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                     <select 
                        name="employeeCount" 
                        defaultValue={company.employeeCount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="200+">200+</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                     <input 
                        name="annualRevenue"
                        defaultValue={company.annualRevenue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={3}
                    defaultValue={company.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Custom Fields */}
              <CustomFieldInputs entityType="company" currentData={company} />

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add To Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add to Project</h2>
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddToProject} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                   <select name="projectId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">-- Choose Project --</option>
                      {MOCK_PROJECTS.filter(p => !p.companyIds.includes(company.id)).map(p => (
                         <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                      ))}
                   </select>
                   <p className="text-xs text-gray-500 mt-2">Projects already linked to this company are hidden.</p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <button 
                      type="button"
                      onClick={() => setIsProjectModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                   >
                     AddTo Project
                   </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
