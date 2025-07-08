

import React, { useState, useEffect } from 'react';
import { Contact, Project, ProjectStatus } from '../types';
import AIDraftModal from './AIDraftModal';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: Omit<Project, 'id' | 'contactName'>) => void;
    contacts: Contact[];
}

const SparklesIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>;

const getInitialState = () => ({
    name: '',
    description: '',
    contactId: '',
    deadline: '',
    budget: 0,
    status: ProjectStatus.NotStarted
});

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, contacts }) => {
    const [formData, setFormData] = useState(getInitialState());
    const [isAIDraftOpen, setAIDraftOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.contactId || !formData.deadline) {
            alert('Please fill out Name, Contact, and Deadline fields.');
            return;
        }
        const contact = contacts.find(c => c.id === formData.contactId);
        if (!contact) return;
        
        onSubmit({
            ...formData,
            status: formData.status as ProjectStatus
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <button type="button" onClick={() => setAIDraftOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
                                    <SparklesIcon className="w-3 h-3"/> AI Draft
                                </button>
                            </div>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select a contact</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline *</label>
                                <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($)</label>
                                <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} min="0" step="100" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create Project</button>
                    </footer>
                </form>
            </div>
            <AIDraftModal
                isOpen={isAIDraftOpen}
                onClose={() => setAIDraftOpen(false)}
                onInsertText={(text) => setFormData(prev => ({...prev, description: text}))}
                promptContext={`You are an AI assistant helping a user write a project description for a new project called "${formData.name}".`}
            />
        </>
    );
};

export default CreateProjectModal;