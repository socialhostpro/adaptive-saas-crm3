import React, { useState, useMemo, useEffect } from 'react';
import { MediaFile, MediaFileType } from '../types';
import Card from './shared/Card';
import UploadFileModal from './UploadFileModal';
import MediaFileDetailsModal from './MediaFileDetailsModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { supabase } from '../lib/supabaseClient';
import { useGlobalStore, MediaFileWithSync, SyncStatus } from '../hooks/useGlobalStore';
import type { LocalMediaFile } from '../hooks/useGlobalStore';

interface MediaLibraryProps {
    mediaFiles: MediaFileWithSync[];
    setMediaFiles?: (files: MediaFileWithSync[]) => void;
    currentUser?: any;
    appContext: any;
}

const FileTypeIcon: React.FC<{ type: MediaFileType }> = ({ type }) => {
    const iconBaseClass = "h-10 w-10 text-white";
    if (type === 'image') return (
        <div className="p-3 bg-pink-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
    if (type === 'video') return (
        <div className="p-3 bg-indigo-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </div>
    );
    return (
        <div className="p-3 bg-teal-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className={iconBaseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
    );
}

const MediaFileCard: React.FC<{ file: LocalMediaFile, onClick: () => void, onSync: (file: LocalMediaFile) => void }> = ({ file, onClick, onSync }) => {
    const getSyncStatusBadge = () => {
        switch (file.syncStatus) {
            case 'pending':
                return (
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Pending
                    </div>
                );
            case 'error':
                return (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Error
                    </div>
                );
            case 'synced':
            default:
                return null;
        }
    };
    return (
        <Card 
            onClick={() => {
                if (file.syncStatus === 'pending') return; // Don't open details for unsynced
                onClick();
            }} 
            className="!p-0 flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
        >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-xl flex items-center justify-center overflow-hidden">
                {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <FileTypeIcon type={file.type} />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {getSyncStatusBadge()}
                {file.syncStatus === 'pending' && (
                    <button
                        className="absolute bottom-2 right-2 bg-primary-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-primary-700"
                        onClick={e => { e.stopPropagation(); onSync(file); }}
                    >Sync</button>
                )}
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.uploadedAt instanceof Date ? file.uploadedAt.toLocaleDateString() : new Date(file.uploadedAt || Date.now()).toLocaleDateString()}
                </p>
            </div>
        </Card>
    )
}

const MediaLibrary: React.FC<MediaLibraryProps> = (props) => {
  const {
    mediaFiles,
    setMediaFiles = () => {},
    currentUser,
    appContext
  } = props;

    // Use global store for state management
    const { mediaFiles: globalMediaFiles, setMediaFiles: setGlobalMediaFiles, addMediaFile, updateMediaFile, removeMediaFile } = useGlobalStore();
    
    // Ephemeral UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MediaFileType | 'all'>('all');
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<MediaFileWithSync | null>(null);

    // Initial seed with mock data (stub sync until we finish getting working)
    useEffect(() => {
        const initializeWithMockData = () => {
            setLoading(true);
            setError(null);
            
            // Mock data to work with
            const mockFiles = [
                {
                    id: 'mf1',
                    name: 'Website Mockup Draft.png',
                    url: 'https://picsum.photos/seed/mf1/800/600',
                    type: 'image' as MediaFileType,
                    uploadedAt: new Date('2024-07-25T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                },
                {
                    id: 'mf2',
                    name: 'Client Kickoff Presentation.mp4',
                    url: 'https://picsum.photos/seed/mf2/800/600',
                    type: 'video' as MediaFileType,
                    uploadedAt: new Date('2024-07-24T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                },
                {
                    id: 'mf3',
                    name: 'Service Contract.pdf',
                    url: 'https://picsum.photos/seed/mf3/800/600',
                    type: 'document' as MediaFileType,
                    uploadedAt: new Date('2024-07-23T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                },
                {
                    id: 'mf4',
                    name: 'Final Logo Design.png',
                    url: 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500',
                    type: 'image' as MediaFileType,
                    uploadedAt: new Date('2024-07-22T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                },
                {
                    id: 'mf5',
                    name: 'Infrastructure Diagram.pdf',
                    url: 'https://picsum.photos/seed/mf5/800/600',
                    type: 'document' as MediaFileType,
                    uploadedAt: new Date('2024-07-21T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                },
                {
                    id: 'mf6',
                    name: 'Competitor Analysis.png',
                    url: 'https://picsum.photos/seed/mf6/800/600',
                    type: 'image' as MediaFileType,
                    uploadedAt: new Date('2024-07-20T21:35:46Z'),
                    syncStatus: 'synced' as SyncStatus
                }
            ];
            
            setMediaFiles(mockFiles);
            setLoading(false);
        };
        
        // Only initialize if we don't have files already
        if (mediaFiles.length === 0) {
            initializeWithMockData();
        }
    }, [setMediaFiles, mediaFiles.length]);

    // Normalize dates for all media files on component load (fallback for corrupted localStorage data)
    useEffect(() => {
        const normalizedFiles = mediaFiles.map(file => ({
            ...file,
            uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt || Date.now())
        }));
        
        // Only update if there are actually changes needed
        const needsUpdate = mediaFiles.some(file => !(file.uploadedAt instanceof Date));
        if (needsUpdate) {
            setMediaFiles(normalizedFiles);
        }
    }, []); // Only run once on mount

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

    // CREATE media file (state-only until sync is working)
    const handleUpload = async (newFileData: Omit<MediaFile, 'id'>) => {
        setError(null);
        setLoading(true);
        
        const newFile: MediaFileWithSync = {
            ...newFileData,
            id: `mf-${Date.now()}`,
            syncStatus: 'synced', // Pretend it's synced for now
        };
        
        // Add to state immediately
        addMediaFile(newFile);
        setUploadModalOpen(false);
        setLoading(false);
        
        // TODO: Add actual Supabase sync later
        console.log('File uploaded (state-only):', newFile);
    };
    
    const handleOpenFileDetails = (file: MediaFileWithSync) => {
        console.log('Opening file details for:', file.name);
        setSelectedFile(file);
        setDetailsModalOpen(true);
    };

    const handleOpenDeleteConfirm = () => {
        if (!selectedFile) return;
        setDetailsModalOpen(false);
        setDeleteModalOpen(true);
    };

    // DELETE media file (Supabase sync)
    const handleConfirmDelete = async () => {
        if (!selectedFile) return;
        setError(null);
        setLoading(true);
        try {
            // If file is not yet synced (temp id), just remove from local state
            if (selectedFile.id.startsWith('temp-')) {
                removeMediaFile(selectedFile.id);
                setDeleteModalOpen(false);
                setSelectedFile(null);
                return;
            }
            // Remove from Supabase Storage
            if (selectedFile.url) {
                const url = new URL(selectedFile.url);
                const path = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/media\//, ''));
                const { error: storageError } = await supabase.storage.from('media').remove([path]);
                if (storageError) {
                    setError('Failed to delete from storage: ' + storageError.message);
                    setLoading(false);
                    return;
                }
            }
            // Remove from database
            const { error: dbError } = await supabase.from('media_files').delete().eq('id', selectedFile.id);
            if (dbError) {
                setError('Failed to delete from database: ' + dbError.message);
                setLoading(false);
                return;
            }
            // Remove from state
            removeMediaFile(selectedFile.id);
            setDeleteModalOpen(false);
            setSelectedFile(null);
        } catch (err) {
            setError('Delete failed: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    // UPDATE media file (state-only until sync is working)
    const handleEditFile = async (updatedFile: MediaFile) => {
        setError(null);
        setLoading(true);
        
        // Update in state immediately
        updateMediaFile({ ...updatedFile, syncStatus: 'synced' });
        setLoading(false);
        
        // TODO: Add actual Supabase sync later
        console.log('File updated (state-only):', updatedFile);
    };

    // SYNC media file (upload to Supabase, update DB, update state)
    const handleSyncFile = async (file: LocalMediaFile) => {
        setError(null);
        setLoading(true);
        try {
            if (!file._localFile) {
                setError('No local file found for sync.');
                return;
            }
            // Check authentication
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setError('You must be logged in to sync files.');
                return;
            }
            // Generate unique path
            const uniqueName = `${Date.now()}_${Math.floor(Math.random()*10000)}_${file._localFile.name}`;
            const uploadPath = `uploads/${uniqueName}`;
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage.from('media').upload(uploadPath, file._localFile);
            if (error) {
                setError('File upload failed: ' + (error.message || 'Unknown error'));
                updateMediaFile({ ...file, syncStatus: 'error' });
                return;
            }
            const uploadedPath = data?.path || uploadPath;
            const publicUrl = supabase.storage.from('media').getPublicUrl(uploadedPath).data.publicUrl;
            if (!publicUrl) {
                setError('Failed to retrieve file URL.');
                updateMediaFile({ ...file, syncStatus: 'error' });
                return;
            }
            // Insert into media_files table
            const { data: inserted, error: insertError } = await supabase.from('media_files').insert([
                {
                    file_name: file.name,
                    name: file.name,
                    description: file.description || null,
                    file_type: file.file_type || file.type,
                    type: file.type,
                    url: publicUrl,
                    size: file.size,
                    uploaded_by: user.id,
                }
            ]).select();
            if (insertError || !inserted || !inserted[0]) {
                setError('Failed to save file metadata: ' + (insertError?.message || 'Unknown error'));
                updateMediaFile({ ...file, syncStatus: 'error' });
                return;
            }
            // Update local state: remove temp, add real
            removeMediaFile(file.id);
            addMediaFile({ ...inserted[0], syncStatus: 'synced' });
        } finally {
            setLoading(false);
        }
    };

    // Documentation:
    // - Persistent state: mediaFiles (Zustand global store, localStorage)
    // - Ephemeral state: modals, loading, error, filters (component state)

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'u') {
                event.preventDefault();
                setUploadModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className="p-4 space-y-6 min-h-screen">
                {loading && (
                    <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Syncing...
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredFiles.length} of {mediaFiles.length} files
                        </span>
                    </div>
                    <button 
                        onClick={() => setUploadModalOpen(true)} 
                        className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2"
                        title="Upload File (Ctrl+U)"
                        type="button"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload File
                        <span className="hidden lg:inline text-xs opacity-75">(Ctrl+U)</span>
                    </button>
                </div>
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    />
                    <select 
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    >
                        <option value="all">All File Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="document">Documents</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredFiles.map((file) => (
                        <MediaFileCard key={file.id} file={file as LocalMediaFile} onClick={() => handleOpenFileDetails(file as LocalMediaFile)} onSync={handleSyncFile} />
                    ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                    Debug: {filteredFiles.length} files found, {mediaFiles.length} total files
                </div>
                
                {filteredFiles.length === 0 && !loading && (
                    <Card className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No files found</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                    {searchTerm || typeFilter !== 'all' 
                                        ? 'Try adjusting your filters or search terms' 
                                        : 'Start by uploading your first file'}
                                </p>
                            </div>
                            {(!searchTerm && typeFilter === 'all') && (
                                <button 
                                    onClick={() => setUploadModalOpen(true)}
                                    className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                                >
                                    Upload Your First File
                                </button>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            <UploadFileModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSubmit={handleUpload}
            />
            
            <MediaFileDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                file={selectedFile}
                onDelete={handleOpenDeleteConfirm}
                onEdit={handleEditFile}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={selectedFile ? `Delete "${selectedFile.name}"?` : 'Delete file?'}
                message={selectedFile ? `Are you sure you want to delete "${selectedFile.name}"? This action cannot be undone.` : 'Are you sure you want to delete this file? This action cannot be undone.'}
            />
        </>
    );
};

export default MediaLibrary;
