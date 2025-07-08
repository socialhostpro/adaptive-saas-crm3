import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VoiceSettings, ActivityType, LeadStatus } from '../types';

import EmailModal from './EmailModal';

// Import the aiChatBot web component (registers <gdm-live-audio> globally)
import '../aiChatBot/index.tsx';

// Add TypeScript support for the custom element so TSX doesn't error
// @ts-ignore
const GdmLiveAudio = (props: React.HTMLAttributes<HTMLElement>) => <gdm-live-audio {...props} />;

interface Message {
    role: 'user' | 'model';
    parts: string;
    action?: any;
}

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery: string;
    isMuted: boolean;
    voiceSettings?: VoiceSettings;
    appContext: any;
}

const SparklesIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>;

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, initialQuery, isMuted, voiceSettings, appContext }) => {
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [emailModalProps, setEmailModalProps] = useState({ recipientName: '', recipientEmail: '', subject: '', body: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const handleNewQuery = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);
        const newUserMessage: Message = { role: 'user', parts: query };
        const newHistory = [...history, newUserMessage];
        setHistory(newHistory);
        
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });
        const model = 'gemini-2.5-flash-preview-04-17';
        
        const systemInstruction = `You are a helpful and proactive AI assistant named 'Adaptive AI', integrated into a CRM application called AdaptiveCRM. Your personality is that of a friendly, efficient coworker. Your primary goal is to help the user manage their business data efficiently.

The user's query will be appended with a JSON object containing the relevant data from the CRM. Use this data to answer questions and to get necessary IDs for performing actions.

When a user asks you to perform an action (like creating a task, lead, or opportunity), your process is:
1.  Acknowledge the request.
2.  Check if you have all the necessary information based on the function definitions below and the provided data context.
3.  If information is missing (e.g., a due date for a task, a contact's email), **ask clarifying questions**. Be specific.
4.  Once you have all the necessary information, confirm the action with the user and present the action's details in a JSON block. For example:
    "Okay, I can create that task for you. Here are the details:"
    \`\`\`json
    {
      "action": "create_task",
      "parameters": {
        "title": "Follow up with Alana Patel",
        "contactId": "c1",
        "dueDate": "2024-08-09",
        "priority": "Medium",
        "description": "Client is waiting for the updated proposal."
      }
    }
    \`\`\`

When a user asks a question (e.g., "who is...", "show me my tasks..."), you should NOT use a JSON action block. Instead, just answer the question directly based on the provided data context. Use markdown for formatting, especially tables for lists of items.

---
AVAILABLE ACTIONS:
- create_task: requires title, contactId, dueDate. Optional: priority, description, assigneeId.
- create_opportunity: requires title, contactId, value, closeDate. Optional: stage, assigneeId.
- create_lead: requires name, company, email. Optional: score.
- log_activity: requires contactId, summary, type ('Call', 'Email', 'Meeting', or 'Note'). Optional: subject (for Email), duration (number, in minutes) and outcome (for Call), location (for Meeting).
- update_task: requires taskId. Optional: title, contactId, dueDate, priority, description, assigneeId, status.
- update_opportunity: requires opportunityId. Optional: stage, value, closeDate, title, contactId, assigneeId.
- update_lead: requires leadId. Optional: name, company, email, score, status.
- update_contact: requires contactId. Optional: name, email, phone, title, company.
- send_email: requires contactId, subject, body.
- schedule_meeting: requires contactId, title, startTime, endTime, location.
- summarize_sales_performance: Optional: period.
---

The current user's name is ${appContext.currentUser?.name} (ID: ${appContext.currentUser?.id}). When no assignee is specified for a new task or opportunity, assign it to the current user by default.
The current date is ${new Date().toLocaleDateString()}.

Start the conversation by responding to the user's first query. Be friendly and helpful.`;

        const dataContext = `
Here is the current data context from the application. Use this to answer questions and find information for tool use.

Contacts: ${JSON.stringify(appContext.contacts.slice(0, 10), null, 2)}
Leads: ${JSON.stringify(appContext.leads.slice(0, 10), null, 2)}
Opportunities: ${JSON.stringify(appContext.opportunities.slice(0, 10), null, 2)}
Tasks: ${JSON.stringify(appContext.tasks.slice(0, 10), null, 2)}
Team Members: ${JSON.stringify(appContext.teamMembers, null, 2)}
`;

        const apiHistory = newHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
        }));

        if (apiHistory.length > 0) {
            const lastMessage = apiHistory[apiHistory.length - 1];
            if(lastMessage.role === 'user') {
                lastMessage.parts[0].text += `\n\n${dataContext}`;
            }
        }
        
        try {
            const result = await ai.models.generateContentStream({
                model,
                contents: apiHistory,
                systemInstruction: { parts: [{ text: systemInstruction }] },
            });

            let text = '';
            setHistory(prev => [...prev, { role: 'model', parts: '' }]);

            for await (const chunk of result) {
                text += chunk.text;
                setHistory(prev => {
                    const updatedHistory = [...prev];
                    updatedHistory[updatedHistory.length - 1] = { role: 'model', parts: text };
                    return updatedHistory;
                });
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setHistory(prev => [...prev, { role: 'model', parts: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && initialQuery) {
            setHistory([]);
            handleNewQuery(initialQuery);
        }
    }, [isOpen, initialQuery]);
    
    useEffect(() => {
        const lastMessage = history[history.length - 1];
        if (!isMuted && lastMessage?.role === 'model' && !isLoading) {
            const cleanText = lastMessage.parts.replace(/```json[\s\S]*```/, 'I have prepared this action for you.');
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            const allVoices = window.speechSynthesis.getVoices();
            const selectedVoice = allVoices.find(v => v.voiceURI === voiceSettings?.voiceURI);

            utterance.voice = selectedVoice || null;
            utterance.rate = voiceSettings?.rate || 1;
            utterance.pitch = voiceSettings?.pitch || 1;

            window.speechSynthesis.speak(utterance);
        }
        return () => window.speechSynthesis.cancel();
    }, [history, isLoading, isMuted, voiceSettings]);

    const handleExecuteAction = (action: any) => {
        console.log("Executing action:", action);
        // This is a simplified simulation of function execution.
        try {
            if (action.action === 'create_task') {
                const contact = appContext.contacts.find((c: any) => c.id === action.parameters.contactId);
                const newTask = {
                    ...action.parameters,
                    id: `task-${Date.now()}`,
                    contactName: contact?.name || 'Unknown',
                    status: 'To Do',
                    priority: action.parameters.priority || 'Medium'
                };
                appContext.setTasks((prev: any) => [newTask, ...prev]);
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Task "${newTask.title}" has been created successfully.` }]);
            }
            else if (action.action === 'create_opportunity') {
                const contact = appContext.contacts.find((c: any) => c.id === action.parameters.contactId);
                if (!contact) {
                    throw new Error(`Contact with ID ${action.parameters.contactId} not found.`);
                }
                const newOpportunity = {
                    ...action.parameters,
                    id: `opp-${Date.now()}`,
                    contactName: contact.name,
                    stage: action.parameters.stage || 'Prospecting'
                };
                appContext.setOpportunities((prev: any) => [newOpportunity, ...prev]);
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Opportunity "${newOpportunity.title}" has been created successfully.` }]);
            }
             else if (action.action === 'create_lead') {
                const newLead = {
                    ...action.parameters,
                    id: `l-${Date.now()}`,
                    score: action.parameters.score || 50,
                    status: LeadStatus.New,
                    lastContacted: 'Just now'
                };
                appContext.setLeads((prev: any) => [newLead, ...prev]);
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Lead for "${newLead.name}" has been created successfully.` }]);
            }
            else if (action.action === 'log_activity') {
                const contact = appContext.contacts.find((c: any) => c.id === action.parameters.contactId);
                if (!contact) {
                    throw new Error(`Contact with ID ${action.parameters.contactId} not found.`);
                }
                
                const typeMap: { [key: string]: ActivityType } = {
                    'Call': ActivityType.Call,
                    'Email': ActivityType.Email,
                    'Meeting': ActivityType.Meeting,
                    'Note': ActivityType.Note
                };
                const activityType = typeMap[action.parameters.type];

                if (activityType === undefined) {
                    throw new Error(`Invalid activity type: ${action.parameters.type}`);
                }

                const newActivity = {
                    ...action.parameters,
                    id: `act-${Date.now()}`,
                    contactName: contact.name,
                    type: activityType,
                    timestamp: new Date()
                };
                appContext.setActivities((prev: any) => [newActivity, ...prev]);
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Activity with ${contact.name} has been logged.` }]);
            }
            else if (action.action === 'update_task') {
                const { taskId, ...updates } = action.parameters;
                const existingTask = appContext.tasks.find((t: any) => t.id === taskId);
                if (!existingTask) {
                    throw new Error(`Task with ID ${taskId} not found.`);
                }
                
                const updatedTask = { ...existingTask, ...updates };

                // If contactId is updated, we need to update contactName too
                if (updates.contactId && updates.contactId !== existingTask.contactId) {
                    const newContact = appContext.contacts.find((c: any) => c.id === updates.contactId);
                    updatedTask.contactName = newContact?.name || 'Unknown';
                }

                appContext.setTasks((prev: any[]) => prev.map(t => t.id === taskId ? updatedTask : t));
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Task "${updatedTask.title}" has been updated successfully.` }]);
            }
            else if (action.action === 'update_opportunity') {
                const { opportunityId, ...updates } = action.parameters;
                const existingOpportunity = appContext.opportunities.find((o: any) => o.id === opportunityId);
                if (!existingOpportunity) {
                    throw new Error(`Opportunity with ID ${opportunityId} not found.`);
                }
                
                const updatedOpportunity = { ...existingOpportunity, ...updates };

                if (updates.contactId && updates.contactId !== existingOpportunity.contactId) {
                    const newContact = appContext.contacts.find((c: any) => c.id === updates.contactId);
                    updatedOpportunity.contactName = newContact?.name || 'Unknown';
                }

                appContext.setOpportunities((prev: any[]) => prev.map(o => o.id === opportunityId ? updatedOpportunity : o));
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Opportunity "${updatedOpportunity.title}" has been updated successfully.` }]);
            }
            else if (action.action === 'update_lead') {
                const { leadId, ...updates } = action.parameters;
                const existingLead = appContext.leads.find((l: any) => l.id === leadId);
                if (!existingLead) {
                    throw new Error(`Lead with ID ${leadId} not found.`);
                }
                
                const updatedLead = { ...existingLead, ...updates };

                appContext.setLeads((prev: any[]) => prev.map(l => l.id === leadId ? updatedLead : l));
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Lead "${updatedLead.name}" has been updated successfully.` }]);
            }
            else if (action.action === 'update_contact') {
                const { contactId, ...updates } = action.parameters;
                const existingContact = appContext.contacts.find((c: any) => c.id === contactId);
                if (!existingContact) {
                    throw new Error(`Contact with ID ${contactId} not found.`);
                }
                
                const updatedContact = { ...existingContact, ...updates };

                appContext.setContacts((prev: any[]) => prev.map(c => c.id === contactId ? updatedContact : c));
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Contact "${updatedContact.name}" has been updated successfully.` }]);
            }
            else if (action.action === 'send_email') {
                const { contactId, subject, body } = action.parameters;
                const contact = appContext.contacts.find((c: any) => c.id === contactId);
                if (!contact) {
                    throw new Error(`Contact with ID ${contactId} not found.`);
                }
                setEmailModalProps({ recipientName: contact.name, recipientEmail: contact.email, subject, body });
                setEmailModalOpen(true);
                setHistory(prev => [...prev, { role: 'model', parts: `I have drafted an email to ${contact.name}. Please review and send.` }]);
            }
            else if (action.action === 'schedule_meeting') {
                const { contactId, title, startTime, endTime, location } = action.parameters;
                const contact = appContext.contacts.find((c: any) => c.id === contactId);
                if (!contact) {
                    throw new Error(`Contact with ID ${contactId} not found.`);
                }
                console.log('Scheduling meeting with:', contact.name);
                console.log('Title:', title);
                console.log('Start Time:', startTime);
                console.log('End Time:', endTime);
                console.log('Location:', location);
                setHistory(prev => [...prev, { role: 'model', parts: `✅ Meeting with ${contact.name} has been scheduled.` }]);
            }
            else {
                throw new Error("Unknown action type");
            }
        } catch (error) {
            console.error("Error executing action:", error);
            setHistory(prev => [...prev, { role: 'model', parts: "Sorry, I was unable to complete that action." }]);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-primary-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* CRM text chat UI (existing) */}
                    {history.map((msg, index) => {
                        const jsonMatch = msg.parts.match(/```json\s*([\s\S]*?)\s*```/);
                        let actionData = null;
                        if (jsonMatch && jsonMatch[1]) {
                            try {
                                actionData = JSON.parse(jsonMatch[1]);
                            } catch (e) {
                                console.error("Failed to parse JSON action block:", e);
                            }
                        }
                        const textBeforeJson = jsonMatch ? msg.parts.substring(0, jsonMatch.index) : msg.parts;

                        return (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1"><SparklesIcon className="w-5 h-5 text-primary-500" /></div>}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{textBeforeJson}</ReactMarkdown>
                                </div>
                                {actionData && (
                                    <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-300 dark:border-gray-600">
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Action: {actionData.action.replace('_', ' ')}</p>
                                        <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(actionData.parameters, null, 2)}</pre>
                                        <button onClick={() => handleExecuteAction(actionData)} className="w-full mt-2 bg-primary-600 text-white font-semibold px-3 py-1.5 rounded-lg text-sm">
                                            Execute
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                    {isLoading && (
                        <div className="flex gap-3 flex-row">
                           <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1"><SparklesIcon className="w-5 h-5 text-primary-500" /></div>
                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse ml-1" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse ml-1" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    {/* Divider for voice/3D bot */}
                    <div className="my-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">or try our voice/3D AI bot below</div>
                    {/* aiChatBot web component */}
                    <div className="flex justify-center">
                        <GdmLiveAudio style={{ width: '100%', maxWidth: 480, minHeight: 400 }} />
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {/* Removed AITalkButton to prevent duplicate modals */}
                </footer>
            </div>
        </div>
    );
};

export default AIAssistantModal;