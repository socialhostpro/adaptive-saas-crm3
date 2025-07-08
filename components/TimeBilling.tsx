import React, { useState, useMemo, useEffect } from 'react';
import { TimeEntry, TimeEntryStatus, Contact, Invoice, LineItem, InvoiceStatus, TeamMember } from '../types';
import Card from './shared/Card';
import LogTimeModal from './LogTimeModal';
import { supabase } from '../lib/supabaseClient';
import { toSnakeCase } from '../lib/toSnakeCase';
import { useGlobalStore, TimeEntryWithSync, SyncStatus } from '../hooks/useGlobalStore';

interface TimeBillingProps {
    contacts: Contact[];
    currentUser?: TeamMember;
    appContext: any;
}

const TimeEntryStatusBadge: React.FC<{ status: TimeEntryStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full inline-block";
  let colorClasses = "";
  switch (status) {
    case TimeEntryStatus.Unbilled: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case TimeEntryStatus.Invoiced: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const TimeBilling: React.FC<TimeBillingProps> = ({ contacts, currentUser, appContext }) => {
    // Persistent state: timeEntries (from global store)
    const { timeEntries, setTimeEntries, addTimeEntry, updateTimeEntry } = useGlobalStore();
    // Ephemeral UI state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLogTimeModalOpen, setLogTimeModalOpen] = useState(false);
    const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());

    // Initial fetch/hydrate from Supabase (on login/app start)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: timeData, error: timeError } = await supabase.from('time_entries').select('*');
                if (timeError) throw timeError;
                setTimeEntries((timeData || []).map((t: TimeEntry) => ({ ...t, syncStatus: 'synced' as SyncStatus })));
                const { data: invoiceData, error: invoiceError } = await supabase.from('invoices').select('*');
                if (invoiceError) throw invoiceError;
                setInvoices(invoiceData || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load time billing data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setTimeEntries]);

    const summary = useMemo(() => {
        return timeEntries.reduce((acc: { totalHours: number; billableHours: number; unbilledHours: number }, entry: TimeEntryWithSync) => {
            acc.totalHours += entry.duration;
            if (entry.isBillable) {
                acc.billableHours += entry.duration;
                if (entry.status === TimeEntryStatus.Unbilled) {
                    acc.unbilledHours += entry.duration;
                }
            }
            return acc;
        }, { totalHours: 0, billableHours: 0, unbilledHours: 0 });
    }, [timeEntries]);

    // CREATE time entry (optimistic update, then Supabase sync)
    const handleLogTime = async (newEntryData: Omit<TimeEntry, 'id' | 'contactName' | 'status'>) => {
        const contact = contacts.find(c => c.id === newEntryData.contactId);
        if (!contact) return;
        setError(null);
        setLoading(true);
        const newEntry: TimeEntryWithSync = {
            ...newEntryData,
            id: `temp-te-${Date.now()}`,
            contactName: contact.name,
            status: TimeEntryStatus.Unbilled,
            syncStatus: 'pending',
        };
        addTimeEntry(newEntry);
        setLogTimeModalOpen(false);
        try {
            const { error: insertError } = await supabase.from('time_entries').insert([toSnakeCase(newEntry)]);
            if (insertError) throw insertError;
            updateTimeEntry({ ...newEntry, syncStatus: 'synced' });
        } catch (err: any) {
            updateTimeEntry({ ...newEntry, syncStatus: 'error' });
            setError(err.message || 'Failed to log time.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEntry = (entryId: string, isSelected: boolean) => {
        setSelectedEntryIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(entryId);
            } else {
                newSet.delete(entryId);
            }
            return newSet;
        });
    };
    
    // CREATE invoices for selected entries (Supabase only, state update for timeEntries)
    const handleCreateInvoices = async () => {
        const entriesToInvoice = timeEntries.filter((e: TimeEntryWithSync) => selectedEntryIds.has(e.id) && e.isBillable && e.status === TimeEntryStatus.Unbilled);
        if (entriesToInvoice.length === 0) {
            alert("No billable, unbilled entries selected.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const entriesByContact = entriesToInvoice.reduce((acc: Record<string, TimeEntryWithSync[]>, entry: TimeEntryWithSync) => {
                (acc[entry.contactId] = acc[entry.contactId] || []).push(entry);
                return acc;
            }, {} as Record<string, TimeEntryWithSync[]>);
            const newInvoices: Invoice[] = Object.values(entriesByContact).map((contactEntries, index: number) => {
                const entries = contactEntries as TimeEntryWithSync[];
                const firstEntry = entries[0];
                const lineItems: LineItem[] = entries.map((e: TimeEntryWithSync) => ({
                    id: e.id,
                    description: `${e.description} (on ${new Date(e.date).toLocaleDateString()})`,
                    quantity: e.duration,
                    unitPrice: e.hourlyRate || 0,
                }));
                const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                return {
                    id: `inv-${Date.now()}-${firstEntry.contactId}`,
                    invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1 + index).padStart(3, '0')}`,
                    contactId: firstEntry.contactId,
                    contactName: firstEntry.contactName,
                    totalAmount,
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: InvoiceStatus.Draft,
                    lineItems,
                    payments: [],
                };
            });
            // Insert invoices
            for (const invoice of newInvoices) {
                const { error: insertError } = await supabase.from('invoices').insert([toSnakeCase(invoice)]);
                if (insertError) throw insertError;
            }
            setInvoices(prev => [...prev, ...newInvoices]);
            // Update time entries as invoiced
            const invoicedEntryIds = new Set(entriesToInvoice.map((e: TimeEntryWithSync) => e.id));
            for (const entryId of invoicedEntryIds) {
                await supabase.from('time_entries').update(toSnakeCase({ status: TimeEntryStatus.Invoiced })).eq('id', entryId);
            }
            // Optimistically update state
            timeEntries.forEach((e: TimeEntryWithSync) => {
                if (invoicedEntryIds.has(e.id)) {
                    updateTimeEntry({ ...e, status: TimeEntryStatus.Invoiced, syncStatus: 'pending' });
                }
            });
            // After Supabase update, mark as synced
            timeEntries.forEach((e: TimeEntryWithSync) => {
                if (invoicedEntryIds.has(e.id)) {
                    updateTimeEntry({ ...e, status: TimeEntryStatus.Invoiced, syncStatus: 'synced' });
                }
            });
            setSelectedEntryIds(new Set());
        } catch (err: any) {
            setError(err.message || 'Failed to create invoices.');
        } finally {
            setLoading(false);
        }
    };

    // Documentation:
    // - Persistent state: timeEntries (Zustand global store, localStorage)
    // - Ephemeral state: modals, loading, error, filters (component state)

    return (
        <>
        {/* Loading and error states */}
        {loading && <div className="text-center py-8">Loading time billing data...</div>}
        {error && <div className="text-center text-red-500 py-2">{error}</div>}
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Time Billing</h1>
                </div>
                <div className="flex items-center gap-2">
                    {selectedEntryIds.size > 0 && (
                        <button onClick={handleCreateInvoices} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white transition-colors duration-200">
                           Create Invoice ({selectedEntryIds.size})
                        </button>
                    )}
                    <button onClick={() => setLogTimeModalOpen(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white transition-colors duration-200">
                        Log Time
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Summary</h2>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Total Hours</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.totalHours.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Billable Hours</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.billableHours.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Unbilled Hours</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.unbilledHours.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Time Entries</h2>
                    {timeEntries.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">No time entries found. Log some time!</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {timeEntries.map((entry: TimeEntryWithSync) => (
                                <div key={entry.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                                    <div className="flex-1 mr-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleString()}</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{entry.description}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.contactName}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TimeEntryStatusBadge status={entry.status} />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">{entry.duration.toFixed(2)} hrs</span>
                                        <button onClick={() => handleSelectEntry(entry.id, !selectedEntryIds.has(entry.id))} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${selectedEntryIds.has(entry.id) ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                            {selectedEntryIds.has(entry.id) ? 'Selected' : 'Select'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
        {/* Log Time Modal */}
        <LogTimeModal isOpen={isLogTimeModalOpen} onClose={() => setLogTimeModalOpen(false)} onSubmit={handleLogTime} contacts={contacts} />
        </>
    );
};

export default TimeBilling;
