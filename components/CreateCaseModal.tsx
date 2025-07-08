import React, { useState, useEffect } from 'react';
import { Contact, TeamMember, Case, CaseStatus } from '../types';

interface CreateCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (caseItem: Omit<Case, 'id' | 'contactName'>) => void;
    contacts: Contact[];
    teamMembers: TeamMember[];
}

const getInitialState = () => ({
    name: '',
    caseNumber: '',
    description: '',
    contactId: '',
    attorneyId: '',
    openDate: new Date().toISOString().split('T')[0],
    status: CaseStatus.Intake,
    // New fields for richer case management
    assigned: '',
    contact: '',
    opportunity: '',
    consual: '',
    defendant: '',
    judge: '',
    caseType: '',
});

const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSubmit, contacts, teamMembers }) => {
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.contactId || !formData.openDate) {
            alert('Please fill out Name, Contact, and Open Date fields.');
            return;
        }
        
        const { caseNumber, ...rest } = formData;
        const finalData = {
            ...rest,
            caseNumber: caseNumber || `CASE-${Date.now()}`
        };
        
        onSubmit(finalData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Case</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select a client</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="attorneyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Attorney</label>
                            <select id="attorneyId" name="attorneyId" value={formData.attorneyId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="" disabled>Select an attorney</option>
                                {teamMembers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Number</label>
                            <input type="text" id="caseNumber" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Open Date *</label>
                            <input type="date" id="openDate" name="openDate" value={formData.openDate} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Assigned (Team Member) dropdown with add button */}
                        <div>
                            <label htmlFor="assigned" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned</label>
                            <div className="flex items-center gap-2">
                                <select id="assigned" name="assigned" value={formData.assigned} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="" disabled>Select team member</option>
                                    {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                                </select>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Team Member">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        {/* Contact (System Contact) dropdown with add button */}
                        <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
                            <div className="flex items-center gap-2">
                                <select id="contact" name="contact" value={formData.contact} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="" disabled>Select contact</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Contact">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Opportunity dropdown with add button */}
                        <div>
                            <label htmlFor="opportunity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity</label>
                            <div className="flex items-center gap-2">
                                <select id="opportunity" name="opportunity" value={formData.opportunity} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="" disabled>Select opportunity</option>
                                    {/* TODO: Map opportunities here */}
                                </select>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Opportunity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        {/* Consual (Opposing Consual) text input with add button */}
                        <div>
                            <label htmlFor="consual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opposing Consual</label>
                            <div className="flex items-center gap-2">
                                <input type="text" id="consual" name="consual" value={formData.consual} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Consual">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        {/* Defendant text input with add button */}
                        <div>
                            <label htmlFor="defendant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Defendant</label>
                            <div className="flex items-center gap-2">
                                <input type="text" id="defendant" name="defendant" value={formData.defendant} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Defendant">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        {/* Judge text input with add button */}
                        <div>
                            <label htmlFor="judge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judge</label>
                            <div className="flex items-center gap-2">
                                <input type="text" id="judge" name="judge" value={formData.judge} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Judge">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                        {/* Case Type dropdown with add button */}
                        <div>
                            <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Type</label>
                            <div className="flex items-center gap-2">
                                <select id="caseType" name="caseType" value={formData.caseType} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="" disabled>Select case type</option>
                                    {/* TODO: Map case types here, e.g. Civil, Criminal, etc. */}
                                </select>
                                <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Case Type">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create Case</button>
                </footer>
            </form>
        </div>
    );
};

export default CreateCaseModal;
