
import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types';

interface EditEmailTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: EmailTemplate;
    onSave: (updatedTemplate: EmailTemplate) => void;
}

const EditEmailTemplateModal: React.FC<EditEmailTemplateModalProps> = ({ isOpen, onClose, template, onSave }) => {
    const [subject, setSubject] = useState(template.subject);
    const [body, setBody] = useState(template.body);

    useEffect(() => {
        setSubject(template.subject);
        setBody(template.body);
    }, [template]);

    const handleSave = () => {
        onSave({ ...template, subject, body });
    };

    const copyPlaceholder = (placeholder: string) => {
        navigator.clipboard.writeText(placeholder);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit: {template.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <div className="flex-grow flex flex-col md:flex-row min-h-0">
                    <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                            <textarea
                                id="body"
                                rows={15}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-mono"
                            ></textarea>
                        </div>
                    </main>
                    <aside className="w-full md:w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Placeholders</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Click to copy a placeholder to use in your subject or body.</p>
                        <div className="space-y-1">
                            {template.placeholders.map(ph => (
                                <button
                                    key={ph}
                                    onClick={() => copyPlaceholder(ph)}
                                    className="w-full text-left text-xs font-mono p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    {ph}
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save Template</button>
                </footer>
            </div>
        </div>
    );
};

export default EditEmailTemplateModal;
