import React, { useState, useMemo } from 'react';
// import { supabase } from '../lib/supabaseClient'; // No longer used
import { Opportunity, OpportunityStage, Contact, Activity, TeamMember } from '../types';
import Card from './shared/Card';
import CreateOpportunityModal from './CreateOpportunityModal';
import OpportunityDetailsModal from './OpportunityDetailsModal';
import EditOpportunityModal from './EditOpportunityModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useGlobalStore } from '../hooks/useGlobalStore';

interface OpportunitiesProps {
    opportunities: Opportunity[];
    setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
    contacts: Contact[];
    teamMembers: TeamMember[];
    activities: Activity[];
    appContext: any;
}

const ALL_STAGES = Object.values(OpportunityStage);

const stageColors: { [key in OpportunityStage]: { border: string, bg: string, text: string } } = {
    [OpportunityStage.Prospecting]: { border: 'border-gray-400', bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-500 dark:text-gray-400' },
    [OpportunityStage.Qualification]: { border: 'border-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    [OpportunityStage.Proposal]: { border: 'border-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    [OpportunityStage.Negotiation]: { border: 'border-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    [OpportunityStage.ClosedWon]: { border: 'border-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    [OpportunityStage.ClosedLost]: { border: 'border-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
};


const OpportunityCard: React.FC<{ opportunity: Opportunity; onClick: () => void; onDragStart: (e: React.DragEvent, id: string) => void; assignee?: TeamMember; }> = ({ opportunity, onClick, onDragStart, assignee }) => {
    return (
        <div draggable onDragStart={(e) => onDragStart(e, opportunity.id)} onClick={onClick}>
            <Card className={`mb-3 !p-4 cursor-pointer active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 border-l-4 ${stageColors[opportunity.stage].border}`}>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white hover:underline">{opportunity.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opportunity.contactName}</p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-semibold text-primary-500">${opportunity.value.toLocaleString()}</p>
                    {assignee && (
                        <img src={assignee.avatarUrl} alt={assignee.name} title={`Assigned to ${assignee.name}`} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    )}
                </div>
            </Card>
        </div>
    );
};

const KanbanColumn: React.FC<{
    stage: OpportunityStage;
    opportunities: Opportunity[];
    teamMembers: TeamMember[];
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, stage: OpportunityStage) => void;
    onDragOver: (e: React.DragEvent) => void;
    onCardClick: (opportunity: Opportunity) => void;
}> = ({ stage, opportunities, teamMembers, onDragStart, onDrop, onDragOver, onCardClick }) => {
    const stageInfo = stageColors[stage];
    return (
        <div
            className="w-full"
            onDrop={(e) => onDrop(e, stage)}
            onDragOver={onDragOver}
        >
            <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <h3 className={`text-sm font-semibold uppercase tracking-wider ${stageInfo.text} px-4 py-3 border-b-2 ${stageInfo.border} mb-3`}>
                    {stage} <span className="text-xs ml-1 text-gray-400">({opportunities.length})</span>
                </h3>
                <div className="flex-1 overflow-y-auto px-3 no-scrollbar min-h-[100px]">
                    {opportunities.map(op => {
                         const assignee = teamMembers.find(tm => tm.id === op.assigneeId);
                         return <OpportunityCard key={op.id} opportunity={op} assignee={assignee} onDragStart={onDragStart} onClick={() => onCardClick(op)} />
                    })}
                </div>
            </div>
        </div>
    );
};

const OpportunityCardView: React.FC<{ opportunities: Opportunity[], onCardClick: (opportunity: Opportunity) => void, teamMembers: TeamMember[] }> = ({ opportunities, onCardClick, teamMembers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map(op => {
                const assignee = teamMembers.find(tm => tm.id === op.assigneeId);
                return (
                 <Card key={op.id} onClick={() => onCardClick(op)} className="!p-4 flex flex-col justify-between cursor-pointer hover:shadow-lg dark:hover:bg-gray-700/40 transition-shadow duration-200">
                    <div>
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold text-gray-900 dark:text-white mb-1 pr-2 hover:underline">{op.title}</h4>
                             <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-md ${stageColors[op.stage].bg} ${stageColors[op.stage].text}`}>{op.stage}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{op.contactName}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-end">
                        <div>
                             <p className="text-lg font-semibold text-primary-500">${op.value.toLocaleString()}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Close Date: {op.closeDate ? new Date(op.closeDate).toLocaleDateString() : '-'}</p>
                        </div>
                        {assignee && (
                            <img src={assignee.avatarUrl} alt={assignee.name} title={`Assigned to ${assignee.name}`} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800" />
                        )}
                    </div>
                </Card>
                )
            })}
        </div>
    );
};


const Opportunities: React.FC<OpportunitiesProps> = ({ opportunities, setOpportunities, contacts, teamMembers, activities, appContext }) => {
    const { setOpportunities: setGlobalOpportunities, updateOpportunity } = useGlobalStore();
    const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('All');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(false); // No longer fetch from Supabase
    const [error, setError] = useState<string | null>(null);

    // Remove Supabase fetch, rely on state only
    // useEffect(() => {
    //     const fetchOpportunities = async () => {
    //         setLoading(true);
    //         setError(null);
    //         const { data, error } = await supabase.from('opportunities').select('*');
    //         if (error) {
    //             setError('Failed to load opportunities');
    //             setOpportunities([]);
    //         } else {
    //             setOpportunities(data || []);
    //             setGlobalOpportunities(data || []); // Sync to global state
    //         }
    //         setLoading(false);
    //     };
    //     fetchOpportunities();
    //     // eslint-disable-next-line
    // }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('opportunityId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Local state only for drop (stage update)
    const handleDrop = (e: React.DragEvent, targetStage: OpportunityStage) => {
        const id = e.dataTransfer.getData('opportunityId');
        setLoading(true);
        setError(null);
        setOpportunities((prev: Opportunity[]) => prev.map((op: Opportunity) => op.id === id ? { ...op, stage: targetStage, syncStatus: 'pending' } : op));
        setGlobalOpportunities(((prev: Opportunity[]) => prev.map((op: any) => op.id === id ? { ...op, stage: targetStage, syncStatus: 'pending' } : op)) as any);
        setLoading(false);
    };

    // Local state only for create
    const handleCreateOpportunity = (newOpData: Omit<Opportunity, 'id'|'contactName'>) => {
        setError(null);
        setLoading(true);
        const contact = contacts.find(c => c.id === newOpData.contactId);
        const newOpportunity: Opportunity = {
            ...newOpData,
            id: `opp-${Date.now()}`,
            contactName: contact?.name || 'Unknown Contact',
            syncStatus: 'pending',
        };
        setGlobalOpportunities(((prev: Opportunity[]) => [newOpportunity, ...prev]) as any);
        setOpportunities((prev: Opportunity[]) => [newOpportunity, ...prev]);
        setCreateModalOpen(false);
        setLoading(false);
    };

    // Local state only for update
    const handleUpdateOpportunity = (updatedOp: Opportunity) => {
        setError(null);
        setLoading(true);
        const contact = contacts.find(c => c.id === updatedOp.contactId);
        updateOpportunity({ ...updatedOp, contactName: contact?.name || updatedOp.contactName, syncStatus: 'pending' });
        setOpportunities(prev => prev.map(op => op.id === updatedOp.id ? { ...updatedOp, contactName: contact?.name || updatedOp.contactName, syncStatus: 'pending' } : op));
        setEditModalOpen(false);
        setLoading(false);
    };

    // Local state only for delete
    const handleDeleteOpportunity = () => {
        if (!selectedOpportunity) return;
        setError(null);
        setLoading(true);
        setOpportunities(prev => prev.filter(op => op.id !== selectedOpportunity.id));
        setDeleteModalOpen(false);
        setSelectedOpportunity(null);
        setLoading(false);
    };
    
    const handleOpenDetails = (opportunity: Opportunity) => {
        setSelectedOpportunity(opportunity);
        setDetailsModalOpen(true);
    };

    const handleOpenEditModal = () => {
        setDetailsModalOpen(false); // Close details modal first
        setEditModalOpen(true);
    };
    
    const handleOpenDeleteModal = () => {
        setDetailsModalOpen(false); // Close details modal first
        setDeleteModalOpen(true);
    }

    const commonButtonClass = "px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none";
    const activeButtonClass = "bg-primary-600 text-white";
    const inactiveButtonClass = "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

    const filteredOpportunities = useMemo(() => {
        return opportunities
            .filter(op => stageFilter === 'All' || op.stage === stageFilter)
            .filter(op => 
                op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.contactName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [opportunities, stageFilter, searchTerm]);

    return (
        <>
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Opportunities</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex space-x-1">
                        <button onClick={() => setView('pipeline')} className={`${commonButtonClass} ${view === 'pipeline' ? activeButtonClass : inactiveButtonClass}`}>Pipeline</button>
                        <button onClick={() => setView('list')} className={`${commonButtonClass} ${view === 'list' ? activeButtonClass : inactiveButtonClass}`}>List</button>
                    </div>
                    <button onClick={() => setCreateModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Add
                    </button>
                </div>
            </div>

            {view === 'list' && (
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                     <input
                        type="text"
                        placeholder="Search title or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    />
                    <select 
                        value={stageFilter}
                        onChange={e => setStageFilter(e.target.value)}
                        className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    >
                        <option value="All">All Stages</option>
                        {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
            
            {view === 'pipeline' ? (
                <div className="flex-1 overflow-x-auto no-scrollbar -mx-6 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 pb-4 min-w-max">
                        {ALL_STAGES.map(stage => (
                            <KanbanColumn
                                key={stage}
                                stage={stage}
                                opportunities={opportunities.filter(op => op.stage === stage)}
                                teamMembers={teamMembers}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onCardClick={handleOpenDetails}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <OpportunityCardView opportunities={filteredOpportunities} teamMembers={teamMembers} onCardClick={handleOpenDetails} />
                </div>
            )}
        </div>
        <CreateOpportunityModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateOpportunity}
            contacts={contacts}
            teamMembers={teamMembers}
        />
        {selectedOpportunity && (
            <OpportunityDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                opportunity={selectedOpportunity}
                activities={activities}
                teamMembers={teamMembers}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
            />
        )}
        <EditOpportunityModal
            isOpen={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSubmit={handleUpdateOpportunity}
            opportunity={selectedOpportunity}
            contacts={contacts}
            teamMembers={teamMembers}
        />
        <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteOpportunity}
            title="Delete Opportunity"
            message={`Are you sure you want to permanently delete the opportunity "${selectedOpportunity?.title}"? This action cannot be undone.`}
        />
        {loading && <div className="text-center py-4">Loading opportunities...</div>}
        {error && <div className="text-center text-red-500 py-2">{error}</div>}
        </>
    );
};

export default Opportunities;
