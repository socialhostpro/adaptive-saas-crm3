
import React, { useMemo } from 'react';
import { TeamMember, TeamMemberStatus, TimeEntry, Task, Activity, ActivityType } from '../types';

interface TeamMemberDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember | null;
    timeEntries: TimeEntry[];
    tasks?: Task[];
    activities?: Activity[];
    onStartDM?: (conversationId: string, participant: TeamMember) => void;
    onViewAllActivities?: () => void;
}

const StatusIndicator: React.FC<{ status: TeamMemberStatus, large?: boolean }> = ({ status, large = false }) => {
    let color = '';
    switch (status) {
        case TeamMemberStatus.Online: color = 'bg-green-500'; break;
        case TeamMemberStatus.Away: color = 'bg-yellow-500'; break;
        case TeamMemberStatus.Offline: color = 'bg-gray-400'; break;
    }
    const size = large ? 'h-4 w-4' : 'h-3.5 w-3.5';
    const ring = large ? 'ring-4' : 'ring-2';
    return <span className={`absolute bottom-0 right-0 block rounded-full ${ring} ring-white dark:ring-gray-800 ${color} ${size}`} />;
};

const ActivityIcon: React.FC<{ type: ActivityType, className?: string }> = ({ type, className = "h-4 w-4" }) => {
    switch (type) {
        case ActivityType.Call:
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            );
        case ActivityType.Email:
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            );
        case ActivityType.Meeting:
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            );
        case ActivityType.Note:
        default:
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            );
    }
};


const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    member, 
    timeEntries, 
    tasks = [], 
    activities = [], 
    onStartDM,
    onViewAllActivities 
}) => {
    const stats = useMemo(() => {
        const totalHours = timeEntries.reduce((sum, te) => sum + te.duration, 0);
        const billableHours = timeEntries.filter(te => te.isBillable).reduce((sum, te) => sum + te.duration, 0);
        const billablePercentage = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
        return { totalHours, billableHours, billablePercentage };
    }, [timeEntries]);
    
    const recentEntries = useMemo(() => {
        return [...timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [timeEntries]);
    
    const recentActivities = useMemo(() => {
        // Filter activities related to this team member (where they might be mentioned or assigned)
        const memberActivities = activities.filter(activity => {
            // Check if activity is related to this team member by name or ID
            const memberName = member?.name.toLowerCase();
            const activityText = `${activity.summary} ${activity.contactName}`.toLowerCase();
            return memberName && activityText.includes(memberName);
        });
        return memberActivities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3);
    }, [activities, member]);
    
    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Member Details</h2>
                    <div className="flex items-center gap-2">
                        {/* DM Chat Button */}
                        {onStartDM && (
                            <button
                                onClick={() => onStartDM(`dm-${member.id}`, member)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                title="Start Direct Message"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="hidden sm:inline">Chat</span>
                            </button>
                        )}
                        {/* Close Button */}
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                            <img 
                                className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600" 
                                src={member.avatarUrl} 
                                alt={member.name} 
                            />
                            <StatusIndicator status={member.status} large />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-lg text-primary-500 font-medium">{member.role}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {member.status === 'Offline' ? `Last seen: ${member.lastSeen}` : member.lastSeen}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Contact Information</h3>
                             <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                 <a 
                                     href={`mailto:${member.email}`}
                                     className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 hover:underline transition-colors cursor-pointer"
                                     title="Send email"
                                 >
                                     {member.email}
                                 </a>
                            </div>
                             {member.phone && (
                                 <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.842 18 2 13.158 2 8V3z" /></svg>
                                     <a 
                                         href={`tel:${member.phone}`}
                                         className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 hover:underline transition-colors cursor-pointer"
                                         title="Call phone"
                                     >
                                         {member.phone}
                                     </a>
                                </div>
                             )}
                             {!member.phone && (
                                 <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.842 18 2 13.158 2 8V3z" /></svg>
                                     <span className="text-sm text-gray-500 dark:text-gray-400">No phone number</span>
                                </div>
                             )}
                            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                 <span className="text-sm text-gray-800 dark:text-gray-200">Hired on {member.hireDate ? new Date(member.hireDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Time Stats</h3>
                            <div className="grid grid-cols-3 text-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                 <div>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHours.toFixed(1)}</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Total Hours</p>
                                 </div>
                                  <div>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.billableHours.toFixed(1)}</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Billable Hours</p>
                                 </div>
                                  <div>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.billablePercentage}%</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Billable %</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Activities Section */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Recent Activities</h3>
                            {onViewAllActivities && (
                                <button
                                    onClick={() => {
                                        onViewAllActivities();
                                        onClose();
                                    }}
                                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 font-medium transition-colors"
                                >
                                    View All Activities →
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {recentActivities.length > 0 ? recentActivities.map(activity => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`p-2 rounded-full ${
                                            activity.type === ActivityType.Call ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                                            activity.type === ActivityType.Email ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                                            activity.type === ActivityType.Meeting ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' :
                                            'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                        }`}>
                                            <ActivityIcon type={activity.type} className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.summary}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {activity.contactName} • {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                        {activity.duration && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Duration: {activity.duration} minutes
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-center text-gray-500 py-4">No recent activities found.</p>
                            )}
                        </div>
                    </div>
                    
                     <div className="mt-6">
                         <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Recent Time Entries</h3>
                         <ul className="space-y-2">
                             {recentEntries.length > 0 ? recentEntries.map(entry => (
                                 <li key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                                     <div className="flex-1">
                                         <div className="flex items-start justify-between">
                                             <div>
                                                 <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.description}</p>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                     {new Date(entry.date).toLocaleDateString()} for {entry.contactName}
                                                 </p>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 {entry.taskId && (
                                                     <a
                                                         href={`/#/tasks?highlight=${entry.taskId}`}
                                                         className="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                                                         title={`View task: ${tasks.find(t => t.id === entry.taskId)?.title || 'Related task'}`}
                                                         onClick={() => {
                                                             // Close modal when navigating to task
                                                             onClose();
                                                         }}
                                                     >
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                         </svg>
                                                     </a>
                                                 )}
                                                 <div className="text-right">
                                                     <p className="font-semibold text-sm text-gray-900 dark:text-white">{entry.duration.toFixed(2)}h</p>
                                                     {entry.isBillable && <p className="text-xs text-green-600">Billable</p>}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </li>
                             )) : <p className="text-sm text-center text-gray-500 py-4">No time entries found.</p>}
                         </ul>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMemberDetailsModal;