import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { useGlobalStore } from '../hooks/useGlobalStore';
import CreateOpportunityModal from './CreateOpportunityModal';

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contact: Omit<Contact, 'id' | 'avatarUrl'>) => void;
    initialData?: Partial<Contact>; // Add for edit mode
    mode?: 'create' | 'edit';
}

// All hooks must be inside the component function
const CreateContactModal: React.FC<CreateContactModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode = 'create' }) => {
    const currentUser = useGlobalStore(state => state.currentUser);
    const userId = currentUser?.id || '';
    const projects = useGlobalStore(state => state.projects);
    const opportunities = useGlobalStore(state => state.opportunities);
    const updateOpportunity = useGlobalStore(state => state.updateOpportunity);
    const leads = useGlobalStore(state => state.leads);
    const cases = useGlobalStore(state => state.cases);
    const contacts = useGlobalStore(state => state.contacts);
    const addOpportunity = useGlobalStore(state => state.addOpportunity);
    const teamMembers = useGlobalStore(state => state.teamMembers || []);

    // Companies list is now held in state, rebuilt on modal open
    const [companies, setCompanies] = useState<string[]>([]);

    // Helper: safely extract only allowed fields from initialData
    function getInitialFormData(userId: string, initialData?: Partial<Contact>) {
        return {
            name: initialData?.name || '',
            email: initialData?.email || '',
            title: initialData?.title || '',
            company: initialData?.company || '',
            phone: initialData?.phone || '',
            created_by: userId,
            projectId: initialData?.projectId || '',
            opportunityId: initialData?.opportunityId || '',
            leadId: initialData?.leadId || '',
            caseId: initialData?.caseId || '',
            info: initialData?.info || '',
        };
    }
    const [formData, setFormData] = useState(() => getInitialFormData(userId, initialData));
    const [phoneError, setPhoneError] = useState<string | null>(null);
    // Always safely check for addresses array, fallback to address or empty string
    function getInitialAddresses(initialData?: Partial<Contact>) {
        if (Array.isArray((initialData as any)?.addresses)) {
            return (initialData as any).addresses;
        }
        if (typeof initialData?.address === 'string' && initialData.address) {
            return [initialData.address];
        }
        return [''];
    }
    const [addresses, setAddresses] = useState<string[]>(getInitialAddresses(initialData));

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData(userId, initialData));
            setAddresses(getInitialAddresses(initialData));
            // Build unique company list from contacts
            const uniqueCompanies = Array.from(new Set(contacts.map(c => c.company).filter(Boolean)));
            setCompanies(uniqueCompanies);
        }
    }, [isOpen, initialData, contacts, userId]);

    const updateContact = useGlobalStore(state => state.updateContact);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Basic phone validation: allow digits, spaces, dashes, parentheses, plus
            const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;
            if (value && !phonePattern.test(value)) {
                setPhoneError('Please enter a valid phone number.');
            } else {
                setPhoneError(null);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Address handlers
    const handleAddressChange = (idx: number, value: string) => {
        setAddresses(prev => prev.map((addr, i) => i === idx ? value : addr));
    };
    const handleAddAddress = () => {
        setAddresses(prev => [...prev, '']);
    };
    const handleRemoveAddress = (idx: number) => {
        setAddresses(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Please fill out Name and Email fields.');
            return;
        }
        if (phoneError) {
            alert(phoneError);
            return;
        }
        // Add addresses to formData
        const submitData = { ...formData, address: addresses[0] };
        // Stub: just update state, don't sync
        if (formData.opportunityId) {
            const opp = opportunities.find(o => o.id === formData.opportunityId);
            if (opp) {
                updateOpportunity({ ...opp, syncStatus: 'pending' });
                // STUB: skip syncAllPending for now
            }
        }
        if (mode === 'edit' && initialData?.id) {
            const contactToUpdate = {
                ...initialData,
                ...submitData,
                id: initialData.id,
                syncStatus: 'pending',
                avatarUrl: initialData.avatarUrl || ''
            };
            updateContact(contactToUpdate as Contact);
            // STUB: skip syncAllPending for now
        }
        onSubmit(submitData);
    };

    // Fix: Use correct display property for projects and cases
    const getProjectLabel = (p: any) => p.title || p.name || p.id;
    const getCaseLabel = (c: any) => c.title || c.name || c.id;

    // Company management modal state
    const [showCompanyManager, setShowCompanyManager] = useState(false);
    const [companyInput, setCompanyInput] = useState('');
    const [editCompanies, setEditCompanies] = useState<string[]>([]);

    // Opportunity modal state
    const [showOpportunityModal, setShowOpportunityModal] = useState(false);

    // Handle company dropdown change
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__manage__') {
            setEditCompanies(companies);
            setShowCompanyManager(true);
        } else {
            handleInputChange(e);
        }
    };

    // Add company to edit list
    const handleAddCompany = () => {
        if (companyInput.trim() && !editCompanies.includes(companyInput.trim())) {
            setEditCompanies([...editCompanies, companyInput.trim()]);
            setCompanyInput('');
        }
    };
    // Remove company from edit list
    const handleRemoveCompany = (company: string) => {
        setEditCompanies(editCompanies.filter(c => c !== company));
    };
    // Save companies
    const handleSaveCompanies = () => {
        setCompanies(editCompanies);
        setShowCompanyManager(false);
    };
    // Cancel company management
    const handleCancelCompanies = () => {
        setShowCompanyManager(false);
        setCompanyInput('');
    };

    // Callback when a new opportunity is created
    function handleOpportunityCreated(newOpp: any) {
        addOpportunity(newOpp);
        setFormData(prev => ({ ...prev, opportunityId: newOpp.id }));
        setShowOpportunityModal(false);
    }

    // Helper: parse info JSON into Q&A fields
    function parseInfoQA(info: string | undefined | null): Array<{ question: string; answer: string }> {
        if (!info) return [];
        try {
            const arr = JSON.parse(info);
            if (Array.isArray(arr)) return arr;
        } catch {}
        return [];
    }
    // In the form, parse info JSON and show as Q&A (read-only for now)
    const infoQA = parseInfoQA(formData.info);

    // Example: Add new opportunity (state only, no DB)
    function handleAddOpportunity() {
        setShowOpportunityModal(true);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{mode === 'edit' ? 'Edit Contact' : 'Add New Contact'}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Close"
                    >
                        Close
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" autoComplete="email" />
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" autoComplete="organization-title" />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company/Business</label>
                            <div className="flex gap-2">
                                <select id="company" name="company" value={formData.company} onChange={handleCompanyChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="">Select company...</option>
                                    {companies.map(company => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                    <option value="__manage__">Manage companies...</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" autoComplete="tel" />
                            {phoneError && <div className="text-xs text-red-500 mt-1">{phoneError}</div>}
                        </div>
                        {/* Address section: multiple addresses */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Addresses
                            </label>
                            <div className="flex flex-col gap-2">
                                {addresses.map((address, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={e => handleAddressChange(idx, e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                                            autoComplete="street-address"
                                            spellCheck={true}
                                            placeholder={`Address ${idx + 1}`}
                                        />
                                        {addresses.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveAddress(idx)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1">Remove</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddAddress} className="mt-1 text-primary-600 hover:underline text-sm self-start">+ Add Address</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Assign to Project
                            </label>
                            <select id="projectId" name="projectId" value={formData.projectId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="">None</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{getProjectLabel(p)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="opportunityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Opportunity</label>
                            <div className="flex gap-2">
                                <select id="opportunityId" name="opportunityId" value={formData.opportunityId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                    <option value="">None</option>
                                    {opportunities.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.title} {o.syncStatus === 'pending' && '(Syncing...)'} {o.syncStatus === 'error' && '(Error)'}
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleAddOpportunity} className="text-primary-600 border border-primary-600 rounded px-2 py-1 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20">+ New</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="leadId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Lead</label>
                            <select id="leadId" name="leadId" value={formData.leadId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="">None</option>
                                {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="caseId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Case</label>
                            <select id="caseId" name="caseId" value={formData.caseId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                                <option value="">None</option>
                                {cases.map(ca => <option key={ca.id} value={ca.id}>{getCaseLabel(ca)}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Info</label>
                            <textarea id="info" name="info" value={formData.info || ''} onChange={handleInputChange} rows={2} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="Additional notes or info..." />
                            {/* If info is valid Q&A JSON, show as Q&A list */}
                            {infoQA.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <div className="text-xs text-gray-500 mb-1">Q&A from client (web/phone form):</div>
                                    <ul className="space-y-1">
                                        {infoQA.map((qa, idx) => (
                                            <li key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                                                <div className="text-xs text-gray-500 font-semibold">Q: {qa.question}</div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">A: {qa.answer}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">{mode === 'edit' ? 'Save Changes' : 'Create Contact'}</button>
                </footer>
                {/* Company management modal */}
                {showCompanyManager && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Manage Companies</h3>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={companyInput}
                                    onChange={e => setCompanyInput(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Add new company..."
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompany(); } }}
                                />
                                <button type="button" onClick={handleAddCompany} className="bg-primary-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-700">Add</button>
                            </div>
                            <ul className="max-h-40 overflow-y-auto mb-2">
                                {editCompanies.map(company => (
                                    <li key={company} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span>{company}</span>
                                        <button type="button" onClick={() => handleRemoveCompany(company)} className="text-red-500 hover:text-red-700 text-xs ml-2">Remove</button>
                                    </li>
                                ))}
                                {editCompanies.length === 0 && <li className="text-gray-400 text-sm">No companies yet.</li>}
                            </ul>
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={handleCancelCompanies} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                                <button type="button" onClick={handleSaveCompanies} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700">Save</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Opportunity creation modal */}
                {showOpportunityModal && (
                    <CreateOpportunityModal
                        isOpen={showOpportunityModal}
                        onClose={() => setShowOpportunityModal(false)}
                        onSubmit={handleOpportunityCreated}
                        contacts={contacts}
                        teamMembers={teamMembers}
                    />
                )}
            </form>
        </div>
    );
};

export default CreateContactModal;
