
import React from 'react';
import { Task, TaskStatus, TaskPriority, TeamMember } from '../../types';

const TaskPriorityIndicator: React.FC<{priority: TaskPriority}> = ({ priority }) => {
    let color = '';
    switch(priority) {
        case TaskPriority.High: color = 'bg-red-500'; break;
        case TaskPriority.Medium: color = 'bg-orange-500'; break;
        case TaskPriority.Low: color = 'bg-blue-500'; break;
    }
    return <span className={`h-2.5 w-2.5 rounded-full ${color}`} title={`Priority: ${priority}`}></span>;
}

interface MyTasksWidgetProps {
    tasks: Task[];
    currentUser?: TeamMember;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ tasks, currentUser }) => {
    const myTasks = tasks
        .filter(t => t.assigneeId === (currentUser?.id || 'user') && t.status !== TaskStatus.Completed)
        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Tasks</h3>
            {myTasks.length > 0 ? (
                 <div className="flex-grow space-y-3">
                    {myTasks.slice(0,5).map(task => (
                        <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-start gap-3">
                            <TaskPriorityIndicator priority={task.priority} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming tasks. Great job!</p>
                </div>
            )}
        </div>
    );
};

export default MyTasksWidget;
