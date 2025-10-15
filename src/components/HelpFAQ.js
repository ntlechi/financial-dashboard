import React, { useState } from 'react';
import { X, Search, ChevronDown, ChevronRight, Rocket, DollarSign, Crown, Wrench, Settings, AlertTriangle, TrendingUp, Compass } from 'lucide-react';

const HelpFAQ = ({ onClose, onOpenQuickStart }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = {
    'getting-started': {
      title: 'Getting Started',
      icon: Rocket,
      color: 'text-green-400',
      description: 'New user onboarding and basics',
      faqs: [
        {
          id: 1,
          question: 'What is The Freedom Compass App?',
          answer: 'The Freedom Compass App is your personal financial navigation system designed to guide you toward complete financial freedom. Unlike other apps that just track spending, we focus on building wealth through strategic planning, side hustle tracking, and investment management. Think of it as your financial GPS - showing you exactly where you are and the fastest route to where you want to be.',
          tags: ['overview', 'purpose', 'financial freedom'],
          popular: true
        },
        {
          id: 2,
          question: 'Why manual entry instead of bank connections?',
          answer: 'Manual entry is intentional and powerful. When you manually enter transactions, you become more aware of your spending patterns and financial decisions. This mindful approach leads to better financial habits. Plus, manual entry means maximum privacy - your bank credentials never leave your device, and you have complete control over what data is shared.',
          tags: ['manual entry', 'privacy', 'security', 'awareness'],
          popular: true
        },
        {
          id: 3,
          question: 'How do I get started with the free Recon Kit?',
          answer: 'Getting started is simple: 1) Create your account, 2) Add your current financial snapshot (income, expenses, assets, debts), 3) Set your first financial goal, 4) Start tracking daily transactions. The app will immediately show your net worth, cash flow, and savings rate. Most users see their complete financial picture within 10 minutes.',
          tags: ['recon kit', 'getting started', 'setup'],
          popular: false
        },
        {
          id: 4,
          question: 'Is my financial data secure?',
          answer: 'Absolutely. Your data is encrypted both in transit and at rest using bank-level security. We use Firebase (Google Cloud) infrastructure with strict access controls. Only you can access your financial information - not even our team can see your personal data. Your privacy and security are our top priorities.',
          tags: ['security', 'privacy', 'encryption', 'data protection'],
          popular: true
        },
        {
          id: 5,
          question: 'Can I use this if I\'m not tech-savvy?',
          answer: 'Yes! The Freedom Compass App is designed for everyone, regardless of technical experience. The interface is intuitive, with clear labels and helpful tooltips. If you can use a smartphone, you can master this app. Plus, our FAQ system and support team are here to help you succeed.',
          tags: ['ease of use', 'beginner friendly', 'support'],
          popular: false
        }
      ]
    },
    'pricing': {
      title: 'Pricing & Plans',
      icon: DollarSign,
      color: 'text-blue-400',
      description: 'All about tiers and billing',
      faqs: [
        {
          id: 6,
          question: 'What are the different pricing tiers?',
          answer: 'We have 3 main tiers: 1) Recon Kit "The Recruit" (Free Forever) - Basic dashboard with 5 essential cards (Net Worth, Cash Flow, Savings Rate, Monthly Income, Monthly Expenses), Budget Calculator, and Transaction Management, 2) Climber Plan "The Climber" ($7.99 USD/mo or $79 USD/year) - Full advanced dashboard with all cards, financial calculators, debt payoff, retirement planning, and goal tracking, 3) Operator Plan "The Operator" ($14.99 USD/mo or $149 USD/year) - Everything in Climber PLUS side hustle management, investment portfolio, and travel mode. Plus our limited Founder\'s Circle offer ($7.49 USD/mo for full Operator access) for the first 100 members.',
          tags: ['pricing', 'tiers', 'plans', 'features'],
          popular: true
        },
        {
          id: 7,
          question: 'Can I upgrade or downgrade anytime?',
          answer: 'Yes, you can change your plan anytime. Upgrades take effect immediately with prorated billing. Downgrades take effect at your next billing cycle, so you keep full access until then. No long-term contracts or cancellation fees. Annual plans save you 17% (equivalent to 2 months free).',
          tags: ['upgrade', 'downgrade', 'billing', 'flexibility', 'annual savings'],
          popular: true
        },
        {
          id: 8,
          question: 'Why these specific price points?',
          answer: 'Our pricing reflects the value delivered at each level. The Recon Kit is free because everyone deserves basic financial tools. Climber ($7.99) provides advanced analytics that replace expensive financial advisors. Operator ($14.99) includes business tools that typically cost $100+ elsewhere. Founder\'s Circle ($7.49) gives you full Operator features at half price - our way of rewarding early supporters.',
          tags: ['pricing strategy', 'value', 'comparison'],
          popular: false
        },
        {
          id: 9,
          question: 'Is there a money-back guarantee?',
          answer: 'Yes! All paid plans (Climber, Operator, and Founder\'s Circle) come with a 30-Day, No-Questions-Asked Money-Back Guarantee. If you\'re not completely satisfied within 30 days, we\'ll refund your payment in full. You can also cancel anytime and keep access until your billing period ends.',
          tags: ['refund', 'guarantee', 'cancellation', '30-day'],
          popular: false
        }
      ]
    },
    'founders-circle': {
      title: 'Founder\'s Circle',
      icon: Crown,
      color: 'text-amber-400',
      description: 'Exclusive founding member info',
      faqs: [
        {
          id: 10,
          question: 'What is The Founder\'s Circle?',
          answer: 'The Founder\'s Circle is an exclusive group of our first 100 users who get full Operator-level features ($14.99 USD value) for just $7.49 USD/month. This price is locked in for life as long as your subscription remains active. Founders get lifetime priority support, early access to new features, exclusive Founder badge, and access to our private Founder-only Discord channel.',
          tags: ['founders circle', 'exclusive', 'benefits', 'lifetime pricing'],
          popular: true
        },
        {
          id: 11,
          question: 'How many Founder spots are left?',
          answer: 'Founder spots are limited to exactly 100 members. The offer ends when either: 1) All 100 spots are claimed, OR 2) 7 days after our official launch (October 19, 2025, 9:00 AM EDT) - whichever comes first. Once the offer ends, it disappears forever and will never be available again.',
          tags: ['availability', 'limited', 'spots remaining', 'launch date'],
          popular: true
        },
        {
          id: 12,
          question: 'What happens if I cancel my Founder membership?',
          answer: 'If you cancel, you lose your Founder status forever - these spots will never be offered again. You can rejoin at regular pricing, but you won\'t get the Founder benefits, pricing, or badge back. That\'s why this decision is so important for early supporters.',
          tags: ['cancellation', 'founder status', 'permanent'],
          popular: false
        }
      ]
    },
    'features': {
      title: 'Features & Tools',
      icon: Wrench,
      color: 'text-purple-400',
      description: 'How to use every feature',
      faqs: [
        {
          id: 13,
          question: 'What\'s included in the Budget Calculator?',
          answer: 'Our Budget Calculator includes multiple methodologies: 50/30/20 rule (needs/wants/savings) and 6 Jars system (financial/education/play/etc.) - both available on the FREE tier! Climber and Operator tiers also unlock the Financial Freedom Calculator and Debt Payoff Calculator for advanced planning. It automatically calculates your savings rate, shows spending patterns, and suggests optimizations based on your goals.',
          tags: ['budget calculator', '50/30/20', '6 jars', 'savings rate'],
          popular: true
        },
        {
          id: 14,
          question: 'How does the Side Hustle tracker work?',
          answer: 'The Side Hustle tracker separates your business income and expenses from personal finances. It calculates profit margins, tracks tax-deductible expenses, estimates quarterly taxes, and shows your side hustle\'s contribution to your overall financial freedom timeline.',
          tags: ['side hustle', 'business tracking', 'profit', 'taxes'],
          popular: true
        },
        {
          id: 15,
          question: 'What investment features are included?',
          answer: 'Investment tracking includes portfolio performance, dividend tracking, DRIP calculations, asset allocation analysis, and projected growth scenarios. You can track stocks, ETFs, crypto, real estate, and alternative investments all in one place.',
          tags: ['investments', 'portfolio', 'dividends', 'performance'],
          popular: false
        },
        {
          id: 16,
          question: 'Can I track multiple currencies?',
          answer: 'Currently, the app works best with a single primary currency (USD, CAD, EUR, etc.). Multi-currency support is on our roadmap for future updates, especially for users with international investments or income sources.',
          tags: ['currency', 'international', 'multi-currency'],
          popular: false
        }
      ]
    },
    'investing': {
      title: 'Investing for Beginners',
      icon: TrendingUp,
      color: 'text-violet-400',
      description: 'Learn investing basics step-by-step',
      faqs: [
        {
          id: 24,
          question: 'What is a stock ticker symbol?',
          answer: 'A stock ticker is a unique code that identifies a publicly traded company (e.g., AAPL for Apple, TSLA for Tesla). Think of it like a company\'s nickname on the stock market. You can find ticker symbols on Yahoo Finance, Google Finance, or your broker\'s app. Just search for the company name!',
          tags: ['ticker', 'symbol', 'basics', 'stocks'],
          popular: true
        },
        {
          id: 25,
          question: 'How many shares should I buy?',
          answer: 'Start with what you can afford! Even 1 share makes you a part-owner of the company. Many beginners start with 1-5 shares to learn without risking too much. As you gain confidence and income, you can buy more. Remember: It\'s better to own 1 share of a good company than 0 shares of any company. Start small, learn as you go!',
          tags: ['shares', 'how many', 'beginner', 'starting out'],
          popular: true
        },
        {
          id: 26,
          question: 'What is Average Cost and why does it matter?',
          answer: 'Average Cost is the average price you paid per share. If you bought 5 shares at $100 and 5 shares at $120, your average cost is $110. This matters because your profit/loss is calculated from this number: if the stock is at $150, you\'re up $40 per share ($150 - $110). If you buy at multiple times, calculate: Total Money Spent ÷ Total Shares = Average Cost.',
          tags: ['average cost', 'cost basis', 'calculation', 'profit'],
          popular: true
        },
        {
          id: 27,
          question: 'What does DRIP mean and should I use it?',
          answer: 'DRIP = Dividend Reinvestment Plan. When a company pays you dividends (like rent from your investment), DRIP automatically uses that money to buy more shares instead of giving you cash. Why use it? It compounds your wealth faster! Example: You own 10 shares → earn $50 dividend → DRIP buys 1 more share → now you own 11 shares → next dividend is bigger! It\'s wealth on autopilot. Highly recommended for long-term investors!',
          tags: ['drip', 'dividends', 'reinvestment', 'compounding', 'passive income'],
          popular: true
        },
        {
          id: 28,
          question: 'What are dividends and how do they work?',
          answer: 'Dividends are cash payments companies give to shareholders - like rent from owning property! Example: You own 10 shares of a stock paying $2/share annually. You\'ll receive $20 per year in dividends. Some companies pay quarterly (every 3 months), others monthly. Dividend Yield shows this as a percentage (e.g., 3% yield means you earn $3 for every $100 invested). This is PASSIVE INCOME!',
          tags: ['dividends', 'passive income', 'yield', 'payments'],
          popular: true
        },
        {
          id: 29,
          question: 'What\'s the difference between Realized and Unrealized Gains?',
          answer: 'Unrealized Gain = Profit "on paper" (you haven\'t sold yet). Example: You bought at $100, stock is now $150 - you have $50 unrealized gain. Realized Gain = Profit you actually locked in by selling. If you sell those shares at $150, that $50 becomes a realized gain. Important: You only pay taxes on REALIZED gains (when you sell), not unrealized gains. Until you sell, it\'s just potential profit!',
          tags: ['realized gains', 'unrealized gains', 'profit', 'taxes', 'selling'],
          popular: true
        },
        {
          id: 30,
          question: 'What account type should I choose (TFSA vs RRSP)?',
          answer: 'TFSA (Tax-Free Savings Account) = Contributions use after-tax money, but ALL gains are tax-free forever. Perfect for: Short-mid term goals, flexible withdrawals. RRSP (Registered Retirement Savings Plan) = Contributions are tax-deductible now, but you pay tax when withdrawing. Perfect for: Retirement savings, reducing current taxes. Simple rule: Use TFSA if you want flexibility, RRSP if you want tax deductions now. Many investors use both!',
          tags: ['tfsa', 'rrsp', 'account types', 'tax', 'canada'],
          popular: false
        },
        {
          id: 31,
          question: 'How do I find the current price of a stock?',
          answer: 'Easy! Go to Yahoo Finance (finance.yahoo.com), Google Finance, or your broker\'s app. Type the ticker symbol (e.g., AAPL) and you\'ll see the current price. Prices update throughout the trading day (9:30 AM - 4:00 PM EST, Monday-Friday). You can also just Google "AAPL stock price" and it shows right in search results!',
          tags: ['stock price', 'current price', 'how to find', 'yahoo finance'],
          popular: false
        },
        {
          id: 32,
          question: 'I\'m completely new - where do I start?',
          answer: 'Start here: 1) Learn the basics (you\'re doing it now!), 2) Open a brokerage account (Wealthsimple, Questrade, etc. in Canada), 3) Start with 1 share of a company you know (Apple, Microsoft, etc.), 4) Add it to this app and watch it grow!, 5) Learn as you go - each investment teaches you something new. Remember: Every expert investor started exactly where you are now. You\'ve got this! 💪',
          tags: ['beginner', 'getting started', 'first investment', 'how to start'],
          popular: true
        }
      ]
    },
    'account': {
      title: 'Account & Billing',
      icon: Settings,
      color: 'text-cyan-400',
      description: 'Account management',
      faqs: [
        {
          id: 17,
          question: 'How do I change my subscription plan?',
          answer: 'Go to Settings > Subscription in the app, or click the crown icon in the top-right corner. You can upgrade immediately or schedule downgrades for your next billing cycle. Changes are processed instantly with prorated billing.',
          tags: ['subscription', 'plan change', 'billing'],
          popular: true
        },
        {
          id: 18,
          question: 'Can I export my financial data?',
          answer: 'Yes! Operator and Founder members can export all their data in CSV format. This includes transactions, goals, investment holdings, and historical data. Your data belongs to you, and you can take it with you anytime.',
          tags: ['export', 'data portability', 'CSV'],
          popular: false
        },
        {
          id: 19,
          question: 'What happens if I delete my account?',
          answer: 'Account deletion is permanent and irreversible. All your financial data, goals, and history will be permanently deleted within 30 days. Make sure to export your data first if you want to keep it. We cannot recover deleted accounts.',
          tags: ['account deletion', 'data removal', 'permanent'],
          popular: false
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      icon: AlertTriangle,
      color: 'text-red-400',
      description: 'Common issues and fixes',
      faqs: [
        {
          id: 20,
          question: 'Why aren\'t my calculations updating?',
          answer: 'Try refreshing the page first. If calculations still seem wrong, check that all your income and expense entries are correct. The app recalculates everything in real-time, so incorrect data will affect all metrics. Contact support if the issue persists.',
          tags: ['calculations', 'refresh', 'data accuracy'],
          popular: true
        },
        {
          id: 21,
          question: 'The app seems slow or unresponsive',
          answer: 'Clear your browser cache and cookies, then reload the app. If you have many transactions (500+), the app might take a moment to process calculations. Consider archiving old data or using a more recent browser version.',
          tags: ['performance', 'slow', 'cache', 'browser'],
          popular: false
        },
        {
          id: 22,
          question: 'I can\'t see my data after logging in',
          answer: 'This usually means you\'re logged into a different account than expected. Check your email address in Settings. If you used anonymous login before, your data might be tied to that session. Contact support to help merge accounts if needed.',
          tags: ['data missing', 'login', 'account', 'anonymous'],
          popular: true
        },
        {
          id: 23,
          question: 'How do I contact support?',
          answer: 'Email us at support@survivebackpacking.com or use the contact form in Settings. Founder members get priority support with 24-hour response times. Include your account email and detailed description of the issue for fastest resolution.',
          tags: ['support', 'contact', 'help', 'response time'],
          popular: true
        }
      ]
    }
  };

  // Get all FAQs for searching
  const allFAQs = Object.values(faqData).flatMap(category => 
    category.faqs.map(faq => ({ ...faq, category: category.title }))
  );

  // Filter FAQs based on search term
  const filteredFAQs = searchTerm 
    ? allFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const handleCategoryClick = (categoryKey) => {
    setActiveCategory(categoryKey);
    setSearchTerm('');
    setExpandedFAQ(null);
  };

  const handleBackToCategories = () => {
    setActiveCategory(null);
    setExpandedFAQ(null);
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const highlightSearchTerm = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black">$1</mark>');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center">
            {activeCategory && (
              <button
                onClick={handleBackToCategories}
                className="mr-3 text-gray-400 hover:text-white p-1 rounded"
              >
                ←
              </button>
            )}
            <h2 className="text-2xl font-bold text-white">
              {activeCategory ? faqData[activeCategory].title : 'Help & FAQ'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Start Guide Button */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => {
              if (onOpenQuickStart) onOpenQuickStart();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mb-4"
          >
            <Compass className="w-5 h-5" />
            🧭 View Quick Start Guide
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-400">
              {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchTerm ? (
            // Search Results
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQs found matching "{searchTerm}"</p>
                  <p className="text-sm mt-2">Try different keywords or browse categories</p>
                </div>
              ) : (
                filteredFAQs.map(faq => (
                  <div key={faq.id} className="bg-gray-700/50 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full p-4 text-left flex justify-between items-start hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-white mb-1"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightSearchTerm(faq.question, searchTerm) 
                          }}
                        />
                        <div className="text-xs text-gray-400 mb-2">
                          Category: {faq.category}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {expandedFAQ === faq.id ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <div 
                          className="text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightSearchTerm(faq.answer, searchTerm) 
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : activeCategory ? (
            // Category FAQs
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  {React.createElement(faqData[activeCategory].icon, { 
                    className: `w-6 h-6 mr-3 ${faqData[activeCategory].color}` 
                  })}
                  <h3 className="text-xl font-bold text-white">{faqData[activeCategory].title}</h3>
                </div>
                <p className="text-gray-400">{faqData[activeCategory].description}</p>
              </div>

              {faqData[activeCategory].faqs.map(faq => (
                <div key={faq.id} className="bg-gray-700/50 rounded-lg">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-4 text-left flex justify-between items-start hover:bg-gray-700/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-white">{faq.question}</h3>
                        {faq.popular && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {expandedFAQ === faq.id ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <div className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Category Grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(faqData).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className="bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-6 text-left transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    {React.createElement(category.icon, { 
                      className: `w-8 h-8 ${category.color} group-hover:scale-110 transition-transform` 
                    })}
                    <h3 className="text-xl font-bold text-white ml-3">{category.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-3">{category.description}</p>
                  <div className="text-sm text-gray-500">
                    {category.faqs.length} FAQ{category.faqs.length !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 text-center text-sm text-gray-400">
          <p>Still need help? Contact us at <span className="text-blue-400">support@survivebackpacking.com</span></p>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;