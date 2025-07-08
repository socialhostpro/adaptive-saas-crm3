
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AIDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertText: (text: string) => void;
    promptContext?: string;
}

const AIDraftModal: React.FC<AIDraftModalProps> = ({ isOpen, onClose, onInsertText, promptContext }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setGeneratedText('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const fullPrompt = `${promptContext || 'You are a helpful writing assistant.'}\n\nDraft the following based on this prompt: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-04-17', contents: fullPrompt });
            setGeneratedText(response.text);
        } catch (error) {
            console.error("Error generating text:", error);
            setGeneratedText("Sorry, an error occurred while generating the text.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInsert = () => {
        onInsertText(generatedText);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Draft with AI</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
                        <textarea id="ai-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} placeholder="e.g., Write a follow up email about our proposal..." className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
                    </div>
                     <div className="text-center">
                        <button onClick={handleGenerate} disabled={isLoading} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-primary-400">
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                    {generatedText && (
                        <div>
                             <label htmlFor="ai-result" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generated Text</label>
                             <textarea id="ai-result" readOnly value={generatedText} rows={8} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm font-sans"></textarea>
                        </div>
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleInsert} disabled={!generatedText || isLoading} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400">Insert Text</button>
                </footer>
            </div>
        </div>
    );
};

export default AIDraftModal;
