// Mock data for CommunicationsPlatform integration
import { Conversation, ChatMessage, TeamMember, MediaFile, SupportTicket, TeamMemberRole, TeamMemberStatus } from '../types';

export const mockTeamMembers: TeamMember[] = [
  { id: 'user', name: 'You', email: 'you@example.com', role: TeamMemberRole.SuperAdmin, avatarUrl: 'https://picsum.photos/seed/user/100/100', status: TeamMemberStatus.Online, lastSeen: new Date().toISOString() },
  { id: 'alice', name: 'Alice', email: 'alice@example.com', role: TeamMemberRole.Manager, avatarUrl: 'https://picsum.photos/seed/alice/100/100', status: TeamMemberStatus.Online, lastSeen: new Date().toISOString() },
  { id: 'bob', name: 'Bob', email: 'bob@example.com', role: TeamMemberRole.Sales, avatarUrl: 'https://picsum.photos/seed/bob/100/100', status: TeamMemberStatus.Away, lastSeen: new Date().toISOString() },
];

export const mockConversations: Conversation[] = [
  { id: 'c1', type: 'channel', name: 'General', participantIds: ['user', 'alice', 'bob'], lastMessage: 'Welcome to General!', timestamp: new Date(), unreadCount: 0, description: '3 Members' },
  { id: 'c2', type: 'dm', name: 'Alice', participantIds: ['user', 'alice'], lastMessage: 'Hi Alice!', timestamp: new Date(), unreadCount: 1, description: 'Manager' },
];

export const mockMessages: ChatMessage[] = [
  { id: 'm1', conversationId: 'c1', senderId: 'alice', text: 'Hello team!', timestamp: new Date() },
  { id: 'm2', conversationId: 'c1', senderId: 'user', text: 'Hi Alice!', timestamp: new Date() },
  { id: 'm3', conversationId: 'c2', senderId: 'user', text: 'Hi Alice!', timestamp: new Date() },
];

export const mockMediaFiles: MediaFile[] = [
  { id: 'mf1', name: 'Logo.png', url: 'https://picsum.photos/seed/mf1/800/600', type: 'image', uploadedAt: new Date() },
];

export const mockSupportTickets: SupportTicket[] = [
  { id: 't1', subject: 'Login Issue', status: 'Open', createdAt: new Date(), submitterId: 'bob', description: 'Cannot login.' },
];
