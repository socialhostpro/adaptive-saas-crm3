import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { SupportTicket, Conversation, TeamMember, TeamMemberRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { toSnakeCase } from '../lib/toSnakeCase';
import { useAuth } from '../hooks/useAuth';
import { useGlobalStore, SupportTicketWithSync, SyncStatus } from '../hooks/useGlobalStore';

interface SupportProps {
    teamMembers: TeamMember[];
    currentUser: TeamMember | undefined;
    appContext: any;
}

const SupportTopic: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <Card className="text-center hover:shadow-lg dark:hover:bg-gray-700/60 transition-all duration-200 cursor-pointer">
        <div className="mx-auto bg-primary-100 dark:bg-primary-900/50 rounded-full h-12 w-12 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </Card>
);

const Support: React.FC<SupportProps> = ({ teamMembers, currentUser, appContext }) => {
    const { sessionId } = useAuth();
    // Persistent state: supportTickets (from global store)
    const { supportTickets, setSupportTickets, addSupportTicket, updateSupportTicket } = useGlobalStore();
    // Ephemeral UI state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Initial fetch/hydrate from Supabase (on login/app start)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: ticketsData, error: ticketsError } = await supabase.from('support_tickets').select('*');
                if (ticketsError) throw ticketsError;
                setSupportTickets((ticketsData || []).map((t: SupportTicket) => ({ ...t, syncStatus: 'synced' as SyncStatus })));
                const { data: convosData, error: convosError } = await supabase.from('conversations').select('*');
                if (convosError) throw convosError;
                setConversations(convosData || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load support data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setSupportTickets]);

    // CREATE support ticket (optimistic update, then Supabase sync)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !description || !sessionId) return;
        setError(null);
        setLoading(true);
        const newTicket: SupportTicketWithSync = {
            id: `ticket-${Date.now()}`,
            subject,
            description,
            submitterId: sessionId,
            createdAt: new Date(),
            status: 'Open',
            syncStatus: 'pending',
        };
        addSupportTicket(newTicket);
        try {
            const { error: ticketError } = await supabase.from('support_tickets').insert([toSnakeCase(newTicket)]);
            if (ticketError) throw ticketError;
            updateSupportTicket({ ...newTicket, syncStatus: 'synced' });
            // 2. Find all Super Admins
            const superAdmins = teamMembers.filter(m => m.role === TeamMemberRole.SuperAdmin);
            // 3. Create a new private chat channel for the ticket in Supabase
            const newConversation: Conversation = {
                id: `conv-ticket-${newTicket.id}`,
                type: 'channel',
                name: `Support: ${subject}`,
                participantIds: [sessionId, ...superAdmins.map(a => a.id)],
                lastMessage: `Ticket created: ${description.substring(0, 30)}...`,
                timestamp: new Date(),
                unreadCount: 0,
                description: `Ticket #${newTicket.id}`,
                ticketId: newTicket.id
            };
            const { error: convoError } = await supabase.from('conversations').insert([toSnakeCase(newConversation)]);
            if (convoError) throw convoError;
            setConversations(prev => [newConversation, ...prev]);
            setSubject('');
            setDescription('');
            setIsSubmitted(true);
        } catch (err: any) {
            updateSupportTicket({ ...newTicket, syncStatus: 'error' });
            setError(err.message || 'Failed to submit ticket.');
        } finally {
            setLoading(false);
        }
    };

    // Documentation:
    // - Persistent state: supportTickets (Zustand global store, localStorage)
    // - Ephemeral state: modals, loading, error, form fields (component state)

    // Icons for Support Topics
    const iconClasses = "h-6 w-6 text-primary-600 dark:text-primary-400";
    const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const APIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
    const IntegrationsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    const TroubleshootIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

    return (
        <div>
            {/* Loading and error states */}
            {loading && <div className="text-center py-8">Loading support data...</div>}
            {error && <div className="text-center text-red-500 py-2">{error}</div>}

            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Support Center</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300">How can we help you today?</p>
                <div className="mt-6 max-w-2xl mx-auto">
                    <div className="relative">
                         <input
                            type="search"
                            placeholder="Search the knowledge base..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 text-base md:text-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                         />
                         <div className="absolute top-0 right-0 p-2.5">
                            <button className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <SupportTopic 
                    icon={<HelpIcon/>}
                    title="Getting Started"
                    description="New to AdaptiveCRM? Find guides to get you set up."
                />
                 <SupportTopic 
                    icon={<BillingIcon/>}
                    title="Billing & Invoices"
                    description="Manage your subscription, invoices, and payment methods."
                />
                 <SupportTopic 
                    icon={<AccountIcon/>}
                    title="Account Settings"
                    description="Update your profile, team members, and security settings."
                />
                 <SupportTopic 
                    icon={<APIIcon/>}
                    title="API Guide"
                    description="Integrate your own applications with our powerful API."
                />
                 <SupportTopic 
                    icon={<IntegrationsIcon/>}
                    title="Integrations"
                    description="Connect with popular third-party services and apps."
                />
                 <SupportTopic 
                    icon={<TroubleshootIcon/>}
                    title="Troubleshooting"
                    description="Find solutions to common issues and technical problems."
                />
            </div>

            <Card className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Can't Find an Answer?</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Our support team is always here to help. Submit a ticket and we'll get back to you as soon as possible.</p>
                    </div>
                    {isSubmitted ? (
                        <div className="text-center p-8 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Ticket Submitted!</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Our support team has received your request. A new chat channel has been created for you to communicate with them directly.</p>
                            <a href="#/chat" className="mt-4 inline-block font-semibold text-primary-600 hover:underline">Go to Chat</a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="sr-only">Name</label>
                                    <input type="text" id="name" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500" disabled/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <input type="email" id="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500" disabled/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="sr-only">Subject</label>
                                <input type="text" id="subject" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">Message</label>
                                <textarea id="message" rows={4} placeholder="How can we help?" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                                Submit Ticket
                            </button>
                        </form>
                    )}
                </div>
            </Card>

        </div>
    );
};

export default Support;
