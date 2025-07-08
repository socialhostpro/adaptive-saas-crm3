import React, { useState, useEffect } from 'react';
import { Lead, Contact, Opportunity, OpportunityStage, TeamMember } from '../types';

interface ConvertLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConvert: (contactData: Contact, opportunityData?: Omit<Opportunity, 'id' | 'contactId' | 'contactName'>) => void;
    lead: Lead;
    contacts: Contact[];
    teamMembers: TeamMember[];
}

const getInitialState = (lead: Lead) => ({
    contactName: lead.name,
    contactEmail: lead.email,
    contactCompany: lead.company,
    contactTitle: '',
    createOpportunity: true,
    opportunityTitle: `${lead.company} - Initial Deal`,
    opportunityValue: 0,
    opportunityStage: OpportunityStage.Qualification,
    opportunityCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    opportunityAssigneeId: '',
});

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ isOpen, onClose, onConvert, lead, contacts, teamMembers }) => {
    const [formData, setFormData] = useState(getInitialState(lead));

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(lead));
        }
    }, [isOpen, lead]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const existingContact = contacts.find(c => c.email.toLowerCase() === formData.contactEmail.toLowerCase());
        
        const contactData: Contact = existingContact || {
            id: `c-${Date.now()}`,
            name: formData.contactName,
            email: formData.contactEmail,
            company: formData.contactCompany,
            title: formData.contactTitle,
            avatarUrl: `https://i.pravatar.cc/150?u=${formData.contactEmail}`
        };

        let opportunityData: Omit<Opportunity, 'id' | 'contactId' | 'contactName'> | undefined;
        if (formData.createOpportunity) {
            if (!formData.opportunityTitle || formData.opportunityValue <= 0) {
                alert("Please provide a title and value for the new opportunity.");
                return;
            }
            opportunityData = {
                title: formData.opportunityTitle,
                value: formData.opportunityValue,
                stage: formData.opportunityStage,
                closeDate: formData.opportunityCloseDate,
                assigneeId: formData.opportunityAssigneeId,
            };
        }

        onConvert(contactData, opportunityData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Convert Lead: {lead.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {/* Contact Section */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Create New Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Contact Name" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                            <input name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="Email" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                            <input name="contactCompany" value={formData.contactCompany} onChange={handleInputChange} placeholder="Company" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                            <input name="contactTitle" value={formData.contactTitle} onChange={handleInputChange} placeholder="Title" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>
                    {/* Opportunity Section */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <input id="createOpportunity" name="createOpportunity" type="checkbox" checked={formData.createOpportunity} onChange={handleInputChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                            <label htmlFor="createOpportunity" className="ml-2 block text-md font-medium text-gray-900 dark:text-gray-200">Create a new Opportunity for this Lead</label>
                        </div>
                        {formData.createOpportunity && (
                            <div className="mt-4 space-y-4">
                                <input name="opportunityTitle" value={formData.opportunityTitle} onChange={handleInputChange} placeholder="Opportunity Title" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name="opportunityValue" type="number" value={formData.opportunityValue} onChange={handleInputChange} placeholder="Value ($)" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                                    <select name="opportunityStage" value={formData.opportunityStage} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                                        {Object.values(OpportunityStage).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Convert Lead</button>
                </footer>
            </form>
        </div>
    );
};

export default ConvertLeadModal;