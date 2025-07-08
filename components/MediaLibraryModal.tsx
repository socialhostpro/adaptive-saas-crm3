
import React, { useState, useMemo } from 'react';
import { MediaFile, MediaFileType } from '../types';
import Card from './shared/Card';
import { useGlobalStore, MediaFileWithSync } from '../hooks/useGlobalStore';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFile: (file: MediaFile) => void;
}

const FileTypeIcon: React.FC<{ type: MediaFileType }> = ({ type }) => {
    const iconBaseClass = "h-8 w-8 text-white";
    if (type === 'image') return <div className="p-3 bg-pink-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>;
    if (type === 'video') return <div className="p-3 bg-indigo-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>;
    return <div className="p-3 bg-teal-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
}

const MediaFileCard: React.FC<{ file: MediaFile, onSelect: () => void }> = ({ file, onSelect }) => {
    return (
        <Card onClick={onSelect} className="!p-0 flex flex-col group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-xl flex items-center justify-center overflow-hidden">
                {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                    <FileTypeIcon type={file.type} />
                )}
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{file.name}</p>
            </div>
        </Card>
    )
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose, onSelectFile }) => {
    const { mediaFiles } = useGlobalStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MediaFileType | 'all'>('all');

    const filteredFiles = useMemo(() => {
        return mediaFiles
            .filter((file: MediaFileWithSync) => typeFilter === 'all' || file.type === typeFilter)
            .filter((file: MediaFileWithSync) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a: MediaFileWithSync, b: MediaFileWithSync) => {
                const aDate = a.uploadedAt instanceof Date ? a.uploadedAt : new Date(a.uploadedAt);
                const bDate = b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt);
                return bDate.getTime() - aDate.getTime();
            });
    }, [mediaFiles, typeFilter, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select from Media Library</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                     <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-72 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                        />
                        <select 
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value as any)}
                            className="w-full md:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                        >
                            <option value="all">All File Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="document">Documents</option>
                        </select>
                    </div>
                </div>
                <main className="flex-grow p-6 overflow-y-auto">
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredFiles.map((file: MediaFileWithSync) => <MediaFileCard key={file.id} file={file} onSelect={() => onSelectFile(file)} />)}
                    </div>
                    {filteredFiles.length === 0 && (
                         <div className="col-span-full text-center py-12">
                             <p className="text-gray-500 dark:text-gray-400">No files match your filters.</p>
                         </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MediaLibraryModal;