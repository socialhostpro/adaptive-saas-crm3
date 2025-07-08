import React, { useEffect } from 'react';
import Card from './shared/Card';
import Chat from './Chat';
import EmailModal from './EmailModal';
// Placeholder imports for new integrations
// import WebForms from './WebForms';
// import Texting from './Texting';
// import AIBots from './AIBots';
import { mockConversations, mockMessages, mockTeamMembers, mockMediaFiles, mockSupportTickets } from './CommunicationsPlatform.mockdata';

// Main Communications Platform Page
const CommunicationsPlatform: React.FC = () => {
  // State and handlers for each channel would be managed here or via context
  // For now, just show a tabbed interface for each channel type
  const [tab, setTab] = React.useState('chat');
  // Demo state for Chat
  const [conversations, setConversations] = React.useState(mockConversations);
  const [messages, setMessages] = React.useState(mockMessages);
  const [supportTickets, setSupportTickets] = React.useState(mockSupportTickets);
  const [mediaFiles] = React.useState(mockMediaFiles);
  const [teamMembers] = React.useState(mockTeamMembers);
  const currentUser = teamMembers[0];
  const appContext = {};

  useEffect(() => {
    if (conversations.length === 0) setConversations(mockConversations);
    if (messages.length === 0) setMessages(mockMessages);
    if (teamMembers.length === 0) teamMembers.push(...mockTeamMembers);
    if (mediaFiles.length === 0) mediaFiles.push(...mockMediaFiles);
    if (supportTickets.length === 0) setSupportTickets(mockSupportTickets);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-4 space-y-6 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Communications Platform</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('chat')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'chat' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Chat</button>
        <button onClick={() => setTab('email')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'email' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Email</button>
        <button onClick={() => setTab('webforms')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'webforms' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Web Forms</button>
        <button onClick={() => setTab('texting')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'texting' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Texting</button>
        <button onClick={() => setTab('ai')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'ai' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>AI Bots</button>
      </div>
      <Card className="!p-0">
        {tab === 'chat' && teamMembers.length > 0 && conversations.length > 0 && messages.length > 0 && (
          <Chat
            conversations={conversations}
            setConversations={setConversations}
            messages={messages}
            setMessages={setMessages}
            teamMembers={teamMembers}
            mediaFiles={mediaFiles}
            supportTickets={supportTickets}
            setSupportTickets={setSupportTickets}
            currentUser={currentUser}
            appContext={appContext}
          />
        )}
        {tab === 'chat' && (!teamMembers.length || !conversations.length || !messages.length) && (
          <div className="p-8 text-center text-gray-500">No chat data available.</div>
        )}
        {tab === 'email' && (
          <EmailModal
            isOpen={true}
            onClose={() => {}}
            recipientName={teamMembers[1]?.name || 'Recipient'}
            recipientEmail={teamMembers[1]?.email || 'recipient@example.com'}
          />
        )}
        {tab === 'webforms' && <div className="p-8 text-center text-gray-500">Web Forms integration coming soon...</div>}
        {tab === 'texting' && <div className="p-8 text-center text-gray-500">Texting integration coming soon...</div>}
        {tab === 'ai' && (
          <div className="p-8 text-center text-gray-500 space-y-4">
            <div>AI Phone Bot integration coming soon...</div>
            <div>AI Website Chat Bot integration coming soon...</div>
            <div>AI Form Bot integration coming soon...</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CommunicationsPlatform;
