import React, { useState, useEffect } from 'react';
import { CompanyProfile, MediaFile } from '../../types';
import MediaLibraryModal from '../MediaLibraryModal';
import { supabase } from '../../lib/supabaseClient';

interface CompanyDetailsProps {
    mediaFiles: MediaFile[];
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ mediaFiles }) => {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile & { id: string; country: string; logoUrl?: string } | null>(null);
    const [formData, setFormData] = useState<CompanyProfile & { id: string; country: string; logoUrl?: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.from('company_profile').select('*').single();
            if (error) {
                setError('Failed to load company profile');
                setCompanyProfile(null);
                setFormData(null);
            } else {
                // Map logo_url to logoUrl for local state
                const mapped = { ...data, logoUrl: data.logo_url };
                setCompanyProfile(mapped);
                setFormData(mapped);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : prev);
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        setError(null);
        // Map logoUrl to logo_url for Supabase
        const updateData = { ...formData, logo_url: formData.logoUrl };
        delete updateData.logoUrl;
        const { data, error } = await supabase.from('company_profile').update(updateData).eq('id', formData.id).select();
        if (error) {
            setError('Failed to update company profile');
        } else if (data && data[0]) {
            const mapped = { ...data[0], logoUrl: data[0].logo_url };
            setCompanyProfile(mapped);
            setFormData(mapped);
            setIsEditing(false);
        }
        setSaving(false);
    };

    const handleSelectLogo = (file: MediaFile) => {
        if (file.type === 'image') {
            setFormData(prev => prev ? { ...prev, logoUrl: file.url } : prev);
            setMediaLibraryOpen(false);
        } else {
            alert('Please select an image file for the company logo.');
        }
    };

    if (loading) return <div className="text-center py-4">Loading company profile...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;
    if (!formData) return null;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company Profile</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">Edit</button>
                    )}
                </div>

                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Logo</label>
                        <div className="flex items-center gap-4">
                             <img 
                                src={formData.logoUrl || 'https://placehold.co/100x75/e2e8f0/e2e8f0'} 
                                alt="Company logo preview" 
                                className="h-16 w-auto bg-gray-100 dark:bg-gray-700 rounded-lg p-1"
                             />
                            <button 
                                type="button" 
                                onClick={() => setMediaLibraryOpen(true)}
                                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                            >
                                Change Logo
                            </button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                        <input type="text" name="website" value={formData.website} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Zip Code</label>
                            <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} disabled={!isEditing} className="mt-1 w-full bg-transparent text-gray-900 dark:text-white p-1 disabled:border-transparent border-b-2 border-transparent focus:outline-none focus:ring-0 focus:border-primary-500" />
                        </div>
                    </div>
                </div>
                {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => { setIsEditing(false); setFormData(companyProfile); }} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                )}
            </div>
            <MediaLibraryModal 
                isOpen={isMediaLibraryOpen}
                onClose={() => setMediaLibraryOpen(false)}
                mediaFiles={mediaFiles}
                onSelectFile={handleSelectLogo}
            />
        </>
    );
};

export default CompanyDetails;
