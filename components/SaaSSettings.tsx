import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import PlatformBilling from './saas/PlatformBilling';
import SendGridIntegration from './saas/SendGridIntegration';
import SaaSEmailManagement from './saas/SaaSEmailManagement';
import type { SaaSSettings, EmailTemplate } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useGlobalStore, SyncStatus } from '../hooks/useGlobalStore';

interface SaaSSettingsProps {}

type Tab = 'billing' | 'general' | 'email';

const TABS: { id: Tab, label: string }[] = [
    { id: 'general', label: 'General Settings' },
    { id: 'billing', label: 'Platform Billing' },
    { id: 'email', label: 'Email Templates' },
];

const SaaSSettings: React.FC<SaaSSettingsProps> = () => {
    // Persistent state: saasSettings, emailTemplates (from global store)
    const {
        saasSettings,
        setSaasSettings,
        emailTemplates,
        setEmailTemplates
    } = useGlobalStore();
    // Ephemeral UI state
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isStripeConnected, setIsStripeConnected] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial fetch/hydrate from Supabase (on login/app start)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const { data: settingsData, error: settingsError } = await supabase.from('saas_settings').select('*').single();
            const { data: templatesData, error: templatesError } = await supabase.from('email_templates').select('*');
            if (settingsError || templatesError) {
                setError('Failed to load SaaS settings');
                setSaasSettings(null as any);
                setEmailTemplates([]);
            } else {
                setSaasSettings({ ...(settingsData || {}), syncStatus: 'synced' as SyncStatus });
                setEmailTemplates((templatesData || []).map((t: EmailTemplate) => ({ ...t, syncStatus: 'synced' as SyncStatus })));
            }
            setLoading(false);
        };
        fetchData();
    }, [setSaasSettings, setEmailTemplates]);

    // Documentation:
    // - Persistent state: saasSettings, emailTemplates (Zustand global store, localStorage)
    // - Ephemeral state: modals, loading, error, tab selection (component state)

    const renderContent = () => {
        switch (activeTab) {
            case 'billing':
                return <PlatformBilling isConnected={isStripeConnected} setConnected={setIsStripeConnected} />;
            case 'general':
                return <SendGridIntegration settings={saasSettings} setSettings={setSaasSettings} />;
            case 'email':
                return <SaaSEmailManagement templates={emailTemplates} setTemplates={setEmailTemplates} />;
            default:
                return null;
        }
    };

    if (loading) return <div className="text-center py-4">Loading settings...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">SaaS Platform Settings</h1>
            <div className="flex-grow flex flex-col md:flex-row gap-8">
                <nav className="flex-shrink-0 md:w-56">
                    <ul className="space-y-1">
                        {TABS.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-grow min-w-0">
                    <Card className="h-full">
                        {renderContent()}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SaaSSettings;
