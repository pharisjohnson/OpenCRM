

import { Contact, Deal, DealStage, ContactStatus, User, Company, Activity, Document, Project, Task, SecureCredential, ChatMessage, CalendarEvent, Notification } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Developer',
  email: 'alex@opencrm.com',
  role: 'admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Developer&background=0ea5e9&color=fff'
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    name: 'Sarah Connor',
    email: 'sarah@skynet.com',
    role: 'user',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=random'
  },
  {
    id: 'u3',
    name: 'Bruce Wayne',
    email: 'bruce@wayne.com',
    role: 'user',
    avatarUrl: 'https://ui-avatars.com/api/?name=Bruce+Wayne&background=000&color=fff'
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'co1',
    name: 'TechNoir',
    domain: 'technoir.ai',
    industry: 'Robotics & AI',
    address: '1029 Pico Blvd, Los Angeles, CA',
    employeeCount: '50-100',
    annualRevenue: '$50M',
    description: 'Leading manufacturer of autonomous cybernetic organisms and defense systems.',
    logoUrl: 'https://ui-avatars.com/api/?name=TN&background=333&color=fff'
  },
  {
    id: 'co2',
    name: 'Wayne Enterprises',
    domain: 'wayneenterprises.com',
    industry: 'Conglomerate',
    address: '1007 Mountain Drive, Gotham',
    employeeCount: '10,000+',
    annualRevenue: '$120B',
    description: 'Multinational conglomerate focused on defense, energy, and technology sectors.',
    logoUrl: 'https://ui-avatars.com/api/?name=WE&background=111&color=fff'
  },
  {
    id: 'co3',
    name: 'Stark Industries',
    domain: 'stark.com',
    industry: 'Defense & Energy',
    address: '890 Fifth Avenue, New York, NY',
    employeeCount: '5,000+',
    annualRevenue: '$85B',
    description: 'Premier clean energy and advanced weapons manufacturer.',
    logoUrl: 'https://ui-avatars.com/api/?name=SI&background=f00&color=fff'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Sarah Connor',
    title: 'Chief Operations Officer',
    email: 'sarah@skynet.com',
    phone: '+1 555 0199',
    company: 'TechNoir',
    companyId: 'co1',
    status: ContactStatus.LEAD,
    lastContacted: '2023-10-25',
    tags: ['VIP', 'Urgent'],
    ownerId: 'u1'
  },
  {
    id: 'c2',
    name: 'Bruce Wayne',
    title: 'CEO',
    email: 'bruce@wayneenterprises.com',
    phone: '+1 555 0123',
    company: 'Wayne Ent.',
    companyId: 'co2',
    status: ContactStatus.CUSTOMER,
    lastContacted: '2023-10-20',
    tags: ['Enterprise', 'Tech'],
    ownerId: 'u1'
  },
  {
    id: 'c3',
    name: 'Tony Stark',
    title: 'CTO & Founder',
    email: 'tony@stark.com',
    phone: '+1 555 9999',
    company: 'Stark Ind.',
    companyId: 'co3',
    status: ContactStatus.LEAD,
    lastContacted: '2023-10-27',
    tags: ['Defense', 'High Value'],
    ownerId: 'u1'
  }
];

export const MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    title: 'Cyberdyne Systems Contract',
    value: 150000,
    stage: DealStage.NEGOTIATION,
    contactId: 'c1',
    expectedCloseDate: '2023-12-01',
    probability: 75
  },
  {
    id: 'd2',
    title: 'Batmobile Retrofit',
    value: 500000,
    stage: DealStage.QUALIFIED,
    contactId: 'c2',
    expectedCloseDate: '2024-01-15',
    probability: 40
  },
  {
    id: 'd3',
    title: 'Arc Reactor Supply',
    value: 1200000,
    stage: DealStage.NEW,
    contactId: 'c3',
    expectedCloseDate: '2024-02-20',
    probability: 20
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'email',
    title: 'Proposal Sent',
    content: 'Sent the initial draft of the T-800 specifications.',
    date: '2023-10-25',
    userId: 'u1',
    contactId: 'c1',
    companyId: 'co1'
  },
  {
    id: 'a2',
    type: 'meeting',
    title: 'Quarterly Review',
    content: 'Met with Bruce to discuss R&D budget allocation.',
    date: '2023-10-20',
    userId: 'u1',
    contactId: 'c2',
    companyId: 'co2'
  },
  {
    id: 'a3',
    type: 'call',
    title: 'Intro Call',
    content: 'Initial discovery call regarding clean energy initiative.',
    date: '2023-10-27',
    userId: 'u1',
    contactId: 'c3',
    companyId: 'co3'
  },
  {
    id: 'a4',
    type: 'note',
    title: 'Internal Memo',
    content: 'Remember to check NDA status before sending blueprints.',
    date: '2023-10-26',
    userId: 'u1',
    contactId: 'c1',
    companyId: 'co1'
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    title: 'Service Agreement 2023',
    category: 'client',
    type: 'pdf',
    size: '2.4 MB',
    uploadDate: '2023-09-15',
    uploadedBy: 'Alex Developer',
    companyId: 'co1',
    url: '#'
  },
  {
    id: 'doc2',
    title: 'Incorporation Cert',
    category: 'client',
    type: 'pdf',
    size: '1.1 MB',
    uploadDate: '2023-01-10',
    uploadedBy: 'Alex Developer',
    companyId: 'co1',
    url: '#'
  },
  {
    id: 'doc3',
    title: 'Internal Risk Assessment',
    category: 'internal',
    type: 'doc',
    size: '450 KB',
    uploadDate: '2023-10-01',
    uploadedBy: 'Alex Developer',
    companyId: 'co1',
    url: '#'
  },
  {
    id: 'doc4',
    title: 'Wayne Ent NDA',
    category: 'client',
    type: 'pdf',
    size: '3.2 MB',
    uploadDate: '2023-08-20',
    uploadedBy: 'Bruce Wayne',
    companyId: 'co2',
    url: '#'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'T-800 Integration Rollout',
    description: 'Global rollout of the new T-800 operating system across all Cyberdyne facilities. Requires coordination with defense contracts.',
    status: 'In Progress',
    startDate: '2023-09-01',
    endDate: '2024-03-31',
    progress: 45,
    managerId: 'u1',
    teamIds: ['u1', 'u2'],
    companyIds: ['co1'],
    contactIds: ['c1'],
    documentIds: ['doc1', 'doc2']
  },
  {
    id: 'p2',
    name: 'Gotham Clean Energy Grid',
    description: 'Replacing legacy coal power with Arc Reactor technology in downtown Gotham. High visibility project.',
    status: 'Planning',
    startDate: '2024-01-15',
    endDate: '2025-06-01',
    progress: 10,
    managerId: 'u3',
    teamIds: ['u1', 'u3'],
    companyIds: ['co2', 'co3'],
    contactIds: ['c2', 'c3'],
    documentIds: ['doc4']
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Define system architecture requirements',
    status: 'Done',
    assigneeId: 'u1',
    dueDate: '2023-09-15',
    projectId: 'p1'
  },
  {
    id: 't2',
    title: 'Conduct security audit on T-800 firmware',
    status: 'In Progress',
    assigneeId: 'u2',
    dueDate: '2023-10-30',
    projectId: 'p1'
  },
  {
    id: 't3',
    title: 'Draft initial site survey report for Gotham',
    status: 'To Do',
    assigneeId: 'u3',
    dueDate: '2024-02-01',
    projectId: 'p2'
  }
];

export const MOCK_CREDENTIALS: SecureCredential[] = [
  {
    id: 'sc1',
    title: 'TechNoir KRA PIN',
    value: 'P051399822Z',
    type: 'tax_id',
    entityId: 'co1',
    lastUpdated: '2023-10-01'
  },
  {
    id: 'sc2',
    title: 'Sarah Connor Tax ID',
    value: 'TX-9982-A',
    type: 'tax_id',
    entityId: 'c1',
    lastUpdated: '2023-09-15'
  },
  {
    id: 'sc3',
    title: 'Wayne Ent Corporate Login',
    value: 'bruce_admin / batsignal123',
    type: 'login',
    entityId: 'co2',
    lastUpdated: '2023-11-01'
  },
  {
    id: 'sc4',
    title: 'Stark Industries API Key',
    value: 'sk_live_998877665544332211',
    type: 'api_key',
    entityId: 'co3',
    lastUpdated: '2023-10-28'
  }
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u2',
    content: 'Has anyone seen the new T-800 specs?',
    timestamp: '10:30 AM',
    channel: 'general'
  },
  {
    id: 'm2',
    senderId: 'u1',
    content: 'Yes, I uploaded them to the Documents vault yesterday.',
    timestamp: '10:32 AM',
    channel: 'general'
  },
  {
    id: 'm3',
    senderId: 'u3',
    content: 'Meeting in the conference room in 5 mins.',
    timestamp: '11:00 AM',
    channel: 'announcements'
  },
  {
    id: 'm4',
    senderId: 'u2',
    content: 'Hey, are you free for a quick call?',
    timestamp: '09:15 AM',
    channel: 'dm_u1'
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Q4 Strategy Meeting',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '14:00',
    type: 'meeting',
    description: 'Discussing end of year targets.'
  },
  {
    id: 'e2',
    title: 'Follow up with Sarah',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    type: 'reminder',
  },
  {
    id: 'e3',
    title: 'Submit Tax Report',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
    type: 'task',
    completed: false
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New Deal Assigned',
    message: 'You have been assigned to the "Stark Industries Supply" deal.',
    time: '2 hours ago',
    read: false,
    type: 'info'
  },
  {
    id: 'n2',
    title: 'Meeting Reminder',
    message: 'Q4 Strategy Meeting starts in 30 minutes.',
    time: '13:30',
    read: false,
    type: 'alert'
  },
  {
    id: 'n3',
    title: 'Task Completed',
    message: 'Sarah marked "Update Firmware" as done.',
    time: 'Yesterday',
    read: true,
    type: 'success'
  }
];