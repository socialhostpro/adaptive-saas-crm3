import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, Contact, Opportunity } from '../types';
import CreateLeadModal from './CreateLeadModal';
import LeadDetailsModal from './LeadDetailsModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmailModal from './EmailModal';
import ConvertLeadModal from './ConvertLeadModal';
import { useGlobalStore, LeadWithSync } from '../hooks/useGlobalStore';

const LeadStatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";

  switch (status) {
    case LeadStatus.New: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case LeadStatus.Contacted: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case LeadStatus.Qualified: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case LeadStatus.Lost: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
    case LeadStatus.Converted: colorClasses = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

/**
 * Leads component now uses Zustand global store for persistent, offline-ready state.
 * Persistent state: leads (with syncStatus), contacts, opportunities, etc.
 * Ephemeral state: modals, loading, error, selectedLead (kept in component state).
 */
const Leads: React.FC<{ appContext: any }> = ({ appContext }) => {
  // Global state
  const leads = useGlobalStore((s: any) => s.leads);
  const addLead = useGlobalStore((s: any) => s.addLead);
  const updateLead = useGlobalStore((s: any) => s.updateLead);
  const removeLead = useGlobalStore((s: any) => s.removeLead);
  const contacts = useGlobalStore((s: any) => s.contacts);
  const setContacts = useGlobalStore((s: any) => s.setContacts);
  const opportunities = useGlobalStore((s: any) => s.opportunities);
  const setOpportunities = useGlobalStore((s: any) => s.setOpportunities);
  const teamMembers = useGlobalStore((s: any) => s.teamMembers);
  const currentUser = teamMembers.find((m: any) => m.isCurrentUser);

  // Ephemeral state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [isConvertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithSync | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered leads (in-memory)
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead: LeadWithSync) => statusFilter === 'All' || lead.status === statusFilter)
      .filter((lead: LeadWithSync) => companyFilter === 'All' || lead.company === companyFilter)
      .filter((lead: LeadWithSync) => sourceFilter === 'All' || lead.source === sourceFilter)
      .filter((lead: LeadWithSync) => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [leads, statusFilter, companyFilter, sourceFilter, searchTerm]);

  // Handlers for modals
  const handleOpenDetails = (lead: LeadWithSync) => {
    setSelectedLead(lead);
    setDetailsModalOpen(true);
  };
  const handleOpenEmail = (lead: LeadWithSync) => {
    setSelectedLead(lead);
    setEmailModalOpen(true);
  };
  const handleOpenDelete = (lead: LeadWithSync) => {
    setSelectedLead(lead);
    setDeleteModalOpen(true);
  };
  const handleOpenConvert = (lead: LeadWithSync) => {
    setSelectedLead(lead);
    setDetailsModalOpen(false);
    setConvertModalOpen(true);
  };

  // CRUD: Create Lead (optimistic, syncStatus)
  const handleCreateLead = async (newLeadData: Omit<Lead, 'id' | 'lastContacted'>) => {
    setError(null);
    setLoading(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticLead: LeadWithSync = {
      ...newLeadData,
      id: tempId,
      lastContacted: 'Just now',
      status: LeadStatus.New,
      syncStatus: 'pending',
    };
    addLead(optimisticLead);
    setCreateModalOpen(false);
    // Stub: skip Supabase insert
    // try {
    //   const { data, error } = await supabase.from('leads').insert([toSnakeCase({ ...newLeadData, lastContacted: 'Just now' })]).select();
    //   if (error || !data || !data[0]) {
    //     updateLead({ ...optimisticLead, syncStatus: 'error' });
    //     setError('Failed to create lead');
    //   } else {
    //     // Replace temp lead with real one
    //     removeLead(tempId);
    //     addLead({ ...data[0], syncStatus: 'synced' });
    //   }
    // } catch (e) {
    //   updateLead({ ...optimisticLead, syncStatus: 'error' });
    //   setError('Failed to create lead');
    // }
    setLoading(false);
  };

  // CRUD: Delete Lead (optimistic)
  const handleConfirmDelete = async () => {
    if (!selectedLead) return;
    setError(null);
    setLoading(true);
    const leadId = selectedLead.id;
    removeLead(leadId);
    setDeleteModalOpen(false);
    setSelectedLead(null);
    // Stub: skip Supabase delete
    // try {
    //   const { error } = await supabase.from('leads').delete().eq('id', leadId);
    //   if (error) {
    //     setError('Failed to delete lead (will retry on next sync)');
    //     // Optionally, re-add with error syncStatus
    //   }
    // } catch (e) {
    //   setError('Failed to delete lead (will retry on next sync)');
    // }
    setLoading(false);
  };

  // CRUD: Convert Lead (optimistic, multi-entity)
  const handleConvertLead = async (contactData: Contact, opportunityData?: Omit<Opportunity, 'id' | 'contactId' | 'contactName'>) => {
    if (!selectedLead) return;
    setError(null);
    setLoading(true);
    // 1. Update Lead status optimistically
    updateLead({ ...selectedLead, status: LeadStatus.Converted, syncStatus: 'pending' });
    // 2. Add or find contact
    const existingContact = contacts.find((c: Contact) => c.id === contactData.id);
    if (!existingContact) {
      setContacts([contactData, ...contacts]);
      // try { await supabase.from('contacts').insert([toSnakeCase(contactData)]); } catch {}
    }
    const finalContactId = contactData.id;
    // 3. Create Opportunity if provided
    if (opportunityData) {
      const newOpportunity = {
        ...opportunityData,
        contactId: finalContactId,
        contactName: contactData.name,
      };
      setOpportunities([newOpportunity, ...opportunities]);
      // try { await supabase.from('opportunities').insert([toSnakeCase(newOpportunity)]); } catch {}
    }
    setConvertModalOpen(false);
    setSelectedLead(null);
    setLoading(false);
    alert('Lead converted successfully!');
    // Stub: skip Supabase update
    // try {
    //   await supabase.from('leads').update({ status: LeadStatus.Converted }).eq('id', selectedLead.id);
    //   updateLead({ ...selectedLead, status: LeadStatus.Converted, syncStatus: 'synced' });
    // } catch {
    //   updateLead({ ...selectedLead, status: LeadStatus.Converted, syncStatus: 'error' });
    // }
  };

  return (
    <>
      {loading && <div className="text-center py-4">Loading leads...</div>}
      {error && <div className="text-center text-red-500 py-2">{error}</div>}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Add Lead
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Statuses</option>
            {Object.values(LeadStatus).map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Companies</option>
            {Array.from(new Set(leads.map((l: LeadWithSync) => String(l.company)).filter((c: string) => !!c))).map(company => (
              <option key={company as string} value={company as string}>{company as string}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Sources</option>
            {Array.from(new Set(leads.map((l: LeadWithSync) => String(l.source)).filter((s: string) => !!s))).map(source => (
              <option key={source as string} value={source as string}>{source as string}</option>
            ))}
          </select>
        </div>
        {/* Card-based leads grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {filteredLeads.map((lead: LeadWithSync, idx: number) => {
            // const owner = teamMembers.find((tm: any) => tm.id === lead.created_by); // not used
            return (
              <div
                key={lead.id ? lead.id : `lead-card-${idx}`}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow cursor-pointer group min-w-[320px] max-w-full w-full"
                style={{ minWidth: 320, maxWidth: '100%' }}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.card-action-btn')) return;
                  handleOpenDetails(lead);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${lead.name}`}
              >
                {/* Top row: Edit/Convert icons */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedLead(lead); setCreateModalOpen(true); }}
                    className="card-action-btn text-blue-600 hover:text-blue-800 bg-white/20 dark:bg-gray-800/40 rounded-full p-3 shadow focus:outline-none"
                    title="Edit Lead"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenConvert(lead); }}
                    className="card-action-btn text-green-600 hover:text-green-800 bg-white/20 dark:bg-gray-800/40 rounded-full p-3 shadow focus:outline-none"
                    title="Convert to Contact"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                  </button>
                </div>
                {/* Avatar and info */}
                <div className="flex items-center gap-5 mb-4">
                  <img className="w-16 h-16 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 shadow" src={lead.avatarUrl || `https://picsum.photos/seed/${lead.id}/100/100`} alt={lead.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-gray-900 dark:text-white truncate w-full">{lead.name}</div>
                    <div className="text-sm text-primary-700 dark:text-primary-300 truncate">{lead.company || '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.title || '—'}</div>
                    {/* Source field */}
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                      <span className="font-semibold">Source:</span> {lead.source || '—'}
                    </div>
                  </div>
                </div>
                {/* Lead status and score */}
                <div className="flex flex-row gap-4 items-center mb-2">
                  <LeadStatusBadge status={lead.status} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score:</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${lead.score}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{lead.score}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-auto">Last: {lead.lastContacted}</span>
                </div>
                {/* Contact methods */}
                <div className="flex flex-row gap-6 items-center mb-4">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                      onClick={e => e.stopPropagation()}
                      title="Call Lead"
                    >
                      <PhoneIcon />
                    </a>
                  )}
                  <button
                    className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                    onClick={e => { e.stopPropagation(); handleOpenEmail(lead); }}
                    title="Email Lead"
                  >
                    <MailIcon />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenDetails(lead); }}
                    className="card-action-btn flex items-center gap-2 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 px-4 py-2 rounded text-sm font-semibold shadow hover:bg-primary-200 dark:hover:bg-primary-700 focus:outline-none"
                    title="View Details"
                  >
                    <EyeIcon />
                    Details
                  </button>
                </div>
                {/* Opportunity info (if any) */}
                {lead.opportunityId && (
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 mb-2">
                    <span>Opportunity:</span>
                    <span className="font-semibold">{lead.opportunityId}</span>
                  </div>
                )}
                {/* Trash button in lower right */}
                <button
                  onClick={e => { e.stopPropagation(); handleOpenDelete(lead); }}
                  className="absolute bottom-4 right-4 card-action-btn text-gray-400 hover:text-red-500 bg-white/20 dark:bg-gray-800/40 rounded-full p-3 shadow focus:outline-none"
                  title="Delete Lead"
                  style={{ zIndex: 10 }}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateLead}
      />
      {selectedLead && (
        <LeadDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          lead={selectedLead as Lead}
          activities={[]}
          tasks={[]}
          contacts={contacts}
          teamMembers={teamMembers}
          setActivities={() => {}}
          setTasks={() => {}}
          currentUser={currentUser}
          onConvert={() => handleOpenConvert(selectedLead as LeadWithSync)}
        />
      )}
      {selectedLead && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          recipientName={selectedLead.name}
          recipientEmail={selectedLead.email}
          subject={`Following up: `}
        />
      )}
      {selectedLead && (
        <ConvertLeadModal
          isOpen={isConvertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          onConvert={handleConvertLead}
          lead={selectedLead}
          contacts={contacts}
          teamMembers={teamMembers}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete the lead for ${selectedLead?.name}? This action cannot be undone.`}
      />
    </>
  );
};

// Icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.842 18 2 13.158 2 8V3z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

export default Leads;