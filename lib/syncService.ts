import { useGlobalStore, LeadWithSync, ProjectWithSync, TaskWithSync, TeamMemberWithSync, ProjectTaskWithSync, SupportTicketWithSync, MediaFileWithSync, EmailTemplateWithSync, TimeEntryWithSync } from '../hooks/useGlobalStore';
import { supabase } from './supabaseClient';
import { ContactWithSync } from '../types';

/**
 * SyncService: Handles background sync of pending/error records to Supabase on reconnect or manual trigger.
 * Persistent state: business data with syncStatus (leads, projects, tasks, teamMembers, etc.)
 * Ephemeral state: sync progress, errors (kept in component state/UI only)
 */
// Utility to check if Supabase and a table are available (simple cache to avoid spamming)
let supabaseLeadsTableAvailable: boolean | null = null;
async function checkLeadsTableAvailable() {
  if (supabaseLeadsTableAvailable !== null) return supabaseLeadsTableAvailable;
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error && error.message && error.message.match(/not exist|does not exist|404/)) {
      supabaseLeadsTableAvailable = false;
      console.warn('Supabase: leads table is missing. Leads will be managed in state only.');
      return false;
    }
    supabaseLeadsTableAvailable = !error;
    return !error;
  } catch (err) {
    supabaseLeadsTableAvailable = false;
    console.warn('Supabase unavailable, leads will be managed in state only.', err);
    return false;
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[];
  let lastThis: any;
  let pendingPromise: Promise<any> | null = null;
  const debounced = function(this: any, ...args: any[]) {
    lastArgs = args;
    lastThis = this;
    if (timeout) clearTimeout(timeout);
    if (!pendingPromise) {
      pendingPromise = new Promise((resolve) => {
        timeout = setTimeout(async () => {
          timeout = null;
          const result = fn.apply(lastThis, lastArgs);
          pendingPromise = null;
          resolve(result);
        }, wait);
      });
    }
    return pendingPromise;
  };
  return debounced as T;
}

const _syncAllPending = async () => {
  // Leads
  const leads = useGlobalStore.getState().leads;
  const tableAvailable = await checkLeadsTableAvailable();
  for (const lead of leads) {
    if ((lead.syncStatus === 'pending' || lead.syncStatus === 'error') && !lead._pendingDelete) {
      // Always update state first, then try Supabase sync if available
      if (!tableAvailable) {
        // If table is missing, skip Supabase sync, leave as pending/error
        continue;
      }
      try {
        if (lead.id.startsWith('temp-')) {
          // New lead, insert
          const { data, error } = await supabase.from('leads').insert([{ ...lead, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeLead(lead.id);
            useGlobalStore.getState().addLead({ ...data[0], syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' as const });
          }
        } else {
          // Existing lead, update
          const { error } = await supabase.from('leads').update({ ...lead, syncStatus: undefined }).eq('id', lead.id);
          if (!error) {
            useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' as const });
          }
        }
      } catch (err: any) {
        // If error is table missing or network, do not crash
        if (err?.message?.match(/not exist|does not exist|404/)) {
          supabaseLeadsTableAvailable = false;
          console.warn('Supabase: leads table is missing. Leads will be managed in state only.');
        }
        useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' as const });
      }
    } else if (lead._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('leads').delete().eq('id', lead.id);
        if (!error) {
          useGlobalStore.getState().setLeads(
            useGlobalStore.getState().leads.filter((l) => l.id !== lead.id)
          );
        } else {
          useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' as const });
        }
      } catch (err) {
        useGlobalStore.getState().updateLead({ ...lead, syncStatus: 'error' as const });
      }
    }
  }
  // Projects
  const projects = useGlobalStore.getState().projects;
  for (const project of projects) {
    if ((project.syncStatus === 'pending' || project.syncStatus === 'error') && !project._pendingDelete) {
      try {
        if (project.id.startsWith('temp-') || project.id.startsWith('proj-')) {
          // New project, insert
          const { data, error } = await supabase.from('projects').insert([{ ...project, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeProject(project.id);
            useGlobalStore.getState().addProject({ ...data[0], syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' as const });
          }
        } else {
          // Existing project, update
          const { error } = await supabase.from('projects').update({ ...project, syncStatus: undefined }).eq('id', project.id);
          if (!error) {
            useGlobalStore.getState().updateProject({ ...project, syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' as const });
          }
        }
      } catch {
        useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' as const });
      }
    } else if (project._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('projects').delete().eq('id', project.id);
        if (!error) {
          useGlobalStore.getState().setProjects(
            useGlobalStore.getState().projects.filter((p) => p.id !== project.id)
          );
        } else {
          useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' as const });
        }
      } catch {
        useGlobalStore.getState().updateProject({ ...project, syncStatus: 'error' as const });
      }
    }
  }
  // Tasks
  const tasks = useGlobalStore.getState().tasks;
  for (const task of tasks) {
    if ((task.syncStatus === 'pending' || task.syncStatus === 'error') && !task._pendingDelete) {
      try {
        if (task.id.startsWith('task-') || task.id.startsWith('temp-')) {
          // New task, insert
          const { data, error } = await supabase.from('tasks').insert([{ ...task, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeTask(task.id);
            useGlobalStore.getState().addTask({ ...data[0], syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' as const });
          }
        } else {
          // Existing task, update
          const { error } = await supabase.from('tasks').update({ ...task, syncStatus: undefined }).eq('id', task.id);
          if (!error) {
            useGlobalStore.getState().updateTask({ ...task, syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' as const });
          }
        }
      } catch {
        useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' as const });
      }
    } else if (task._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', task.id);
        if (!error) {
          useGlobalStore.getState().setTasks(
            useGlobalStore.getState().tasks.filter((t) => t.id !== task.id)
          );
        } else {
          useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' as const });
        }
      } catch {
        useGlobalStore.getState().updateTask({ ...task, syncStatus: 'error' as const });
      }
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
  for (const file of mediaFiles) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((file.syncStatus === 'pending' || file.syncStatus === 'error') && !file._pendingDelete) {
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
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (file._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('media_files').delete().eq('id', file.id);
        if (!error) {
          useGlobalStore.getState().setMediaFiles(
            useGlobalStore.getState().mediaFiles.filter((f) => f.id !== file.id)
          );
        } else {
          useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'error' });
        }
      } catch {
        useGlobalStore.getState().updateMediaFile({ ...file, syncStatus: 'error' });
      }
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
  for (const contact of contacts) {
    if ((contact.syncStatus === 'pending' || contact.syncStatus === 'error') && !contact._pendingDelete) {
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
    } else if (contact._pendingDelete) {
      // Handle deletion (now using direct Supabase delete)
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
        if (!error) {
          // Remove from state
          useGlobalStore.getState().setContacts(
            useGlobalStore.getState().contacts.filter((c) => c.id !== contact.id)
          );
        } else {
          console.error('Supabase delete_contact error:', error);
          useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'error' } as ContactWithSync);
        }
      } catch (err) {
        console.error('Sync contact delete exception:', err);
        useGlobalStore.getState().updateContact({ ...contact, syncStatus: 'error' } as ContactWithSync);
      }
    }
  }
  // Opportunities
  const opportunities = useGlobalStore.getState().opportunities;
  for (const opp of opportunities) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((opp.syncStatus === 'pending' || opp.syncStatus === 'error') && !opp._pendingDelete) {
      try {
        if (opp.id.startsWith('opp-') || opp.id.startsWith('temp-')) {
          // New opportunity, insert
          const { data, error } = await supabase.from('opportunities').insert([{ ...opp, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeOpportunity(opp.id);
            useGlobalStore.getState().addOpportunity({ ...data[0], syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' as const });
          }
        } else {
          // Existing opportunity, update
          const { error } = await supabase.from('opportunities').update({ ...opp, syncStatus: undefined }).eq('id', opp.id);
          if (!error) {
            useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' as const });
          }
        }
      } catch (err) {
        useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' as const });
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (opp._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('opportunities').delete().eq('id', opp.id);
        if (!error) {
          useGlobalStore.getState().setOpportunities(
            useGlobalStore.getState().opportunities.filter((o) => o.id !== opp.id)
          );
        } else {
          useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' as const });
        }
      } catch (err) {
        useGlobalStore.getState().updateOpportunity({ ...opp, syncStatus: 'error' as const });
      }
    }
  }
  // Cases
  const cases = useGlobalStore.getState().cases;
  for (const caseItem of cases) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((caseItem.syncStatus === 'pending' || caseItem.syncStatus === 'error') && !caseItem._pendingDelete) {
      try {
        if (caseItem.id.startsWith('case-') || caseItem.id.startsWith('temp-')) {
          // New case, insert
          const { data, error } = await supabase.from('cases').insert([{ ...caseItem, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeCase(caseItem.id);
            useGlobalStore.getState().addCase({ ...data[0], syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'error' as const });
          }
        } else {
          // Existing case, update
          const { error } = await supabase.from('cases').update({ ...caseItem, syncStatus: undefined }).eq('id', caseItem.id);
          if (!error) {
            useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'synced' as const });
          } else {
            useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'error' as const });
          }
        }
      } catch (err) {
        useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'error' as const });
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (caseItem._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('cases').delete().eq('id', caseItem.id);
        if (!error) {
          useGlobalStore.getState().setCases(
            useGlobalStore.getState().cases.filter((c) => c.id !== caseItem.id)
          );
        } else {
          useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'error' as const });
        }
      } catch (err) {
        useGlobalStore.getState().updateCase({ ...caseItem, syncStatus: 'error' as const });
      }
    }
  }
  // Invoices
  const invoices = useGlobalStore.getState().invoices;
  for (const invoice of invoices) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((invoice.syncStatus === 'pending' || invoice.syncStatus === 'error') && !invoice._pendingDelete) {
      try {
        if (invoice.id.startsWith('inv-') || invoice.id.startsWith('temp-')) {
          // New invoice, insert
          const { data, error } = await supabase.from('invoices').insert([{ ...invoice, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeInvoice(invoice.id);
            useGlobalStore.getState().addInvoice({ ...data[0], syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'error' });
          }
        } else {
          // Existing invoice, update
          const { error } = await supabase.from('invoices').update({ ...invoice, syncStatus: undefined }).eq('id', invoice.id);
          if (!error) {
            useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'error' });
          }
        }
      } catch {
        useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'error' });
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (invoice._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('invoices').delete().eq('id', invoice.id);
        if (!error) {
          useGlobalStore.getState().setInvoices(
            useGlobalStore.getState().invoices.filter((i) => i.id !== invoice.id)
          );
        } else {
          useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'error' });
        }
      } catch {
        useGlobalStore.getState().updateInvoice({ ...invoice, syncStatus: 'error' });
      }
    }
  }
  // Estimates
  const estimates = useGlobalStore.getState().estimates;
  for (const estimate of estimates) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((estimate.syncStatus === 'pending' || estimate.syncStatus === 'error') && !estimate._pendingDelete) {
      try {
        if (estimate.id.startsWith('est-') || estimate.id.startsWith('temp-')) {
          // New estimate, insert
          const { data, error } = await supabase.from('estimates').insert([{ ...estimate, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeEstimate(estimate.id);
            useGlobalStore.getState().addEstimate({ ...data[0], syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'error' });
          }
        } else {
          // Existing estimate, update
          const { error } = await supabase.from('estimates').update({ ...estimate, syncStatus: undefined }).eq('id', estimate.id);
          if (!error) {
            useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'error' });
          }
        }
      } catch {
        useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'error' });
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (estimate._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('estimates').delete().eq('id', estimate.id);
        if (!error) {
          useGlobalStore.getState().setEstimates(
            useGlobalStore.getState().estimates.filter((e) => e.id !== estimate.id)
          );
        } else {
          useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'error' });
        }
      } catch {
        useGlobalStore.getState().updateEstimate({ ...estimate, syncStatus: 'error' });
      }
    }
  }
  // Products
  const products = useGlobalStore.getState().products;
  for (const product of products) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((product.syncStatus === 'pending' || product.syncStatus === 'error') && !product._pendingDelete) {
      try {
        if (product.id.startsWith('prod-') || product.id.startsWith('temp-')) {
          // New product, insert
          const { data, error } = await supabase.from('products').insert([{ ...product, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().removeProduct(product.id);
            useGlobalStore.getState().addProduct({ ...data[0], syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'error' });
          }
        } else {
          // Existing product, update
          const { error } = await supabase.from('products').update({ ...product, syncStatus: undefined }).eq('id', product.id);
          if (!error) {
            useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'synced' });
          } else {
            useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'error' });
          }
        }
      } catch {
        useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'error' });
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (product._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (!error) {
          useGlobalStore.getState().setProducts(
            useGlobalStore.getState().products.filter((p) => p.id !== product.id)
          );
        } else {
          useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'error' });
        }
      } catch {
        useGlobalStore.getState().updateProduct({ ...product, syncStatus: 'error' });
      }
    }
  }
  // AIInsights
  const aiInsights = useGlobalStore.getState().aiInsights;
  for (const insight of aiInsights) {
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    if ((insight.syncStatus === 'pending' || insight.syncStatus === 'error') && !insight._pendingDelete) {
      try {
        if (insight.id.startsWith('aii-') || insight.id.startsWith('temp-')) {
          // New AIInsight, insert
          const { data, error } = await supabase.from('ai_insights').insert([{ ...insight, syncStatus: undefined }]).select();
          if (!error && data && data[0]) {
            useGlobalStore.getState().setAiInsights(
              useGlobalStore.getState().aiInsights.filter((i) => i.id !== insight.id)
            );
            useGlobalStore.getState().setAiInsights([
              ...useGlobalStore.getState().aiInsights,
              { ...data[0], syncStatus: 'synced' }
            ]);
          } else {
            useGlobalStore.getState().setAiInsights(
              useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'error' } : i)
            );
          }
        } else {
          // Existing AIInsight, update
          const { error } = await supabase.from('ai_insights').update({ ...insight, syncStatus: undefined }).eq('id', insight.id);
          if (!error) {
            useGlobalStore.getState().setAiInsights(
              useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'synced' } : i)
            );
          } else {
            useGlobalStore.getState().setAiInsights(
              useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'error' } : i)
            );
          }
        }
      } catch {
        useGlobalStore.getState().setAiInsights(
          useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'error' } : i)
        );
      }
    // @ts-expect-error: _pendingDelete may be present for deletion tracking
    } else if (insight._pendingDelete) {
      // Handle deletion
      try {
        const { error } = await supabase.from('ai_insights').delete().eq('id', insight.id);
        if (!error) {
          useGlobalStore.getState().setAiInsights(
            useGlobalStore.getState().aiInsights.filter((i) => i.id !== insight.id)
          );
        } else {
          useGlobalStore.getState().setAiInsights(
            useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'error' } : i)
          );
        }
      } catch {
        useGlobalStore.getState().setAiInsights(
          useGlobalStore.getState().aiInsights.map((i) => i.id === insight.id ? { ...insight, syncStatus: 'error' } : i)
        );
      }
    }
  }
  // Add more slices (projectTasks, supportTickets, mediaFiles, etc.) as needed
};

export const syncAllPending = debounce(_syncAllPending, 1000);

export const setupSyncListeners = () => {
  window.addEventListener('online', () => {
    syncAllPending();
  });
};

// Usage: Call setupSyncListeners() once at app startup.
// Call syncAllPending() to manually trigger sync (e.g., from a UI button).
// Add more slices as needed for full business data coverage

export const fetchContactsFromServer = async () => {
  try {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
    // Upsert contacts: add new, update existing
    useGlobalStore.getState().setContacts(data || []);
  } catch (err) {
    console.error('Error fetching contacts:', err);
  }
};
