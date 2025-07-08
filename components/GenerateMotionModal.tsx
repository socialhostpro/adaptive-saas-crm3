import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { GoogleGenAI } from '@google/genai';

interface GenerateMotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (documentText: string, documentName: string) => void;
    caseItem: Case;
}

const documentTypes = [
    'Motion to Compel Discovery',
    'Motion for Summary Judgment',
    'Cease and Desist Letter',
    'Client Update Letter',
    'Case Summary Brief',
];

const GenerateMotionModal: React.FC<GenerateMotionModalProps> = ({ isOpen, onClose, onSave, caseItem }) => {
    const [documentType, setDocumentType] = useState(documentTypes[0]);
    const [instructions, setInstructions] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setInstructions('');
            setGeneratedText('');
            setIsLoading(false);
        }
    }, [isOpen]);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedText('');
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });
            const prompt = `You are an AI legal assistant. Your task is to draft a legal document based on a template and provided case information.
            
            Document Type: ${documentType}
            
            Case Information:
            - Case Name: ${caseItem.name}
            - Case Number: ${caseItem.caseNumber}
            - Client: ${caseItem.contactName}
            - Case Description: ${caseItem.description}
            
            User Instructions:
            "${instructions}"
            
            Please generate the full text of the "${documentType}". Make sure to use the provided case information to fill in the relevant details. Format the output professionally.`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-04-17', contents: prompt });
            setGeneratedText(response.text);

        } catch (error) {
            console.error("Error generating document:", error);
            setGeneratedText("Sorry, there was an error generating the document. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedText) return;
        onSave(generatedText, documentType);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Legal Document</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                        <select id="documentType" value={documentType} onChange={e => setDocumentType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                            {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Instructions</label>
                        <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} placeholder="e.g., 'Focus on the lack of response to interrogatories dated May 1st...'" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
                    </div>
                    <div className="text-center">
                        <button onClick={handleGenerate} disabled={isLoading} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-primary-400">
                            {isLoading ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    {generatedText && (
                        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                             <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Generated Document Preview:</h3>
                             <textarea readOnly value={generatedText} rows={10} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm font-mono"></textarea>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={!generatedText || isLoading} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400">Save to Case Files</button>
                </footer>
            </div>
        </div>
    );
};

export default GenerateMotionModal;
