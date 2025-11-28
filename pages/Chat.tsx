
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Hash, 
  User as UserIcon, 
  MoreVertical, 
  Search,
  Bell,
  MessageCircle,
  Users
} from 'lucide-react';
import { MOCK_MESSAGES, MOCK_USERS, CURRENT_USER } from '../constants';
import { ChatMessage, User } from '../types';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeDmUser, setActiveDmUser] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', name: 'General', type: 'public' },
    { id: 'announcements', name: 'Announcements', type: 'public' },
    { id: 'random', name: 'Random', type: 'public' },
  ];

  const filteredMessages = messages.filter(m => {
     if (activeDmUser) {
        // Show messages where current user is sender AND target is receiver OR vice versa
        // NOTE: For this simple mock, we use a channel ID convention 'dm_{userId}' 
        return m.channel === `dm_${activeDmUser}` || (m.senderId === activeDmUser && m.channel === `dm_${CURRENT_USER.id}`);
     }
     return m.channel === activeChannel;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: CURRENT_USER.id,
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: activeDmUser ? `dm_${activeDmUser}` : activeChannel
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const getUser = (id: string) => MOCK_USERS.find(u => u.id === id);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle size={20} className="text-primary-600" />
            Team Chat
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Channels</h3>
            <div className="space-y-1">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => { setActiveChannel(channel.id); setActiveDmUser(null); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
                    ${activeChannel === channel.id && !activeDmUser ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
                >
                  <Hash size={16} className={activeChannel === channel.id && !activeDmUser ? 'text-primary-600' : 'text-gray-400'} />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Direct Messages</h3>
            <div className="space-y-1">
              {MOCK_USERS.filter(u => u.id !== CURRENT_USER.id).map(user => (
                <button
                  key={user.id}
                  onClick={() => { setActiveDmUser(user.id); setActiveChannel(''); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
                    ${activeDmUser === user.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
                >
                  <div className="relative">
                     {user.avatarUrl ? (
                         <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                     ) : (
                         <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600">
                             {user.name.charAt(0)}
                         </div>
                     )}
                     <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  {user.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
           <div className="flex items-center gap-2">
              {activeDmUser ? (
                 <>
                   <span className="font-bold text-gray-900">@{getUser(activeDmUser)?.name}</span>
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 </>
              ) : (
                 <>
                   <Hash size={20} className="text-gray-400" />
                   <span className="font-bold text-gray-900 capitalize">{activeChannel}</span>
                   <span className="text-xs text-gray-500 ml-2">Team Notice Board</span>
                 </>
              )}
           </div>
           <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input className="pl-8 pr-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Search messages" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                 <Bell size={18} />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                 <MoreVertical size={18} />
              </button>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
           {filteredMessages.map((msg, idx) => {
              const isMe = msg.senderId === CURRENT_USER.id;
              const sender = getUser(msg.senderId);
              const showHeader = idx === 0 || filteredMessages[idx - 1].senderId !== msg.senderId;

              return (
                 <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {showHeader ? (
                         sender?.avatarUrl ? (
                           <img src={sender.avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                             {sender?.name.charAt(0)}
                           </div>
                         )
                    ) : (
                       <div className="w-8 flex-shrink-0" />
                    )}
                    
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                       {showHeader && !isMe && (
                          <span className="text-xs text-gray-500 mb-1 ml-1">{sender?.name}</span>
                       )}
                       <div className={`px-4 py-2 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                       }`}>
                          {msg.content}
                       </div>
                       <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {msg.timestamp}
                       </span>
                    </div>
                 </div>
              );
           })}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
           <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                 className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                 placeholder={`Message ${activeDmUser ? '@' + getUser(activeDmUser)?.name : '#' + activeChannel}`}
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                 <Send size={18} />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};
