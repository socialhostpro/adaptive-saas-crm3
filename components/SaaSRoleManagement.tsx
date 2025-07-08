import React, { useState } from 'react';
import { useGlobalStore, TeamMemberWithSync } from '../hooks/useGlobalStore';
import Card from './shared/Card';
import { supabase } from '../lib/supabaseClient';

/**
 * SaaSRoleManagement: Admin-only page for managing user roles.
 * Persistent state: teamMembers (with syncStatus), roles.
 * Ephemeral state: loading, error, UI modals.
 */
const SaaSRoleManagement: React.FC = () => {
  const role = useGlobalStore((s: any) => s.role);
  const teamMembers = useGlobalStore((s: any) => s.teamMembers);
  const updateTeamMember = useGlobalStore((s: any) => s.updateTeamMember);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== 'Admin') {
    return <div className="text-center py-8 text-red-500">Access denied. Admins only.</div>;
  }

  const handleRoleChange = async (member: TeamMemberWithSync, newRole: string) => {
    setError(null);
    setLoading(true);
    // Optimistic update
    updateTeamMember({ ...member, role: newRole, syncStatus: 'pending' });
    try {
      const { error } = await supabase.from('team_members').update({ role: newRole }).eq('id', member.id);
      if (error) {
        updateTeamMember({ ...member, role: newRole, syncStatus: 'error' });
        setError('Failed to update role');
      } else {
        updateTeamMember({ ...member, role: newRole, syncStatus: 'synced' });
      }
    } catch {
      updateTeamMember({ ...member, role: newRole, syncStatus: 'error' });
      setError('Failed to update role');
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">SaaS Role Management</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="w-full text-sm text-left">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Sync Status</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member: TeamMemberWithSync) => (
            <tr key={member.id}>
              <td className="px-4 py-2">{member.name}</td>
              <td className="px-4 py-2">{member.email}</td>
              <td className="px-4 py-2">
                <select
                  value={member.role}
                  onChange={e => handleRoleChange(member, e.target.value)}
                  disabled={loading}
                  className="border rounded px-2 py-1"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <span className={`text-xs ${member.syncStatus === 'error' ? 'text-red-500' : member.syncStatus === 'pending' ? 'text-yellow-500' : 'text-green-600'}`}>
                  {member.syncStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default SaaSRoleManagement;
