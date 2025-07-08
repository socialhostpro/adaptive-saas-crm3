import React from 'react';

interface PartyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'defendant' | 'opposition';
  contactName: string;
  phone: string;
  email: string;
  address: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const PartyContactModal: React.FC<PartyContactModalProps> = ({
  isOpen,
  onClose,
  type,
  contactName,
  phone,
  email,
  address,
  onChange,
  onSave,
}) => {
  if (!isOpen) return null;
  const labelPrefix = type === 'defendant' ? 'Defendant' : 'Opposition';
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{labelPrefix} Contact Info</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{labelPrefix} Contact Name</label>
            <input type="text" name="contactName" value={contactName} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{labelPrefix} Phone</label>
            <input type="text" name="phone" value={phone} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{labelPrefix} Email</label>
            <input type="email" name="email" value={email} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{labelPrefix} Address</label>
            <input type="text" name="address" value={address} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold">Save</button>
          </div>
        </form>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
      </div>
    </div>
  );
};

export default PartyContactModal;
