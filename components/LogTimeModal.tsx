import React, { useState, useEffect } from 'react';
import { Contact, TimeEntry, Task, TaskStatus } from '../types';

interface LogTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entry: Omit<TimeEntry, 'id' | 'contactName' | 'status'>, taskId?: string, newStatus?: TaskStatus) => void;
    contacts: Contact[];
    tasks?: Task[];
    task?: Task | null;
    initialDuration?: number;
}

const getInitialState = (task?: Task | null, initialDuration?: number) => ({
    contactId: task?.contactId || '',
    date: new Date().toISOString().split('T')[0],
    duration: initialDuration || 1,
    description: task?.title || '',
    isBillable: true,
    hourlyRate: 0,
});

const LogTimeModal: React.FC<LogTimeModalProps> = ({ isOpen, onClose, onSubmit, contacts, tasks = [], task = null, initialDuration }) => {
    const [formData, setFormData] = useState(getInitialState(task, initialDuration));
    const [selectedTaskId, setSelectedTaskId] = useState<string>(task?.id || '');
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | ''>('');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(task, initialDuration));
            setSelectedTaskId(task?.id || '');
            setNewTaskStatus('');
        }
    }, [isOpen, task, initialDuration]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             const isNumber = ['duration', 'hourlyRate'].includes(name);
             setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.contactId || !formData.date || formData.duration <= 0) {
            alert('Please select a contact, set a date, and enter a duration.');
            return;
        }
        const { hourlyRate, ...restData } = formData;
        const submissionData: Omit<TimeEntry, 'id' | 'contactName' | 'status'> = { ...restData };
        if (formData.isBillable) {
            submissionData.hourlyRate = hourlyRate;
        }
        onSubmit(submissionData, selectedTaskId, newTaskStatus || undefined);
    };

    // Filter tasks for selected contact
    const filteredTasks = tasks.filter(t => t.contactId === formData.contactId);
    const selectedTask = filteredTasks.find(t => t.id === selectedTaskId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log Time {selectedTask ? `for "${selectedTask.title}"` : ''}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select a contact</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                    </div>
                    {/* Task selection */}
                    <div>
                        <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task (optional)</label>
                        <select id="taskId" name="taskId" value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                            <option value="">No task</option>
                            {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                    </div>
                    {/* If a task is selected, allow updating status */}
                    {selectedTaskId && (
                        <div>
                            <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Update Task Status</label>
                            <select id="taskStatus" name="taskStatus" value={newTaskStatus} onChange={e => setNewTaskStatus(e.target.value as TaskStatus)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="">No change</option>
                                {Object.values(TaskStatus).map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="What did you work on?" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (hours) *</label>
                        <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required min="0.01" step="0.01" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex items-center h-6 pt-1">
                            <input id="isBillable" name="isBillable" type="checkbox" checked={formData.isBillable} onChange={handleInputChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                        </div>
                        <div className="text-sm flex-grow">
                             <label htmlFor="isBillable" className="font-medium text-gray-900 dark:text-gray-200">This time is billable</label>
                             {formData.isBillable && (
                                <div className="mt-2">
                                     <label htmlFor="hourlyRate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                                     <input type="number" id="hourlyRate" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} min="0" step="0.01" placeholder="e.g., 100" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                                </div>
                             )}
                        </div>
                    </div>

                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Log Time</button>
                </footer>
            </form>
        </div>
    );
};

export default LogTimeModal;