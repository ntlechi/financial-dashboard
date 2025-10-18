// Manual ConvertKit fix script
// This will directly update ConvertKit with the correct product name

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;

async function fixConvertKitProductName() {
  if (!CONVERTKIT_API_KEY) {
    console.log('❌ ConvertKit API key not found in environment variables');
    return;
  }

  // Replace with your actual email and product name
  const userEmail = 'YOUR_EMAIL_HERE'; // Replace with your email
  const correctProductName = 'Founder\'s Circle - The Founder'; // Replace with correct product name

  try {
    console.log(`🔧 Fixing ConvertKit product name for: ${userEmail}`);
    
    // First, get the subscriber
    const subscriberResponse = await fetch(`https://api.convertkit.com/v3/subscribers?api_key=${CONVERTKIT_API_KEY}&email_address=${userEmail}`);
    const subscriberData = await subscriberResponse.json();
    
    if (!subscriberData.subscribers || subscriberData.subscribers.length === 0) {
      console.log('❌ Subscriber not found in ConvertKit');
      return;
    }
    
    const subscriber = subscriberData.subscribers[0];
    console.log('👤 Found subscriber:', subscriber.email_address);
    
    // Update the subscriber's fields
    const updatePayload = {
      api_key: CONVERTKIT_API_KEY,
      fields: {
        product_name: correctProductName,
        product: correctProductName,
        stripe_product: correctProductName,
        subscription_tier: 'founders-circle',
        corrected_at: new Date().toISOString()
      }
    };
    
    const updateResponse = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriber.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('❌ Error updating subscriber:', errorData);
      return;
    }
    
    const result = await updateResponse.json();
    console.log('✅ Subscriber updated successfully:', result);
    
    // Also record a purchase with the correct product name
    const purchasePayload = {
      api_key: CONVERTKIT_API_KEY,
      email: userEmail,
      product_name: correctProductName,
      product_id: 'founders-circle',
      purchase_amount: 0.75,
      currency: 'USD',
      transaction_id: `manual_fix_${Date.now()}`,
      purchase_date: new Date().toISOString()
    };
    
    const purchaseResponse = await fetch('https://api.convertkit.com/v3/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchasePayload)
    });
    
    if (purchaseResponse.ok) {
      const purchaseResult = await purchaseResponse.json();
      console.log('✅ Purchase recorded successfully:', purchaseResult);
    } else {
      console.log('⚠️ Purchase recording failed, but subscriber was updated');
    }
    
  } catch (error) {
    console.error('❌ Error fixing ConvertKit:', error);
  }
}

// Instructions
console.log('📋 To use this script:');
console.log('1. Set your ConvertKit API key in environment variables');
console.log('2. Update the userEmail variable with your email');
console.log('3. Update the correctProductName variable');
console.log('4. Run: node manual-convertkit-fix.js');

// Uncomment the line below to run the fix
// fixConvertKitProductName();
