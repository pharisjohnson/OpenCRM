
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Save,
  Users
} from 'lucide-react';
import { MOCK_PROJECTS, CURRENT_USER, MOCK_USERS, MOCK_COMPANIES, MOCK_CONTACTS, MOCK_DOCUMENTS } from '../constants';
import { Project, ProjectStatus } from '../types';
import { CustomFieldInputs } from '../components/CustomFieldInputs';
import { useCustomFields } from '../contexts/CustomFieldsContext';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Custom Fields Context
  const { getFieldsByEntity } = useCustomFields();

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper to get multiple select values
    const getMulti = (name: string) => {
        const select = e.currentTarget.querySelector(`[name="${name}"]`) as HTMLSelectElement;
        return Array.from(select.selectedOptions).map(opt => opt.value);
    };

    // Process Custom Fields
    const customFields: Record<string, any> = {};
    const fieldDefs = getFieldsByEntity('project');
    fieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const newProject: Project = {
      id: `p${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as ProjectStatus,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      progress: 0,
      managerId: formData.get('managerId') as string,
      teamIds: getMulti('teamIds'),
      companyIds: getMulti('companyIds'),
      contactIds: getMulti('contactIds'),
      documentIds: getMulti('documentIds'),
      customFields: customFields
    };

    setProjects([...projects, newProject]);
    setIsModalOpen(false);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Planning': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'On Hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage timelines, resources, and deliverables.</p>
        </div>
        {CURRENT_USER.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search projects..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                   <Clock size={14} />
                   <span>{project.endDate}</span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">{project.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                {project.description}
              </p>

              <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex -space-x-2">
                      {project.teamIds.map(uid => {
                         const user = MOCK_USERS.find(u => u.id === uid);
                         return user ? (
                            <img 
                              key={uid}
                              src={user.avatarUrl} 
                              alt={user.name}
                              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                              title={user.name}
                            />
                         ) : null;
                      })}
                      {project.teamIds.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                          +{project.teamIds.length - 3}
                        </div>
                      )}
                   </div>
                   <div className="text-sm text-gray-500 font-medium">
                      {project.teamIds.length} Members
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Q4 Marketing Campaign"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                     <option value="Planning">Planning</option>
                     <option value="In Progress">In Progress</option>
                     <option value="On Hold">On Hold</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date"
                      name="endDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Project goals and scope..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                   <h3 className="text-sm font-semibold text-gray-900 mb-3">Resource Allocation</h3>
                   
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                      <select name="managerId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                         {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                      <select multiple name="teamIds" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                         ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                   </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                   <h3 className="text-sm font-semibold text-gray-900 mb-3">Stakeholders & Links</h3>

                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Associated Companies</label>
                      <select multiple name="companyIds" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_COMPANIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Contacts</label>
                      <select multiple name="contactIds" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_CONTACTS.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                         ))}
                      </select>
                   </div>
                   
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Documents</label>
                      <select multiple name="documentIds" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_DOCUMENTS.map(d => (
                            <option key={d.id} value={d.id}>{d.title}</option>
                         ))}
                      </select>
                   </div>
                </div>
              </div>

              {/* Custom Fields */}
              <CustomFieldInputs entityType="project" />

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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
