// Simple Email Automation API
// This can be called from the webhook to send emails

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    // Use service account key for Vercel deployment
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod',
      databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod'}-default-rtdb.firebaseio.com`
    });
    
    console.log('✅ Firebase Admin initialized successfully in send-email');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed in send-email:', error);
    // Continue without Firebase - email will still work
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📧 Email handler called:', { trigger: req.body.trigger, userId: req.body.userId });
    
    const { userId, trigger, additionalData = {} } = req.body;

    if (!userId || !trigger) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: userId, trigger' 
      });
    }

    console.log('🔍 Getting user data from Firebase...');
    // Get user data from Firebase
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User not found in Firebase');
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    // Use email from webhook data first (more reliable), fallback to Firebase
    const userEmail = additionalData.userEmail || userData.email;
    const userName = userData.displayName || userEmail?.split('@')[0];
    // Use subscriptionTier from additionalData first (webhook data), fallback to Firebase
    const subscriptionTier = additionalData.subscriptionTier || userData.subscription?.tier;

    console.log('📊 User data:', { email: userEmail, tier: subscriptionTier, trigger });
    
    if (!userEmail) {
      console.error('❌ No email found for user:', userId);
      return res.status(400).json({ error: 'User email not found' });
    }

    // Prepare email data
    const emailData = {
      userId,
      email: userEmail,
      name: userName,
      trigger,
      subscriptionTier,
      ...additionalData
    };

    console.log('📤 Calling sendEmailByTrigger...');
    // Send email based on trigger
    await sendEmailByTrigger(emailData);

    console.log(`✅ Email sent: ${trigger} to ${userEmail}`);

    res.json({ 
      success: true, 
      message: `Email sent: ${trigger} to ${userEmail}` 
    });

  } catch (error) {
    console.error('❌ Error in email handler:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send email based on trigger type
async function sendEmailByTrigger(emailData) {
  console.log('📨 sendEmailByTrigger called:', { trigger: emailData.trigger, tier: emailData.subscriptionTier });
  const { email, name, trigger, subscriptionTier, productName } = emailData;

  // Email templates (you can customize these)
  const emailTemplates = {
    'free_user_signup': {
      subject: `Welcome to The Freedom Compass! 🧭`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Welcome to The Freedom Compass!</h1>
          <p>Hi ${name},</p>
          <p>Welcome to The Freedom Compass! You've just taken the first step toward financial freedom.</p>
          <p>You now have access to:</p>
          <ul>
            <li>Basic dashboard (Cash Flow, Income, Expenses, Net Worth)</li>
            <li>Transaction management</li>
            <li>Basic budget calculator</li>
            <li>Data export</li>
          </ul>
          <p>🎯 Your Next Steps:</p>
          <ol>
            <li>Add your first transaction</li>
            <li>Set up your basic budget</li>
            <li>Track your net worth</li>
          </ol>
          <p>💡 Pro Tip: The more you use the app, the more insights you'll gain about your financial habits.</p>
          <p>Ready to start your journey? Log in and explore your dashboard!</p>
          <p>Best regards,<br>The Freedom Compass Team</p>
          <p><small>P.S. Want to unlock advanced features? Check out our Climber Plan for goal tracking, debt management, and more!</small></p>
        </div>
      `
    },
    'subscription_created': {
      subject: `Welcome to The Freedom Compass ${subscriptionTier} Plan! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Welcome to The Freedom Compass!</h1>
          <p>Hi ${name},</p>
          <p>Congratulations! You've successfully upgraded to the <strong>${subscriptionTier}</strong> plan.</p>
          <p>You now have access to:</p>
          <ul>
            <li>Complete dashboard experience</li>
            <li>Advanced financial calculators</li>
            <li>Goal tracking and projections</li>
            ${subscriptionTier === 'operator' ? '<li>Side hustle tracking</li><li>Investment portfolio</li><li>Travel planning</li>' : ''}
          </ul>
          <p>Start your financial freedom journey today!</p>
          <p>Best regards,<br>The Freedom Compass Team</p>
        </div>
      `
    },
    'subscription_cancelled': {
      subject: 'We\'re sorry to see you go 😢',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">We\'re sorry to see you go</h1>
          <p>Hi ${name},</p>
          <p>We\'re sorry to see you cancel your subscription. We hope you found value in The Freedom Compass.</p>
          <p>If you change your mind, you can always resubscribe anytime. We\'d love to have you back!</p>
          <p>Best regards,<br>The Freedom Compass Team</p>
        </div>
      `
    },
    'payment_failed': {
      subject: 'Payment Issue - Action Required ⚠️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Payment Issue - Action Required</h1>
          <p>Hi ${name},</p>
          <p>We encountered an issue processing your payment for The Freedom Compass subscription.</p>
          <p>Please update your payment method to continue enjoying all features.</p>
          <p>Best regards,<br>The Freedom Compass Team</p>
        </div>
      `
    },
    'payment_succeeded': {
      subject: 'Payment Successful ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Payment Successful</h1>
          <p>Hi ${name},</p>
          <p>Your payment has been processed successfully. Thank you for continuing your journey with The Freedom Compass!</p>
          <p>Best regards,<br>The Freedom Compass Team</p>
        </div>
      `
    },
    'welcome_with_temp_password': {
      subject: 'Welcome to The Freedom Compass! Your account is ready 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Welcome to The Freedom Compass!</h1>
          <p>Hi ${name},</p>
          <p>Your account has been created and you're now a <strong>Founder</strong>! 🎉</p>
          <p><strong>Your login credentials:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">TempPassword123!</code></li>
          </ul>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Log in to your account using the credentials above</li>
            <li>Change your password to something secure</li>
            <li>Start exploring your Founder features!</li>
          </ol>
          <p>🎯 <strong>You now have access to:</strong></p>
          <ul>
            <li>Complete dashboard with all features</li>
            <li>Advanced financial calculators</li>
            <li>Goal tracking and projections</li>
            <li>Investment portfolio management</li>
            <li>Travel planning tools</li>
          </ul>
          <p>Ready to start your journey? <a href="https://app.survivebackpacking.com" style="color: #3b82f6;">Log in now</a></p>
          <p>Best regards,<br>The Freedom Compass Team</p>
          <p><small>P.S. For security, please change your password after your first login.</small></p>
        </div>
      `
    }
  };

  const template = emailTemplates[trigger];
  
  if (!template) {
    console.error('No template found for trigger:', trigger);
    return;
  }

  console.log('🔑 ConvertKit API key exists:', !!process.env.CONVERTKIT_API_KEY);
  
  // Send via ConvertKit (recommended)
  if (process.env.CONVERTKIT_API_KEY) {
    try {
      console.log('🚀 Calling sendViaConvertKit...');
      await sendViaConvertKit(email, name, trigger, subscriptionTier, productName);
      console.log('✅ sendViaConvertKit completed successfully');
    } catch (convertKitError) {
      console.error('❌ ConvertKit error, falling back to logging:', convertKitError.message);
      console.error('ConvertKit error stack:', convertKitError.stack);
      // Fallback: just log the email
      console.log('📧 Email to send:', {
        to: email,
        subject: template.subject,
        trigger: trigger,
        subscriptionTier: subscriptionTier
      });
      console.log('⚠️ ConvertKit failed - email logged instead of sent');
    }
  } else {
    // Fallback: just log the email
    console.log('📧 Email to send:', {
      to: email,
      subject: template.subject,
      trigger: trigger,
      subscriptionTier: subscriptionTier
    });
    console.log('⚠️ ConvertKit not configured - email logged instead of sent');
  }
  
  return Promise.resolve();
}

// Helper function for ConvertKit with specific tag
async function sendViaConvertKitWithTag(email, name, trigger, tag, productName) {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('ConvertKit API key not configured, skipping email');
    return;
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email,
        first_name: name,
        fields: {
          subscription_tier: 'recon',
          trigger_event: trigger,
          product_name: productName || 'Unknown'
        },
        tags: [tag] // Use the specific tag
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ConvertKit error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ConvertKit subscription successful with default tag:', result);
    
    return result;
  } catch (error) {
    console.error('Error sending to ConvertKit with default tag:', error);
    throw error;
  }
}

// ConvertKit Integration
async function sendViaConvertKit(email, name, trigger, subscriptionTier, productName) {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('ConvertKit API key not configured, skipping email');
    return;
  }

  // Tag mapping based on subscription tier (for email sequences)
  const tagMapping = {
    'recon': 'Status - Recruit (Free)',
    'climber': 'Status - Climber', 
    'operator': 'Status - Operator',
    'founders-circle': 'Status - Founder',
  };

  const tag = tagMapping[subscriptionTier];
  
  if (!tag) {
    console.error('No ConvertKit tag found for tier:', subscriptionTier);
    console.log('Available tiers:', Object.keys(tagMapping));
    console.log('Using default tag for undefined tier');
    // Use default tag for undefined tiers
    const defaultTag = 'Status - Recruit (Free)';
    console.log('Using default tag:', defaultTag);
    return sendViaConvertKitWithTag(email, name, trigger, defaultTag, productName);
  }

  console.log(`📧 Sending to ConvertKit with tag "${tag}" for tier: ${subscriptionTier}`);

  try {
    console.log('🔍 ConvertKit Debug Info:');
    console.log('- API Key exists:', !!CONVERTKIT_API_KEY);
    console.log('- API Key length:', CONVERTKIT_API_KEY ? CONVERTKIT_API_KEY.length : 0);
    console.log('- Email:', email);
    console.log('- Name:', name);
    console.log('- Subscription Tier:', subscriptionTier);
    
    // Step 1: Check if subscriber already exists
    console.log('🔍 Checking if subscriber already exists...');
    const checkResponse = await fetch(`https://api.convertkit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`, {
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
          email_address: email,
          first_name: name
          // Note: V4 API doesn't accept custom fields in subscriber creation
          // Fields must be added separately via the fields API endpoint
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
    
    // Step 3: Add tag to subscriber (whether new or existing)
    if (subscriberId) {
      console.log('🏷️ Adding tag to subscriber:', subscriberId);
      
      // First, get the tag ID by name
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
          
          // Now add the tag using the correct V4 endpoint: /v4/tags/:tag_id/subscribers/:id
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
            console.log('❌ Tag addition failed with status:', tagResponse.status);
            console.log('❌ Tag addition failed with error:', tagErrorData);
          }
        } else {
          console.log('❌ Tag not found:', tag);
          console.log('Available tags:', tagsData.tags?.map(t => t.name));
        }
      } else {
        console.log('❌ Failed to fetch tags list');
      }
    }

    return { success: true, subscriberId };
  } catch (error) {
    console.error('Error sending to ConvertKit:', error);
    throw error;
  }
}

// Add tag to ConvertKit subscriber
async function addTagToSubscriber(subscriberId, tag) {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('ConvertKit API key not configured, skipping tag addition');
    return;
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriberId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        tag: {
          name: tag
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ConvertKit tag addition error:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ ConvertKit tag added:', result);
    return result;
  } catch (error) {
    console.error('Error adding tag to ConvertKit subscriber:', error);
  }
}

// Record purchase in ConvertKit for proper product tracking
async function recordPurchaseInConvertKit(email, productName, subscriptionTier) {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('ConvertKit API key not configured, skipping purchase recording');
    return;
  }

  try {
    // Use ConvertKit's purchase API
    const purchasePayload = {
      api_key: CONVERTKIT_API_KEY,
      email: email,
      product_name: productName,
      product_id: subscriptionTier, // Use tier as product ID
      purchase_amount: 0.75, // Your test amount
      currency: 'USD',
      transaction_id: `test_${Date.now()}`,
      purchase_date: new Date().toISOString()
    };

    const response = await fetch('https://api.convertkit.com/v3/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchasePayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ConvertKit purchase recording error:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ ConvertKit purchase recorded:', result);
    return result;
  } catch (error) {
    console.error('Error recording purchase in ConvertKit:', error);
  }
}

// SendGrid Integration (alternative)
async function sendViaSendGrid(email, subject, html) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: 'noreply@survivebackpacking.com',
    subject: subject,
    html: html,
  };

  await sgMail.send(msg);
}
