import React, { useState } from 'react';
import { MediaFile } from '../types';

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: MediaFile | null;
    onAssign: (fileId: string, feature: string, member: string, description: string) => void;
}

// Mock data for team members
const mockMembers = [
    'Alice',
    'Bob',
    'Charlie',
    'Dana',
    'Eve'
];

const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, file, onAssign }) => {
    const [assignType, setAssignType] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        setAssignType('');
        setMembers([]);
        setDescription('');
    }, [file, isOpen]);

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Media File</h2>
                    <p className="text-xs text-gray-500 mt-1">{file.name}</p>
                </header>
                <form
                    className="p-4 flex flex-col gap-4"
                    onSubmit={e => {
                        e.preventDefault();
                        if (assignType && members.length > 0) {
                            onAssign(file.id, assignType, members.join(', '), description);
                        }
                    }}
                >
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Assign To
                        <select
                            className="mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            value={assignType}
                            onChange={e => setAssignType(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select type</option>
                            {['Opportunity', 'Lead', 'Contact', 'Project', 'Case'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Team Members
                        <select
                            className="mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            multiple
                            value={members}
                            onChange={e => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setMembers(selected);
                            }}
                            required
                            size={Math.min(mockMembers.length, 5)}
                        >
                            {mockMembers.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <span className="text-xs text-gray-400 dark:text-gray-500">(Hold Ctrl or Cmd to select multiple)</span>
                    </label>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Description
                        <textarea
                            className="mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the assignment (optional)"
                            rows={2}
                        />
                    </label>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            disabled={!assignType || members.length === 0}
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignModal;
