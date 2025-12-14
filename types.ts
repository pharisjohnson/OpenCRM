
export enum DealStage {
  NEW = 'New',
  QUALIFIED = 'Qualified',
  NEGOTIATION = 'Negotiation',
  WON = 'Won',
  LOST = 'Lost'
}

export enum ContactStatus {
  LEAD = 'Lead',
  CUSTOMER = 'Customer',
  CHURNED = 'Churned'
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

export type CustomFieldType = 'text' | 'number' | 'date' | 'email' | 'password' | 'tel' | 'url';

export interface CustomFieldDefinition {
  id: string;
  entityType: 'contact' | 'company' | 'deal' | 'project' | 'finance';
  label: string;
  key: string;
  type: CustomFieldType;
  required: boolean;
}

export interface AppConfig {
  appName: string;
  primaryColor: string; // Hex code
  fontFamily: 'Inter' | 'Roboto' | 'Open Sans';
  logoUrl?: string; // Optional custom URL
  storageType: 'local' | 'supabase' | 'google_drive';
  supabaseUrl?: string;
  supabaseKey?: string;
  googleDriveClientId?: string;
  googleDriveApiKey?: string;
  // SMTP Settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  // Invoice Customization
  invoiceLogoUrl?: string;
  invoiceTemplate?: 'classic' | 'minimal';
  invoiceFooter?: string;
  defaultPaymentDetails?: string;
  // Theme
  darkMode?: boolean;
  // AI Settings
  aiProvider: 'gemini' | 'puter';
  geminiApiKey?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  address: string;
  employeeCount: string;
  annualRevenue?: string;
  logoUrl?: string;
  description?: string;
  customFields?: Record<string, any>;
  kraPin?: string;
}

export interface Contact {
  id: string;
  name: string;
  title?: string;
  email: string;
  phone: string;
  company: string;
  companyId?: string; 
  status: ContactStatus;
  lastContacted: string;
  tags: string[];
  ownerId: string;
  customFields?: Record<string, any>;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  contactId: string;
  expectedCloseDate: string;
  probability: number;
  customFields?: Record<string, any>;
}

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  title: string;
  content: string;
  date: string;
  userId: string;
  contactId?: string;
  companyId?: string;
  projectId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  category: 'client' | 'internal';
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  companyId: string;
  url: string;
  access?: 'granted' | 'denied' | 'pending';
}

export interface SecureCredential {
  id: string;
  title: string;
  value: string;
  type: 'tax_id' | 'login' | 'api_key' | 'other';
  entityId?: string; // Optional link to company/contact
  lastUpdated: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  managerId: string;
  teamIds: string[];
  companyIds: string[];
  contactIds: string[];
  documentIds: string[]; // Linked documents
  customFields?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assigneeId: string;
  dueDate: string;
  projectId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  channel: string; // e.g., 'general', 'announcements', or 'dm_u2'
  isSystem?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  type: 'meeting' | 'reminder' | 'task';
  description?: string;
  completed?: boolean; // For tasks
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
  link?: string; // URL path to navigate to when clicked
}

export interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string; // 'Me' if incoming
  subject: string;
  preview: string;
  content: string; // HTML or Text
  time: string;
  date: string;
  unread: boolean;
  starred?: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  attachments?: { name: string; size: string; type: string }[];
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'New' | 'In Progress' | 'Waiting' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdById: string; // Internal User ID who created the ticket
  contactId?: string; // Optional link to external contact
  assignedTo?: string; // User ID
  createdAt: string;
  tags?: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface FinanceDocument {
  id: string;
  number: string; // e.g. INV-2023-001
  type: 'Invoice' | 'Quote';
  category?: 'Service' | 'Product';
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Accepted' | 'Rejected';
  contactId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  notes?: string;
  lsoNumber?: string;
  legalEntityId?: string; // PIN No
  paymentDetails?: string;
  customFields?: Record<string, any>;
}
