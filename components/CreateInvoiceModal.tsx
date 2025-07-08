import React, { useState, useEffect } from 'react';
import { Contact, LineItem, Invoice, InvoiceStatus, Product } from '../types';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
    contacts: Contact[];
    products: Product[];
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSubmit, contacts, products }) => {
    const getInitialState = () => ({
        contactId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        lineItems: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
        status: InvoiceStatus.Draft,
        payments: []
    });

    const [formData, setFormData] = useState(getInitialState());
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);

    useEffect(() => {
        const newTotal = formData.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        setTotal(newTotal);
    }, [formData.lineItems]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleProductSelect = (itemId: string, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                lineItems: prev.lineItems.map(item =>
                    item.id === itemId ? { ...item, description: product.description, unitPrice: product.price } : item
                )
            }));
        }
    };


    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter(item => item.id !== id)
        }));
    };
    
    const handleSubmit = (status: InvoiceStatus) => {
        if (!formData.contactId || !formData.issueDate || !formData.dueDate || formData.lineItems.some(i => !i.description || i.quantity <= 0)) {
            alert('Please fill out all required fields, including contact, dates, and item descriptions.');
            return;
        }
        const contact = contacts.find(c => c.id === formData.contactId);
        if (!contact) return;
        
        onSubmit({
            ...formData,
            contactName: contact.name,
            totalAmount: total,
            status: status
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Invoice</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact *</label>
                            <select id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                                <option value="" disabled>Select a contact</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</label>
                            <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                         <div className="md:col-span-1">
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                            <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Items</h3>
                        <div className="space-y-3">
                           {formData.lineItems.map((item) => (
                               <div key={item.id} className="grid grid-cols-12 gap-x-3 gap-y-2 items-end bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    <div className="col-span-12 md:col-span-3">
                                       <label className="text-xs text-gray-500">Product/Service</label>
                                        <select onChange={(e) => handleProductSelect(item.id, e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm">
                                            <option value="">Custom Item</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                   </div>
                                   <div className="col-span-12 md:col-span-4">
                                       <label className="text-xs text-gray-500">Description</label>
                                       <input type="text" placeholder="Service or product details" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
                                   </div>
                                   <div className="col-span-4 md:col-span-1">
                                        <label className="text-xs text-gray-500">Qty</label>
                                       <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} min="1" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
                                   </div>
                                   <div className="col-span-4 md:col-span-2">
                                        <label className="text-xs text-gray-500">Unit Price</label>
                                       <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
                                   </div>
                                    <div className="col-span-3 md:col-span-1">
                                         <label className="text-xs text-gray-500">Total</label>
                                         <p className="text-sm font-medium pt-2 text-gray-800 dark:text-gray-200">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                                    </div>
                                   <div className="col-span-1 flex items-end justify-end">
                                       {formData.lineItems.length > 1 && <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon /></button>}
                                   </div>
                               </div>
                           ))}
                        </div>
                         <button onClick={handleAddItem} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            Add Item
                        </button>
                    </div>
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                        Total Amount: <span className="text-primary-600">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleSubmit(InvoiceStatus.Draft)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Save as Draft</button>
                        <button onClick={() => handleSubmit(InvoiceStatus.Sent)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Create & Send Invoice</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;