

import React, { useState } from 'react';
import AIDraftModal from './AIDraftModal';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientEmail: string;
    subject?: string;
}

const SparklesIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className={className}><path d="M12 2.25a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm-3.75 9a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v.008l.008.008.016.032a2.25 2.25 0 01.488 3.568l.002.002.002.002.001.001a2.25 2.25 0 01-3.08 3.513l-.008-.008-.024-.024-.032-.04a2.25 2.25 0 01-3.5-3.042l.001-.002.002-.002.002-.002.005-.005.009-.01.018-.018.03-.03.04-.04.05-.05.05-.05.06-.06.06-.05.07-.06.07-.05.08-.05.08-.05.09-.05.09-.04a.75.75 0 01.75-.75z" /></svg>;

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, recipientName, recipientEmail, subject: initialSubject = '' }) => {
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState('');
    const [isAIDraftOpen, setAIDraftOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            to: recipientEmail,
            subject,
            body,
        });
        alert(`Email to ${recipientName} sent! (Check console for details)`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Compose Email</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                            <input
                                type="text"
                                id="to"
                                readOnly
                                value={`${recipientName} <${recipientEmail}>`}
                                className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                                <button type="button" onClick={() => setAIDraftOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
                                    <SparklesIcon className="w-3 h-3"/> AI Draft
                                </button>
                            </div>
                            <textarea
                                id="body"
                                rows={8}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                required
                            ></textarea>
                        </div>
                    </main>
                    <footer className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Send Email</button>
                    </footer>
                </form>
            </div>
            <AIDraftModal
                isOpen={isAIDraftOpen}
                onClose={() => setAIDraftOpen(false)}
                onInsertText={(text) => setBody(text)}
                promptContext={`You are an AI assistant helping a user write a professional email to ${recipientName}.`}
            />
        </>
    );
};

export default EmailModal;