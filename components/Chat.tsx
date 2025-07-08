import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, TeamMember, MediaFile, TeamMemberRole, SupportTicket } from '../types';
import Card from './shared/Card';
import MediaLibraryModal from './MediaLibraryModal';
import CreateChannelModal from './CreateChannelModal';
import NewDmModal from './NewDmModal';
import ChannelDetailsModal from './ChannelDetailsModal';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface ChatProps {
    conversations: Conversation[],
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
    messages: ChatMessage[],
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    teamMembers: TeamMember[],
    mediaFiles: MediaFile[],
    supportTickets: SupportTicket[],
    setSupportTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
    currentUser: TeamMember | undefined;
    appContext: any;
}

// Helper to find sender info
const getSender = (senderId: string, teamMembers: TeamMember[]): Partial<TeamMember> => {
    if (senderId === 'user') return teamMembers.find(m => m.id === 'user') || { name: 'You', avatarUrl: 'https://picsum.photos/seed/user/100/100' };
    return teamMembers.find(m => m.id === senderId) || { name: "Unknown User", avatarUrl: "https://picsum.photos/seed/unknown/100/100"};
};

// Helper to parse message text for rich content
const formatMessageText = (text: string) => {
    const boldRegex = /\*(.*?)\*/g;
    const italicRegex = /_(.*?)_/g;
    const mentionRegex = /@(\w+\s\w+|\w+)/g;

    const parts = text
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(italicRegex, '<em>$1</em>')
      .replace(mentionRegex, '<span class="bg-primary-200 dark:bg-primary-700/50 text-primary-800 dark:text-primary-300 font-semibold rounded px-1 py-0.5">@$1</span>')
      .split(/(<[^>]+>)/g)
      .filter(part => part);

    return <p className="text-sm" dangerouslySetInnerHTML={{ __html: parts.join('') }} />;
};


// Main Chat Component
const Chat: React.FC<ChatProps> = (props) => {
    const { conversations, setConversations, messages, setMessages, teamMembers, mediaFiles, supportTickets, setSupportTickets, currentUser, appContext } = props;
    const { sessionId } = useAuth();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);
    const [view, setView] = useState<'conversations' | 'messages'>('conversations');
    const [isTyping, setIsTyping] = useState(false);
    const [isCreateChannelOpen, setCreateChannelOpen] = useState(false);
    const [isNewDmOpen, setNewDmOpen] = useState(false);
    const [isChannelDetailsOpen, setChannelDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isTyping, selectedConversationId]);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setView('messages');
            } else {
                 setView('conversations');
                 if (selectedConversationId) {
                     setSelectedConversationId(null);
                 }
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const { data: convos, error: convosError } = await supabase.from('conversations').select('*');
            const { data: msgs, error: msgsError } = await supabase.from('chat_messages').select('*');
            if (convosError || msgsError) {
                setError('Failed to load chat data');
                setConversations([]);
                setMessages([]);
            } else {
                setConversations(convos || []);
                setMessages(msgs || []);
            }
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleConversationSelect = (convId: string) => {
        setSelectedConversationId(convId);
        if (window.innerWidth < 768) {
            setView('messages');
        }
    };
    
    // --- Refactored: Send Message ---
    const handleSendMessage = async (text: string, attachment?: MediaFile) => {
        if ((!text.trim() && !attachment) || !selectedConversationId) return;
        setError(null);
        setLoading(true);
        const newMessage = {
            conversationId: selectedConversationId,
            senderId: currentUser?.id || 'user',
            text,
            timestamp: new Date().toISOString(),
            attachment: attachment ? JSON.stringify(attachment) : null,
        };
        const { data, error: insertError } = await supabase.from('chat_messages').insert([newMessage]).select();
        if (insertError) {
            setError('Failed to send message');
        } else if (data && data[0]) {
            setMessages(prev => [...prev, { ...data[0], attachment: attachment }]);
        }
        setLoading(false);
    };

    // --- Refactored: Create Channel ---
    const handleCreateChannel = async (channelData: {name: string, description: string, participantIds: string[]}) => {
        setError(null);
        setLoading(true);
        const newChannel = {
            ...channelData,
            type: 'channel',
            creatorId: currentUser?.id || 'user',
            lastMessage: 'Channel created',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
        };
        const { data, error: insertError } = await supabase.from('conversations').insert([newChannel]).select();
        if (insertError) {
            setError('Failed to create channel');
        } else if (data && data[0]) {
            setConversations(prev => [data[0], ...prev]);
            setCreateChannelOpen(false);
            handleConversationSelect(data[0].id);
        }
        setLoading(false);
    };

    // --- Refactored: Start DM ---
    const handleStartDm = async (memberId: string) => {
        setError(null);
        setLoading(true);
        const existingDm = conversations.find(c => c.type === 'dm' && c.participantIds.includes(memberId) && c.participantIds.includes(currentUser?.id || 'user'));
        if (existingDm) {
            handleConversationSelect(existingDm.id);
        } else {
            const member = teamMembers.find(m => m.id === memberId);
            if (!member) return;
            const newDm = {
                type: 'dm',
                name: member.name,
                participantIds: [currentUser?.id || 'user', memberId],
                description: member.role,
                avatarUrl: member.avatarUrl,
                lastMessage: 'Conversation started',
                timestamp: new Date().toISOString(),
                unreadCount: 0,
            };
            const { data, error: insertError } = await supabase.from('conversations').insert([newDm]).select();
            if (insertError) {
                setError('Failed to start DM');
            } else if (data && data[0]) {
                setConversations(prev => [data[0], ...prev]);
                handleConversationSelect(data[0].id);
            }
        }
        setNewDmOpen(false);
        setLoading(false);
    };

    // --- Refactored: Update Channel ---
    const handleUpdateChannel = async (updatedChannel: Conversation) => {
        setError(null);
        setLoading(true);
        const { data, error: updateError } = await supabase.from('conversations').update(updatedChannel).eq('id', updatedChannel.id).select();
        if (updateError) {
            setError('Failed to update channel');
        } else if (data && data[0]) {
            setConversations(prev => prev.map(c => c.id === updatedChannel.id ? data[0] : c));
        }
        setLoading(false);
    };

    // --- Refactored: Delete Channel ---
    const handleDeleteChannel = async (channelId: string) => {
        setError(null);
        setLoading(true);
        const { error: deleteError } = await supabase.from('conversations').delete().eq('id', channelId);
        if (deleteError) {
            setError('Failed to delete channel');
        } else {
            setConversations(prev => prev.filter(c => c.id !== channelId));
            setChannelDetailsOpen(false);
            setSelectedConversationId(null);
        }
        setLoading(false);
    };

    // --- Refactored: Leave Channel ---
    const handleLeaveChannel = async (channelId: string) => {
        const channel = conversations.find(c => c.id === channelId);
        if (!channel || !sessionId) return;
        const newParticipants = channel.participantIds.filter(id => id !== sessionId);
        if (newParticipants.length === 0) {
            await handleDeleteChannel(channelId);
        } else {
            await handleUpdateChannel({ ...channel, participantIds: newParticipants });
            setChannelDetailsOpen(false);
            setSelectedConversationId(null);
        }
    };
    
    const handleResolveTicket = (ticketId: string | undefined) => {
      if (!ticketId) return;
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? {...t, status: 'Resolved'} : t));
      // Optionally archive the conversation
      const conv = conversations.find(c => c.ticketId === ticketId);
      if (conv) {
        setConversations(prev => prev.map(c => c.id === conv.id ? {...c, description: `${c.description} (Resolved)`} : c))
      }
      alert(`Ticket ${ticketId} has been resolved.`);
    }

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const currentMessages = messages.filter(m => m.conversationId === selectedConversationId);
    
    const threads = currentMessages.reduce<{[key: string]: ChatMessage[]}>((acc, msg) => {
        const parentId = msg.parentId || msg.id;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(msg);
        return acc;
    }, {});
    
    const sortedThreadKeys = Object.keys(threads).sort((a,b) => threads[a][0].timestamp.getTime() - threads[b][0].timestamp.getTime());

    const channels = conversations.filter(c => c.type === 'channel' && !c.ticketId);
    const dms = conversations.filter(c => c.type === 'dm');
    const ticketConvos = conversations.filter(c => c.ticketId && supportTickets.find(t => t.id === c.ticketId)?.status === 'Open');
    
    const conversationGroups = [
        ...(currentUser?.role === TeamMemberRole.SuperAdmin ? [{ title: 'Support Tickets', convos: ticketConvos }] : []),
        { title: 'Channels', convos: channels },
        { title: 'Direct Messages', convos: dms }
    ];

    const conversationListClass = `
      ${view === 'messages' && selectedConversationId ? 'hidden' : 'flex'} 
      md:flex flex-col w-full md:w-1/3 xl:w-1/4 bg-gray-50 dark:bg-gray-800/50 
      border-r border-gray-200 dark:border-gray-700
    `;

    const messageViewClass = `
      ${view === 'conversations' && !selectedConversationId ? 'hidden' : 'flex'}
      md:flex flex-col flex-grow w-full md:w-auto bg-white dark:bg-gray-800
    `;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Collaboration Hub</h1>
            </div>
            <Card className="flex-grow !p-0 flex overflow-hidden">
                {/* Conversation List */}
                <div className={conversationListClass}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <input type="text" placeholder="Search chats..." className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        {conversationGroups.map(group => (
                            group.convos.length > 0 && <div key={group.title}>
                                <div className="flex justify-between items-center p-4 pb-1">
                                    <h2 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{group.title}</h2>
                                    {group.title !== 'Support Tickets' && (
                                        <button onClick={() => group.title === 'Channels' ? setCreateChannelOpen(true) : setNewDmOpen(true)} className="text-gray-400 hover:text-primary-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    )}
                                </div>
                                <ul>
                                    {group.convos.map(conv => (
                                         <li key={conv.id} onClick={() => handleConversationSelect(conv.id)}
                                            className={`p-3 m-2 rounded-lg cursor-pointer flex items-center border-l-4 ${selectedConversationId === conv.id ? 'bg-primary-50 dark:bg-gray-700/50 border-primary-500' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/30'}`}>
                                            {conv.type === 'channel' ? <span className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">#</span> : <img src={conv.avatarUrl} alt={conv.name} className="w-10 h-10 rounded-full mr-3"/>}
                                            <div className="flex-grow overflow-hidden">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{conv.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{conv.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                                <div className="flex justify-between items-baseline">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                                    {conv.unreadCount > 0 && <span className="bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{conv.unreadCount}</span>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main chat window */}
                {selectedConversation ? (
                    <div className={messageViewClass}>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center">
                                <button onClick={() => setView('conversations')} className="mr-3 md:hidden text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                {selectedConversation.type === 'channel' ? <span className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">#</span> : <img src={selectedConversation.avatarUrl} alt={selectedConversation.name} className="w-10 h-10 rounded-full mr-3"/>}
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedConversation.description}</p>
                                </div>
                            </div>
                           <div className="flex items-center gap-2">
                             {selectedConversation.ticketId && currentUser?.role === TeamMemberRole.SuperAdmin && (
                                <button onClick={() => handleResolveTicket(selectedConversation.ticketId)} className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-md hover:bg-green-200">Resolve Ticket</button>
                             )}
                              {selectedConversation.type === 'channel' && !selectedConversation.ticketId && (
                                <button onClick={() => setChannelDetailsOpen(true)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                </button>
                              )}
                           </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-6 overflow-y-auto space-y-6">
                            {sortedThreadKeys.map(key => (
                                <div key={key}>
                                    {threads[key].filter(msg => !msg.parentId).map(parentMsg => (
                                        <MessageBubble key={parentMsg.id} message={parentMsg} teamMembers={teamMembers} />
                                    ))}
                                    {threads[key].some(msg => msg.parentId) && (
                                        <div className="pl-8 border-l-2 border-gray-200 dark:border-gray-700 ml-5 mt-2 space-y-4">
                                             {threads[key].filter(msg => msg.parentId).map(replyMsg => (
                                                 <MessageBubble key={replyMsg.id} message={replyMsg} teamMembers={teamMembers} isReply/>
                                             ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <TypingIndicator conversation={selectedConversation} teamMembers={teamMembers} />}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Message Input */}
                         <MessageInput onSend={handleSendMessage} mediaFiles={mediaFiles} />
                    </div>
                ) : (
                    <div className="hidden md:flex flex-grow items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <ChatIcon />
                            <p className="mt-2 text-lg">Select a conversation</p>
                            <p className="text-sm">Choose from existing channels and DMs, or start a new one.</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
        
        <CreateChannelModal
            isOpen={isCreateChannelOpen}
            onClose={() => setCreateChannelOpen(false)}
            onCreate={handleCreateChannel}
            teamMembers={teamMembers}
            currentUser={currentUser}
        />
        <NewDmModal
            isOpen={isNewDmOpen}
            onClose={() => setNewDmOpen(false)}
            teamMembers={teamMembers}
            onStartDm={handleStartDm}
        />
        <ChannelDetailsModal
            isOpen={isChannelDetailsOpen && selectedConversation?.type === 'channel'}
            onClose={() => setChannelDetailsOpen(false)}
            channel={selectedConversation || null}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onUpdate={handleUpdateChannel}
            onLeave={handleLeaveChannel}
            onDelete={handleDeleteChannel}
        />
        </>
    );
};

// Sub-components
const MessageBubble: React.FC<{message: ChatMessage; teamMembers: TeamMember[]; isReply?: boolean}> = ({ message, teamMembers, isReply }) => {
    const sender = getSender(message.senderId, teamMembers);
    const isUser = message.senderId === 'user';
    
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
             {!isUser && <img src={sender.avatarUrl} alt={sender.name} className="w-10 h-10 rounded-full"/>}
             <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && !isReply && <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{sender.name}</p>}
                <div className={`p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-xl ${isUser ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                   {message.attachment && <Attachment attachment={message.attachment} />}
                   {message.text && formatMessageText(message.text)}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
             </div>
             {isUser && <div className="w-10 h-10" />}
        </div>
    );
};

const Attachment: React.FC<{attachment: ChatMessage['attachment']}> = ({ attachment }) => {
    if (!attachment) return null;
    if (attachment.type === 'image') {
        return <img src={attachment.url} alt={attachment.name} className="rounded-lg mb-2 max-w-xs cursor-pointer"/>;
    }
    return (
        <div className="flex items-center bg-gray-200/50 dark:bg-gray-900/30 p-2 rounded-lg mb-2 border border-gray-300 dark:border-gray-600">
            <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="ml-3">
                <a href={attachment.url} className="text-sm font-semibold hover:underline">{attachment.name}</a>
                <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)}</p>
            </div>
        </div>
    );
};

const MessageInput: React.FC<{onSend: (text: string, attachment?: MediaFile) => void, mediaFiles: MediaFile[]}> = ({ onSend, mediaFiles }) => {
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState<MediaFile | undefined>();
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(text, attachment);
        setText('');
        setAttachment(undefined);
    };
    
    const handleSelectFile = (file: MediaFile) => {
        setAttachment(file);
        setIsMediaLibraryOpen(false);
    };

    return (
        <>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
            {attachment && (
                <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/30 p-2 rounded-lg mb-2 border border-primary-200 dark:border-primary-700">
                    <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" clipRule="evenodd" /></svg>
                        <span>{attachment.name}</span>
                    </div>
                    <button onClick={() => setAttachment(undefined)} className="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200">&times;</button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500">
                <button type="button" onClick={() => setIsMediaLibraryOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <input type="text" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} className="flex-grow bg-transparent px-3 py-2 focus:outline-none" />
                <button type="submit" className="bg-primary-600 text-white rounded-md p-2 hover:bg-primary-700 transition-colors duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed" disabled={!text.trim() && !attachment}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
         <MediaLibraryModal
            isOpen={isMediaLibraryOpen}
            onClose={() => setIsMediaLibraryOpen(false)}
            mediaFiles={mediaFiles}
            onSelectFile={handleSelectFile}
        />
        </>
    );
};

const TypingIndicator: React.FC<{conversation: Conversation, teamMembers: TeamMember[]}> = ({ conversation, teamMembers }) => {
    const typingUser = getSender(conversation.participantIds.find(p => p !== 'user')!, teamMembers);
    return (
        <div className="flex items-end gap-3">
             <img src={typingUser.avatarUrl} alt={typingUser.name} className="w-10 h-10 rounded-full"/>
             <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.4s'}}></span>
                </div>
            </div>
        </div>
    );
};

function ChatIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;}


export default Chat;