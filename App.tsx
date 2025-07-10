import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Leads from './components/Leads';
import Opportunities from './components/Opportunities';
import Tasks from './components/Tasks';
import Reporting from './components/Reporting';
import Support from './components/Support';
import Billing from './components/InvoiceBilling';
import TimeBilling from './components/TimeBilling';
import Team from './components/Team';
import Chat from './components/Chat';
import TeamChat from './components/TeamChat';
import ChatPopup, { getUnreadMessageCount } from './components/ChatPopup';
import DMPopup from './components/DMPopup';
import Activities from './components/Activities';
import Projects from './components/Projects';
import PublicInvoicePage from './components/PublicInvoicePage';
import PublicEstimatePage from './components/PublicEstimatePage';
import MediaLibrary from './components/MediaLibrary';
import Calendar from './components/Calendar';
import Cases from './components/Cases';
import Company from './components/Company';
// Bot components
import WebsiteChatBot from './components/bots/WebsiteChatBot';
import PhoneBot from './components/bots/PhoneBot';
import FormBot from './components/bots/FormBot';
import FormBuilder from './components/bots/FormBuilder';
import BotAnalytics from './components/bots/BotAnalytics';
import AILandingPageBuilder from './components/AILandingPageBuilder';
import NewsletterManagement from './components/NewsletterManagement';
// Creative components
import ImageGeneration from './components/ImageGeneration';
import ImageGallery from './components/ImageGallery';
import CopyGeneration from './components/CopyGeneration';
import VideoGeneration from './components/VideoGeneration';
import { GoogleGenAI } from '@google/genai';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout, TeamMember, CalendarEvent, ActivityType, Widget } from './types';

import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import { useGlobalStore } from "./hooks/useGlobalStore";
import { supabase } from './lib/supabaseClient';

// Define all possible widgets
const ALL_WIDGETS: Widget[] = [
    { id: 'stat-revenue', name: 'Total Revenue', description: 'Shows total revenue with monthly change.', component: 'StatCardWidget', minW: 2, minH: 1 },
    { id: 'stat-leads', name: 'New Leads', description: 'Shows number of new leads.', component: 'StatCardWidget', minW: 2, minH: 1 },
    { id: 'stat-opportunities', name: 'Opportunities', description: 'Shows number of open opportunities.', component: 'StatCardWidget', minW: 2, minH: 1 },
    { id: 'stat-conversion', name: 'Conversion Rate', description: 'Shows lead to customer conversion rate.', component: 'StatCardWidget', minW: 2, minH: 1 },
    { id: 'sales-performance', name: 'Sales Performance', description: 'Line chart showing sales over time.', component: 'SalesPerformanceWidget', minW: 5, minH: 3 },
    { id: 'sales-pipeline', name: 'Sales Pipeline', description: 'Bar chart showing deals in each stage.', component: 'SalesPipelineWidget', minW: 4, minH: 2 },
    { id: 'recent-activity', name: 'Recent Activity', description: 'A feed of the latest activities.', component: 'RecentActivityWidget', minW: 3, minH: 3 },
    { id: 'my-tasks', name: 'My Tasks', description: 'A list of tasks assigned to you.', component: 'MyTasksWidget', minW: 6, minH: 2 },
    { id: 'recent-leads', name: 'Recent Leads', description: 'A list of the 5 most recent leads.', component: 'RecentLeadsWidget', minW: 4, minH: 2 },
    { id: 'ai-insights', name: 'AI Insights', description: 'Proactive suggestions and alerts from AI.', component: 'AIInsightsWidget', minW: 3, minH: 3 },
];

const initialLayout: Layout[] = [
    // Row 1: Stat cards
    { i: 'stat-revenue', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
    { i: 'stat-leads', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
    { i: 'stat-opportunities', x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
    { i: 'stat-conversion', x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },

    // Row 2: Chart and a taller list
    { i: 'sales-performance', x: 0, y: 1, w: 9, h: 3, minW: 5, minH: 3 },
    { i: 'ai-insights', x: 9, y: 1, w: 3, h: 3, minW: 3, minH: 3 },
    
    // Row 3: Full width task list
    { i: 'my-tasks', x: 0, y: 4, w: 12, h: 2, minW: 6, minH: 2 },

    // Row 4: Another chart and another list
    { i: 'sales-pipeline', x: 0, y: 6, w: 6, h: 2, minW: 4, minH: 2 },
    { i: 'recent-activity', x: 6, y: 6, w: 6, h: 3, minW: 3, minH: 3 },
];

const initialWidgetIds = initialLayout.map(item => item.i);


const AppContent: React.FC = () => {
  // Dark mode state management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
  });

  // Apply dark mode to document root
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Use global state for business data
  const {
    contacts,
    setContacts: setGlobalContacts,
    leads,
    setLeads: setGlobalLeads,
    opportunities,
    setOpportunities: setGlobalOpportunities,
    projects,
    setProjects: setGlobalProjects,
    projectTasks,
    setProjectTasks: setGlobalProjectTasks,
    tasks,
    setTasks: setGlobalTasks,
    teamMembers,
    setTeamMembers: setGlobalTeamMembers,
    mediaFiles,
    setMediaFiles: setGlobalMediaFiles,
    cases,
    setCases: setGlobalCases,
    caseTasks,
    setCaseTasks: setGlobalCaseTasks,
    emailTemplates,
    setEmailTemplates: setGlobalEmailTemplates,
    supportTickets,
    setSupportTickets: setGlobalSupportTickets,
    timeEntries,
    setTimeEntries: setGlobalTimeEntries,
    activities,
    setActivities,
    invoices,
    setInvoices: setGlobalInvoices,
    estimates,
    setEstimates: setGlobalEstimates,
    products,
    setProducts: setGlobalProducts,
    aiInsights,
    setAiInsights: setGlobalAiInsights,
    isInitialized,
    setInitialized
  } = useGlobalStore();

  // Fetch all business data from Supabase on first load
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isInitialized) {
        try {
          // Fetch and set contacts
          const { data: contactsData } = await supabase.from('contacts').select('*');
          if (contactsData) setGlobalContacts(contactsData);
          // Fetch and set leads
          const { data: leadsData } = await supabase.from('leads').select('*');
          if (leadsData) setGlobalLeads(leadsData);
          // Fetch and set opportunities
          const { data: opportunitiesData } = await supabase.from('opportunities').select('*');
          if (opportunitiesData) setGlobalOpportunities(opportunitiesData);
          // Fetch and set projects
          const { data: projectsData } = await supabase.from('projects').select('*');
          if (projectsData) setGlobalProjects(projectsData);
          // Fetch and set projectTasks
          const { data: projectTasksData } = await supabase.from('project_tasks').select('*');
          if (projectTasksData) setGlobalProjectTasks(projectTasksData);
          // Fetch and set tasks
          const { data: tasksData } = await supabase.from('tasks').select('*');
          if (tasksData) setGlobalTasks(tasksData);
          // Fetch and set teamMembers
          const { data: teamMembersData } = await supabase.from('team_members').select('*');
          if (teamMembersData) setGlobalTeamMembers(teamMembersData);
          // Fetch and set mediaFiles
          const { data: mediaFilesData } = await supabase.from('media_files').select('*');
          if (mediaFilesData) setGlobalMediaFiles(mediaFilesData);
          // Fetch and set cases
          const { data: casesData } = await supabase.from('cases').select('*');
          if (casesData) setGlobalCases(casesData);
          // Fetch and set caseTasks
          const { data: caseTasksData } = await supabase.from('case_tasks').select('*');
          if (caseTasksData) setGlobalCaseTasks(caseTasksData);
          // Fetch and set emailTemplates
          const { data: emailTemplatesData } = await supabase.from('email_templates').select('*');
          if (emailTemplatesData) setGlobalEmailTemplates(emailTemplatesData);
          // Fetch and set supportTickets
          const { data: supportTicketsData } = await supabase.from('support_tickets').select('*');
          if (supportTicketsData) setGlobalSupportTickets(supportTicketsData);
          // Fetch and set timeEntries
          const { data: timeEntriesData } = await supabase.from('time_entries').select('*');
          if (timeEntriesData) setGlobalTimeEntries(timeEntriesData);
          // ...fetch other entities as needed...
        } catch (err) {
          console.error('Data fetch error:', err);
        } finally {
          setInitialized(true);
        }
      }
    };
    fetchAllData();
  }, [isInitialized]);

  const [dashboardLayout, setDashboardLayout] = useState<Layout[]>(initialLayout);
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(initialWidgetIds);
  
  // Chat popup state
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  
  // DM popup state - manages multiple DM windows
  const [dmPopups, setDmPopups] = useState<Array<{
    id: string;
    participant: TeamMember;
    conversationId: string;
    position: { x: number; y: number };
  }>>([]);


  const currentUser = teamMembers.find(m => m.id === 'user');

  // DM popup handlers
  const handlePopoutDM = (conversationId: string, participant: TeamMember) => {
    // Check if DM popup for this participant already exists
    const existingPopup = dmPopups.find(popup => popup.participant.id === participant.id);
    if (existingPopup) {
      // If it exists, just focus it (bring to front)
      return;
    }

    // Calculate position for new DM window (stagger them)
    const baseX = 200;
    const baseY = 200;
    const offset = dmPopups.length * 50; // Stagger each new window

    const newPopup = {
      id: `dm-${participant.id}-${Date.now()}`,
      participant,
      conversationId,
      position: { x: baseX + offset, y: baseY + offset }
    };

    setDmPopups(prev => [...prev, newPopup]);
  };

  const handleCloseDM = (popupId: string) => {
    setDmPopups(prev => prev.filter(popup => popup.id !== popupId));
  };

  const generateAIInsights = async () => {
    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const prompt = `You are a helpful business analyst AI for a CRM. Analyze the following JSON data and provide 2-3 actionable insights for the user. Focus on identifying risks (like overdue tasks or stalled deals) and opportunities (like potential follow-ups).
        
        Data:
        - Opportunities: ${JSON.stringify(opportunities.map(o => ({ stage: o.stage, value: o.value, closeDate: o.closeDate, title: o.title })))}
        - Tasks: ${JSON.stringify(tasks.filter(t => t.status !== 'Completed').map(t => ({ title: t.title, dueDate: t.dueDate, priority: t.priority})))}

        The current date is ${new Date().toISOString()}.

        Format your response as a JSON array of objects, where each object has "id", "emoji", "text", and "priority" ('high', 'medium', or 'low'). For example: [{"id": "insight1", "emoji": "⚠️", "text": "Deal 'Website Redesign' is close to its due date but is still in the Proposal stage.", "priority": "high"}]
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17', 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
              jsonStr = match[2].trim();
            }
            
            const parsedInsights = JSON.parse(jsonStr);
            if (Array.isArray(parsedInsights)) {
                setAiInsights(parsedInsights);
            }
        }

    } catch (error) {
        console.error("Error generating AI insights:", error);
        // Handle error, e.g., show a toast notification
    }
  };

  // Create a comprehensive context object to pass to the AI
  const appContext = {
    activities, setActivities,
    tasks, setTasks: setGlobalTasks,
    contacts, setContacts: setGlobalContacts,
    timeEntries, setTimeEntries: setGlobalTimeEntries,
    projects, setProjects: setGlobalProjects,
    projectTasks, setProjectTasks: setGlobalProjectTasks,
    teamMembers, setTeamMembers: setGlobalTeamMembers,
    leads, setLeads: setGlobalLeads,
    opportunities, setOpportunities: setGlobalOpportunities,
    mediaFiles, setMediaFiles: setGlobalMediaFiles,
    cases, setCases: setGlobalCases,
    caseTasks, setCaseTasks: setGlobalCaseTasks,
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
      setDashboardLayout(newLayout);
  };

  const addWidget = (widgetId: string) => {
      const widgetToAdd = ALL_WIDGETS.find(w => w.id === widgetId);
      if (!widgetToAdd) return;

      setActiveWidgetIds(prev => [...prev, widgetId]);
      setDashboardLayout(prev => [
          ...prev,
          {
              i: widgetId,
              x: (prev.length * 4) % 12, // Cascade new widgets
              y: Infinity, // Puts it at the bottom
              w: widgetToAdd.minW || 4,
              h: widgetToAdd.minH || 2,
              minW: widgetToAdd.minW,
              minH: widgetToAdd.minH,
          }
      ]);
  };

  const removeWidget = (widgetId: string) => {
      setActiveWidgetIds(prev => prev.filter(id => id !== widgetId));
  };


  const location = useLocation();
  const navigate = useNavigate();
  const isPublicPage = location.pathname.startsWith('/public/') || ['/login', '/signup', '/forgot-password', '/reset-password'].some(path => location.pathname.startsWith(path));
  const isChatPage = ['/chat', '/team-chat'].includes(location.pathname);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    tasks.forEach(task => {
        const startDate = new Date(task.dueDate);
        startDate.setHours(0,0,0,0);
        events.push({
            id: `task-${task.id}`,
            title: task.title,
            start: startDate,
            end: startDate,
            type: 'task',
            link: '#/tasks',
            data: task,
        });
    });

    invoices.forEach(invoice => {
        const startDate = new Date(invoice.dueDate);
        startDate.setHours(0,0,0,0);
        events.push({
            id: `invoice-${invoice.id}`,
            title: `Invoice ${invoice.invoiceNumber} Due`,
            start: startDate,
            end: startDate,
            type: 'invoice',
            link: '#/billing',
            data: invoice,
        });
    });
    
    estimates.forEach(estimate => {
        const startDate = new Date(estimate.expiryDate);
        startDate.setHours(0,0,0,0);
        events.push({
            id: `estimate-${estimate.id}`,
            title: `Estimate ${estimate.estimateNumber} Expires`,
            start: startDate,
            end: startDate,
            type: 'estimate',
            link: '#/billing',
            data: estimate,
        });
    });
    
    opportunities.forEach(opportunity => {
        if (opportunity.closeDate) {
            const startDate = new Date(opportunity.closeDate);
            startDate.setHours(0,0,0,0);
            events.push({
                id: `opportunity-${opportunity.id}`,
                title: `Deal: ${opportunity.title}`,
                start: startDate,
                end: startDate,
                type: 'opportunity',
                link: '#/opportunities',
                data: opportunity,
            });
        }
    });
    
    projects.forEach(project => {
        const startDate = new Date(project.deadline);
        startDate.setHours(0,0,0,0);
        events.push({
            id: `project-${project.id}`,
            title: `Project Deadline: ${project.name}`,
            start: startDate,
            end: startDate,
            type: 'project',
            link: '#/projects',
            data: project,
        });
    });
    
    cases.forEach(c => {
        const openDate = new Date(c.openDate);
        openDate.setHours(0,0,0,0);
        events.push({
            id: `case-open-${c.id}`,
            title: `Case Opened: ${c.name}`,
            start: openDate,
            end: openDate,
            type: 'case',
            link: '#/cases',
            data: c,
        });
        
        if (c.closeDate) {
            const closeDate = new Date(c.closeDate);
            closeDate.setHours(0,0,0,0);
             events.push({
                id: `case-close-${c.id}`,
                title: `Case Closed: ${c.name}`,
                start: closeDate,
                end: closeDate,
                type: 'case',
                link: '#/cases',
                data: c,
            });
        }
    });

    activities.forEach(activity => {
        if (activity.type === ActivityType.Meeting) {
            events.push({
                id: `activity-${activity.id}`,
                title: `Meeting: ${activity.summary}`,
                start: new Date(activity.timestamp),
                end: activity.endTime ? new Date(activity.endTime) : new Date(activity.timestamp),
                type: 'meeting',
                link: '#/activities',
                data: activity,
            });
        }
    });

    return events;
  }, [tasks, invoices, estimates, opportunities, projects, activities, cases]);


  // Error boundary state
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const onError = (e: ErrorEvent) => {
      setError('Window error: ' + e.message);
      // Log to console for debugging
      console.error('Window error:', e);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      setError('Unhandled promise rejection: ' + (e?.reason?.message || String(e?.reason)));
      // Log to console for debugging
      console.error('Unhandled promise rejection:', e);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // Log login status on every page render
  const userId = useGlobalStore((state) => state.userId);
  const role = useGlobalStore((state) => state.role);
  const subscriptionStatus = useGlobalStore((state) => state.subscriptionStatus);
  useEffect(() => {
    console.log('Login status (global):', { userId, role, subscriptionStatus });
  }, [userId, role, subscriptionStatus]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visible by default on desktop, toggleable on mobile */}
      {!isPublicPage && <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        mediaFiles={mediaFiles}
        teamMembers={teamMembers}
        setTeamMembers={setGlobalTeamMembers}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
        {!isPublicPage && <Header setIsSidebarOpen={setIsSidebarOpen} />}
        <main id="crm-container" className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${isPublicPage ? '' : 'p-6 md:p-8 xl:p-10'}`}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard 
                    allWidgets={ALL_WIDGETS}
                    activeWidgetIds={activeWidgetIds}
                    layout={dashboardLayout}
                    onLayoutChange={handleLayoutChange}
                    addWidget={addWidget}
                    removeWidget={removeWidget}
                    activities={activities}
                    tasks={tasks}
                    teamMembers={teamMembers}
                    leads={leads}
                    opportunities={opportunities}
                    invoices={invoices}
                    aiInsights={aiInsights}
                    generateAIInsights={generateAIInsights}
                    currentUser={currentUser}
                    appContext={appContext}
                  /></ProtectedRoute>} />
                <Route path="/calendar" element={<Calendar currentUser={currentUser} />} />
                <Route path="/opportunities" element={<Opportunities 
                  opportunities={opportunities}
                  setOpportunities={setGlobalOpportunities}
                  contacts={contacts}
                  teamMembers={teamMembers}
                  activities={activities}
                  appContext={appContext}
                />} />
                <Route path="/leads" element={<Leads appContext={appContext} />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/activities" element={<Activities 
                  setTasks={setGlobalTasks}
                  contacts={contacts}
                  appContext={appContext}
                />} />
                <Route path="/tasks" element={<Tasks />} />
                {/* Creative routes */}
                <Route path="/creatives/image-generation" element={<ProtectedRoute><ImageGeneration /></ProtectedRoute>} />
                <Route path="/creatives/gallery" element={<ProtectedRoute><ImageGallery /></ProtectedRoute>} />
                <Route path="/creatives/copy-generation" element={<ProtectedRoute><CopyGeneration /></ProtectedRoute>} />
                <Route path="/creatives/video-generation" element={<ProtectedRoute><VideoGeneration /></ProtectedRoute>} />
                {/* Communications routes */}
                <Route path="/ai-landing-page-builder" element={<ProtectedRoute><AILandingPageBuilder /></ProtectedRoute>} />
                <Route path="/newsletter" element={<ProtectedRoute><NewsletterManagement /></ProtectedRoute>} />
                <Route path="/bots/website-chat" element={<ProtectedRoute><WebsiteChatBot /></ProtectedRoute>} />
                <Route path="/bots/phone" element={<ProtectedRoute><PhoneBot /></ProtectedRoute>} />
                <Route path="/bots/form" element={<ProtectedRoute><FormBot /></ProtectedRoute>} />
                <Route path="/form-builder" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
                <Route path="/bot-analytics" element={<ProtectedRoute><BotAnalytics /></ProtectedRoute>} />
                <Route path="/chat" element={<Chat 
                  teamMembers={teamMembers}
                  mediaFiles={mediaFiles}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/communications" element={<ProtectedRoute><Chat 
                  teamMembers={teamMembers}
                  mediaFiles={mediaFiles}
                  currentUser={currentUser}
                  appContext={appContext}
                /></ProtectedRoute>} />
                <Route path="/team-chat" element={<ProtectedRoute><TeamChat 
                  currentUser={currentUser}
                /></ProtectedRoute>} />
                <Route path="/team" element={<Team 
                  timeEntries={timeEntries}
                  appContext={appContext}
                  onStartDM={handlePopoutDM}
                  onViewAllActivities={() => navigate('/activities')}
                />} />
                <Route path="/billing" element={<Billing 
                  invoices={invoices}
                  estimates={estimates}
                  products={products}
                  contacts={contacts}
                  mediaFiles={mediaFiles}
                  appContext={appContext}
                />} />
                <Route path="/time-billing" element={<TimeBilling 
                  contacts={contacts}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/projects" element={<Projects 
                  contacts={contacts}
                  teamMembers={teamMembers}
                  mediaFiles={mediaFiles.map(f => ({...f, syncStatus: 'synced'}))}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/cases" element={<Cases 
                  contacts={contacts}
                  teamMembers={teamMembers}
                  mediaFiles={mediaFiles.map(f => ({...f, syncStatus: 'synced'}))}
                  appContext={appContext}
                />} />
                <Route path="/media" element={<MediaLibrary 
                  mediaFiles={mediaFiles.map(f => ({...f, syncStatus: 'synced'}))}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/company" element={<Company 
                  // companyProfile={companyProfile}
                  // setCompanyProfile={setCompanyProfile}
                  // subscriptionInvoices={subscriptionInvoices}
                  // usageStats={{
                  //   contacts: contacts.length,
                  //   deals: opportunities.length,
                  //   projects: projects.length,
                  //   storageUsed: mediaFiles.length,
                  // }}
                  // accountOwner={teamMembers.find(m => m.id === 'user')}
                  // setTeamMembers={setTeamMembers}
                  // isStripeConnected={isStripeConnected}
                  // setIsStripeConnected={setIsStripeConnected}
                  // staff={teamMembers}
                  // featureAddons={featureAddons}
                  // setFeatureAddons={setFeatureAddons}
                  // emailTemplates={emailTemplates}
                  // setEmailTemplates={setEmailTemplates}
                  mediaFiles={mediaFiles.map(f => ({...f, syncStatus: 'synced'}))}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/reporting" element={<Reporting appContext={appContext} />} />
                <Route path="/support" element={<Support 
                  teamMembers={teamMembers}
                  currentUser={currentUser}
                  appContext={appContext}
                />} />
                <Route path="/public/invoice/:invoiceId" element={<PublicInvoicePage 
                  invoices={invoices}
                  contacts={contacts}
                  // companyProfile={companyProfile}
                />} />
                <Route path="/public/estimate/:estimateId" element={<PublicEstimatePage 
                  estimates={estimates}
                  setEstimates={setGlobalEstimates}
                  contacts={contacts}
                  // companyProfile={companyProfile}
                />} />
                {/* Bot Routes */}
                <Route path="/bots/website-chat" element={<ProtectedRoute><WebsiteChatBot /></ProtectedRoute>} />
                <Route path="/bots/phone" element={<ProtectedRoute><PhoneBot /></ProtectedRoute>} />
                <Route path="/bots/form" element={<ProtectedRoute><FormBot /></ProtectedRoute>} />
                <Route path="/form-builder" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
                <Route path="/bot-analytics" element={<ProtectedRoute><BotAnalytics /></ProtectedRoute>} />
                <Route path="*" element={<div style={{color: 'red', padding: 24}}>No route matched. If you see this, your routes are not working.</div>} />
              </Routes>
            </main>
            
            {/* Floating Chat Button - Only show on non-public and non-chat pages */}
            {!isPublicPage && !isChatPage && (
              <div className="fixed bottom-6 right-6 z-40">
                <button
                  onClick={() => setIsChatPopupOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Open team chat"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.7-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  {/* Unread messages badge moved to ChatPopup */}
                </button>
              </div>
            )}
            
            {/* Chat Popup */}
            <ChatPopup
              isOpen={isChatPopupOpen}
              onClose={() => setIsChatPopupOpen(false)}
              currentUser={currentUser}
              onPopoutDM={handlePopoutDM}
            />
            
            {/* DM Popups */}
            {dmPopups.map((popup) => (
              <DMPopup
                key={popup.id}
                isOpen={true}
                onClose={() => handleCloseDM(popup.id)}
                participant={popup.participant}
                conversationId={popup.conversationId}
                currentUser={currentUser}
                position={popup.position}
              />
            ))}
        </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppContent />
);

export default App;

/*
  Documentation: The darkMode setting is now persistent and will be restored from localStorage on app load.
*/