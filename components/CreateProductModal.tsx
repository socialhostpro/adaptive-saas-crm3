
import React, { useState, useEffect } from 'react';
import { Product, MediaFile } from '../types';
import MediaLibraryModal from './MediaLibraryModal';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Omit<Product, 'id'>) => void;
    mediaFiles: MediaFile[];
}

const getInitialState = () => ({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
});

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSubmit, mediaFiles }) => {
    const [formData, setFormData] = useState(getInitialState());
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.price <= 0) {
            alert('Please provide a product name and a price greater than 0.');
            return;
        }
        onSubmit(formData);
    };

    const handleSelectFile = (file: MediaFile) => {
        if (file.type === 'image') {
            setFormData(prev => ({ ...prev, imageUrl: file.url }));
            setMediaLibraryOpen(false);
        } else {
            alert("Please select an image file.");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Product or Service</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Service Name *</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required min="0.01" step="0.01" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                            <div className="flex items-center gap-4">
                                <img src={formData.imageUrl || 'https://placehold.co/100x75/e2e8f0/e2e8f0'} alt="Product" className="h-16 w-20 object-cover rounded-md bg-gray-100 dark:bg-gray-700" />
                                <button type="button" onClick={() => setMediaLibraryOpen(true)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                    Choose from Library
                                </button>
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save Product</button>
                    </footer>
                </form>
            </div>
            <MediaLibraryModal
                isOpen={isMediaLibraryOpen}
                onClose={() => setMediaLibraryOpen(false)}
                mediaFiles={mediaFiles}
                onSelectFile={handleSelectFile}
                />
        </>
    );
};

export default CreateProductModal;
