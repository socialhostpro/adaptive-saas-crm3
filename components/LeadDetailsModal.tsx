import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, Activity, ActivityType, Task, TaskStatus, TaskPriority, Contact, TeamMember } from '../types';
import LogActivityModal from './LogActivityModal';
import CreateTaskModal from './CreateTaskModal';
import ConvertLeadModal from './ConvertLeadModal'; 

interface LeadDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    activities: Activity[];
    tasks: Task[];
    contacts: Contact[];
    teamMembers: TeamMember[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    currentUser?: TeamMember;
    onConvert: (lead: Lead) => void;
}

const LeadStatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";
  switch (status) {
    case LeadStatus.New: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case LeadStatus.Contacted: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case LeadStatus.Qualified: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case LeadStatus.Lost: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
    case LeadStatus.Converted: colorClasses = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
  let colorClasses = "";
  switch (status) {
    case TaskStatus.ToDo: colorClasses = "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case TaskStatus.InProgress: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case TaskStatus.Completed: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
  let colorClasses = "";
  switch (priority) {
    case TaskPriority.High: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
    case TaskPriority.Medium: colorClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"; break;
    case TaskPriority.Low: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{priority}</span>;
};


const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  const baseClasses = "h-5 w-5 text-white";
  switch (type) {
    case ActivityType.Call: return <div className="p-2 bg-blue-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg></div>;
    case ActivityType.Email: return <div className="p-2 bg-red-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg></div>;
    case ActivityType.Meeting: return <div className="p-2 bg-purple-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.483 1.094-.907 1.722-1.262M12 15.75A9.07 9.07 0 002.25 12c0-1.75.53-3.372 1.442-4.75M12 15.75c-.345 0-.683-.024-1.017-.07M12 15.75c-4.142 0-7.5-3.358-7.5-7.5S7.858.75 12 .75s7.5 3.358 7.5 7.5c0 1.17-.26 2.29-.726 3.336" /></svg></div>;
    default: return <div className="p-2 bg-gray-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg></div>;
  }
};


type ActiveTab = 'details' | 'activities' | 'tasks' | 'info';

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = (props) => {
    const { isOpen, onClose, lead, activities, tasks, contacts, teamMembers, setActivities, setTasks, currentUser, onConvert } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');
    const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    // Info Q&A state
    const [infoQA, setInfoQA] = useState<Array<{ question: string; answer: string }>>(() => {
        // Try to load from lead.info if present and valid JSON
        if (lead && typeof lead.info === 'string') {
            try {
                const parsed = JSON.parse(lead.info);
                if (Array.isArray(parsed)) return parsed;
            } catch {}
        }
        return [];
    });

    const leadActivities = useMemo(() => activities.filter(a => a.leadId === lead.id).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()), [activities, lead.id]);
    const leadTasks = useMemo(() => tasks.filter(t => t.leadId === lead.id), [tasks, lead.id]);

    const handleLogActivity = (newActivity: Omit<Activity, 'id'>, followUpTask?: Omit<Task, 'id'>) => {
        setActivities(prev => [{ ...newActivity, id: `act-${Date.now()}` }, ...prev]);
        if (followUpTask) {
            setTasks(prev => [{ ...followUpTask, id: `task-${Date.now()}` }, ...prev]);
        }
        setIsLogActivityOpen(false);
    };

    const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            ...newTaskData,
            id: `task-${Date.now()}`,
        };
        setTasks(prev => [newTask, ...prev]);
        setIsCreateTaskOpen(false);
    };

    if (!isOpen) return null;
    
    const TabButton: React.FC<{tab: ActiveTab, label: string, count: number}> = ({tab, label, count}) => (
         <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            {label} <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-1">{count}</span>
        </button>
    );

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl no-print">&times;</button>
                </header>

                <div className="border-b border-gray-200 dark:border-gray-700 px-4 no-print overflow-x-auto">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4">
                        <TabButton tab="details" label="Details" count={0} />
                        <TabButton tab="activities" label="Activities" count={leadActivities.length} />
                        <TabButton tab="tasks" label="Tasks" count={leadTasks.length} />
                        <TabButton tab="info" label="Info" count={infoQA.length} />
                    </nav>
                </div>

                <main className="modal-content-wrapper flex-grow p-4 sm:p-6 overflow-y-auto">
                   {activeTab === 'details' && (
                       <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                                <a href={`mailto:${lead.email}`} className="text-sm text-primary-600 dark:text-primary-500 hover:underline break-all">{lead.email}</a>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                                <LeadStatusBadge status={lead.status} />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Contacted</span>
                                <span className="text-sm text-gray-800 dark:text-gray-200">{lead.lastContacted}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lead Score: <span className="font-bold text-primary-500">{lead.score}</span></label>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${lead.score}%` }}></div>
                                </div>
                            </div>
                        </div>
                   )}
                   {activeTab === 'activities' && (
                       <div>
                            <button onClick={() => setIsLogActivityOpen(true)} className="w-full mb-4 bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700">Log New Activity</button>
                            <div className="space-y-4">
                               {leadActivities.length > 0 ? leadActivities.map(activity => (
                                   <div key={activity.id} className="flex gap-3">
                                       <ActivityIcon type={activity.type} />
                                       <div className="flex-grow">
                                           <p className="text-sm text-gray-800 dark:text-gray-200">{activity.summary}</p>
                                           <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp.toLocaleString()}</p>
                                       </div>
                                   </div>
                               )) : <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No activities logged for this lead yet.</p>}
                            </div>
                       </div>
                   )}
                   {activeTab === 'tasks' && (
                       <div>
                           <button onClick={() => setIsCreateTaskOpen(true)} className="w-full mb-4 bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700">Add New Task</button>
                            <div className="space-y-3">
                                {leadTasks.length > 0 ? leadTasks.map(task => (
                                    <div key={task.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TaskPriorityBadge priority={task.priority} />
                                            <TaskStatusBadge status={task.status} />
                                        </div>
                                    </div>
                                )) : <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No tasks assigned to this lead yet.</p>}
                            </div>
                       </div>
                   )}
                   {activeTab === 'info' && (
                       <div className="space-y-4">
                           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Lead Info (Q&A)</h3>
                           {infoQA.length === 0 && <div className="text-gray-500 text-sm">No info submitted yet.</div>}
                           <ul className="space-y-2">
                               {infoQA.map((qa, idx) => (
                                   <li key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                       <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Q: {qa.question}</div>
                                       <div className="text-sm text-gray-900 dark:text-white mt-1">A: {qa.answer}</div>
                                   </li>
                               ))}
                           </ul>
                           {/* JSON input for admin/dev: paste JSON array of Q&A */}
                           <div className="mt-4">
                               <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paste Q&A JSON (admin/dev only):</label>
                               <textarea
                                   className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-xs"
                                   rows={3}
                                   value={JSON.stringify(infoQA, null, 2)}
                                   onChange={e => {
                                       try {
                                           const arr = JSON.parse(e.target.value);
                                           if (Array.isArray(arr)) setInfoQA(arr);
                                       } catch {}
                                   }}
                               />
                               <button
                                   className="mt-2 bg-primary-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-primary-700"
                                   onClick={() => {
                                       // Save to state/store for sync
                                       // TODO: integrate with global store updateLead
                                       // For now, just alert
                                       alert('Q&A saved in modal state. Implement sync to backend/global store as needed.');
                                   }}
                               >Save Q&A</button>
                           </div>
                       </div>
                   )}
                </main>
                 <footer className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center no-print">
                    <button type="button" onClick={() => window.print()} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">Print Details</button>
                    <div>
                        {lead.status === LeadStatus.Qualified && (
                             <button onClick={() => onConvert(lead)} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">Convert Lead</button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
        
        <LogActivityModal
            isOpen={isLogActivityOpen}
            onClose={() => setIsLogActivityOpen(false)}
            onSubmit={handleLogActivity}
            contacts={contacts}
            lead={lead}
        />
        <CreateTaskModal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            onSubmit={handleCreateTask}
            contacts={contacts}
            teamMembers={teamMembers}
            lead={lead}
            currentUser={currentUser}
        />
        </>
    );
};

export default LeadDetailsModal;