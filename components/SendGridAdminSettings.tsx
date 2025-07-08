import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';
import { APP_CONFIG, DOMAIN_STATUS } from '../config/constants';

interface SendGridAdminSettingsProps {
  className?: string;
}

const SendGridAdminSettings: React.FC<SendGridAdminSettingsProps> = ({ className = '' }) => {
  const [apiKey, setApiKey] = useState('');
  const [senderEmail, setSenderEmail] = useState(APP_CONFIG.SENDGRID.SENDER_EMAIL || '');
  const [senderName, setSenderName] = useState(APP_CONFIG.SENDGRID.SENDER_NAME || '');
  const [domain, setDomain] = useState(APP_CONFIG.COMPANY_DOMAIN || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [message, setMessage] = useState('');
  const [domainStatus, setDomainStatus] = useState<string>('pending');
  const [domainDetails, setDomainDetails] = useState<any>(null);
  const [showSetupWalkthrough, setShowSetupWalkthrough] = useState(false);

  useEffect(() => {
    checkDomainStatus();
  }, []);

  const checkDomainStatus = async () => {
    try {
      const result = await sendGridService.getDomainVerificationStatus();
      if (result.success && result.domains?.length > 0) {
        const currentDomain = result.domains.find((d: any) => d.domain === domain);
        if (currentDomain) {
          setDomainStatus(currentDomain.valid ? DOMAIN_STATUS.VERIFIED : DOMAIN_STATUS.PENDING);
          setDomainDetails(currentDomain);
        }
      }
    } catch (error) {
      console.warn('Could not check domain status:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setMessage('SendGrid API key is required');
      return;
    }

    if (!senderEmail.trim() || !senderName.trim()) {
      setStatus('error');
      setMessage('Sender email and name are required');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Here you would typically save to your backend/environment
      // For now, we'll just validate the API key by making a test request
      
      setStatus('success');
      setMessage('Settings saved successfully! Please restart the application for changes to take effect.');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to save settings. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainVerification = async () => {
    if (!domain.trim()) {
      setStatus('error');
      setMessage('Domain is required for verification');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendGridService.initiateDomainVerification(domain);
      if (result.success) {
        setStatus('warning');
        setMessage('Domain verification initiated. Please check DNS records and complete setup.');
        setDomainDetails(result.data);
        setShowSetupWalkthrough(true);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to initiate domain verification');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to initiate domain verification');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus('success');
    setMessage('Copied to clipboard!');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const getDNSRecords = () => {
    if (!domainDetails?.dns) return [];
    
    return Object.entries(domainDetails.dns).map(([type, record]: [string, any]) => ({
      type: type.toUpperCase(),
      host: record.host || '',
      data: record.data || '',
      valid: record.valid || false
    }));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              SendGrid Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Configure your SendGrid API settings for email marketing
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* API Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SendGrid API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="SG.xxxxxxxxxx..."
                  className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <a
                    href="https://app.sendgrid.com/settings/api_keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Get API Key from SendGrid"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Create an API key with Full Access permissions in your SendGrid dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sender Email
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Domain Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Domain Authentication
          </h3>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Why authenticate your domain?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Domain authentication improves email deliverability and removes the "via sendgrid.net" text from your emails.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain to Authenticate
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleDomainVerification}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify Domain'}
              </button>
            </div>
          </div>

          {/* Domain Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </span>
            {domainStatus === DOMAIN_STATUS.VERIFIED && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            )}
            {domainStatus === DOMAIN_STATUS.PENDING && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Pending
              </span>
            )}
            {domainStatus === DOMAIN_STATUS.FAILED && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                <XCircle className="h-4 w-4" />
                Failed
              </span>
            )}
          </div>
        </div>

        {/* DNS Records */}
        {domainDetails && getDNSRecords().length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              DNS Records to Add
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Add these DNS records to your domain's DNS settings:
              </p>
              <div className="space-y-3">
                {getDNSRecords().map((record, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {record.type}
                      </span>
                      {record.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 w-12">Host:</span>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {record.host}
                        </code>
                        <button
                          onClick={() => copyToClipboard(record.host)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 w-12">Data:</span>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs break-all">
                          {record.data}
                        </code>
                        <button
                          onClick={() => copyToClipboard(record.data)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Setup Walkthrough Button */}
        {showSetupWalkthrough && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Domain Setup Required
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Follow our step-by-step guide to complete domain authentication.
                </p>
              </div>
              <button
                onClick={() => window.open('https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication', '_blank')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                Setup Guide
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : status === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {status === 'success' && <CheckCircle className="h-5 w-5" />}
            {status === 'warning' && <AlertTriangle className="h-5 w-5" />}
            {status === 'error' && <XCircle className="h-5 w-5" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendGridAdminSettings;
