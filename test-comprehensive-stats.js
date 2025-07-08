#!/usr/bin/env node

// Test comprehensive statistics functionality
const https = require('https');

const API_KEY = process.env.VITE_SENDGRID_API_KEY;

if (!API_KEY) {
  console.error('❌ VITE_SENDGRID_API_KEY environment variable not set');
  process.exit(1);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: `/v3${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ 
            status: res.statusCode, 
            data: result, 
            success: res.statusCode >= 200 && res.statusCode < 300 
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: body, 
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testStatisticsEndpoints() {
  console.log('🧪 Testing SendGrid Statistics Endpoints\n');

  const tests = [
    { name: 'User Profile', path: '/user/profile' },
    { name: 'Email Activity Stats', path: '/stats?start_date=2024-01-01&end_date=2024-01-15&aggregated_by=day' },
    { name: 'Marketing Contacts Count', path: '/marketing/contacts/count' },
    { name: 'Marketing Campaigns', path: '/marketing/campaigns' },
    { name: 'Domain Authentication', path: '/whitelabel/domains' },
    { name: 'Marketing Senders', path: '/marketing/senders' },
    { name: 'Suppression Groups', path: '/suppressions' }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await makeRequest(test.path);
      
      if (result.success) {
        console.log(`✅ ${test.name}: SUCCESS (${result.status})`);
        if (result.data && typeof result.data === 'object') {
          const keys = Object.keys(result.data);
          console.log(`   Data keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`❌ ${test.name}: FAILED (${result.status})`);
        if (result.data?.errors) {
          result.data.errors.forEach(error => {
            console.log(`   Error: ${error.message || error.field || JSON.stringify(error)}`);
          });
        } else if (result.data?.message) {
          console.log(`   Message: ${result.data.message}`);
        }
      }
      
      results.push({ ...test, ...result });
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
      results.push({ ...test, success: false, error: error.message });
    }
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (successful > 0) {
    console.log('\n🎉 Available endpoints:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.path}`);
    });
  }

  if (successful === 0) {
    console.log('\n💡 Note: Some endpoints may require specific permissions or plan features.');
    console.log('   Mock data will be used in the application for statistics.');
  }
}

// Run the test
testStatisticsEndpoints().catch(console.error);
