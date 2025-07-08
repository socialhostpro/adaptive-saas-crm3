import React, { useState, useMemo } from 'react';
import { Activity, ActivityType, Task, Contact } from '../types';
import Card from './shared/Card';
import LogActivityModal from './LogActivityModal';
import ActivityDetailsModal from './ActivityDetailsModal';
import { useGlobalStore } from '../hooks/useGlobalStore';

interface ActivitiesProps {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  contacts: Contact[];
  appContext: any;
}

const ActivityIcon: React.FC<{ type: ActivityType, size?: string }> = ({ type, size = 'md' }) => {
  const wrapperSize = size === 'md' ? 'p-2' : 'p-3';

  switch (type) {
    case ActivityType.Call: return <div className={`${wrapperSize} bg-blue-500 rounded-full`}>{/* ...icon... */}</div>;
    case ActivityType.Email: return <div className={`${wrapperSize} bg-red-500 rounded-full`}>{/* ...icon... */}</div>;
    case ActivityType.Meeting: return <div className={`${wrapperSize} bg-purple-500 rounded-full`}>{/* ...icon... */}</div>;
    default: return <div className={`${wrapperSize} bg-gray-500 rounded-full`}>{/* ...icon... */}</div>;
  }
};

const Activities: React.FC<ActivitiesProps> = ({ setTasks, contacts, appContext }) => {
  // Use Zustand global store for activities
  const activities = useGlobalStore(state => state.activities);
  const setActivities = useGlobalStore(state => state.setActivities);

  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);

  // CREATE activity (and optional follow-up task)
  const handleLogActivity = (newActivity: Omit<Activity, 'id'>, followUpTask?: Omit<Task, 'id'>) => {
    setError(null);
    try {
      const activityToInsert: Activity = { ...newActivity, id: `act-${Date.now()}` };
      setActivities([activityToInsert, ...activities]);
      if (followUpTask) {
        const taskToInsert: Task = { ...followUpTask, id: `task-${Date.now()}` };
        setTasks(prev => [taskToInsert, ...prev]);
      }
      setLogModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to log activity.');
    }
  };

  const handleOpenDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setDetailsModalOpen(true);
  };

  const sortedActivities = useMemo(() => {
    return [...activities]
      .map(a => ({
        ...a,
        timestamp: a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activities]);

  return (
    <>
      {/* Error state */}
      {error && <div className="text-center text-red-500 py-2">{error}</div>}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          </div>
          <button 
            onClick={() => setLogModalOpen(true)}
            className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Log Activity
          </button>
        </div>
        <div className="relative pl-8">
            <div className="absolute left-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" style={{transform: 'translateX(20px)'}}></div>
            {sortedActivities.map(activity => (
                <div key={activity.id} className="relative mb-8">
                    <div className="absolute left-0">
                        <ActivityIcon type={activity.type} size="lg"/>
                    </div>
                    <Card onClick={() => handleOpenDetails(activity)} className="ml-16 cursor-pointer hover:shadow-lg dark:hover:bg-gray-700/60 transition-shadow">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{ActivityType[activity.type]} with {activity.contactName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {activity.timestamp.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Intl.RelativeTimeFormat('en', { style: 'short' }).format(Math.floor((activity.timestamp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), 'day')}
                            </span>
                        </div>
                        {activity.subject && <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">Subject: {activity.subject}</p>}
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 truncate">{activity.summary}</p>
                    </Card>
                </div>
            ))}
        </div>
      </div>
      <LogActivityModal 
        isOpen={isLogModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSubmit={handleLogActivity}
        contacts={contacts}
       />
       {selectedActivity && (
         <ActivityDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          activity={selectedActivity}
         />
       )}
    </>
  );
};

export default Activities;
