
import React, { useState } from 'react';
import { TeamMember } from '../types';

interface NewDmModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamMembers: TeamMember[];
    onStartDm: (memberId: string) => void;
}

const NewDmModal: React.FC<NewDmModalProps> = ({ isOpen, onClose, teamMembers, onStartDm }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = teamMembers.filter(m =>
        m.id !== 'user' && m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Direct Message</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <div className="p-4">
                     <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search for team members..."
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    />
                </div>
                <main className="flex-grow p-4 pt-0 overflow-y-auto">
                    <ul className="space-y-1">
                        {filteredMembers.map(member => (
                            <li key={member.id} onClick={() => onStartDm(member.id)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full" />
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
};

export default NewDmModal;
