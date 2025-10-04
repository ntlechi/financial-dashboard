// FAQ Data for The Freedom Compass App
export const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    description: 'New to The Freedom Compass? Start here!'
  },
  {
    id: 'pricing-plans',
    name: 'Pricing & Plans',
    icon: '💰',
    description: 'Everything about our pricing tiers'
  },
  {
    id: 'features',
    name: 'Features & Tools',
    icon: '🛠️',
    description: 'How to use all the financial tools'
  },
  {
    id: 'founders-circle',
    name: 'Founder\'s Circle',
    icon: '👑',
    description: 'Exclusive founding member benefits'
  },
  {
    id: 'account-billing',
    name: 'Account & Billing',
    icon: '⚙️',
    description: 'Managing your account and payments'
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    icon: '🔧',
    description: 'Common issues and solutions'
  }
];

export const faqData = [
  // GETTING STARTED
  {
    id: 1,
    category: 'getting-started',
    question: 'What is The Freedom Compass App?',
    answer: 'The Freedom Compass App is your financial training ground for building wealth and discipline. We believe manual entry builds better money habits than automation. Our app helps you track your finances, budget effectively, and progress from "Recruit" to "Operator" level financial mastery.',
    tags: ['basics', 'introduction', 'manual entry']
  },
  {
    id: 2,
    category: 'getting-started',
    question: 'Why manual entry instead of bank connections?',
    answer: 'Manual entry is a FEATURE, not a limitation! When you manually enter transactions, you become more aware of your spending, build discipline, and develop a deeper understanding of your money flow. This conscious interaction with your finances is what builds lasting wealth-building habits.',
    tags: ['manual entry', 'philosophy', 'habits']
  },
  {
    id: 3,
    category: 'getting-started',
    question: 'How do I get started with the free Recon Kit?',
    answer: 'Simply sign up and you\'ll automatically get access to The Recon Kit! You can track your core financial metrics (Net Worth, Cash Flow, Savings Rate), use our complete budget calculator, and manage all your transactions. No credit card required - it\'s free forever.',
    tags: ['free tier', 'signup', 'recon kit']
  },

  // PRICING & PLANS
  {
    id: 4,
    category: 'pricing-plans',
    question: 'What are the different pricing tiers?',
    answer: `We have 4 tiers designed for your financial journey:

🎖️ **The Recon Kit (FREE)** - "The Recruit"
Core dashboard + Budget calculator + Transaction management

🏔️ **The Climber Plan ($7.99/month)** - "The Climber" 
Everything in Recon Kit + Advanced dashboard + All financial calculators

⚡ **The Operator Plan ($14.99/month)** - "The Operator"
Everything in Climber + Side Hustle management + Investment portfolio + Travel budgeting

👑 **The Founder's Circle ($7.49/month)** - "The Founder"
Full Operator access at Climber price - LIMITED TIME for first 100 members!`,
    tags: ['pricing', 'tiers', 'plans', 'comparison']
  },
  {
    id: 5,
    category: 'pricing-plans',
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle. Your data is always preserved regardless of your plan level.',
    tags: ['upgrade', 'downgrade', 'billing', 'flexibility']
  },
  {
    id: 6,
    category: 'pricing-plans',
    question: 'Is there a free trial for paid plans?',
    answer: 'The Recon Kit IS your free trial! It gives you full access to core features forever. This lets you experience our philosophy and see the value before upgrading. Plus, all paid plans come with a 30-day money-back guarantee.',
    tags: ['free trial', 'guarantee', 'recon kit']
  },

  // FOUNDER'S CIRCLE
  {
    id: 7,
    category: 'founders-circle',
    question: 'What is The Founder\'s Circle?',
    answer: 'The Founder\'s Circle is our exclusive founding member offer - full Operator Plan access for just $7.49/month (normally $14.99). Your price is locked for LIFE as long as you stay subscribed. Limited to first 100 members and available for 7 days from launch only!',
    tags: ['founders circle', 'limited time', 'exclusive', 'lifetime price']
  },
  {
    id: 8,
    category: 'founders-circle',
    question: 'How many Founder\'s Circle spots are left?',
    answer: 'You can see the live counter in the app! We\'re limiting this to exactly 100 founding members. Once all spots are claimed OR 7 days pass from launch (whichever comes first), this offer disappears forever.',
    tags: ['spots remaining', 'counter', 'scarcity', 'limited']
  },
  {
    id: 9,
    category: 'founders-circle',
    question: 'What happens if I cancel my Founder\'s Circle membership?',
    answer: 'If you cancel, you lose your Founder\'s Circle status and the $7.49 lifetime price. If you want to rejoin later, you\'ll pay regular pricing ($14.99 for Operator Plan). The Founder\'s Circle offer is a one-time opportunity.',
    tags: ['cancellation', 'lifetime price', 'one-time offer']
  },

  // FEATURES & TOOLS
  {
    id: 10,
    category: 'features',
    question: 'What\'s included in the Budget Calculator?',
    answer: 'Our budget calculator includes TWO proven systems: the 50/30/20 rule (50% needs, 30% wants, 20% savings) and the 6 Jars system (Necessities 55%, Financial Freedom 10%, Long-term Savings 10%, Education 10%, Play 10%, Give 5%). Both help you allocate your income strategically.',
    tags: ['budget calculator', '50/30/20', '6 jars', 'budgeting']
  },
  {
    id: 11,
    category: 'features',
    question: 'How does the Side Hustle tracker work?',
    answer: 'The Side Hustle tracker (Operator Plan) lets you manage multiple businesses with separate income/expense tracking, profit calculations, and performance analytics. Perfect for freelancers, consultants, traders, or anyone building multiple income streams.',
    tags: ['side hustle', 'business tracking', 'multiple income', 'operator plan']
  },
  {
    id: 12,
    category: 'features',
    question: 'What investment features are included?',
    answer: 'The Investment Portfolio (Operator Plan) includes holdings tracking, DRIP (Dividend Reinvestment Plan) management, portfolio allocation visualization, performance metrics, multi-currency support, and tax optimization for different account types (RRSP, TFSA, Taxable).',
    tags: ['investment', 'portfolio', 'DRIP', 'holdings', 'operator plan']
  },
  {
    id: 13,
    category: 'features',
    question: 'Can I track multiple currencies?',
    answer: 'Yes! The Operator Plan includes full multi-currency support with live exchange rates. Perfect for travelers, digital nomads, or anyone with international investments. The Travel Mode also includes currency conversion for trip budgeting.',
    tags: ['multi-currency', 'travel', 'exchange rates', 'international']
  },

  // ACCOUNT & BILLING
  {
    id: 14,
    category: 'account-billing',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your account settings. Your access continues until the end of your current billing period, then you\'ll be moved to the free Recon Kit. All your data is preserved, just some features become locked.',
    tags: ['cancellation', 'billing', 'data preservation']
  },
  {
    id: 15,
    category: 'account-billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing. All transactions are encrypted and we never store your payment information.',
    tags: ['payment methods', 'stripe', 'security', 'credit cards']
  },
  {
    id: 16,
    category: 'account-billing',
    question: 'Do you offer refunds?',
    answer: 'Yes! All paid plans come with a 30-day, no-questions-asked money-back guarantee. If you\'re not satisfied for any reason, contact us within 30 days for a full refund.',
    tags: ['refunds', 'money-back guarantee', '30 days']
  },

  // TROUBLESHOOTING
  {
    id: 17,
    category: 'troubleshooting',
    question: 'My data isn\'t syncing between devices',
    answer: 'Make sure you\'re logged into the same account on all devices. Data syncs automatically through Firebase. If you\'re still having issues, try logging out and back in, or contact support.',
    tags: ['sync', 'multiple devices', 'firebase', 'login']
  },
  {
    id: 18,
    category: 'troubleshooting',
    question: 'I can\'t access a feature I should have',
    answer: 'Check your current plan in account settings. Some features require specific tiers (Climber for calculators, Operator for side hustle/investment/travel). If your plan is correct but features are still locked, try refreshing the page or contact support.',
    tags: ['feature access', 'plan tiers', 'locked features']
  },
  {
    id: 19,
    category: 'troubleshooting',
    question: 'The app is running slowly',
    answer: 'Try clearing your browser cache and cookies. The app works best on modern browsers (Chrome, Firefox, Safari, Edge). If you\'re on mobile, make sure you have a stable internet connection.',
    tags: ['performance', 'browser', 'cache', 'mobile']
  },
  {
    id: 20,
    category: 'troubleshooting',
    question: 'I forgot my password',
    answer: 'Click "Forgot Password" on the login screen and enter your email. You\'ll receive a password reset link. If you don\'t see the email, check your spam folder.',
    tags: ['password reset', 'login', 'email', 'forgot password']
  },

  // ADDITIONAL HELPFUL QUESTIONS
  {
    id: 21,
    category: 'getting-started',
    question: 'Is my financial data secure?',
    answer: 'Absolutely! We use enterprise-grade security with Firebase authentication, encrypted data transmission, and secure cloud storage. We never store banking credentials since we don\'t connect to banks. Your data is yours and completely private.',
    tags: ['security', 'privacy', 'data protection', 'firebase']
  },
  {
    id: 22,
    category: 'features',
    question: 'Can I export my data?',
    answer: 'Yes! Climber and Operator plans include data export functionality. You can export your transactions, budgets, and financial data as CSV files for backup or analysis in other tools.',
    tags: ['data export', 'CSV', 'backup', 'climber plan']
  },
  {
    id: 23,
    category: 'pricing-plans',
    question: 'Why these specific price points?',
    answer: 'Our pricing reflects the value of financial education and discipline-building tools. At $7.99-$14.99/month, we\'re significantly less than financial advisors ($100-300/hour) or other financial software, while providing tools that can help you build real wealth.',
    tags: ['pricing philosophy', 'value', 'financial education']
  },
  {
    id: 24,
    category: 'getting-started',
    question: 'Who is this app best for?',
    answer: 'The Freedom Compass App is perfect for students, young professionals, entrepreneurs, and anyone who wants to build better money habits through conscious financial management. If you believe discipline beats automation, this app is for you!',
    tags: ['target audience', 'students', 'entrepreneurs', 'young professionals']
  }
];

// Helper functions
export const getFAQsByCategory = (categoryId) => {
  return faqData.filter(faq => faq.category === categoryId);
};

export const searchFAQs = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return faqData.filter(faq => 
    faq.question.toLowerCase().includes(lowercaseQuery) ||
    faq.answer.toLowerCase().includes(lowercaseQuery) ||
    faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getFAQById = (id) => {
  return faqData.find(faq => faq.id === id);
};