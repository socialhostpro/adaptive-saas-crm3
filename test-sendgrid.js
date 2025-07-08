// SendGrid Test Script
// Run this in the browser console on your CRM application

console.log('🧪 Starting SendGrid Email Test...');

// Test 1: Check if SendGrid is configured
const testConfig = () => {
  console.log('📋 Testing Configuration...');
  
  const apiKey = import.meta.env.REACT_APP_SENDGRID_API_KEY;
  const senderEmail = import.meta.env.REACT_APP_SENDGRID_SENDER_EMAIL;
  const senderName = import.meta.env.REACT_APP_SENDGRID_SENDER_NAME;
  
  console.log('API Key configured:', apiKey ? '✅ Yes' : '❌ No');
  console.log('Sender Email:', senderEmail || '❌ Not configured');
  console.log('Sender Name:', senderName || '❌ Not configured');
  
  return !!apiKey && !!senderEmail && !!senderName;
};

// Test 2: Test API Connection
const testConnection = async () => {
  console.log('🔗 Testing SendGrid API Connection...');
  
  try {
    const { sendGridService } = await import('./lib/sendgridService');
    const result = await sendGridService.getDomainVerificationStatus();
    
    if (result.success) {
      console.log('✅ Successfully connected to SendGrid API');
      console.log('Domain status:', result.domains?.length ? `${result.domains.length} domains found` : 'No domains configured');
      return true;
    } else {
      console.log('❌ Failed to connect to SendGrid API:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
};

// Test 3: Test Newsletter Subscription
const testSubscription = async (email = 'test@example.com', firstName = 'Test') => {
  console.log('📧 Testing Newsletter Subscription...');
  
  try {
    const { useNewsletter } = await import('./lib/sendgridService');
    const { subscribe } = useNewsletter();
    
    const result = await subscribe(email, firstName);
    
    if (result.success) {
      console.log('✅ Successfully subscribed to newsletter');
      console.log('Result:', result);
      return true;
    } else {
      console.log('❌ Failed to subscribe:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Subscription error:', error.message);
    return false;
  }
};

// Test 4: Test Newsletter Stats
const testStats = async () => {
  console.log('📊 Testing Newsletter Statistics...');
  
  try {
    const { sendGridService } = await import('./lib/sendgridService');
    const result = await sendGridService.getNewsletterStats();
    
    if (result.success) {
      console.log('✅ Successfully retrieved newsletter stats');
      console.log('Stats:', result.stats);
      return true;
    } else {
      console.log('❌ Failed to get stats:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats error:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async (testEmail = 'your-email@example.com') => {
  console.log('🚀 Running All SendGrid Tests...');
  console.log('================================================');
  
  const configOk = testConfig();
  if (!configOk) {
    console.log('❌ Configuration test failed. Check your environment variables.');
    return;
  }
  
  const connectionOk = await testConnection();
  const statsOk = await testStats();
  const subscriptionOk = await testSubscription(testEmail);
  
  console.log('================================================');
  console.log('📋 Test Results Summary:');
  console.log('Configuration:', configOk ? '✅ Pass' : '❌ Fail');
  console.log('API Connection:', connectionOk ? '✅ Pass' : '❌ Fail');
  console.log('Newsletter Stats:', statsOk ? '✅ Pass' : '❌ Fail');
  console.log('Newsletter Subscription:', subscriptionOk ? '✅ Pass' : '❌ Fail');
  
  const allPassed = configOk && connectionOk && statsOk && subscriptionOk;
  console.log('Overall Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  if (allPassed) {
    console.log('🎉 Your SendGrid email system is working correctly!');
  } else {
    console.log('🔧 Please check the failed tests and fix the issues.');
  }
};

// Export functions for manual testing
window.sendGridTest = {
  runAllTests,
  testConfig,
  testConnection,
  testSubscription,
  testStats
};

console.log('📝 SendGrid test functions are now available in window.sendGridTest');
console.log('Example usage:');
console.log('  window.sendGridTest.runAllTests("your-email@example.com")');
console.log('  window.sendGridTest.testConnection()');
console.log('  window.sendGridTest.testSubscription("test@example.com")');

// Auto-run tests if this script is executed directly
if (typeof window !== 'undefined') {
  runAllTests('test@imaginecapital.ai');
}
