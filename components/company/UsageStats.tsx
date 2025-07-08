import React, { useEffect, useState } from 'react';
import Card from '../shared/Card';
import { supabase } from '../../lib/supabaseClient';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="!bg-gray-50 dark:!bg-gray-700/50">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-300">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </Card>
);

const UsageStats: React.FC = () => {
    const [stats, setStats] = useState<{ contacts: number; deals: number; projects: number; storageUsed: number }>({ contacts: 0, deals: 0, projects: 0, storageUsed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const [{ count: contacts }, { count: deals }, { count: projects }, { count: files }] = await Promise.all([
                    supabase.from('contacts').select('*', { count: 'exact', head: true }),
                    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
                    supabase.from('projects').select('*', { count: 'exact', head: true }),
                    supabase.from('media_files').select('*', { count: 'exact', head: true })
                ]);
                setStats({
                    contacts: contacts ?? 0,
                    deals: deals ?? 0,
                    projects: projects ?? 0,
                    storageUsed: files ?? 0
                });
            } catch (e) {
                setError('Failed to load usage statistics');
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-4">Loading usage statistics...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Contacts" value={stats.contacts} icon={<ContactsIcon />} />
                <StatCard title="Open Deals" value={stats.deals} icon={<DealsIcon />} />
                <StatCard title="Active Projects" value={stats.projects} icon={<ProjectsIcon />} />
                <StatCard title="Files Stored" value={stats.storageUsed} icon={<FilesIcon />} />
            </div>
        </div>
    );
};

const iconClass = "h-6 w-6";
const ContactsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21" /></svg>;
const DealsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ProjectsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FilesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

export default UsageStats;
