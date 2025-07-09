import React, { useState } from 'react';
import { CompanyProfile, SubscriptionInvoice, TeamMember, FeatureAddon, EmailTemplate, MediaFile } from '../types';
import Card from './shared/Card';
import CompanyDetails from './company/CompanyDetails';
import SubscriptionManagement from './company/SubscriptionManagement';
import UsageStats from './company/UsageStats';
import AccountInfo from './company/AccountInfo';
import StaffManagement from './company/StaffManagement';
import BillingIntegration from './company/BillingIntegration';
import FeatureManagement from './company/FeatureManagement';
import EmailNotificationSettings from './company/EmailNotificationSettings';

interface CompanyProps {
  companyProfile?: CompanyProfile;
  setCompanyProfile?: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  subscriptionInvoices?: SubscriptionInvoice[];
  usageStats?: { [key: string]: number };
  accountOwner?: TeamMember;
  setTeamMembers?: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  isStripeConnected?: boolean;
  setIsStripeConnected?: React.Dispatch<React.SetStateAction<boolean>>;
  staff?: TeamMember[];
  featureAddons?: FeatureAddon[];
  setFeatureAddons?: React.Dispatch<React.SetStateAction<FeatureAddon[]>>;
  emailTemplates?: EmailTemplate[];
  setEmailTemplates?: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  mediaFiles?: MediaFile[];
  currentUser?: TeamMember;
  appContext?: any;
}

type Tab = 'details' | 'subscription' | 'usage' | 'account' | 'staff' | 'billing' | 'addons' | 'notifications';

const TABS: { id: Tab, label: string }[] = [
    { id: 'details', label: 'Company Details' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'addons', label: 'Feature Add-ons' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'usage', label: 'Usage Stats' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'billing', label: 'Billing Integration' },
    { id: 'account', label: 'Account Info' },
];

const Company: React.FC<CompanyProps> = (props) => {
    const {
      companyProfile = {} as CompanyProfile,
      setCompanyProfile = () => {},
      subscriptionInvoices = [],
      usageStats = {},
      accountOwner = undefined,
      setTeamMembers = () => {},
      isStripeConnected = false,
      setIsStripeConnected = () => {},
      staff = [],
      featureAddons = [],
      setFeatureAddons = () => {},
      emailTemplates = [],
      setEmailTemplates = () => {},
      mediaFiles = [],
      currentUser = undefined,
      appContext = {}
    } = props;
    const [activeTab, setActiveTab] = useState<Tab>('details');

    const renderContent = () => {
        switch (activeTab) {
            case 'details':
                return <CompanyDetails 
                    companyProfile={companyProfile} 
                    setCompanyProfile={setCompanyProfile} 
                    mediaFiles={mediaFiles}
                />;
            case 'subscription':
                return <SubscriptionManagement invoices={subscriptionInvoices} />;
            case 'usage':
                return <UsageStats stats={usageStats} />;
            case 'account':
                return <AccountInfo accountOwner={accountOwner} />;
            case 'staff':
                return <StaffManagement staff={staff} setStaff={setTeamMembers} />;
            case 'billing':
                return <BillingIntegration isConnected={isStripeConnected} setConnected={setIsStripeConnected} />;
            case 'addons':
                return <FeatureManagement addons={featureAddons} setAddons={setFeatureAddons} />;
            case 'notifications':
                return <EmailNotificationSettings templates={emailTemplates} setTemplates={setEmailTemplates} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Company Settings</h1>
            </div>
            <div className="flex-grow flex flex-col md:flex-row gap-8">
                <nav className="flex-shrink-0 md:w-56">
                    <ul className="space-y-1">
                        {TABS.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-grow min-w-0">
                    <Card className="h-full">
                        {renderContent()}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Company;
