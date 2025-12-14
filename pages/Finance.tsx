
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  FileCheck, 
  MoreHorizontal, 
  Download, 
  Send, 
  X, 
  Save, 
  Printer,
  ArrowRightCircle,
  Edit2,
  Trash2,
  LayoutTemplate,
  Upload,
  Settings,
  FileSpreadsheet,
  FileType
} from 'lucide-react';
import { MOCK_FINANCE, MOCK_CONTACTS } from '../constants';
import { FinanceDocument, InvoiceItem } from '../types';
import { CustomFieldInputs } from '../components/CustomFieldInputs';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { useConfig } from '../contexts/ConfigContext';

export const Finance: React.FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig } = useConfig();
  const [documents, setDocuments] = useState<FinanceDocument[]>(MOCK_FINANCE);
  const [activeTab, setActiveTab] = useState<'Invoice' | 'Quote'>('Invoice');
  
  // -- Modals State --
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // -- Action State --
  const [editingDoc, setEditingDoc] = useState<FinanceDocument | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<FinanceDocument | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeDownloadMenuId, setActiveDownloadMenuId] = useState<string | null>(null);
  
  // -- Form State --
  const [formCategory, setFormCategory] = useState<'Service' | 'Product'>('Service');
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);

  // -- Template Config State (local to modal before save) --
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'minimal'>(config.invoiceTemplate || 'classic');
  const [customFooter, setCustomFooter] = useState(config.invoiceFooter || '');

  // -- Refs --
  const menuRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // -- Effects --
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setActiveDownloadMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { getFieldsByEntity } = useCustomFields();
  const filteredDocs = documents.filter(d => d.type === activeTab);

  // -- Helpers --

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // -- Handlers --

  const handleOpenCreateModal = () => {
    setEditingDoc(null);
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
    setFormCategory('Service');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (doc: FinanceDocument) => {
    setEditingDoc(doc);
    setItems(doc.items && doc.items.length > 0 ? doc.items : [{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
    setFormCategory(doc.category || 'Service');
    setIsFormModalOpen(true);
    setActiveMenuId(null);
    setIsTemplateModalOpen(false); // Close template modal if open
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id));
    }
    setActiveMenuId(null);
  };

  const handleSaveDocument = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process Custom Fields
    const customFields: Record<string, any> = {};
    const fieldDefs = getFieldsByEntity('finance');
    fieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const docData: FinanceDocument = {
        id: editingDoc ? editingDoc.id : `f${Date.now()}`,
        number: formData.get('number') ? (formData.get('number') as string) : `${activeTab === 'Invoice' ? 'INV' : 'QT'}-${Date.now().toString().slice(-4)}`,
        type: activeTab,
        category: formCategory,
        status: editingDoc ? editingDoc.status : 'Draft', 
        contactId: formData.get('contactId') as string,
        issueDate: formData.get('issueDate') as string,
        dueDate: formData.get('dueDate') as string,
        lsoNumber: formData.get('lsoNumber') as string,
        legalEntityId: formData.get('pinNumber') as string,
        paymentDetails: formData.get('paymentDetails') as string,
        items: items,
        total: calculateTotal(),
        customFields: customFields
    };

    if (editingDoc) {
        setDocuments(documents.map(d => d.id === editingDoc.id ? docData : d));
    } else {
        setDocuments([docData, ...documents]);
    }
    
    setIsFormModalOpen(false);
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  const handlePrint = (doc: FinanceDocument) => {
      // Save current template prefs before printing
      updateConfig({ 
          invoiceTemplate: selectedTemplate,
          invoiceFooter: customFooter
      });
      navigate(`/finance/invoice/${doc.id}/print`);
      setActiveDownloadMenuId(null);
  };

  const handleDownloadCsv = (doc: FinanceDocument) => {
      const headers = ['Document Number', 'Type', 'Category', 'Date', 'Due Date', 'Client', 'Description', 'Quantity', 'Unit Price', 'Total'];
      const client = MOCK_CONTACTS.find(c => c.id === doc.contactId)?.name || 'Unknown';
      
      const rows = doc.items.map(item => [
          doc.number,
          doc.type,
          doc.category || '',
          doc.issueDate,
          doc.dueDate,
          client,
          `"${item.description.replace(/"/g, '""')}"`, // Escape quotes
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice
      ]);

      const csvContent = [
          headers.join(','), 
          ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.type}_${doc.number}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setActiveDownloadMenuId(null);
  };

  const handleConvertToInvoice = (quote: FinanceDocument) => {
      if (confirm(`Convert Quote #${quote.number} to a new Invoice?`)) {
          const newInvoice: FinanceDocument = {
              ...quote,
              id: `f${Date.now()}`,
              type: 'Invoice',
              number: `INV-${Date.now().toString().slice(-4)}`,
              status: 'Draft',
              issueDate: new Date().toISOString().split('T')[0],
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
          setDocuments(prev => [newInvoice, ...prev]);
          setActiveTab('Invoice');
          alert(`Successfully created Invoice #${newInvoice.number}.`);
      }
  };

  const handleRowClick = (doc: FinanceDocument) => {
      setSelectedDoc(doc);
      // Initialize modal with current config values
      setSelectedTemplate(config.invoiceTemplate || 'classic');
      setCustomFooter(config.invoiceFooter || '');
      setIsTemplateModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ invoiceLogoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultPaymentText = config.defaultPaymentDetails || "Account Details: Account Name - Global Village Publishers (EA) Ltd -\nEquity Bank, Mombasa Road Branch, Ac No. 0260293429681\nCheques Payable to Global Village Publishers (EA) Ltd";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage quotes, invoices, and payments.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          New {activeTab}
        </button>
      </div>

      {/* Tabs & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-1 md:col-span-1 h-fit">
            <div className="flex flex-col">
                <button 
                    onClick={() => setActiveTab('Invoice')}
                    className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Invoice' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'}`}
                >
                    <span className="flex items-center gap-2"><FileCheck size={18}/> Invoices</span>
                    <span className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-2 rounded-full text-xs">{documents.filter(d => d.type === 'Invoice').length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('Quote')}
                    className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Quote' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'}`}
                >
                    <span className="flex items-center gap-2"><FileText size={18}/> Quotes</span>
                    <span className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-2 rounded-full text-xs">{documents.filter(d => d.type === 'Quote').length}</span>
                </button>
            </div>
         </div>

         <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${filteredDocs.reduce((sum, d) => sum + d.total, 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending / Unpaid</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${filteredDocs.filter(d => ['Sent', 'Overdue', 'Draft'].includes(d.status)).reduce((sum, d) => sum + d.total, 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overdue</p>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ${filteredDocs.filter(d => d.status === 'Overdue').reduce((sum, d) => sum + d.total, 0).toLocaleString()}
                    </h3>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-visible">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-dark-border font-medium border-b border-gray-200 dark:border-dark-border">
                        <tr>
                            <th className="px-6 py-3">Number</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {filteredDocs.map(doc => {
                            const client = MOCK_CONTACTS.find(c => c.id === doc.contactId);
                            return (
                                <tr 
                                    key={doc.id} 
                                    className="hover:bg-gray-50 dark:hover:bg-dark-border/50 cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(doc)}
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{doc.number}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doc.category === 'Service' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {doc.category || 'Service'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{client?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{doc.issueDate}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${doc.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="flex justify-end gap-2 items-center" onClick={e => e.stopPropagation()}>
                                            {doc.type === 'Quote' && (
                                                <button 
                                                    onClick={() => handleConvertToInvoice(doc)}
                                                    className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1"
                                                    title="Convert to Invoice"
                                                >
                                                    <ArrowRightCircle size={16} />
                                                </button>
                                            )}
                                            
                                            {/* Download Menu Button */}
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDownloadMenuId(activeDownloadMenuId === doc.id ? null : doc.id);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={16}/>
                                                </button>

                                                {/* Download Dropdown */}
                                                {activeDownloadMenuId === doc.id && (
                                                    <div ref={downloadMenuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-100 dark:border-dark-border py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
                                                        <button 
                                                            onClick={() => handlePrint(doc)}
                                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border flex items-center gap-2 text-sm"
                                                        >
                                                            <FileType size={14} /> PDF
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownloadCsv(doc)}
                                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border flex items-center gap-2 text-sm"
                                                        >
                                                            <FileSpreadsheet size={14} /> CSV
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Actions Menu Button */}
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === doc.id ? null : doc.id);
                                                        setActiveDownloadMenuId(null);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                                >
                                                    <MoreHorizontal size={16}/>
                                                </button>
                                                
                                                {/* Actions Dropdown */}
                                                {activeMenuId === doc.id && (
                                                    <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-100 dark:border-dark-border py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
                                                        <button 
                                                            onClick={() => handleOpenEditModal(doc)}
                                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border flex items-center gap-2 text-sm"
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedDoc(doc);
                                                                setIsTemplateModalOpen(true);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border flex items-center gap-2 text-sm"
                                                        >
                                                            <LayoutTemplate size={14} /> Templates
                                                        </button>
                                                        <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>
                                                        <button 
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
         </div>
      </div>

      {/* --- FORM MODAL (Create / Edit) --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between sticky top-0 bg-white dark:bg-dark-surface z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingDoc ? `Edit ${activeTab}` : `Create ${activeTab}`}
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveDocument} className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  {/* Category Selector - Applies to both Quotes & Invoices */}
                  <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <select 
                          value={formCategory} 
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                      >
                          <option value="Service">Service (Requires LSO for Invoices)</option>
                          <option value="Product">Product (Requires LPO for Invoices)</option>
                      </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document #</label>
                    <input 
                        name="number" 
                        defaultValue={editingDoc?.number}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                        placeholder="Auto-generated if empty" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                    <select 
                        name="contactId" 
                        required 
                        defaultValue={editingDoc?.contactId}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    >
                        {MOCK_CONTACTS.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                    <input 
                        type="date" 
                        name="issueDate" 
                        required 
                        defaultValue={editingDoc?.issueDate || new Date().toISOString().split('T')[0]} 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input 
                        type="date" 
                        name="dueDate" 
                        required 
                        defaultValue={editingDoc?.dueDate}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                    />
                  </div>
               </div>

               {activeTab === 'Invoice' && (
                   <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               {formCategory === 'Service' ? 'LSO Number' : 'LPO Number'}
                           </label>
                           <input 
                                name="lsoNumber" 
                                defaultValue={editingDoc?.lsoNumber}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                                placeholder={formCategory === 'Service' ? "e.g. 2392021" : "e.g. PO-9981"}
                            />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Number</label>
                           <input 
                                name="pinNumber" 
                                defaultValue={editingDoc?.legalEntityId || "P051239913C"}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                                placeholder="P05..." 
                            />
                       </div>
                       <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Instructions</label>
                           <textarea 
                                name="paymentDetails" 
                                rows={3} 
                                defaultValue={editingDoc?.paymentDetails || defaultPaymentText}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                                placeholder="Bank details, MPESA, etc..." 
                            />
                       </div>
                   </div>
               )}

               <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Line Items</h3>
                  <div className="space-y-3">
                      {items.map((item, idx) => (
                          <div key={item.id} className="flex gap-3 items-start">
                              <div className="flex-1">
                                  <input 
                                    placeholder="Description" 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-sm dark:text-white"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    required
                                  />
                              </div>
                              <div className="w-20">
                                  <input 
                                    type="number" 
                                    placeholder="Qty" 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-sm dark:text-white"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                    min="1"
                                  />
                              </div>
                              <div className="w-28">
                                  <input 
                                    type="number" 
                                    placeholder="Price" 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-sm dark:text-white"
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                                    min="0"
                                  />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                              >
                                <X size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="mt-3 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
               </div>

               {/* Custom Fields */}
               <CustomFieldInputs entityType="finance" currentData={editingDoc || undefined} />

               <div className="flex justify-end border-t border-gray-200 dark:border-dark-border pt-4">
                  <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${calculateTotal().toLocaleString()}</p>
                  </div>
               </div>

               <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-dark-border">
                <button 
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  {editingDoc ? 'Update Document' : 'Create & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TEMPLATE & ACTIONS MODAL --- */}
      {isTemplateModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customize & Print</h2>
                      <button 
                          onClick={() => setIsTemplateModalOpen(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Customization */}
                      <div className="space-y-6">
                          <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                  <LayoutTemplate size={16} /> Layout Style
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                  <button 
                                      onClick={() => setSelectedTemplate('classic')}
                                      className={`border-2 rounded-lg p-3 cursor-pointer hover:border-primary-400 transition-all text-center flex flex-col items-center gap-2 ${selectedTemplate === 'classic' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border'}`}
                                  >
                                      <div className="w-full h-16 bg-white border border-gray-300 flex flex-col p-1 gap-1">
                                          <div className="h-1.5 w-full bg-gray-400 rounded-sm"></div>
                                          <div className="h-px w-full bg-gray-200"></div>
                                          <div className="flex-1 border border-gray-200"></div>
                                      </div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Classic</span>
                                  </button>
                                  <button 
                                      onClick={() => setSelectedTemplate('minimal')}
                                      className={`border-2 rounded-lg p-3 cursor-pointer hover:border-primary-400 transition-all text-center flex flex-col items-center gap-2 ${selectedTemplate === 'minimal' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border'}`}
                                  >
                                      <div className="w-full h-16 bg-white flex flex-col p-1 gap-1.5">
                                          <div className="h-2 w-1/3 bg-gray-800 rounded-sm"></div>
                                          <div className="h-1 w-full bg-gray-100"></div>
                                          <div className="h-1 w-full bg-gray-100"></div>
                                      </div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Minimal</span>
                                  </button>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                  <Settings size={16} /> Header & Footer
                              </h3>
                              <div className="space-y-3">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Invoice Logo (Optional Override)</label>
                                      <div className="flex gap-2 items-center">
                                          {config.invoiceLogoUrl && (
                                              <img src={config.invoiceLogoUrl} alt="Preview" className="h-8 w-8 object-contain border border-gray-200 dark:border-dark-border rounded bg-white" />
                                          )}
                                          <label className="cursor-pointer bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm flex items-center gap-1">
                                              <Upload size={12} /> Upload
                                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                          </label>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Footer / Terms Text</label>
                                      <textarea 
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm dark:text-white"
                                          rows={3}
                                          value={customFooter}
                                          onChange={e => setCustomFooter(e.target.value)}
                                          placeholder="Thank you for your business..."
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="space-y-4 flex flex-col justify-center border-l border-gray-100 dark:border-dark-border pl-8">
                          <button 
                              onClick={() => handlePrint(selectedDoc)}
                              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none transition-all transform hover:scale-[1.02]"
                          >
                              <Printer size={20} />
                              Generate PDF
                          </button>
                          
                          <div className="pt-4 border-t border-gray-100 dark:border-dark-border space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-2">Other Actions</p>
                              <button 
                                  onClick={() => handleOpenEditModal(selectedDoc)}
                                  className="w-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                              >
                                  <Edit2 size={14} /> Edit Data
                              </button>
                              <button 
                                  onClick={() => handleOpenCreateModal()}
                                  className="w-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                              >
                                  <Plus size={14} /> Create New Instead
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};