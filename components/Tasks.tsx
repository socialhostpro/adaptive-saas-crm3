import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TimeEntryStatus } from '../types';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import LogTimeModal from './LogTimeModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useGlobalStore, TaskWithSync, TimeEntryWithSync } from '../hooks/useGlobalStore';

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";
  switch (status) {
    case TaskStatus.ToDo: colorClasses = "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case TaskStatus.InProgress: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case TaskStatus.Completed: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};
const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";
  switch (priority) {
    case TaskPriority.High: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
    case TaskPriority.Medium: colorClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"; break;
    case TaskPriority.Low: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{priority}</span>;
};

const Tasks: React.FC = () => {
  // Use Zustand global store for all business data
  const {
    contacts,
    teamMembers,
    leads,
    opportunities,
    projects,
    timeEntries,
    mediaFiles,
    tasks,
    addTask,
    updateTask,
    removeTask,
    addTimeEntry,
    isInitialized
  } = useGlobalStore();

  // Local ephemeral state for UI only
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; startTime: number } | null>(null);
  // Modal and UI state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLogTimeModalOpen, setLogTimeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithSync | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');

  const [elapsedTime, setElapsedTime] = useState(0);
  const [logTimeInitialDuration, setLogTimeInitialDuration] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: number | undefined;
    if (activeTimer) {
        interval = window.setInterval(() => {
            setElapsedTime(Date.now() - activeTimer.startTime);
        }, 1000);
    } else {
        setElapsedTime(0);
    }
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  // Initial fetch/hydrate from state (tasks are managed globally)
  useEffect(() => {
    console.log('Tasks component initialized with data:', {
      tasks: tasks.length,
      contacts: contacts.length,
      teamMembers: teamMembers.length,
      leads: leads.length,
      opportunities: opportunities.length,
      projects: projects.length
    });
    setLoading(false); // No async loading needed, tasks come from global state
  }, []);

  // Filtered tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                           (task.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'All' || task.assigneeId === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  // Show loading until store is initialized
  if (!isInitialized) {
    return <div className="text-center py-4">Initializing...</div>;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartTimer = (task: TaskWithSync) => {
    if (activeTimer) {
        alert("Another timer is already running. Please stop it before starting a new one.");
        return;
    }
    setActiveTimer({ taskId: task.id, startTime: Date.now() });
  };

  const handleStopTimer = (task: TaskWithSync) => {
    const durationInHours = elapsedTime / (1000 * 60 * 60);
    setActiveTimer(null);
    setElapsedTime(0);
    setSelectedTask(task);
    setLogTimeInitialDuration(durationInHours);
    setLogTimeModalOpen(true);
  };

  // CREATE task (pure state management)
  const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: TaskWithSync = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      syncStatus: 'synced',
    };
    addTask(newTask);
    setCreateModalOpen(false);
  };

  // UPDATE task (pure state management)
  const handleUpdateTask = (updatedTask: Task | TaskWithSync) => {
    const taskWithSync: TaskWithSync = {
      ...updatedTask,
      syncStatus: 'syncStatus' in updatedTask ? updatedTask.syncStatus : 'synced'
    };
    updateTask(taskWithSync);
    setDetailsModalOpen(false);
  };

  // DELETE task (pure state management)
  const handleDeleteTask = () => {
    if (!selectedTask) return;
    removeTask(selectedTask.id);
    setDeleteModalOpen(false);
    setSelectedTask(null);
  };

  const handleLogTimeForTask = (entryData: any) => {
      if (!selectedTask) return;
      const contact = contacts.find(c => c.id === selectedTask.contactId);
      
      const newTimeEntry: TimeEntryWithSync = {
        ...entryData,
        id: `timeentry-${Date.now()}`,
        contactName: contact?.name || 'Unknown',
        status: TimeEntryStatus.Unbilled,
        taskId: selectedTask.id,
        syncStatus: 'synced',
      };
      
      // Add time entry to global state
      addTimeEntry(newTimeEntry);
      
      // Update the task's timeEntryIds
      const updatedTask: TaskWithSync = {
        ...selectedTask,
        timeEntryIds: [...(selectedTask.timeEntryIds || []), newTimeEntry.id]
      };
      
      // Use the updated handleUpdateTask which handles both types
      updateTask(updatedTask);
      
      setLogTimeModalOpen(false);
  };

  // Utility functions for task card display
  const getLinkedInfo = (task: Task) => {
    if (task.leadId) {
      const lead = leads.find(l => l.id === task.leadId);
      if (lead) return { type: 'Lead', name: lead.name, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    } else if (task.opportunityId) {
      const op = opportunities.find(o => o.id === task.opportunityId);
      if (op) return { type: 'Deal', name: op.title, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
    } else if (task.projectId) {
      const proj = projects.find(p => p.id === task.projectId);
      if (proj) return { type: 'Project', name: proj.name, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
    }
    return null;
  };

  const handleOpenDetails = (task: TaskWithSync) => {
    setSelectedTask(task);
    setDetailsModalOpen(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle URL highlight parameter
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Check for highlight query parameter
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const highlightId = urlParams.get('highlight');
    
    if (highlightId && tasks.length > 0) {
      setHighlightedTaskId(highlightId);
      
      // Scroll to the highlighted task after a short delay to ensure rendering
      setTimeout(() => {
        const taskElement = taskRefs.current[highlightId];
        if (taskElement) {
          taskElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Remove highlight after a few seconds
          setTimeout(() => {
            setHighlightedTaskId(null);
          }, 3000);
        }
      }, 100);
    }
  }, [tasks]);

  return (
    <>
      {loading && <div className="text-center py-4">Loading tasks...</div>}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">All Tasks</h1>
          </div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Add Task
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Statuses</option>
            {Object.values(TaskStatus).map((status: string) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Priorities</option>
            {Object.values(TaskPriority).map((priority: string) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Assignees</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        {/* Card-based tasks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {filteredTasks.map((task: TaskWithSync, idx: number) => {
            const assignee = teamMembers.find(tm => tm.id === task.assigneeId);
            const linkedInfo = getLinkedInfo(task);
            const dueDate = new Date(task.dueDate);
            const isOverdue = dueDate < today && task.status !== TaskStatus.Completed;
            
            return (
              <div
                key={task.id ? task.id : `task-card-${idx}`}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer group min-w-[320px] max-w-full w-full ${
                  highlightedTaskId === task.id ? 'ring-4 ring-primary-500 ring-opacity-75 shadow-2xl transform scale-[1.02] bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
                style={{ minWidth: 320, maxWidth: '100%' }}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.card-action-btn')) return;
                  handleOpenDetails(task);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${task.title}`}
                ref={el => { if (el) taskRefs.current[task.id] = el; }}
              >
                {/* Sync status indicator */}
                <div className="absolute top-4 left-4 z-10">
                  {task._pendingDelete ? (
                    <span title="Pending Deletion" className="inline-flex items-center text-red-400 bg-red-50 dark:bg-red-900 rounded-full px-2 py-1 text-xs font-semibold opacity-70">
                      🗑️ Deleting
                    </span>
                  ) : task.syncStatus === 'pending' ? (
                    <span title="Pending Sync" className="inline-flex items-center text-yellow-500 bg-yellow-50 dark:bg-yellow-900 rounded-full px-2 py-1 text-xs font-semibold">
                      ⏳ Syncing
                    </span>
                  ) : task.syncStatus === 'error' ? (
                    <span title="Sync Error" className="inline-flex items-center text-red-500 bg-red-50 dark:bg-red-900 rounded-full px-2 py-1 text-xs font-semibold">
                      ⚠️ Error
                    </span>
                  ) : (
                    <span title="Synced" className="inline-flex items-center text-green-500 bg-green-50 dark:bg-green-900 rounded-full px-2 py-1 text-xs font-semibold opacity-60">
                      ✅ Synced
                    </span>
                  )}
                </div>
                {/* Top row: Action icons */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedTask(task); setDeleteModalOpen(true); }}
                    className="card-action-btn text-red-600 hover:text-red-800 bg-white/20 dark:bg-gray-800/40 rounded-full p-2 shadow focus:outline-none"
                    title="Delete Task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Task title and description */}
                <div className="mb-4">
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-16 line-clamp-2">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {task.description}
                    </div>
                  )}
                </div>

                {/* Status, Priority, and Due Date */}
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                  <span className={`text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    Due: {dueDate.toLocaleDateString()}
                  </span>
                </div>

                {/* Linked Info */}
                {linkedInfo && (
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${linkedInfo.color}`}>
                      {linkedInfo.type}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 truncate">
                      {linkedInfo.name}
                    </span>
                  </div>
                )}

                {/* Assignee */}
                <div className="flex items-center justify-between">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={assignee.avatarUrl} 
                        alt={assignee.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
                  )}

                  {/* Timer controls */}
                  <div className="flex items-center gap-2">
                    {activeTimer?.taskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-red-500">{formatTime(elapsedTime)}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStopTimer(task); }}
                          className="card-action-btn p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                          title="Stop Timer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartTimer(task); }}
                        disabled={!!activeTimer}
                        className="card-action-btn flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-green-800 dark:hover:text-green-300 focus:outline-none"
                        title="Start Timer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || assigneeFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first task.'
              }
            </p>
            {(!searchTerm && statusFilter === 'All' && priorityFilter === 'All' && assigneeFilter === 'All') && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Create Task
              </button>
            )}
          </div>
        )}
      </div>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        contacts={contacts}
        leads={leads}
        opportunities={opportunities}
        projects={projects}
        teamMembers={teamMembers}
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
        />
      )}
      {selectedTask && (
        <LogTimeModal
          isOpen={isLogTimeModalOpen}
          onClose={() => setLogTimeModalOpen(false)}
          onSubmit={handleLogTimeForTask}
          contacts={contacts}
          task={selectedTask}
          initialDuration={logTimeInitialDuration}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${selectedTask?.title}"?`}
       />
    </>
  );
};

export default Tasks;
