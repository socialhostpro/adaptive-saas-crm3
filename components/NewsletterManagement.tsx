import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Settings, 
  Users, 
  BarChart3, 
  Send,
  Plus,
  Edit3,
  Eye,
  Trash2
} from 'lucide-react';
import NewsletterSubscription from './NewsletterSubscription';
import SendGridAdminSettings from './SendGridAdminSettings';
import DomainSetupWalkthrough from './DomainSetupWalkthrough';
import EmailTester from './EmailTester';
import TemplateManager from './TemplateManager';
import CampaignBuilder from './CampaignBuilder';
import { sendGridService } from '../lib/sendgridService';
import { APP_CONFIG } from '../config/constants';

// Utility function for compact number formatting
const formatCompactNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return numValue.toLocaleString();
};

interface NewsletterManagementProps {
  className?: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  sentAt?: string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
}

const NewsletterManagement: React.FC<NewsletterManagementProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'templates' | 'settings' | 'setup' | 'test'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);

  useEffect(() => {
    loadNewsletterStats();
  }, []);

  const loadNewsletterStats = async () => {
    try {
      const result = await sendGridService.getComprehensiveStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load newsletter stats:', error);
    }
  };

  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      name: 'Welcome Series - Week 1',
      subject: 'Welcome to Imagine Capital AI!',
      status: 'sent',
      createdAt: '2024-01-15',
      sentAt: '2024-01-15',
      recipientCount: 12450,
      openRate: 32.4,
      clickRate: 8.7
    },
    {
      id: '2',
      name: 'Product Update - Q1 2024',
      subject: 'New Features & Improvements',
      status: 'sent',
      createdAt: '2024-01-10',
      sentAt: '2024-01-10',
      recipientCount: 23100,
      openRate: 28.1,
      clickRate: 12.3
    },
    {
      id: '3',
      name: 'Customer Success Stories',
      subject: 'See How Our Clients Are Winning',
      status: 'draft',
      createdAt: '2024-01-08',
      recipientCount: 0
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'templates', label: 'Templates', icon: Edit3 },
    { id: 'test', label: 'Test Email', icon: Send },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'setup', label: 'Domain Setup', icon: Settings },
  ];

  const getStatusBadge = (status: Campaign['status']) => {
    const styles = {
      draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      scheduled: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      sent: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your email marketing campaigns and newsletter subscriptions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_subscribers ? formatCompactNumber(stats.total_subscribers) : '2.4K'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaigns Sent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_campaigns ? formatCompactNumber(stats.total_campaigns) : '15'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.avg_open_rate ? `${Math.round(stats.avg_open_rate * 10) / 10}%` : '30.2%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.avg_click_rate ? `${Math.round(stats.avg_click_rate * 10) / 10}%` : '10.5%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription Forms Preview
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Default Form
                  </h4>
                  <NewsletterSubscription />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Minimal Form
                  </h4>
                  <NewsletterSubscription variant="minimal" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Card Form
              </h4>
              <NewsletterSubscription variant="card" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {showCampaignBuilder ? (
            <CampaignBuilder 
              onBack={() => setShowCampaignBuilder(false)}
              onCampaignCreated={() => {
                setShowCampaignBuilder(false);
                // Refresh campaign list if needed
              }}
            />
          ) : (
            <>
              {/* Campaign Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Email Campaigns
                </h3>
                <button 
                  onClick={() => setShowCampaignBuilder(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Campaign
                </button>
              </div>

              {/* Campaigns List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Recipients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {mockCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {campaign.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {campaign.subject}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {campaign.recipientCount ? formatCompactNumber(campaign.recipientCount) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            {campaign.openRate && campaign.clickRate ? (
                              <div className="text-sm">
                                <div className="text-gray-900 dark:text-white">
                                  {Math.round(campaign.openRate * 10) / 10}% opens
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  {Math.round(campaign.clickRate * 10) / 10}% clicks
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <TemplateManager />
        </div>
      )}

      {activeTab === 'test' && (
        <div>
          <EmailTester />
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <SendGridAdminSettings />
        </div>
      )}

      {activeTab === 'setup' && (
        <div>
          <DomainSetupWalkthrough
            domain={APP_CONFIG.COMPANY_DOMAIN}
            dnsRecords={[
              {
                type: 'CNAME',
                host: 'mail.imaginecapital.ai',
                data: 'u12345.wl.sendgrid.net',
                valid: false
              },
              {
                type: 'TXT',
                host: 'imaginecapital.ai',
                data: 'v=spf1 include:sendgrid.net ~all',
                valid: false
              }
            ]}
            onRefresh={() => console.log('Refreshing domain status...')}
            onComplete={() => console.log('Setup complete!')}
          />
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;
