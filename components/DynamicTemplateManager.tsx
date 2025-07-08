import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Code, 
  Mail, 
  RefreshCw,
  AlertCircle,
  Save,
  X,
  Users
} from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';
import TemplateCompanyManager from './TemplateCompanyManager';

interface DynamicTemplate {
  id: string;
  name: string;
  generation: 'legacy' | 'dynamic';
  updated_at: string;
  versions?: TemplateVersion[];
}

interface TemplateVersion {
  id: string;
  template_id: string;
  active: number;
  name: string;
  html_content?: string;
  plain_content?: string;
  subject: string;
  updated_at: string;
  editor: 'code' | 'design';
  test_data?: any;
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: DynamicTemplate) => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose, onTemplateCreated }) => {
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [plainContent, setPlainContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !subject.trim()) {
      setError('Template name and subject are required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await sendGridService.createCompleteTemplate({
        name: templateName,
        subject,
        htmlContent: htmlContent || `<html><body><h1>{{subject}}</h1><p>Hello {{name}},</p><p>This is a test email.</p></body></html>`,
        plainContent: plainContent || undefined,
        testData: { name: 'Test User' }
      });

      if (result.success && result.template) {
        onTemplateCreated(result.template);
        onClose();
        setTemplateName('');
        setSubject('');
        setHtmlContent('');
        setPlainContent('');
      } else {
        setError(result.error || 'Failed to create template');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Template
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              HTML Content (Optional)
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter HTML content (leave empty for default template)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plain Text Content (Optional)
            </label>
            <textarea
              value={plainContent}
              onChange={(e) => setPlainContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter plain text version (leave empty to auto-generate)"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DynamicTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<DynamicTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DynamicTemplate | null>(null);
  const [templateVersions, setTemplateVersions] = useState<TemplateVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState<{ templateId: string; templateName: string } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await sendGridService.getDynamicTemplates();
      if (result.success) {
        setTemplates(result.templates || []);
      } else {
        setError(result.error || 'Failed to load templates');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateVersions = async (templateId: string) => {
    setLoadingVersions(true);
    try {
      const result = await sendGridService.getTemplateVersions(templateId);
      if (result.success) {
        setTemplateVersions(result.versions || []);
      } else {
        console.error('Failed to load template versions:', result.error);
      }
    } catch (err: any) {
      console.error('Error loading template versions:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await sendGridService.deleteDynamicTemplate(templateId);
      if (result.success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
          setTemplateVersions([]);
        }
      } else {
        alert('Failed to delete template: ' + result.error);
      }
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
    }
  };

  const handleDuplicateTemplate = async (template: DynamicTemplate) => {
    const newName = prompt('Enter name for the duplicated template:', `${template.name} (Copy)`);
    if (!newName) return;

    try {
      const result = await sendGridService.duplicateTemplate(template.id, newName);
      if (result.success && result.template) {
        setTemplates([...templates, result.template]);
      } else {
        alert('Failed to duplicate template: ' + result.error);
      }
    } catch (err: any) {
      alert('Error duplicating template: ' + err.message);
    }
  };

  const handleTemplateClick = (template: DynamicTemplate) => {
    setSelectedTemplate(template);
    loadTemplateVersions(template.id);
  };

  const copyTemplateId = (templateId: string) => {
    navigator.clipboard.writeText(templateId);
    // Could add toast notification here
  };

  const openSendGridEditor = (templateId: string) => {
    window.open(`https://app.sendgrid.com/dynamic_templates/${templateId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dynamic Templates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your SendGrid dynamic templates
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadTemplates}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Templates ({templates.length})
          </h4>
          
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Create your first template to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h5>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">
                          {template.generation}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Updated: {formatDate(template.updated_at)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                          {template.id}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyTemplateId(template.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCompanyManager({ templateId: template.id, templateName: template.name });
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                        title="Manage Company Access"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSendGridEditor(template.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit in SendGrid"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Duplicate Template"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Template Details
          </h4>
          
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedTemplate.name}
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ID:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {selectedTemplate.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Generation:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedTemplate.generation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedTemplate.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900 dark:text-white">
                    Versions
                  </h6>
                  {loadingVersions && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
                
                {templateVersions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No versions found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templateVersions.map((version) => (
                      <div
                        key={version.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {version.name}
                            </span>
                            {version.active === 1 && (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Code className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {version.editor}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Subject: {version.subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(version.updated_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCompanyManager({ templateId: selectedTemplate.id, templateName: selectedTemplate.name })}
                  className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  Manage Access
                </button>
                <button
                  onClick={() => openSendGridEditor(selectedTemplate.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit in SendGrid
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(selectedTemplate)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Duplicate
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a template to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTemplateCreated={(template) => {
          setTemplates([...templates, template]);
          setShowCreateModal(false);
        }}
      />

      {/* Company Assignment Modal */}
      {showCompanyManager && (
        <TemplateCompanyManager
          templateId={showCompanyManager.templateId}
          templateName={showCompanyManager.templateName}
          onClose={() => setShowCompanyManager(null)}
        />
      )}
    </div>
  );
};

export default DynamicTemplateManager;
