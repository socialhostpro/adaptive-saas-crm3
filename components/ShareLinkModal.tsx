
import React, { useState, useEffect } from 'react';

interface ShareLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, link }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Share Public Link</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Share this link with your customer. They will be able to view the document without logging in.
                    </p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            readOnly
                            value={link}
                            className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
                        />
                        <button
                            onClick={handleCopy}
                            className={`font-semibold px-4 py-2 rounded-lg transition-colors text-nowrap ${
                                copied 
                                ? 'bg-green-600 text-white' 
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ShareLinkModal;
