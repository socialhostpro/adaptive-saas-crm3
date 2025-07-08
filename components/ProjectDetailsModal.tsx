import React, { useState, useMemo } from 'react';
import { Project, ProjectTask, TaskStatus, TeamMember, MediaFile, MediaFileType, ProjectStatus } from '../types';
import MediaLibraryModal from './MediaLibraryModal';
import AIDraftModal from './AIDraftModal';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    tasks: ProjectTask[];
    teamMembers: TeamMember[];
    mediaFiles: MediaFile[];
    onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
    onAddTask: (newTask: Omit<ProjectTask, 'id'>) => void;
    onUpdateProject: (updatedProject: Project) => void;
    onDeleteProject: (projectId: string) => void; // NEW
}

type ActiveTab = 'tasks' | 'files' | 'details';

const SparklesIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>;

const AddTaskForm: React.FC<{ projectId: string, teamMembers: TeamMember[], onAddTask: (task: Omit<ProjectTask, 'id'>) => void, onCancel: () => void }> =
({ projectId, teamMembers, onAddTask, onCancel }) => {
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
            projectId,
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


export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose, project, tasks, teamMembers, mediaFiles, onUpdateTaskStatus, onAddTask, onUpdateProject, onDeleteProject }) => {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Project>(project);
    const [isAIDraftOpen, setAIDraftOpen] = useState(false);

    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    const attachedFiles = useMemo(() => (project.mediaFileIds || []).map(id => mediaFiles.find(f => f.id === id)).filter(Boolean) as MediaFile[], [project.mediaFileIds, mediaFiles]);
    
    const progress = useMemo(() => {
        const completedTasks = projectTasks.filter(t => t.status === TaskStatus.Completed).length;
        return projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
    }, [projectTasks]);

    const handleSelectFile = (file: MediaFile) => {
        const updatedFileIds = [...(project.mediaFileIds || []), file.id];
        onUpdateProject({ ...project, mediaFileIds: updatedFileIds });
        setMediaLibraryOpen(false);
    };
    
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdateProject(editData);
        setIsEditing(false);
    };

    const handleRemoveFile = (fileId: string) => {
        const updatedFileIds = (project.mediaFileIds || []).filter(id => id !== fileId);
        onUpdateProject({ ...project, mediaFileIds: updatedFileIds });
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch(activeTab) {
            case 'details':
                 return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                {isEditing ? (
                                     <select name="status" value={editData.status} onChange={handleEditChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm">
                                        {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                ) : (
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{project.status}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                                 {isEditing ? (
                                     <input type="date" name="deadline" value={editData.deadline} onChange={handleEditChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm" />
                                 ) : (
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(project.deadline).toLocaleDateString()}</p>
                                 )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                                 {isEditing ? (
                                     <input type="number" name="budget" value={editData.budget} onChange={handleEditChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm" />
                                 ) : (
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">${project.budget.toLocaleString()}</p>
                                 )}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Progress</label>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
                                {isEditing && <button type="button" onClick={() => setAIDraftOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"><SparklesIcon className="w-3 h-3"/> AI Draft</button>}
                            </div>
                            {isEditing ? (
                                <textarea name="description" value={editData.description} onChange={handleEditChange} rows={4} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm" />
                            ) : (
                                <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">{project.description}</p>
                            )}
                        </div>
                        {isEditing && (
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg text-sm font-semibold">Cancel</button>
                                <button onClick={handleSave} className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">Save</button>
                            </div>
                        )}
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
                        {isAddingTask && <AddTaskForm projectId={project.id} teamMembers={teamMembers} onAddTask={onAddTask} onCancel={() => setIsAddingTask(false)} />}
                        
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
                              {projectTasks.map(task => (
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
                               {projectTasks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No tasks for this project yet.</td>
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
                        <div className="flex justify-end mb-4">
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
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">No files attached to this project.</p>
                            )}
                        </div>
                    </div>
                )
        }
    }

    const TabButton: React.FC<{tab: ActiveTab, label: string; count: number}> = ({tab, label, count}) => (
         <button onClick={() => setActiveTab(tab)} className={`px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            {label} <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-1">{count}</span>
        </button>
    );

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">For: {project.contactName}</p>
                    </div>
                    {!isEditing && activeTab === 'details' && <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary-600">Edit Details</button>}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <div className="border-b border-gray-200 dark:border-gray-700 px-4">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
                        <TabButton tab="details" label="Details" count={0} />
                        <TabButton tab="tasks" label="Tasks" count={projectTasks.length} />
                        <TabButton tab="files" label="Files" count={attachedFiles.length} />
                    </nav>
                </div>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                   {renderContent()}
                </main>
                {/* Modal footer with Delete button */}
                {!isEditing && (
                  <footer className="flex justify-end gap-2 px-6 pb-6">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                      onClick={() => { onDeleteProject(project.id); onClose(); }}
                    >
                      Delete Project
                    </button>
                  </footer>
                )}
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
            promptContext={`You are an AI assistant helping a user write a project description for the project titled "${editData.name}".`}
        />
        </>
    );
};
