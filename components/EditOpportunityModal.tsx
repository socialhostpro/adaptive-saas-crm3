
import React, { useState, useEffect } from 'react';
import { Contact, Opportunity, OpportunityStage, TeamMember } from '../types';

interface EditOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (opportunity: Opportunity) => void;
    opportunity: Opportunity | null;
    contacts: Contact[];
    teamMembers: TeamMember[];
}

const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({ isOpen, onClose, onSubmit, opportunity, contacts, teamMembers }) => {
    const [formData, setFormData] = useState<Opportunity | null>(null);

    useEffect(() => {
        if (isOpen && opportunity) {
            setFormData(opportunity);
        }
    }, [isOpen, opportunity]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev!, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        onSubmit(formData);
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Opportunity</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity Title *</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
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
                        <select id="assigneeId" name="assigneeId" value={formData.assigneeId || ''} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                            <option value="">Unassigned</option>
                            {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value ($)</label>
                            <input type="number" id="value" name="value" value={formData.value} onChange={handleInputChange} min="0" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
                            <select id="stage" name="stage" value={formData.stage} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                {Object.values(OpportunityStage).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Close Date *</label>
                        <input type="date" id="closeDate" name="closeDate" value={formData.closeDate} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save Changes</button>
                </footer>
            </form>
        </div>
    );
};

export default EditOpportunityModal;
