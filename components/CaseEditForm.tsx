import React from 'react';
import { Case, TeamMember, Contact, Opportunity, CaseStatus } from '../types';
import PartyContactModal from './PartyContactModal';

interface CaseEditFormProps {
  editData: Case;
  teamMembers: TeamMember[];
  contacts: Contact[];
  opportunities: Opportunity[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const CASE_TYPE_OPTIONS = [
  'Civil',
  'Criminal',
  'Family',
  'Probate',
  'Juvenile',
  'Other',
];

const CaseEditForm: React.FC<CaseEditFormProps> = ({ editData, teamMembers, contacts, opportunities, onChange, onCancel, onSave }) => {
  // Modal state for party contact editing
  const [showDefendantModal, setShowDefendantModal] = React.useState(false);
  const [showOppositionModal, setShowOppositionModal] = React.useState(false);
  // Local state for modal fields
  const [defendantFields, setDefendantFields] = React.useState({
    contactName: editData.defendantContactName || '',
    phone: editData.defendantPhone || '',
    email: editData.defendantEmail || '',
    address: editData.defendantAddress || '',
  });
  const [oppositionFields, setOppositionFields] = React.useState({
    contactName: editData.oppositionContactName || '',
    phone: editData.oppositionPhone || '',
    email: editData.oppositionEmail || '',
    address: editData.oppositionAddress || '',
  });

  // Handlers for modal field changes
  const handleDefendantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDefendantFields(prev => ({ ...prev, [name]: value }));
  };
  const handleOppositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOppositionFields(prev => ({ ...prev, [name]: value }));
  };
  // Save modal fields to main form
  const saveDefendantFields = () => {
    onChange({
      target: {
        name: 'defendantContactName',
        value: defendantFields.contactName,
      } as any,
    } as any);
    onChange({ target: { name: 'defendantPhone', value: defendantFields.phone } } as any);
    onChange({ target: { name: 'defendantEmail', value: defendantFields.email } } as any);
    onChange({ target: { name: 'defendantAddress', value: defendantFields.address } } as any);
    setShowDefendantModal(false);
  };
  const saveOppositionFields = () => {
    onChange({ target: { name: 'oppositionContactName', value: oppositionFields.contactName } } as any);
    onChange({ target: { name: 'oppositionPhone', value: oppositionFields.phone } } as any);
    onChange({ target: { name: 'oppositionEmail', value: oppositionFields.email } } as any);
    onChange({ target: { name: 'oppositionAddress', value: oppositionFields.address } } as any);
    setShowOppositionModal(false);
  };

  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(); }}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Name</label>
        <input type="text" name="name" value={editData.name} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea name="description" value={editData.description} onChange={onChange} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"></textarea>
      </div>
      
      {/* Case Features/Charges Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Case Features & Charges</label>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="mb-3">
            <label htmlFor="charges" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Charges/Features (one per line)</label>
            <textarea 
              id="charges" 
              name="charges" 
              value={editData.charges?.join('\n') || ''} 
              onChange={(e) => {
                const charges = e.target.value.split('\n').filter(charge => charge.trim() !== '');
                onChange({
                  target: {
                    name: 'charges',
                    value: charges
                  }
                } as any);
              }}
              rows={4}
              placeholder="Enter charges or case features, one per line..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {editData.charges?.map((charge, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs font-medium">
                {charge}
                <button
                  type="button"
                  onClick={() => {
                    const newCharges = editData.charges?.filter((_, i) => i !== index) || [];
                    onChange({
                      target: {
                        name: 'charges',
                        value: newCharges
                      }
                    } as any);
                  }}
                  className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="assigned" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Attorney</label>
          <div className="flex items-center gap-2">
            <select id="assigned" name="assigned" value={editData.assigned || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
              <option value="">Select lead attorney</option>
              {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name} - {tm.role}</option>)}
            </select>
            <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Team Member">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="attorneyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attorney ID</label>
          <div className="flex items-center gap-2">
            <input type="text" id="attorneyId" name="attorneyId" value={editData.attorneyId || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="Attorney bar number or ID"/>
            <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Verify Attorney ID">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
        <div className="flex items-center gap-2">
          <select id="contact" name="contact" value={editData.contact || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
            <option value="" disabled>Select contact</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Contact">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="opportunity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity</label>
        <div className="flex items-center gap-2">
          <select id="opportunity" name="opportunity" value={editData.opportunity || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
            <option value="" disabled>Select opportunity</option>
            {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
          <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Opportunity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="consual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opposing Consual</label>
        <div className="flex items-center gap-2">
          <input type="text" id="consual" name="consual" value={editData.consual || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
          <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Consual">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="defendant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Defendant</label>
          <div className="flex items-center gap-2">
            <input type="text" id="defendant" name="defendant" value={editData.defendant || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
            <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Defendant">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="judge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judge</label>
          <div className="flex items-center gap-2">
            <input type="text" id="judge" name="judge" value={editData.judge || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
            <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Judge">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Open Date</label>
          <input type="date" id="openDate" name="openDate" value={editData.openDate ? editData.openDate.split('T')[0] : ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Close Date (if applicable)</label>
          <input type="date" id="closeDate" name="closeDate" value={editData.closeDate ? editData.closeDate.split('T')[0] : ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Number</label>
        <div className="flex items-center gap-2">
          <input type="text" id="caseNumber" name="caseNumber" value={editData.caseNumber} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" placeholder="Enter case number"/>
          <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Generate Case Number">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Status</label>
          <select id="status" name="status" value={editData.status} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
            {Object.values(CaseStatus).map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Type</label>
          <div className="flex items-center gap-2">
            <select id="caseType" name="caseType" value={editData.caseType || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
              <option value="" disabled>Select case type</option>
              {CASE_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <button type="button" className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800" title="Add Case Type">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </div>
      {/* Defendant Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Defendant Contact Name</label>
          <input type="text" name="defendantContactName" value={editData.defendantContactName || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
        </div>
        <button type="button" onClick={() => setShowDefendantModal(true)} className="p-2 rounded bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-200 font-semibold">Edit All Defendant Info</button>
      </div>
      {/* Opposition Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opposition Contact Name</label>
          <input type="text" name="oppositionContactName" value={editData.oppositionContactName || ''} onChange={onChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm" />
        </div>
        <button type="button" onClick={() => setShowOppositionModal(true)} className="p-2 rounded bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-200 font-semibold">Edit All Opposition Info</button>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold">Cancel</button>
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold">Save</button>
      </div>
      {/* Modals for party contact info */}
      <PartyContactModal
        isOpen={showDefendantModal}
        onClose={() => setShowDefendantModal(false)}
        type="defendant"
        contactName={defendantFields.contactName}
        phone={defendantFields.phone}
        email={defendantFields.email}
        address={defendantFields.address}
        onChange={handleDefendantChange}
        onSave={saveDefendantFields}
      />
      <PartyContactModal
        isOpen={showOppositionModal}
        onClose={() => setShowOppositionModal(false)}
        type="opposition"
        contactName={oppositionFields.contactName}
        phone={oppositionFields.phone}
        email={oppositionFields.email}
        address={oppositionFields.address}
        onChange={handleOppositionChange}
        onSave={saveOppositionFields}
      />
    </form>
  );
};

export default CaseEditForm;
