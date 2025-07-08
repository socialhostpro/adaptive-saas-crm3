
import React from 'react';
import { CalendarEvent, Invoice, Task, Opportunity, Project, Estimate, Activity, TaskStatus, TaskPriority, InvoiceStatus, OpportunityStage, ProjectStatus, EstimateStatus, ActivityType } from '../types';

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent;
}

const getEventHeaderStyle = (type: CalendarEvent['type']) => {
    switch (type) {
        case 'task': return 'bg-blue-500';
        case 'meeting': return 'bg-purple-500';
        case 'invoice': return 'bg-red-500';
        case 'estimate': return 'bg-yellow-500';
        case 'opportunity': return 'bg-orange-500';
        case 'project': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

const renderEventData = (event: CalendarEvent) => {
    switch (event.type) {
        case 'task':
            const task = event.data as Task;
            return (
                <>
                    <p><strong>Status:</strong> {task.status}</p>
                    <p><strong>Priority:</strong> {task.priority}</p>
                </>
            );
        case 'invoice':
            const invoice = event.data as Invoice;
            return (
                <>
                    <p><strong>Status:</strong> {invoice.status}</p>
                    <p><strong>Amount:</strong> ${invoice.totalAmount.toFixed(2)}</p>
                </>
            );
        case 'opportunity':
            const opp = event.data as Opportunity;
            return (
                <>
                    <p><strong>Stage:</strong> {opp.stage}</p>
                    <p><strong>Value:</strong> ${opp.value.toLocaleString()}</p>
                </>
            );
        case 'project':
            const project = event.data as Project;
            return (
                <>
                    <p><strong>Status:</strong> {project.status}</p>
                    <p><strong>Budget:</strong> ${project.budget.toLocaleString()}</p>
                </>
            );
        case 'estimate':
            const estimate = event.data as Estimate;
            return (
                <>
                    <p><strong>Status:</strong> {estimate.status}</p>
                    <p><strong>Amount:</strong> ${estimate.amount.toLocaleString()}</p>
                </>
            );
        case 'meeting':
             const meeting = event.data as Activity;
             return <p><strong>Contact:</strong> {meeting.contactName}</p>;
        default:
            return null;
    }
}


const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event }) => {
    if (!isOpen) return null;

    const { type, title, start, end, link, data } = event;
    const headerStyle = getEventHeaderStyle(type);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className={`flex items-center justify-between p-4 text-white rounded-t-lg ${headerStyle}`}>
                    <h2 className="text-lg font-bold capitalize">{type} Details</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                        <p className="text-md text-gray-800 dark:text-gray-200">
                            {start.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                            {end.toDateString() !== start.toDateString() && ` - ${end.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}`}
                        </p>
                    </div>
                     <div className="text-md text-gray-800 dark:text-gray-200 space-y-1">
                        {renderEventData(event)}
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                     <a href={link} onClick={onClose} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        View Full Details
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default EventDetailsModal;
