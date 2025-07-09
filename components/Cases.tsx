import React, { useState, useMemo } from 'react';
import { Case, CaseStatus, CaseTask, TaskStatus, Contact, TeamMember, MediaFile } from '../types';
import Card from './shared/Card';
import CreateCaseModal from './CreateCaseModal';
import CaseDetailsModal from './CaseDetailsModal';
import { useGlobalStore } from '../hooks/useGlobalStore';
import { opportunities } from '../data';

interface CasesProps {
    contacts: Contact[];
    teamMembers: TeamMember[];
    mediaFiles: MediaFile[];
    setMediaFiles?: React.Dispatch<React.SetStateAction<MediaFile[]>>;
    appContext: any;
}

const CaseStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-md inline-block";
  let colorClasses = "";
  switch (status) {
    case CaseStatus.ClosedWon: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case CaseStatus.Discovery:
    case CaseStatus.InTrial:
        colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case CaseStatus.OnHold: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case CaseStatus.Intake: colorClasses = "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case CaseStatus.ClosedLost: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


const CaseCard: React.FC<{ caseItem: Case; tasks: CaseTask[]; onClick: () => void }> = ({ caseItem, tasks, onClick }) => {
    const progress = useMemo(() => {
        const relatedTasks = tasks.filter(t => t.caseId === caseItem.id);
        if (relatedTasks.length === 0) return 0;
        const completedTasks = relatedTasks.filter(t => t.status === TaskStatus.Completed).length;
        return (completedTasks / relatedTasks.length) * 100;
    }, [caseItem, tasks]);

    // Quick contacts for opposing consual
    const quickContacts = [
      caseItem.oppositionContactName ? { label: 'Opposition', value: caseItem.oppositionContactName, phone: caseItem.oppositionPhone, email: caseItem.oppositionEmail } : null,
      caseItem.consual ? { label: 'Consual', value: caseItem.consual } : null,
      caseItem.defendant ? { label: 'Defendant', value: caseItem.defendant } : null,
    ].filter((c): c is { label: string; value: string; phone?: string; email?: string } => !!c);

    const charges: string[] = (caseItem as any).charges || [];

    // Find next due date from tasks
    const now = new Date();
    const upcomingTasks = tasks.filter(t => t.caseId === caseItem.id && t.dueDate && new Date(t.dueDate) > now && t.status !== TaskStatus.Completed);
    const nextTask = upcomingTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    const nextDueDate = nextTask ? new Date(nextTask.dueDate) : null;
    let daysToDue = nextDueDate ? Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Gradient color logic: blue (far) to red (close)
    let cardGradient = 'from-blue-900 to-blue-700';
    if (daysToDue !== null) {
        if (daysToDue <= 3) cardGradient = 'from-red-700 to-red-500';
        else if (daysToDue <= 7) cardGradient = 'from-orange-600 to-red-400';
        else if (daysToDue <= 14) cardGradient = 'from-blue-700 to-orange-400';
    }

    // Alert if due soon
    const showAlert = daysToDue !== null && daysToDue <= 3;

    // Assume contact link is /contacts/{contactId}
    const contactLink = caseItem.contactId ? `/contacts/${caseItem.contactId}` : undefined;

    // Show mug shot if criminal case and image exists
    let mugShotUrl: string | undefined = undefined;
    if (caseItem.caseType && caseItem.caseType.toLowerCase() === 'criminal' && caseItem.mediaFileIds && caseItem.mediaFileIds.length > 0) {
        // Find first image file in mediaFiles
        const allMediaFiles = useGlobalStore.getState().mediaFiles || [];
        const mugFile = allMediaFiles.find(f => caseItem.mediaFileIds?.includes(f.id) && f.type === 'image');
        if (mugFile) mugShotUrl = mugFile.url;
    }

    return (
        <Card className={`!p-0 flex flex-col cursor-pointer hover:shadow-lg dark:hover:bg-gray-700/40 transition-all duration-200 bg-gradient-to-br ${cardGradient}`} onClick={onClick}>
            {mugShotUrl && (
              <div className="w-full flex justify-center items-center bg-black/30 rounded-t-xl overflow-hidden" style={{height: 120}}>
                <img src={mugShotUrl} alt="Mug Shot" className="object-cover h-full w-auto max-w-full" style={{maxHeight: 120}} />
              </div>
            )}
            <div className="p-6"> {/* Increased padding */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-2xl text-gray-100 pr-2">{caseItem.name}</h3>
                    <CaseStatusBadge status={caseItem.status} />
                </div>
                <div className="grid grid-cols-1 gap-2 text-base text-blue-100"> {/* Increased text size */}
                  <div>
                    <span className="font-semibold">Client:</span>{' '}
                    {contactLink ? (
                      <a
                        href={contactLink}
                        className="underline text-blue-200 hover:text-white font-bold text-lg"
                        onClick={e => { e.stopPropagation(); }}
                      >
                        {caseItem.contactName}
                      </a>
                    ) : (
                      <span className="font-bold text-lg">{caseItem.contactName}</span>
                    )}
                  </div>
                  <div><span className="font-semibold">Case #:</span> <span className="text-lg">{caseItem.caseNumber}</span></div>
                  {caseItem.caseType && <div><span className="font-semibold">Type:</span> <span className="text-lg">{caseItem.caseType}</span></div>}
                  {caseItem.assigned && <div><span className="font-semibold">Assigned:</span> <span className="text-lg">{caseItem.assigned}</span></div>}
                  {caseItem.judge && <div><span className="font-semibold">Judge:</span> <span className="text-lg">{caseItem.judge}</span></div>}
                  {caseItem.opportunity && <div><span className="font-semibold">Opposing Opportunity:</span> <span className="text-lg">{caseItem.opportunity}</span></div>}
                  {quickContacts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {quickContacts.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-800/40 rounded text-blue-100 border border-blue-300/30 text-base">
                          <span className="font-semibold">{c.label}:</span> {c.value}
                          {c.phone && <a href={`tel:${c.phone}`} className="ml-1 underline">{c.phone}</a>}
                          {c.email && <a href={`mailto:${c.email}`} className="ml-1 underline">{c.email}</a>}
                        </span>
                      ))}
                    </div>
                  )}
                  {charges.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold">Charges:</span>
                      <ul className="list-disc ml-5">
                        {charges.map((charge: string, idx: number) => (
                          <li key={idx} className="text-lg">{charge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {caseItem.description && <div className="mt-1"><span className="font-semibold">Desc:</span> <span className="text-lg">{caseItem.description}</span></div>}
                </div>
                {/* Next event/due date */}
                <div className="mt-4 flex items-center gap-2">
                  {nextDueDate && (
                    <>
                      <span className="font-semibold text-white text-lg">Next Due:</span>
                      <span className="text-white text-lg">{nextDueDate.toLocaleDateString()}</span>
                      {showAlert && <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded font-bold animate-pulse text-lg">⚠ Due Soon!</span>}
                    </>
                  )}
                </div>
                <div className="mt-6">
                    <div className="flex justify-between items-center text-base text-blue-100 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-blue-200/30 rounded-full h-3">
                        <div className="bg-white h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="border-t border-blue-200/30 p-4 mt-auto bg-blue-900/60 rounded-b-xl flex justify-between text-base text-blue-100">
                <div>
                    <span className="text-blue-200">Opened: </span>
                    <span className="font-medium">{new Date(caseItem.openDate).toLocaleDateString()}</span>
                </div>
            </div>
        </Card>
    );
};


const Cases: React.FC<CasesProps> = (props) => {
  const {
    contacts,
    teamMembers,
    mediaFiles,
    setMediaFiles = () => {},
    appContext
  } = props;

    // Use global store for cases
    const cases = useGlobalStore(state => state.cases);
    const addCase = useGlobalStore(state => state.addCase);
    const updateCase = useGlobalStore(state => state.updateCase);
    const updateCaseTask = useGlobalStore(state => state.updateCaseTask);
    const addCaseTask = useGlobalStore(state => state.addCaseTask);
    const caseTasks = useGlobalStore(state => state.caseTasks);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [caseTypeFilter, setCaseTypeFilter] = useState('All');
    const [assignedFilter, setAssignedFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'created' | 'due'>('created');

    // Filtered and sorted cases
    const filteredCases = useMemo(() => {
        let filtered = cases
            .filter(c => statusFilter === 'All' || c.status === statusFilter)
            .filter(c => caseTypeFilter === 'All' || c.caseType === caseTypeFilter)
            .filter(c => assignedFilter === 'All' || c.assigned === assignedFilter)
            .filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        // Sorting
        if (sortBy === 'created') {
            filtered = filtered.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
        } else if (sortBy === 'due') {
            // Find next due date for each case
            const now = new Date();
            const getNextDue = (c: Case) => {
                const tasks = caseTasks.filter(t => t.caseId === c.id && t.dueDate && new Date(t.dueDate) > now && t.status !== TaskStatus.Completed);
                if (tasks.length === 0) return Infinity;
                return Math.min(...tasks.map(t => new Date(t.dueDate).getTime()));
            };
            filtered = filtered.sort((a, b) => getNextDue(a) - getNextDue(b));
        }
        return filtered;
    }, [cases, statusFilter, caseTypeFilter, assignedFilter, searchTerm, sortBy, caseTasks]);

    // CREATE case
    const handleCreateCase = (newCaseData: Omit<Case, 'id' | 'contactName'>) => {
        const contact = contacts.find(c => c.id === newCaseData.contactId);
        if (!contact) return;
        const newCase: Case = {
            ...newCaseData,
            id: `case-${Date.now()}`,
            contactName: contact.name,
            mediaFileIds: [],
        };
        addCase(newCase);
        setCreateModalOpen(false);
    };
    // UPDATE case
    const handleUpdateCase = (updatedCase: Case) => {
        updateCase(updatedCase);
        setSelectedCase(updatedCase);
    };
    // UPDATE case task status
    const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
        const task = caseTasks.find(t => t.id === taskId);
        if (!task) return;
        updateCaseTask({ ...task, status });
    };

    // CREATE case task
    const handleAddTask = (newTaskData: Omit<CaseTask, 'id'>) => {
        const newTask: CaseTask = {
            ...newTaskData,
            id: `ctask-${Date.now()}`
        };
        addCaseTask(newTask);
    };

    const handleOpenDetails = (caseItem: Case) => {
        setSelectedCase(caseItem);
        setDetailsModalOpen(true);
    };

    return (
        <>
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex-shrink-0">Cases</h1>
                </div>
                <div className="flex items-center gap-2 w-full justify-start md:justify-end">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="All">All Statuses</option>
                        {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        value={caseTypeFilter}
                        onChange={e => setCaseTypeFilter(e.target.value)}
                        className="w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="All">All Types</option>
                        {[...new Set(cases.map(c => c.caseType).filter(Boolean))].map(type => (
                            <option key={type} value={type as string}>{type}</option>
                        ))}
                    </select>
                    <select
                        value={assignedFilter}
                        onChange={e => setAssignedFilter(e.target.value)}
                        className="w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="All">All Assigned</option>
                        {[...new Set(cases.map(c => c.assigned).filter(Boolean))].map(assigned => (
                            <option key={assigned as string} value={assigned as string}>{assigned}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as 'created' | 'due')}
                        className="w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="created">Sort: Newest Created</option>
                        <option value="due">Sort: Next Due Date</option>
                    </select>
                    <button onClick={() => setCreateModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex-shrink-0">
                        Add Case
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCases.length > 0 ? (
                    filteredCases.map(caseItem => (
                        <CaseCard 
                            key={caseItem.id} 
                            caseItem={caseItem}
                            tasks={caseTasks}
                            onClick={() => handleOpenDetails(caseItem)}
                        />
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <Card className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 py-8">No cases match your current filters.</p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
        <CreateCaseModal 
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateCase}
            contacts={contacts}
            teamMembers={teamMembers}
        />
        {selectedCase && (
            <CaseDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                caseItem={selectedCase}
                tasks={caseTasks}
                teamMembers={teamMembers}
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onUpdateCase={handleUpdateCase}
                onAddTask={handleAddTask}
                contacts={contacts}
                opportunities={opportunities}
            />
        )}
        </>
    );
};

export default Cases;