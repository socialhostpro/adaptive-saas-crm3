import React, { useState } from 'react';
import { Edit, Plus, Trash2, Save, FileText, Type, Hash, Mail, Phone, Calendar, CheckSquare, List } from 'lucide-react';

interface FormBuilderProps {}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface Form {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  submissions: number;
}

const FormBuilder: React.FC<FormBuilderProps> = () => {
  const [forms, setForms] = useState<Form[]>([
    {
      id: '1',
      name: 'Lead Qualification Form',
      description: 'Capture and qualify potential customers',
      fields: [
        { id: '1', type: 'text', label: 'Full Name', required: true },
        { id: '2', type: 'email', label: 'Email Address', required: true },
        { id: '3', type: 'phone', label: 'Phone Number', required: false },
        { id: '4', type: 'select', label: 'Company Size', required: true, options: ['1-10', '11-50', '51-200', '200+'] },
        { id: '5', type: 'number', label: 'Budget Range', required: true },
      ],
      isActive: true,
      createdAt: '2024-01-15',
      submissions: 23,
    },
  ]);

  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Phone', icon: Phone },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'textarea', label: 'Text Area', icon: FileText },
  ];

  const addField = (type: FormField['type']) => {
    if (!selectedForm) return;

    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      required: false,
    };

    if (type === 'select') {
      newField.options = ['Option 1', 'Option 2'];
    }

    setSelectedForm({
      ...selectedForm,
      fields: [...selectedForm.fields, newField],
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!selectedForm) return;

    setSelectedForm({
      ...selectedForm,
      fields: selectedForm.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const removeField = (fieldId: string) => {
    if (!selectedForm) return;

    setSelectedForm({
      ...selectedForm,
      fields: selectedForm.fields.filter(field => field.id !== fieldId),
    });
  };

  const saveForm = () => {
    if (!selectedForm) return;

    setForms(forms.map(form =>
      form.id === selectedForm.id ? selectedForm : form
    ));
    setIsEditing(false);
  };

  const createNewForm = () => {
    const newForm: Form = {
      id: Date.now().toString(),
      name: 'New Form',
      description: 'Form description',
      fields: [],
      isActive: false,
      createdAt: new Date().toISOString().split('T')[0],
      submissions: 0,
    };

    setForms([...forms, newForm]);
    setSelectedForm(newForm);
    setIsEditing(true);
  };

  const renderFormsList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Forms</h3>
          <button
            onClick={createNewForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Form Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fields
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Submissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {forms.map((form) => (
              <tr key={form.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{form.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {form.fields.length} fields
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {form.submissions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    form.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedForm(form);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFormEditor = () => {
    if (!selectedForm) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Form Builder</h3>
              <div className="flex space-x-2">
                <button
                  onClick={saveForm}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            </div>

            {/* Form Settings */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Name
                </label>
                <input
                  type="text"
                  value={selectedForm.name}
                  onChange={(e) => setSelectedForm({...selectedForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedForm.description}
                  onChange={(e) => setSelectedForm({...selectedForm, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {selectedForm.fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Field {index + 1}
                    </span>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                      >
                        {fieldTypes.map(({ type, label }) => (
                          <option key={type} value={type}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">Required</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Field Types Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add Field</h4>
            <div className="space-y-2">
              {fieldTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addField(type as FormField['type'])}
                  className="w-full flex items-center p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage conversational forms</p>
            </div>
          </div>
          
          {selectedForm && isEditing && (
            <button
              onClick={() => {
                setSelectedForm(null);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back to Forms
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedForm || !isEditing ? renderFormsList() : renderFormEditor()}
    </div>
  );
};

export default FormBuilder;
