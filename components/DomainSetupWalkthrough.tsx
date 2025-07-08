import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Copy, 
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface DomainSetupWalkthroughProps {
  domain: string;
  dnsRecords: Array<{
    type: string;
    host: string;
    data: string;
    valid: boolean;
  }>;
  onRefresh?: () => void;
  onComplete?: () => void;
  className?: string;
}

const DomainSetupWalkthrough: React.FC<DomainSetupWalkthroughProps> = ({
  domain,
  dnsRecords,
  onRefresh,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      title: 'Access Your Domain Provider',
      description: 'Log into your domain registrar or DNS provider',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You'll need to access the DNS settings for your domain <strong>{domain}</strong>. 
            This is typically done through your domain registrar (like GoDaddy, Namecheap, etc.) 
            or your DNS provider (like Cloudflare, Route53, etc.).
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Common DNS Providers
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <li>• GoDaddy: Go to Domain Manager → DNS Management</li>
                  <li>• Namecheap: Go to Domain List → Manage → Advanced DNS</li>
                  <li>• Cloudflare: Go to DNS → Records</li>
                  <li>• AWS Route53: Go to Hosted Zones → Your Domain</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Add DNS Records',
      description: 'Add the required DNS records to your domain',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add each of the following DNS records to your domain's DNS settings. 
            Make sure to use the exact values provided.
          </p>
          
          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {record.type}
                    </span>
                    {record.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Record {index + 1} of {dnsRecords.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Host:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs flex-1">
                      {record.host}
                    </code>
                    <button
                      onClick={() => copyToClipboard(record.host)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy host"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Value:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs flex-1 break-all">
                      {record.data}
                    </code>
                    <button
                      onClick={() => copyToClipboard(record.data)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy value"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {copiedText === record.host && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Host copied to clipboard!
                  </div>
                )}
                {copiedText === record.data && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Value copied to clipboard!
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Important Notes
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• DNS changes can take up to 48 hours to propagate</li>
                  <li>• Make sure to use the exact values provided</li>
                  <li>• Don't add quotes around the values</li>
                  <li>• TTL can be set to 300 (5 minutes) or your provider's default</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Verify Setup',
      description: 'Check that your DNS records are properly configured',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            After adding the DNS records, you can verify they're working correctly. 
            DNS propagation can take a few minutes to several hours.
          </p>
          
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Verification Status
              </h4>
              <div className="space-y-2">
                {dnsRecords.map((record, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {record.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {record.type} record for {record.host}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onRefresh}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Check Status
              </button>
              
              <button
                onClick={() => window.open(`https://mxtoolbox.com/SuperTool.aspx?action=txt:${domain}`, '_blank')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                DNS Lookup Tool
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Complete Setup',
      description: 'Finalize your domain authentication',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once all DNS records are verified, your domain authentication is complete! 
            This will improve email deliverability and remove SendGrid branding from your emails.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Benefits of Domain Authentication
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                  <li>• Improved email deliverability</li>
                  <li>• Remove "via sendgrid.net" from emails</li>
                  <li>• Better sender reputation</li>
                  <li>• Access to advanced SendGrid features</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )
    }
  ];

  const allRecordsValid = dnsRecords.every(record => record.valid);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Domain Setup Walkthrough
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Follow these steps to authenticate your domain with SendGrid
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep || (index === 3 && allRecordsValid);
            const isCurrent = index === currentStep;
            const isExpanded = expandedStep === index;

            return (
              <div key={index} className={`border rounded-lg ${
                isCurrent 
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        isCurrent 
                          ? 'border-primary-500 bg-primary-500 text-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        <span className="text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isCurrent 
                        ? 'text-primary-900 dark:text-primary-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isCurrent 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div className="pt-4">
                      {step.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index <= currentStep 
                    ? 'bg-primary-500' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainSetupWalkthrough;
