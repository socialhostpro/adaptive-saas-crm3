import React, { useState } from 'react';
import { 
  X, 
  Wand2, 
  Save, 
  Eye, 
  Upload,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

interface TemplateSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated?: (templateData: any) => void;
}

interface TemplateData {
  name: string;
  subject: string;
  type: 'welcome' | 'newsletter' | 'billing' | 'notification';
  htmlContent: string;
  textContent: string;
  variables: string[];
}

const TemplateSetupModal: React.FC<TemplateSetupModalProps> = ({ 
  isOpen, 
  onClose, 
  onTemplateCreated 
}) => {
  const [step, setStep] = useState(1);
  const [templateType, setTemplateType] = useState<'welcome' | 'newsletter' | 'billing' | 'notification'>('welcome');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<TemplateData | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: APP_CONFIG.COMPANY_NAME,
    description: 'AI-powered SaaS CRM platform helping businesses grow',
    website: APP_CONFIG.HOME_URL,
    supportEmail: 'support@imaginecapital.ai',
    stripeManagementUrl: 'https://billing.stripe.com/p/login/test_example',
    logo: APP_CONFIG.LOGOS.LIGHT_MODE,
    primaryColor: '#667eea',
    address: '123 Innovation Drive, Tech City, CA 94000'
  });

  const generateAITemplate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation (in a real app, you'd call an AI service)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const templates = {
      welcome: generateWelcomeTemplate(),
      newsletter: generateNewsletterTemplate(),
      billing: generateBillingTemplate(),
      notification: generateNotificationTemplate()
    };
    
    setGeneratedTemplate(templates[templateType]);
    setIsGenerating(false);
    setStep(3);
  };

  const generateWelcomeTemplate = (): TemplateData => ({
    name: `Welcome Email - ${companyInfo.name}`,
    subject: `Welcome to ${companyInfo.name}, {{first_name}}! 🎉`,
    type: 'welcome',
    variables: ['first_name', 'company_name', 'dashboard_url', 'stripe_management_url', 'support_email'],
    textContent: `Welcome to ${companyInfo.name}!\n\nHi {{first_name}},\n\nWelcome to ${companyInfo.name}! We're excited to have you on board.\n\nGet started: {{dashboard_url}}\nManage billing: {{stripe_management_url}}\n\nNeed help? Contact us at {{support_email}}\n\nBest regards,\nThe ${companyInfo.name} Team`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${companyInfo.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, ${companyInfo.primaryColor} 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            max-height: 60px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 18px;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            border-left: 4px solid ${companyInfo.primaryColor};
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, ${companyInfo.primaryColor} 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 8px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-links a {
            color: ${companyInfo.primaryColor};
            text-decoration: none;
            margin: 0 15px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #ecf0f1;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px !important; }
            .btn { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="${companyInfo.name}" class="logo">
            <h1>Welcome to ${companyInfo.name}!</h1>
            <p>Your AI-Powered Business Growth Platform</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2 style="margin-top: 0; color: ${companyInfo.primaryColor};">Hi {{first_name}}! 👋</h2>
                <p style="margin-bottom: 0; font-size: 16px;">
                    Welcome to ${companyInfo.name}! We're thrilled to have you join thousands of businesses 
                    who are already growing faster with our AI-powered CRM platform.
                </p>
            </div>
            
            <p>Your account is now active and ready to use. Here's what you can do right away:</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Get Started</h3>
                    <p>Access your dashboard and explore all features</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💳</div>
                    <h3>Manage Billing</h3>
                    <p>Update payment methods and view invoices</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>Track Growth</h3>
                    <p>Monitor your business metrics and insights</p>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="{{dashboard_url}}" class="btn">Access Your Dashboard</a>
                <a href="{{stripe_management_url}}" class="btn btn-secondary">Manage Billing</a>
            </div>
            
            <p><strong>Need help getting started?</strong></p>
            <ul style="padding-left: 20px;">
                <li>Check out our <a href="{{help_url}}" style="color: ${companyInfo.primaryColor};">getting started guide</a></li>
                <li>Watch our <a href="{{tutorials_url}}" style="color: ${companyInfo.primaryColor};">video tutorials</a></li>
                <li>Contact our support team at <a href="mailto:{{support_email}}" style="color: ${companyInfo.primaryColor};">{{support_email}}</a></li>
            </ul>
            
            <p>We're here to help you succeed. Don't hesitate to reach out if you have any questions!</p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The ${companyInfo.name} Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>${companyInfo.name}</strong></p>
            <p>${companyInfo.address}</p>
            
            <div class="footer-links">
                <a href="{{dashboard_url}}">Dashboard</a>
                <a href="{{help_url}}">Help Center</a>
                <a href="{{privacy_url}}">Privacy Policy</a>
                <a href="{{terms_url}}">Terms of Service</a>
            </div>
            
            <div class="social-links">
                <a href="{{twitter_url}}">Twitter</a> |
                <a href="{{linkedin_url}}">LinkedIn</a> |
                <a href="{{facebook_url}}">Facebook</a>
            </div>
            
            <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                You received this email because you signed up for ${companyInfo.name}.<br>
                <a href="{{unsubscribe_url}}" style="color: ${companyInfo.primaryColor};">Unsubscribe</a> | 
                <a href="{{preferences_url}}" style="color: ${companyInfo.primaryColor};">Email Preferences</a>
            </p>
        </div>
    </div>
</body>
</html>`
  });

  const generateBillingTemplate = (): TemplateData => ({
    name: `Billing Update - ${companyInfo.name}`,
    subject: `Your ${companyInfo.name} billing information`,
    type: 'billing',
    variables: ['first_name', 'company_name', 'stripe_management_url', 'support_email', 'invoice_url'],
    textContent: `Billing Update\n\nHi {{first_name}},\n\nManage your billing: {{stripe_management_url}}\nView invoice: {{invoice_url}}\n\nQuestions? Contact {{support_email}}\n\nThanks,\n${companyInfo.name}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Billing Information - ${companyInfo.name}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, ${companyInfo.primaryColor}, #764ba2); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .billing-card { background: #f8f9ff; border: 1px solid #e3e8ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: ${companyInfo.primaryColor}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="${companyInfo.name}" style="max-height: 50px; margin-bottom: 15px;">
            <h1>Billing Information</h1>
        </div>
        <div class="content">
            <h2>Hi {{first_name}},</h2>
            <div class="billing-card">
                <h3>💳 Manage Your Billing</h3>
                <p>Easily update payment methods, view invoices, and manage your subscription.</p>
                <a href="{{stripe_management_url}}" class="btn">Access Billing Portal</a>
            </div>
            <p>Questions? Contact us at <a href="mailto:{{support_email}}">{{support_email}}</a></p>
        </div>
        <div class="footer">
            <p>${companyInfo.name} | <a href="{{unsubscribe_url}}" style="color: ${companyInfo.primaryColor};">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`
  });

  const generateNewsletterTemplate = (): TemplateData => ({
    name: `Newsletter - ${companyInfo.name}`,
    subject: `{{newsletter_title}} - ${companyInfo.name}`,
    type: 'newsletter',
    variables: ['first_name', 'newsletter_title', 'main_article_title', 'main_article_content'],
    textContent: `Newsletter from ${companyInfo.name}\n\nHi {{first_name}},\n\n{{newsletter_title}}\n\n{{main_article_title}}\n{{main_article_content}}\n\nBest regards,\n${companyInfo.name}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{newsletter_title}}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, ${companyInfo.primaryColor}, #764ba2); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .article { background: #f8f9ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid ${companyInfo.primaryColor}; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="${companyInfo.name}" style="max-height: 60px; margin-bottom: 20px;">
            <h1>{{newsletter_title}}</h1>
        </div>
        <div class="content">
            <h2>Hi {{first_name}},</h2>
            <div class="article">
                <h3>{{main_article_title}}</h3>
                <p>{{main_article_content}}</p>
            </div>
        </div>
        <div class="footer">
            <p>${companyInfo.name} | <a href="{{unsubscribe_url}}" style="color: ${companyInfo.primaryColor};">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`
  });

  const generateNotificationTemplate = (): TemplateData => ({
    name: `Notification - ${companyInfo.name}`,
    subject: `Important update from ${companyInfo.name}`,
    type: 'notification',
    variables: ['first_name', 'notification_title', 'notification_message'],
    textContent: `Notification from ${companyInfo.name}\n\nHi {{first_name}},\n\n{{notification_title}}\n{{notification_message}}\n\nBest regards,\n${companyInfo.name}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{notification_title}}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="${companyInfo.name}" style="max-height: 50px; margin-bottom: 15px;">
            <h1>{{notification_title}}</h1>
        </div>
        <div class="content">
            <h2>Hi {{first_name}},</h2>
            <div class="alert">
                <p>{{notification_message}}</p>
            </div>
        </div>
        <div class="footer">
            <p>${companyInfo.name} | <a href="{{unsubscribe_url}}" style="color: #28a745;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportTemplate = () => {
    if (!generatedTemplate) return;
    
    const templateData = {
      ...generatedTemplate,
      companyInfo,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Email Template Generator
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create professional email templates with AI assistance
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={companyInfo.supportEmail}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stripe Management URL
                    </label>
                    <input
                      type="url"
                      value={companyInfo.stripeManagementUrl}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, stripeManagementUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Description
                    </label>
                    <textarea
                      value={companyInfo.description}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Choose Template Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: 'welcome' as const, title: 'Welcome Email', desc: 'Thank new users with Stripe billing access', icon: '👋' },
                    { type: 'billing' as const, title: 'Billing Update', desc: 'Billing notifications with Stripe management', icon: '💳' },
                    { type: 'newsletter' as const, title: 'Newsletter', desc: 'Regular updates and announcements', icon: '📧' },
                    { type: 'notification' as const, title: 'Notification', desc: 'Important alerts and updates', icon: '🔔' }
                  ].map((template) => (
                    <div
                      key={template.type}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        templateType === template.type
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setTemplateType(template.type)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{template.icon}</span>
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={generateAITemplate}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Template
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && generatedTemplate && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Generated Template: {generatedTemplate.name}
                </h3>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        Template Generated Successfully!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your {templateType} template has been generated with company branding, Stripe integration, and responsive design.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Details</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{generatedTemplate.subject}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {generatedTemplate.variables.map((variable) => (
                            <span
                              key={variable}
                              className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => copyToClipboard(generatedTemplate.htmlContent)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy HTML
                      </button>
                      <button
                        onClick={exportTemplate}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Export Template
                      </button>
                      <a
                        href="https://app.sendgrid.com/dynamic_templates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 no-underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open SendGrid
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">HTML Preview</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {generatedTemplate.htmlContent}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Generate Another
                </button>
                <button
                  onClick={() => {
                    onTemplateCreated?.(generatedTemplate);
                    onClose();
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSetupModal;
