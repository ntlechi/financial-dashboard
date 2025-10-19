// Test ConvertKit Email API
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    return res.status(500).json({ error: 'ConvertKit API key not configured' });
  }
  
  const testEmail = req.body.email || 'test@example.com';
  const testName = req.body.name || 'Test User';
  
  try {
    console.log('🧪 Testing ConvertKit API...');
    console.log('API Key exists:', !!CONVERTKIT_API_KEY);
    console.log('API Key length:', CONVERTKIT_API_KEY.length);
    console.log('Test email:', testEmail);
    
    // Test 0: Check API key validity
    console.log('🔑 Checking API key validity...');
    const accountResponse = await fetch(`https://api.convertkit.com/v3/account?api_key=${CONVERTKIT_API_KEY}`);
    
    console.log('Account response status:', accountResponse.status);
    
    if (accountResponse.ok) {
      const accountResult = await accountResponse.json();
      console.log('Account result:', JSON.stringify(accountResult, null, 2));
    } else {
      const errorData = await accountResponse.json();
      console.log('Account error:', errorData);
    }
    
    // Test 1: Check if subscriber exists
    console.log('🔍 Checking if subscriber exists...');
    const checkResponse = await fetch(`https://api.convertkit.com/v3/subscribers?api_key=${CONVERTKIT_API_KEY}&email_address=${encodeURIComponent(testEmail)}`);
    
    console.log('Check response status:', checkResponse.status);
    
    let checkResult = null;
    if (checkResponse.ok) {
      checkResult = await checkResponse.json();
      console.log('Check result:', JSON.stringify(checkResult, null, 2));
    } else {
      const errorData = await checkResponse.json();
      console.log('Check error:', errorData);
    }
    
    // Test 2: Try to create a subscriber
    console.log('🆕 Creating new subscriber...');
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
    
    let createResult = null;
    if (createResponse.ok) {
      createResult = await createResponse.json();
      console.log('Create result:', JSON.stringify(createResult, null, 2));
    } else {
      const errorData = await createResponse.json();
      console.log('Create error:', errorData);
    }
    
    return res.status(200).json({
      success: true,
      apiKeyExists: !!CONVERTKIT_API_KEY,
      apiKeyLength: CONVERTKIT_API_KEY.length,
      testEmail: testEmail,
      checkResult: checkResult,
      createResult: createResult,
      checkStatus: checkResponse.status,
      createStatus: createResponse.status
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      message: error.message,
      stack: error.stack
    });
  }
};
