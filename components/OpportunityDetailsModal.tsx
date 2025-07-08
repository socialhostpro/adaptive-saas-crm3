import React, { useMemo } from 'react';
import { Opportunity, OpportunityStage, OpportunityType, Activity, ActivityType, TeamMember } from '../types';

interface OpportunityDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: Opportunity;
    activities: Activity[];
    teamMembers: TeamMember[];
    onEdit: () => void;
    onDelete: () => void;
}

const stageColors: { [key in OpportunityStage]: { border: string, bg: string, text: string } } = {
    [OpportunityStage.Prospecting]: { border: 'border-gray-400', bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-500 dark:text-gray-400' },
    [OpportunityStage.Qualification]: { border: 'border-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    [OpportunityStage.Proposal]: { border: 'border-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    [OpportunityStage.Negotiation]: { border: 'border-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    [OpportunityStage.ClosedWon]: { border: 'border-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    [OpportunityStage.ClosedLost]: { border: 'border-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
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


const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({ isOpen, onClose, opportunity, activities, teamMembers, onEdit, onDelete }) => {
    
    const relevantActivities = useMemo(() => {
        return activities
            .filter(a => a.contactId === opportunity.contactId)
            .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [activities, opportunity.contactId]);
    
    const assignee = useMemo(() => teamMembers.find(tm => tm.id === opportunity.assigneeId), [teamMembers, opportunity.assigneeId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{opportunity.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">For: {opportunity.contactName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Value</p>
                            <p className="text-xl font-bold text-primary-500">${opportunity.value.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                            <span className="px-2 py-1 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{opportunity.type}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stage</p>
                             <span className={`px-2 py-1 text-sm font-semibold rounded-md ${stageColors[opportunity.stage].bg} ${stageColors[opportunity.stage].text}`}>{opportunity.stage}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{opportunity.startDate ? new Date(opportunity.startDate).toLocaleDateString() : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expected Due Date</p>
                            <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{opportunity.dueDate ? new Date(opportunity.dueDate).toLocaleDateString() : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Assignee</p>
                            {assignee ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full" />
                                    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{assignee.name}</p>
                                </div>
                            ) : (
                                <p className="text-md font-semibold text-gray-500 dark:text-gray-400 mt-1">Unassigned</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Details</p>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 min-h-[40px] text-gray-900 dark:text-white text-sm">{opportunity.details || <span className="text-gray-400">No details provided.</span>}</div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 min-h-[40px] text-gray-900 dark:text-white text-sm">{opportunity.notes || <span className="text-gray-400">No notes.</span>}</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Recent Activity with {opportunity.contactName}</h3>
                        <div className="space-y-4">
                            {relevantActivities.length > 0 ? relevantActivities.slice(0, 5).map(activity => (
                                <div key={activity.id} className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 pt-1">
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{activity.summary}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp.toLocaleString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No activities logged for this contact yet.</p>
                            )}
                        </div>
                    </div>
                </main>
                 <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <button type="button" onClick={onDelete} className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 transition-colors text-sm">Delete</button>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="button" onClick={onEdit} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Edit</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default OpportunityDetailsModal;