import React, { useState } from 'react';
import { Contact, Activity, Task, Opportunity, Project, TeamMember, ActivityType, TaskStatus, Case } from '../types';
import EmailModal from './EmailModal';
import CreateContactModal from './CreateContactModal';

// Fix ContactSyncStatus type to allow all values
export type ContactSyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';

interface ContactDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
    activities: Activity[];
    tasks: Task[];
    opportunities: Opportunity[];
    projects: Project[];
    cases: Case[];
    teamMembers: TeamMember[];
    currentUser?: TeamMember;
    syncStatus?: ContactSyncStatus;
    onRetrySync?: () => void;
}

type ActiveTab = 'overview' | 'activities' | 'tasks' | 'opportunities' | 'projects' | 'cases' | 'billing' | 'estimates' | 'team';

const TabButton: React.FC<{tab: ActiveTab, label: string; count: number; activeTab: ActiveTab; onClick: () => void}> = 
({tab, label, count, activeTab, onClick}) => (
     <button onClick={onClick} className={`px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
        {label} <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-1">{count}</span>
    </button>
);

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  const baseClasses = "h-4 w-4 text-white";
  switch (type) {
    case ActivityType.Call: return <div className="p-1.5 bg-blue-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg></div>;
    case ActivityType.Email: return <div className="p-1.5 bg-red-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg></div>;
    case ActivityType.Meeting: return <div className="p-1.5 bg-purple-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.483 1.094-.907 1.722-1.262M12 15.75A9.07 9.07 0 002.25 12c0-1.75.53-3.372 1.442-4.75M12 15.75c-.345 0-.683-.024-1.017-.07M12 15.75c-4.142 0-7.5-3.358-7.5-7.5S7.858.75 12 .75s7.5 3.358 7.5 7.5c0 1.17-.26 2.29-.726 3.336" /></svg></div>;
    default: return <div className="p-1.5 bg-gray-500 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg></div>;
  }
};

const SyncStatusBadge: React.FC<{ status: ContactSyncStatus; onRetry?: () => void }> = ({ status, onRetry }) => {
  let label = '';
  let color = '';
  let showSyncIcon = false;
  let animate = false;
  switch (status) {
    case 'pending':
      label = 'Pending Sync';
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      showSyncIcon = true;
      break;
    case 'syncing':
      label = 'Syncing...';
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      showSyncIcon = true;
      animate = true;
      break;
    case 'failed':
      label = 'Sync Failed';
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      showSyncIcon = true;
      break;
    case 'synced':
      label = 'Synced';
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
  }
  return (
    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${color}`}>
      {showSyncIcon && (
        <button
          onClick={onRetry}
          title={status === 'failed' ? 'Retry Sync' : 'Sync Now'}
          className={`w-5 h-5 flex items-center justify-center rounded-full border-none bg-transparent p-0 focus:outline-none ${status === 'failed' ? 'hover:bg-red-200 dark:hover:bg-red-800' : 'hover:bg-blue-200 dark:hover:bg-blue-800'}`}
          style={{marginRight: '2px'}}
        >
          <svg
            className={`w-4 h-4 ${animate ? 'animate-spin' : ''} ${status === 'failed' ? 'text-red-500' : 'text-blue-500'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.062 19A9 9 0 0021 12.003M18.938 5A9 9 0 003 11.997" />
          </svg>
        </button>
      )}
      {label}
    </span>
  );
};

// Sync icon button for header (upper right)
const SyncIconButton: React.FC<{ status: ContactSyncStatus; onClick?: () => void }> = ({ status, onClick }) => {
  const animate = status === 'syncing';
  const color = status === 'failed' ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900' : 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900';
  return (
    <button
      onClick={onClick}
      title={status === 'failed' ? 'Retry Sync' : 'Sync Now'}
      className={`w-9 h-9 flex items-center justify-center rounded-full border-none bg-transparent p-0 focus:outline-none transition ${color}`}
      style={{marginRight: 0}}
    >
      <svg
        className={`w-5 h-5 ${animate ? 'animate-spin' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.062 19A9 9 0 0021 12.003M18.938 5A9 9 0 003 11.997" />
      </svg>
    </button>
  );
};

// Add MapIcon and CalendarIcon for header
const MapIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.946l5.447-1.362a2 2 0 01.894 0l5.447 1.362A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.946L15 20m-6 0V4m6 16V4" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);
const CalendarIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ContactDetailsModal: React.FC<ContactDetailsModalProps & { syncStatus?: ContactSyncStatus; onRetrySync?: () => void }> = (props) => {
    const { isOpen, onClose, contact, activities, tasks, opportunities, projects, cases, teamMembers, syncStatus, onRetrySync } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const owner = teamMembers.find(tm => tm.id === contact.created_by);
    const tabList: { key: ActiveTab; label: string }[] = [
      { key: 'overview', label: 'Overview' },
      { key: 'activities', label: 'Activities' },
      { key: 'tasks', label: 'Tasks' },
      { key: 'opportunities', label: 'Opportunities' },
      { key: 'projects', label: 'Projects' },
      { key: 'cases', label: 'Cases' },
      { key: 'billing', label: 'Billing' },
      { key: 'estimates', label: 'Estimates' },
      { key: 'team', label: 'Team' },
    ];

    // Tab content rendering
    const renderTabContent = () => {
      switch (activeTab) {
        case 'overview':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Full Name</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Email</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Title</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.title || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Company/Business</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.company || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Phone</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.phone || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Address</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{contact.address || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Created By</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700">
                    {owner ? <><img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600" /><span className="font-semibold text-gray-800 dark:text-white">{owner.name}</span><span className="ml-1 text-gray-400">({owner.role})</span></> : <span className="italic text-gray-400">Unknown</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Assign to Project</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{projects.find(p => p.id === contact.projectId)?.name || 'None'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Assign to Opportunity</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{opportunities.find(o => o.id === contact.opportunityId)?.title || 'None'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Assign to Lead</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{teamMembers.find(l => l.id === contact.leadId)?.name || 'None'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Assign to Case</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{cases.find(ca => ca.id === contact.caseId)?.name || 'None'}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary-700 dark:text-primary-200 mb-1">Info</label>
                  <div className="bg-white dark:bg-gray-900 rounded px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white min-h-[40px]">{contact.info || '—'}</div>
                </div>
              </div>
            </div>
          );
        case 'activities':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">All Activity</h3>
                <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700" onClick={() => {/* open log activity modal */}}>
                  <i className="fas fa-plus mr-1"></i> Log Activity
                </button>
              </div>
              <div className="space-y-6">
                {activities && activities.length > 0 ? activities.map(activity => (
                  <div key={activity.id} className="activity-item pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                          <p className="text-xs text-gray-400">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{activity.summary}</p>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-gray-400">No activity for this contact.</div>}
              </div>
            </div>
          );
        case 'tasks':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700" onClick={() => {/* open create task modal */}}>
                  <i className="fas fa-plus mr-1"></i> Add Task
                </button>
              </div>
              <div className="space-y-4">
                {tasks && tasks.length > 0 ? tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" checked={task.status === TaskStatus.Completed} readOnly />
                        <span className={`ml-3 text-sm font-medium text-gray-900 ${task.status === TaskStatus.Completed ? 'line-through' : ''}`}>{task.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${task.status === TaskStatus.Completed ? 'bg-green-100 text-green-800' : task.status === TaskStatus.InProgress ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                    </div>
                )) : <div className="text-gray-400">No tasks for this contact.</div>}
              </div>
            </div>
          );
        case 'opportunities':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Opportunities</h3>
                <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700" onClick={() => {/* open create opportunity modal */}}>
                  <i className="fas fa-plus mr-1"></i> Add Opportunity
                </button>
              </div>
              <div className="space-y-4">
                {opportunities && opportunities.length > 0 ? opportunities.map(opp => (
                  <div key={opp.id} className="flex flex-col p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-indigo-700">{opp.title}</h3>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                    </div>
                  </div>
                )) : <div className="text-gray-400">No opportunities for this contact.</div>}
              </div>
            </div>
          );
        case 'projects':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Projects</h3>
                <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700" onClick={() => {/* open create project modal */}}>
                  <i className="fas fa-plus mr-1"></i> Add Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects && projects.length > 0 ? projects.map(proj => (
                  <div key={proj.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 bg-indigo-50">
                      <h3 className="font-medium text-indigo-700">{proj.name}</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mt-4 text-sm text-gray-500">
                      </div>
                    </div>
                  </div>
                )) : <div className="text-gray-400">No projects for this contact.</div>}
              </div>
            </div>
          );
        case 'cases':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-purple-800">Legal Cases</h3>
                <button className="px-3 py-1 text-sm font-medium text-white bg-purple-700 rounded-md hover:bg-purple-800" onClick={() => {/* open create case modal */}}>
                  <i className="fas fa-plus mr-1"></i> New Case
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Case #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Opened</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-purple-100">
                    {cases && cases.length > 0 ? cases.map(cs => (
                      <tr key={cs.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">{cs.caseNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700">{cs.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${cs.status === 'Closed - Won' ? 'bg-green-100 text-green-800' : cs.status === 'Closed - Lost' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>{cs.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700">{cs.openDate ? new Date(cs.openDate).toLocaleDateString() : ''}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700">{cs.closeDate ? new Date(cs.closeDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    )) : <tr><td colSpan={5} className="text-purple-400 text-center py-4">No legal cases for this contact.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          );
        case 'billing':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Billing & Timed Billing</h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded font-semibold hover:bg-primary-700" onClick={() => {/* TODO: open add invoice modal */}}>+ Add Invoice</button>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900 rounded p-4">
                <p className="text-primary-800 dark:text-primary-200">Timed billing, invoices, and time entries for this contact will appear here.</p>
              </div>
            </div>
          );
        case 'estimates':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Estimates</h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded font-semibold hover:bg-primary-700" onClick={() => {/* TODO: open add estimate modal */}}>+ Add Estimate</button>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900 rounded p-4">
                <p className="text-primary-800 dark:text-primary-200">Estimates for this contact will appear here.</p>
              </div>
            </div>
          );
        case 'team':
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Team Members Assigned</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers && teamMembers.length > 0 ? teamMembers.map(tm => (
                  <div key={tm.id} className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900 rounded p-3">
                    <img src={tm.avatarUrl} alt={tm.name} className="w-10 h-10 rounded-full object-cover border border-primary-200" />
                    <div>
                      <div className="font-semibold text-primary-800 dark:text-primary-200">{tm.name}</div>
                      <div className="text-xs text-primary-600 dark:text-primary-300">{tm.role}</div>
                      <div className="text-xs text-primary-400 dark:text-primary-400">{tm.email}</div>
                    </div>
                  </div>
                )) : <div className="text-gray-400">No team members assigned to this contact.</div>}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    // New: Modern header and layout
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-200">
                {contact.name ? contact.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{contact.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{contact.title || '—'} @ {contact.company || '—'}</div>
              </div>
              {syncStatus && <SyncStatusBadge status={syncStatus} onRetry={onRetrySync} />}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-300"
                title="Edit Contact"
                onClick={() => setIsEditModalOpen(true)}
              >
                <i className="fas fa-edit"></i>
              </button>
              {/* Remove SyncIconButton from header actions */}
              <button
                className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Close"
                onClick={onClose}
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {tabList.map(tab => (
              <TabButton
                key={tab.key}
                tab={tab.key}
                label={tab.label}
                count={(() => {
                  switch (tab.key) {
                    case 'activities': return activities.length;
                    case 'tasks': return tasks.length;
                    case 'opportunities': return opportunities.length;
                    case 'projects': return projects.length;
                    case 'cases': return cases.length;
                    case 'team': return teamMembers.length;
                    default: return 0;
                  }
                })()}
                activeTab={activeTab}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
          {/* Tab Content */}
          <div className="p-6 bg-white dark:bg-gray-800 max-h-[70vh] overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
        {/* Email Modal */}
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          recipientName={contact.name}
          recipientEmail={contact.email}
          subject={`Regarding ${contact.company}`}
        />
        {/* Edit Contact Modal (true edit mode) */}
        <CreateContactModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={updatedContact => {
            // Optimistically update contact in parent/global state (should be passed as prop or via context)
            setIsEditModalOpen(false);
            // TODO: Call parent update handler if needed
          }}
        />
      </div>
    );
};

export default ContactDetailsModal;