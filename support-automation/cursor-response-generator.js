// 🤖 Cursor AI Support Response Generator
// Use Cursor AI to create intelligent support responses

class CursorSupportGenerator {
  constructor() {
    this.responseTemplates = new Map();
    this.appKnowledge = this.buildAppKnowledge();
    this.setupSmartTemplates();
  }

  buildAppKnowledge() {
    return {
      appName: "Survive Backpacking",
      type: "Progressive Web App (PWA)",
      founder: "Scam survivor rebuilding from $47K loss",
      
      keyFeatures: [
        "Multi-currency tracking",
        "Unlimited debt calculator", 
        "Investment portfolio management",
        "Travel runway calculator",
        "Offline functionality",
        "Quick expense logging",
        "No tracking/permissions"
      ],
      
      installation: {
        iPhone: "Safari → Share → Add to Home Screen",
        Android: "Chrome → Menu → Add to Home Screen", 
        Desktop: "Click install icon in address bar"
      },
      
      uniqueValue: [
        "Works offline (perfect for travel)",
        "No app store required (60-second install)",
        "No invasive permissions",
        "Built by someone who's been broke",
        "Unlimited debt tracking",
        "Multi-currency support"
      ],
      
      commonIssues: [
        "Installation confusion",
        "Offline sync questions",
        "Privacy concerns", 
        "Feature discovery",
        "Data export needs"
      ]
    };
  }

  setupSmartTemplates() {
    // Installation responses
    this.responseTemplates.set('install_iphone', {
      trigger: ['install', 'iphone', 'ios', 'safari'],
      response: `Hi! 📱 To install on iPhone:

1. Open **Safari** browser (important: not Chrome!)
2. Go to **survivebackpacking.com**
3. Tap **Share** button (□↗)
4. Select **"Add to Home Screen"**
5. Tap **"Add"** to confirm

The app icon appears on your home screen instantly!

**Why Safari?** PWAs work best in Safari on iOS.

Need more help? Full guide: survivebackpacking.com/install-guide`,
      category: 'installation'
    });

    this.responseTemplates.set('install_android', {
      trigger: ['install', 'android', 'chrome'],
      response: `Hi! 🤖 To install on Android:

1. Open **Chrome** browser
2. Go to **survivebackpacking.com**
3. Tap **three dots menu** (⋮)
4. Select **"Add to Home screen"**
5. Tap **"Add"** to confirm

Chrome might also show an automatic "Install app" banner!

**Pro tip:** Works better in Chrome than other browsers.

Full guide: survivebackpacking.com/install-guide`,
      category: 'installation'
    });

    // Offline/Travel responses
    this.responseTemplates.set('offline_travel', {
      trigger: ['offline', 'travel', 'internet', 'wifi', 'airplane'],
      response: `Yes! 🌍 The app works perfectly offline - designed for travelers!

**Perfect for:**
✈️ Airplane mode (track expenses during flights)
🏔️ Remote areas (mountains, beaches, no signal)
📶 Poor connections (slow/unreliable internet)
💰 Avoiding data costs (expensive roaming)

**How it works:**
🔄 All changes save locally
📡 Auto-syncs when you're back online
💾 No data loss, ever

This is exactly why I built it - financial tracking shouldn't depend on WiFi!`,
      category: 'offline'
    });

    // Debt calculator responses
    this.responseTemplates.set('debt_unlimited', {
      trigger: ['debt', 'add more', 'calculator', 'limit'],
      response: `💳 You can add unlimited debts - no more 3-debt limit!

**Steps:**
1. Go to **Budget tab** → **Debt Payoff Calculator**
2. Click green **"Add Debt"** button
3. Fill in your debt details
4. Repeat for ALL your debts (no limit!)
5. Use trash icon to remove unwanted debts

**🚀 Quick templates:**
💳 Credit Cards (multiple cards)
🎓 Student Loans (federal + private)
🔄 Mixed Debts (cards + loans + more)

Supports both Snowball (smallest first) and Avalanche (highest interest) strategies!`,
      category: 'debt'
    });

    // Privacy responses
    this.responseTemplates.set('privacy_security', {
      trigger: ['privacy', 'track', 'permission', 'data', 'secure'],
      response: `🛡️ Your privacy is our priority! Here's how we protect you:

**What we DON'T do:**
❌ Ask for camera/contacts/location permissions
❌ Track your behavior or spy on you
❌ Sell your data to advertisers
❌ Access your photos, texts, or calls

**What we DO:**
✅ Bank-level encryption for your financial data
✅ Local storage when offline
✅ Secure cloud sync when online
✅ Easy data export/deletion anytime

**The app just tracks your money, not YOU!**

This is why we chose PWA over app store - better privacy, no invasive permissions.`,
      category: 'privacy'
    });
  }

  // Find best matching response
  findBestResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const [key, template] of this.responseTemplates) {
      let score = 0;
      
      template.trigger.forEach(trigger => {
        if (lowerMessage.includes(trigger)) {
          score += trigger.length; // Longer matches = higher score
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = template;
      }
    }

    return bestMatch;
  }

  // Generate response (with Cursor AI context)
  generateResponse(userMessage) {
    const matchedTemplate = this.findBestResponse(userMessage);
    
    if (matchedTemplate) {
      return {
        response: matchedTemplate.response,
        category: matchedTemplate.category,
        confidence: 'high',
        source: 'template'
      };
    }

    // Fallback for unmatched queries
    return {
      response: `Hi! Thanks for reaching out about the Survive Backpacking app.

I want to help you personally! For the best support:

📖 **Quick help:** survivebackpacking.com/help-center
💬 **Personal support:** Email support@survivebackpacking.com

**Include in your email:**
• What you were trying to do
• What happened instead
• Your device/browser type
• Screenshots if helpful

I read every email personally and respond within 24 hours.

Your financial journey matters to me!

Best,
[Your Name]
Founder, Survive Backpacking`,
      category: 'general',
      confidence: 'medium',
      source: 'fallback'
    };
  }

  // Add new response template (learn from interactions)
  addResponseTemplate(triggers, response, category) {
    const key = `custom_${Date.now()}`;
    this.responseTemplates.set(key, {
      trigger: triggers,
      response,
      category
    });
  }

  // Get response analytics
  getAnalytics() {
    const templateUsage = {};
    
    for (const [key, template] of this.responseTemplates) {
      templateUsage[template.category] = (templateUsage[template.category] || 0) + 1;
    }

    return {
      totalTemplates: this.responseTemplates.size,
      categories: templateUsage,
      appKnowledge: this.appKnowledge
    };
  }
}

// Create instance
const cursorSupport = new CursorSupportGenerator();

export default cursorSupport;