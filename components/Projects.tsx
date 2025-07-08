import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, ProjectTask, TaskStatus, Contact, TeamMember, MediaFile } from '../types';
import Card from './shared/Card';
import CreateProjectModal from './CreateProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { useGlobalStore, ProjectWithSync, ProjectTaskWithSync, SyncStatus } from '../hooks/useGlobalStore';

interface ProjectsProps {
    contacts: Contact[];
    teamMembers: TeamMember[];
    mediaFiles: MediaFile[];
    currentUser?: TeamMember;
    appContext: any;
}

const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-md inline-block";
  let colorClasses = "";
  switch (status) {
    case ProjectStatus.Completed: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case ProjectStatus.InProgress: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case ProjectStatus.OnHold: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case ProjectStatus.NotStarted: colorClasses = "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case ProjectStatus.Cancelled: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const ProjectCard: React.FC<{ project: Project; tasks: ProjectTask[]; onClick: () => void }> = ({ project, tasks, onClick }) => {
    const progress = useMemo(() => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        if (projectTasks.length === 0) return 0;
        const completedTasks = tasks.filter(t => t.projectId === project.id && t.status === TaskStatus.Completed).length;
        return (completedTasks / projectTasks.length) * 100;
    }, [project, tasks]);

    return (
        <Card className="!p-0 flex flex-col cursor-pointer hover:shadow-lg dark:hover:bg-gray-700/40 transition-all duration-200" onClick={onClick}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white pr-2">{project.name}</h3>
                    <ProjectStatusBadge status={project.status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">For: {project.contactName}</p>
                 <div className="mt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-between text-xs">
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Due: </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                 <div>
                    <span className="text-gray-500 dark:text-gray-400">Budget: </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">${project.budget.toLocaleString()}</span>
                </div>
            </div>
        </Card>
    );
};

const Projects: React.FC<ProjectsProps> = (props) => {
    const { contacts, teamMembers, mediaFiles, currentUser, appContext } = props;

    // Persistent state: projects, projectTasks (from global store)
    const {
        projects,
        setProjects,
        addProject,
        updateProject,
        removeProject,
        projectTasks,
        setProjectTasks,
        addProjectTask,
        updateProjectTask,
        removeProjectTask
    } = useGlobalStore();

    // Ephemeral UI state
    const [loading, setLoading] = useState(false); // No async fetch
    const [error, setError] = useState<string | null>(null);
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskError, setTaskError] = useState<string | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectWithSync | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filtered projects
    const filteredProjects = useMemo(() => {
        return projects
            .filter((project: ProjectWithSync) => statusFilter === 'All' || project.status === statusFilter)
            .filter((project: ProjectWithSync) => 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.contactName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [projects, statusFilter, searchTerm]);

    // CREATE project (local state only)
    const handleCreateProject = (newProjectData: Omit<Project, 'id' | 'contactName'>) => {
        const contact = contacts.find((c: Contact) => c.id === newProjectData.contactId);
        if (!contact) return;
        const newProject: ProjectWithSync = {
            ...newProjectData,
            id: `proj-${Date.now()}`,
            contactName: contact.name,
            mediaFileIds: [],
            syncStatus: 'synced',
        };
        addProject(newProject);
        setCreateModalOpen(false);
    };

    // UPDATE project (local state only)
    const handleUpdateProject = (updatedProject: ProjectWithSync) => {
        updateProject({ ...updatedProject, syncStatus: 'synced' });
        setSelectedProject({ ...updatedProject, syncStatus: 'synced' });
    };

    // DELETE project (local state only)
    const handleDeleteProject = (projectId: string) => {
        removeProject(projectId);
    };

    // CREATE project task (local state only)
    const handleAddTask = (newTaskData: Omit<ProjectTask, 'id'>) => {
        setTaskLoading(true);
        setTaskError(null);
        const newTask: ProjectTaskWithSync = {
            ...newTaskData,
            id: `ptask-${Date.now()}`,
            syncStatus: 'synced',
        };
        addProjectTask(newTask);
        setTaskLoading(false);
    };

    // UPDATE project task status (local state only)
    const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
        setTaskLoading(true);
        setTaskError(null);
        const task = projectTasks.find((t: ProjectTaskWithSync) => t.id === taskId);
        if (!task) return;
        updateProjectTask({ ...task, status, syncStatus: 'synced' });
        setTaskLoading(false);
    };

    // Open details modal with correct type
    const handleOpenDetails = (project: ProjectWithSync) => {
        setSelectedProject(project);
        setDetailsModalOpen(true);
    };

    return (
        <>
        <div>
            {/* Loading and error states */}
            {loading && <div className="text-center py-8">Loading projects...</div>}
            {error && <div className="text-center text-red-500 py-2">{error}</div>}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex-shrink-0">Projects</h1>
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
                        {Object.values(ProjectStatus).map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setCreateModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex-shrink-0">
                        Add Project
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project: ProjectWithSync) => (
                        <ProjectCard 
                            key={project.id} 
                            project={project}
                            tasks={projectTasks}
                            onClick={() => handleOpenDetails(project)}
                        />
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <Card className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 py-8">No projects match your current filters.</p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
        <CreateProjectModal 
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateProject}
            contacts={contacts}
        />
        {selectedProject && (
            <ProjectDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                project={selectedProject}
                tasks={projectTasks}
                teamMembers={teamMembers}
                mediaFiles={mediaFiles}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onUpdateProject={handleUpdateProject}
                onAddTask={handleAddTask}
                onDeleteProject={handleDeleteProject} // NEW
            />
        )}
        {/* Task loading/error states for modals */}
        {taskLoading && <div className="text-center py-2">Updating tasks...</div>}
        {taskError && <div className="text-center text-red-500 py-2">{taskError}</div>}
        </>
    );
};

export default Projects;
