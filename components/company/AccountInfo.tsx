import React, { useEffect, useState } from 'react';
import { TeamMember } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const AccountInfo: React.FC = () => {
    const [accountOwner, setAccountOwner] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOwner = async () => {
            setLoading(true);
            setError(null);
            // Assuming the account owner is the first team member with role 'Owner'
            const { data, error } = await supabase.from('team_members').select('*').eq('role', 'Owner').limit(1).single();
            if (error) {
                setError('Could not find account owner details.');
                setAccountOwner(null);
            } else {
                setAccountOwner(data);
            }
            setLoading(false);
        };
        fetchOwner();
    }, []);

    if (loading) return <div className="text-center py-4">Loading account owner...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;
    if (!accountOwner) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">This is the primary contact for this AdaptiveCRM account.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{accountOwner.name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{accountOwner.email}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{accountOwner.role}</p>
                </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={() => alert("This would typically lead to a more detailed user profile edit page.")}>Update My Profile</button>
            </div>
        </div>
    );
};

export default AccountInfo;
