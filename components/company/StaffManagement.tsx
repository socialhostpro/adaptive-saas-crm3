import React, { useEffect, useState } from 'react';
import { TeamMember, TeamMemberStatus, TeamMemberRole } from '../../types';
import InviteMemberModal from '../InviteMemberModal';
import { supabase } from '../../lib/supabaseClient';

const StaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<TeamMember[]>([]);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.from('team_members').select('*');
            if (error) {
                setError('Failed to load staff');
                setStaff([]);
            } else {
                setStaff(data || []);
            }
            setLoading(false);
        };
        fetchStaff();
    }, []);

    const handleInvite = async (email: string, role: TeamMemberRole) => {
        setError(null);
        const newMember: Omit<TeamMember, 'id'> = {
            name: email.split('@')[0],
            email,
            role,
            avatarUrl: `https://picsum.photos/seed/${email}/100/100`,
            status: TeamMemberStatus.Offline,
            lastSeen: 'Invited',
        };
        const { data, error } = await supabase.from('team_members').insert([newMember]).select();
        if (error) {
            setError('Failed to invite staff member');
        } else if (data && data[0]) {
            setStaff(prev => [...prev, data[0]]);
            setInviteModalOpen(false);
            alert(`Invitation sent to ${email}`);
        }
    };

    if (loading) return <div className="text-center py-4">Loading staff...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Staff Management</h2>
                    <button onClick={() => setInviteModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">Invite Staff</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full" />
                                            <div>
                                                <p>{member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{member.role}</td>
                                    <td className="px-6 py-4">{member.status}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInvite}
            />
        </>
    );
};

export default StaffManagement;
