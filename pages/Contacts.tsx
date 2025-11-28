import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, Lock, LayoutGrid, List as ListIcon, X, Save, Edit2, Trash2, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { MOCK_CONTACTS } from '../constants';
import { ContactStatus, Contact } from '../types';
import { CustomFieldInputs } from '../components/CustomFieldInputs';
import { useCustomFields } from '../contexts/CustomFieldsContext';

export const Contacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Custom Fields Context
  const { getFieldsByEntity } = useCustomFields();

  // State for editing/creating/importing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(null); // Null means new contact
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process Custom Fields
    const customFields: Record<string, any> = {};
    const fieldDefs = getFieldsByEntity('contact');
    fieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const newContactData: Partial<Contact> = {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      status: formData.get('status') as ContactStatus,
      customFields: customFields
    };

    if (editingContact) {
      // Update existing
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...newContactData } : c));
    } else {
      // Create new
      const newContact: Contact = {
        id: `c${Date.now()}`,
        lastContacted: new Date().toISOString().split('T')[0],
        tags: [],
        ownerId: 'u1',
        ...(newContactData as any)
      };
      setContacts([...contacts, newContact]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(contacts.filter(c => c.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleImportContacts = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parsing (splits by new line, then comma)
      // Assumes format: Name, Email, Phone, Company, Title
      const lines = text.split('\n');
      const newContacts: Contact[] = [];

      // Skip header if it exists (simple check if first line contains "email")
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, email, phone, company, title] = line.split(',').map(s => s.trim());
        
        if (name && email) {
          newContacts.push({
            id: `c_imp_${Date.now()}_${i}`,
            name,
            email,
            phone: phone || '',
            company: company || 'Unknown',
            title: title || '',
            status: ContactStatus.LEAD,
            lastContacted: new Date().toISOString().split('T')[0],
            tags: ['Imported'],
            ownerId: 'u1'
          });
        }
      }

      setContacts([...contacts, ...newContacts]);
      alert(`Successfully imported ${newContacts.length} contacts.`);
      setIsImportModalOpen(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">Manage your leads and customers.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <ListIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
           </div>
           
           <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
           >
            <UploadCloud size={18} />
            Import
           </button>

          <button 
            onClick={handleAddNew}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search contacts by name, email, or company..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Name & Role</th>
                  <th className="px-6 py-3">Contact Info</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Contacted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => handleEdit(contact)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.title || 'No Title'} • {contact.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-gray-600">
                         <div className="flex items-center gap-1.5 mb-1">
                           <Mail size={12} className="text-gray-400"/> {contact.email}
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Phone size={12} className="text-gray-400"/> {contact.phone}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${contact.status === ContactStatus.LEAD ? 'bg-yellow-100 text-yellow-800' : 
                          contact.status === ContactStatus.CUSTOMER ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {contact.lastContacted}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <Mail size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <Phone size={16} />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                          onClick={(e) => handleEdit(contact, e)}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/50">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
                onClick={() => handleEdit(contact)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-xs text-gray-500">{contact.title || 'No Title'}</p>
                    </div>
                  </div>
                   <button 
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleEdit(contact, e)}
                    >
                      <Edit2 size={16} />
                    </button>
                </div>
                
                <div className="space-y-2 mb-4 flex-1">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <span className="w-16 text-xs text-gray-400 uppercase font-semibold">Company</span>
                     <span className="truncate font-medium">{contact.company}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <span className="w-16 text-xs text-gray-400 uppercase font-semibold">Email</span>
                     <span className="truncate">{contact.email}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <span className="w-16 text-xs text-gray-400 uppercase font-semibold">Phone</span>
                     <span className="truncate">{contact.phone}</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${contact.status === ContactStatus.LEAD ? 'bg-yellow-100 text-yellow-800' : 
                          contact.status === ContactStatus.CUSTOMER ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}
                    `}>
                      {contact.status}
                   </span>
                   <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Phone size={16} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingContact ? 'Edit Contact' : 'New Contact'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveContact} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingContact?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Position</label>
                  <input 
                    name="title"
                    defaultValue={editingContact?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="VP of Sales"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      name="status"
                      defaultValue={editingContact?.status || ContactStatus.LEAD}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value={ContactStatus.LEAD}>Lead</option>
                      <option value={ContactStatus.CUSTOMER}>Customer</option>
                      <option value={ContactStatus.CHURNED}>Churned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input 
                      name="company"
                      defaultValue={editingContact?.company}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        name="email"
                        type="email"
                        required
                        defaultValue={editingContact?.email}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="jane@example.com"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        name="phone"
                        defaultValue={editingContact?.phone}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+1 555 000 0000"
                      />
                   </div>
                </div>
              </div>

              {/* Custom Fields */}
              <CustomFieldInputs entityType="contact" currentData={editingContact || undefined} />

              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                {editingContact ? (
                   <button 
                    type="button"
                    onClick={() => handleDelete(editingContact.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                   >
                     <Trash2 size={16} />
                     Delete
                   </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex gap-3">
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
                     Save Contact
                   </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Import Contacts</h2>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleImportContacts} className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors bg-gray-50/50">
                     <FileSpreadsheet className="text-green-500 mb-3" size={40} />
                     <p className="text-sm font-medium text-gray-900">Upload CSV File</p>
                     <p className="text-xs text-gray-500 mt-1 mb-4">Format: Name, Email, Phone, Company, Title</p>
                     <input type="file" accept=".csv" name="file" className="hidden" id="csv-upload" required />
                     <label htmlFor="csv-upload" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                       Select CSV
                     </label>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <strong>Tip:</strong> Ensure your CSV file has a header row. Duplicate emails will not be checked in this demo.
                  </div>
               </div>

               <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                   >
                     <UploadCloud size={18} />
                     Start Import
                   </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};