import React, { useEffect, useState } from 'react';
import { EmailTemplate } from '../../types';
import EditEmailTemplateModal from './EditEmailTemplateModal';
import { supabase } from '../../lib/supabaseClient';

const EmailNotificationSettings: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.from('email_templates').select('*');
            if (error) {
                setError('Failed to load email templates');
                setTemplates([]);
            } else {
                setTemplates(data || []);
            }
            setLoading(false);
        };
        fetchTemplates();
    }, []);

    const handleToggle = async (id: string, isEnabled: boolean) => {
        setToggleLoading(id);
        setError(null);
        const { data, error } = await supabase.from('email_templates').update({ isEnabled }).eq('id', id).select();
        if (error) {
            setError('Failed to update template status');
        } else if (data && data[0]) {
            setTemplates(prev => prev.map(t => (t.id === id ? data[0] : t)));
        }
        setToggleLoading(null);
    };

    const handleEditClick = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setEditModalOpen(true);
    };

    const handleSaveChanges = async (updatedTemplate: EmailTemplate) => {
        setError(null);
        const { data, error } = await supabase.from('email_templates').update(updatedTemplate).eq('id', updatedTemplate.id).select();
        if (error) {
            setError('Failed to update template');
        } else if (data && data[0]) {
            setTemplates(prev => prev.map(t => (t.id === updatedTemplate.id ? data[0] : t)));
            setEditModalOpen(false);
        }
    };

    if (loading) return <div className="text-center py-4">Loading email templates...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Email Notifications</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage automated emails sent to clients and staff.</p>
                </div>
                <div className="space-y-4">
                    {templates.map(template => (
                        <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={template.isEnabled}
                                            onChange={(e) => handleToggle(template.id, e.target.checked)}
                                            className="sr-only peer"
                                            disabled={toggleLoading === template.id}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                                    </label>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 md:ml-14">{template.description}</p>
                            </div>
                            <div className="flex-shrink-0 self-end md:self-center">
                                <button onClick={() => handleEditClick(template)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                                    Edit Template
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {selectedTemplate && (
                <EditEmailTemplateModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    template={selectedTemplate}
                    onSave={handleSaveChanges}
                />
            )}
        </>
    );
};

export default EmailNotificationSettings;
