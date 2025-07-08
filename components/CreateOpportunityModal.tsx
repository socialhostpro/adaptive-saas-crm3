import React, { useState, useEffect } from 'react';
import { Contact, Opportunity, OpportunityStage, TeamMember } from '../types';

interface CreateOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (opportunity: Omit<Opportunity, 'id' | 'contactName'>) => void;
    contacts: Contact[];
    teamMembers: TeamMember[];
}

const OPPORTUNITY_TYPES = ['Sales', 'Project', 'Case', 'License'];

const getInitialState = (contacts, teamMembers) => ({
    title: '',
    type: 'Sales',
    value: '',
    contactId: contacts[0]?.id || '',
    assigneeId: teamMembers[0]?.id || '',
    stage: OpportunityStage.Prospecting,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    details: '',
    notes: '',
});

const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({ isOpen, onClose, onSubmit, contacts, teamMembers }) => {
    const [formData, setFormData] = useState(getInitialState(contacts, teamMembers));
    const [valueFocused, setValueFocused] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(contacts, teamMembers));
        }
    }, [isOpen, contacts, teamMembers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValueFocus = () => {
        setValueFocused(true);
        if (formData.value === '0.00') setFormData(prev => ({ ...prev, value: '' }));
    };
    const handleValueBlur = () => {
        setValueFocused(false);
        if (!formData.value || isNaN(Number(formData.value))) {
            setFormData(prev => ({ ...prev, value: '0.00' }));
        } else {
            setFormData(prev => ({ ...prev, value: Number(formData.value).toFixed(2) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.contactId || !formData.dueDate) {
            alert('Please fill out all required fields.');
            return;
        }
        onSubmit({
            id: Math.random().toString(36).substr(2, 9),
            title: formData.title,
            type: formData.type,
            value: parseFloat(formData.value) || 0,
            contactId: formData.contactId,
            contactName: contacts.find(c => c.id === formData.contactId)?.name || '',
            assigneeId: formData.assigneeId,
            stage: formData.stage,
            startDate: formData.startDate,
            closeDate: formData.dueDate,
            details: formData.details,
            notes: formData.notes,
            syncStatus: 'pending',
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Opportunity</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value ($)</label>
                            <input
                                type="number"
                                id="value"
                                name="value"
                                value={valueFocused ? formData.value : (formData.value || '0.00')}
                                onFocus={handleValueFocus}
                                onBlur={handleValueBlur}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-lg font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity Title *</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select a contact</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                            <select id="assigneeId" name="assigneeId" value={formData.assigneeId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select a team member</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
                            <select id="stage" name="stage" value={formData.stage} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                {Object.values(OpportunityStage).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Due Date *</label>
                            <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                            <textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={2} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="Opportunity details..." />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="Internal notes..." />
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create Opportunity</button>
                </footer>
            </form>
        </div>
    );
};

export default CreateOpportunityModal;