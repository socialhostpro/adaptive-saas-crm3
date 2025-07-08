

import React, { useState, useEffect } from 'react';
import { Contact, Task, TaskPriority, TaskStatus, Lead, Opportunity, Project, Case, TeamMember } from '../types';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Omit<Task, 'id'>) => void;
    contacts: Contact[];
    teamMembers: TeamMember[];
    // Optional context props
    lead?: Lead | null;
    contact?: Contact | null;
    currentUser?: TeamMember;
    // Optional linkable entities
    leads?: Lead[];
    opportunities?: Opportunity[];
    projects?: Project[];
    cases?: Case[];
}

const getInitialState = (lead?: Lead | null, contact?: Contact | null, currentUser?: TeamMember) => ({
    title: '',
    contactId: contact?.id || lead?.contactId || '',
    dueDate: '',
    priority: TaskPriority.Medium,
    status: TaskStatus.ToDo,
    leadId: lead?.id,
    opportunityId: '',
    projectId: '',
    caseId: '',
    description: '',
    assigneeId: currentUser?.id || '',
    linkedEntityType: 'none',
});

const CreateTaskModal: React.FC<CreateTaskModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, contacts, teamMembers, lead = null, contact = null, currentUser, leads = [], opportunities = [], projects = [], cases = [] } = props;
    const [formData, setFormData] = useState(getInitialState(lead, contact, currentUser));
    const prefilledContext = lead || contact;
    
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(lead, contact, currentUser));
        }
    }, [isOpen, lead, contact, currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.contactId || !formData.dueDate) {
            alert('Please fill out all required fields.');
            return;
        }

        let contactName: string;
        if (prefilledContext) {
            // Check if it's a Lead and has a contactId, if so, find the real contact name
            if ('score' in prefilledContext && prefilledContext.contactId) { 
                const associatedContact = contacts.find(c => c.id === prefilledContext.contactId);
                contactName = associatedContact?.name || prefilledContext.name;
            } else {
                contactName = prefilledContext.name;
            }
        } else {
            const relatedContact = contacts.find(c => c.id === formData.contactId);
            contactName = relatedContact?.name || 'Unknown Contact';
        }

        const { linkedEntityType, ...restOfData } = formData;
        
        onSubmit({
            ...restOfData,
            priority: formData.priority as TaskPriority,
            contactName: contactName,
        });
    };
    
    const renderLinkToDropdown = () => {
        switch(formData.linkedEntityType) {
            case 'lead':
                return (
                    <select name="leadId" value={formData.leadId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                        <option value="">Select a Lead</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                )
            case 'opportunity':
                 return (
                    <select name="opportunityId" value={formData.opportunityId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                        <option value="">Select an Opportunity</option>
                        {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                    </select>
                )
            case 'project':
                 return (
                    <select name="projectId" value={formData.projectId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                        <option value="">Select a Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )
            case 'case':
                 return (
                    <select name="caseId" value={formData.caseId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                        <option value="">Select a Case</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )
            default:
                return null;
        }
    }

    // Determine the name to display in the disabled contact dropdown
    let displayedContactName = '';
    if (prefilledContext) {
        if ('score' in prefilledContext && prefilledContext.contactId) { // It's a Lead
            const associatedContact = contacts.find(c => c.id === prefilledContext.contactId);
            displayedContactName = associatedContact?.name || prefilledContext.name; // Fallback to lead name
        } else {
            displayedContactName = prefilledContext.name;
        }
    }


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Task</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    
                    {!prefilledContext && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link to (Optional)</label>
                             <div className="grid grid-cols-2 gap-2">
                                <select name="linkedEntityType" value={formData.linkedEntityType} onChange={handleInputChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                                    <option value="none">None</option>
                                    <option value="lead">Lead</option>
                                    <option value="opportunity">Opportunity</option>
                                    <option value="project">Project</option>
                                    <option value="case">Case</option>
                                </select>
                                <div className="col-span-1">
                                    {renderLinkToDropdown()}
                                </div>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Associated Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" disabled={!!prefilledContext}>
                                {prefilledContext ? <option value={formData.contactId}>{displayedContactName}</option> : <option value="" disabled>Select a contact</option>}
                                {!prefilledContext && contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                            <select id="assigneeId" name="assigneeId" value={formData.assigneeId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Unassigned</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                            <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create Task</button>
                </footer>
            </form>
        </div>
    );
};

export default CreateTaskModal;