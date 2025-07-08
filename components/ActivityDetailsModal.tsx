
import React from 'react';
import { Activity, ActivityType } from '../types';

const ActivityIcon: React.FC<{ type: ActivityType, size?: string }> = ({ type, size = 'lg' }) => {
  const sizeClasses = size === 'md' ? 'h-5 w-5' : 'h-8 w-8';
  const baseClasses = `${sizeClasses} text-white`;
  const wrapperSize = size === 'md' ? 'p-2' : 'p-3';

  switch (type) {
    case ActivityType.Call: return <div className={`${wrapperSize} bg-blue-500 rounded-full`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg></div>;
    case ActivityType.Email: return <div className={`${wrapperSize} bg-red-500 rounded-full`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg></div>;
    case ActivityType.Meeting: return <div className={`${wrapperSize} bg-purple-500 rounded-full`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.483 1.094-.907 1.722-1.262M12 15.75A9.07 9.07 0 002.25 12c0-1.75.53-3.372 1.442-4.75M12 15.75c-.345 0-.683-.024-1.017-.07M12 15.75c-4.142 0-7.5-3.358-7.5-7.5S7.858.75 12 .75s7.5 3.358 7.5 7.5c0 1.17-.26 2.29-.726 3.336" /></svg></div>;
    default: return <div className={`${wrapperSize} bg-gray-500 rounded-full`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg></div>;
  }
};

interface ActivityDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ isOpen, onClose, activity }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <ActivityIcon type={activity.type} />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ActivityType[activity.type]}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">With: {activity.contactName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{activity.timestamp.toLocaleString()}</p>
                    </div>

                    {activity.subject && <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{activity.subject}</p>
                    </div>}

                    {activity.location && <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{activity.location}</p>
                    </div>}
                    
                    {activity.duration && <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{activity.duration} minutes</p>
                    </div>}

                    {activity.outcome && <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Outcome</p>
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{activity.outcome}</p>
                    </div>}

                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Summary</p>
                        <p className="text-md text-gray-800 dark:text-gray-200 mt-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{activity.summary}</p>
                    </div>

                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Close</button>
                </footer>
            </div>
        </div>
    );
};

export default ActivityDetailsModal;
