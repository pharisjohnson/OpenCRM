import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  X, 
  Save,
  User as UserIcon
} from 'lucide-react';
import { MOCK_TICKETS, MOCK_USERS } from '../constants';
import { Ticket } from '../types';
import { useUser } from '../contexts/UserContext';

export const Helpdesk: React.FC = () => {
  const { currentUser } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'assigned'>('all');

  const columns = ['New', 'In Progress', 'Waiting', 'Resolved'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAddTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      subject: formData.get('subject') as string,
      status: 'New',
      priority: formData.get('priority') as Ticket['priority'],
      createdById: currentUser.id,
      assignedTo: formData.get('assignedTo') as string || undefined, // Only admins can set this via form
      description: formData.get('description') as string,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTickets([...tickets, newTicket]);
    setIsModalOpen(false);
  };

  const filteredTickets = tickets.filter(t => {
      if (filter === 'my') return t.createdById === currentUser.id;
      if (filter === 'assigned') return t.assignedTo === currentUser.id;
      return true;
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal Helpdesk</h1>
          <p className="text-gray-500">Submit requests or report issues to the admin team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Submit Ticket
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilter('my')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'my' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Created by Me
            </button>
            <button 
                onClick={() => setFilter('assigned')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'assigned' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Assigned to Me
            </button>
         </div>
         
         <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                placeholder="Search subjects..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
         </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
         <div className="flex gap-6 h-full min-w-[1000px] pb-4">
            {columns.map(status => (
                <div key={status} className="flex-1 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 h-full">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 text-sm">{status}</h3>
                        <span className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                            {filteredTickets.filter(t => t.status === status).length}
                        </span>
                    </div>
                    <div className="p-3 space-y-3 overflow-y-auto flex-1">
                        {filteredTickets.filter(t => t.status === status).map(ticket => {
                            const requester = MOCK_USERS.find(u => u.id === ticket.createdById);
                            const assignee = MOCK_USERS.find(u => u.id === ticket.assignedTo);
                            
                            return (
                                <div key={ticket.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={10} /> {ticket.createdAt}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">{ticket.subject}</h4>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{ticket.description}</p>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        {/* Requester Info */}
                                        <div className="flex items-center gap-2" title={`Requested by: ${requester?.name}`}>
                                            {requester?.avatarUrl ? (
                                                <img src={requester.avatarUrl} alt="" className="w-5 h-5 rounded-full bg-gray-200" />
                                            ) : (
                                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    <UserIcon size={12} />
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500 truncate max-w-[80px]">
                                                {requester?.name || 'Unknown'}
                                            </span>
                                        </div>

                                        {/* Assignee Info */}
                                        {assignee ? (
                                            <div className="flex items-center gap-1" title={`Assigned to: ${assignee.name}`}>
                                                <span className="text-[10px] text-gray-400 mr-1">To:</span>
                                                <img src={assignee.avatarUrl} alt="" className="w-5 h-5 rounded-full border border-gray-200" />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic bg-gray-50 px-1.5 py-0.5 rounded">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredTickets.filter(t => t.status === status).length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-xs italic">
                                No tickets
                            </div>
                        )}
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                  <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
                  <p className="text-xs text-gray-500 mt-1">Describe your issue clearly for faster resolution.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTicket} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input 
                  name="subject"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Cannot access Finance module"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="grid grid-cols-4 gap-3">
                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                        <label key={p} className="cursor-pointer group">
                            <input type="radio" name="priority" value={p} className="peer sr-only" defaultChecked={p === 'Medium'} />
                            <div className="text-center text-sm border border-gray-200 rounded-lg py-2 peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 hover:bg-gray-50 group-hover:border-gray-300 transition-all">
                                {p}
                            </div>
                        </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  name="description"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Please provide details about the issue..."
                />
              </div>

              {/* Only Admins can assign users initially */}
              {currentUser.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To (Admin Only)</label>
                    <select name="assignedTo" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="">-- Leave Unassigned --</option>
                        {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                  </div>
              )}

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};