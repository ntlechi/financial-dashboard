// Working email API route with ConvertKit integration
export default async function handler(req, res) {
  console.log('📧 Email API route called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, trigger, additionalData = {} } = req.body;
    const { userName, userEmail } = additionalData;
    
    console.log('📧 Email trigger:', { userId, trigger, userName, userEmail });
    
    // ConvertKit Integration
    const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
    
    if (!CONVERTKIT_API_KEY) {
      console.log('ConvertKit API key not configured, skipping email');
      return res.status(200).json({ 
        success: true, 
        message: 'Email API working (ConvertKit not configured)',
        data: { userId, trigger, userName, userEmail }
      });
    }

    // Tag mapping for free users
    const tag = 'Status - Recruit (Free)';
    
    console.log(`📧 Sending to ConvertKit with tag "${tag}" for free user`);
    
    try {
      // Step 1: Check if subscriber already exists
      console.log('🔍 Checking if subscriber already exists...');
      const checkResponse = await fetch(`https://api.convertkit.com/v4/subscribers?email_address=${encodeURIComponent(userEmail)}`, {
        headers: {
          'X-Kit-Api-Key': CONVERTKIT_API_KEY
        }
      });
      
      let subscriberId = null;
      
      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        console.log('📊 Subscriber check result:', checkResult);
        
        if (checkResult.subscribers && checkResult.subscribers.length > 0) {
          subscriberId = checkResult.subscribers[0].id;
          console.log('✅ Subscriber already exists with ID:', subscriberId);
        }
      }
      
      // Step 2: Create subscriber if doesn't exist
      if (!subscriberId) {
        console.log('🆕 Creating new subscriber...');
        const subscriberResponse = await fetch(`https://api.convertkit.com/v4/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Kit-Api-Key': CONVERTKIT_API_KEY
          },
          body: JSON.stringify({
            email_address: userEmail,
            first_name: userName,
            fields: {
              subscription_tier: 'recon',
              trigger_event: trigger,
              product_name: 'Free Signup'
            }
          })
        });

        console.log('📡 ConvertKit Response Status:', subscriberResponse.status);

        if (!subscriberResponse.ok) {
          const errorData = await subscriberResponse.json();
          console.log('❌ ConvertKit Error Response:', errorData);
          throw new Error(`ConvertKit subscriber creation error: ${errorData.error || subscriberResponse.statusText}`);
        }

        const subscriberResult = await subscriberResponse.json();
        console.log('✅ ConvertKit subscriber created:', subscriberResult);
        subscriberId = subscriberResult.subscriber?.id;
      }
      
      // Step 3: Add tag to subscriber
      if (subscriberId) {
        console.log('🏷️ Adding tag to subscriber:', subscriberId);
        
        // Get the tag ID by name
        console.log('🔍 Looking up tag ID for:', tag);
        const tagsResponse = await fetch(`https://api.convertkit.com/v4/tags`, {
          headers: {
            'X-Kit-Api-Key': CONVERTKIT_API_KEY
          }
        });
        
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          console.log('📋 Available tags:', tagsData);
          
          // Find the tag by name
          const targetTag = tagsData.tags?.find(t => t.name === tag);
          
          if (targetTag) {
            console.log('✅ Found tag ID:', targetTag.id, 'for tag:', tag);
            
            // Add the tag using the correct V4 endpoint
            const tagResponse = await fetch(`https://api.convertkit.com/v4/tags/${targetTag.id}/subscribers/${subscriberId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Kit-Api-Key': CONVERTKIT_API_KEY
              },
              body: JSON.stringify({})
            });

            console.log('📡 Tag Response Status:', tagResponse.status);
            
            if (tagResponse.ok) {
              const tagResult = await tagResponse.json();
              console.log('✅ ConvertKit tag added:', tagResult);
            } else {
              const tagErrorData = await tagResponse.json();
              console.log('❌ ConvertKit Tag Error Response:', tagErrorData);
            }
          } else {
            console.log('❌ Tag not found:', tag);
          }
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Email automation completed successfully',
        data: { userId, trigger, userName, userEmail, subscriberId }
      });
      
    } catch (convertKitError) {
      console.error('ConvertKit error:', convertKitError);
      return res.status(200).json({ 
        success: true, 
        message: 'Email API working (ConvertKit error)',
        error: convertKitError.message,
        data: { userId, trigger, userName, userEmail }
      });
    }
    
  } catch (error) {
    console.error('❌ Email API error:', error);
    return res.status(500).json({ 
      error: 'Email API failed',
      details: error.message 
    });
  }
}
