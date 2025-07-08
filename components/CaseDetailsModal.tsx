import React, { useState, useMemo } from 'react';
import { Case, CaseTask, TaskStatus, TeamMember, MediaFile, MediaFileType, Contact, Opportunity } from '../types';
import MediaLibraryModal from './MediaLibraryModal';
import GenerateMotionModal from './GenerateMotionModal';
import CaseEditForm from './CaseEditForm';
import { useGlobalStore } from '../hooks/useGlobalStore';

interface CaseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseItem: Case;
    tasks: CaseTask[];
    teamMembers: TeamMember[];
    mediaFiles: MediaFile[];
    setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
    onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
    onAddTask: (newTask: Omit<CaseTask, 'id'>) => void;
    onUpdateCase: (updatedCase: Case) => void;
    contacts: Contact[];
    opportunities: Opportunity[];
}

type ActiveTab = 'details' | 'contacts' | 'tasks' | 'files' | 'notes' | 'history' | 'gallery' | 'ai' | 'aiagents';

const AddTaskForm: React.FC<{ caseId: string, teamMembers: TeamMember[], onAddTask: (task: Omit<CaseTask, 'id'>) => void, onCancel: () => void }> =
({ caseId, teamMembers, onAddTask, onCancel }) => {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assigneeId || !dueDate) {
            alert('Please fill out all task fields.');
            return;
        }
        onAddTask({
            caseId,
            title,
            assigneeId,
            dueDate,
            status: TaskStatus.ToDo
        });
        setTitle('');
        setAssigneeId('');
        setDueDate('');
        onCancel(); // Close form on submit
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-2">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="New task title" className="sm:col-span-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm">
                <option value="" disabled>Assign to...</option>
                {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
             <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
            <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                 <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white font-semibold px-3 py-1.5 rounded-lg text-sm">Add Task</button>
            </div>
        </form>
    )
}

const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.ToDo: return "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-500";
        case TaskStatus.InProgress: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
        case TaskStatus.Completed: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700";
        default: return "";
    }
};

const FileTypeIcon: React.FC<{ type: MediaFileType }> = ({ type }) => {
    const iconBaseClass = "h-6 w-6 text-white";
    if (type === 'image') return <div className="p-2 bg-pink-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>;
    if (type === 'video') return <div className="p-2 bg-indigo-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>;
    return <div className="p-2 bg-teal-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ isOpen, onClose, caseItem, tasks, teamMembers, mediaFiles, setMediaFiles, onUpdateTaskStatus, onAddTask, onUpdateCase, contacts, opportunities }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editData, setEditData] = useState<Case>(caseItem);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);
    const [isGenerateMotionOpen, setGenerateMotionOpen] = useState(false);
    const [showAIBot, setShowAIBot] = useState(false);
    const [showAIAgentBot, setShowAIAgentBot] = useState(false);

    const caseTasks = useMemo(() => tasks.filter(t => t.caseId === caseItem.id), [tasks, caseItem.id]);
    const attachedFiles = useMemo(() => (caseItem.mediaFileIds || []).map(id => mediaFiles.find(f => f.id === id)).filter(Boolean) as MediaFile[], [caseItem.mediaFileIds, mediaFiles]);
    const assignedAttorney = useMemo(() => teamMembers.find(t => t.id === caseItem.attorneyId), [teamMembers, caseItem.attorneyId]);
    
    const handleSelectFile = (file: MediaFile) => {
        const updatedFileIds = [...(caseItem.mediaFileIds || []), file.id];
        onUpdateCase({ ...caseItem, mediaFileIds: updatedFileIds });
        setMediaLibraryOpen(false);
    };

    const handleRemoveFile = (fileId: string) => {
        const updatedFileIds = (caseItem.mediaFileIds || []).filter(id => id !== fileId);
        onUpdateCase({ ...caseItem, mediaFileIds: updatedFileIds });
    };

    const handleSaveGeneratedDocument = (documentText: string, documentName: string) => {
        const newFile: MediaFile = {
            id: `mf-gen-${Date.now()}`,
            name: `${documentName} - ${new Date().toISOString().split('T')[0]}.txt`,
            url: `data:text/plain;charset=utf-8,${encodeURIComponent(documentText)}`,
            type: 'document',
            uploadedAt: new Date(),
        };
        setMediaFiles(prev => [newFile, ...prev]);
        handleSelectFile(newFile);
        setGenerateMotionOpen(false);
    };

    // Handle edit form changes
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    // Save edit
    const handleSaveEdit = () => {
        onUpdateCase(editData);
        setIsEditing(false);
    };

    // Delete case
    const handleDelete = () => {
        // You must pass a delete handler from parent, e.g. onDeleteCase(caseItem.id)
        if (typeof (window as any).onDeleteCase === 'function') {
            (window as any).onDeleteCase(caseItem.id);
        }
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    // Tab definitions
    const tabs = [
        { key: 'details', label: 'Details' },
        { key: 'contacts', label: 'Contacts' },
        { key: 'tasks', label: 'Tasks' },
        { key: 'files', label: 'Files' },
        { key: 'notes', label: 'Notes' },
        { key: 'history', label: 'History' },
        { key: 'gallery', label: 'Gallery' },
        { key: 'ai', label: 'AI Analysis' },
        { key: 'aiagents', label: 'AI Agents' },
    ];

    // Tab button component
    const TabButton: React.FC<{tab: ActiveTab | string, label: string}> = ({tab, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab as ActiveTab)}
            className={`px-3 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600 bg-white dark:bg-gray-800' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300">Case Overview</h3>
                        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <table className="min-w-full text-sm">
                            <tbody>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800 w-56">Case Name</td><td className="p-3">{caseItem.name}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Case Number</td><td className="p-3">{caseItem.caseNumber}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Status</td><td className="p-3">{caseItem.status}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Type</td><td className="p-3">{caseItem.caseType}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Open Date</td><td className="p-3">{new Date(caseItem.openDate).toLocaleDateString()}</td></tr>
                                {caseItem.closeDate && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Close Date</td><td className="p-3">{new Date(caseItem.closeDate).toLocaleDateString()}</td></tr>}
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Assigned Attorney</td><td className="p-3">{assignedAttorney?.name || caseItem.attorneyId || 'Unassigned'}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Assigned</td><td className="p-3">{caseItem.assigned}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Contact</td><td className="p-3">{caseItem.contactName}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Opportunity (Opposing)</td><td className="p-3">{caseItem.opportunity}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Consual</td><td className="p-3">{caseItem.consual}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Defendant</td><td className="p-3">{caseItem.defendant}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Judge</td><td className="p-3">{caseItem.judge}</td></tr>
                                <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Description</td><td className="p-3">{caseItem.description}</td></tr>
                                {/* Defendant Contact Info */}
                                {caseItem.defendantContactName && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Defendant Contact</td><td className="p-3">{caseItem.defendantContactName}</td></tr>}
                                {caseItem.defendantPhone && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Defendant Phone</td><td className="p-3">{caseItem.defendantPhone}</td></tr>}
                                {caseItem.defendantEmail && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Defendant Email</td><td className="p-3">{caseItem.defendantEmail}</td></tr>}
                                {caseItem.defendantAddress && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Defendant Address</td><td className="p-3">{caseItem.defendantAddress}</td></tr>}
                                {/* Opposition Contact Info */}
                                {caseItem.oppositionContactName && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Opposition Contact</td><td className="p-3">{caseItem.oppositionContactName}</td></tr>}
                                {caseItem.oppositionPhone && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Opposition Phone</td><td className="p-3">{caseItem.oppositionPhone}</td></tr>}
                                {caseItem.oppositionEmail && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Opposition Email</td><td className="p-3">{caseItem.oppositionEmail}</td></tr>}
                                {caseItem.oppositionAddress && <tr className="border-b"><td className="font-semibold p-3 bg-gray-50 dark:bg-gray-800">Opposition Address</td><td className="p-3">{caseItem.oppositionAddress}</td></tr>}
                            </tbody>
                        </table>
                        </div>
                        {/* Court Calendar */}
                        <div className="mt-8">
                            <h4 className="font-semibold text-lg mb-2 text-primary-700 dark:text-primary-300">Court Calendar</h4>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                                <p className="text-gray-600 dark:text-gray-300">(Court calendar integration coming soon. Hearings, deadlines, and court events will appear here.)</p>
                            </div>
                        </div>
                        {/* List of Tasks */}
                        <div className="mt-8">
                            <h4 className="font-semibold text-lg mb-2 text-primary-700 dark:text-primary-300">Case Tasks</h4>
                            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="p-3 text-left">Title</th>
                                        <th className="p-3 text-left">Assignee</th>
                                        <th className="p-3 text-left">Due Date</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caseTasks.length > 0 ? caseTasks.map(task => (
                                        <tr key={task.id} className="border-b">
                                            <td className="p-3">{task.title}</td>
                                            <td className="p-3">{teamMembers.find(tm => tm.id === task.assigneeId)?.name || 'Unassigned'}</td>
                                            <td className="p-3">{new Date(task.dueDate).toLocaleDateString()}</td>
                                            <td className="p-3">{task.status}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-3 text-center text-gray-500">No tasks for this case.</td></tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                        {/* Charges (if any) */}
                        <div className="mt-8">
                            <h4 className="font-semibold text-lg mb-2 text-primary-700 dark:text-primary-300">Charges</h4>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                                <p className="text-gray-600 dark:text-gray-300">(Charges feature coming soon...)</p>
                            </div>
                        </div>
                        {/* Paperwork (files) */}
                        <div className="mt-8">
                            <h4 className="font-semibold text-lg mb-2 text-primary-700 dark:text-primary-300">Paperwork</h4>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                                <ul className="list-disc ml-6">
                                    {attachedFiles.length > 0 ? attachedFiles.map(file => (
                                        <li key={file.id}>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{file.name}</a>
                                        </li>
                                    )) : (
                                        <li className="text-gray-500">No files attached to this case.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300">AI Analysis</h3>
                        <div className="rounded-lg border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30 p-6">
                            <p className="text-gray-700 dark:text-gray-200 mb-2">When new case documents are uploaded, the AI will review the case and generate an opinion or summary here.</p>
                            <div className="mt-4">
                                <p className="italic text-gray-500">(AI-generated analysis will appear here after document upload.)</p>
                            </div>
                            <div className="mt-8 flex flex-col items-center">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow transition"
                                    onClick={() => setShowAIBot(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8zm-9 4h.01" /></svg>
                                    Open Conversational AI Bot
                                </button>
                                <span className="text-xs text-gray-500 mt-2">Brainstorm or discuss the case with AI</span>
                            </div>
                        </div>
                        {showAIBot && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAIBot(false)}>
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setShowAIBot(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                                    <h2 className="text-xl font-bold mb-4 text-primary-700 dark:text-primary-300">Conversational AI Bot</h2>
                                    {/* Replace below with your actual AI chat component */}
                                    <div className="h-80 flex items-center justify-center text-gray-500 italic">(AI chat interface coming soon...)</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'aiagents':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300">AI Agents</h3>
                        <div className="rounded-lg border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30 p-6">
                            <p className="text-gray-700 dark:text-gray-200 mb-2">Use AI Agents to research, proofread, or help fill in applications and documents for this case.</p>
                            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                                <li>Research case law, statutes, or facts</li>
                                <li>Proofread and suggest improvements to documents</li>
                                <li>Auto-fill forms and applications using case data</li>
                                <li>Summarize or extract key information from uploaded files</li>
                            </ul>
                            <div className="mt-6 flex flex-col items-center">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow transition"
                                    onClick={() => setShowAIAgentBot(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Launch AI Agent
                                </button>
                                <span className="text-xs text-gray-500 mt-2">Let an AI agent work on your case</span>
                            </div>
                        </div>
                        {showAIAgentBot && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAIAgentBot(false)}>
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setShowAIAgentBot(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                                    <h2 className="text-xl font-bold mb-4 text-primary-700 dark:text-primary-300">AI Agent Workspace</h2>
                                    {/* Replace below with your actual AI agent UI */}
                                    <div className="h-80 flex items-center justify-center text-gray-500 italic">(AI agent interface coming soon...)</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'contacts':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-2">Contacts</h3>
                        {/* Show main, defendant, and opposition contact info here */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Main Contact</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{caseItem.contactName}</p>
                            </div>
                            {caseItem.defendantContactName && (
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Defendant Contact</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{caseItem.defendantContactName}</p>
                                {caseItem.defendantPhone && <p className="text-xs text-gray-500">Phone: {caseItem.defendantPhone}</p>}
                                {caseItem.defendantEmail && <p className="text-xs text-gray-500">Email: {caseItem.defendantEmail}</p>}
                                {caseItem.defendantAddress && <p className="text-xs text-gray-500">Address: {caseItem.defendantAddress}</p>}
                              </div>
                            )}
                            {caseItem.oppositionContactName && (
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Opposition Contact</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{caseItem.oppositionContactName}</p>
                                {caseItem.oppositionPhone && <p className="text-xs text-gray-500">Phone: {caseItem.oppositionPhone}</p>}
                                {caseItem.oppositionEmail && <p className="text-xs text-gray-500">Email: {caseItem.oppositionEmail}</p>}
                                {caseItem.oppositionAddress && <p className="text-xs text-gray-500">Address: {caseItem.oppositionAddress}</p>}
                              </div>
                            )}
                        </div>
                    </div>
                );
            case 'notes':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <AddNoteSection caseItem={caseItem} />
                        <div className="space-y-2">
                          {(caseItem.notes && caseItem.notes.length > 0) ? (
                            caseItem.notes.map(note => (
                              <div key={note.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-primary-700 dark:text-primary-300">{note.authorName}</span>
                                  <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{note.text}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No notes yet.</p>
                          )}
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-2">History</h3>
                        <div className="space-y-2">
                          {(caseItem.history && caseItem.history.length > 0) ? (
                            caseItem.history.map(entry => (
                              <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-primary-700 dark:text-primary-300">{entry.userName}</span>
                                  <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-800 dark:text-gray-100">{entry.message}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No history yet.</p>
                          )}
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div>
                        <div className="flex justify-end items-center mb-2">
                             {!isAddingTask && (
                                <button onClick={() => setIsAddingTask(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    Add Task
                                </button>
                             )}
                        </div>
                        {isAddingTask && <AddTaskForm caseId={caseItem.id} teamMembers={teamMembers} onAddTask={onAddTask} onCancel={() => setIsAddingTask(false)} />}
                        
                         <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg mt-2">
                          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                <th scope="col" className="px-4 py-2">Task</th>
                                <th scope="col" className="px-4 py-2">Assignee</th>
                                <th scope="col" className="px-4 py-2">Due Date</th>
                                <th scope="col" className="px-4 py-2 w-40">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {caseTasks.map(task => (
                                <tr key={task.id} className="bg-white dark:bg-gray-800">
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{task.title}</td>
                                    <td className="px-4 py-2">{teamMembers.find(tm => tm.id === task.assigneeId)?.name || 'Unassigned'}</td>
                                    <td className="px-4 py-2">{new Date(task.dueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                            className={`w-full text-left px-2 py-1 border rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusStyles(task.status)}`}
                                            >
                                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                              ))}
                               {caseTasks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No tasks for this case yet.</td>
                                </tr>
                               )}
                            </tbody>
                          </table>
                        </div>
                    </div>
                );
            case 'files':
                 return (
                    <div>
                        <div className="flex justify-end gap-4 mb-4">
                             <button onClick={() => setGenerateMotionOpen(true)} className="text-sm font-semibold bg-primary-600 text-white flex items-center gap-2 px-3 py-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>
                                Generate Document
                            </button>
                            <button onClick={() => setMediaLibraryOpen(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                Link File from Library
                            </button>
                        </div>
                        <div className="space-y-3">
                            {attachedFiles.length > 0 ? attachedFiles.map(file => (
                                <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <FileTypeIcon type={file.type} />
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded {file.uploadedAt.toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleRemoveFile(file.id)} className="text-gray-400 hover:text-red-500">
                                        &times;
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">No files attached to this case.</p>
                            )}
                        </div>
                    </div>
                );
            case 'gallery':
                return <GalleryTab caseItem={caseItem} mediaFiles={mediaFiles} />;
        }
    }

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Case' : caseItem.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client: {caseItem.contactName} / Case #: {caseItem.caseNumber}</p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && <button onClick={() => setIsEditing(true)} className="text-primary-600 hover:text-primary-800 font-semibold px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800">Edit</button>}
                        <button onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">Delete</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                    </div>
                </header>
                {/* Tabs */}
                <nav className="flex gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 pt-2">
                    {tabs.map(tab => (
                        <TabButton key={tab.key} tab={tab.key} label={tab.label} />
                    ))}
                </nav>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    {isEditing ? (
                        <CaseEditForm
                            editData={editData}
                            teamMembers={teamMembers}
                            contacts={contacts}
                            opportunities={opportunities}
                            onChange={handleEditChange}
                            onCancel={() => setIsEditing(false)}
                            onSave={handleSaveEdit}
                        />
                    ) : (
                        renderContent()
                    )}
                </main>
            </div>
        </div>
        <MediaLibraryModal 
            isOpen={isMediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
            mediaFiles={mediaFiles}
            onSelectFile={handleSelectFile}
        />
        <GenerateMotionModal
            isOpen={isGenerateMotionOpen}
            onClose={() => setGenerateMotionOpen(false)}
            onSave={handleSaveGeneratedDocument}
            caseItem={caseItem}
        />
        </>
    );
};

export default CaseDetailsModal;

// Add at the bottom of the file:
const AddNoteSection: React.FC<{ caseItem: Case }> = ({ caseItem }) => {
  const [noteText, setNoteText] = useState('');
  const addCaseNote = useGlobalStore(s => s.addCaseNote);
  const addCaseHistory = useGlobalStore(s => s.addCaseHistory);
  const currentUser = useGlobalStore(s => s.currentUser);

  const handleAddNote = () => {
    if (!noteText.trim() || !currentUser) return;
    const note = {
      id: `note-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    addCaseNote(caseItem.id, note);
    addCaseHistory(caseItem.id, {
      id: `hist-${Date.now()}`,
      type: 'note',
      message: `Note added: "${note.text.slice(0, 40)}${note.text.length > 40 ? '...' : ''}"`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
    setNoteText('');
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <textarea
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
        rows={3}
        placeholder="Add a note..."
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          className="bg-primary-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          onClick={handleAddNote}
          disabled={!noteText.trim() || !currentUser}
        >
          Add Note
        </button>
      </div>
    </div>
  );
};

import { useState } from 'react';

const GalleryTab: React.FC<{ caseItem: Case; mediaFiles: MediaFile[] }> = ({ caseItem, mediaFiles }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const updateMediaFile = useGlobalStore(s => s.updateMediaFile);
  // Categorize images/videos
  const images = (caseItem.mediaFileIds || [])
    .map(id => mediaFiles.find(f => f.id === id))
    .filter(f => f && (f.type === 'image' || f.type === 'video')) as MediaFile[];

  const categories = [
    { key: 'mugshot', label: 'Mug Shots' },
    { key: 'crime_scene', label: 'Crime Scene' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'social_media', label: 'Social Media' },
    { key: 'other', label: 'Other' },
  ];

  // Group by category
  const categorized: Record<string, MediaFile[]> = {};
  categories.forEach(cat => {
    categorized[cat.key] = images.filter(img => (img.category || 'other') === cat.key);
  });

  if (images.length === 0) return (
    <div className="text-gray-500 dark:text-gray-400 text-center py-12">
      <div className="text-lg font-semibold mb-2">No images or videos for this case.</div>
      <div className="mb-2">To get started:</div>
      <ol className="list-decimal list-inside text-left max-w-md mx-auto mb-4">
        <li>
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition"
            onClick={() => {
              // Try to open the media library modal if available in parent
              if (typeof window.openMediaLibraryModal === 'function') {
                window.openMediaLibraryModal();
              } else {
                const evt = new CustomEvent('openMediaLibraryModal');
                window.dispatchEvent(evt);
              }
            }}
          >
            + Add image/video
          </button>
          <span className="ml-2">or</span>
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition ml-2"
            onClick={() => {
              if (typeof window.openMediaLibraryModal === 'function') {
                window.openMediaLibraryModal();
              } else {
                const evt = new CustomEvent('openMediaLibraryModal');
                window.dispatchEvent(evt);
              }
            }}
          >
            Link File from Library
          </button>
        </li>
        <li className="mt-2">Supported types: <b>image</b> and <b>video</b> files.</li>
        <li>Once added, you can categorize, add notes, and use AI features for each file.</li>
      </ol>
      <div className="italic text-sm text-gray-400">Tip: Only images and videos will appear in the gallery tab.</div>
    </div>
  );

  // Summary section
  const summary = caseItem.mediaSummary ||
    `This case contains ${images.length} images/videos. Click a link below to view each:\n` +
    images.map((img) => `- [${img.name}](#img-${img.id})`).join('\n');

  const handlePrev = () => setSlideIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const handleNext = () => setSlideIndex(i => (i === images.length - 1 ? 0 : i + 1));

  // Notes editing logic
  const startEditNotes = (file: MediaFile) => {
    setEditingNotesId(file.id);
    setNotesDraft(file.notes || '');
  };
  const saveNotes = (file: MediaFile) => {
    // If file has syncStatus, preserve it; otherwise default to 'synced'
    updateMediaFile({ ...file, notes: notesDraft, syncStatus: (file as any).syncStatus || 'synced' });
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Gallery</h3>
      {/* Summary section */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="font-semibold mb-1">AI-Generated Summary</div>
        <div className="text-sm whitespace-pre-line text-blue-900 dark:text-blue-200">{summary}</div>
      </div>
      {/* Categorized sections */}
      {categories.map(cat => (
        <div key={cat.key} className="mb-6">
          <h4 className="text-md font-bold mb-2">{cat.label}</h4>
          {categorized[cat.key].length === 0 ? (
            <div className="text-gray-400 italic text-sm mb-2">No {cat.label.toLowerCase()} available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categorized[cat.key].map((file) => (
                <div key={file.id} id={`img-${file.id}`} className="border-2 rounded-lg overflow-hidden relative group">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="object-cover w-full h-32" />
                  ) : (
                    <video src={file.url} className="object-cover w-full h-32" />
                  )}
                  <div className="p-1 text-xs text-center text-gray-700 dark:text-gray-200">{file.name}</div>
                  {/* AI description */}
                  {file.aiDescription && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.aiDescription}
                    </div>
                  )}
                  {/* Editable notes/evidence */}
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    {editingNotesId === file.id ? (
                      <div className="flex flex-col gap-1">
                        <textarea
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs"
                          rows={2}
                          value={notesDraft}
                          onChange={e => setNotesDraft(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <button className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={() => setEditingNotesId(null)}>Cancel</button>
                          <button className="text-xs px-2 py-1 rounded bg-primary-600 text-white" onClick={() => saveNotes(file)}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-300 italic">{file.notes || 'No notes/evidence.'}</span>
                        <button className="text-xs text-primary-600 ml-2" onClick={() => startEditNotes(file)}>Edit</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {/* Slideshow (all images/videos) */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-full max-w-lg h-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {images[slideIndex].type === 'image' ? (
            <img src={images[slideIndex].url} alt={images[slideIndex].name} className="object-contain w-full h-full" />
          ) : (
            <video src={images[slideIndex].url} controls className="object-contain w-full h-full" />
          )}
          <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70">&#8592;</button>
          <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70">&#8594;</button>
        </div>
        <div className="mt-2 text-center text-gray-700 dark:text-gray-200 font-semibold">{images[slideIndex].name}</div>
        {/* AI description for current slide */}
        {images[slideIndex].aiDescription && (
          <div className="mt-1 text-xs text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 rounded p-2 max-w-lg">{images[slideIndex].aiDescription}</div>
        )}
        {/* Editable notes/evidence for current slide */}
        <div className="mt-1 w-full max-w-lg">
          {editingNotesId === images[slideIndex].id ? (
            <div className="flex flex-col gap-1">
              <textarea
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs"
                rows={2}
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={() => setEditingNotesId(null)}>Cancel</button>
                <button className="text-xs px-2 py-1 rounded bg-primary-600 text-white" onClick={() => saveNotes(images[slideIndex])}>Save</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-300 italic">{images[slideIndex].notes || 'No notes/evidence.'}</span>
              <button className="text-xs text-primary-600 ml-2" onClick={() => startEditNotes(images[slideIndex])}>Edit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};