import React, { useState, useEffect } from 'react';
import { MediaFile, MediaFileType } from '../types';
import { supabase } from '../hooks/useAppStore';

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: Omit<MediaFile, 'id'>) => void;
}

const getInitialState = () => ({
    name: '',
    url: '',
    type: 'image' as MediaFileType,
});

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (file: File) => {
        const { data, error } = await supabase.storage.from('media').upload(`uploads/${file.name}`, file);
        if (error) {
            console.error('Error uploading file:', error.message);
            alert('File upload failed. Please try again.');
            return;
        }
        const publicUrl = supabase.storage.from('media').getPublicUrl(`uploads/${file.name}`).data.publicUrl;
        if (!publicUrl) {
            alert('Failed to retrieve file URL.');
            return;
        }
        onSubmit({
            name: file.name,
            url: publicUrl,
            type: formData.type,
            uploadedAt: new Date(),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url) {
            alert('Please fill out all fields to simulate the upload.');
            return;
        }
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (file) {
            await handleFileUpload(file);
        } else {
            alert('Please select a file to upload.');
        }
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
                        <input type="file" id="fileInput" name="file" required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"/>
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
                    <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Add to Library</button>
                </footer>
            </form>
        </div>
    );
};

export default UploadFileModal;