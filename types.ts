export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Lost = 'Lost',
  Converted = 'Converted',
}

export interface SocialNetwork {
  type: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'website' | string;
  url: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string; // Use as business/company
  avatarUrl: string;
  phone?: string;
  address?: string;
  created_by?: string;
  // Assignment fields
  projectId?: string;
  opportunityId?: string;
  leadId?: string;
  caseId?: string;
  info?: string | null; // Added info field for UI/DB consistency
  socialNetworks?: SocialNetwork[]; // Social links
  relatedContactIds?: string[]; // Related contacts (family, legal, etc.)
  syncStatus?: 'pending' | 'synced' | 'error'; // For optimistic/offline sync
}

export interface ContactWithSync extends Contact {
  syncStatus?: 'pending' | 'synced' | 'error';
  _pendingDelete?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  score: number;
  status: LeadStatus;
  lastContacted: string;
  contactId?: string;
  // For card UI compatibility:
  avatarUrl?: string;
  title?: string;
  phone?: string;
  opportunityId?: string;
  address?: string;
  source?: string; // Added source field for lead origin
  info?: string | null; // Q&A JSON from web/phone forms
}

export enum OpportunityStage {
  Prospecting = 'Prospecting',
  Qualification = 'Qualification',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'Closed - Won',
  ClosedLost = 'Closed - Lost',
}

export enum OpportunityType {
  Sales = 'Sales',
  Project = 'Project',
  Case = 'Case',
  License = 'License',
}

export interface Opportunity {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  value: number;
  stage: OpportunityStage;
  // New fields
  type: OpportunityType;
  details?: string;
  notes?: string;
  startDate: string; // ISO string
  dueDate: string; // ISO string (was closeDate)
  // Deprecated: keep for backward compatibility
  /** @deprecated Use dueDate instead */
  closeDate?: string;
  assigneeId?: string;
  syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
}

export interface OpportunityWithSync extends Opportunity {
  syncStatus?: 'pending' | 'synced' | 'error';
}

export enum ActivityType {
  Call,
  Email,
  Meeting,
  Note
}

export interface Activity {
    id: string;
    type: ActivityType;
    contactId: string;
    contactName: string;
    summary: string;
    timestamp: Date;
    duration?: number; // in minutes, for calls
    outcome?: string; // for calls
    subject?: string; // for emails
    location?: string; // for meetings
    endTime?: Date; // for meetings
    leadId?: string;
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Task {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string;
  assigneeId?: string;
  
  // Linking fields
  leadId?: string;
  opportunityId?: string;
  projectId?: string;
  caseId?: string;
  
  // Feature fields
  mediaFileIds?: string[];
  timeEntryIds?: string[];
}

export type TaskWithSync = Task & { syncStatus: 'synced' | 'pending' | 'error'; _pendingDelete?: boolean };

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  PartiallyPaid = 'Partially Paid',
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'Credit Card' | 'Bank Transfer' | 'Other';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contactId: string;
  contactName: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems?: LineItem[];
  payments: Payment[];
  syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
  _pendingDelete?: boolean; // For deletion tracking
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
  _pendingDelete?: boolean; // For deletion tracking
}


// New Types for Team, Chat, and Estimates

export enum TeamMemberRole {
    Admin = 'Admin',
    Manager = 'Manager',
    Sales = 'Sales Rep',
    SuperAdmin = 'Super Admin',
}

export enum TeamMemberStatus {
    Online = 'Online',
    Away = 'Away',
    Offline = 'Offline',
}

export interface VoiceSettings {
    voiceURI: string;
    rate: number;
    pitch: number;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: TeamMemberRole;
    avatarUrl: string;
    status: TeamMemberStatus;
    lastSeen: string;
    phone?: string;
    hireDate?: string;
    voiceSettings?: VoiceSettings;
}

export enum EstimateStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Accepted = 'Accepted',
    Declined = 'Declined',
    Invoiced = 'Invoiced',
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  contactId: string;
  contactName: string;
  amount: number;
  issueDate: string;
  expiryDate: string;
  status: EstimateStatus;
  lineItems?: LineItem[];
  syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
  _pendingDelete?: boolean; // For deletion tracking
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string; // 'user' for logged-in user, team member id otherwise
    text: string;
    timestamp: Date;
    parentId?: string; // For threading
    attachment?: MediaFile;
}

export interface Conversation {
    id: string;
    type: 'channel' | 'dm';
    name: string; // Channel name like '#q3-sales-push' or DM partner's name
    participantIds: string[];
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    avatarUrl?: string; // For DMs or channel icon
    description: string; // e.g., "3 Members" or "Marketing Director"
    linkedRecord?: { // For CRM integration
        type: 'Opportunity' | 'Contact';
        name: string;
    };
    creatorId?: string; // For channel management
    ticketId?: string; // For support ticket integration
}

export enum TimeEntryStatus {
  Unbilled = 'Unbilled',
  Invoiced = 'Invoiced',
}

export interface TimeEntry {
  id: string;
  contactId: string;
  contactName: string;
  date: string;
  duration: number; // in hours
  description: string;
  isBillable: boolean;
  status: TimeEntryStatus;
  hourlyRate?: number;
  taskId?: string;
  userId?: string;
}

export enum ProjectStatus {
    NotStarted = 'Not Started',
    InProgress = 'In Progress',
    OnHold = 'On Hold',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
}

export interface Project {
    id: string;
    name: string;
    description: string;
    contactId: string;
    contactName: string;
    deadline: string;
    budget: number;
    status: ProjectStatus;
    mediaFileIds?: string[];
}

export interface ProjectTask {
    id: string;
    projectId: string;
    title: string;
    assigneeId: string; // From TeamMember id
    dueDate: string;
    status: TaskStatus;
}

export type MediaFileType = 'image' | 'video' | 'document';

export interface MediaFile {
    id: string;
    name: string;
    url: string;
    type: MediaFileType;
    uploadedAt: Date;
    // AI-generated description and tags
    aiDescription?: string;
    aiTags?: string[];
    // Category for gallery organization
    category?: 'mugshot' | 'crime_scene' | 'evidence' | 'social_media' | 'other';
    // Editable notes/evidence field
    notes?: string;
}

// New Types for Case Management
export enum CaseStatus {
    Intake = 'Intake',
    Discovery = 'Discovery',
    InTrial = 'In Trial',
    OnHold = 'On Hold',
    ClosedWon = 'Closed - Won',
    ClosedLost = 'Closed - Lost',
}

export interface CaseNote {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
}

export interface CaseHistoryEntry {
    id: string;
    type: 'created' | 'updated' | 'status' | 'note' | 'task' | 'file' | 'custom';
    message: string;
    userId: string;
    userName: string;
    timestamp: string;
}

export interface Case {
    id: string;
    name: string;
    caseNumber: string;
    contactId: string;
    contactName: string;
    attorneyId: string; // From TeamMember id
    status: CaseStatus;
    openDate: string;
    closeDate?: string;
    description: string;
    mediaFileIds?: string[];
    // New: AI-generated summary of all images/videos
    mediaSummary?: string;
    // New fields for richer case management
    assigned?: string; // TeamMember id or name
    contact?: string; // Contact id or name
    opportunity?: string; // Opportunity id or name (opposing party)
    consual?: string; // Consual party (string)
    defendant?: string; // Defendant party (string)
    judge?: string; // Judge name
    caseType?: string; // e.g. 'Civil', 'Criminal', etc.
    // New: Defendant and Opposition contact info
    defendantContactName?: string;
    defendantPhone?: string;
    defendantEmail?: string;
    defendantAddress?: string;
    oppositionContactName?: string;
    oppositionPhone?: string;
    oppositionEmail?: string;
    oppositionAddress?: string;
    // New: List of charges for the case
    charges?: string[];
    // Notes and audit trail
    notes?: CaseNote[];
    history?: CaseHistoryEntry[];
    syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
    _pendingDelete?: boolean; // For deletion tracking
}

export interface CaseTask {
    id: string;
    caseId: string;
    title: string;
    assigneeId: string; // From TeamMember id
    dueDate: string;
    status: TaskStatus;
}


export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'invoice' | 'estimate' | 'opportunity' | 'project' | 'meeting' | 'case';
  link: string;
  data: Task | Invoice | Estimate | Opportunity | Project | Activity | Case;
}

export interface Widget {
    id: string;
    name: string;
    description: string;
    component: string;
    minW?: number;
    minH?: number;
}

export type Layout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

// Types for Company Settings
export interface CompanyProfile {
    id?: string; // Add id for multi-tenant support
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    website: string;
    logoUrl?: string;
}

// Template Assignment Types
export interface CompanyTemplateAssignment {
    id: string;
    companyId: string;
    templateId: string;
    templateName: string;
    templateType: 'welcome' | 'newsletter' | 'lead_notification' | 'custom';
    isActive: boolean;
    assignedAt: string;
    assignedBy: string;
}

export interface TemplateWithCompany {
    id: string;
    name: string;
    generation: 'legacy' | 'dynamic';
    updated_at: string;
    companyAssignments?: CompanyTemplateAssignment[];
    assignedCompanies?: CompanyProfile[];
}

export interface SubscriptionInvoice {
    id: string;
    date: string;
    planName: string;
    amount: number;
    status: 'Paid' | 'Failed';
}

export interface FeatureAddon {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    isEnabled: boolean;
}

export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    subject: string;
    body: string;
    placeholders: string[];
}

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    submitterId: string;
    createdAt: Date;
    status: 'Open' | 'Resolved' | 'Closed';
}

export interface AIInsight {
  id: string;
  emoji: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  syncStatus?: 'pending' | 'synced' | 'error'; // For offline/online sync
  _pendingDelete?: boolean; // For deletion tracking
}

export interface SaaSSettings {
    sendgridApiKey: string;
}