

// Calendar Component with comprehensive dark mode support
// Dark mode fixes applied to:
// - Navigation controls (buttons, arrows, view toggles)
// - Mobile and desktop filters (selects, labels, toggles)
// - Month view (day numbers, more indicators)
// - Day/Week view (headers, time labels, event counts)
// - List view (text, badges, unassigned indicators)
// - Status indicators and conflict warnings
// All text elements now have proper contrast in both light and dark themes

import React, { useState, useMemo } from 'react';
import { CalendarEvent, Task, TaskStatus, TaskPriority, TeamMember, ActivityType } from '../types';
import EventDetailsModal from './EventDetailsModal';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import { useGlobalStore } from '../hooks/useGlobalStore';

interface CalendarProps {
    currentUser?: TeamMember;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getEventColor = (type: CalendarEvent['type'] | 'time-billing') => {
    switch (type) {
        case 'task': return 'bg-blue-500 hover:bg-blue-600';
        case 'meeting': return 'bg-purple-500 hover:bg-purple-600';
        case 'invoice': return 'bg-red-500 hover:bg-red-600';
        case 'estimate': return 'bg-yellow-500 text-black hover:bg-yellow-600';
        case 'opportunity': return 'bg-orange-500 hover:bg-orange-600';
        case 'project': return 'bg-green-500 hover:bg-green-600';
        case 'case': return 'bg-indigo-500 hover:bg-indigo-600';
        case 'time-billing': return 'bg-teal-500 hover:bg-teal-600';
        default: return 'bg-gray-500 hover:bg-gray-600';
    }
}

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";

  switch (status) {
    case TaskStatus.ToDo:
      colorClasses = "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100";
      break;
    case TaskStatus.InProgress:
      colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      break;
    case TaskStatus.Completed:
      colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";

  switch (priority) {
    case TaskPriority.High:
      colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      break;
    case TaskPriority.Medium:
      colorClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      break;
    case TaskPriority.Low:
      colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{priority}</span>;
};


const Calendar: React.FC<CalendarProps> = ({ currentUser }) => {
    // State declarations
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('day'); // Default to day view
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    
    // Filter states
    const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'task' | 'meeting' | 'opportunity' | 'project' | 'case' | 'invoice' | 'estimate' | 'time-billing'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<'all' | string>('all');
    
    // Double booking prevention states
    const [showOverlapWarning, setShowOverlapWarning] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<any>(null);
    const [conflictingEvents, setConflictingEvents] = useState<CalendarEvent[]>([]);
    
    // Mobile responsive states
    const [showFilters, setShowFilters] = useState(false);

    // Get data from global store
    const {
        tasks,
        contacts,
        teamMembers,
        projects,
        opportunities,
        cases,
        addTask,
        updateTask,
        mediaFiles,
        timeEntries,
        leads,
        activities
    } = useGlobalStore();

    // Generate calendar events from global store data
    const allEvents: CalendarEvent[] = useMemo(() => {
        const calendarEvents: CalendarEvent[] = [];

        // Add task events
        tasks.forEach(task => {
            const startDate = new Date(task.dueDate);
            startDate.setHours(0,0,0,0);
            calendarEvents.push({
                id: `task-${task.id}`,
                title: task.title,
                start: startDate,
                end: startDate,
                type: 'task',
                link: '#/tasks',
                data: task,
            });
        });

        // Add opportunity events
        opportunities.forEach(opportunity => {
            if (opportunity.closeDate) {
                const startDate = new Date(opportunity.closeDate);
                startDate.setHours(0,0,0,0);
                calendarEvents.push({
                    id: `opportunity-${opportunity.id}`,
                    title: `Deal: ${opportunity.title}`,
                    start: startDate,
                    end: startDate,
                    type: 'opportunity',
                    link: '#/opportunities',
                    data: opportunity,
                });
            }
        });

        // Add project events
        projects.forEach(project => {
            if (project.deadline) {
                const startDate = new Date(project.deadline);
                startDate.setHours(0,0,0,0);
                calendarEvents.push({
                    id: `project-${project.id}`,
                    title: `Project Deadline: ${project.name}`,
                    start: startDate,
                    end: startDate,
                    type: 'project',
                    link: '#/projects',
                    data: project,
                });
            }
        });

        // Add case events
        cases.forEach(c => {
            const openDate = new Date(c.openDate);
            openDate.setHours(0,0,0,0);
            calendarEvents.push({
                id: `case-open-${c.id}`,
                title: `Case Opened: ${c.name}`,
                start: openDate,
                end: openDate,
                type: 'case',
                link: '#/cases',
                data: c,
            });
            
            if (c.closeDate) {
                const closeDate = new Date(c.closeDate);
                closeDate.setHours(0,0,0,0);
                calendarEvents.push({
                    id: `case-close-${c.id}`,
                    title: `Case Closed: ${c.name}`,
                    start: closeDate,
                    end: closeDate,
                    type: 'case',
                    link: '#/cases',
                    data: c,
                });
            }
        });

        // Add activity-based events (meetings, follow-ups, etc.)
        activities.forEach(activity => {
            if (activity.timestamp) {
                const activityDate = new Date(activity.timestamp);
                activityDate.setHours(0,0,0,0);
                calendarEvents.push({
                    id: `activity-${activity.id}`,
                    title: `${activity.type}: ${activity.summary}`,
                    start: activityDate,
                    end: activity.endTime ? new Date(activity.endTime) : activityDate,
                    type: activity.type === ActivityType.Meeting ? 'meeting' : 'task',
                    link: '#/activities',
                    data: activity,
                });
            }
        });

        // Add time billing events (grouped by contact and case)
        const timeBillingByContactAndCase = new Map();
        timeEntries.forEach(entry => {
            if (entry.isBillable && entry.contactId) {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0,0,0,0);
                const dateKey = entryDate.toISOString().split('T')[0];
                
                // Try to find case association through tasks
                let caseId = null;
                let caseName = null;
                if (entry.taskId) {
                    const relatedTask = tasks.find(t => t.id === entry.taskId);
                    if (relatedTask && relatedTask.caseId) {
                        caseId = relatedTask.caseId;
                        const relatedCase = cases.find(c => c.id === relatedTask.caseId);
                        caseName = relatedCase?.name || 'Unknown Case';
                    }
                }
                
                const key = caseId ? 
                    `case-${caseId}-${dateKey}` : 
                    `contact-${entry.contactId}-${dateKey}`;
                
                if (!timeBillingByContactAndCase.has(key)) {
                    const relatedContact = contacts.find(c => c.id === entry.contactId);
                    timeBillingByContactAndCase.set(key, {
                        type: caseId ? 'case' : 'contact',
                        id: caseId || entry.contactId,
                        name: caseName || entry.contactName || relatedContact?.name || 'Unknown Contact',
                        date: entryDate,
                        totalHours: 0,
                        totalAmount: 0,
                        entries: []
                    });
                }
                
                const billing = timeBillingByContactAndCase.get(key);
                billing.totalHours += entry.duration;
                billing.totalAmount += entry.duration * (entry.hourlyRate || 0);
                billing.entries.push(entry);
            }
        });

        // Convert time billing data to calendar events
        timeBillingByContactAndCase.forEach(billing => {
            const prefix = billing.type === 'case' ? 'Case' : 'Client';
            calendarEvents.push({
                id: `time-billing-${billing.type}-${billing.id}-${billing.date.toISOString()}`,
                title: `Time Billed - ${prefix}: ${billing.name} (${billing.totalHours}h - $${billing.totalAmount.toFixed(2)})`,
                start: billing.date,
                end: billing.date,
                type: 'time-billing' as any,
                link: '#/time-billing',
                data: billing,
            });
        });

        return calendarEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [tasks, opportunities, projects, cases, activities]);

    // Apply filters to events
    const events = useMemo(() => {
        let filteredEvents = allEvents;

        // Filter by event type
        if (eventTypeFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.type === eventTypeFilter);
        }

        // Filter by status (for tasks and projects)
        if (statusFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => {
                if (event.type === 'task' && event.data) {
                    const task = event.data as Task;
                    const now = new Date();
                    switch (statusFilter) {
                        case 'active':
                            return task.status !== 'Completed';
                        case 'completed':
                            return task.status === 'Completed';
                        case 'overdue':
                            return task.status !== 'Completed' && new Date(task.dueDate) < now;
                        default:
                            return true;
                    }
                }
                return true;
            });
        }

        // Filter by assignee (for tasks)
        if (assigneeFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => {
                if (event.type === 'task' && event.data) {
                    const task = event.data as Task;
                    return task.assigneeId === assigneeFilter;
                }
                return true;
            });
        }

        return filteredEvents;
    }, [allEvents, eventTypeFilter, statusFilter, assigneeFilter]);

    // Overlap detection utility functions
    const checkEventOverlap = (newEvent: { start: Date; end: Date; assigneeId?: string }, existingEvents: CalendarEvent[]) => {
        const conflicts: CalendarEvent[] = [];
        
        existingEvents.forEach(existing => {
            // Only check for conflicts if events have the same assignee, are meetings, or involve resource conflicts
            const shouldCheck = !newEvent.assigneeId || 
                               existing.type === 'meeting' || 
                               (existing.data as any)?.assigneeId === newEvent.assigneeId ||
                               (existing.data as any)?.assigned === newEvent.assigneeId;
            
            if (shouldCheck) {
                const existingStart = new Date(existing.start);
                const existingEnd = existing.end ? new Date(existing.end) : new Date(existing.start.getTime() + 60 * 60 * 1000); // Default 1 hour
                
                // Normalize times to same day for comparison if they're on the same date
                const newEventDate = newEvent.start.toDateString();
                const existingDate = existingStart.toDateString();
                
                if (newEventDate === existingDate) {
                    // Check for time overlap on the same day
                    const hasOverlap = (newEvent.start < existingEnd) && (newEvent.end > existingStart);
                    
                    if (hasOverlap) {
                        conflicts.push(existing);
                    }
                }
            }
        });
        
        return conflicts;
    };

    const formatConflictTime = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : new Date(event.start.getTime() + 60 * 60 * 1000);
        const dateStr = start.toLocaleDateString();
        const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return `${dateStr} ${timeStr}`;
    };

    // Check if an event has overlaps with other events
    const hasOverlap = (event: CalendarEvent, allEvents: CalendarEvent[]) => {
        const eventStart = new Date(event.start);
        const eventEnd = event.end ? new Date(event.end) : new Date(event.start.getTime() + 60 * 60 * 1000);
        
        return allEvents.some(otherEvent => {
            if (otherEvent.id === event.id) return false;
            
            const otherStart = new Date(otherEvent.start);
            const otherEnd = otherEvent.end ? new Date(otherEvent.end) : new Date(otherEvent.start.getTime() + 60 * 60 * 1000);
            
            // Check if events are on the same day and have time overlap
            const sameDay = eventStart.toDateString() === otherStart.toDateString();
            const timeOverlap = (eventStart < otherEnd) && (eventEnd > otherStart);
            
            // Only consider overlap if events involve the same resources
            const resourceConflict = event.type === 'meeting' || 
                                   otherEvent.type === 'meeting' ||
                                   (event.data as any)?.assigneeId === (otherEvent.data as any)?.assigneeId;
            
            return sameDay && timeOverlap && resourceConflict;
        });
    };

    const handleEventClick = (event: CalendarEvent) => setSelectedEvent(event);
    
    const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
        const newTask: Task = { 
            ...newTaskData, 
            id: `task-${Date.now()}`,
        };
        
        // Check for overlaps if the task has a specific time
        const taskStart = new Date(newTask.dueDate);
        const taskEnd = new Date(taskStart.getTime() + (2 * 60 * 60 * 1000)); // Default 2 hours for tasks
        
        const conflicts = checkEventOverlap(
            { 
                start: taskStart, 
                end: taskEnd, 
                assigneeId: newTask.assigneeId 
            }, 
            events
        );
        
        if (conflicts.length > 0) {
            setConflictingEvents(conflicts);
            setPendingEvent({ type: 'task', data: newTask });
            setShowOverlapWarning(true);
        } else {
            addTask({ ...newTask, syncStatus: 'pending' });
            setCreateModalOpen(false);
        }
    };
    
    // Generic event creation handler with overlap detection (for future use)
    /* 
    const handleCreateEvent = (eventType: string, eventData: any, startTime: Date, endTime: Date, assigneeId?: string) => {
        const conflicts = checkEventOverlap(
            { 
                start: startTime, 
                end: endTime, 
                assigneeId: assigneeId 
            }, 
            events
        );
        
        if (conflicts.length > 0) {
            setConflictingEvents(conflicts);
            setPendingEvent({ type: eventType, data: eventData, startTime, endTime });
            setShowOverlapWarning(true);
        } else {
            // Handle the creation based on event type
            switch (eventType) {
                case 'task':
                    addTask({ ...eventData, syncStatus: 'pending' });
                    break;
                // Add other event types as needed
                default:
                    console.warn('Unknown event type:', eventType);
            }
        }
    };
    */
    
    const handleConfirmOverlap = () => {
        if (pendingEvent) {
            switch (pendingEvent.type) {
                case 'task':
                    addTask({ ...pendingEvent.data, syncStatus: 'pending' });
                    setCreateModalOpen(false);
                    break;
                // Add other event types as needed
                default:
                    console.warn('Unknown event type:', pendingEvent.type);
            }
        }
        setShowOverlapWarning(false);
        setPendingEvent(null);
        setConflictingEvents([]);
    };
    
    const handleCancelOverlap = () => {
        setShowOverlapWarning(false);
        setPendingEvent(null);
        setConflictingEvents([]);
    };
    
    const handleOpenDetails = (task: Task) => {
        setSelectedTask(task);
        setDetailsModalOpen(true);
    };
    
    const handleUpdateTask = (updatedTask: Task) => {
        updateTask({ ...updatedTask, syncStatus: 'pending' });
        setSelectedTask(updatedTask);
    };

    const { headerTitle, dateRange } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        switch(view) {
            case 'month':
                return { headerTitle: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }), dateRange: null };
            case 'week':
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(day - startOfWeek.getDay());
                startOfWeek.setHours(0,0,0,0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23,59,59,999);

                const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
                const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
                
                const title = startMonth === endMonth 
                    ? `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`
                    : `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
                return { headerTitle: title, dateRange: [startOfWeek, endOfWeek] };
            case 'day':
                return { headerTitle: currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' }), dateRange: [new Date(year, month, day), new Date(year, month, day, 23, 59, 59, 999)] };
            default: // list view
                return { headerTitle: 'All Tasks', dateRange: null };
        }
    }, [currentDate, view]);

    const handlePrev = () => {
      switch(view) {
          case 'month': setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); break;
          case 'week': setCurrentDate(d => new Date(d.setDate(d.getDate() - 7))); break;
          case 'day': setCurrentDate(d => new Date(d.setDate(d.getDate() - 1))); break;
      }
    };
  
    const handleNext = () => {
        switch(view) {
            case 'month': setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); break;
            case 'week': setCurrentDate(d => new Date(d.setDate(d.getDate() + 7))); break;
            case 'day': setCurrentDate(d => new Date(d.setDate(d.getDate() + 1))); break;
        }
    };

    const goToToday = () => setCurrentDate(new Date());
    
    const goToNextEvent = () => {
        const now = new Date();
        const upcomingEvents = events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            
        if (upcomingEvents.length > 0) {
            const nextEvent = upcomingEvents[0];
            setCurrentDate(new Date(nextEvent.start));
            // Switch to day view to focus on the specific event
            if (view === 'month') {
                setView('day');
            }
        }
    };
    
    const hasUpcomingEvents = useMemo(() => {
        const now = new Date();
        return events.some(event => new Date(event.start) > now);
    }, [events]);

    const renderMonthView = () => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startingDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();
        const calendarDays = [];
        
        for (let i = 0; i < startingDay; i++) calendarDays.push(new Date(firstDayOfMonth.getTime() - (startingDay - i) * 24*60*60*1000));
        for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        const remainingCells = 42 - calendarDays.length;
        for (let i = 1; i <= remainingCells; i++) calendarDays.push(new Date(lastDayOfMonth.getTime() + i * 24*60*60*1000));

        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 border-t border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="py-2 bg-gray-50 dark:bg-gray-800">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 dark:bg-gray-700 border-l border-b border-gray-200 dark:border-gray-700 flex-grow min-h-0">
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayEvents = events.filter(e => new Date(e.start).toDateString() === day.toDateString());
                        
                        return (
                            <div key={index} className={`p-1 lg:p-2 flex flex-col bg-white dark:bg-gray-800 relative overflow-hidden ${isCurrentMonth ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                <time dateTime={day.toISOString()} className={`self-start text-xs lg:text-sm ${isToday ? 'bg-primary-600 text-white rounded-full h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center font-bold' : isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {day.getDate()}
                                </time>
                                <div className="mt-1 space-y-1 overflow-y-auto flex-1 min-h-0">
                                    {dayEvents.slice(0, window.innerWidth < 768 ? 1 : 3).map(event => {
                                        const hasConflict = hasOverlap(event, events);
                                        return (
                                            <button key={event.id} onClick={() => handleEventClick(event)} className={`w-full text-left text-xs font-medium text-white px-1 lg:px-2 py-0.5 rounded truncate transition-colors relative ${getEventColor(event.type)} ${hasConflict ? 'ring-1 lg:ring-2 ring-yellow-400 ring-opacity-60' : ''}`}>
                                                {hasConflict && (
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                                        <svg className="w-1 h-1 lg:w-2 lg:h-2 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span className="block lg:hidden">{event.title.substring(0, 3)}...</span>
                                                <span className="hidden lg:block">{event.title}</span>
                                            </button>
                                        );
                                    })}
                                    {dayEvents.length > (window.innerWidth < 768 ? 1 : 3) && (
                                        <div className="text-xs text-primary-500 dark:text-primary-400 font-semibold cursor-pointer">
                                            + {dayEvents.length - (window.innerWidth < 768 ? 1 : 3)} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    const renderDayOrWeekView = () => {
        if (!dateRange) return null;
        const daysToShow = view === 'week' ? Array.from({ length: 7 }, (_, i) => new Date(new Date(dateRange[0]).setDate(dateRange[0].getDate() + i))) : [currentDate];
        const isAllDay = (e: CalendarEvent) => e.type !== 'meeting'; // simplified logic
        const allDayEvents = events.filter(e => isAllDay(e) && e.start >= dateRange[0] && e.start <= dateRange[1]);
        const timedEvents = events.filter(e => !isAllDay(e) && e.start >= dateRange[0] && e.start <= dateRange[1]);
        const hours = Array.from({ length: 24 }, (_, i) => i);
      
        return (
          <div className="flex-1 flex flex-col overflow-hidden border-t border-gray-200 dark:border-gray-700">
            {/* Header with days */}
            <div className="grid grid-cols-[auto,1fr] sticky top-0 bg-white dark:bg-gray-800 z-10 flex-shrink-0">
              <div className="w-10 lg:w-14 border-r border-b border-gray-200 dark:border-gray-700"></div>
              <div className={`grid grid-cols-${daysToShow.length} text-center border-b border-gray-200 dark:border-gray-700`}>
                {daysToShow.map(day => (
                  <div key={day.toISOString()} className="border-r border-gray-200 dark:border-gray-700 p-1 lg:p-2">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{WEEKDAYS[day.getDay()].substring(0, 3).toUpperCase()}</span>
                    <p className={`text-lg lg:text-xl font-semibold ${new Date().toDateString() === day.toDateString() ? 'text-primary-500' : 'text-gray-800 dark:text-gray-200'}`}>{day.getDate()}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* All-day events */}
            <div className="grid grid-cols-[auto,1fr] flex-shrink-0">
              <div className="w-10 lg:w-14 border-r border-gray-200 dark:border-gray-700 text-center text-xs py-1 text-gray-500 dark:text-gray-400">
                <span className="hidden lg:inline">all-day</span>
                <span className="lg:hidden">all</span>
              </div>
              <div className={`grid grid-cols-${daysToShow.length} border-b border-gray-200 dark:border-gray-700 min-h-[40px] lg:min-h-[50px]`}>
                {daysToShow.map(day => {
                  const dayEvents = allDayEvents.filter(e => new Date(e.start).toDateString() === day.toDateString());
                  return (
                    <div key={day.toISOString()} className="border-r border-gray-200 dark:border-gray-700 p-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map(event => {
                        const hasConflict = hasOverlap(event, events);
                        return (
                          <button key={event.id} onClick={() => handleEventClick(event)} className={`w-full text-left text-xs font-medium text-white px-1 lg:px-2 py-0.5 rounded truncate transition-colors relative ${getEventColor(event.type)} ${hasConflict ? 'ring-1 lg:ring-2 ring-yellow-400 ring-opacity-60' : ''}`}>
                            {hasConflict && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                <svg className="w-1 h-1 lg:w-2 lg:h-2 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <span className="block lg:hidden">{event.title.substring(0, 6)}...</span>
                            <span className="hidden lg:block">{event.title}</span>
                          </button>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-primary-500 dark:text-primary-400 font-semibold">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Time grid */}
            <div className="grid grid-cols-[auto,1fr] flex-1 overflow-auto">
              <div className="w-10 lg:w-14 flex-shrink-0">
                {hours.slice(1).map(hour => (
                  <div key={hour} className="h-10 lg:h-12 border-r border-gray-200 dark:border-gray-700 text-right pr-1 text-xs text-gray-400 dark:text-gray-500 relative">
                    <span className="absolute -top-1.5 right-1">
                      <span className="hidden lg:inline">{hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}</span>
                      <span className="lg:hidden">{hour % 12 === 0 ? 12 : hour % 12}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className={`grid grid-cols-${daysToShow.length} flex-1 min-w-0`}>
                {daysToShow.map(day => (
                  <div key={day.toISOString()} className="relative border-r border-gray-200 dark:border-gray-700 min-w-0">
                    {hours.map(hour => <div key={hour} className="h-10 lg:h-12 border-b border-gray-200 dark:border-gray-700"></div>)}
                    {timedEvents.filter(e => new Date(e.start).toDateString() === day.toDateString()).map(event => {
                      const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                      const endMinutes = event.end ? event.end.getHours() * 60 + event.end.getMinutes() : startMinutes + 60;
                      const duration = Math.max(30, endMinutes - startMinutes);
                      const top = (startMinutes / (24 * 60)) * 100;
                      const height = (duration / (24 * 60)) * 100;
                      const hasConflict = hasOverlap(event, events);
                      return (
                        <button key={event.id} onClick={() => handleEventClick(event)} className={`absolute w-full p-1 text-left text-white text-xs rounded-lg transition-colors z-10 relative ${getEventColor(event.type)} ${hasConflict ? 'ring-1 lg:ring-2 ring-yellow-400 ring-opacity-60' : ''}`} style={{ top: `${top}%`, height: `${height}%`, left: '2px', right: '2px', width: 'calc(100% - 4px)' }}>
                          {hasConflict && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                              <svg className="w-1 h-1 lg:w-2 lg:h-2 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <p className="font-semibold truncate">{event.title}</p>
                          <p className="truncate hidden lg:block">{event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {(event.end || event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
    const renderListView = () => {
        const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return (
            <div className="overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-md flex-1">
                {/* Mobile Card View */}
                <div className="block lg:hidden p-4 space-y-3">
                    {sortedTasks.map((task) => {
                        const assignee = teamMembers.find(tm => tm.id === task.assigneeId);
                        const isOverdue = new Date(task.dueDate) < today && task.status !== TaskStatus.Completed;
                        return (
                            <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <button onClick={() => handleOpenDetails(task)} className="font-medium text-gray-900 dark:text-white hover:underline text-left flex-1">
                                        {task.title}
                                    </button>
                                    <TaskStatusBadge status={task.status} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{task.contactName}</span>
                                    <TaskPriorityBadge priority={task.priority} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className={`text-gray-600 dark:text-gray-400 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                    {assignee ? (
                                        <div className="flex items-center gap-2">
                                            <img src={assignee.avatarUrl} alt={assignee.name} className="w-5 h-5 rounded-full"/>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Desktop Table View */}
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 hidden lg:table">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-3">Task</th>
                      <th scope="col" className="px-6 py-3">Contact</th>
                      <th scope="col" className="px-6 py-3">Due Date</th>
                      <th scope="col" className="px-6 py-3">Assignee</th>
                      <th scope="col" className="px-6 py-3">Priority</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task) => {
                      const assignee = teamMembers.find(tm => tm.id === task.assigneeId);
                      const isOverdue = new Date(task.dueDate) < today && task.status !== TaskStatus.Completed;
                      return (
                      <tr key={task.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                          <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              <button onClick={() => handleOpenDetails(task)} className="hover:underline">{task.title}</button>
                          </td>
                          <td className="px-6 py-4">{task.contactName}</td>
                          <td className={`px-6 py-4 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>{new Date(task.dueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                              {assignee ? (
                                  <div className="flex items-center gap-2">
                                      <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full"/>
                                      <span className="text-xs">{assignee.name}</span>
                                  </div>
                              ) : 'Unassigned'}
                          </td>
                          <td className="px-6 py-4"><TaskPriorityBadge priority={task.priority} /></td>
                          <td className="px-6 py-4"><TaskStatusBadge status={task.status} /></td>
                      </tr>
                    )})}
                  </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
        <div className="h-full flex flex-col overflow-hidden min-w-[350px]">
            <header className="flex flex-col justify-between items-start gap-2 lg:gap-4 flex-shrink-0 p-2 lg:p-0">
                {/* Mobile Compact Header */}
                <div className="block lg:hidden w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">{headerTitle}</h1>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{events.length} events</span>
                    </div>
                    
                    {/* Compact Mobile Controls */}
                    <div className="flex items-center justify-between gap-2">
                        {/* Navigation */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                            <button onClick={handlePrev} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button onClick={goToToday} className="px-2 py-1 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Today</button>
                            <button onClick={handleNext} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                            <button onClick={() => setView('month')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${view === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>M</button>
                            <button onClick={() => setView('week')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${view === 'week' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>W</button>
                            <button onClick={() => setView('day')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${view === 'day' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>D</button>
                            <button onClick={() => setView('list')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>L</button>
                        </div>
                        
                        {/* Mobile Filter Toggle */}
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                            </svg>
                            <svg className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Collapsed Filters for Mobile */}
                    {showFilters && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                            <select 
                                value={eventTypeFilter} 
                                onChange={(e) => setEventTypeFilter(e.target.value as any)}
                                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Events</option>
                                <option value="task">Tasks</option>
                                <option value="meeting">Meetings</option>
                                <option value="opportunity">Opportunities</option>
                                <option value="project">Projects</option>
                                <option value="case">Cases</option>
                                <option value="time-billing">Time Billing</option>
                            </select>
                            <div className="flex gap-2">
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                                <select 
                                    value={assigneeFilter} 
                                    onChange={(e) => setAssigneeFilter(e.target.value)}
                                    className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Assignees</option>
                                    {teamMembers.map(member => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4">
                        <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">{headerTitle}</h1>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                            {/* Navigation Controls */}
                            <div className="flex items-center gap-1 rounded-lg p-1 bg-gray-100 dark:bg-gray-800 order-2 lg:order-1">
                                <button onClick={handlePrev} className="p-1.5 lg:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button onClick={goToToday} className="px-2 lg:px-4 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Today</button>
                                <button onClick={goToNextEvent} 
                                        disabled={!hasUpcomingEvents}
                                        className={`px-2 lg:px-4 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${hasUpcomingEvents ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                                        title={hasUpcomingEvents ? 'Jump to next scheduled event' : 'No upcoming events'}>
                                    Next Event
                                </button>
                                <button onClick={handleNext} className="p-1.5 lg:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* View Toggle */}
                            <div className="flex items-center gap-1 rounded-lg p-1 bg-gray-100 dark:bg-gray-800 order-1 lg:order-2">
                                <button onClick={() => setView('month')} className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Month</button>
                                <button onClick={() => setView('week')} className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Week</button>
                                <button onClick={() => setView('day')} className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors ${view === 'day' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Day</button>
                                <button onClick={() => setView('list')} className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>List</button>
                            </div>
                            
                            {/* Create Task Button */}
                            {view === 'list' && (
                                <button onClick={() => setCreateModalOpen(true)} className="bg-primary-600 text-white font-semibold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-primary-700 text-xs lg:text-sm order-3">
                                    Create Task
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Desktop Filter Controls */}
                    <div className="w-full mt-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 lg:gap-4 flex-wrap w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Type:</label>
                                    <select 
                                        value={eventTypeFilter} 
                                        onChange={(e) => setEventTypeFilter(e.target.value as any)}
                                        className="text-xs lg:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 lg:px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 lg:flex-none"
                                    >
                                        <option value="all">All Events</option>
                                        <option value="task">Tasks</option>
                                        <option value="meeting">Meetings</option>
                                        <option value="opportunity">Opportunities</option>
                                        <option value="project">Projects</option>
                                        <option value="case">Cases</option>
                                        <option value="time-billing">Time Billing</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <label className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Status:</label>
                                    <select 
                                        value={statusFilter} 
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="text-xs lg:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 lg:px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 lg:flex-none"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                                    <label className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Assignee:</label>
                                    <select 
                                        value={assigneeFilter} 
                                        onChange={(e) => setAssigneeFilter(e.target.value)}
                                        className="text-xs lg:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 lg:px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 lg:flex-none"
                                    >
                                        <option value="all">All Assignees</option>
                                        {teamMembers.map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Status Indicators and Clear Button */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 w-full lg:w-auto">
                                <div className="hidden lg:block">
                                    <span>Showing {events.length} events</span>
                                </div>                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                                    <svg className="w-2 h-2 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs text-gray-700 dark:text-gray-300">Conflicts</span>
                                            </div>
                                            
                                            {eventTypeFilter === 'time-billing' && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Billable hours</span>
                                                </div>
                                            )}
                                            
                                            {(eventTypeFilter !== 'all' || statusFilter !== 'all' || assigneeFilter !== 'all') && (
                                                <button 
                                                    onClick={() => {
                                                        setEventTypeFilter('all');
                                                        setStatusFilter('all');
                                                        setAssigneeFilter('all');
                                                    }}
                                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline text-xs"
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Calendar Content - maximized for mobile */}
            <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mx-1 lg:mx-0 mb-1 lg:mb-0 lg:mt-6 min-h-[700px]">
                {view === 'month' && renderMonthView()}
                {(view === 'week' || view === 'day') && renderDayOrWeekView()}
                {view === 'list' && renderListView()}
            </div>
        </div>
        
        {selectedEvent && <EventDetailsModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} event={selectedEvent} />}
        
        <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateTask}
            contacts={contacts}
            teamMembers={teamMembers}
            currentUser={currentUser}
        />
        {selectedTask && (
            <TaskDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => setDetailsModalOpen(false)}
              task={selectedTask}
              onUpdateTask={handleUpdateTask}
              teamMembers={teamMembers}
              timeEntries={timeEntries}
              mediaFiles={mediaFiles}
              leads={leads}
              opportunities={opportunities}
              projects={projects}
              cases={cases}
            />
        )}
        
        {/* Overlap Warning Modal */}
        {showOverlapWarning && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleCancelOverlap}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Scheduling Conflict Detected</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    This event overlaps with {conflictingEvents.length} existing {conflictingEvents.length === 1 ? 'event' : 'events'}
                                </p>
                            </div>
                        </div>
                    </header>
                    <main className="px-6 pb-4">
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                The following {conflictingEvents.length === 1 ? 'event conflicts' : 'events conflict'} with your new event:
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                                {conflictingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{formatConflictTime(event)}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(event.type).replace('hover:', '').replace('bg-', 'bg-').replace('text-white', 'text-white')}`}>
                                            {event.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                    <footer className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={handleCancelOverlap} 
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmOverlap}
                            className="bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Create Anyway
                        </button>
                    </footer>
                </div>
            </div>
        )}
        </>
    );
};

export default Calendar;