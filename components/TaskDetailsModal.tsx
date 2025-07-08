

import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TeamMember, TimeEntry, MediaFile, MediaFileType, Lead, Opportunity, Project, Case } from '../types';
import MediaLibraryModal from './MediaLibraryModal';
import AIDraftModal from './AIDraftModal';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onUpdateTask: (task: Task) => void;
    teamMembers: TeamMember[];
    timeEntries?: TimeEntry[];
    mediaFiles?: MediaFile[];
    // Linked entity data
    leads?: Lead[];
    opportunities?: Opportunity[];
    projects?: Project[];
    cases?: Case[];
}

type ActiveTab = 'details' | 'timeLogs' | 'files' | 'linkedEntity';

const SparklesIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>;

const FileTypeIcon: React.FC<{ type: MediaFileType }> = ({ type }) => {
    const iconBaseClass = "h-6 w-6 text-white";
    if (type === 'image') return <div className="p-2 bg-pink-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>;
    if (type === 'video') return <div className="p-2 bg-indigo-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>;
    return <div className="p-2 bg-teal-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = (props) => {
    const { 
        isOpen, 
        onClose, 
        task, 
        onUpdateTask, 
        teamMembers, 
        timeEntries = [], 
        mediaFiles = [],
        leads = [],
        opportunities = [],
        projects = [],
        cases = []
    } = props;
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Task>(task);
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);
    const [isAIDraftOpen, setAIDraftOpen] = useState(false);

    const taskTimeEntries = useMemo(() => timeEntries.filter(t => t.taskId === task.id), [timeEntries, task.id]);
    const attachedFiles = useMemo(() => (task.mediaFileIds || []).map(id => mediaFiles.find(f => f.id === id)).filter(Boolean) as MediaFile[], [task.mediaFileIds, mediaFiles]);
    
    // Find the linked entity based on task's foreign keys
    const linkedEntity = useMemo(() => {
        if (task.leadId) {
            const lead = leads.find(l => l.id === task.leadId);
            return lead ? { type: 'Lead', entity: lead } : null;
        } else if (task.opportunityId) {
            const opportunity = opportunities.find(o => o.id === task.opportunityId);
            return opportunity ? { type: 'Opportunity', entity: opportunity } : null;
        } else if (task.projectId) {
            const project = projects.find(p => p.id === task.projectId);
            return project ? { type: 'Project', entity: project } : null;
        } else if (task.caseId) {
            const caseItem = cases.find(c => c.id === task.caseId);
            return caseItem ? { type: 'Case', entity: caseItem } : null;
        }
        return null;
    }, [task.leadId, task.opportunityId, task.projectId, task.caseId, leads, opportunities, projects, cases]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdateTask(editData);
        setIsEditing(false);
    };

    const handleSelectFile = (file: MediaFile) => {
        const updatedFileIds = [...(task.mediaFileIds || []), file.id];
        onUpdateTask({ ...task, mediaFileIds: updatedFileIds });
        setMediaLibraryOpen(false);
    };

    const handleRemoveFile = (fileId: string) => {
        const updatedFileIds = (task.mediaFileIds || []).filter(id => id !== fileId);
        onUpdateTask({ ...task, mediaFileIds: updatedFileIds });
    };

    if (!isOpen) return null;

    const TabButton: React.FC<{ tab: ActiveTab; label: string; count: number }> = ({ tab, label, count }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            {label} <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-1">{count}</span>
        </button>
    );
    
    const renderContent = () => {
        switch(activeTab) {
            case 'details': return (
                <div className="space-y-4">
                    {isEditing ? (
                        <>
                            <input name="title" value={editData.title} onChange={handleEditChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-bold text-gray-900 dark:text-white" />
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <button type="button" onClick={() => setAIDraftOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
                                        <SparklesIcon className="w-3 h-3"/> AI Draft
                                    </button>
                                </div>
                                <textarea name="description" value={editData.description} onChange={handleEditChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{task.description || 'No description provided.'}</p>
                        </>
                    )}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <select name="status" value={isEditing ? editData.status : task.status} onChange={handleEditChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white disabled:bg-transparent disabled:border-none disabled:p-0 disabled:appearance-none">
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                            <select name="priority" value={isEditing ? editData.priority : task.priority} onChange={handleEditChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white disabled:bg-transparent disabled:border-none disabled:p-0 disabled:appearance-none">
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                            <input type="date" name="dueDate" value={isEditing ? editData.dueDate : task.dueDate} onChange={handleEditChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white disabled:bg-transparent disabled:border-none disabled:p-0"/>
                        </div>
                     </div>
                </div>
            )
            case 'timeLogs': return (
                <div className="space-y-3">
                    {taskTimeEntries.length > 0 ? taskTimeEntries.map(entry => (
                        <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{entry.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{entry.duration.toFixed(2)}h</p>
                        </div>
                    )) : <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No time logged for this task.</p>}
                </div>
            )
            case 'files': return (
                 <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setMediaLibraryOpen(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">Link File</button>
                    </div>
                    <div className="space-y-3">
                        {attachedFiles.map(file => (
                            <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <FileTypeIcon type={file.type} />
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Uploaded {file.uploadedAt instanceof Date ? file.uploadedAt.toLocaleDateString() : new Date(file.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleRemoveFile(file.id)} className="text-gray-400 hover:text-red-500">&times;</button>
                            </div>
                        ))}
                         {attachedFiles.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">No files attached.</p>}
                    </div>
                 </div>
            )
            case 'linkedEntity': return (
                <div className="space-y-4">
                    {linkedEntity ? (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 mb-2">
                                        {linkedEntity.type}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {linkedEntity.type === 'Lead' && (linkedEntity.entity as Lead).name}
                                        {linkedEntity.type === 'Opportunity' && (linkedEntity.entity as Opportunity).title}
                                        {linkedEntity.type === 'Project' && (linkedEntity.entity as Project).name}
                                        {linkedEntity.type === 'Case' && (linkedEntity.entity as Case).name}
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Lead specific fields */}
                                {linkedEntity.type === 'Lead' && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Lead).company || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                {(linkedEntity.entity as Lead).status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(linkedEntity.entity as Lead).score}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{(linkedEntity.entity as Lead).score}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Source</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Lead).source || '—'}</p>
                                        </div>
                                    </>
                                )}
                                
                                {/* Opportunity specific fields */}
                                {linkedEntity.type === 'Opportunity' && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                                {(linkedEntity.entity as Opportunity).stage}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</p>
                                            <p className="text-sm text-gray-900 dark:text-white">${(linkedEntity.entity as Opportunity).value?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Close Date</p>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {(linkedEntity.entity as Opportunity).closeDate ? new Date((linkedEntity.entity as Opportunity).closeDate!).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Opportunity).contactName || '—'}</p>
                                        </div>
                                    </>
                                )}
                                
                                {/* Project specific fields */}
                                {linkedEntity.type === 'Project' && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                {(linkedEntity.entity as Project).status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Project).contactName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</p>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {(linkedEntity.entity as Project).deadline ? new Date((linkedEntity.entity as Project).deadline!).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget</p>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {(linkedEntity.entity as Project).budget ? `$${(linkedEntity.entity as Project).budget!.toLocaleString()}` : '—'}
                                            </p>
                                        </div>
                                    </>
                                )}
                                
                                {/* Case specific fields */}
                                {linkedEntity.type === 'Case' && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                                {(linkedEntity.entity as Case).status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Number</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Case).caseNumber || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Type</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Case).caseType || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Open Date</p>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {(linkedEntity.entity as Case).openDate ? new Date((linkedEntity.entity as Case).openDate).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Judge</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Case).judge || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attorney</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{(linkedEntity.entity as Case).attorneyId || '—'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Description section for all types */}
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</p>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {(linkedEntity.entity as any).description || 'No description available.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Standalone Task</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This task is not linked to any specific project, lead, opportunity, or case.</p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-left max-w-md mx-auto">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Task Type:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">General Task</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Contact:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{task.contactName || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Due Date:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    }

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">For: {task.contactName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                 <div className="border-b border-gray-200 dark:border-gray-700 px-4">
                    <nav className="-mb-px flex space-x-4">
                        <TabButton tab="details" label="Details" count={0} />
                        <TabButton tab="timeLogs" label="Time Logs" count={taskTimeEntries.length} />
                        <TabButton tab="files" label="Files" count={attachedFiles.length} />
                        <TabButton tab="linkedEntity" label={linkedEntity ? linkedEntity.type : "Task Type"} count={linkedEntity ? 1 : 0} />
                    </nav>
                </div>
                <main className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    {activeTab === 'details' && (
                        isEditing ? (
                             <>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-600 font-semibold px-4 py-2 rounded-lg">Cancel</button>
                                <button onClick={handleSave} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg">Save Changes</button>
                             </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg">Edit</button>
                        )
                    )}
                    {activeTab !== 'details' && <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 font-semibold px-4 py-2 rounded-lg">Close</button>}
                </footer>
            </div>
        </div>
        <MediaLibraryModal
            isOpen={isMediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
            mediaFiles={mediaFiles}
            onSelectFile={handleSelectFile}
        />
        <AIDraftModal
            isOpen={isAIDraftOpen}
            onClose={() => setAIDraftOpen(false)}
            onInsertText={(text) => setEditData(prev => ({...prev, description: text}))}
            promptContext={`You are an AI assistant helping a user write a task description for the task titled "${editData.title}".`}
        />
        </>
    );
};

export default TaskDetailsModal;