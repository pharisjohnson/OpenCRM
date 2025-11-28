

import React, { useState } from 'react';
import { Search, Edit3, Star, Paperclip, Send, Wand2, MoreHorizontal, AlertCircle, Settings, Inbox, Send as SendIcon, Trash2, X } from 'lucide-react';
import { generateEmailDraft } from '../services/geminiService';
import { useConfig } from '../contexts/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { EmailMessage } from '../types';
import { CURRENT_USER } from '../constants';

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
      <p>Best,<br/>Sarah</p>
    `,
    time: "10:30 AM",
    date: new Date().toISOString().split('T')[0],
    unread: true,
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
];

export const Email: React.FC = () => {
  const { config } = useConfig();
  const navigate = useNavigate();
  
  // State
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('1');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Compose State
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Derived State
  const filteredEmails = emails.filter(e => e.folder === selectedFolder);
  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const hasSmtpConfig = config.smtpHost && config.smtpUser;

  const handleAIDraft = async () => {
    if (!selectedEmail) return;
    setIsDrafting(true);
    const draft = await generateEmailDraft(
      selectedEmail.senderName, 
      "Agreeing to the specs, asking about delivery timeline, mentioning security protocols."
    );
    setReplyText(draft);
    setIsDrafting(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasSmtpConfig) {
        if (confirm("SMTP Settings are missing. Configure them now?")) {
            navigate('/settings');
        }
        return;
    }

    setIsSending(true);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newEmail: EmailMessage = {
        id: `e${Date.now()}`,
        senderName: CURRENT_USER.name,
        senderEmail: CURRENT_USER.email,
        recipientEmail: to,
        subject: subject,
        preview: body.slice(0, 50) + '...',
        content: body,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        unread: false,
        folder: 'sent'
    };

    setEmails([newEmail, ...emails]);
    setIsSending(false);
    setIsComposeOpen(false);
    setTo('');
    setSubject('');
    setBody('');
    alert("Email sent successfully!");
  };

  const handleSendReply = async () => {
    if (!hasSmtpConfig) {
        if (confirm("SMTP Settings are missing. Configure them now?")) {
            navigate('/settings');
        }
        return;
    }

    if (!replyText.trim()) return;
    setIsSending(true);
    
    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const replyEmail: EmailMessage = {
        id: `e${Date.now()}`,
        senderName: CURRENT_USER.name,
        senderEmail: CURRENT_USER.email,
        recipientEmail: selectedEmail?.senderEmail || '',
        subject: `Re: ${selectedEmail?.subject}`,
        preview: replyText.slice(0, 50) + '...',
        content: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        unread: false,
        folder: 'sent'
    };
    
    setEmails([replyEmail, ...emails]);
    setReplyText('');
    setIsSending(false);
    alert("Reply sent!");
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-48 border-r border-gray-200 bg-gray-50 flex flex-col pt-4">
         <div className="px-4 mb-4">
             <button 
                onClick={() => setIsComposeOpen(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
             >
                <Edit3 size={18} />
                Compose
             </button>
         </div>
         <nav className="space-y-1 px-2">
            <button 
                onClick={() => { setSelectedFolder('inbox'); setSelectedEmailId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFolder === 'inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-3">
                    <Inbox size={18} />
                    Inbox
                </div>
                {emails.filter(e => e.folder === 'inbox' && e.unread).length > 0 && (
                    <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {emails.filter(e => e.folder === 'inbox' && e.unread).length}
                    </span>
                )}
            </button>
            <button 
                onClick={() => { setSelectedFolder('sent'); setSelectedEmailId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFolder === 'sent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <SendIcon size={18} />
                Sent
            </button>
            <button 
                onClick={() => { setSelectedFolder('drafts'); setSelectedEmailId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFolder === 'drafts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Edit3 size={18} />
                Drafts
            </button>
         </nav>
      </div>

      {/* List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length > 0 ? filteredEmails.map(email => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmailId === email.id ? 'bg-primary-50' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className={`text-sm truncate pr-2 ${email.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {email.folder === 'sent' ? `To: ${email.recipientEmail}` : email.senderName}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{email.time}</span>
              </div>
              <div className={`text-sm mb-1 truncate ${email.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                {email.subject}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {email.preview}
              </div>
            </div>
          )) : (
             <div className="p-8 text-center text-gray-400 text-sm">
                 {selectedFolder === 'inbox' ? 'Inbox is empty' : 'No messages'}
             </div>
          )}
        </div>
      </div>

      {/* Email Viewer */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    {selectedEmail.senderName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                        {selectedEmail.senderName} <span className="text-gray-500 font-normal">&lt;{selectedEmail.senderEmail}&gt;</span>
                    </div>
                    <div className="text-xs text-gray-500">To: {selectedEmail.recipientEmail}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Star size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!hasSmtpConfig && (
                 <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-amber-600" size={20} />
                        <div>
                            <p className="text-sm font-medium text-amber-900">SMTP Not Configured</p>
                            <p className="text-xs text-amber-700">You cannot send emails until you configure the SMTP server.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/settings')}
                        className="text-amber-700 hover:text-amber-900 text-sm font-medium flex items-center gap-1"
                    >
                        <Settings size={14} /> Configure
                    </button>
                 </div>
              )}

              <div 
                className="prose text-gray-800 text-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />
              
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                 <div className="mt-8 space-y-2">
                    {selectedEmail.attachments.map((att, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded text-red-600">
                                    <Paperclip size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{att.name}</span>
                                <span className="text-xs text-gray-500">({att.size})</span>
                            </div>
                            <a href="#" className="text-xs text-primary-600 hover:underline">Download</a>
                        </div>
                    ))}
                 </div>
              )}
            </div>

            {selectedFolder === 'inbox' && (
                <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Reply</span>
                    <button 
                        onClick={handleAIDraft}
                        disabled={isDrafting}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                    >
                        <Wand2 size={12} />
                        {isDrafting ? 'Generating...' : 'Draft with AI'}
                    </button>
                    </div>
                    <textarea 
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end mt-2 gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <Paperclip size={20} />
                    </button>
                    <button 
                        onClick={handleSendReply}
                        disabled={isSending || !replyText.trim()}
                        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Send size={16} />
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                    </div>
                </div>
                </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <Inbox size={48} className="mb-4 text-gray-300" />
             <p>Select a thread to view</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h3 className="font-bold text-gray-900">New Message</h3>
                  <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                  </button>
              </div>
              
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
                 <div className="p-4 space-y-4">
                     <div>
                        <input 
                            placeholder="To: recipient@example.com"
                            type="email"
                            required
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none focus:border-primary-500 text-sm"
                        />
                     </div>
                     <div>
                        <input 
                            placeholder="Subject"
                            required
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none focus:border-primary-500 text-sm font-medium"
                        />
                     </div>
                     <textarea 
                        className="w-full flex-1 p-3 text-sm focus:outline-none resize-none min-h-[300px]"
                        placeholder="Write your message here..."
                        value={body}
                        onChange={e => setBody(e.target.value)}
                     ></textarea>
                 </div>
                 
                 <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                     <div className="flex gap-2">
                        <button type="button" className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"><Paperclip size={18} /></button>
                        <button type="button" className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"><Trash2 size={18} /></button>
                     </div>
                     <button 
                        type="submit"
                        disabled={isSending || !to || !subject}
                        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                     >
                        <Send size={16} />
                        {isSending ? 'Sending...' : 'Send'}
                     </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};