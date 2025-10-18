// Simple Email Automation API
// This can be called from the webhook to send emails

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
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
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, trigger, additionalData = {} } = req.body;

    if (!userId || !trigger) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, trigger' 
      });
    }

    // Get user data from Firebase
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userEmail = userData.email;
    const userName = userData.displayName || userData.email?.split('@')[0];
    const subscriptionTier = userData.subscription?.tier;

    // Prepare email data
    const emailData = {
      userId,
      email: userEmail,
      name: userName,
      trigger,
      subscriptionTier,
      ...additionalData
    };

    // Send email based on trigger
    await sendEmailByTrigger(emailData);

    console.log(`✅ Email sent: ${trigger} to ${userEmail}`);

    res.json({ 
      success: true, 
      message: `Email sent: ${trigger} to ${userEmail}` 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send email based on trigger type
async function sendEmailByTrigger(emailData) {
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
    }
  };

  const template = emailTemplates[trigger];
  
  if (!template) {
    console.error('No template found for trigger:', trigger);
    return;
  }

  // Send via ConvertKit (recommended)
  if (process.env.CONVERTKIT_API_KEY && process.env.CONVERTKIT_FOUNDERS_FORM_ID) {
    await sendViaConvertKit(email, name, trigger, subscriptionTier, productName);
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
    return;
  }

  const payload = {
    api_key: CONVERTKIT_API_KEY,
    email: email,
    first_name: name,
    fields: {
      subscription_tier: subscriptionTier,
      trigger_event: trigger,
      product_name: productName || subscriptionTier,
      product: productName || subscriptionTier,
      stripe_product: productName || subscriptionTier,
      signup_date: new Date().toISOString()
    },
    tags: [tag] // Use the mapped tag for the subscription tier
  };

  try {
    // Add subscriber to ConvertKit using the correct API endpoint
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
          subscription_tier: subscriptionTier,
          trigger_event: trigger,
          product_name: productName || subscriptionTier,
          signup_date: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ConvertKit error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ConvertKit subscription successful:', result);
    
    // Add the tag to the subscriber
    if (result.subscriber && result.subscriber.id) {
      await addTagToSubscriber(result.subscriber.id, tag);
    }
    
    // If this is a subscription creation, also record it as a purchase
    if (trigger === 'subscription_created' && productName) {
      await recordPurchaseInConvertKit(email, productName, subscriptionTier);
    }
    
    return result;
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
