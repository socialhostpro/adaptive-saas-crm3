
import React, { useState, useEffect } from 'react';
import { Conversation, TeamMember } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ChannelDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Conversation | null;
    teamMembers: TeamMember[];
    currentUser: TeamMember | undefined;
    onUpdate: (channel: Conversation) => void;
    onLeave: (channelId: string) => void;
    onDelete: (channelId: string) => void;
}

const ChannelDetailsModal: React.FC<ChannelDetailsModalProps> = (props) => {
    const { isOpen, onClose, channel, teamMembers, currentUser, onUpdate, onLeave, onDelete } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(channel?.name || '');
    const [description, setDescription] = useState(channel?.description || '');
    const [members, setMembers] = useState<Set<string>>(new Set(channel?.participantIds || []));
    const [isAddMemberMode, setAddMemberMode] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        if (channel) {
            setName(channel.name);
            setDescription(channel.description);
            setMembers(new Set(channel.participantIds));
            setIsEditing(false);
            setAddMemberMode(false);
        }
    }, [channel, isOpen]);

    if (!isOpen || !channel) return null;

    const isOwner = channel.creatorId === currentUser?.id;
    const channelMembers = teamMembers.filter(m => members.has(m.id));
    const potentialMembers = teamMembers.filter(m => !members.has(m.id));

    const handleSave = () => {
        onUpdate({ ...channel, name, description });
        setIsEditing(false);
    };

    const handleAddMember = (memberId: string) => {
        const newMembers = new Set(members).add(memberId);
        onUpdate({ ...channel, participantIds: Array.from(newMembers) });
    };

    const handleRemoveMember = (memberId: string) => {
        const newMembers = new Set(members);
        newMembers.delete(memberId);
        onUpdate({ ...channel, participantIds: Array.from(newMembers) });
    };

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Channel Details</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                    {/* Channel Info */}
                    <div className="space-y-2">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Channel Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"/>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Description</label>
                                    <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"/>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-600 px-3 py-1 text-sm rounded-lg font-semibold">Cancel</button>
                                    <button onClick={handleSave} className="bg-primary-600 text-white px-3 py-1 text-sm rounded-lg font-semibold">Save</button>
                                </div>
                            </>
                        ) : (
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white"># {channel.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                                </div>
                                {isOwner && <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-primary-600">Edit</button>}
                             </div>
                        )}
                    </div>

                    {/* Members List */}
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{channelMembers.length} Members</h4>
                            {isOwner && !isAddMemberMode && <button onClick={() => setAddMemberMode(true)} className="text-xs font-semibold text-primary-600">Add</button>}
                            {isAddMemberMode && <button onClick={() => setAddMemberMode(false)} className="text-xs font-semibold text-gray-600">Cancel</button>}
                        </div>
                        <ul className="space-y-2">
                             {channelMembers.map(m => (
                                <li key={m.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full" />
                                        <span>{m.name} {m.id === currentUser?.id ? '(You)' : ''}</span>
                                    </div>
                                    {isOwner && m.id !== currentUser?.id && <button onClick={() => handleRemoveMember(m.id)} className="text-xs text-red-500 font-semibold">Remove</button>}
                                    {channel.creatorId === m.id && <span className="text-xs font-bold text-amber-500">Owner</span>}
                                </li>
                             ))}
                        </ul>
                        {isAddMemberMode && (
                             <ul className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                {potentialMembers.map(m => (
                                    <li key={m.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full" />
                                            <span>{m.name}</span>
                                        </div>
                                        <button onClick={() => handleAddMember(m.id)} className="text-xs font-semibold text-green-600">Add</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={() => onLeave(channel.id)} className="text-red-600 dark:text-red-400 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-sm">Leave Channel</button>
                    {isOwner && <button onClick={() => setDeleteConfirmOpen(true)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">Delete Channel</button>}
                </footer>
            </div>
        </div>
        <ConfirmDeleteModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={() => onDelete(channel.id)}
            title="Delete Channel"
            message={`Are you sure you want to permanently delete #${channel.name}? This cannot be undone.`}
        />
        </>
    );
};

export default ChannelDetailsModal;
