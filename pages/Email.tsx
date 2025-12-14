
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Edit3, 
  Star, 
  Paperclip, 
  Send, 
  Wand2, 
  MoreHorizontal, 
  AlertCircle, 
  Inbox, 
  Send as SendIcon, 
  Trash2, 
  X, 
  Menu, 
  ArrowLeft, 
  File as FileIcon,
  Archive,
  Reply,
  ReplyAll, 
  Forward,
  MoreVertical,
  Clock,
  ChevronDown,
  Tag,
  Filter
} from 'lucide-react';
import { generateEmailDraft } from '../services/aiService';
import { useConfig } from '../contexts/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { EmailMessage } from '../types';
import { CURRENT_USER } from '../constants';
import { RichTextEditor } from '../components/RichTextEditor';

// Mock Data Extension
const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: '1',
    senderName: "Sarah Connor",
    senderEmail: "sarah@skynet.com",
    recipientEmail: "me@opencrm.com",
    subject: "Re: Project Specifications",
    preview: "I've attached the latest specs for the T-800 exoskeleton...",
    content: `
      <p>Hi team,</p>
      <p>I've attached the latest specs for the T-800 exoskeleton. Please review the hydraulic pressure variance in the arm joints.</p>
      <p>We need sign-off by Friday.</p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 0.875rem;">On Oct 24, 2023, at 2:00 PM, Alex Developer wrote:</p>
        <blockquote style="margin-left: 0; padding-left: 1rem; border-left: 2px solid #e5e7eb; color: #6b7280;">
          Can you send over the T-800 specs? We need them for the integration meeting.
        </blockquote>
      </div>
      <p>Best,<br/>Sarah</p>
    `,
    time: "10:30 AM",
    date: new Date().toISOString().split('T')[0],
    unread: true,
    starred: true,
    folder: 'inbox',
    attachments: [{ name: 'specs_v2.pdf', size: '2.4 MB', type: 'application/pdf' }]
  },
  {
    id: '2',
    senderName: "Bruce Wayne",
    senderEmail: "bruce@wayne.com",
    recipientEmail: "me@opencrm.com",
    subject: "Meeting Confirmation",
    preview: "Can we reschedule the board meeting to next Tuesday?",
    content: `<p>Can we reschedule the board meeting to next Tuesday? Alfred needs the library for cleaning.</p>`,
    time: "Yesterday",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    unread: false,
    folder: 'inbox'
  },
  {
    id: '3',
    senderName: "Tony Stark",
    senderEmail: "tony@stark.com",
    recipientEmail: "me@opencrm.com",
    subject: "Arc Reactor Shipment",
    preview: "The palladium cores are on their way. ETA 2 days.",
    content: `<p>The palladium cores are on their way. ETA 2 days. Don't let them overheat this time.</p><p>- Tony</p>`,
    time: "Oct 25",
    date: "2023-10-25",
    unread: false,
    folder: 'inbox'
  },
  {
    id: '4',
    senderName: "Pepper Potts",
    senderEmail: "pepper@stark.com",
    recipientEmail: "me@opencrm.com",
    subject: "Invoice #INV-2023-002 Pending",
    preview: "Just a reminder that the invoice for the reactor cores is due.",
    content: `<p>Hi,</p><p>Just a reminder that the invoice for the reactor cores is due next week. Please process payment at your earliest convenience.</p><p>Thanks,<br>Pepper</p>`,
    time: "Oct 24",
    date: "2023-10-24",
    unread: true,
    folder: 'inbox'
  }
];

export const Email: React.FC = () => {
  const { config } = useConfig();
  const navigate = useNavigate();
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Compose State
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Computed
  const filteredEmails = emails
    .filter(e => e.folder === selectedFolder)
    .filter(e => 
      e.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const unreadCount = emails.filter(e => e.folder === 'inbox' && e.unread).length;
  const hasSmtpConfig = config.smtpHost && config.smtpUser;

  // --- Handlers ---

  const handleEmailSelect = (id: string) => {
    setSelectedEmailId(id);
    // Mark as read
    setEmails(prev => prev.map(e => e.id === id ? { ...e, unread: false } : e));
    setReplyText(''); // Clear previous reply draft
  };

  const toggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails(prev => prev.map(email => email.id === id ? { ...email, starred: !email.starred } : email));
  };

  const handleHeaderReply = () => {
    // Focus the reply textarea
    replyTextareaRef.current?.focus();
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    
    setTo('');
    setSubject(`Fwd: ${selectedEmail.subject}`);
    
    const forwardContent = `
      <p></p>
      <br>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 0.875rem;">---------- Forwarded message ---------</p>
        <p style="color: #6b7280; font-size: 0.875rem;">
          From: <strong>${selectedEmail.senderName}</strong> &lt;${selectedEmail.senderEmail}&gt;<br>
          Date: ${selectedEmail.date} at ${selectedEmail.time}<br>
          Subject: ${selectedEmail.subject}<br>
          To: ${selectedEmail.recipientEmail}
        </p>
        <br>
        ${selectedEmail.content}
      </div>
    `;
    
    setBody(forwardContent);
    setAttachments([]); // Start with no attachments for forward (files not available in mock)
    setIsComposeOpen(true);
  };

  const handleAIDraft = async () => {
    if (!selectedEmail) return;
    setIsDrafting(true);
    const draft = await generateEmailDraft(
      selectedEmail.senderName, 
      "Agreeing to the content, professional tone, keeping it brief."
    );
    setReplyText(draft);
    setIsDrafting(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSmtpConfig) {
        if (confirm("SMTP Settings are missing. Configure them now?")) navigate('/settings');
        return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEmail: EmailMessage = {
        id: `e${Date.now()}`,
        senderName: CURRENT_USER.name,
        senderEmail: CURRENT_USER.email,
        recipientEmail: to,
        subject: subject,
        preview: body.replace(/<[^>]+>/g, '').slice(0, 50) + '...',
        content: body,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        unread: false,
        folder: 'sent',
        attachments: attachments.map(f => ({ name: f.name, size: '10KB', type: f.type }))
    };

    setEmails([newEmail, ...emails]);
    setIsSending(false);
    setIsComposeOpen(false);
    resetComposeForm();
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedEmail) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reply: EmailMessage = {
        id: `r${Date.now()}`,
        senderName: CURRENT_USER.name,
        senderEmail: CURRENT_USER.email,
        recipientEmail: selectedEmail.senderEmail,
        subject: `Re: ${selectedEmail.subject}`,
        preview: replyText.slice(0, 50),
        content: replyText,
        time: "Now",
        date: new Date().toISOString().split('T')[0],
        unread: false,
        folder: 'sent'
    };
    
    setEmails([reply, ...emails]);
    setReplyText('');
    setIsSending(false);
  };

  const deleteEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Move to trash?")) {
        setEmails(prev => prev.map(email => email.id === id ? { ...email, folder: 'trash' } : email));
        if (selectedEmailId === id) setSelectedEmailId(null);
    }
  };

  const resetComposeForm = () => {
    setTo('');
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  // --- Components ---

  const NavItem = ({ id, label, icon: Icon, count, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1
        ${selectedFolder === id 
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      {count > 0 && (
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (Navigation) */}
      <div className={`
        flex-shrink-0 w-64 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col
        ${mobileMenuOpen ? 'absolute inset-y-0 left-0 z-50 shadow-xl' : 'hidden md:flex'}
      `}>
        <div className="p-4">
          <button 
            onClick={() => { setIsComposeOpen(true); setMobileMenuOpen(false); }}
            className="w-full bg-gray-900 dark:bg-primary-600 hover:bg-gray-800 dark:hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Edit3 size={16} />
            New Message
          </button>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</p>
            <NavItem id="inbox" label="Inbox" icon={Inbox} count={unreadCount} onClick={() => { setSelectedFolder('inbox'); setMobileMenuOpen(false); }} />
            <NavItem id="sent" label="Sent" icon={SendIcon} count={0} onClick={() => { setSelectedFolder('sent'); setMobileMenuOpen(false); }} />
            <NavItem id="drafts" label="Drafts" icon={FileIcon} count={0} onClick={() => { setSelectedFolder('drafts'); setMobileMenuOpen(false); }} />
            <NavItem id="trash" label="Trash" icon={Trash2} count={0} onClick={() => { setSelectedFolder('trash'); setMobileMenuOpen(false); }} />
          </div>

          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Labels</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Tag size={16} className="text-red-500" /> Important
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Tag size={16} className="text-blue-500" /> Work
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Tag size={16} className="text-green-500" /> Personal
            </button>
          </div>
        </nav>

        {/* Mobile Close Button */}
        {mobileMenuOpen && (
            <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg md:hidden"
            >
                <X size={20} />
            </button>
        )}
      </div>

      {/* 2. MIDDLE PANE (Message List) */}
      <div className={`
        flex-col border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface w-full md:w-80 lg:w-96
        ${selectedEmailId ? 'hidden lg:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between flex-shrink-0 gap-2">
           <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-500">
              <Menu size={20} />
           </button>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedFolder}</h2>
           <div className="flex gap-1">
              <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Filter size={18} /></button>
           </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search mail..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Inbox size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">No messages found</p>
                </div>
            ) : (
                filteredEmails.map(email => (
                    <div 
                        key={email.id}
                        onClick={() => handleEmailSelect(email.id)}
                        className={`group relative p-4 border-b border-gray-100 dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                            ${selectedEmailId === email.id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {email.unread && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>}
                                <span className={`text-sm truncate ${email.unread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {email.senderName}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{email.time}</span>
                        </div>
                        <h4 className={`text-sm mb-1 truncate ${email.unread ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                            {email.subject}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                            {email.preview}
                        </p>
                        {email.starred && <Star size={12} className="absolute bottom-4 right-4 text-yellow-400 fill-yellow-400" />}

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex bg-white dark:bg-dark-surface shadow-sm border border-gray-200 dark:border-dark-border rounded-lg p-1">
                            <button onClick={(e) => deleteEmail(email.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                <Trash2 size={14} />
                            </button>
                            <button onClick={(e) => toggleStar(email.id, e)} className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded">
                                <Star size={14} className={email.starred ? "fill-yellow-400 text-yellow-400" : ""} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* 3. RIGHT PANE (Reading View) */}
      <div className={`
        flex-1 flex-col bg-white dark:bg-dark-surface relative
        ${!selectedEmailId ? 'hidden lg:flex' : 'flex'}
      `}>
        {selectedEmail ? (
            <>
                {/* Email Header Actions */}
                <div className="h-16 px-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedEmailId(null)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => deleteEmail(selectedEmail.id)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Archive">
                                <Archive size={18} />
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Mark Unread">
                                <Inbox size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 hidden sm:inline">1 of {filteredEmails.length}</span>
                        <div className="flex border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                            <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 border-r border-gray-200 dark:border-dark-border text-gray-500"><ChevronDown className="rotate-180" size={16} /></button>
                            <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"><ChevronDown size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Subject Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{selectedEmail.subject}</h1>
                            <div className="flex gap-2">
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-medium">Inbox</span>
                            </div>
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {selectedEmail.senderName.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{selectedEmail.senderName}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">&lt;{selectedEmail.senderEmail}&gt;</span>
                                    </div>
                                    <div className="text-xs text-gray-400">To: {selectedEmail.recipientEmail}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{selectedEmail.date}, {selectedEmail.time}</div>
                                <div className="flex justify-end gap-2 mt-1">
                                    <button 
                                      onClick={(e) => toggleStar(selectedEmail.id, e)}
                                      className={`text-gray-400 hover:text-gray-600 p-1 rounded ${selectedEmail.starred ? "text-yellow-400 hover:text-yellow-500" : ""}`}
                                    >
                                      <Star size={16} className={selectedEmail.starred ? "fill-yellow-400" : ""} />
                                    </button>
                                    <button 
                                      onClick={handleHeaderReply}
                                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                      title="Reply"
                                    >
                                      <Reply size={16} />
                                    </button>
                                    <button 
                                      onClick={handleForward}
                                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                      title="Forward"
                                    >
                                      <Forward size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
                    </div>

                    {/* Attachments */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Paperclip size={14} /> {selectedEmail.attachments.length} Attachments
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {selectedEmail.attachments.map((att, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-xl hover:border-primary-300 transition-colors cursor-pointer min-w-[200px]">
                                        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg text-red-500 shadow-sm">
                                            <FileIcon size={20} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{att.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{att.size}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reply Section */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-dark-border">
                    {!hasSmtpConfig && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200 flex items-center gap-2">
                            <AlertCircle size={14} /> SMTP not configured. Replies will be simulated.
                        </div>
                    )}
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 transition-shadow">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                            <div className="flex gap-4">
                                <button className="text-sm font-medium text-gray-900 dark:text-white border-b-2 border-primary-500 pb-2 -mb-2.5">Reply</button>
                                <button 
                                    onClick={handleForward}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                >
                                    Forward
                                </button>
                            </div>
                            <button 
                                onClick={handleAIDraft}
                                disabled={isDrafting}
                                className="text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
                            >
                                <Wand2 size={12} />
                                {isDrafting ? 'Generating...' : 'AI Draft'}
                            </button>
                        </div>
                        <textarea 
                            ref={replyTextareaRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${selectedEmail.senderName}...`}
                            className="w-full p-4 min-h-[120px] resize-none focus:outline-none dark:bg-dark-surface dark:text-white text-sm"
                        />
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-bg/50 border-t border-gray-100 dark:border-dark-border">
                            <div className="flex gap-1">
                                <button className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Paperclip size={18} /></button>
                                <button className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><MoreHorizontal size={18} /></button>
                            </div>
                            <button 
                                onClick={handleReply}
                                disabled={isSending || !replyText.trim()}
                                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                            >
                                {isSending ? 'Sending...' : 'Send'} <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 select-none">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Inbox size={48} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400">No message selected</h3>
                <p className="text-gray-500 dark:text-gray-500 max-w-xs text-center mt-2">Choose an email from the list to view its contents, or start a new conversation.</p>
            </div>
        )}
      </div>

      {/* --- COMPOSE MODAL --- */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50 dark:bg-dark-bg">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Message</h3>
                  <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
                 <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                     <div className="grid gap-4">
                        <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-2">
                            <label className="w-16 text-sm font-medium text-gray-500">To:</label>
                            <input 
                                placeholder="recipient@example.com"
                                type="email"
                                required={!to} // Required if empty, allows draft saving logic if needed
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-300"
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-2">
                            <label className="w-16 text-sm font-medium text-gray-500">Subject:</label>
                            <input 
                                placeholder="Enter subject"
                                required
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-300"
                            />
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col min-h-[300px]">
                        <RichTextEditor 
                            value={body}
                            onChange={setBody}
                            placeholder="Write your message here..."
                            className="flex-1 border-0 shadow-none focus-within:ring-0"
                        />
                     </div>
                 </div>
                 
                 <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                     <div className="flex gap-2">
                        <button type="button" className="p-2 text-gray-500 hover:bg-white dark:hover:bg-dark-surface hover:text-primary-600 rounded-lg transition-all" title="Attach File">
                            <Paperclip size={18} />
                        </button>
                        <button type="button" className="p-2 text-gray-500 hover:bg-white dark:hover:bg-dark-surface hover:text-red-600 rounded-lg transition-all" title="Discard">
                            <Trash2 size={18} />
                        </button>
                     </div>
                     <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsComposeOpen(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSending || !to || !subject}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                        >
                            {isSending ? 'Sending...' : 'Send'} <Send size={16} />
                        </button>
                     </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
