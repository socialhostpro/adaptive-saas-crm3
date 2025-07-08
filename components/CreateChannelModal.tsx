import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string, description: string, participantIds: string[] }) => void;
    teamMembers: TeamMember[];
    currentUser: TeamMember | undefined;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onCreate, teamMembers, currentUser }) => {
    const { sessionId } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(sessionId ? [sessionId] : []));
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDescription('');
            setSelectedMembers(new Set(sessionId ? [sessionId] : []));
            setSearchTerm('');
        }
    }, [isOpen, sessionId]);

    const handleToggleMember = (id: string) => {
        if (id === sessionId) return; // Can't unselect self
        setSelectedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Channel name is required.');
            return;
        }
        onCreate({ name, description, participantIds: Array.from(selectedMembers) });
    };
    
    const filteredMembers = teamMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create a New Channel</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel Name *</label>
                        <input type="text" id="channel-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="# marketing-team" />
                    </div>
                    <div>
                        <label htmlFor="channel-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="channel-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="What is this channel about?"></textarea>
                    </div>
                    <div>
                        <label htmlFor="search-members" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Members</label>
                        <input type="text" id="search-members" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for team members..." className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm mb-2" />
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                            {filteredMembers.map(member => (
                                <div key={member.id} onClick={() => handleToggleMember(member.id)} className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 ${member.id === sessionId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input type="checkbox" checked={selectedMembers.has(member.id)} readOnly className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" disabled={member.id === sessionId}/>
                                    <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full" />
                                    <div>
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create Channel</button>
                </footer>
            </form>
        </div>
    );
};

export default CreateChannelModal;
