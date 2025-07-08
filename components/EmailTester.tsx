import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';
import { sendGridService, useNewsletter } from '../lib/sendgridService';

const EmailTester: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const { subscribe } = useNewsletter();

  // Debug environment variables
  React.useEffect(() => {
    console.log('🔍 Environment Variables Debug:');
    console.log('VITE_SENDGRID_API_KEY:', import.meta.env.VITE_SENDGRID_API_KEY ? 'Set ✅' : 'Not set ❌');
    console.log('VITE_SENDGRID_SENDER_EMAIL:', import.meta.env.VITE_SENDGRID_SENDER_EMAIL);
    console.log('VITE_SENDGRID_SENDER_NAME:', import.meta.env.VITE_SENDGRID_SENDER_NAME);
    console.log('VITE_NEWSLETTER_ENABLED:', import.meta.env.VITE_NEWSLETTER_ENABLED);
  }, []);

  const addTestResult = (test: string, success: boolean, message: string, data?: any) => {
    const result = {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testSendGridConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic API connectivity by checking domain status
      const result = await sendGridService.getDomainVerificationStatus();
      if (result.success) {
        addTestResult('SendGrid API Connection', true, 'Successfully connected to SendGrid API', result);
      } else {
        addTestResult('SendGrid API Connection', false, result.error || 'Failed to connect to SendGrid API');
      }
    } catch (error: any) {
      addTestResult('SendGrid API Connection', false, `Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNewsletterSubscription = async () => {
    if (!testEmail) {
      addTestResult('Newsletter Subscription', false, 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscribe(testEmail, testFirstName || undefined);
      if (result.success) {
        addTestResult('Newsletter Subscription', true, `Successfully subscribed ${testEmail} to newsletter`, result);
      } else {
        addTestResult('Newsletter Subscription', false, result.error || 'Failed to subscribe to newsletter');
      }
    } catch (error: any) {
      addTestResult('Newsletter Subscription', false, `Subscription error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailSending = async () => {
    if (!testEmail) {
      addTestResult('Email Sending', false, 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      // Test sending a simple email
      const result = await sendGridService.sendEmail(
        testEmail,
        'test-template', // This would need to be a real template ID
        {
          name: testFirstName || 'Test User',
          company: 'Imagine Capital AI',
          test_message: 'This is a test email from your CRM system'
        }
      );

      if (result.success) {
        addTestResult('Email Sending', true, `Test email sent successfully to ${testEmail}`, result);
      } else {
        addTestResult('Email Sending', false, result.error || 'Failed to send test email');
      }
    } catch (error: any) {
      addTestResult('Email Sending', false, `Email sending error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNewsletterStats = async () => {
    setIsLoading(true);
    try {
      addTestResult('Newsletter Statistics', true, 'Testing comprehensive statistics endpoints...', null);
      
      // Test comprehensive stats method
      const statsResult = await sendGridService.getComprehensiveStats();
      if (statsResult.success) {
        const message = statsResult.note ? 
          `Retrieved comprehensive statistics (${statsResult.note})` : 
          'Successfully retrieved comprehensive statistics';
        addTestResult('Comprehensive Statistics', true, message, statsResult);
      } else {
        addTestResult('Comprehensive Statistics', false, 'Failed to retrieve comprehensive statistics');
      }
      
      // Test individual endpoints for debugging
      const endpointTests = [
        { name: 'Newsletter Stats', method: () => sendGridService.getNewsletterStats() },
        { name: 'Contacts Count', method: () => sendGridService.getContactsCount() },
        { name: 'Campaign Stats', method: () => sendGridService.getCampaignStats() }
      ];

      for (const test of endpointTests) {
        try {
          const result = await test.method();
          if (result.success) {
            addTestResult(test.name, true, 'Endpoint accessible', result);
          } else {
            addTestResult(test.name, false, (result as any).error || 'Endpoint returned error');
          }
        } catch (error: any) {
          addTestResult(test.name, false, `Endpoint error: ${error.message}`);
        }
      }
      
    } catch (error: any) {
      addTestResult('Newsletter Statistics', false, `Statistics test error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testSendGridConnection();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    await testNewsletterStats();
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (testEmail) {
      await testNewsletterSubscription();
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <TestTube className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Email System Tester
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Test your SendGrid email functionality
            </p>
          </div>
        </div>

        {/* Environment Variables Status */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Configuration Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_SENDGRID_API_KEY ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">SendGrid API Key: {import.meta.env.VITE_SENDGRID_API_KEY ? 'Configured' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_SENDGRID_SENDER_EMAIL ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">Sender Email: {import.meta.env.VITE_SENDGRID_SENDER_EMAIL || 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_SENDGRID_SENDER_NAME ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">Sender Name: {import.meta.env.VITE_SENDGRID_SENDER_NAME || 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_NEWSLETTER_ENABLED === 'true' ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">Newsletter Enabled: {import.meta.env.VITE_NEWSLETTER_ENABLED || 'false'}</span>
            </div>
          </div>
        </div>

        {/* Test Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name (Optional)
              </label>
              <input
                type="text"
                value={testFirstName}
                onChange={(e) => setTestFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testSendGridConnection}
          disabled={isLoading}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Test Connection
        </button>

        <button
          onClick={testNewsletterSubscription}
          disabled={isLoading || !testEmail}
          className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Test Subscription
        </button>

        <button
          onClick={testNewsletterStats}
          disabled={isLoading}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
          Test Stats
        </button>

        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
          Run All Tests
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Results ({testResults.length})
          </h4>
          {testResults.length > 0 && (
            <button
              onClick={clearResults}
              className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear Results
            </button>
          )}
        </div>

        {testResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No test results yet. Run a test to see results here.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium ${
                        result.success
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {result.test}
                      </h5>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {result.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                          View Raw Response
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTester;
