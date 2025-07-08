import React, { useState, useRef, useEffect } from 'react';
import AIAssistantModal from './AIAssistantModal';
import { TeamMember } from '../types';

// Check for browser support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface AITalkButtonProps {
    appContext: any;
    onQuery?: (query: string) => void; // For conversational follow-up
}

const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <rect x="4" y="8" width="16" height="10" rx="3" className="fill-current text-primary-500" />
        <rect x="9" y="2" width="6" height="4" rx="1" className="fill-current text-primary-400" />
        <circle cx="8.5" cy="13.5" r="1.5" className="fill-white" />
        <circle cx="15.5" cy="13.5" r="1.5" className="fill-white" />
        <rect x="10" y="16" width="4" height="1.5" rx="0.75" className="fill-white" />
        <rect x="2" y="10" width="2" height="4" rx="1" className="fill-current text-primary-300" />
        <rect x="20" y="10" width="2" height="4" rx="1" className="fill-current text-primary-300" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const FloatingAIButton: React.FC<{onClick: () => void, isOpen: boolean}> = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        className="fixed z-60 bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
    >
        {isOpen ? <CloseIcon /> : <RobotIcon />}
    </button>
);

const AITalkButton: React.FC<AITalkButtonProps> = ({ appContext, onQuery }) => {
    const [isMuted] = useState(false); // keep for modal prop only
    const [query, setQuery] = useState('');
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {};
        recognitionRef.current.onend = () => {};
        recognitionRef.current.onerror = (event: any) => console.error('Speech recognition error:', event.error);
        
        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');
            
            if (event.results[0].isFinal) {
                if (onQuery) {
                    onQuery(transcript);
                } else {
                    setQuery(transcript);
                    setIsAssistantOpen(true);
                }
            }
        };
    }, [onQuery]);
    
    // Add floating robot button that opens AI conversational chat modal
    return (
        <>
            <FloatingAIButton 
                onClick={() => setIsAssistantOpen(open => !open)} 
                isOpen={isAssistantOpen} 
            />
            <AIAssistantModal 
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                initialQuery={query}
                isMuted={isMuted}
                voiceSettings={appContext?.currentUser?.voiceSettings}
                appContext={appContext}
            />
        </>
    );
};

export default AITalkButton;