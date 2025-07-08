import { useGlobalStore, LeadWithSync, ProjectWithSync, TaskWithSync, TeamMemberWithSync, ProjectTaskWithSync, SupportTicketWithSync, MediaFileWithSync, EmailTemplateWithSync, TimeEntryWithSync } from '../hooks/useGlobalStore';
import { supabase } from './supabaseClient';
import { ContactWithSync } from '../types';

/**
 * SyncService: Handles background sync of pending/error records to Supabase on reconnect or manual trigger.
 * Persistent state: business data with syncStatus (leads, projects, tasks, teamMembers, etc.)
 * Ephemeral state: sync progress, errors (kept in component state/UI only)
 */
export const syncAllPending = async () => {
  // Leads
  const leads = useGlobalStore.getState().leads;
  for (const lead of leads.filter((l: LeadWithSync) => l.syncStatus === 'pending' || l.syncStatus === 'error')) {
    try {
      if (lead.id.startsWith('temp-')) {
        // New lead, insert
        const { data, error } = await supabase.from('leads').insert([{ ...lead, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeLead(lead.id);
          useGlobalStore.getState().addLead({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' });
        }
      } else {
        // Existing lead, update
        const { error } = await supabase.from('leads').update({ ...lead, syncStatus: undefined }).eq('id', lead.id);
        if (!error) {
          useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' });
    }
  }
  // Projects
  const projects = useGlobalStore.getState().projects;
  for (const project of projects.filter((p: ProjectWithSync) => p.syncStatus === 'pending' || p.syncStatus === 'error')) {
    try {
      if (project.id.startsWith('temp-')) {
        // New project, insert
        const { data, error } = await supabase.from('projects').insert([{ ...project, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeProject(project.id);
          useGlobalStore.getState().addProject({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' });
        }
      } else {
        // Existing project, update
        const { error } = await supabase.from('projects').update({ ...project, syncStatus: undefined }).eq('id', project.id);
        if (!error) {
          useGlobalStore.getState().updateProject({ ...project, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' });
    }
  }
  // Tasks
  const tasks = useGlobalStore.getState().tasks;
  for (const task of tasks.filter((t: TaskWithSync) => t.syncStatus === 'pending' || t.syncStatus === 'error')) {
    try {
      if (task.id.startsWith('temp-')) {
        // New task, insert
        const { data, error } = await supabase.from('tasks').insert([{ ...task, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeTask(task.id);
          useGlobalStore.getState().addTask({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' });
        }
      } else {
        // Existing task, update
        const { error } = await supabase.from('tasks').update({ ...task, syncStatus: undefined }).eq('id', task.id);
        if (!error) {
          useGlobalStore.getState().updateTask({ ...task, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' });
    }
  }
  // Team Members
  const teamMembers = useGlobalStore.getState().teamMembers;
  for (const member of teamMembers.filter((m: TeamMemberWithSync) => m.syncStatus === 'pending' || m.syncStatus === 'error')) {
    try {
      const { error } = await supabase.from('team_members').update({ ...member, syncStatus: undefined }).eq('id', member.id);
      if (!error) {
        useGlobalStore.getState().updateTeamMember({ ...member, syncStatus: 'synced' });
      } else {
        useGlobalStore.getState().updateTeamMember({ ...member, syncStatus: 'error' });
      }
    } catch {
      useGlobalStore.getState().updateTeamMember({ ...member, syncStatus: 'error' });
    }
  }
  // Project Tasks
  const projectTasks = useGlobalStore.getState().projectTasks;
  for (const task of projectTasks.filter((t: ProjectTaskWithSync) => t.syncStatus === 'pending' || t.syncStatus === 'error')) {
    try {
      if (task.id.startsWith('temp-')) {
        const { data, error } = await supabase.from('project_tasks').insert([{ ...task, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeProjectTask(task.id);
          useGlobalStore.getState().addProjectTask({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateProjectTask({ ...task, syncStatus: 'error' });
        }
      } else {
        const { error } = await supabase.from('project_tasks').update({ ...task, syncStatus: undefined }).eq('id', task.id);
        if (!error) {
          useGlobalStore.getState().updateProjectTask({ ...task, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateProjectTask({ ...task, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateProjectTask({ ...task, syncStatus: 'error' });
    }
  }
  // Support Tickets
  const supportTickets = useGlobalStore.getState().supportTickets;
  for (const ticket of supportTickets.filter((t: SupportTicketWithSync) => t.syncStatus === 'pending' || t.syncStatus === 'error')) {
    try {
      if (ticket.id.startsWith('temp-')) {
        const { data, error } = await supabase.from('support_tickets').insert([{ ...ticket, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeSupportTicket(ticket.id);
          useGlobalStore.getState().addSupportTicket({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateSupportTicket({ ...ticket, syncStatus: 'error' });
        }
      } else {
        const { error } = await supabase.from('support_tickets').update({ ...ticket, syncStatus: undefined }).eq('id', ticket.id);
        if (!error) {
          useGlobalStore.getState().updateSupportTicket({ ...ticket, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateSupportTicket({ ...ticket, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateSupportTicket({ ...ticket, syncStatus: 'error' });
    }
  }
  // Media Files
  const mediaFiles = useGlobalStore.getState().mediaFiles;
  for (const file of mediaFiles.filter((f: MediaFileWithSync) => f.syncStatus === 'pending' || f.syncStatus === 'error')) {
    try {
      if (file.id.startsWith('temp-')) {
        const { data, error } = await supabase.from('media_files').insert([{ ...file, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeMediaFile(file.id);
          useGlobalStore.getState().addMediaFile({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'error' });
        }
      } else {
        const { error } = await supabase.from('media_files').update({ ...file, syncStatus: undefined }).eq('id', file.id);
        if (!error) {
          useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'error' });
    }
  }
  // Email Templates
  const emailTemplates = useGlobalStore.getState().emailTemplates;
  for (const template of emailTemplates.filter((t: EmailTemplateWithSync) => t.syncStatus === 'pending' || t.syncStatus === 'error')) {
    try {
      if (template.id.startsWith('temp-')) {
        const { data, error } = await supabase.from('email_templates').insert([{ ...template, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          // Remove temp and add real
          useGlobalStore.getState().setEmailTemplates(emailTemplates.filter(t => t.id !== template.id));
          useGlobalStore.getState().setEmailTemplates([...useGlobalStore.getState().emailTemplates, { ...data[0], syncStatus: 'synced' }]);
        } else {
          useGlobalStore.getState().updateEmailTemplate({ ...template, syncStatus: 'error' });
        }
      } else {
        const { error } = await supabase.from('email_templates').update({ ...template, syncStatus: undefined }).eq('id', template.id);
        if (!error) {
          useGlobalStore.getState().updateEmailTemplate({ ...template, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateEmailTemplate({ ...template, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateEmailTemplate({ ...template, syncStatus: 'error' });
    }
  }
  // Time Entries
  const timeEntries = useGlobalStore.getState().timeEntries;
  for (const entry of timeEntries.filter((e: TimeEntryWithSync) => e.syncStatus === 'pending' || e.syncStatus === 'error')) {
    try {
      if (entry.id.startsWith('temp-')) {
        const { data, error } = await supabase.from('time_entries').insert([{ ...entry, syncStatus: undefined }]).select();
        if (!error && data && data[0]) {
          useGlobalStore.getState().removeTimeEntry(entry.id);
          useGlobalStore.getState().addTimeEntry({ ...data[0], syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateTimeEntry({ ...entry, syncStatus: 'error' });
        }
      } else {
        const { error } = await supabase.from('time_entries').update({ ...entry, syncStatus: undefined }).eq('id', entry.id);
        if (!error) {
          useGlobalStore.getState().updateTimeEntry({ ...entry, syncStatus: 'synced' });
        } else {
          useGlobalStore.getState().updateTimeEntry({ ...entry, syncStatus: 'error' });
        }
      }
    } catch {
      useGlobalStore.getState().updateTimeEntry({ ...entry, syncStatus: 'error' });
    }
  }
  // Contacts
  const contacts = useGlobalStore.getState().contacts as ContactWithSync[];
  for (const contact of contacts.filter((c: ContactWithSync) => c.syncStatus === 'pending' || c.syncStatus === 'error')) {
    try {
      let response, data;
      if (contact.id.startsWith('temp-')) {
        // New contact, use Edge Function
        const session = await supabase.auth.getSession();
        const accessToken = session?.data?.session?.access_token;
        response = await fetch('https://palmudbozgjafptecwyz.supabase.co/functions/v1/contact-operations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            action: 'create',
            contact: {
              name: contact.name,
              email: contact.email,
              title: contact.title,
              company: contact.company,
              avatarUrl: contact.avatarUrl,
              phone: contact.phone,
              address: contact.address,
              created_by: contact.created_by,
              projectId: contact.projectId,
              opportunityId: contact.opportunityId,
              leadId: contact.leadId,
              caseId: contact.caseId,
              info: contact.info ?? ''
            }
          }),
          cache: 'no-store',
          credentials: 'include'
        });
        data = await response.json();
        if (response.ok && data) {
          // Instead of remove/add, update in-place (preserve UI selection)
          useGlobalStore.getState().updateContact({ ...contact, ...data, id: data.id, syncStatus: 'synced' });
        } else {
          console.error('Edge Function create_contact error:', data?.error || response.statusText);
          useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'error' } as ContactWithSync);
        }
      } else {
        // Existing contact, use Edge Function
        const session = await supabase.auth.getSession();
        const accessToken = session?.data?.session?.access_token;
        response = await fetch('https://palmudbozgjafptecwyz.supabase.co/functions/v1/contact-operations/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            action: 'update',
            contact: {
              id: contact.id,
              name: contact.name,
              email: contact.email,
              title: contact.title,
              company: contact.company,
              avatarUrl: contact.avatarUrl,
              phone: contact.phone,
              address: contact.address,
              created_by: contact.created_by,
              projectId: contact.projectId,
              opportunityId: contact.opportunityId,
              leadId: contact.leadId,
              caseId: contact.caseId,
              info: contact.info ?? ''
            }
          }),
          cache: 'no-store',
          credentials: 'include'
        });
        data = await response.json();
        if (response.ok) {
          useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'synced' } as ContactWithSync);
        } else {
          console.error('Edge Function update_contact error:', data?.error || response.statusText);
          useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'error' } as ContactWithSync);
        }
      }
    } catch (err) {
      console.error('Sync contact exception:', err);
      useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'error' } as ContactWithSync);
    }
  }
  // Opportunities (STUBBED: skip Supabase sync for now)
  // const opportunities = useGlobalStore.getState().opportunities;
  // for (const opp of opportunities.filter((o: any) => o.syncStatus === 'pending' || o.syncStatus === 'error')) {
  //   try {
  //     // STUB: skip all Supabase insert/update for opportunities
  //     // Mark as 'synced' or leave as 'pending' for UI only
  //     useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'pending' });
  //   } catch {
  //     useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' });
  //   }
  // }
  // Add more slices (projectTasks, supportTickets, mediaFiles, etc.) as needed
};

export const setupSyncListeners = () => {
  window.addEventListener('online', () => {
    syncAllPending();
  });
};

// Usage: Call setupSyncListeners() once at app startup.
// Call syncAllPending() to manually trigger sync (e.g., from a UI button).
// Add more slices as needed for full business data coverage.

import { supabase } from '../lib/supabaseClient';

export const fetchContactsFromServer = async () => {
  const { data, error } = await supabase.from('contacts').select('*');
  if (error) {
    console.error('Failed to fetch contacts from server:', error.message);
    return [];
  }
  return data || [];
};
