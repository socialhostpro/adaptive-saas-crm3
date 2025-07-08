

import { Contact, Lead, LeadStatus, Opportunity, OpportunityStage, Activity, ActivityType, Task, TaskStatus, TaskPriority, Invoice, InvoiceStatus, TeamMember, TeamMemberRole, TeamMemberStatus, Estimate, EstimateStatus, Conversation, ChatMessage, Product, TimeEntry, TimeEntryStatus, Project, ProjectStatus, ProjectTask, MediaFile, Case, CaseStatus, CaseTask, CompanyProfile, SubscriptionInvoice, FeatureAddon, EmailTemplate, SupportTicket, AIInsight, SaaSSettings } from './types';

export const contacts: Contact[] = [
  { id: 'c1', name: 'Alana Patel', email: 'alana.p@examplecorp.com', title: 'Marketing Director', company: 'Innovate Inc.', avatarUrl: 'https://picsum.photos/seed/1/100/100', phone: '555-0101' },
  { id: 'c2', name: 'Ben Carter', email: 'ben.c@techsolutions.io', title: 'CEO', company: 'TechSolutions', avatarUrl: 'https://picsum.photos/seed/2/100/100', phone: '555-0102' },
  { id: 'c3', name: 'Carla Rodriguez', email: 'carla.r@datatech.co', title: 'Lead Developer', company: 'DataTech', avatarUrl: 'https://picsum.photos/seed/3/100/100', phone: '555-0103' },
  { id: 'c4', name: 'David Lee', email: 'david.l@synergy.com', title: 'Product Manager', company: 'Synergy Co.', avatarUrl: 'https://picsum.photos/seed/4/100/100' },
  { id: 'c5', name: 'Eva Chen', email: 'eva.c@cloudwave.net', title: 'Sales Manager', company: 'CloudWave', avatarUrl: 'https://picsum.photos/seed/5/100/100', phone: '555-0105' },
];

export const leads: Lead[] = [
  { id: 'l1', name: 'Frank Green', company: 'Global Exports', email: 'frank.g@globalexports.com', score: 85, status: LeadStatus.Contacted, lastContacted: '2 days ago' },
  { id: 'l2', name: 'Grace Hall', company: 'HealthFirst Clinic', email: 'grace.h@healthfirst.org', score: 92, status: LeadStatus.Qualified, lastContacted: '1 day ago', contactId: 'c2'},
  { id: 'l3', name: 'Henry Ito', company: 'NextGen AI', email: 'henry.i@nextgenai.dev', score: 78, status: LeadStatus.New, lastContacted: '5 days ago' },
  { id: 'l4', name: 'Isla King', company: 'Quantum Computing Inc', email: 'isla.k@quantum.com', score: 65, status: LeadStatus.Lost, lastContacted: '1 week ago' },
  { id: 'l5', name: 'Jack Miller', company: 'Creative Solutions', email: 'jack.m@creatives.co', score: 88, status: LeadStatus.Contacted, lastContacted: '3 hours ago' },
];

export const opportunities: Opportunity[] = [
  { id: 'o1', title: 'Website Redesign Project', contactId: 'c1', contactName: 'Alana Patel', value: 25000, stage: OpportunityStage.Proposal, closeDate: '2024-08-30', assigneeId: 'tm3' },
  { id: 'o2', title: 'Cloud Migration Service', contactId: 'c2', contactName: 'Ben Carter', value: 55000, stage: OpportunityStage.Negotiation, closeDate: '2024-07-25', assigneeId: 'tm2' },
  { id: 'o3', title: 'Data Analytics Platform', contactId: 'c3', contactName: 'Carla Rodriguez', value: 72000, stage: OpportunityStage.Qualification, closeDate: '2024-09-15', assigneeId: 'user' },
  { id: 'o4', title: 'Mobile App Development', contactId: 'c4', contactName: 'David Lee', value: 40000, stage: OpportunityStage.Prospecting, closeDate: '2024-10-01', assigneeId: 'tm5' },
  { id: 'o5', title: 'Q3 Sales Training', contactId: 'c5', contactName: 'Eva Chen', value: 15000, stage: OpportunityStage.ClosedWon, closeDate: '2024-06-28', assigneeId: 'tm3' },
  { id: 'o6', title: 'API Integration', contactId: 'l3', contactName: 'Henry Ito', value: 18000, stage: OpportunityStage.Qualification, closeDate: '2024-08-20', assigneeId: 'tm4' },
  { id: 'o7', title: 'IT Support Contract', contactId: 'l2', contactName: 'Grace Hall', value: 30000, stage: OpportunityStage.Proposal, closeDate: '2024-07-31', assigneeId: 'user' },
  { id: 'o8', title: 'Initial Consultation', contactId: 'l5', contactName: 'Jack Miller', value: 5000, stage: OpportunityStage.Prospecting, closeDate: '2024-08-05', assigneeId: 'tm5' },
];

export const activities: Activity[] = [
    { id: 'a1', type: ActivityType.Email, contactId: 'c1', contactName: 'Alana Patel', summary: 'Sent over the final proposal documents for the new website design. She will review with her team and get back to us by Friday.', subject: 'Proposal for Website Redesign', timestamp: new Date(Date.now() - 2 * 3600 * 1000) },
    { id: 'a2', type: ActivityType.Call, contactId: 'c2', leadId: 'l2', contactName: 'Ben Carter', summary: 'Follow-up call regarding cloud services. He had a few questions about our security protocols which I answered. He seems confident in our solution.', duration: 15, outcome: 'Positive', timestamp: new Date(Date.now() - 5 * 3600 * 1000) },
    { id: 'a3', type: ActivityType.Meeting, contactId: 'c5', contactName: 'Eva Chen', summary: 'Q3 sales strategy kickoff. We aligned on targets and discussed the new commission structure. Team is motivated.', location: 'Boardroom C / Zoom', timestamp: new Date(Date.now() - 24 * 3600 * 1000), endTime: new Date(Date.now() - 23 * 3600 * 1000) },
    { id: 'a4', type: ActivityType.Note, contactId: 'c3', contactName: 'Carla Rodriguez', summary: 'Carla is a key decision-maker. She mentioned offhand that their current analytics dashboard is slow and lacks key features we offer. This could be a major upsell opportunity in Q4.', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 'a5', type: ActivityType.Call, contactId: 'l1', contactName: 'Frank Green', summary: 'Initial discovery call with Frank. He is looking for a new shipping logistics partner.', duration: 30, outcome: 'Positive', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000), leadId: 'l1'},
];

export const tasks: Task[] = [
  { id: 't1', title: 'Follow up on proposal with Innovate Inc.', contactId: 'c1', contactName: 'Alana Patel', dueDate: '2024-08-15', status: TaskStatus.ToDo, priority: TaskPriority.High, description: 'Client is waiting for the updated proposal. Make sure to include the new timeline and budget.', assigneeId: 'user', opportunityId: 'o1', mediaFileIds: ['mf1'], timeEntryIds: ['te1', 'te2'] },
  { id: 't2', title: 'Prepare for Q3 review meeting', contactId: 'c2', contactName: 'Ben Carter', dueDate: '2024-07-22', status: TaskStatus.InProgress, priority: TaskPriority.High, description: 'Gather all sales data and create presentation slides.', assigneeId: 'tm2', opportunityId: 'o2', timeEntryIds: ['te3'] },
  { id: 't3', title: 'Onboard new developer with DataTech', contactId: 'c3', contactName: 'Carla Rodriguez', dueDate: '2024-07-10', status: TaskStatus.Completed, priority: TaskPriority.Medium, assigneeId: 'tm4' },
  { id: 't4', title: 'Schedule a demo call with Synergy Co.', contactId: 'c4', contactName: 'David Lee', dueDate: '2024-07-25', status: TaskStatus.ToDo, priority: TaskPriority.Medium, description: 'David is interested in seeing the new mobile app features.', assigneeId: 'tm5', opportunityId: 'o4' },
  { id: 't5', title: 'Review Q2 sales report with CloudWave', contactId: 'c5', contactName: 'Eva Chen', dueDate: '2024-07-01', status: TaskStatus.Completed, priority: TaskPriority.Low, assigneeId: 'user' },
  { id: 't6', title: 'Draft a new service level agreement', contactId: 'c2', contactName: 'Ben Carter', dueDate: '2024-07-18', status: TaskStatus.ToDo, priority: TaskPriority.High, leadId: 'l2', assigneeId: 'tm2' },
  { id: 't7', title: 'Send welcome kit to Frank', contactId: 'l1', contactName: 'Frank Green', dueDate: '2024-08-10', status: TaskStatus.ToDo, priority: TaskPriority.Medium, leadId: 'l1', assigneeId: 'tm3' },
  { id: 't8', title: 'Review discovery documents', contactId: 'c1', contactName: 'Alana Patel', dueDate: '2024-08-25', status: TaskStatus.ToDo, priority: TaskPriority.High, assigneeId: 'user', caseId: 'case1', mediaFileIds: ['mf3'], timeEntryIds: [] },
  { id: 't9', title: 'Client follow-up call', contactId: 'c2', contactName: 'Ben Carter', dueDate: '2024-08-28', status: TaskStatus.ToDo, priority: TaskPriority.Medium, assigneeId: 'tm2', projectId: 'proj2', timeEntryIds: ['te6'] },
];

export const teamMembers: TeamMember[] = [
    { id: 'user', name: 'Taylor Swift', email: 'taylor.s@adaptiverm.com', role: TeamMemberRole.SuperAdmin, avatarUrl: 'https://picsum.photos/seed/user/100/100', status: TeamMemberStatus.Online, lastSeen: 'Online', phone: '555-0110', hireDate: '2022-01-15', voiceSettings: { voiceURI: 'default', rate: 1, pitch: 1 } },
    { id: 'tm2', name: 'Ryan Reynolds', email: 'ryan.r@adaptiverm.com', role: TeamMemberRole.SuperAdmin, avatarUrl: 'https://picsum.photos/seed/tm2/100/100', status: TeamMemberStatus.Online, lastSeen: 'Online', phone: '555-0111', hireDate: '2021-03-20' },
    { id: 'tm3', name: 'Blake Lively', email: 'blake.l@adaptiverm.com', role: TeamMemberRole.Sales, avatarUrl: 'https://picsum.photos/seed/tm3/100/100', status: TeamMemberStatus.Away, lastSeen: '15m ago', phone: '555-0112', hireDate: '2022-08-01' },
    { id: 'tm4', name: 'Hugh Jackman', email: 'hugh.j@adaptiverm.com', role: TeamMemberRole.Sales, avatarUrl: 'https://picsum.photos/seed/tm4/100/100', status: TeamMemberStatus.Offline, lastSeen: '2h ago', phone: '555-0113', hireDate: '2023-05-10' },
    { id: 'tm5', name: 'Zendaya', email: 'zendaya@adaptiverm.com', role: TeamMemberRole.Sales, avatarUrl: 'https://picsum.photos/seed/tm5/100/100', status: TeamMemberStatus.Online, lastSeen: 'Online', phone: '555-0114', hireDate: '2023-09-01' },
];

export const mediaFiles: MediaFile[] = [
    { id: 'mf1', name: 'Website Mockup Draft.png', url: 'https://picsum.photos/seed/mf1/800/600', type: 'image', uploadedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000) },
    { id: 'mf2', name: 'Client Kickoff Presentation.mp4', url: '#', type: 'video', uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 'mf3', name: 'Service Contract.pdf', url: '#', type: 'document', uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    { id: 'mf4', name: 'Final Logo Design.png', url: 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500', type: 'image', uploadedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000) },
    { id: 'mf5', name: 'Infrastructure Diagram.pdf', url: '#', type: 'document', uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
    { id: 'mf6', name: 'Competitor Analysis.png', url: 'https://picsum.photos/seed/mf6/800/600', type: 'image', uploadedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000) },
];

export const projects: Project[] = [
    { id: 'proj1', name: 'Innovate Inc. Website Redesign', description: 'Complete overhaul of the corporate website, including a new CMS and e-commerce functionality.', contactId: 'c1', contactName: 'Alana Patel', deadline: '2024-10-31', budget: 25000, status: ProjectStatus.InProgress, mediaFileIds: ['mf1', 'mf4'] },
    { id: 'proj2', name: 'TechSolutions Cloud Platform', description: 'Migration of all on-premise servers to a new scalable cloud infrastructure.', contactId: 'c2', contactName: 'Ben Carter', deadline: '2024-09-30', budget: 55000, status: ProjectStatus.InProgress, mediaFileIds: ['mf5'] },
    { id: 'proj3', name: 'DataTech Analytics Dashboard', description: 'Development of a new internal dashboard for real-time data visualization.', contactId: 'c3', contactName: 'Carla Rodriguez', deadline: '2024-12-01', budget: 72000, status: ProjectStatus.NotStarted, mediaFileIds: [] },
    { id: 'proj4', name: 'Synergy Mobile App', description: 'Build a cross-platform mobile application for customer engagement.', contactId: 'c4', contactName: 'David Lee', deadline: '2025-01-15', budget: 40000, status: ProjectStatus.OnHold, mediaFileIds: [] },
];

export const projectTasks: ProjectTask[] = [
    // Project 1 Tasks
    { id: 'ptask1', projectId: 'proj1', title: 'Finalize design mockups', assigneeId: 'tm3', dueDate: '2024-08-15', status: TaskStatus.Completed },
    { id: 'ptask2', projectId: 'proj1', title: 'Develop frontend components', assigneeId: 'tm5', dueDate: '2024-09-10', status: TaskStatus.InProgress },
    { id: 'ptask3', projectId: 'proj1', title: 'Set up CMS backend', assigneeId: 'tm4', dueDate: '2024-09-20', status: TaskStatus.ToDo },
    // Project 2 Tasks
    { id: 'ptask4', projectId: 'proj2', title: 'Audit existing server infrastructure', assigneeId: 'tm2', dueDate: '2024-08-10', status: TaskStatus.Completed },
    { id: 'ptask5', projectId: 'proj2', title: 'Configure cloud environment', assigneeId: 'tm2', dueDate: '2024-08-25', status: TaskStatus.InProgress },
    { id: 'ptask6', projectId: 'proj2', title: 'Plan data migration schedule', assigneeId: 'user', dueDate: '2024-09-05', status: TaskStatus.InProgress },
    { id: 'ptask7', projectId: 'proj2', title: 'Execute full migration', assigneeId: 'tm2', dueDate: '2024-09-25', status: TaskStatus.ToDo },
     // Project 3 Tasks
    { id: 'ptask8', projectId: 'proj3', title: 'Gather data source requirements', assigneeId: 'user', dueDate: '2024-09-01', status: TaskStatus.ToDo },
];

export const cases: Case[] = [
    {
        id: 'case1',
        name: 'Innovate Inc. vs. Competitor Co.',
        caseNumber: 'CIV-2024-001',
        contactId: 'c1',
        contactName: 'Alana Patel',
        attorneyId: 'tm2',
        status: CaseStatus.Discovery,
        openDate: '2024-05-10',
        description: 'Intellectual property dispute regarding marketing materials.',
        mediaFileIds: ['mf3'],
    },
    {
        id: 'case2',
        name: 'Carter Personal Injury Claim',
        caseNumber: 'PI-2024-052',
        contactId: 'c2',
        contactName: 'Ben Carter',
        attorneyId: 'user',
        status: CaseStatus.Intake,
        openDate: '2024-07-15',
        description: 'Claim regarding a slip and fall incident at a commercial property.',
        mediaFileIds: [],
    },
    {
        id: 'case3',
        name: 'DataTech Employment Contract Review',
        caseNumber: 'EMP-2024-113',
        contactId: 'c3',
        contactName: 'Carla Rodriguez',
        attorneyId: 'tm4',
        status: CaseStatus.ClosedWon,
        openDate: '2024-04-01',
        closeDate: '2024-06-30',
        description: 'Review and negotiation of employment contract terms for a senior developer.',
        mediaFileIds: [],
    }
];

export const caseTasks: CaseTask[] = [
    { id: 'ctask1', caseId: 'case1', title: 'File motion for summary judgment', assigneeId: 'tm2', dueDate: '2024-08-20', status: TaskStatus.InProgress },
    { id: 'ctask2', caseId: 'case1', title: 'Deposition of opposing CEO', assigneeId: 'user', dueDate: '2024-09-05', status: TaskStatus.ToDo },
    { id: 'ctask3', caseId: 'case2', title: 'Collect all medical records', assigneeId: 'user', dueDate: '2024-08-01', status: TaskStatus.ToDo },
    { id: 'ctask4', caseId: 'case3', title: 'Finalize settlement agreement', assigneeId: 'tm4', dueDate: '2024-06-25', status: TaskStatus.Completed },
];


export const pipelineData = [
    { name: 'Prospecting', value: 1, fill: '#38bdf8' },
    { name: 'Qualification', value: 2, fill: '#60a5fa' },
    { name: 'Proposal', value: 2, fill: '#3b82f6' },
    { name: 'Negotiation', value: 1, fill: '#2563eb' },
    { name: 'Closed Won', value: 1, fill: '#16a34a' },
];

export const salesData = [
    { name: 'Jan', Sales: 4000 },
    { name: 'Feb', Sales: 3000 },
    { name: 'Mar', Sales: 5000 },
    { name: 'Apr', Sales: 4500 },
    { name: 'May', Sales: 6000 },
    { name: 'Jun', Sales: 5500 },
];

export const products: Product[] = [
    { id: 'prod1', name: 'Standard Website Package', description: 'Includes 5 pages, basic SEO, and contact form.', price: 5000, imageUrl: 'https://picsum.photos/seed/prod1/400/300' },
    { id: 'prod2', name: 'Premium Cloud Hosting', description: '1-year premium hosting with 99.9% uptime.', price: 1200, imageUrl: 'https://picsum.photos/seed/prod2/400/300' },
    { id: 'prod3', name: 'SEO & Marketing Plan', description: 'Monthly SEO and content marketing services.', price: 2500, imageUrl: 'https://picsum.photos/seed/prod3/400/300' },
    { id: 'prod4', name: 'Hourly Consulting', description: 'Technical or business consulting.', price: 150, imageUrl: 'https://picsum.photos/seed/prod4/400/300' },
    { id: 'prod5', name: 'Enterprise Software License', description: '1-year license for up to 50 users.', price: 15000, imageUrl: 'https://picsum.photos/seed/prod5/400/300' },
];

export const invoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2024-001', contactId: 'c5', contactName: 'Eva Chen', totalAmount: 15000, issueDate: '2024-06-20', dueDate: '2024-07-20', status: InvoiceStatus.Paid, payments: [{ id: 'pay1', amount: 15000, date: '2024-07-19', method: 'Credit Card' }] },
  { id: 'inv2', invoiceNumber: 'INV-2024-002', contactId: 'c1', contactName: 'Alana Patel', totalAmount: 25000, issueDate: '2024-07-01', dueDate: '2024-07-31', status: InvoiceStatus.PartiallyPaid, payments: [{ id: 'pay2', amount: 10000, date: '2024-07-15', method: 'Bank Transfer' }] },
  { id: 'inv3', invoiceNumber: 'INV-2024-003', contactId: 'c2', contactName: 'Ben Carter', totalAmount: 55000, issueDate: '2024-07-15', dueDate: '2024-08-15', status: InvoiceStatus.Draft, payments: [] },
  { id: 'inv4', invoiceNumber: 'INV-2024-004', contactId: 'c4', contactName: 'David Lee', totalAmount: 40000, issueDate: '2024-05-30', dueDate: '2024-06-30', status: InvoiceStatus.Overdue, payments: [] },
  { id: 'inv5', invoiceNumber: 'INV-2024-005', contactId: 'l2', contactName: 'Grace Hall', totalAmount: 30000, issueDate: '2024-07-18', dueDate: '2024-08-18', status: InvoiceStatus.Sent, payments: [] },
];

export const estimates: Estimate[] = [
  { id: 'est1', estimateNumber: 'EST-2024-001', contactId: 'c3', contactName: 'Carla Rodriguez', amount: 72000, issueDate: '2024-07-10', expiryDate: '2024-08-10', status: EstimateStatus.Sent },
  { id: 'est2', estimateNumber: 'EST-2024-002', contactId: 'c4', contactName: 'David Lee', amount: 40000, issueDate: '2024-07-12', expiryDate: '2024-08-12', status: EstimateStatus.Accepted },
  { id: 'est3', estimateNumber: 'EST-2024-003', contactId: 'c1', contactName: 'Alana Patel', amount: 25000, issueDate: '2024-07-15', expiryDate: '2024-08-15', status: EstimateStatus.Draft },
  { id: 'est4', estimateNumber: 'EST-2024-004', contactId: 'l1', contactName: 'Frank Green', amount: 12000, issueDate: '2024-06-25', expiryDate: '2024-07-25', status: EstimateStatus.Declined },
  { id: 'est5', estimateNumber: 'EST-2024-005', contactId: 'c5', contactName: 'Eva Chen', amount: 15000, issueDate: '2024-06-01', expiryDate: '2024-07-01', status: EstimateStatus.Invoiced },
];

export const conversations: Conversation[] = [
    {
        id: 'conv1',
        type: 'channel',
        name: '#q3-sales-push',
        participantIds: ['user', 'tm3', 'tm4', 'tm5'],
        creatorId: 'user',
        description: '4 Members',
        lastMessage: 'Great, let\'s circle back on Friday.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        unreadCount: 2,
    },
    {
        id: 'conv2',
        type: 'dm',
        name: 'Ryan Reynolds',
        participantIds: ['user', 'tm2'],
        avatarUrl: 'https://picsum.photos/seed/tm2/100/100',
        description: 'Manager',
        lastMessage: 'Perfect, I\'ve attached the final version.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 0,
    },
    {
        id: 'conv3',
        type: 'dm',
        name: 'Ben Carter',
        participantIds: ['user', 'c2'],
        avatarUrl: 'https://picsum.photos/seed/2/100/100',
        description: 'TechSolutions CEO',
        lastMessage: 'The proposal for the new system looks great.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 1,
        linkedRecord: {
            type: 'Opportunity',
            name: 'Cloud Migration Service'
        }
    },
     {
        id: 'conv4',
        type: 'channel',
        name: '#project-synergy',
        participantIds: ['user', 'tm2', 'tm3', 'c4'],
        creatorId: 'tm2',
        description: 'Client & Internal Team',
        lastMessage: 'Can you provide an update on the wireframes?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unreadCount: 0,
    },
];

export const messages: ChatMessage[] = [
    // Conversation 1: #q3-sales-push
    { id: 'msg1-1', conversationId: 'conv1', senderId: 'tm3', text: 'Morning team! Any new updates on the Q3 leads?', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
    { id: 'msg1-2', conversationId: 'conv1', senderId: 'user', text: 'I just spoke with _Global Exports_, they are very interested. @Blake Lively can you follow up?', timestamp: new Date(Date.now() - 20 * 60 * 1000) },
    { id: 'msg1-3', conversationId: 'conv1', senderId: 'tm5', text: 'On it. I\'ll schedule a call for this afternoon.', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
    { id: 'msg1-4', conversationId: 'conv1', senderId: 'user', text: '*Excellent.*', timestamp: new Date(Date.now() - 5 * 60 * 1000) },

    // Conversation 2: Ryan Reynolds (DM)
    { id: 'msg2-1', conversationId: 'conv2', senderId: 'tm2', text: 'Hey, I\'ve reviewed the draft for the client presentation. It looks solid, just a few minor tweaks needed.', timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { id: 'msg2-2', conversationId: 'conv2', senderId: 'user', text: 'Great, what did you have in mind?', timestamp: new Date(Date.now() - 44 * 60 * 1000) },
    { id: 'msg2-3', conversationId: 'conv2', senderId: 'tm2', text: 'Let\'s add a slide on competitor analysis. I think that will really strengthen our position.', timestamp: new Date(Date.now() - 40 * 60 * 1000), parentId: 'msg2-2' },
    { id: 'msg2-4', conversationId: 'conv2', senderId: 'user', text: 'Good idea. I\'ll work on that now.', timestamp: new Date(Date.now() - 38 * 60 * 1000), parentId: 'msg2-3' },
    { id: 'msg2-5', conversationId: 'conv2', senderId: 'user', text: 'Perfect, I\'ve attached the final version.', timestamp: new Date(Date.now() - 30 * 60 * 1000), 
      attachment: mediaFiles[5]
    },

    // Conversation 3: Ben Carter (Client DM with linked record)
    { id: 'msg3-1', conversationId: 'conv3', senderId: 'user', text: 'Hi Ben, following up on our discussion. Here is the service contract for the cloud migration.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), 
      attachment: mediaFiles[2]
    },
    { id: 'msg3-2', conversationId: 'conv3', senderId: 'c2', text: 'Thanks! I\'ll review this with my team and get back to you shortly.', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000) },
    { id: 'msg3-3', conversationId: 'conv3', senderId: 'c2', text: 'The proposal for the new system looks great.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

export const timeEntries: TimeEntry[] = [
  { id: 'te1', contactId: 'c1', contactName: 'Alana Patel', date: '2024-07-20', duration: 2.5, description: 'Consultation call for website redesign', isBillable: true, status: TimeEntryStatus.Unbilled, hourlyRate: 150, taskId: 't1', userId: 'user' },
  { id: 'te2', contactId: 'c1', contactName: 'Alana Patel', date: '2024-07-21', duration: 5, description: 'Initial design mockups', isBillable: true, status: TimeEntryStatus.Unbilled, hourlyRate: 150, taskId: 't1', userId: 'user' },
  { id: 'te3', contactId: 'c2', contactName: 'Ben Carter', date: '2024-07-22', duration: 3, description: 'Cloud migration planning session', isBillable: true, status: TimeEntryStatus.Invoiced, hourlyRate: 200, taskId: 't2', userId: 'tm2' },
  { id: 'te4', contactId: 'c4', contactName: 'David Lee', date: '2024-07-22', duration: 1.5, description: 'Internal project sync', isBillable: false, status: TimeEntryStatus.Unbilled, userId: 'tm5' },
  { id: 'te5', contactId: 'c1', contactName: 'Alana Patel', date: '2024-07-23', duration: 4, description: 'Implementing feedback on mockups', isBillable: true, status: TimeEntryStatus.Unbilled, hourlyRate: 150, userId: 'tm3' },
  { id: 'te6', contactId: 'c2', contactName: 'Ben Carter', date: '2024-07-24', duration: 1, description: 'Follow up call re: migration', isBillable: true, status: TimeEntryStatus.Unbilled, hourlyRate: 200, taskId: 't9', userId: 'tm2' },
];

// Data for Company Settings
export const companyProfile: CompanyProfile = {
    name: 'Adaptive Solutions LLC',
    address: '123 Innovation Drive',
    city: 'Techville',
    state: 'CA',
    zip: '94043',
    country: 'USA',
    phone: '555-0199',
    website: 'https://adaptivesolutions.dev',
    logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500',
};

export const subscriptionInvoices: SubscriptionInvoice[] = [
    { id: 'subinv1', date: '2024-07-01', planName: 'Pro Plan', amount: 249.00, status: 'Paid' },
    { id: 'subinv2', date: '2024-06-01', planName: 'Pro Plan', amount: 249.00, status: 'Paid' },
    { id: 'subinv3', date: '2024-05-01', planName: 'Pro Plan', amount: 249.00, status: 'Paid' },
    { id: 'subinv4', date: '2024-04-01', planName: 'Standard Plan', amount: 149.00, status: 'Paid' },
];

export const featureAddons: FeatureAddon[] = [
    { id: 'addon1', name: 'Advanced AI Analytics', description: 'Unlock deeper insights with AI-powered reporting and forecasting.', monthlyPrice: 99, isEnabled: true },
    { id: 'addon2', name: 'Dedicated Legal Case Management', description: 'A full suite of tools for managing legal cases, documents, and client communication.', monthlyPrice: 79, isEnabled: true },
    { id: 'addon3', name: 'Priority Support & Onboarding', description: 'Get a dedicated account manager and priority access to our support team.', monthlyPrice: 149, isEnabled: false },
    { id: 'addon4', name: 'Client Portal Access', description: 'Allow your clients to log in to view project progress and invoices.', monthlyPrice: 59, isEnabled: false },
];

export const emailTemplates: EmailTemplate[] = [
    {
        id: 'tmpl_invoice_sent',
        name: 'New Invoice Sent',
        description: 'Sent to a client when a new invoice is created and sent.',
        isEnabled: true,
        subject: 'New Invoice {{invoice_number}} from {{company_name}}',
        body: 'Hi {{customer_name}},\n\nPlease find your new invoice attached.\n\nTotal Due: ${{invoice_total}}\nDue Date: {{invoice_due_date}}\n\nYou can view the invoice online here: {{invoice_link}}\n\nThank you for your business!\n\nBest,\nThe {{company_name}} Team',
        placeholders: ['{{customer_name}}', '{{invoice_number}}', '{{invoice_total}}', '{{invoice_due_date}}', '{{invoice_link}}', '{{company_name}}'],
    },
    {
        id: 'tmpl_invoice_due',
        name: 'Invoice Due Reminder',
        description: 'Sent to a client when their invoice is approaching its due date.',
        isEnabled: true,
        subject: 'Reminder: Invoice {{invoice_number}} is due soon',
        body: 'Hi {{customer_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for ${{invoice_total}} is due on {{invoice_due_date}}.\n\nYou can view and pay the invoice online here: {{invoice_link}}\n\nIf you have already made a payment, please disregard this email.\n\nThanks,\nThe {{company_name}} Team',
        placeholders: ['{{customer_name}}', '{{invoice_number}}', '{{invoice_total}}', '{{invoice_due_date}}', '{{invoice_link}}', '{{company_name}}'],
    },
    {
        id: 'tmpl_task_assigned',
        name: 'Task Assigned Notification',
        description: 'Sent to a team member when a new task is assigned to them.',
        isEnabled: false,
        subject: 'New Task Assigned to You: {{task_title}}',
        body: 'Hi {{staff_name}},\n\nA new task has been assigned to you:\n\n"{{task_title}}"\n\nDue Date: {{task_due_date}}\n\nPlease log in to view the details.\n\nThanks!',
        placeholders: ['{{staff_name}}', '{{task_title}}', '{{task_due_date}}'],
    }
];

export const supportTickets: SupportTicket[] = [];

export const aiInsights: AIInsight[] = [
    { id: 'ai1', emoji: '💡', text: 'Follow up with TechSolutions, their deal has been in negotiation for 15 days.', priority: 'medium' },
    { id: 'ai2', emoji: '⚠️', text: 'Task "Follow up on proposal" is overdue!', priority: 'high' },
];

// Data for SaaS Admin
export const saasSettings: SaaSSettings = {
    sendgridApiKey: "SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
};

export const saasEmailTemplates: EmailTemplate[] = [
    {
        id: 'saas_welcome',
        name: 'Welcome Email',
        description: 'Sent to the primary contact when a new company signs up.',
        isEnabled: true,
        subject: 'Welcome to AdaptiveCRM, {{company_name}}!',
        body: 'Hi {{account_owner_name}},\n\nWelcome to AdaptiveCRM! We\'re thrilled to have you on board.\n\nYour account for {{company_name}} is all set up. You can log in and start exploring all the features available to you.\n\nIf you have any questions, don\'t hesitate to reach out to our support team.\n\nBest,\nThe AdaptiveCRM Team',
        placeholders: ['{{company_name}}', '{{account_owner_name}}'],
    },
    {
        id: 'saas_support_ticket',
        name: 'Support Ticket Confirmation',
        description: 'Sent to a user after they submit a new support ticket.',
        isEnabled: true,
        subject: 'Support Ticket [{{ticket_id}}] Received',
        body: 'Hi {{user_name}},\n\nWe\'ve received your support request regarding "{{ticket_subject}}".\n\nOur team will review it and get back to you as soon as possible. A private chat channel has been created for you to communicate with our support staff.\n\nTicket ID: {{ticket_id}}\n\nThanks,\nThe AdaptiveCRM Support Team',
        placeholders: ['{{user_name}}', '{{ticket_id}}', '{{ticket_subject}}'],
    },
    {
        id: 'saas_subscription_renewal',
        name: 'Subscription Renewal Reminder',
        description: 'Sent to the account owner before their subscription renews.',
        isEnabled: true,
        subject: 'Your AdaptiveCRM Subscription is Renewing Soon',
        body: 'Hi {{account_owner_name}},\n\nThis is a friendly reminder that your subscription for the {{plan_name}} will automatically renew on {{renewal_date}} for ${{plan_amount}}.\n\nNo action is needed from you if you\'d like to continue your service. To manage your subscription, please visit your company settings.\n\nThanks for being a valued customer!\n\nThe AdaptiveCRM Team',
        placeholders: ['{{account_owner_name}}', '{{plan_name}}', '{{renewal_date}}', '{{plan_amount}}'],
    }
];
