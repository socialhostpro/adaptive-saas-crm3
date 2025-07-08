import React, { useState } from 'react';
import { Invoice, Estimate, Contact } from '../types';

interface InvoiceEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice?: Invoice;
    estimate?: Estimate;
    contacts: Contact[];
    onViewDocument: () => void;
}

const InvoiceEmailModal: React.FC<InvoiceEmailModalProps> = ({ 
    isOpen, 
    onClose, 
    invoice, 
    estimate, 
    contacts,
    onViewDocument 
}) => {
    const document = invoice || estimate;
    const documentType = invoice ? 'Invoice' : 'Estimate';
    const documentNumber = invoice ? invoice.invoiceNumber : estimate?.estimateNumber;
    
    // Get contact email from contacts array
    const contact = contacts.find(c => c.id === document?.contactId);
    const contactEmail = contact?.email || 'contact@example.com';
    
    const [subject, setSubject] = useState(
        `${documentType} ${documentNumber} from Your Company`
    );
    
    const [body, setBody] = useState(
        `Dear ${document?.contactName},

I hope this email finds you well.

Please find attached ${documentType.toLowerCase()} ${documentNumber} for your review. The ${documentType.toLowerCase()} details are as follows:

${documentType} Number: ${documentNumber}
${invoice ? 'Amount Due' : 'Amount'}: $${invoice ? (invoice.totalAmount - invoice.payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2) : estimate?.amount.toFixed(2)}
${invoice ? `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}` : `Valid Until: ${new Date(estimate?.expiryDate || '').toLocaleDateString()}`}

You can view and ${invoice ? 'pay' : 'accept'} this ${documentType.toLowerCase()} online by clicking the "View ${documentType}" button below or visiting the link in this email.

If you have any questions regarding this ${documentType.toLowerCase()}, please don't hesitate to contact us.

Thank you for your business!

Best regards,
Your Company Name
Contact Information
Email: billing@yourcompany.com
Phone: (555) 123-4567`
    );

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Here you would integrate with your email service
            console.log('Sending email:', {
                to: contactEmail,
                subject,
                body,
                documentType,
                documentNumber
            });
            
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert(`${documentType} email sent successfully to ${document?.contactName}!`);
            onClose();
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Email {documentType}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {documentType} {documentNumber} to {document.contactName}
                        </p>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        &times;
                    </button>
                </header>
                
                <main className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                To
                            </label>
                            <input
                                type="text"
                                id="to"
                                readOnly
                                value={`${document.contactName} <${contactEmail}>`}
                                className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message
                        </label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={12}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            required
                        />
                    </div>

                    {/* Document Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            {documentType} Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Number:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{documentNumber}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {invoice ? 'Amount Due:' : 'Amount:'}
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    ${invoice ? 
                                        (invoice.totalAmount - invoice.payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2) : 
                                        estimate?.amount.toFixed(2)
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {invoice ? 'Due Date:' : 'Valid Until:'}
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {invoice ? 
                                        new Date(invoice.dueDate).toLocaleDateString() : 
                                        new Date(estimate?.expiryDate || '').toLocaleDateString()
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {invoice ? invoice.status : estimate?.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
                
                <footer className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onViewDocument}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 15C3.732 11.943 7.523 9 12 9s8.268 2.943 9.542 6c-1.274 3.057-5.064 6-9.542 6S3.732 18.057 2.458 15z" />
                        </svg>
                        View {documentType}
                    </button>
                    
                    <div className="flex gap-3 sm:ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send Email
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default InvoiceEmailModal;
