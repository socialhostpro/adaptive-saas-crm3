import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TeamMember, Conversation } from '../types';
import { useGlobalStore } from '../hooks/useGlobalStore';
import FileUploadModal from './FileUploadModal';

interface ChatPopupProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: TeamMember | undefined;
    onPopoutDM?: (conversationId: string, participant: TeamMember) => void;
}

// Helper function to get unread message count
export const getUnreadMessageCount = (messages: ChatMessage[], currentUserId: string): number => {
    return messages.filter(msg => 
        msg.senderId !== currentUserId && 
        new Date(msg.timestamp) > new Date(Date.now() - 1000 * 60 * 30) // Messages from last 30 minutes
    ).length;
};

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose, currentUser, onPopoutDM }) => {
    const { teamMembers } = useGlobalStore();
    
    // Available conversations/channels
    const [conversations] = useState<Conversation[]>([
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
            name: 'Development',
            type: 'channel',
            participantIds: ['user', 'dev-1'],
            creatorId: 'user',
            description: 'Development discussions',
            lastMessage: 'Latest deployment looks good',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            unreadCount: 1
        },
        // DM conversations
        {
            id: 'dm-tm4',
            name: 'Hugh Jackman',
            type: 'dm',
            participantIds: ['user', 'tm4'],
            creatorId: 'user',
            description: '',
            lastMessage: 'Thanks for the help!',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            unreadCount: 2
        },
        {
            id: 'dm-tm3',
            name: 'Blake Lively',
            type: 'dm',
            participantIds: ['user', 'tm3'],
            creatorId: 'user',
            description: '',
            lastMessage: 'Let\'s discuss the campaign',
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            unreadCount: 0
        }
    ]);

    const [activeConversationId, setActiveConversationId] = useState('general');
    const [showConversationsList, setShowConversationsList] = useState(false);
    
    // Mock messages for different conversations
    const [allMessages] = useState<{ [key: string]: ChatMessage[] }>({
        'general': [
            {
                id: 'general-msg-1',
                conversationId: 'general',
                senderId: 'dev-1',
                text: 'Hey team, quick question about the new feature?',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                attachment: undefined
            },
            {
                id: 'general-msg-2',
                conversationId: 'general',
                senderId: 'user',
                text: 'Sure, what\'s up?',
                timestamp: new Date(Date.now() - 1000 * 60 * 3),
                attachment: undefined
            }
        ],
        'dev-team': [
            {
                id: 'dev-msg-1',
                conversationId: 'dev-team',
                senderId: 'dev-1',
                text: 'The new API endpoint is ready for testing',
                timestamp: new Date(Date.now() - 1000 * 60 * 10),
                attachment: undefined
            }
        ],
        'dm-dev-1': [
            {
                id: 'dm-dev-msg-1',
                conversationId: 'dm-dev-1',
                senderId: 'dev-1',
                text: 'Can you review my PR when you have a moment?',
                timestamp: new Date(Date.now() - 1000 * 60 * 20),
                attachment: undefined
            },
            {
                id: 'dm-dev-msg-2',
                conversationId: 'dm-dev-1',
                senderId: 'user',
                text: 'Absolutely! I\'ll take a look now',
                timestamp: new Date(Date.now() - 1000 * 60 * 18),
                attachment: undefined
            }
        ],
        'dm-marketing-1': [
            {
                id: 'dm-marketing-msg-1',
                conversationId: 'dm-marketing-1',
                senderId: 'marketing-1',
                text: 'The new campaign materials are ready for your review',
                timestamp: new Date(Date.now() - 1000 * 60 * 50),
                attachment: undefined
            }
        ]
    });

    const [messages, setMessages] = useState<ChatMessage[]>(allMessages[activeConversationId] || []);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update messages when conversation changes
    useEffect(() => {
        setMessages(allMessages[activeConversationId] || []);
    }, [activeConversationId, allMessages]);

    // Auto scroll to bottom of messages
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const newMsg: ChatMessage = {
            id: `msg-${activeConversationId}-${Date.now()}`,
            conversationId: activeConversationId,
            senderId: currentUser?.id || 'user',
            text: newMessage.trim(),
            timestamp: new Date(),
            attachment: undefined
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getSender = (senderId: string): Partial<TeamMember> => {
        return teamMembers.find(m => m.id === senderId) || { 
            name: senderId === 'user' ? 'You' : 'Team Member', 
            avatarUrl: `https://picsum.photos/seed/${senderId}/100/100` 
        };
    };

    const getActiveConversation = () => {
        return conversations.find(c => c.id === activeConversationId);
    };

    const handleConversationSwitch = (conversationId: string) => {
        setActiveConversationId(conversationId);
        setShowConversationsList(false);
    };

    const handlePopoutDM = () => {
        const conversation = getActiveConversation();
        if (conversation && conversation.type === 'dm' && onPopoutDM) {
            const participant = teamMembers.find(m => 
                conversation.participantIds.includes(m.id) && m.id !== currentUser?.id
            );
            if (participant) {
                onPopoutDM(conversation.id, participant);
            }
        }
    };

    // File handling functions
    const handleFileSelect = (file: File) => {
        handleSendFileMessage(file);
    };

    const handleSendFileMessage = async (file: File) => {
        setIsUploading(true);
        
        // Mock file processing - no actual upload to server
        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const fileMessage: ChatMessage = {
                id: `file-${activeConversationId}-${Date.now()}`,
                conversationId: activeConversationId,
                senderId: currentUser?.id || 'user',
                text: `Shared a file: ${file.name}`,
                timestamp: new Date(),
                attachment: {
                    id: `file-${Date.now()}`,
                    name: file.name,
                    url: URL.createObjectURL(file), // Local object URL for preview
                    type: file.type.startsWith('image/') ? 'image' : 'document',
                    uploadedAt: new Date(),
                    notes: `File size: ${formatFileSize(file.size)}`
                }
            };

            setMessages(prev => [...prev, fileMessage]);
        } catch (error) {
            console.error('File processing failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileUpload = () => {
        setShowFileUploadModal(true);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-primary-600 text-white">
                <div className="flex items-center space-x-2 flex-1">
                    <button
                        onClick={() => setShowConversationsList(!showConversationsList)}
                        className="flex items-center space-x-2 hover:bg-white/20 rounded px-2 py-1 transition-colors"
                    >
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            {getActiveConversation()?.type === 'dm' ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{getActiveConversation()?.name || 'Team Chat'}</h3>
                            <p className="text-xs text-primary-200 truncate">
                                {getActiveConversation()?.type === 'dm' ? 'Direct Message' : 'Channel'}
                            </p>
                        </div>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center space-x-1">
                    {getActiveConversation()?.type === 'dm' && (
                        <button
                            onClick={handlePopoutDM}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Pop out DM"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/20 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Conversations List Dropdown */}
            {showConversationsList && !isMinimized && (
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                    <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">CHANNELS</div>
                        {conversations.filter(c => c.type === 'channel').map(conversation => (
                            <button
                                key={conversation.id}
                                onClick={() => handleConversationSwitch(conversation.id)}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                    activeConversationId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                            >
                                <div className="w-4 h-4 text-gray-400">#</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{conversation.name}</div>
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <div className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                        {conversation.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))}
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 mt-4">DIRECT MESSAGES</div>
                        {conversations.filter(c => c.type === 'dm').map(conversation => (
                            <button
                                key={conversation.id}
                                onClick={() => handleConversationSwitch(conversation.id)}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                    activeConversationId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                            >
                                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{conversation.name}</div>
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <div className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                        {conversation.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Content */}
            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {messages.map(message => {
                            const sender = getSender(message.senderId);
                            const isCurrentUser = message.senderId === currentUser?.id;

                            return (
                                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <img
                                            src={sender.avatarUrl || `https://picsum.photos/seed/${message.senderId}/100/100`}
                                            alt={sender.name}
                                            className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
                                        />
                                        <div className={`px-3 py-2 rounded-lg text-sm ${
                                            isCurrentUser 
                                                ? 'bg-primary-600 text-white' 
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}>
                                            {!isCurrentUser && (
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    {sender.name}
                                                </p>
                                            )}
                                            <p>{message.text}</p>
                                            
                                            {/* File Attachment Display */}
                                            {message.attachment && (
                                                <div className="mt-2 p-2 border border-gray-200 dark:border-gray-600 rounded">
                                                    {message.attachment.type === 'image' ? (
                                                        <img
                                                            src={message.attachment.url}
                                                            alt={message.attachment.name}
                                                            className="max-w-full h-auto rounded cursor-pointer"
                                                            onClick={() => window.open(message.attachment?.url, '_blank')}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-xs">{message.attachment.name}</p>
                                                                {message.attachment.notes && (
                                                                    <p className="text-xs text-gray-500">{message.attachment.notes}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => window.open(message.attachment?.url, '_blank')}
                                                                className="text-primary-500 hover:text-primary-700 text-xs"
                                                            >
                                                                Download
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
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
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center space-x-2">
                            {/* File upload button */}
                            <button
                                onClick={triggerFileUpload}
                                disabled={isUploading}
                                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
                                title="Attach file"
                            >
                                {isUploading ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                )}
                            </button>
                            
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || isUploading}
                                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Minimized State */}
            {isMinimized && (
                <div className="p-3 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {messages.length} messages
                    </p>
                </div>
            )}

            {/* File Upload Modal */}
            <FileUploadModal
                isOpen={showFileUploadModal}
                onClose={() => setShowFileUploadModal(false)}
                onFileSelect={handleFileSelect}
                acceptedTypes="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                maxSizeInMB={10}
            />
        </div>
    );
};

export default ChatPopup;
