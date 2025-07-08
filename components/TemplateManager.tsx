import React, { useState, useEffect } from 'react';
import { Mail, Upload, Eye, Copy, CheckCircle, XCircle, Wand2 } from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';
import { APP_CONFIG } from '../config/constants';
import TemplateSetupModal from './TemplateSetupModal';
import DynamicTemplateManager from './DynamicTemplateManager';

interface Template {
  id: string;
  name: string;
  type: 'welcome' | 'newsletter' | 'lead_notification';
  status: 'configured' | 'missing' | 'testing';
  description: string;
  variables: string[];
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState<'configured' | 'dynamic'>('configured');
  const [testEmail, setTestEmail] = useState('');
  const [isTestingTemplate, setIsTestingTemplate] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadTemplateStatus();
  }, []);

  const loadTemplateStatus = () => {
    const templateConfigs: Template[] = [
      {
        id: APP_CONFIG.SENDGRID.TEMPLATES.WELCOME_EMAIL || 'not-configured',
        name: 'Welcome Email',
        type: 'welcome',
        status: APP_CONFIG.SENDGRID.TEMPLATES.WELCOME_EMAIL ? 'configured' : 'missing',
        description: 'Sent to new users when they join your platform',
        variables: ['company_name', 'first_name', 'dashboard_url', 'unsubscribe_url']
      },
      {
        id: APP_CONFIG.SENDGRID.TEMPLATES.NEWSLETTER || 'not-configured',
        name: 'Newsletter',
        type: 'newsletter',
        status: APP_CONFIG.SENDGRID.TEMPLATES.NEWSLETTER ? 'configured' : 'missing',
        description: 'Regular newsletter campaigns to subscribers',
        variables: ['newsletter_title', 'newsletter_date', 'first_name', 'company_name', 'main_article_title', 'main_article_content']
      },
      {
        id: APP_CONFIG.SENDGRID.TEMPLATES.LEAD_NOTIFICATION || 'not-configured',
        name: 'Lead Notification',
        type: 'lead_notification',
        status: APP_CONFIG.SENDGRID.TEMPLATES.LEAD_NOTIFICATION ? 'configured' : 'missing',
        description: 'Notifications sent when new leads are captured',
        variables: ['assigned_to', 'lead_name', 'lead_email', 'lead_company', 'lead_source', 'lead_priority']
      }
    ];

    setTemplates(templateConfigs);
  };

  const getStatusBadge = (status: Template['status']) => {
    const styles = {
      configured: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      missing: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      testing: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    };
    
    const labels = {
      configured: 'Configured',
      missing: 'Missing',
      testing: 'Testing'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTestData = (template: Template) => {
    const baseData = {
      company_name: APP_CONFIG.COMPANY_NAME,
      company_address: '123 Business St, City, State 12345',
      unsubscribe_url: `${APP_CONFIG.HOME_URL}/unsubscribe`,
      help_url: `${APP_CONFIG.HOME_URL}/help`,
      privacy_url: `${APP_CONFIG.HOME_URL}/privacy`,
      dashboard_url: APP_CONFIG.HOME_URL
    };

    switch (template.type) {
      case 'welcome':
        return {
          ...baseData,
          first_name: 'John',
          last_name: 'Smith'
        };
      
      case 'newsletter':
        return {
          ...baseData,
          newsletter_title: 'Monthly Update - January 2025',
          newsletter_date: new Date().toLocaleDateString(),
          first_name: 'Jane',
          main_article_title: 'Exciting New Features Released',
          main_article_content: 'We\'re thrilled to announce the latest updates to our platform...',
          main_article_url: `${APP_CONFIG.HOME_URL}/blog/new-features`,
          secondary_article_title: 'Customer Success Story',
          secondary_article_content: 'Learn how Company XYZ increased their productivity by 300%...',
          secondary_article_url: `${APP_CONFIG.HOME_URL}/blog/success-story`,
          stat_users: '12.4K',
          stat_growth: '+23%',
          stat_features: '5',
          pro_tip_content: 'Use keyboard shortcuts to navigate faster through your dashboard.',
          feedback_url: `${APP_CONFIG.HOME_URL}/feedback`,
          twitter_url: '#',
          linkedin_url: '#',
          facebook_url: '#',
          preferences_url: `${APP_CONFIG.HOME_URL}/preferences`
        };
      
      case 'lead_notification':
        return {
          ...baseData,
          assigned_to: 'Sarah Johnson',
          lead_name: 'Michael Wilson',
          lead_email: 'michael.wilson@example.com',
          lead_phone: '+1 (555) 123-4567',
          lead_company: 'Tech Innovations Inc',
          lead_source: 'Website Contact Form',
          lead_priority: 'high',
          lead_date: new Date().toLocaleString(),
          lead_message: 'I\'m interested in learning more about your CRM solution for our growing team.',
          crm_dashboard_url: `${APP_CONFIG.HOME_URL}/leads`,
          lead_notes_url: `${APP_CONFIG.HOME_URL}/leads/123/notes`,
          notification_settings_url: `${APP_CONFIG.HOME_URL}/settings/notifications`,
          support_url: `${APP_CONFIG.HOME_URL}/support`
        };
      
      default:
        return baseData;
    }
  };

  const testTemplate = async (template: Template) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsTestingTemplate(true);
    
    try {
      const dynamicData = getTestData(template);
      
      const result = await sendGridService.sendEmail(testEmail, template.id, dynamicData);
      
      const testResult = {
        id: Date.now(),
        template: template.name,
        success: result.success,
        message: result.success ? 
          `Test email sent successfully to ${testEmail}` : 
          `Failed to send test email: ${result.error}`,
        timestamp: new Date().toLocaleTimeString(),
        data: dynamicData
      };
      
      setTestResults(prev => [testResult, ...prev]);
      
    } catch (error: any) {
      const testResult = {
        id: Date.now(),
        template: template.name,
        success: false,
        message: `Template test error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [testResult, ...prev]);
    } finally {
      setIsTestingTemplate(false);
    }
  };

  const copyTemplateId = (templateId: string) => {
    navigator.clipboard.writeText(templateId);
    // You could add a toast notification here
  };

  const openSendGridTemplates = () => {
    window.open('https://app.sendgrid.com/dynamic_templates', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Email Templates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and test your SendGrid email templates
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            AI Template Generator
          </button>
          <button
            onClick={openSendGridTemplates}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Open SendGrid
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('configured')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'configured'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Configured Templates
          </button>
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dynamic'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Dynamic Templates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'configured' ? (
        <div className="space-y-6">
          {/* Test Email Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Template Testing
            </h4>
            <div className="flex gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Templates List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.type} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h5>
                      {getStatusBadge(template.status)}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                
                {template.status === 'configured' && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Template ID:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                        {template.id}
                      </code>
                      <button
                        onClick={() => copyTemplateId(template.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {template.status === 'configured' ? (
                    <button
                      onClick={() => testTemplate(template)}
                      disabled={isTestingTemplate || !testEmail}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="h-3 w-3" />
                      Test
                    </button>
                  ) : (
                    <button
                      onClick={openSendGridTemplates}
                      className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="h-3 w-3" />
                      Setup
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.open('/email-templates/SETUP_GUIDE.md', '_blank')}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Test Results ({testResults.length})
                </h4>
                <button
                  onClick={() => setTestResults([])}
                  className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            result.success
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-red-800 dark:text-red-200'
                          }`}>
                            {result.template}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          result.success
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <DynamicTemplateManager />
      )}

      {/* Template Setup Modal */}
      <TemplateSetupModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onTemplateCreated={(templateData) => {
          console.log('Template created:', templateData);
          // Here you could automatically add the template to the list or show success message
        }}
      />
    </div>
  );
};

export default TemplateManager;
