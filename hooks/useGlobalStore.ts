import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectTask, Contact, OpportunityWithSync, Task, TeamMember, SaaSSettings, EmailTemplate, TimeEntry, SupportTicket, MediaFile, Lead, Activity, Case, CaseTask, CaseNote, CaseHistoryEntry, Invoice, Estimate, Product, AIInsight, ContactWithSync } from '../types';

// Extended types for offline sync
export type SyncStatus = 'synced' | 'pending' | 'error';
export type ProjectWithSync = Project & { syncStatus: SyncStatus; _pendingDelete?: boolean };
export type ProjectTaskWithSync = ProjectTask & { syncStatus: SyncStatus };
export type TaskWithSync = Task & { syncStatus: SyncStatus; _pendingDelete?: boolean };
export type TeamMemberWithSync = TeamMember & { syncStatus: SyncStatus };
export type SaaSSettingsWithSync = SaaSSettings & { syncStatus: SyncStatus };
export type EmailTemplateWithSync = EmailTemplate & { syncStatus: SyncStatus };
export type TimeEntryWithSync = TimeEntry & { syncStatus: SyncStatus };
export type SupportTicketWithSync = SupportTicket & { syncStatus: SyncStatus };
export type MediaFileWithSync = MediaFile & { syncStatus: SyncStatus };
export type LeadWithSync = Lead & { syncStatus: SyncStatus; _pendingDelete?: boolean };

// Extend MediaFileWithSync for local-only fields
export type LocalMediaFile = MediaFileWithSync & {
  _localFile?: File;
  description?: string;
  file_type?: string;
  size?: number;
};

interface UserSettings {
  darkMode: boolean;
  // Add more persistent user settings here
}

interface GlobalStoreState {
  userId: string | null;
  role: string | null;
  subscriptionStatus: string | null;
  isInitialized: boolean;
  contacts: ContactWithSync[];
  opportunities: OpportunityWithSync[];
  projects: ProjectWithSync[];
  projectTasks: ProjectTaskWithSync[];
  tasks: TaskWithSync[];
  teamMembers: TeamMemberWithSync[];
  userSettings: UserSettings;
  saasSettings: SaaSSettingsWithSync | null;
  emailTemplates: EmailTemplateWithSync[];
  timeEntries: TimeEntryWithSync[];
  supportTickets: SupportTicketWithSync[];
  mediaFiles: MediaFileWithSync[];
  leads: LeadWithSync[];
  activities: Activity[];
  cases: Case[];
  currentUser?: TeamMember;
  caseTasks: CaseTask[];
  invoices: Invoice[];
  estimates: Estimate[];
  products: Product[];
  aiInsights: AIInsight[];
  dashboardLayout: any[];
  activeWidgetIds: string[];

  setInitialized: (initialized: boolean) => void;
  setUser: (userId: string, role: string) => void;
  setSubscriptionStatus: (subscriptionStatus: string) => void;
  setContacts: (contacts: ContactWithSync[]) => void;
  addContact: (contact: ContactWithSync) => void;
  updateContact: (contact: ContactWithSync) => void;
  removeContact: (contactId: string) => void;
  setOpportunities: (opportunities: OpportunityWithSync[]) => void;
  addOpportunity: (opportunity: OpportunityWithSync) => void;
  updateOpportunity: (opportunity: OpportunityWithSync) => void;
  removeOpportunity: (opportunityId: string) => void;
  markOpportunitySyncStatus: (opportunityId: string, status: 'pending' | 'synced' | 'error') => void;
  queueOpportunityUpdate: (opportunity: OpportunityWithSync) => void;
  processOpportunitySyncQueue: () => void;
  setProjects: (projects: ProjectWithSync[]) => void;
  addProject: (project: ProjectWithSync) => void;
  updateProject: (project: ProjectWithSync) => void;
  removeProject: (projectId: string) => void;
  setProjectTasks: (tasks: ProjectTaskWithSync[]) => void;
  addProjectTask: (task: ProjectTaskWithSync) => void;
  updateProjectTask: (task: ProjectTaskWithSync) => void;
  removeProjectTask: (taskId: string) => void;
  setTasks: (tasks: TaskWithSync[] | ((prev: TaskWithSync[]) => TaskWithSync[])) => void;
  addTask: (task: TaskWithSync) => void;
  updateTask: (task: TaskWithSync) => void;
  removeTask: (taskId: string) => void;
  setTeamMembers: (members: TeamMemberWithSync[]) => void;
  addTeamMember: (member: TeamMemberWithSync) => void;
  updateTeamMember: (member: TeamMemberWithSync) => void;
  removeTeamMember: (memberId: string) => void;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  setSaasSettings: (settings: SaaSSettingsWithSync) => void;
  setEmailTemplates: (templates: EmailTemplateWithSync[]) => void;
  updateEmailTemplate: (template: EmailTemplateWithSync) => void;
  setTimeEntries: (entries: TimeEntryWithSync[]) => void;
  addTimeEntry: (entry: TimeEntryWithSync) => void;
  updateTimeEntry: (entry: TimeEntryWithSync) => void;
  removeTimeEntry: (entryId: string) => void;
  setSupportTickets: (tickets: SupportTicketWithSync[]) => void;
  addSupportTicket: (ticket: SupportTicketWithSync) => void;
  updateSupportTicket: (ticket: SupportTicketWithSync) => void;
  removeSupportTicket: (ticketId: string) => void;
  setMediaFiles: (files: MediaFileWithSync[]) => void;
  addMediaFile: (file: MediaFileWithSync) => void;
  updateMediaFile: (file: MediaFileWithSync) => void;
  removeMediaFile: (fileId: string) => void;
  setLeads: (leads: LeadWithSync[]) => void;
  addLead: (lead: LeadWithSync) => void;
  updateLead: (lead: LeadWithSync) => void;
  removeLead: (leadId: string) => void;
  setActivities: (activities: Activity[]) => void;
  setCases: (cases: Case[]) => void;
  addCase: (caseItem: Case) => void;
  updateCase: (caseItem: Case) => void;
  removeCase: (caseId: string) => void;
  setCaseTasks: (tasks: CaseTask[]) => void;
  addCaseTask: (task: CaseTask) => void;
  updateCaseTask: (task: CaseTask) => void;
  removeCaseTask: (taskId: string) => void;
  addCaseNote: (caseId: string, note: CaseNote) => void;
  addCaseHistory: (caseId: string, entry: CaseHistoryEntry) => void;
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  removeInvoice: (invoiceId: string) => void;
  setEstimates: (estimates: Estimate[] | ((prev: Estimate[]) => Estimate[])) => void;
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (estimate: Estimate) => void;
  removeEstimate: (estimateId: string) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  setAiInsights: (aiInsights: AIInsight[]) => void;
  setDashboardLayout: (layout: any[]) => void;
  setActiveWidgetIds: (ids: string[]) => void;
}

const storeCreator: StateCreator<GlobalStoreState> = (set, get) => {
  return {
    userId: null,
    role: null,
    subscriptionStatus: null,
    isInitialized: false,
    contacts: [],
    opportunities: [],
    projects: [],
    projectTasks: [],
    tasks: [],
    teamMembers: [],
    userSettings: {
      darkMode: false,
    },
    saasSettings: null,
    emailTemplates: [],
    timeEntries: [],
    supportTickets: [],
    mediaFiles: [],
    leads: [],
    activities: [],
    cases: [],
    currentUser: undefined,
    caseTasks: [],
    invoices: [],
    estimates: [],
    products: [],
    aiInsights: [],
    dashboardLayout: [],
    activeWidgetIds: [],

    setInitialized: (initialized) => {
      set({ isInitialized: initialized });
    },
    setUser: (userId, role) => set({ userId, role }),
    setSubscriptionStatus: (subscriptionStatus) => set({ subscriptionStatus }),
    setContacts: (contacts) => set((state) => {
      // Only update if contacts array is different
      if (state.contacts === contacts) return {};
      if (JSON.stringify(state.contacts) === JSON.stringify(contacts)) return {};
      // Ensure all contacts are ContactWithSync
      const safeContacts = contacts.map(c => ({ ...c, syncStatus: c.syncStatus as ('synced' | 'pending' | 'error' | undefined) }));
      return { contacts: safeContacts };
    }),
    addContact: (contact) => {
      set((state) => {
        if (state.contacts.some((c) => c.id === contact.id)) return {};
        const contactWithSync: ContactWithSync = { ...contact, syncStatus: 'pending' };
        return { contacts: [...state.contacts, contactWithSync] };
      });
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    updateContact: (contact) => {
      set((state) => {
        const idx = state.contacts.findIndex((c) => c.id === contact.id);
        if (idx === -1) return {};
        const updated = state.contacts.map((c) => c.id === contact.id ? { ...c, ...contact, syncStatus: 'pending' as const } : c);
        if (JSON.stringify(state.contacts) === JSON.stringify(updated)) return {};
        return { contacts: updated };
      });
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    removeContact: (contactId) => {
      set((state) => {
        const updated = state.contacts.map((c) => c.id === contactId ? { ...c, syncStatus: 'pending' as const, _pendingDelete: true } : c);
        if (JSON.stringify(state.contacts) === JSON.stringify(updated)) return {};
        return { contacts: updated };
      });
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    setOpportunities: (opportunities) => set({ opportunities }),
    addOpportunity: (opportunity) => set((state) => ({ opportunities: [...state.opportunities, opportunity] })),
    updateOpportunity: (opportunity) => set((state) => ({
      opportunities: state.opportunities.map((o) => o.id === opportunity.id ? { ...o, ...opportunity } : o)
    })),
    removeOpportunity: (opportunityId) => set((state) => ({
      opportunities: state.opportunities.filter((o) => o.id !== opportunityId)
    })),
    markOpportunitySyncStatus: (opportunityId, status) => set((state) => ({
      opportunities: state.opportunities.map((o) => o.id === opportunityId ? { ...o, syncStatus: status } : o)
    })),
    queueOpportunityUpdate: (opportunity) => { /* implementation */ },
    processOpportunitySyncQueue: () => { /* implementation */ },
    setProjects: (projects) => set({ projects }),
    addProject: (project) => {
      const projectWithSync = { ...project, syncStatus: 'pending' as const };
      set((state) => ({ projects: [...state.projects, projectWithSync] }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    updateProject: (project) => {
      set((state) => ({
        projects: state.projects.map((p) => p.id === project.id ? { ...p, ...project, syncStatus: 'pending' as const } : p)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    removeProject: (projectId) => {
      set((state) => ({
        projects: state.projects.map((p) => p.id === projectId ? { ...p, syncStatus: 'pending' as const, _pendingDelete: true } : p)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    setProjectTasks: (tasks) => set({ projectTasks: tasks }),
    addProjectTask: (task) => set((state) => ({ projectTasks: [...state.projectTasks, task] })),
    updateProjectTask: (task) => set((state) => ({
      projectTasks: state.projectTasks.map((t) => t.id === task.id ? { ...t, ...task } : t)
    })),
    removeProjectTask: (taskId) => set((state) => ({
      projectTasks: state.projectTasks.filter((t) => t.id !== taskId)
    })),
    setTasks: (tasksOrUpdater) =>
      set((state) => ({
        tasks:
          typeof tasksOrUpdater === 'function'
            ? tasksOrUpdater(state.tasks)
            : tasksOrUpdater,
      })),
    addTask: (task) => {
      const taskWithSync = { ...task, syncStatus: 'pending' as const };
      set((state) => ({ tasks: [...state.tasks, taskWithSync] }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    updateTask: (task) => {
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === task.id ? { ...t, ...task, syncStatus: 'pending' as const } : t)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    removeTask: (taskId) => {
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, syncStatus: 'pending' as const, _pendingDelete: true } : t)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    setTeamMembers: (members) => set({ teamMembers: members }),
    addTeamMember: (member) => set((state) => ({ teamMembers: [...state.teamMembers, member] })),
    updateTeamMember: (member) => set((state) => ({
      teamMembers: state.teamMembers.map((m) => m.id === member.id ? { ...m, ...member } : m)
    })),
    removeTeamMember: (memberId) => set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== memberId)
    })),
    setUserSettings: (settings) => set((state) => ({
      userSettings: { ...state.userSettings, ...settings }
    })),
    setSaasSettings: (settings) => set({ saasSettings: settings }),
    setEmailTemplates: (templates) => set({ emailTemplates: templates }),
    updateEmailTemplate: (template) => set((state) => ({
      emailTemplates: state.emailTemplates.map((t) => t.id === template.id ? { ...t, ...template } : t)
    })),
    setTimeEntries: (entries) => set({ timeEntries: entries }),
    addTimeEntry: (entry) => set((state) => ({ timeEntries: [...state.timeEntries, entry] })),
    updateTimeEntry: (entry) => set((state) => ({
      timeEntries: state.timeEntries.map((e) => e.id === entry.id ? { ...e, ...entry } : e)
    })),
    removeTimeEntry: (entryId) => set((state) => ({
      timeEntries: state.timeEntries.filter((e) => e.id !== entryId)
    })),
    setSupportTickets: (tickets) => set({ supportTickets: tickets }),
    addSupportTicket: (ticket) => set((state) => ({ supportTickets: [...state.supportTickets, ticket] })),
    updateSupportTicket: (ticket) => set((state) => ({
      supportTickets: state.supportTickets.map((t) => t.id === ticket.id ? { ...t, ...ticket } : t)
    })),
    removeSupportTicket: (ticketId) => set((state) => ({
      supportTickets: state.supportTickets.filter((t) => t.id !== ticketId)
    })),
    setMediaFiles: (files) => set({ mediaFiles: files }),
    addMediaFile: (file) => set((state) => ({ mediaFiles: [...state.mediaFiles, file] })),
    updateMediaFile: (file) => set((state) => ({
      mediaFiles: state.mediaFiles.map((f) => f.id === file.id ? { ...f, ...file } : f)
    })),
    removeMediaFile: (fileId) => set((state) => ({
      mediaFiles: state.mediaFiles.filter((f) => f.id !== fileId)
    })),
    setLeads: (leads) => set({ leads }),
    addLead: (lead) => {
      const leadWithSync = { ...lead, syncStatus: 'pending' as const };
      set((state) => ({ leads: [...state.leads, leadWithSync] }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    updateLead: (lead) => {
      set((state) => ({
        leads: state.leads.map((l) => l.id === lead.id ? { ...l, ...lead, syncStatus: 'pending' as const } : l)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    removeLead: (leadId) => {
      set((state) => ({
        leads: state.leads.map((l) => l.id === leadId ? { ...l, syncStatus: 'pending' as const, _pendingDelete: true } : l)
      }));
      import('../lib/syncService').then(m => m.syncAllPending());
    },
    setActivities: (activities) => set({ activities }),
    setCases: (cases) => set({ cases }),
    addCase: (caseItem) => set((state) => ({ cases: [...state.cases, caseItem] })),
    updateCase: (caseItem) => set((state) => ({
      cases: state.cases.map((c) => c.id === caseItem.id ? { ...c, ...caseItem } : c)
    })),
    removeCase: (caseId) => set((state) => ({
      cases: state.cases.filter((c) => c.id !== caseId)
    })),
    setCaseTasks: (tasks) => set({ caseTasks: tasks }),
    addCaseTask: (task) => set((state) => ({ caseTasks: [...state.caseTasks, task] })),
    updateCaseTask: (task) => set((state) => ({
      caseTasks: state.caseTasks.map((t) => t.id === task.id ? { ...t, ...task } : t)
    })),
    removeCaseTask: (taskId) => set((state) => ({
      caseTasks: state.caseTasks.filter((t) => t.id !== taskId)
    })),
    addCaseNote: (caseId, note) => set((state) => ({
      cases: state.cases.map((c) => c.id === caseId ? { ...c, notes: [note, ...(c.notes || [])] } : c)
    })),
    addCaseHistory: (caseId, entry) => set((state) => ({
      cases: state.cases.map((c) => c.id === caseId ? { ...c, history: [entry, ...(c.history || [])] } : c)
    })),
    setInvoices: (invoices) => set({ invoices }),
    addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
    updateInvoice: (invoice) => set((state) => ({
      invoices: state.invoices.map((i) => i.id === invoice.id ? { ...i, ...invoice } : i)
    })),
    removeInvoice: (invoiceId) => set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== invoiceId)
    })),
  };
};

export const useGlobalStore = create<GlobalStoreState>()(
  persist(storeCreator, { 
    name: 'crm-global-store',
  })
);

// Persistent state: projects, projectTasks, contacts, opportunities, leads, userSettings
// Ephemeral state: UI modals, loading, error, etc. (kept in component state)
// Each project/task/lead includes a syncStatus: 'synced' | 'pending' | 'error' for offline sync
// Usage: import { useGlobalStore } from '../hooks/useGlobalStore';
// Example: const { projects, addProject } = useGlobalStore();
