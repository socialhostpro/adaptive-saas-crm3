import React, { useState, useEffect } from 'react';
import { MediaFile, MediaFileType } from '../types';
import { supabase } from '../hooks/useAppStore';
import useGlobalStore from './useGlobalStoreProxy';

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getInitialState = () => ({
    name: '',
    url: '',
    type: 'image' as MediaFileType,
});

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'text/plain', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.pdf', '.csv'];

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ ...getInitialState(), description: '' });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const addMediaFile = useGlobalStore((state) => state.addMediaFile);
    const userId = useGlobalStore((state) => state.userId);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setErrorMsg(null);
        try {
            // Upload to Supabase Storage under user folder
            const filePath = `${userId}/${Date.now()}-${file.name}`;
            console.log('Uploading to Supabase Storage:', { bucket: 'media', filePath, file });
            const { data: storageData, error: storageError } = await supabase.storage.from('media').upload(filePath, file);
            if (storageError) {
                console.error('Supabase Storage upload error:', storageError);
                setErrorMsg('Failed to upload to storage: ' + storageError.message);
                return;
            }
            console.log('Supabase Storage upload success:', storageData);
            // Get public URL
            const publicUrlResult = supabase.storage.from('media').getPublicUrl(filePath);
            console.log('Public URL result:', publicUrlResult);
            const { publicUrl } = publicUrlResult.data;
            // Insert metadata to DB
            let file_type: 'image' | 'video' | 'document' | 'audio' | 'other' = 'other';
            if (file.type.startsWith('image/')) file_type = 'image';
            else if (file.type.startsWith('video/')) file_type = 'video';
            else if (file.type.startsWith('audio/')) file_type = 'audio';
            else if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type === 'text/csv' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') file_type = 'document';
            // Debug log for filename
            console.log('Uploading file:', { formName: formData.name, fileName: file.name });
            const safeName = formData.name && formData.name.trim() ? formData.name : (file.name && file.name.trim() ? file.name : `file_${Date.now()}`);
            const { error: dbError } = await supabase.from('media_files').insert([
                {
                    name: safeName,
                    aiDescription: formData.description || null,
                    file_type: file_type,
                    type: formData.type || file_type,
                    url: publicUrl,
                    size: file.size,
                    uploaded_by: userId,
                    uploadedAt: new Date().toISOString(),
                }
            ]);
            if (dbError) {
                setErrorMsg('Failed to save metadata: ' + dbError.message);
                return;
            }
            addMediaFile({
                id: `${userId}-${Date.now()}`,
                name: formData.name || file.name,
                description: formData.description || null,
                file_type: file_type,
                type: formData.type || file_type,
                url: publicUrl,
                size: file.size,
                uploaded_by: userId,
                syncStatus: 'synced',
                _localFile: file,
                uploadedAt: new Date(),
            });
            onClose();
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) {
            setErrorMsg('Please select a file to upload.');
            return;
        }
        const isAllowedType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isAllowedType) {
            setErrorMsg('Unsupported file type. Please upload an image, txt, pdf, or csv file.');
            return;
        }
        await handleFileUpload(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload New File</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select File *</label>
                        <input type="file" id="fileInput" name="file" required accept=".jpg,.jpeg,.png,.gif,.webp,.txt,.pdf,.csv" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white" onChange={e => {
                            setErrorMsg(null);
                            handleInputChange(e);
                            const file = e.target.files?.[0];
                            if (file) {
                                const isAllowedType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
                                if (!isAllowedType) {
                                    setErrorMsg('Unsupported file type. Please upload an image, txt, pdf, or csv file.');
                                    e.target.value = '';
                                    setFormData(prev => ({ ...prev, name: '' }));
                                    return;
                                }
                                setFormData(prev => ({ ...prev, name: file.name }));
                            }
                        }}/>
                        {errorMsg && <div className="text-red-600 text-sm mt-1">{errorMsg}</div>}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white" rows={2} />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Type</label>
                        <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                        </select>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center min-w-[120px]" disabled={isUploading}>
                        {isUploading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            'Add to Library'
                        )}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default UploadFileModal;