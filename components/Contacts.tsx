import React, { useState, useMemo, useRef } from 'react';
import { Contact, TimeEntryStatus, ContactWithSync } from '../types';
import Card from './shared/Card';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmailModal from './EmailModal';
import ContactDetailsModal from './ContactDetailsModal';
import CreateContactModal from './CreateContactModal';
import { toSnakeCase } from '../lib/toSnakeCase';
import { useGlobalStore } from '../hooks/useGlobalStore';
import { syncAllPending, fetchContactsFromServer } from '../lib/syncService';
import LogActivityModal from './LogActivityModal';
import LogTimeModal from './LogTimeModal';

const Contacts: React.FC = () => {
  const { userId } = useGlobalStore();
  const contacts = useGlobalStore(state => state.contacts as ContactWithSync[]);
  const addContact = useGlobalStore(state => state.addContact);
  const updateContact = useGlobalStore(state => state.updateContact);
  const removeContact = useGlobalStore(state => state.removeContact);
  const setContacts = useGlobalStore(state => state.setContacts);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [logActivityContact, setLogActivityContact] = useState<Contact | null>(null);
  const [logTimeModalOpen, setLogTimeModalOpen] = useState(false);
  const [logTimeContact, setLogTimeContact] = useState<Contact | null>(null);
  const [logTimeDuration, setLogTimeDuration] = useState<number>(0);

  // Timer state: { [contactId]: { running: boolean, elapsed: number, intervalId: NodeJS.Timeout | null } }
  const [timers, setTimers] = useState<{ [contactId: string]: { running: boolean; elapsed: number } }>({});
  const intervals = useRef<{ [contactId: string]: NodeJS.Timeout | null }>({});

  // Auth check
  if (!userId) {
    return <div className="text-center py-8 text-red-500">You must be logged in to view contacts.</div>;
  }

  // Filter state
  const [filterCompany, setFilterCompany] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterCase, setFilterCase] = useState('');
  const [filterOpportunity, setFilterOpportunity] = useState('');
  // Get unique companies and projects for filter dropdowns
  const allCompanies = useMemo(() => Array.from(new Set(contacts.map(c => c.company).filter(Boolean))), [contacts]);
  const allProjects = useMemo(() => Array.from(new Set(contacts.map(c => c.projectId).filter(Boolean))), [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      if (filterCompany && contact.company !== filterCompany) return false;
      if (filterProject && contact.projectId !== filterProject) return false;
      if (filterCase && contact.caseId !== filterCase) return false;
      if (filterOpportunity && contact.opportunityId !== filterOpportunity) return false;
      return (
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [contacts, searchTerm, filterCompany, filterProject, filterCase, filterOpportunity]);

  // Debug logging
  console.log('Contacts component render:', {
    userId,
    contactsCount: contacts.length,
    contacts: contacts.slice(0, 3), // First 3 contacts for debugging
    filteredContactsCount: filteredContacts.length
  });

  // Timer handlers
  const startTimer = (contactId: string) => {
    if (timers[contactId]?.running) return;
    setTimers(prev => ({
      ...prev,
      [contactId]: { running: true, elapsed: prev[contactId]?.elapsed || 0 }
    }));
    intervals.current[contactId] = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        [contactId]: {
          running: true,
          elapsed: (prev[contactId]?.elapsed || 0) + 1
        }
      }));
    }, 1000);
  };
  const pauseTimer = (contactId: string) => {
    setTimers(prev => ({
      ...prev,
      [contactId]: { ...prev[contactId], running: false }
    }));
    if (intervals.current[contactId]) {
      clearInterval(intervals.current[contactId]!);
      intervals.current[contactId] = null;
    }
  };
  const resetTimer = (contactId: string) => {
    pauseTimer(contactId);
    setTimers(prev => ({
      ...prev,
      [contactId]: { running: false, elapsed: 0 }
    }));
  };
  React.useEffect(() => {
    // Cleanup intervals on unmount
    return () => {
      Object.values(intervals.current).forEach(interval => interval && clearInterval(interval));
    };
  }, []);

  // CRUD Handlers
  const handleOpenDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailsModalOpen(true);
  };
  const handleOpenEmail = (contact: Contact) => {
    setSelectedContact(contact);
    setEmailModalOpen(true);
  };
  const handleOpenDelete = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedContact) return;
    setError(null);
    setLoading(true);
    removeContact(selectedContact.id);
    setDeleteModalOpen(false);
    setSelectedContact(null);
    setLoading(false);
  };
  const handleCreateContact = async (newContactData: Omit<Contact, 'id' | 'avatarUrl'>) => {
    setError(null);
    setLoading(true);
    const avatarUrl = `https://picsum.photos/seed/${Date.now()}/100/100`;
    const tempId = `temp-${Date.now()}`;
    // Add optimistic contact
    addContact({ ...newContactData, id: tempId, avatarUrl, syncStatus: 'pending' } as Contact);
    setCreateModalOpen(false);
    setLoading(false);
    // Sync to server, then update in-place (never remove from UI)
    try {
      await syncAllPending();
      // After sync, update the contact in-place (the syncService should call updateContact with the real data)
      // Optionally, you can fetch the latest for just this contact and updateContact here if needed
    } catch (e) {
      // Optionally, set syncStatus to 'error' on failure
    }
  };
  const handleOpenEdit = (contact: Contact) => {
    setEditContact(contact);
    setEditModalOpen(true);
  };
  const handleEditContact = (updatedContact: Contact) => {
    updateContact(updatedContact);
    setEditModalOpen(false);
    setEditContact(null);
  };

  // Fetch contacts from server after sync and on mount
  const refreshContactsFromServer = async () => {
    const serverContacts = await fetchContactsFromServer();
    // Merge pending local contacts (not yet synced to server)
    const pendingContacts = contacts.filter(c => c.syncStatus === 'pending' || c.syncStatus === 'error');
    // Remove any pending contacts that have the same email as a server contact (to avoid dupes)
    const merged = [
      ...serverContacts,
      ...pendingContacts.filter(
        pc => !serverContacts.some(sc => sc.email === pc.email)
      )
    ];
    setContacts(merged);
  };

  // Fetch on mount - TEMPORARILY DISABLED FOR DEBUGGING
  // React.useEffect(() => {
  //   refreshContactsFromServer();
  // }, []);

  // Get all related data from global state
  const activities = useGlobalStore(state => state.activities || []);
  const setActivities = useGlobalStore(state => state.setActivities);
  const tasks = useGlobalStore(state => state.tasks || []);
  const updateTask = useGlobalStore(state => state.updateTask);
  // Billing/Time tracking - all managed through global store
  const timeEntries = useGlobalStore(state => state.timeEntries || []);
  const addTimeEntry = useGlobalStore(state => state.addTimeEntry);
  const opportunities = useGlobalStore(state => state.opportunities || []);
  const projects = useGlobalStore(state => state.projects || []);
  const cases = useGlobalStore(state => state.cases || []);
  const teamMembers = useGlobalStore(state => state.teamMembers || []);
  const currentUser = useGlobalStore(state => state.currentUser);

  // Helper to get sync status for selected contact
  const selectedContactSyncStatus = selectedContact?.syncStatus || 'synced';
  const handleRetrySync = async () => {
    await syncAllPending();
    await refreshContactsFromServer();
  };

  // Handler for log icon
  const handleOpenLogActivity = (contact: Contact) => {
    setLogActivityContact(contact);
    setIsLogActivityOpen(true);
  };
  const handleLogActivity = (newActivity: any, followUpTask?: any) => {
    const activityWithId = { ...newActivity, id: `act-${Date.now()}` };
    setActivities([activityWithId, ...activities]);
    setIsLogActivityOpen(false);
    setLogActivityContact(null);
  };

  // Handler for logging time from timer
  const handleLogTimeFromTimer = (contact: Contact, elapsed: number) => {
    setLogTimeContact(contact);
    setLogTimeDuration(Number((elapsed / 3600).toFixed(2))); // convert seconds to hours, 2 decimals
    setLogTimeModalOpen(true);
  };

  return (
    <>
      {loading && <div className="text-center py-4">Loading contacts...</div>}
      {error && <div className="text-center text-red-500 py-2">{error}</div>}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm">
                <option value="">All Companies</option>
                {allCompanies.map(company => <option key={company} value={company}>{company}</option>)}
              </select>
              <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm">
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title || p.name || p.id}</option>)}
              </select>
              <select value={filterOpportunity} onChange={e => setFilterOpportunity(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm">
                <option value="">All Opportunities</option>
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
              <select value={filterCase} onChange={e => setFilterCase(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm">
                <option value="">All Cases</option>
                {cases.map(ca => <option key={ca.id} value={ca.id}>{ca.title || ca.name || ca.id}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={() => window.print()}
              className="no-print p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Print"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v2.5H16a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex-shrink-0">
              Add Contact
            </button>
          </div>
        </div>
        {/* Card-based contacts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {filteredContacts.map((contact, idx) => {
            const owner = teamMembers.find(tm => tm.id === contact.created_by);
            // Timer helpers
            const timer = timers[contact.id] || { running: false, elapsed: 0 };
            const formatElapsed = (s: number) => {
              const h = Math.floor(s / 3600);
              const m = Math.floor((s % 3600) / 60);
              const sec = s % 60;
              return `${h > 0 ? h + ':' : ''}${h > 0 ? String(m).padStart(2, '0') : m}:${String(sec).padStart(2, '0')}`;
            };
            // Billing summary - get time entries for this contact
            const contactTimeEntries = timeEntries.filter(te => te.contactId === contact.id);
            const totalBillableHours = contactTimeEntries
              .filter(te => te.isBillable)
              .reduce((sum, te) => sum + te.duration, 0);
            const totalUnbilledHours = contactTimeEntries
              .filter(te => te.isBillable && te.status === TimeEntryStatus.Unbilled)
              .reduce((sum, te) => sum + te.duration, 0);
            return (
              <div
                key={contact.id ? contact.id : `contact-card-${idx}`}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow cursor-pointer group min-w-[320px] max-w-full w-full"
                style={{ minWidth: 320, maxWidth: '100%' }}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.card-action-btn')) return;
                  handleOpenDetails(contact);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${contact.name}`}
              >
                {/* Sync status indicator */}
                <div className="absolute top-4 left-4 z-10">
                  {contact._pendingDelete ? (
                    <span title="Pending Deletion" className="inline-flex items-center text-red-400 bg-red-50 dark:bg-red-900 rounded-full px-2 py-1 text-xs font-semibold opacity-70">
                      🗑️ Deleting
                    </span>
                  ) : contact.syncStatus === 'pending' ? (
                    <span title="Pending Sync" className="inline-flex items-center text-yellow-500 bg-yellow-50 dark:bg-yellow-900 rounded-full px-2 py-1 text-xs font-semibold">
                      ⏳ Syncing
                    </span>
                  ) : contact.syncStatus === 'error' ? (
                    <span title="Sync Error" className="inline-flex items-center text-red-500 bg-red-50 dark:bg-red-900 rounded-full px-2 py-1 text-xs font-semibold">
                      ⚠️ Error
                      <button
                        className="ml-2 underline text-xs text-blue-600 dark:text-blue-300"
                        title="Retry Sync"
                        onClick={e => { e.stopPropagation(); handleRetrySync(); }}
                      >
                        Retry
                      </button>
                    </span>
                  ) : (
                    <span title="Synced" className="inline-flex items-center text-green-500 bg-green-50 dark:bg-green-900 rounded-full px-2 py-1 text-xs font-semibold opacity-60">
                      ✅ Synced
                    </span>
                  )}
                </div>
                {/* Top row: Edit icon */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenEdit(contact); }}
                    className="card-action-btn text-gray-400 hover:text-primary-400 bg-white/20 dark:bg-gray-800/40 rounded-full p-3 shadow focus:outline-none"
                    title="Edit Contact"
                  >
                    <EditIcon />
                  </button>
                </div>
                {/* Avatar and info */}
                <div className="flex items-center gap-5 mb-4">
                  <img className="w-16 h-16 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 shadow" src={contact.avatarUrl} alt={contact.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-gray-900 dark:text-white truncate w-full">{contact.name}</div>
                    <div className="text-sm text-primary-700 dark:text-primary-300 truncate">{contact.company || '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.title || '—'}</div>
                  </div>
                </div>
                {/* Contact methods */}
                <div className="flex flex-row gap-6 items-center mb-4">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                      onClick={e => e.stopPropagation()}
                      title="Call Contact"
                    >
                      <span className="inline-block"><PhoneIcon className="w-7 h-7" /></span>
                    </a>
                  )}
                  <button
                    className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                    onClick={e => { e.stopPropagation(); handleOpenEmail(contact); }}
                    title="Email Contact"
                  >
                    <span className="inline-block"><MailIcon className="w-7 h-7" /></span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenLogActivity(contact); }}
                    className="card-action-btn flex items-center gap-2 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 px-4 py-2 rounded text-sm font-semibold shadow hover:bg-primary-200 dark:hover:bg-primary-700 focus:outline-none"
                    title="Log Activity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 19h.01" /></svg>
                    Log Activity
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenDelete(contact); }}
                    className="card-action-btn text-gray-400 hover:text-red-500 p-3 ml-auto"
                    title="Delete Contact"
                  >
                    <TrashIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Address and project icons row */}
                <div className="flex flex-row gap-4 items-center mb-2">
                  {contact.address && (
                    <>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                        title="View on Map"
                        onClick={e => e.stopPropagation()}
                      >
                        <MapIcon className="w-7 h-7" />
                        <span className="text-xs">Map</span>
                      </a>
                      {/* Calendar icon - open calendar events for this contact */}
                      <button
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 focus:outline-none"
                        title="View Calendar Events"
                        onClick={e => { e.stopPropagation(); /* TODO: open calendar modal for this contact */ alert(`Open calendar events for ${contact.name}`); }}
                      >
                        <CalendarIcon className="w-7 h-7" />
                        <span className="text-xs">Calendar</span>
                      </button>
                      {/* Email button */}
                      <button
                        className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                        onClick={e => { e.stopPropagation(); handleOpenEmail(contact); }}
                        title="Email Contact"
                      >
                        <MailIcon className="w-7 h-7" />
                        <span className="text-xs">Email</span>
                      </button>
                      {/* Phone icon */}
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                        onClick={e => e.stopPropagation()}
                        title="Call Contact"
                      >
                        <PhoneIcon className="w-7 h-7" />
                        <span className="text-xs">Call</span>
                      </a>
                    </>
                  )}
                  {(contact.projectId || contact.caseId || contact.opportunityId) && !contact.address && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CalendarIcon className="w-7 h-7" />
                      <span className="text-xs">Calendar</span>
                    </span>
                  )}
                </div>
                {/* Timer section */}
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Timer:</span>
                  <span className="font-mono text-base px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {formatElapsed(timer.elapsed)}
                  </span>
                  {timer.running ? (
                    <button
                      className="card-action-btn text-yellow-600 hover:text-yellow-800 p-2"
                      title="Pause Timer"
                      onClick={e => { e.stopPropagation(); pauseTimer(contact.id); }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                  ) : (
                    <button
                      className="card-action-btn text-green-600 hover:text-green-800 p-2"
                      title="Start Timer"
                      onClick={e => { e.stopPropagation(); startTimer(contact.id); }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                    </button>
                  )}
                  <button
                    className="card-action-btn text-gray-400 hover:text-red-500 p-2"
                    title="Reset Timer"
                    onClick={e => { e.stopPropagation(); resetTimer(contact.id); }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8V4m0 0L8 8m4-4l4 4" /><circle cx="12" cy="12" r="8" /></svg>
                  </button>
                  {!timer.running && timer.elapsed > 0 && (
                    <button
                      className="card-action-btn text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded text-sm ml-2"
                      title="Log this time for billing"
                      onClick={e => { e.stopPropagation(); handleLogTimeFromTimer(contact, timer.elapsed); }}
                    >
                      Log Time
                    </button>
                  )}
                </div>
                {/* Billing summary - managed by global state */}
                {(totalBillableHours > 0 || totalUnbilledHours > 0) && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Billable Hours:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{totalBillableHours.toFixed(1)}h</span>
                    </div>
                    {totalUnbilledHours > 0 && (
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Unbilled:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{totalUnbilledHours.toFixed(1)}h</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateContact}
      />
      {selectedContact && (
        <ContactDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          contact={selectedContact}
          activities={activities}
          setActivities={() => {}}
          tasks={tasks}
          setTasks={() => {}}
          opportunities={opportunities}
          projects={projects}
          cases={cases}
          teamMembers={teamMembers}
          currentUser={currentUser}
          syncStatus={selectedContactSyncStatus}
          onRetrySync={handleRetrySync}
        />
      )}
      {selectedContact && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          recipientName={selectedContact.name}
          recipientEmail={selectedContact.email}
          subject={`Regarding ${selectedContact.company}`}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to permanently delete ${selectedContact?.name}? This action cannot be undone.`}
      />
      {/* Log Activity Modal for card log icon */}
      {isLogActivityOpen && logActivityContact && (
        <LogActivityModal
          isOpen={isLogActivityOpen}
          onClose={() => { setIsLogActivityOpen(false); setLogActivityContact(null); }}
          onSubmit={handleLogActivity}
          contacts={[]}
          contact={logActivityContact}
        />
      )}
      {/* Edit Contact Modal for card edit icon */}
      {isEditModalOpen && editContact && (
        <CreateContactModal
          isOpen={isEditModalOpen}
          onClose={() => { setEditModalOpen(false); setEditContact(null); }}
          onSubmit={handleEditContact}
          initialData={editContact}
          mode="edit"
        />
      )}
      {/* LogTimeModal for billing from timer */}
      {logTimeModalOpen && logTimeContact && (
        <LogTimeModal
          isOpen={logTimeModalOpen}
          onClose={() => { setLogTimeModalOpen(false); setLogTimeContact(null); setLogTimeDuration(0); }}
          onSubmit={(timeEntryData, taskId, newStatus) => {
            // BILLING MANAGEMENT: Create and save time entry to global store
            // All billing data is managed through global state (timeEntries)
            const timeEntry = {
              id: `time-${Date.now()}`,
              contactId: logTimeContact.id,
              contactName: logTimeContact.name,
              description: timeEntryData.description || `Time logged for ${logTimeContact.name}`,
              duration: timeEntryData.duration || logTimeDuration,
              date: timeEntryData.date || new Date().toISOString().split('T')[0],
              isBillable: timeEntryData.isBillable !== false, // Default to billable
              status: TimeEntryStatus.Unbilled,
              hourlyRate: timeEntryData.hourlyRate || 0,
              taskId: taskId,
              userId: userId || '',
              syncStatus: 'pending' as const
            };
            
            // Add to global store for billing management
            addTimeEntry(timeEntry);
            
            // Close modal and reset
            setLogTimeModalOpen(false);
            setLogTimeContact(null);
            setLogTimeDuration(0);
            
            // Reset timer for this contact
            if (logTimeContact) resetTimer(logTimeContact.id);
            
            // If a task and new status are provided, update the task status
            if (taskId && newStatus && updateTask) {
              const taskToUpdate = tasks.find(t => t.id === taskId);
              if (taskToUpdate) {
                updateTask({ ...taskToUpdate, status: newStatus });
              }
            }
          }}
          contacts={[logTimeContact]}
          tasks={tasks.filter(t => t.contactId === logTimeContact.id)}
          initialDuration={logTimeDuration}
        />
      )}
    </>
  );
};

// Icons
const EyeIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const MailIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.842 18 2 13.158 2 8V3z" /></svg>;
const TrashIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
// Add LogIcon definition
const LogIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
  </svg>
);
// Add EditIcon definition
const EditIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12" />
  </svg>
);
const MapIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.946l5.447-1.362a2 2 0 01.894 0l5.447 1.362A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.946L15 20m-6 0V4m6 16V4" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);
const CalendarIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export default Contacts;