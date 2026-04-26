"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Hash,
  User as UserIcon,
  MoreVertical,
  Search,
  Bell,
  MessageCircle,
  Users,
  ArrowLeft,
  Menu,
  File,
  HelpCircle,
  UserPlus,
  Calendar,
  AlertCircle,
  Zap
} from 'lucide-react';
import { MOCK_MESSAGES, MOCK_USERS, CURRENT_USER } from '../constants';
import { ChatMessage, User } from '../types';

// Autocomplete types
type AutocompleteType = 'mention' | 'command' | null;

interface Suggestion {
  id: string;
  type: 'user' | 'file' | 'command';
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeDmUser, setActiveDmUser] = useState<string | null>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteType, setAutocompleteType] = useState<AutocompleteType>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channels = [
    { id: 'general', name: 'General', type: 'public' },
    { id: 'announcements', name: 'Announcements', type: 'public' },
    { id: 'random', name: 'Random', type: 'public' },
  ];

  // Mock files for demonstration
  const mockFiles = [
    { id: 'f1', name: 'T-800 Specs.pdf', path: '/documents/t800-specs.pdf' },
    { id: 'f2', name: 'Q4 Report.xlsx', path: '/documents/q4-report.xlsx' },
    { id: 'f3', name: 'Project Timeline.pdf', path: '/documents/timeline.pdf' },
  ];

  // Available slash commands
  const availableCommands = [
    { id: 'help', label: '/help', subtitle: 'Show available commands', icon: <HelpCircle size={16} /> },
    { id: 'invite', label: '/invite', subtitle: 'Invite team member', icon: <UserPlus size={16} /> },
    { id: 'remind', label: '/remind', subtitle: 'Set a reminder', icon: <Bell size={16} /> },
    { id: 'schedule', label: '/schedule', subtitle: 'Schedule a meeting', icon: <Calendar size={16} /> },
    { id: 'giphy', label: '/giphy', subtitle: 'Search for a GIF', icon: <Zap size={16} /> },
  ];

  // Detect @ or / triggers in input
  const detectTrigger = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const query = lastWord.substring(1).toLowerCase();
      setAutocompleteType('mention');
      setTriggerPosition(textBeforeCursor.lastIndexOf('@'));
      
      // Filter users and files
      const userSuggestions: Suggestion[] = MOCK_USERS
        .filter(u => u.id !== CURRENT_USER.id && u.name.toLowerCase().includes(query))
        .map(u => ({
          id: u.id,
          type: 'user',
          label: u.name,
          subtitle: u.email,
          icon: <UserIcon size={16} className="text-blue-500" />
        }));

      const fileSuggestions: Suggestion[] = mockFiles
        .filter(f => f.name.toLowerCase().includes(query))
        .map(f => ({
          id: f.id,
          type: 'file',
          label: f.name,
          subtitle: f.path,
          icon: <File size={16} className="text-green-500" />
        }));

      const allSuggestions = [...userSuggestions, ...fileSuggestions];
      setSuggestions(allSuggestions);
      setShowAutocomplete(allSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
    } else if (lastWord.startsWith('/')) {
      const query = lastWord.substring(1).toLowerCase();
      setAutocompleteType('command');
      setTriggerPosition(textBeforeCursor.lastIndexOf('/'));
      
      const commandSuggestions: Suggestion[] = availableCommands
        .filter(cmd => cmd.label.toLowerCase().includes(`/${query}`))
        .map(cmd => ({
          id: cmd.id,
          type: 'command',
          label: cmd.label,
          subtitle: cmd.subtitle,
          icon: cmd.icon
        }));

      setSuggestions(commandSuggestions);
      setShowAutocomplete(commandSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
    } else {
      setShowAutocomplete(false);
      setAutocompleteType(null);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: Suggestion) => {
    const textBeforeTrigger = inputText.substring(0, triggerPosition);
    const textAfterWord = inputText.substring(inputRef.current?.selectionStart || inputText.length);
    
    let replacement = '';
    if (suggestion.type === 'user') {
      replacement = `@${suggestion.label} `;
    } else if (suggestion.type === 'file') {
      replacement = `@file:${suggestion.label} `;
    } else if (suggestion.type === 'command') {
      replacement = `${suggestion.label} `;
    }

    const newText = textBeforeTrigger + replacement + textAfterWord;
    setInputText(newText);
    setShowAutocomplete(false);
    setAutocompleteType(null);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = (textBeforeTrigger + replacement).length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    detectTrigger(newText, e.target.selectionStart || 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (showAutocomplete && suggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowAutocomplete(false);
        break;
    }
  };

  useEffect(() => {
    if (!searchParams) return;

    const channelParam = searchParams.get('channel');
    const dmParam = searchParams.get('dm');

    if (dmParam) {
      setActiveDmUser(dmParam);
      setActiveChannel('');
      setIsMobileListVisible(false);
    } else if (channelParam) {
      setActiveChannel(channelParam);
      setActiveDmUser(null);
      setIsMobileListVisible(false);
    }
  }, [searchParams]);

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
  }, [filteredMessages, isMobileListVisible]); // Scroll when view changes

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Handle commands
    if (inputText.startsWith('/')) {
      const command = inputText.split(' ')[0].toLowerCase();
      
      switch (command) {
        case '/help':
          const helpMessage: ChatMessage = {
            id: `m${Date.now()}`,
            senderId: 'system',
            content: `**Available Commands:**
• /help - Show this help message
• /invite [email] - Invite a team member
• /remind [time] [message] - Set a reminder
• /schedule [time] - Schedule a meeting
• /giphy [search] - Search for a GIF

**Mentions:**
• @username - Mention a team member
• @file:filename - Reference a file`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: activeDmUser ? `dm_${activeDmUser}` : activeChannel
          };
          setMessages([...messages, helpMessage]);
          setInputText('');
          return;
          
        case '/invite':
          const email = inputText.split(' ')[1];
          if (email) {
            const inviteMsg: ChatMessage = {
              id: `m${Date.now()}`,
              senderId: 'system',
              content: `Invitation sent to ${email}! 📧`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: activeDmUser ? `dm_${activeDmUser}` : activeChannel
            };
            setMessages([...messages, inviteMsg]);
          }
          setInputText('');
          return;
          
        case '/remind':
          const reminderMsg: ChatMessage = {
            id: `m${Date.now()}`,
            senderId: 'system',
            content: `⏰ Reminder set! You'll be notified.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: activeDmUser ? `dm_${activeDmUser}` : activeChannel
          };
          setMessages([...messages, reminderMsg]);
          setInputText('');
          return;
      }
    }

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

  // Render message content with mentions highlighted
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\w+|@file:\S+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@file:')) {
        const filename = part.substring(6);
        return (
          <span key={index} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded font-medium">
            <File size={12} />
            {filename}
          </span>
        );
      } else if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    setActiveDmUser(null);
    setIsMobileListVisible(false);
  };

  const handleUserSelect = (userId: string) => {
    setActiveDmUser(userId);
    setActiveChannel('');
    setIsMobileListVisible(false);
  };

  const getUser = (id: string) => MOCK_USERS.find(u => u.id === id);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm flex overflow-hidden">
      {/* Sidebar List - Hidden on mobile when chat is visible */}
      <div className={`w-full md:w-64 bg-gray-50 dark:bg-dark-bg/50 border-r border-gray-200 dark:border-dark-border flex-col ${isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={20} className="text-primary-600 dark:text-primary-400" />
            Team Chat
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Channels</h3>
            <div className="space-y-1">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
                    ${activeChannel === channel.id && !activeDmUser ? 'bg-white dark:bg-dark-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-dark-border/50'}`}
                >
                  <Hash size={16} className={activeChannel === channel.id && !activeDmUser ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Direct Messages</h3>
            <div className="space-y-1">
              {MOCK_USERS.filter(u => u.id !== CURRENT_USER.id).map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
                    ${activeDmUser === user.id ? 'bg-white dark:bg-dark-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-dark-border/50'}`}
                >
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600 dark:text-primary-400">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-dark-bg"></div>
                  </div>
                  {user.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Hidden on mobile when list is visible */}
      <div className={`flex-1 flex-col ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
        {/* Header */}
        <div className="h-14 border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 md:px-6 bg-white dark:bg-dark-surface shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsMobileListVisible(true)}
              className="md:hidden p-1.5 -ml-1.5 mr-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>

            {activeDmUser ? (
              <>
                <div className="relative">
                  {getUser(activeDmUser)?.avatarUrl ? (
                    <img src={getUser(activeDmUser)?.avatarUrl} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center dark:text-gray-300">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full"></span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block leading-tight">@{getUser(activeDmUser)?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block leading-tight">Active now</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Hash size={18} />
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block leading-tight capitalize">{activeChannel}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block leading-tight">Team Notice Board</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input className="pl-8 pr-3 py-1 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white" placeholder="Search" />
            </div>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
              title="Shortcuts & Commands"
            >
              <HelpCircle size={18} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg">
              <Bell size={18} />
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg md:hidden"
              onClick={() => setIsMobileListVisible(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/30 dark:bg-dark-bg/20">
          {/* Help Panel */}
          {showHelp && (
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap size={18} className="text-primary-600 dark:text-primary-400" />
                  Quick Shortcuts
                </h3>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <UserIcon size={14} />
                    Mentions
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-white dark:bg-dark-bg rounded text-xs font-mono">@username</code>
                      <span className="text-gray-600 dark:text-gray-400">Mention a teammate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-white dark:bg-dark-bg rounded text-xs font-mono">@file:name</code>
                      <span className="text-gray-600 dark:text-gray-400">Reference a file</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Zap size={14} />
                    Commands
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-white dark:bg-dark-bg rounded text-xs font-mono">/help</code>
                      <span className="text-gray-600 dark:text-gray-400">Show all commands</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-white dark:bg-dark-bg rounded text-xs font-mono">/invite</code>
                      <span className="text-gray-600 dark:text-gray-400">Invite team member</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-white dark:bg-dark-bg rounded text-xs font-mono">/remind</code>
                      <span className="text-gray-600 dark:text-gray-400">Set reminder</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Use ↑↓ to navigate suggestions, ↵ to select, ESC to close
                </p>
              </div>
            </div>
          )}
          
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
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                      {sender?.name.charAt(0)}
                    </div>
                  )
                ) : (
                  <div className="w-8 flex-shrink-0" />
                )}

                <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showHeader && !isMe && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">{sender?.name}</span>
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm break-words ${
                    msg.senderId === 'system'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-900 dark:text-yellow-200 rounded-lg'
                      : isMe
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                    }`}>
                    {msg.senderId === 'system' ? (
                      <div className="whitespace-pre-line">{msg.content}</div>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border relative">
          {/* Autocomplete Dropdown */}
          {showAutocomplete && suggestions.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 md:left-4 md:right-4 mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                  {autocompleteType === 'mention' ? 'Mention user or file' : 'Commands'}
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      index === selectedSuggestionIndex
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                          {suggestion.label.charAt(0)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                          {suggestion.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {suggestion.label}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    {index === selectedSuggestionIndex && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">↵</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white dark:focus:bg-dark-bg transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                placeholder={`Message ${activeDmUser ? '@' + getUser(activeDmUser)?.name : '#' + activeChannel} • Type @ to mention, / for commands`}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              {/* Help hint */}
              {!showAutocomplete && inputText === '' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none hidden md:block">
                  @ mention · / command
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
