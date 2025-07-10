import React, { useState, useEffect } from 'react';
import { TeamMember, TeamMemberStatus, TeamMemberRole, TimeEntry } from '../types';
import Card from './shared/Card';
import InviteMemberModal from './InviteMemberModal';
import TeamMemberDetailsModal from './TeamMemberDetailsModal';
import { supabase } from '../lib/supabaseClient';
import { toSnakeCase } from '../lib/toSnakeCase';
import { useAuth } from '../hooks/useAuth';
import { useGlobalStore, TeamMemberWithSync, SyncStatus } from '../hooks/useGlobalStore';

interface TeamProps {
    timeEntries: TimeEntry[];
    appContext: any;
    onStartDM?: (conversationId: string, participant: TeamMember) => void;
    onViewAllActivities?: () => void;
}

const StatusIndicator: React.FC<{ status: TeamMemberStatus }> = ({ status }) => {
    let color = '';
    let label = '';
    switch (status) {
        case TeamMemberStatus.Online: 
            color = 'bg-green-500'; 
            label = 'Online';
            break;
        case TeamMemberStatus.Away: 
            color = 'bg-yellow-500'; 
            label = 'Away';
            break;
        case TeamMemberStatus.Offline: 
            color = 'bg-gray-400'; 
            label = 'Offline';
            break;
    }
    return (
        <div className="absolute bottom-0 right-0" title={label}>
            <span className={`block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${color}`} />
        </div>
    );
};

const SyncStatusIndicator: React.FC<{ syncStatus: SyncStatus }> = ({ syncStatus }) => {
    if (syncStatus === 'synced') return null;
    
    const statusConfig = {
        pending: { color: 'text-yellow-500', icon: '⏳', label: 'Syncing...' },
        error: { color: 'text-red-500', icon: '❌', label: 'Sync failed' }
    };
    
    const config = statusConfig[syncStatus];
    return (
        <div className={`absolute top-2 right-2 ${config.color}`} title={config.label}>
            <span className="text-xs">{config.icon}</span>
        </div>
    );
};

const TeamMemberCard: React.FC<{ member: TeamMemberWithSync; onViewProfile: () => void; totalHours: number }> = ({ member, onViewProfile, totalHours }) => (
    <Card className="text-center relative">
        <SyncStatusIndicator syncStatus={member.syncStatus} />
        <div className="relative inline-block mb-4">
            <img className="h-24 w-24 rounded-full mx-auto" src={member.avatarUrl} alt={member.name} />
            <StatusIndicator status={member.status} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
        <p className="text-sm text-primary-500 font-medium">{member.role}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totalHours.toFixed(1)} hours logged</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{member.email}</p>
        <button 
            onClick={onViewProfile} 
            className="mt-4 w-full bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            disabled={member.syncStatus === 'pending'}
        >
            {member.syncStatus === 'pending' ? 'Syncing...' : 'View Profile'}
        </button>
    </Card>
);

const Team: React.FC<TeamProps> = ({ timeEntries, onStartDM, onViewAllActivities }) => {
    const { sessionId } = useAuth();
    
    // Global state from Zustand store (persistent)
    const { 
        teamMembers, 
        setTeamMembers, 
        addTeamMember, 
        updateTeamMember,
        timeEntries: globalTimeEntries,
        tasks,
        activities
    } = useGlobalStore();
    
    // Local UI state (ephemeral)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMemberWithSync | null>(null);

    // Use global time entries if available, fallback to props
    const workingTimeEntries = globalTimeEntries.length > 0 ? globalTimeEntries : timeEntries;

    // Initial data loading (only if teamMembers is empty)
    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (teamMembers.length > 0) return; // Skip if already loaded
            
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('team_members')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                
                const membersWithSync = (data || []).map((member: TeamMember) => ({
                    ...member,
                    syncStatus: 'synced' as SyncStatus
                }));
                
                setTeamMembers(membersWithSync);
            } catch (err: any) {
                console.error('Failed to fetch team members:', err);
                setError(err.message || 'Failed to load team members.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [teamMembers.length, setTeamMembers]);

    const handleViewProfile = (member: TeamMemberWithSync) => {
        setSelectedMember(member);
        setDetailsModalOpen(true);
    };

    // CREATE team member (optimistic update with sync)
    const handleInvite = async (email: string, role: TeamMemberRole) => {
        if (!sessionId) {
            setError('Authentication required');
            return;
        }

        setError(null);
        
        // Create optimistic team member
        const newMember: TeamMemberWithSync = {
            id: `temp-${Date.now()}`, // Temporary ID
            name: email.split('@')[0] || 'New Member',
            email,
            role,
            avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
            status: TeamMemberStatus.Offline,
            lastSeen: 'Just invited',
            hireDate: new Date().toISOString().split('T')[0],
            syncStatus: 'pending',
        };

        // Optimistic update - add to store immediately
        addTeamMember(newMember);
        setInviteModalOpen(false);

        try {
            // Prepare data for database (exclude temp fields)
            const dbMember = {
                ...newMember,
                id: undefined, // Let database generate real ID
            };

            const { data, error: insertError } = await supabase
                .from('team_members')
                .insert([toSnakeCase(dbMember)])
                .select()
                .single();

            if (insertError) throw insertError;

            // Update with real ID from database
            const syncedMember: TeamMemberWithSync = {
                ...newMember,
                id: data.id,
                syncStatus: 'synced',
            };

            updateTeamMember(syncedMember);
            
            // Show success message
            alert(`Invitation sent to ${email}! They will receive an email to join the team.`);
            
        } catch (err: any) {
            console.error('Failed to invite team member:', err);
            
            // Mark as error but keep in list for user to retry
            updateTeamMember({ 
                ...newMember, 
                syncStatus: 'error',
                lastSeen: 'Invitation failed' 
            });
            
            setError(`Failed to invite ${email}: ${err.message}`);
        }
    };

    // Calculate total hours for a team member
    const calculateMemberHours = (memberId: string): number => {
        return workingTimeEntries
            .filter(entry => entry.userId === memberId)
            .reduce((total, entry) => total + (entry.duration || 0), 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Team Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your team members and their access
                    </p>
                </div>
                <button 
                    onClick={() => setInviteModalOpen(true)} 
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {loading ? 'Loading...' : 'Invite Member'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            <button 
                                onClick={() => setError(null)}
                                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && teamMembers.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading team members...</p>
                </div>
            )}

            {/* Team Members Grid */}
            {teamMembers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teamMembers.map((member: TeamMemberWithSync) => {
                        const totalHours = calculateMemberHours(member.id);
                        return (
                            <TeamMemberCard 
                                key={member.id} 
                                member={member} 
                                onViewProfile={() => handleViewProfile(member)}
                                totalHours={totalHours}
                            />
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && teamMembers.length === 0 && (
                <div className="text-center py-12">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No team members yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Start building your team by inviting members
                    </p>
                    <button 
                        onClick={() => setInviteModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Invite Your First Member
                    </button>
                </div>
            )}

            {/* Modals */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInvite}
            />
            
            <TeamMemberDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                member={selectedMember}
                timeEntries={workingTimeEntries.filter(entry => entry.userId === selectedMember?.id)}
                tasks={tasks}
                activities={activities}
                onStartDM={onStartDM}
                onViewAllActivities={onViewAllActivities}
            />
        </div>
    );
};

export default Team;
