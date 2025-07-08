import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, Eye, Code, Wand2 } from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';

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

interface EditTemplateModalProps {
  templateId: string;
  templateName: string;
  onClose: () => void;
  onTemplateUpdated?: () => void;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({ 
  templateId, 
  templateName, 
  onClose, 
  onTemplateUpdated 
}) => {
  const [activeVersion, setActiveVersion] = useState<TemplateVersion | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedHtmlContent, setEditedHtmlContent] = useState('');
  const [editedPlainContent, setEditedPlainContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'plain' | 'preview'>('html');
  const [isWrapEnabled, setIsWrapEnabled] = useState(true);

  useEffect(() => {
    loadTemplateVersion();
  }, [templateId]);

  const loadTemplateVersion = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await sendGridService.getTemplateVersions(templateId);
      if (result.success && result.versions && result.versions.length > 0) {
        const activeVer = result.versions.find(v => v.active === 1) || result.versions[0];
        setActiveVersion(activeVer);
        setEditedSubject(activeVer.subject || '');
        setEditedHtmlContent(activeVer.html_content || '');
        setEditedPlainContent(activeVer.plain_content || '');
      } else {
        setError(result.error || 'Failed to load template version');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeVersion) return;

    setSaving(true);
    setError('');

    try {
      const result = await sendGridService.updateTemplateVersion(templateId, activeVersion.id, {
        subject: editedSubject,
        html_content: editedHtmlContent,
        plain_content: editedPlainContent
      });

      if (result.success) {
        onTemplateUpdated?.();
        onClose();
      } else {
        setError(result.error || 'Failed to update template');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const generatePlainText = () => {
    if (editedHtmlContent) {
      // Simple HTML to plain text conversion
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editedHtmlContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      setEditedPlainContent(plainText.trim());
    }
  };

  const formatHTML = () => {
    try {
      // Simple HTML formatting - in production, you might want to use a proper HTML formatter
      const formatted = editedHtmlContent
        .replace(/></g, '>\n<')
        .replace(/^\s*\n/gm, '')
        .trim();
      setEditedHtmlContent(formatted);
    } catch (error) {
      console.error('Error formatting HTML:', error);
    }
  };

  const getPreviewContent = () => {
    if (!editedHtmlContent) return '<p>No HTML content available</p>';
    
    // Replace common handlebars variables with sample data for preview
    return editedHtmlContent
      .replace(/\{\{(\w+)\}\}/g, (_, variable) => {
        const sampleData: Record<string, string> = {
          'first_name': 'John',
          'last_name': 'Doe',
          'email': 'john.doe@example.com',
          'company_name': 'Acme Corp',
          'subject': editedSubject,
          'name': 'John Doe',
          'dashboard_url': '#dashboard',
          'support_email': 'support@example.com',
          'unsubscribe_url': '#unsubscribe',
          'logo_url': '/api/placeholder/200/60'
        };
        return sampleData[variable] || `[${variable}]`;
      });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-900 dark:text-white">Loading template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Template: {templateName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID: {templateId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={isWrapEnabled}
                onChange={(e) => setIsWrapEnabled(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Wrap text
            </label>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-180px)]">
          {/* Subject Line */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject line"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'html'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Code className="h-4 w-4 inline mr-2" />
              HTML Content
            </button>
            <button
              onClick={() => setActiveTab('plain')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'plain'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Plain Text
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Preview
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'html' && (
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    HTML Content
                  </label>
                  <button
                    onClick={formatHTML}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Wand2 className="h-3 w-3 inline mr-1" />
                    Format
                  </button>
                </div>
                <textarea
                  value={editedHtmlContent}
                  onChange={(e) => setEditedHtmlContent(e.target.value)}
                  className={`flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none ${
                    isWrapEnabled ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
                  }`}
                  placeholder="Enter HTML content..."
                  style={{ 
                    minHeight: '400px',
                    whiteSpace: isWrapEnabled ? 'pre-wrap' : 'pre',
                    wordWrap: isWrapEnabled ? 'break-word' : 'normal'
                  }}
                />
              </div>
            )}

            {activeTab === 'plain' && (
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plain Text Content
                  </label>
                  <button
                    onClick={generatePlainText}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Wand2 className="h-3 w-3 inline mr-1" />
                    Generate from HTML
                  </button>
                </div>
                <textarea
                  value={editedPlainContent}
                  onChange={(e) => setEditedPlainContent(e.target.value)}
                  className={`flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isWrapEnabled ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
                  }`}
                  placeholder="Enter plain text content..."
                  style={{ 
                    minHeight: '400px',
                    whiteSpace: isWrapEnabled ? 'pre-wrap' : 'pre',
                    wordWrap: isWrapEnabled ? 'break-word' : 'normal'
                  }}
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="p-6 h-full">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full overflow-auto">
                  <div 
                    className="bg-white rounded shadow-lg max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTemplateModal;
