
import React from 'react';
import { Lead } from '../../types';

interface RecentLeadsWidgetProps {
    leads: Lead[];
}

const RecentLeadsWidget: React.FC<RecentLeadsWidgetProps> = ({ leads }) => {
    const recentLeads = [...leads].sort((a, b) => {
        // A more robust sorting would be needed if lastContacted was a Date object
        return b.id.localeCompare(a.id);
    });

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Leads</h3>
             {recentLeads.length > 0 ? (
                 <div className="flex-grow space-y-3">
                    {recentLeads.slice(0,5).map(lead => (
                         <div key={lead.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{lead.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{lead.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${lead.score}%` }}></div>
                                </div>
                                <span className="text-xs font-medium w-6 text-right">{lead.score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No leads found.</p>
                </div>
            )}
        </div>
    )
};

export default RecentLeadsWidget;
