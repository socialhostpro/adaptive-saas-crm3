
import React, { useState, useEffect } from 'react';
import { Contact, Activity, ActivityType, Task, TaskPriority, TaskStatus, Lead } from '../types';

interface LogActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (activity: Omit<Activity, 'id'>, followUpTask?: Omit<Task, 'id'>) => void;
    contacts: Contact[];
    lead?: Lead | null;
    contact?: Contact | null;
}

const getInitialState = (lead?: Lead | null, contact?: Contact | null) => ({
    type: ActivityType.Call,
    contactId: lead?.id || contact?.id || '',
    summary: '',
    timestamp: new Date().toISOString().slice(0, 16),
    subject: '',
    location: '',
    duration: 15,
    outcome: 'Connected',
    createFollowUp: false,
    taskTitle: '',
    taskDueDate: '',
    leadId: lead?.id,
});

const LogActivityModal: React.FC<LogActivityModalProps> = ({ isOpen, onClose, onSubmit, contacts, lead = null, contact = null }) => {
    const [formData, setFormData] = useState(getInitialState(lead, contact));
    const prefilledEntity = lead || contact;

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(lead, contact));
        }
    }, [isOpen, lead, contact]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    };

    const handleTypeChange = (type: ActivityType) => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { contactId, summary, createFollowUp, taskTitle, taskDueDate, ...activityData } = formData;
        if (!contactId || !summary) {
            alert('Please select a contact and provide a summary.');
            return;
        }

        const relatedContact = contacts.find(c => c.id === contactId);
        const contactName = prefilledEntity?.name || relatedContact?.name || 'Unknown Contact';
        
        const newActivity = {
            ...activityData,
            contactId,
            contactName: contactName,
            summary,
            timestamp: new Date(formData.timestamp),
            leadId: lead?.id
        };

        let newFollowUpTask: Omit<Task, 'id'> | undefined;
        if (createFollowUp && taskTitle && taskDueDate) {
            newFollowUpTask = {
                title: taskTitle,
                contactId,
                contactName: contactName,
                dueDate: taskDueDate,
                status: TaskStatus.ToDo,
                priority: TaskPriority.Medium,
                leadId: lead?.id
            };
        }
        onSubmit(newActivity, newFollowUpTask);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log an Activity</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-4">
                    {/* Activity Type Selector */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.values(ActivityType).filter(v => typeof v === 'string').map((type, index) => (
                            <button type="button" key={index} onClick={() => handleTypeChange(index)} className={`p-3 rounded-lg border-2 text-center transition-colors ${formData.type === index ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-500 text-primary-700 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                                <span className="font-semibold text-sm">{type as string}</span>
                            </button>
                        ))}
                    </div>
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" disabled={!!prefilledEntity}>
                                {prefilledEntity ? <option value={prefilledEntity.id}>{prefilledEntity.name}</option> : <option value="" disabled>Select a contact</option>}
                                {!prefilledEntity && contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time *</label>
                            <input type="datetime-local" id="timestamp" name="timestamp" value={formData.timestamp} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                        </div>
                    </div>
                     {/* Type-Specific Fields */}
                    {formData.type === ActivityType.Email && (
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Email subject line" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                        </div>
                    )}
                    {formData.type === ActivityType.Meeting && (
                         <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / URL</label>
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Boardroom or Zoom Link" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                        </div>
                    )}
                    {formData.type === ActivityType.Call && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                                <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome</label>
                                <select id="outcome" name="outcome" value={formData.outcome} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                    <option>Connected</option>
                                    <option>Left Voicemail</option>
                                    <option>No Answer</option>
                                    <option>Wrong Number</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {/* Summary */}
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary *</label>
                        <textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} placeholder="Add notes about the interaction..." className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100"></textarea>
                    </div>

                    {/* Follow-up Task */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <input id="createFollowUp" name="createFollowUp" type="checkbox" checked={formData.createFollowUp} onChange={handleInputChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                            <label htmlFor="createFollowUp" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">Create a follow-up task</label>
                        </div>
                        {formData.createFollowUp && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div>
                                    <label htmlFor="taskTitle" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                                    <input type="text" id="taskTitle" name="taskTitle" value={formData.taskTitle} onChange={handleInputChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                                </div>
                                <div>
                                    <label htmlFor="taskDueDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                                    <input type="date" id="taskDueDate" name="taskDueDate" value={formData.taskDueDate} onChange={handleInputChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <footer className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Log Activity</button>
                </footer>
            </form>
        </div>
    );
};

export default LogActivityModal;
