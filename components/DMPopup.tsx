import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TeamMember } from '../types';
import FileUploadModal from './FileUploadModal';

interface DMPopupProps {
    isOpen: boolean;
    onClose: () => void;
    participant: TeamMember;
    conversationId: string;
    currentUser: TeamMember | undefined;
    position?: { x: number; y: number };
}

const DMPopup: React.FC<DMPopupProps> = ({ 
    isOpen, 
    onClose, 
    participant, 
    conversationId, 
    currentUser,
    position = { x: 100, y: 100 }
}) => {
    // Mock DM messages - in production this would be fetched based on conversationId
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: `dm-${conversationId}-msg-1`,
            conversationId: conversationId,
            senderId: participant.id,
            text: `Hey ${currentUser?.name}, can you review my latest work?`,
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            attachment: undefined
        },
        {
            id: `dm-${conversationId}-msg-2`,
            conversationId: conversationId,
            senderId: currentUser?.id || 'user',
            text: 'Absolutely! Let me take a look right now.',
            timestamp: new Date(Date.now() - 1000 * 60 * 8),
            attachment: undefined
        },
        {
            id: `dm-${conversationId}-msg-3`,
            conversationId: conversationId,
            senderId: participant.id,
            text: 'Thanks! I really appreciate the quick feedback.',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            attachment: undefined
        }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [windowPosition, setWindowPosition] = useState(position);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom of messages
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const newMsg: ChatMessage = {
            id: `dm-${conversationId}-${Date.now()}`,
            conversationId: conversationId,
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

    // File handling functions
    const handleFileSelect = (file: File) => {
        handleSendFileMessage(file);
    };

    const handleSendFileMessage = async (file: File) => {
        setIsUploading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const fileMessage: ChatMessage = {
                id: `file-${conversationId}-${Date.now()}`,
                conversationId: conversationId,
                senderId: currentUser?.id || 'user',
                text: `Shared a file: ${file.name}`,
                timestamp: new Date(),
                attachment: {
                    id: `file-${Date.now()}`,
                    name: file.name,
                    url: URL.createObjectURL(file),
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

    // Dragging functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
            setIsDragging(true);
            const rect = windowRef.current?.getBoundingClientRect();
            if (rect) {
                setDragOffset({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setWindowPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    if (!isOpen) return null;

    return (
        <div
            ref={windowRef}
            className="fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden resize"
            style={{
                left: windowPosition.x,
                top: windowPosition.y,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
        >
            {/* Header - Draggable */}
            <div 
                className="drag-handle flex items-center justify-between p-3 bg-primary-600 text-white cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center space-x-2">
                    <img
                        src={participant.avatarUrl || `https://picsum.photos/seed/${participant.id}/100/100`}
                        alt={participant.name}
                        className="w-6 h-6 rounded-full"
                    />
                    <div>
                        <h3 className="font-medium text-sm">{participant.name}</h3>
                        <p className="text-xs text-primary-200">{participant.role || 'Team Member'}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-1">
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

            {/* Chat Content */}
            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {messages.map(message => {
                            const isCurrentUser = message.senderId === currentUser?.id;
                            const sender = isCurrentUser ? currentUser : participant;

                            return (
                                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <img
                                            src={sender?.avatarUrl || `https://picsum.photos/seed/${message.senderId}/100/100`}
                                            alt={sender?.name}
                                            className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
                                        />
                                        <div className={`px-3 py-2 rounded-lg text-sm ${
                                            isCurrentUser 
                                                ? 'bg-primary-600 text-white' 
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}>
                                            <p>{message.text}</p>
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                            
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Message ${participant.name}...`}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
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
                        DM with {participant.name}
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

export default DMPopup;
