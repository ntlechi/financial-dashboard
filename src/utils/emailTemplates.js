// Email sequence templates for the birthday launch

export const EMAIL_SEQUENCES = {
  // Pre-launch sequence (7 days before)
  prelaunch: [
    {
      day: -7,
      subject: "Something big is coming... 🎂",
      template: `
Hi {{firstName}},

I've been working on something special for months, and I'm finally ready to share it with the world.

As a fellow free spirit who's lived in 32 countries, I was frustrated by financial apps that just don't get our lifestyle. 

So I built something different.

Something for us.

I'm launching it on my birthday (October 19th) with a very special offer that I'll never repeat again.

Want to be the first to know?

Stay tuned... 👀

Talk soon,
[Your Name]

P.S. - I'm only making this available to 1,000 people. Ever.
      `
    },
    {
      day: -3,
      subject: "The financial app nomads have been waiting for",
      template: `
Hey {{firstName}},

Remember that "something special" I mentioned?

It's a financial dashboard built specifically for digital nomads, travelers, and location-independent entrepreneurs.

Here's what makes it different:

✈️ Multi-currency tracking (no more conversion headaches)
🏦 Business income from multiple countries  
📱 Works perfectly on mobile while you're on the move
💰 Investment tracking that follows you anywhere
🎯 Financial freedom calculator for nomads

But here's the thing...

I'm launching it on October 19th (my birthday) with lifetime access for just $147.

After that week? It goes to a subscription model at $12/month.

This is the ONLY time I'll ever offer lifetime access.

Mark your calendar: October 19th 🎂

[Your Name]

P.S. - Built by a nomad, for nomads. No corporate BS, just tools that work for our lifestyle.
      `
    },
    {
      day: -1,
      subject: "🚨 Tomorrow is the day (birthday launch)",
      template: `
{{firstName}},

Tomorrow is my birthday. 🎂

And I'm celebrating by launching the financial dashboard I wish I had when I started my nomad journey 5 years ago.

Here's what's happening tomorrow at 12pm EST:

🎉 Lifetime access opens for $147 (regular price will be $397)
⏰ Only available for 7 days (Oct 19-26)
👥 Limited to first 1,000 customers
🎁 Never again at this price

I've been testing this with 50+ nomads over the past 3 months, and the feedback has been incredible:

"This is exactly what I needed!" - Sarah, Thailand
"Finally, an app that gets our lifestyle" - Marcus, Portugal  
"Saved me hours of spreadsheet hell" - Lisa, Mexico

Ready for tomorrow?

See you at 12pm EST on October 19th 🚀

[Your Name]

P.S. - If you're not 100% satisfied, I'll refund every penny within 30 days. That's my birthday promise to you.
      `
    }
  ],

  // Launch day sequence
  launch: [
    {
      day: 0,
      subject: "🎂 It's my birthday! Lifetime access is now LIVE",
      template: `
🎉 IT'S HAPPENING! 🎉

Today is my birthday, and I'm giving YOU the gift!

The Financial Freedom Dashboard for nomads is now LIVE with lifetime access for just $147.

👉 GET LIFETIME ACCESS NOW: [CHECKOUT_LINK]

What you get:
✅ Complete financial dashboard
✅ Multi-currency support  
✅ Investment & business tracking
✅ Travel-specific categories
✅ Lifetime updates & support
✅ 30-day money-back guarantee

Regular price: $397
Birthday special: $147
Your savings: $250 (63% off)

⚠️ IMPORTANT: Only 1,000 lifetime memberships available
⏰ Offer expires October 26th at midnight

Don't wait - spots are filling up fast!

👉 SECURE YOUR LIFETIME ACCESS: [CHECKOUT_LINK]

Cheers to financial freedom! 🥂

[Your Name]

P.S. - This is the ONLY time lifetime access will be available. After Oct 26th, it's subscription-only at $12/month.
      `
    },
    {
      day: 1,
      subject: "Day 2: 847 spots left (birthday special)",
      template: `
Hey {{firstName}},

Quick update from day 2 of the birthday launch:

🔥 153 nomads joined in the first 24 hours!
⚡ 847 lifetime spots remaining
⏰ 5 days left at birthday pricing

The response has been incredible. Here's what people are saying:

"I've been looking for something like this for YEARS!" - Tom, Bali
"The multi-currency feature alone is worth $147" - Emma, Argentina
"Finally ditched my messy spreadsheets" - Jake, Vietnam

If you're still on the fence, remember:
• This is lifetime access (never pay again)
• 30-day money-back guarantee
• Price goes to $397 after Oct 26th
• Only 847 spots left

Don't miss out on this birthday special.

👉 GET YOUR LIFETIME ACCESS: [CHECKOUT_LINK]

[Your Name]

P.S. - Still have questions? Hit reply and I'll personally answer them!
      `
    }
  ],

  // Follow-up sequence for non-buyers
  followup: [
    {
      day: 3,
      subject: "Did something go wrong? (birthday special)",
      template: `
Hi {{firstName}},

I noticed you started checking out the Financial Freedom Dashboard but didn't complete your purchase.

Did something go wrong? 

If you had any issues or questions, just hit reply and I'll help you out personally.

Your cart is still saved:
💰 Lifetime Access: $147 (save $250)
⏰ 3 days left at birthday pricing
🎯 Only 623 spots remaining

👉 COMPLETE YOUR PURCHASE: [CHECKOUT_LINK]

No pressure - just wanted to make sure you didn't miss out if you were interested.

[Your Name]

P.S. - Remember, this is the ONLY time lifetime access will be available.
      `
    },
    {
      day: 5,
      subject: "⚠️ 24 hours left (final warning)",
      template: `
{{firstName}},

This is it. 

24 hours left for lifetime access to the Financial Freedom Dashboard.

Tomorrow at midnight, the birthday special ends forever.

Here's what happens after October 26th:
❌ No more lifetime access (ever)
❌ Price goes to $397 one-time OR $12/month
❌ No more birthday special

Right now:
✅ Lifetime access: $147
✅ 387 spots remaining  
✅ 24 hours left

I won't email you about this again after tonight.

If you want lifetime access to the financial dashboard built for nomads, this is your last chance.

👉 GET LIFETIME ACCESS (24 hours left): [CHECKOUT_LINK]

[Your Name]

P.S. - Thank you to the 613 nomads who've already joined! You're going to love what we're building together.
      `
    }
  ],

  // Post-purchase welcome sequence
  welcome: [
    {
      day: 0,
      subject: "🎉 Welcome to the nomad family!",
      template: `
{{firstName}},

WELCOME! 🎉

You're now part of the Financial Freedom Dashboard family!

Here's what happens next:

1️⃣ Check your email for login details (arriving in 5 minutes)
2️⃣ Join our private Facebook group: [GROUP_LINK]
3️⃣ Book a free onboarding call: [CALENDAR_LINK]

Quick Start Guide:
📱 Log in and connect your first account
💰 Set up your financial freedom goal
🌍 Add your travel budget categories
📊 Import your transaction history

Need help? Just reply to this email and I'll personally assist you.

Welcome to financial freedom! 🚀

[Your Name]

P.S. - You made a great decision. This tool is going to change how you manage money as a nomad.
      `
    },
    {
      day: 3,
      subject: "How's your setup going?",
      template: `
Hey {{firstName}},

It's been 3 days since you joined the Financial Freedom Dashboard family!

How's the setup going?

Most nomads love these features first:
🌍 Multi-currency expense tracking
📈 Investment portfolio overview  
🎯 Financial freedom calculator
💼 Business income tracking

Haven't logged in yet? No worries!
👉 Access your dashboard: [LOGIN_LINK]

Need help? I'm here for you:
• Reply to this email
• Join our Facebook group: [GROUP_LINK]  
• Book a free setup call: [CALENDAR_LINK]

You've got lifetime access, so take your time and explore!

[Your Name]

P.S. - Share a screenshot of your dashboard setup in our Facebook group for a chance to win a $100 Amazon gift card!
      `
    }
  ],

  // Affiliate/Influencer emails
  affiliate: {
    invitation: `
Subject: Partnership opportunity - $50+ per sale

Hi [Influencer Name],

I hope this email finds you well!

I've been following your content about [specific topic] and love how you help [their audience].

I'm launching a financial dashboard specifically for digital nomads and location-independent entrepreneurs on October 19th (my birthday), and I think your audience would love it.

THE OPPORTUNITY:
💰 35% commission on every sale ($51+ per sale)
🎯 High-converting product ($147 lifetime access)
⚡ Limited-time launch (only 7 days)
📈 Great conversion rates (tested with 50+ nomads)

THE PRODUCT:
A financial dashboard that actually understands the nomad lifestyle:
- Multi-currency tracking
- Business income from multiple countries  
- Investment monitoring
- Travel-specific budgeting
- Financial freedom planning

LAUNCH DETAILS:
📅 October 19-26, 2024
💵 Birthday special: $147 (regular $397)
🎯 Limited to 1,000 lifetime memberships
📊 Expected: 0.5-1% conversion rate

Interested in partnering with us?

I can provide:
✅ Custom tracking links
✅ Promotional materials
✅ Product demo access
✅ Personal support throughout

Let me know if you'd like to discuss this further!

Best,
[Your Name]

P.S. - I'm only working with 5 influencers for this launch, so spots are limited.
    `,
    
    materials: `
Subject: Your promotional materials are ready!

Hi [Influencer Name],

Excited to have you on board for the birthday launch!

Here are your promotional materials:

🔗 YOUR TRACKING LINK: 
https://yourapp.com/?utm_source=[influencer_code]&utm_medium=social&utm_campaign=birthday_launch

📊 DASHBOARD ACCESS:
Login: [demo_link]
Password: demo2024

📱 SOCIAL MEDIA ASSETS:
- Instagram stories (9:16): [link]
- Instagram posts (1:1): [link]  
- YouTube thumbnails: [link]
- Email graphics: [link]

📝 COPY TEMPLATES:
- Email templates: [link]
- Social media captions: [link]
- YouTube script: [link]

💰 COMMISSION TRACKING:
You'll earn 35% on every sale ($51.45 per $147 sale)
Track your stats: [dashboard_link]

KEY DATES:
🎂 Launch: October 19th, 12pm EST
⏰ Ends: October 26th, 11:59pm EST
🎯 Limited: 1,000 lifetime spots only

IMPORTANT NOTES:
- This is the ONLY time lifetime access will be available
- After Oct 26th, it goes to subscription model
- 30-day money-back guarantee for customers
- I'll personally support any customer issues

Questions? Just reply to this email!

Let's make this launch amazing! 🚀

[Your Name]

P.S. - Payments are sent within 48 hours of each sale via PayPal.
    `
  }
};

// Email automation functions
export const scheduleEmail = (email, sendDate, recipient) => {
  // In a real app, this would integrate with an email service like SendGrid, Mailchimp, etc.
  console.log(`Scheduling email for ${recipient} on ${sendDate}:`, email);
  
  return {
    id: Date.now() + Math.random(),
    recipient,
    subject: email.subject,
    template: email.template,
    sendDate,
    status: 'scheduled'
  };
};

export const replaceTokens = (template, userData) => {
  return template
    .replace(/\{\{firstName\}\}/g, userData.firstName || 'Friend')
    .replace(/\{\{email\}\}/g, userData.email || '')
    .replace(/\[CHECKOUT_LINK\]/g, userData.checkoutLink || '#')
    .replace(/\[LOGIN_LINK\]/g, userData.loginLink || '#')
    .replace(/\[GROUP_LINK\]/g, 'https://facebook.com/groups/nomadfinance')
    .replace(/\[CALENDAR_LINK\]/g, 'https://calendly.com/yourname/onboarding');
};