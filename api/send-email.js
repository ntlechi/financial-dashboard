// Simple Email Automation API
// This can be called from the webhook to send emails

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
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
  const { email, name, trigger, subscriptionTier } = emailData;

  // Email templates (you can customize these)
  const emailTemplates = {
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
  if (process.env.CONVERTKIT_API_KEY) {
    await sendViaConvertKit(email, name, trigger, subscriptionTier);
  } else {
    // Fallback: just log the email
    console.log('📧 Email to send:', {
      to: email,
      subject: template.subject,
      trigger: trigger
    });
  }
  
  return Promise.resolve();
}

// ConvertKit Integration
async function sendViaConvertKit(email, name, trigger, subscriptionTier) {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  
  if (!CONVERTKIT_API_KEY) {
    console.log('ConvertKit API key not configured, skipping email');
    return;
  }

  // Form ID mapping based on subscription tier
  const formMapping = {
    'climber': process.env.CONVERTKIT_CLIMBER_FORM_ID,
    'operator': process.env.CONVERTKIT_OPERATOR_FORM_ID,
    'founders-circle': process.env.CONVERTKIT_FOUNDERS_FORM_ID,
  };

  const formId = formMapping[subscriptionTier];
  
  if (!formId) {
    console.error('No ConvertKit form ID found for tier:', subscriptionTier);
    return;
  }

  const payload = {
    api_key: CONVERTKIT_API_KEY,
    email: email,
    first_name: name,
    fields: {
      subscription_tier: subscriptionTier,
      trigger_event: trigger,
      signup_date: new Date().toISOString()
    }
  };

  // Add tags based on trigger
  if (trigger === 'subscription_created') {
    payload.tags = [`${subscriptionTier}-subscriber`, 'active-subscriber'];
  } else if (trigger === 'subscription_cancelled') {
    payload.tags = ['cancelled-subscriber'];
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ConvertKit error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ConvertKit subscription successful:', result);
    return result;
  } catch (error) {
    console.error('Error sending to ConvertKit:', error);
    throw error;
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
