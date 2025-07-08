import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Monitor, Smartphone, Tablet, Code, Eye } from 'lucide-react';

interface TemplatePreviewModalProps {
  templateId: string;
  templateName: string;
  onClose: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ templateId, templateName, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplateContent();
  }, [templateId]);

  const loadTemplateContent = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would fetch the template content from SendGrid
      // For now, we'll use mock HTML content
      const mockHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .content p {
            color: #666;
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        <div class="content">
            <h2>Hello {{first_name}}!</h2>
            <p>Welcome to {{company_name}}. We're excited to have you on board and can't wait to help you achieve your goals.</p>
            <p>This is a preview of your email template. You can customize every aspect of this design to match your brand and messaging needs.</p>
            <a href="{{dashboard_url}}" class="button">Get Started</a>
            <p>If you have any questions, don't hesitate to reach out to our support team. We're here to help!</p>
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="{{twitter_url}}">Twitter</a>
                <a href="{{linkedin_url}}">LinkedIn</a>
                <a href="{{facebook_url}}">Facebook</a>
            </div>
            <p>{{company_name}} | {{company_address}}</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Preferences</a></p>
        </div>
    </div>
</body>
</html>`;

      setHtmlContent(mockHtmlContent);
    } catch (err: any) {
      setError(err.message || 'Failed to load template content');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const getPreviewHeight = () => {
    switch (previewMode) {
      case 'mobile': return '600px';
      case 'tablet': return '700px';
      case 'desktop': return '600px';
      default: return '600px';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-900 dark:text-white">Loading template preview...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Template Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {templateName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'code'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Code className="h-4 w-4 inline mr-1" />
                  Code
                </button>
              </div>

              {/* Device Preview Toggle (only in preview mode) */}
              {viewMode === 'preview' && (
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2 py-1 rounded transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title="Desktop"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`px-2 py-1 rounded transition-colors ${
                      previewMode === 'tablet'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title="Tablet"
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2 py-1 rounded transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title="Mobile"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              {viewMode === 'preview' ? (
                <div 
                  className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg transition-all duration-300"
                  style={{ 
                    width: getPreviewWidth(),
                    maxWidth: '100%',
                    height: getPreviewHeight()
                  }}
                >
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full h-full"
                    title="Email Template Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="w-full max-w-4xl">
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    <code className="text-gray-800 dark:text-gray-200">{htmlContent}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Preview shows sample data. Actual emails will use dynamic content.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
