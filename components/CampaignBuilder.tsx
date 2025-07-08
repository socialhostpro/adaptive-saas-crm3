import React, { useState } from 'react';
import { 
  Send, 
  Save, 
  Eye, 
  Users, 
  Calendar, 
  Mail,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';
import { APP_CONFIG } from '../config/constants';

interface CampaignData {
  name: string;
  subject: string;
  templateType: 'newsletter' | 'custom';
  scheduledDate?: string;
  listIds: string[];
  dynamicData: any;
}

interface CampaignBuilderProps {
  onBack: () => void;
  onCampaignCreated?: (campaign: any) => void;
}

const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ onBack, onCampaignCreated }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    subject: '',
    templateType: 'newsletter',
    listIds: [],
    dynamicData: {}
  });
  const [isCreating, setIsCreating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const generatePreviewData = () => {
    const baseData = {
      company_name: APP_CONFIG.COMPANY_NAME,
      unsubscribe_url: `${APP_CONFIG.HOME_URL}/unsubscribe`,
      preferences_url: `${APP_CONFIG.HOME_URL}/preferences`,
      privacy_url: `${APP_CONFIG.HOME_URL}/privacy`
    };

    if (campaignData.templateType === 'newsletter') {
      return {
        ...baseData,
        newsletter_title: campaignData.name,
        newsletter_date: new Date().toLocaleDateString(),
        first_name: 'John',
        newsletter_subject: campaignData.subject,
        main_article_title: 'Latest Product Updates',
        main_article_content: 'We\'re excited to share the latest improvements to our platform...',
        main_article_url: `${APP_CONFIG.HOME_URL}/blog`,
        secondary_article_title: 'Customer Success Story',
        secondary_article_content: 'See how our customers are achieving amazing results...',
        secondary_article_url: `${APP_CONFIG.HOME_URL}/case-studies`,
        stat_users: '15.2K',
        stat_growth: '+18%',
        stat_features: '3',
        pro_tip_content: 'Use filters to quickly find the information you need.',
        feedback_url: `${APP_CONFIG.HOME_URL}/feedback`,
        twitter_url: '#',
        linkedin_url: '#',
        facebook_url: '#'
      };
    }

    return baseData;
  };

  const createCampaign = async () => {
    setIsCreating(true);
    try {
      const dynamicData = { ...campaignData.dynamicData, ...generatePreviewData() };
      
      // Create campaign using SendGrid service
      const result = await sendGridService.createNewsletterCampaign(
        campaignData.subject,
        'Using dynamic template', // Content will be from template
        campaignData.listIds
      );

      if (result.success) {
        onCampaignCreated?.(result.data);
        onBack();
      } else {
        alert(`Failed to create campaign: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error creating campaign: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return campaignData.name.trim() && campaignData.subject.trim();
      case 2:
        return campaignData.templateType;
      case 3:
        return true; // Scheduling is optional
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Campaign
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 4
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Campaign Details
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => updateCampaignData({ name: e.target.value })}
                    placeholder="e.g., Monthly Newsletter - January 2025"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={campaignData.subject}
                    onChange={(e) => updateCampaignData({ subject: e.target.value })}
                    placeholder="e.g., New Features & Updates - January 2025"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Choose Template
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    campaignData.templateType === 'newsletter'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => updateCampaignData({ templateType: 'newsletter' })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-6 w-6 text-primary-600" />
                    <h5 className="font-medium text-gray-900 dark:text-white">Newsletter Template</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Professional newsletter layout with articles, stats, and tips
                  </p>
                  <div className="mt-3 text-xs">
                    {APP_CONFIG.SENDGRID.TEMPLATES.NEWSLETTER ? (
                      <span className="text-green-600 dark:text-green-400">✓ Template configured</span>
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400">⚠ Template needs setup</span>
                    )}
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all opacity-50 ${
                    campaignData.templateType === 'custom'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <h5 className="font-medium text-gray-400">Custom Template</h5>
                  </div>
                  <p className="text-sm text-gray-400">
                    Create your own custom email template (Coming Soon)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Audience & Scheduling
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Send To
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          All Newsletter Subscribers
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Default mailing list
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="datetime-local"
                      value={campaignData.scheduledDate || ''}
                      onChange={(e) => updateCampaignData({ scheduledDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Leave empty to send immediately
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Review & Send
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign Name:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{campaignData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{campaignData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Template:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {campaignData.templateType === 'newsletter' ? 'Newsletter Template' : 'Custom Template'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Schedule:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {campaignData.scheduledDate ? new Date(campaignData.scheduledDate).toLocaleString() : 'Send immediately'}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Ready to Send
                    </h5>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your campaign is ready to be created. 
                      {campaignData.scheduledDate 
                        ? ' It will be scheduled for the specified time.' 
                        : ' It will be saved as a draft for manual sending.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex gap-3">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid(step)}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={createCampaign}
              disabled={isCreating || !APP_CONFIG.SENDGRID.TEMPLATES.NEWSLETTER}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;
