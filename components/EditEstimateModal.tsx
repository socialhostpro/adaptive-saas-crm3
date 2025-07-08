import React, { useState, useEffect } from 'react';
import { Estimate, Contact, LineItem } from '../types';

interface EditEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: Estimate;
  onSubmit: (updatedEstimate: Estimate) => void;
}

const EditEstimateModal: React.FC<EditEstimateModalProps> = ({ isOpen, onClose, estimate, onSubmit }) => {
  const [formData, setFormData] = useState<Estimate>(estimate);

  useEffect(() => {
    setFormData(estimate);
  }, [estimate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (idx: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems?.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: formData.lineItems?.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) || 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Estimate</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
        </header>
        <main className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
            <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Line Items</label>
            <div className="space-y-2">
              {formData.lineItems?.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input type="text" value={item.description} onChange={e => handleLineItemChange(idx, 'description', e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm" placeholder="Description" />
                  <input type="number" value={item.quantity} min={1} onChange={e => handleLineItemChange(idx, 'quantity', Number(e.target.value))} className="w-16 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm" placeholder="Qty" />
                  <input type="number" value={item.unitPrice} min={0} step={0.01} onChange={e => handleLineItemChange(idx, 'unitPrice', Number(e.target.value))} className="w-20 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm" placeholder="Unit Price" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
          <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save Changes</button>
        </footer>
      </form>
    </div>
  );
};

export default EditEstimateModal;
