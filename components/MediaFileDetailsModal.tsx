import React, { useState } from 'react';
import { MediaFile, MediaFileType } from '../types';

// Icons
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2H9a2 2 0 01-2-2V9z" /><path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;

const FileTypeIconLarge: React.FC<{ type: MediaFileType }> = ({ type }) => {
    const iconBaseClass = "h-24 w-24 text-gray-400 dark:text-gray-500";
    if (type === 'video') return <svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
};

interface MediaFileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: MediaFile | null;
    onDelete: () => void;
    onEdit?: (updatedFile: MediaFile) => void;
}

const MediaFileDetailsModal: React.FC<MediaFileDetailsModalProps> = ({ isOpen, onClose, file, onDelete, onEdit }) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', url: '', type: 'image' as MediaFileType });

    // Initialize edit data when file changes - MUST be before early return
    React.useEffect(() => {
        if (file) {
            setEditData({
                name: file.name,
                url: file.url,
                type: file.type
            });
        }
    }, [file]);

    console.log('MediaFileDetailsModal render - isOpen:', isOpen, 'file:', file?.name);

    if (!isOpen || !file) return null;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(file.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (onEdit && file) {
            const updatedFile: MediaFile = {
                ...file,
                ...editData
            };
            onEdit(updatedFile);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditData({
            name: file.name,
            url: file.url,
            type: file.type
        });
        setIsEditing(false);
    };

    const fileTypeDisplay = file.type.charAt(0).toUpperCase() + file.type.slice(1);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{file.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl flex-shrink-0">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.type === 'image' ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-contain" />
                        ) : (
                            <FileTypeIconLarge type={file.type} />
                        )}
                    </div>
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Details</h3>
                        
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">File Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">File Type</label>
                                    <select
                                        value={editData.type}
                                        onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as MediaFileType }))}
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="document">Document</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">URL</label>
                                    <input
                                        type="text"
                                        value={editData.url}
                                        onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-sm">
                                    <p className="text-gray-500 dark:text-gray-400">File Type</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{fileTypeDisplay}</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-500 dark:text-gray-400">Uploaded On</p>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {(() => {
                                            const date = file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt);
                                            return isNaN(date.getTime()) ? 'Not available' : date.toLocaleString();
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">URL</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            id="fileUrl"
                                            readOnly
                                            value={file.url}
                                            className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400"
                                        />
                                        <button onClick={handleCopyUrl} className="text-gray-500 hover:text-primary-500 p-1">
                                            <CopyIcon />
                                        </button>
                                    </div>
                                    {copied && <p className="text-xs text-green-500 mt-1">Copied to clipboard!</p>}
                                </div>
                            </>
                        )}
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex gap-2">
                        {!isEditing && onEdit && (
                            <button
                                onClick={handleEdit}
                                className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                            >
                                <EditIcon />
                                Edit File
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                        >
                            <TrashIcon />
                            Delete File
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Close</button>
                </footer>
            </div>
        </div>
    );
};

export default MediaFileDetailsModal;