
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Users, 
  FileText, 
  User as UserIcon,
  MoreHorizontal,
  ListTodo,
  Plus,
  Trash2,
  X,
  Save,
  Database,
  Briefcase,
  DollarSign,
  MessageSquare,
  Send
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_USERS, MOCK_COMPANIES, MOCK_CONTACTS, MOCK_DOCUMENTS, MOCK_TASKS, MOCK_DEALS, CURRENT_USER } from '../constants';
import { ProjectStatus, Task, Deal, DealStage, Project, Contact } from '../types';
import { useCustomFields } from '../contexts/CustomFieldsContext';
import { CustomFieldInputs } from '../components/CustomFieldInputs';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Initial Data Loading
  const initialProject = MOCK_PROJECTS.find(p => p.id === id);
  
  // State
  const [project, setProject] = useState<Project | undefined>(initialProject);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'resources' | 'discussion'>('overview');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS.filter(t => t.projectId === id));
  const [allDeals, setAllDeals] = useState<Deal[]>(MOCK_DEALS); // Local state for deals to allow adding
  
  // Discussion State
  const [comments, setComments] = useState([
    { id: 1, userId: 'u2', text: "I've uploaded the initial requirements doc to the Resources tab.", time: '2 days ago' },
    { id: 2, userId: 'u1', text: "Thanks Sarah. I'll review the specs by EOD.", time: '2 days ago' },
    { id: 3, userId: 'u3', text: "Can we schedule a sync for Friday to discuss the timeline?", time: 'Yesterday' }
  ]);
  const [newComment, setNewComment] = useState("");

  // Modals & Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  // Custom Fields Context
  const { getFieldsByEntity } = useCustomFields();
  const customFieldDefs = getFieldsByEntity('project');

  if (!project) {
    return <div className="text-center py-10">Project not found</div>;
  }

  // Derived Data
  const manager = MOCK_USERS.find(u => u.id === project.managerId);
  const team = MOCK_USERS.filter(u => project.teamIds.includes(u.id));
  const companies = MOCK_COMPANIES.filter(c => project.companyIds.includes(c.id));
  const contacts = MOCK_CONTACTS.filter(c => project.contactIds.includes(c.id));
  const docs = MOCK_DOCUMENTS.filter(d => project.documentIds.includes(d.id));
  
  // Filter deals relevant to this project (via contacts)
  const projectDeals = allDeals.filter(d => contacts.some(c => c.id === d.contactId));

  // Date Logic
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Planning': return 'bg-purple-100 text-purple-700';
      case 'On Hold': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Handlers ---

  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // In a real app, delete API call here
      navigate('/projects');
    }
  };

  const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Helper to get multiple select values
    const getMulti = (name: string) => {
        const select = e.currentTarget.querySelector(`[name="${name}"]`) as HTMLSelectElement;
        return Array.from(select.selectedOptions).map(opt => opt.value);
    };

    // Process Custom Fields
    const customFields: Record<string, any> = {};
    customFieldDefs.forEach(field => {
        const val = formData.get(`custom_${field.key}`);
        if (val) customFields[field.key] = val;
    });

    const updatedProject: Project = {
      ...project,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as ProjectStatus,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      managerId: formData.get('managerId') as string,
      teamIds: getMulti('teamIds'),
      companyIds: getMulti('companyIds'),
      contactIds: getMulti('contactIds'),
      documentIds: getMulti('documentIds'),
      customFields: customFields
    };

    setProject(updatedProject);
    setIsEditProjectModalOpen(false);
  };

  const handleAddCompanyToProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyId = formData.get('companyId') as string;
    
    if (companyId && !project.companyIds.includes(companyId)) {
      setProject({
        ...project,
        companyIds: [...project.companyIds, companyId]
      });
    }
    setIsAddCompanyModalOpen(false);
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
    
    setAllDeals([...allDeals, newDeal]);
    setIsDealModalOpen(false);
    // Optionally switch to Overview tab to see the deal stats update or alert user
    setActiveTab('overview');
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
        id: `t${Date.now()}`,
        title: formData.get('title') as string,
        status: 'To Do',
        assigneeId: formData.get('assigneeId') as string,
        dueDate: formData.get('dueDate') as string,
        projectId: project.id
    };
    setTasks([...tasks, newTask]);
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if(confirm('Delete this task?')) {
        setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    setComments([...comments, {
        id: Date.now(),
        userId: CURRENT_USER.id,
        text: newComment,
        time: "Just now"
    }]);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/projects')}
        className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
               <div className="flex items-center gap-1">
                 <Calendar size={16} />
                 {project.startDate} — {project.endDate}
               </div>
               <div className="flex items-center gap-1">
                 <UserIcon size={16} />
                 Manager: <span className="text-gray-900 font-medium">{manager?.name || 'Unassigned'}</span>
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
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    <MoreHorizontal size={20} />
                </button>
                
                {isMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-sm">
                            <button 
                                onClick={() => { setIsAddCompanyModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Building2 size={16} className="text-gray-400" />
                                Add Company
                            </button>
                            <button 
                                onClick={() => { setIsEditProjectModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FileText size={16} className="text-gray-400" />
                                Edit Project
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                                onClick={() => { handleDeleteProject(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete Project
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Clock size={24} />
             </div>
             <div>
                <div className="text-sm text-gray-500">Timeline</div>
                <div className="font-semibold text-gray-900">{daysLeft > 0 ? `${daysLeft} days left` : 'Finished'}</div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle2 size={24} />
             </div>
             <div>
                <div className="text-sm text-gray-500">Completion</div>
                <div className="font-semibold text-gray-900">{project.progress}%</div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users size={24} />
             </div>
             <div>
                <div className="text-sm text-gray-500">Team Size</div>
                <div className="font-semibold text-gray-900">{team.length} Members</div>
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 space-y-6">
           {/* Tabs */}
           <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'tasks' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <ListTodo size={16} />
                Tasks ({tasks.length})
              </button>
              <button 
                onClick={() => setActiveTab('discussion')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'discussion' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <MessageSquare size={16} />
                Discussion
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Team
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resources' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Resources
              </button>
           </div>

           {activeTab === 'overview' && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                 <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
                 <p className="text-gray-600 leading-relaxed">{project.description}</p>
               </div>

               {/* Custom Fields Section */}
               {project.customFields && Object.keys(project.customFields).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <Database size={20} className="text-gray-400" />
                     Additional Information
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                      {customFieldDefs.map(def => {
                          const value = project.customFields?.[def.key];
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
                 <h3 className="font-semibold text-gray-900 mb-4">Key Stakeholders</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map(c => (
                      <Link to={`/companies/${c.id}`} key={c.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-primary-700">{c.name}</div>
                          <div className="text-xs text-gray-500">Client Company</div>
                        </div>
                      </Link>
                    ))}
                    {contacts.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.title}</div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'discussion' && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Project Discussion</h3>
                    <p className="text-xs text-gray-500">Collaborate with the team specifically on this project.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.length > 0 ? (
                        comments.map(comment => {
                            const user = MOCK_USERS.find(u => u.id === comment.userId);
                            const isMe = user?.id === CURRENT_USER.id;
                            return (
                                <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <img src={user?.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" alt={user?.name} />
                                    <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-700">{user?.name}</span>
                                            <span className="text-[10px] text-gray-400">{comment.time}</span>
                                        </div>
                                        <div className={`p-3 text-sm rounded-xl ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            {comment.text}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare size={40} className="mb-2 opacity-50" />
                            <p>No comments yet. Start the discussion!</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handlePostComment} className="flex gap-2">
                        <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button type="submit" className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
             </div>
           )}

           {activeTab === 'tasks' && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Project Tasks</h3>
                    <button 
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} />
                        Add Task
                    </button>
                </div>
                {tasks.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-32">Status</th>
                                <th className="px-6 py-3">Task</th>
                                <th className="px-6 py-3">Assignee</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasks.map(task => {
                                const assignee = team.find(u => u.id === task.assigneeId) || manager;
                                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <select 
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                                                className={`text-xs font-medium px-2 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer
                                                    ${task.status === 'Done' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                                      'bg-gray-100 text-gray-800 border-gray-200'}`}
                                            >
                                                <option value="To Do">To Do</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                            {task.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            {assignee ? (
                                                <div className="flex items-center gap-2">
                                                    {assignee.avatarUrl ? (
                                                        <img src={assignee.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                                            {assignee.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-gray-600">{assignee.name}</span>
                                                </div>
                                            ) : <span className="text-gray-400">Unassigned</span>}
                                        </td>
                                        <td className={`px-6 py-4 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                            {task.dueDate}
                                            {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Overdue</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                            <ListTodo className="text-gray-300" size={48} />
                            <p>No tasks created for this project yet.</p>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)}
                                className="text-primary-600 font-medium hover:underline"
                            >
                                Create your first task
                            </button>
                        </div>
                    </div>
                )}
             </div>
           )}

           {activeTab === 'team' && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {team.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200"/>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 capitalize">{u.role}</td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}

           {activeTab === 'resources' && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
               <div className="p-4 border-b border-gray-200">
                 <h3 className="font-semibold text-gray-900">Linked Documents</h3>
               </div>
               <div className="divide-y divide-gray-200">
                 {docs.length > 0 ? docs.map(d => (
                   <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gray-100 rounded text-gray-600">
                         <FileText size={20} />
                       </div>
                       <div>
                         <div className="font-medium text-gray-900">{d.title}</div>
                         <div className="text-xs text-gray-500">{d.size} • {d.uploadDate}</div>
                       </div>
                     </div>
                     <button className="text-primary-600 text-sm hover:underline">Download</button>
                   </div>
                 )) : (
                   <div className="p-8 text-center text-gray-500">No documents linked.</div>
                 )}
               </div>
             </div>
           )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Project Stats</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{daysLeft} Days left</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tasks</span>
                    <span className="font-medium text-gray-900">{tasks.length} ({tasks.filter(t => t.status === 'Done').length} Done)</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active Deals</span>
                    <span className="font-medium text-gray-900">{projectDeals.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stakeholders</span>
                    <span className="font-medium text-gray-900">{companies.length + contacts.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Resources</span>
                    <span className="font-medium text-gray-900">{docs.length} Files</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input 
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Update API documentation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                     <select name="assigneeId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {team.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                     <input 
                        type="date"
                        name="dueDate"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Company to Project</h2>
              <button 
                onClick={() => setIsAddCompanyModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCompanyToProject} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
                   <select name="companyId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">-- Choose Company --</option>
                      {MOCK_COMPANIES.filter(c => !project.companyIds.includes(c.id)).map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                   <p className="text-xs text-gray-500 mt-2">Only companies not already in the project are listed.</p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <button 
                      type="button"
                      onClick={() => setIsAddCompanyModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                   >
                     Add Company
                   </button>
                </div>
            </form>
          </div>
        </div>
      )}

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
                            <optgroup label="Project Contacts">
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name} ({contact.company})</option>
                                ))}
                            </optgroup>
                            <optgroup label="All Contacts">
                                {MOCK_CONTACTS.filter(c => !contacts.find(pc => pc.id === c.id)).map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name} ({contact.company})</option>
                                ))}
                            </optgroup>
                        </>
                      ) : (
                          MOCK_CONTACTS.map(contact => (
                             <option key={contact.id} value={contact.id}>{contact.name} ({contact.company})</option>
                          ))
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

      {/* Edit Project Modal */}
      {isEditProjectModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
              <button 
                onClick={() => setIsEditProjectModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProject} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={project.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select name="status" defaultValue={project.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                     <option value="Planning">Planning</option>
                     <option value="In Progress">In Progress</option>
                     <option value="On Hold">On Hold</option>
                     <option value="Completed">Completed</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date"
                      name="startDate"
                      required
                      defaultValue={project.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date"
                      name="endDate"
                      required
                      defaultValue={project.endDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={3}
                    defaultValue={project.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                   <h3 className="text-sm font-semibold text-gray-900 mb-3">Resource Allocation</h3>
                   
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                      <select name="managerId" defaultValue={project.managerId} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                         {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                      <select multiple name="teamIds" defaultValue={project.teamIds} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
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
                      <select multiple name="companyIds" defaultValue={project.companyIds} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_COMPANIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Contacts</label>
                      <select multiple name="contactIds" defaultValue={project.contactIds} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_CONTACTS.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                         ))}
                      </select>
                   </div>
                   
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Documents</label>
                      <select multiple name="documentIds" defaultValue={project.documentIds} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 text-sm">
                         {MOCK_DOCUMENTS.map(d => (
                            <option key={d.id} value={d.id}>{d.title}</option>
                         ))}
                      </select>
                   </div>
                </div>
              </div>

              {/* Custom Fields */}
              <CustomFieldInputs entityType="project" currentData={project} />

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditProjectModalOpen(false)}
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
    </div>
  );
};
