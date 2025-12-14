
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  Calendar as CalendarIcon,
  Bell,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { MOCK_EVENTS } from '../constants';
import { CalendarEvent } from '../types';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (day: number) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(day);
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvent: CalendarEvent = {
        id: `e${Date.now()}`,
        title: formData.get('title') as string,
        date: formData.get('date') as string,
        startTime: formData.get('startTime') as string,
        type: formData.get('type') as CalendarEvent['type'],
        description: formData.get('description') as string,
        completed: false
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
  };

  const toggleTask = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const deleteTask = (id: string) => {
      setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Tasks</h1>
          <p className="text-gray-500">Manage appointments, reminders, and your daily todo list.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Event / Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Calendar Grid */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <CalendarIcon size={20} className="text-gray-500" />
                 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
               </h2>
               <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"><ChevronLeft size={20}/></button>
                  <button onClick={nextMonth} className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"><ChevronRight size={20}/></button>
               </div>
            </div>
            
            <div className="grid grid-cols-7 text-center border-b border-gray-200 bg-gray-50/50">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{day}</div>
               ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr">
               {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/20"></div>
               ))}
               {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  const dateString = formatDate(day);
                  const isSelected = selectedDate === dateString;

                  return (
                     <div 
                        key={day} 
                        onClick={() => setSelectedDate(dateString)}
                        className={`h-32 border-b border-r border-gray-100 p-2 relative hover:bg-gray-50 transition-colors cursor-pointer group
                           ${isSelected ? 'bg-primary-50/30' : ''}`}
                     >
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                           ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}
                        `}>
                           {day}
                        </span>
                        
                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                           {dayEvents.map(ev => (
                              <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium
                                 ${ev.type === 'meeting' ? 'bg-blue-100 text-blue-700' : 
                                   ev.type === 'reminder' ? 'bg-amber-100 text-amber-700' : 
                                   ev.completed ? 'bg-gray-100 text-gray-400 line-through' : 'bg-green-100 text-green-700'}
                              `}>
                                 {ev.startTime ? ev.startTime + ' ' : ''}{ev.title}
                              </div>
                           ))}
                        </div>
                        
                        {/* Add button on hover */}
                        <button 
                           className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-600 transition-opacity"
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             setSelectedDate(dateString);
                             setIsModalOpen(true); 
                           }}
                        >
                           <Plus size={16} />
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Sidebar: Selected Date Details */}
         <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
               <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
               </h3>
               <p className="text-gray-500 text-sm mb-6">Daily Agenda</p>

               <div className="space-y-6 flex-1 overflow-y-auto">
                  {/* Appointments */}
                  <div>
                     <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Appointments & Reminders</h4>
                     <div className="space-y-3">
                        {events.filter(e => e.date === selectedDate && e.type !== 'task').length > 0 ? (
                           events.filter(e => e.date === selectedDate && e.type !== 'task').map(ev => (
                              <div key={ev.id} className="flex gap-3 items-start group">
                                 <div className={`mt-0.5 ${ev.type === 'meeting' ? 'text-blue-500' : 'text-amber-500'}`}>
                                    {ev.type === 'meeting' ? <Clock size={16} /> : <Bell size={16} />}
                                 </div>
                                 <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">{ev.title}</div>
                                    <div className="text-xs text-gray-500">{ev.startTime || 'All Day'} • {ev.description || 'No description'}</div>
                                 </div>
                                 <button onClick={() => deleteTask(ev.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))
                        ) : (
                           <p className="text-sm text-gray-400 italic">No appointments for this day.</p>
                        )}
                     </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Todo List */}
                  <div>
                     <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">To-Do List</h4>
                     <div className="space-y-2">
                         {events.filter(e => e.date === selectedDate && e.type === 'task').length > 0 ? (
                            events.filter(e => e.date === selectedDate && e.type === 'task').map(task => (
                               <div key={task.id} className="flex items-center gap-3 group">
                                  <button 
                                     onClick={() => toggleTask(task.id)}
                                     className={`flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                  >
                                     {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                  </button>
                                  <span className={`text-sm flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                     {task.title}
                                  </span>
                                  <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} />
                                 </button>
                               </div>
                            ))
                         ) : (
                            <p className="text-sm text-gray-400 italic">No tasks scheduled.</p>
                         )}
                         <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-left text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2 mt-2 pt-2"
                         >
                            <Plus size={14} /> Add new task
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add to Calendar</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 space-y-6">
                
                {/* Type Selection */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                   <div className="grid grid-cols-3 gap-3">
                      <label className="cursor-pointer">
                        <input type="radio" name="type" value="meeting" className="peer sr-only" defaultChecked />
                        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center">
                           <Clock className="w-5 h-5 text-blue-500 mb-1" />
                           <span className="text-xs font-medium text-gray-900">Meeting</span>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="type" value="task" className="peer sr-only" />
                         <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all text-center">
                           <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                           <span className="text-xs font-medium text-gray-900">To-Do</span>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="type" value="reminder" className="peer sr-only" />
                         <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 peer-checked:border-amber-500 peer-checked:bg-amber-50 transition-all text-center">
                           <Bell className="w-5 h-5 text-amber-500 mb-1" />
                           <span className="text-xs font-medium text-gray-900">Reminder</span>
                        </div>
                      </label>
                   </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Q4 Strategy Call"
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input 
                         name="date"
                         type="date"
                         defaultValue={selectedDate}
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                      <input 
                         name="startTime"
                         type="time"
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                   </div>
                </div>

                {/* Description */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                   <textarea 
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add any extra details..."
                   />
                </div>

              {/* Footer */}
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
