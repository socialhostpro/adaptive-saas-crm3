import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

// Re-export supabase for convenience
export { supabase };

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  score: number;
  status: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
  phone?: string;
}

interface Opportunity {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  value: number;
  stage: string;
  closeDate: string;
  assigneeId: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  contactId: string;
  contactName: string;
  deadline: string;
  budget: number;
  status: string;
  mediaFileIds: string[];
}

interface Task {
  id: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  status: string;
}

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

interface AppState {
  leads: Lead[];
  contacts: Contact[];
  opportunities: Opportunity[];
  projects: Project[];
  tasks: Task[];
  messages: any[];
  activities: any[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  removeLead: (id: string) => void;
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (opportunity: Opportunity) => void;
  removeOpportunity: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  addMediaFile: (file: MediaFile) => void;
  removeMediaFile: (id: string) => void;
}

interface RealtimePayload {
  new: Record<string, any>;
  old: Record<string, any>;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      subscribeToRealtimeUpdates: () => {
        supabase
          .channel('chat')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' }, (payload: RealtimePayload) => {
            set((state) => ({
              messages: [...state.messages, payload.new],
            }));
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat' }, (payload: RealtimePayload) => {
            set((state) => ({
              messages: state.messages.map((m) => (m.id === payload.new.id ? payload.new : m)),
            }));
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat' }, (payload: RealtimePayload) => {
            set((state) => ({
              messages: state.messages.filter((m) => m.id !== payload.old.id),
            }));
          })
          .subscribe();

        supabase
          .channel('activities')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload: RealtimePayload) => {
            set((state) => ({
              activities: [...state.activities, payload.new],
            }));
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'activities' }, (payload: RealtimePayload) => {
            set((state) => ({
              activities: state.activities.map((a) => (a.id === payload.new.id ? payload.new : a)),
            }));
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'activities' }, (payload: RealtimePayload) => {
            set((state) => ({
              activities: state.activities.filter((a) => a.id !== payload.old.id),
            }));
          })
          .subscribe();
      },

      leads: [],
      contacts: [],
      opportunities: [],
      projects: [],
      tasks: [],
      messages: [],
      activities: [],
      mediaFiles: [],
      setLeads: (leads) => set({ leads }),
      addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
      updateLead: (lead) => set((state) => ({
        leads: state.leads.map((l) => (l.id === lead.id ? lead : l)),
      })),
      removeLead: (id) => set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      })),
      setContacts: async (contacts: Contact[]) => {
        set({ contacts });
        await supabase.from('contacts').upsert(contacts);
      },
      addContact: async (contact: Contact) => {
        set((state: AppState) => ({ contacts: [...state.contacts, contact] }));
        await supabase.from('contacts').insert(contact);
      },
      updateContact: async (contact: Contact) => {
        set((state: AppState) => ({
          contacts: state.contacts.map((c: Contact) => (c.id === contact.id ? contact : c)),
        }));
        await supabase.from('contacts').update(contact).eq('id', contact.id);
      },
      removeContact: async (id: string) => {
        set((state: AppState) => ({ contacts: state.contacts.filter((c: Contact) => c.id !== id) }));
        await supabase.from('contacts').delete().eq('id', id);
      },
      setOpportunities: async (opportunities: Opportunity[]) => {
        set({ opportunities });
        await supabase.from('opportunities').upsert(opportunities);
      },
      addOpportunity: async (opportunity: Opportunity) => {
        set((state: AppState) => ({ opportunities: [...state.opportunities, opportunity] }));
        await supabase.from('opportunities').insert(opportunity);
      },
      updateOpportunity: async (opportunity: Opportunity) => {
        set((state: AppState) => ({
          opportunities: state.opportunities.map((o: Opportunity) => (o.id === opportunity.id ? opportunity : o)),
        }));
        await supabase.from('opportunities').update(opportunity).eq('id', opportunity.id);
      },
      removeOpportunity: async (id: string) => {
        set((state: AppState) => ({ opportunities: state.opportunities.filter((o: Opportunity) => o.id !== id) }));
        await supabase.from('opportunities').delete().eq('id', id);
      },
      setProjects: async (projects: Project[]) => {
        set({ projects });
        await supabase.from('projects').upsert(projects);
      },
      addProject: async (project: Project) => {
        set((state: AppState) => ({ projects: [...state.projects, project] }));
        await supabase.from('projects').insert(project);
      },
      updateProject: async (project: Project) => {
        set((state: AppState) => ({
          projects: state.projects.map((p: Project) => (p.id === project.id ? project : p)),
        }));
        await supabase.from('projects').update(project).eq('id', project.id);
      },
      removeProject: async (id: string) => {
        set((state: AppState) => ({ projects: state.projects.filter((p: Project) => p.id !== id) }));
        await supabase.from('projects').delete().eq('id', id);
      },
      setTasks: async (tasks: Task[]) => {
        set({ tasks });
        await supabase.from('tasks').upsert(tasks);
      },
      addTask: async (task: Task) => {
        set((state: AppState) => ({ tasks: [...state.tasks, task] }));
        await supabase.from('tasks').insert(task);
      },
      updateTask: async (task: Task) => {
        set((state: AppState) => ({
          tasks: state.tasks.map((t: Task) => (t.id === task.id ? task : t)),
        }));
        await supabase.from('tasks').update(task).eq('id', task.id);
      },
      removeTask: async (id: string) => {
        set((state: AppState) => ({ tasks: state.tasks.filter((t: Task) => t.id !== id) }));
        await supabase.from('tasks').delete().eq('id', id);
      },
      setMediaFiles: (files: MediaFile[]) => set({ mediaFiles: files }),
      addMediaFile: (file: MediaFile) => set((state: AppState & { mediaFiles: MediaFile[] }) => ({ mediaFiles: [...state.mediaFiles, file] })),
      removeMediaFile: (id: string) => set((state: AppState & { mediaFiles: MediaFile[] }) => ({ mediaFiles: state.mediaFiles.filter((file: MediaFile) => file.id !== id) })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAppStore;
