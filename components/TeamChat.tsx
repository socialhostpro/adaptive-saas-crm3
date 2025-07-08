import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, TeamMember, MediaFile } from '../types';
import { useGlobalStore } from '../hooks/useGlobalStore';
import MediaLibraryModal from './MediaLibraryModal';

interface TeamChatProps {
    currentUser: TeamMember | undefined;
}

const TeamChat: React.FC<TeamChatProps> = ({ currentUser }) => {
    const { teamMembers } = useGlobalStore();
    
    // Mock data for team channels - in production this would come from the global store
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 'general',
            name: 'General',
            type: 'channel',
            participantIds: teamMembers.map(m => m.id),
            creatorId: 'user',
            description: 'General team discussion',
            lastMessage: 'Welcome to the team chat!',
            timestamp: new Date(),
            unreadCount: 0
        },
        {
            id: 'dev-team',
            name: 'Development Team',
            type: 'channel', 
            participantIds: ['user', 'dev-1'],
            creatorId: 'user',
            description: 'Development discussions',
            lastMessage: 'Latest deployment looks good',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            unreadCount: 2
        },
        {
            id: 'marketing',
            name: 'Marketing Team',
            type: 'channel',
            participantIds: ['user', 'marketing-1'],
            creatorId: 'user', 
            description: 'Marketing campaigns and strategies',
            lastMessage: 'New campaign is ready for review',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            unreadCount: 0
        }
    ]);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'msg-1',
            conversationId: 'general',
            senderId: 'user',
            text: 'Welcome to the team chat! 👋',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            attachment: undefined
        },
        {
            id: 'msg-2', 
            conversationId: 'general',
            senderId: 'dev-1',
            text: 'Thanks! Excited to be here 🚀',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            attachment: undefined
        },
        {
            id: 'msg-3',
            conversationId: 'dev-team',
            senderId: 'user',
            text: 'Latest deployment looks good. All tests passing ✅',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            attachment: undefined
        },
        {
            id: 'msg-4',
            conversationId: 'dev-team', 
            senderId: 'dev-1',
            text: 'Awesome! Ready for the next sprint.',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            attachment: undefined
        }
    ]);

    const [selectedConversationId, setSelectedConversationId] = useState<string>('general');
    const [newMessage, setNewMessage] = useState('');
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [view, setView] = useState<'conversations' | 'messages'>('conversations');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const conversationMessages = messages.filter(m => m.conversationId === selectedConversationId);

    // Auto scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationMessages]);

    const handleSendMessage = (text: string, attachment?: MediaFile) => {
        if ((!text.trim() && !attachment) || !selectedConversationId) return;

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId: selectedConversationId,
            senderId: currentUser?.id || 'user',
            text: text.trim(),
            timestamp: new Date(),
            attachment: attachment
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');

        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
            conv.id === selectedConversationId 
                ? { ...conv, lastMessage: text.trim() || 'Sent an attachment', timestamp: newMsg.timestamp }
                : conv
        ));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(newMessage);
        }
    };

    const getSender = (senderId: string): Partial<TeamMember> => {
        return teamMembers.find(m => m.id === senderId) || { 
            name: senderId === 'user' ? 'You' : 'Unknown User', 
            avatarUrl: `https://picsum.photos/seed/${senderId}/100/100` 
        };
    };

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex bg-white dark:bg-gray-900">
            {/* Conversations Sidebar */}
            <div className={`${view === 'messages' ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-200 dark:border-gray-700`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Chat</h2>
                        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => {
                                setSelectedConversationId(conv.id);
                                setView('messages');
                            }}
                            className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                                selectedConversationId === conv.id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {conv.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            #{conv.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTime(conv.timestamp)}
                                    </span>
                                    {conv.unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            <div className={`${view === 'conversations' ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setView('conversations')}
                                        className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {selectedConversation.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            #{selectedConversation.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedConversation.participantIds.length} members
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                            {conversationMessages.map(message => {
                                const sender = getSender(message.senderId);
                                const isCurrentUser = message.senderId === currentUser?.id;

                                return (
                                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <img
                                                src={sender.avatarUrl || `https://picsum.photos/seed/${message.senderId}/100/100`}
                                                alt={sender.name}
                                                className="w-8 h-8 rounded-full flex-shrink-0"
                                            />
                                            <div className={`px-4 py-2 rounded-lg ${
                                                isCurrentUser 
                                                    ? 'bg-primary-600 text-white' 
                                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                            }`}>
                                                {!isCurrentUser && (
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                        {sender.name}
                                                    </p>
                                                )}
                                                <p className="text-sm">{message.text}</p>
                                                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {formatTime(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={() => setIsMediaModalOpen(true)}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <div className="flex-1">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={`Message #${selectedConversation.name}`}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        rows={1}
                                    />
                                </div>
                                <button
                                    onClick={() => handleSendMessage(newMessage)}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversation selected</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a channel to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectFile={(file) => {
                    handleSendMessage('', file);
                    setIsMediaModalOpen(false);
                }}
            />
        </div>
    );
};

export default TeamChat;
