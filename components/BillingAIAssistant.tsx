import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Invoice, Estimate } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BillingAIAssistantProps {
    invoices: Invoice[];
    estimates: Estimate[];
    onClose: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}>
        <path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" />
    </svg>
)

const SendIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M3.105 3.105a.75.75 0 01.884-.06l14 8a.75.75 0 010 1.32l-14 8A.75.75 0 013 20.25V4.5a.75.75 0 01.105-.345z" />
    </svg>
);

const BillingAIAssistant: React.FC<BillingAIAssistantProps> = ({ invoices, estimates, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm your AI Billing Assistant. How can I help you today? You can ask me to summarize invoices, draft emails, and more." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (query?: string) => {
        const userInput = query || input;
        if (!userInput.trim()) return;

        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setInput('');
        setIsLoading(true);

        try {
            const today = new Date().toLocaleDateString();
            const prompt = `You are an intelligent billing assistant for AdaptiveCRM. Your role is to help users manage their invoices and estimates. You will be given data in JSON format and a user query. Respond in a helpful, conversational, and professional manner. Use Markdown for formatting your response (e.g., lists, bold text, tables). The user is a small business owner. Do not output JSON unless specifically asked. Be concise but thorough.

The current date is: ${today}.

Here is the billing data:
Invoices: ${JSON.stringify(invoices)}
Estimates: ${JSON.stringify(estimates)}

User Query: "${userInput}"
`;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-preview-04-17',
              contents: prompt,
            });

            const aiResponseText = response.text;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText || '' }]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please check the console or try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const starterPrompts = [
      "Which invoices are overdue?",
      "What's my total revenue from paid invoices?",
      "Draft a reminder for invoice INV-2024-004",
      "Summarize my estimates that have been sent.",
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-full max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src="/img/sass-logo-dark-mode.png" alt="Logo" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                        <SparklesIcon className="h-6 w-6 text-primary-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Billing Assistant</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">&times;</button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1"><SparklesIcon className="w-5 h-5 text-primary-500" /></div>}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
                                            table: ({node, ...props}) => <table className="w-full text-sm my-2 border-collapse" {...props} />,
                                            thead: ({node, ...props}) => <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-900/50" {...props} />,
                                            th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold" {...props} />,
                                            td: ({node, ...props}) => <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-600" {...props} />,
                                        }}
                                    >
                                    {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            {msg.sender === 'user' && <div className="w-8 h-8" />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 flex-row">
                           <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1"><SparklesIcon className="w-5 h-5 text-primary-500" /></div>
                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    {messages.length <= 1 && !isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                            {starterPrompts.map(prompt => (
                                <button key={prompt} onClick={() => handleSend(prompt)} className="text-left text-sm p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your invoices or estimates..."
                            disabled={isLoading}
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 disabled:cursor-not-allowed transition-colors">
                           <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                     <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                        AI may produce inaccurate information. Please verify important details.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default BillingAIAssistant;
