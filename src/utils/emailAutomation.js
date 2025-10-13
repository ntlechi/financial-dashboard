// Email Automation System
// Integrates with your email marketing platform (ConvertKit, Mailchimp, etc.)

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Email automation triggers
export const EMAIL_TRIGGERS = {
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  TRIAL_ENDING: 'trial_ending',
  WELCOME_SEQUENCE: 'welcome_sequence'
};

// Send email via your email marketing platform
export async function sendEmail(userId, trigger, additionalData = {}) {
  try {
    // Get user data from Firebase
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found:', userId);
      return;
    }

    const userData = userDoc.data();
    const userEmail = userData.email;
    const userName = userData.displayName || userData.email?.split('@')[0];

    // Prepare email data
    const emailData = {
      userId,
      email: userEmail,
      name: userName,
      trigger,
      subscriptionTier: userData.subscription?.tier,
      ...additionalData
    };

    // Send to your email marketing platform
    await sendToEmailPlatform(emailData);

    console.log(`✅ Email sent: ${trigger} to ${userEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Send to your email marketing platform (ConvertKit example)
async function sendToEmailPlatform(emailData) {
  const { email, name, trigger, subscriptionTier } = emailData;

  // ConvertKit API example (replace with your platform)
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

  const payload = {
    api_key: CONVERTKIT_API_KEY,
    email: email,
    first_name: name,
    fields: {
      subscription_tier: subscriptionTier,
      trigger_event: trigger,
      user_id: emailData.userId
    }
  };

  // Add to specific sequence based on trigger
  if (trigger === EMAIL_TRIGGERS.SUBSCRIPTION_CREATED) {
    payload.tags = ['subscriber', subscriptionTier];
    // Add to welcome sequence
    payload.sequences = ['welcome-sequence'];
  } else if (trigger === EMAIL_TRIGGERS.SUBSCRIPTION_CANCELLED) {
    payload.tags = ['cancelled'];
    // Add to win-back sequence
    payload.sequences = ['win-back-sequence'];
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Email platform error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending to email platform:', error);
    throw error;
  }
}

// Alternative: SendGrid example
async function sendViaSendGrid(emailData) {
  const { email, name, trigger, subscriptionTier } = emailData;

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  // Template mapping
  const templateMapping = {
    [EMAIL_TRIGGERS.SUBSCRIPTION_CREATED]: 'd-welcome-subscription',
    [EMAIL_TRIGGERS.SUBSCRIPTION_CANCELLED]: 'd-subscription-cancelled',
    [EMAIL_TRIGGERS.PAYMENT_FAILED]: 'd-payment-failed',
    [EMAIL_TRIGGERS.PAYMENT_SUCCEEDED]: 'd-payment-success'
  };

  const templateId = templateMapping[trigger];
  
  if (!templateId) {
    console.error('No template found for trigger:', trigger);
    return;
  }

  const payload = {
    personalizations: [{
      to: [{ email, name }],
      dynamic_template_data: {
        name,
        subscription_tier: subscriptionTier,
        trigger_event: trigger
      }
    }],
    from: {
      email: 'noreply@survivebackpacking.com',
      name: 'The Freedom Compass'
    },
    template_id: templateId
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending via SendGrid:', error);
    throw error;
  }
}

export default {
  sendEmail,
  EMAIL_TRIGGERS
};


