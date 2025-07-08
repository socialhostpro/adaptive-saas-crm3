
import React from 'react';
import { TeamMember } from '../../types';

interface ManageUsersProps {
    users: TeamMember[];
}

const ManageUsers: React.FC<ManageUsersProps> = ({ users }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">User</th>
                        <th scope="col" className="px-6 py-3">Company</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
                                    <div>
                                        <p>{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">Adaptive Solutions LLC</td>
                            <td className="px-6 py-4">{user.role}</td>
                            <td className="px-6 py-4">{user.status}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Manage</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
