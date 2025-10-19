// Test ConvertKit Email API
const fetch = require('node-fetch');

async function testConvertKit() {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('❌ ConvertKit API key not found in environment');
    return;
  }
  
  console.log('✅ ConvertKit API key found');
  console.log('API Key length:', CONVERTKIT_API_KEY.length);
  
  const testEmail = 'test@example.com';
  const testName = 'Test User';
  
  try {
    // Test 1: Check if subscriber exists
    console.log('\n🔍 Test 1: Checking if subscriber exists...');
    const checkResponse = await fetch(`https://api.convertkit.com/v3/subscribers?api_key=${CONVERTKIT_API_KEY}&email_address=${encodeURIComponent(testEmail)}`);
    
    console.log('Check response status:', checkResponse.status);
    
    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log('Check result:', JSON.stringify(checkResult, null, 2));
    } else {
      const errorData = await checkResponse.json();
      console.log('Check error:', errorData);
    }
    
    // Test 2: Try to create a subscriber
    console.log('\n🆕 Test 2: Creating new subscriber...');
    const createResponse = await fetch(`https://api.convertkit.com/v3/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: testEmail,
        first_name: testName,
        fields: {
          subscription_tier: 'founders-circle',
          trigger_event: 'test',
          product_name: 'Test Product'
        }
      })
    });
    
    console.log('Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('Create result:', JSON.stringify(createResult, null, 2));
    } else {
      const errorData = await createResponse.json();
      console.log('Create error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConvertKit();
