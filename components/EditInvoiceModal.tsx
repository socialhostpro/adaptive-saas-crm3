import React, { useState, useEffect } from 'react';
import { Invoice, Contact, LineItem, InvoiceStatus } from '../types';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSubmit: (updatedInvoice: Invoice) => void;
  contacts: Contact[];
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ isOpen, onClose, invoice, onSubmit, contacts }) => {
  const [formData, setFormData] = useState<Invoice>(invoice);

  useEffect(() => {
    setFormData(invoice);
  }, [invoice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (contactId: string) => {
    const selectedContact = contacts.find(c => c.id === contactId);
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        contactId,
        contactName: selectedContact.name
      }));
    }
  };

  const handleLineItemChange = (idx: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = formData.lineItems?.map((item, i) => {
      if (i === idx) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    }) || [];
    
    const totalAmount = newLineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    
    setFormData(prev => ({
      ...prev,
      lineItems: newLineItems,
      totalAmount
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    
    setFormData(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem]
    }));
  };

  const removeLineItem = (idx: number) => {
    const newLineItems = formData.lineItems?.filter((_, i) => i !== idx) || [];
    const totalAmount = newLineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    
    setFormData(prev => ({
      ...prev,
      lineItems: newLineItems,
      totalAmount
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Invoice</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&times;</button>
        </header>
        
        <main className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Number</label>
              <input 
                type="text" 
                name="invoiceNumber" 
                value={formData.invoiceNumber} 
                onChange={handleInputChange} 
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={InvoiceStatus.Draft}>Draft</option>
                <option value={InvoiceStatus.Sent}>Sent</option>
                <option value={InvoiceStatus.PartiallyPaid}>Partially Paid</option>
                <option value={InvoiceStatus.Paid}>Paid</option>
                <option value={InvoiceStatus.Overdue}>Overdue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</label>
              <select 
                value={formData.contactId} 
                onChange={(e) => handleContactChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>{contact.name} - {contact.company}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Date</label>
              <input 
                type="date" 
                name="issueDate" 
                value={formData.issueDate} 
                onChange={handleInputChange} 
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input 
                type="date" 
                name="dueDate" 
                value={formData.dueDate} 
                onChange={handleInputChange} 
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.lineItems?.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Item description"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total</label>
                    <div className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )) || []}
            </div>
            
            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: ${formData.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors ml-auto"
          >
            Save Changes
          </button>
        </footer>
      </form>
    </div>
  );
};

export default EditInvoiceModal;
