// 🤖 Google Gemini Support Integration
// Automated support responses using Google's Gemini AI

class GeminiSupportBot {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    this.appContext = this.buildAppContext();
  }

  buildAppContext() {
    return `You are a helpful customer support agent for Survive Backpacking, a financial freedom app.

IMPORTANT CONTEXT:
- Built by someone who lost $47,000 to scammers and is rebuilding
- Progressive Web App (PWA) - not in app stores by design
- Works offline (perfect for travelers)
- No tracking or invasive permissions
- Focuses on financial recovery and travel planning

KEY FEATURES:
- Multi-currency tracking
- Unlimited debt calculator with templates
- Investment portfolio management
- Travel runway calculator
- Offline functionality
- Quick expense logging

INSTALLATION:
- iPhone: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Add to Home Screen
- Desktop: Click install icon in address bar

COMMON ISSUES:
- Installation confusion (explain PWA benefits)
- Offline sync questions (reassure about data safety)
- Privacy concerns (explain no tracking/permissions)
- Feature discovery (guide to advanced features)

TONE: Empathetic, authentic, helpful, encouraging. Remember this app helps people rebuild their financial lives.

If you can't help, direct them to: support@survivebackpacking.com`;
  }

  async generateResponse(userMessage, category = 'general') {
    try {
      const prompt = `${this.appContext}

USER QUESTION CATEGORY: ${category}
USER MESSAGE: "${userMessage}"

Generate a helpful, empathetic response (max 200 words). Be specific and actionable.`;

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 200
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          response: data.candidates[0].content.parts[0].text,
          category,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Invalid response format from Gemini');
      }
      
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        response: this.getFallbackResponse(userMessage, category),
        category,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getFallbackResponse(message, category) {
    const fallbacks = {
      installation: "Hi! To install the Survive Backpacking app:\n\n📱 iPhone: Safari → Share → Add to Home Screen\n🤖 Android: Chrome → Menu → Add to Home screen\n\nFull guide: survivebackpacking.com/install-guide\n\nNeed more help? Email support@survivebackpacking.com",
      
      offline: "Yes! The app works perfectly offline - great for travel!\n\n✈️ Perfect for airplane mode, remote areas, poor connections\n🔄 Everything syncs automatically when you're back online\n\nThis makes it ideal for backpackers who aren't always connected.",
      
      debt: "You can add unlimited debts in the calculator!\n\n1. Go to Budget tab → Debt Payoff Calculator\n2. Click green 'Add Debt' button\n3. Fill in details for each debt\n4. Try our quick templates: Credit Cards, Student Loans, Mixed Debts\n\nSupports both Snowball and Avalanche strategies!",
      
      privacy: "Your privacy is protected! The app:\n\n🛡️ Doesn't ask for weird phone permissions\n🔒 Doesn't track or spy on you\n💾 Stores data securely with bank-level encryption\n🗑️ Can be uninstalled with zero traces\n\nIt just tracks your money, not you!",
      
      general: "Thanks for reaching out! I'm here to help with your Survive Backpacking app.\n\n📖 Quick help: survivebackpacking.com/help-center\n💬 Personal support: Just reply to this message\n\nI read every email personally and will get back to you within 24 hours.\n\nBuilding back stronger together!"
    };

    return fallbacks[category] || fallbacks.general;
  }

  // Categorize user messages
  categorizeMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('install') || lowerMessage.includes('download') || lowerMessage.includes('app store')) {
      return 'installation';
    }
    if (lowerMessage.includes('offline') || lowerMessage.includes('internet') || lowerMessage.includes('sync')) {
      return 'offline';
    }
    if (lowerMessage.includes('debt') || lowerMessage.includes('calculator') || lowerMessage.includes('payoff')) {
      return 'debt';
    }
    if (lowerMessage.includes('privacy') || lowerMessage.includes('track') || lowerMessage.includes('permission')) {
      return 'privacy';
    }
    if (lowerMessage.includes('crash') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      return 'technical';
    }
    
    return 'general';
  }

  // Main support function
  async handleSupportRequest(userMessage, userEmail = null) {
    const category = this.categorizeMessage(userMessage);
    const response = await this.generateResponse(userMessage, category);
    
    // Log the interaction
    this.logSupportInteraction({
      userMessage,
      userEmail,
      category,
      response: response.response,
      success: response.success,
      timestamp: response.timestamp
    });

    return response;
  }

  // Log support interactions for analysis
  logSupportInteraction(interaction) {
    try {
      const logs = JSON.parse(localStorage.getItem('support-interactions') || '[]');
      logs.unshift(interaction);
      
      // Keep last 100 interactions
      if (logs.length > 100) {
        logs.splice(100);
      }
      
      localStorage.setItem('support-interactions', JSON.stringify(logs));
      console.log('📝 Support interaction logged');
    } catch (error) {
      console.error('Failed to log support interaction:', error);
    }
  }

  // Get support analytics
  getSupportAnalytics() {
    try {
      const logs = JSON.parse(localStorage.getItem('support-interactions') || '[]');
      
      const categories = {};
      const successRate = logs.length > 0 ? 
        logs.filter(log => log.success).length / logs.length * 100 : 0;
      
      logs.forEach(log => {
        categories[log.category] = (categories[log.category] || 0) + 1;
      });

      return {
        totalInteractions: logs.length,
        successRate: Math.round(successRate),
        categories,
        recentInteractions: logs.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get support analytics:', error);
      return null;
    }
  }
}

// Create singleton instance
const geminiSupport = new GeminiSupportBot();

export default geminiSupport;