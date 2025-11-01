import React, { useState } from 'react';
import { X, Search, ChevronDown, ChevronRight, Rocket, DollarSign, Crown, Wrench, Settings, AlertTriangle, TrendingUp, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HelpFAQ = ({ onClose, onOpenQuickStart }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = {
    'getting-started': {
      title: t('faq.gettingStarted.title'),
      icon: Rocket,
      color: 'text-green-400',
      description: t('faq.gettingStarted.description'),
      faqs: [
        {
          id: 1,
          question: t('faq.gettingStarted.q1'),
          answer: t('faq.gettingStarted.a1'),
          tags: [t('faq.tags.overview'), t('faq.tags.purpose'), t('faq.tags.financialFreedom')],
          popular: true
        },
        {
          id: 2,
          question: t('faq.gettingStarted.q2'),
          answer: t('faq.gettingStarted.a2'),
          tags: [t('faq.tags.manualEntry'), t('faq.tags.privacy'), t('faq.tags.security'), t('faq.tags.awareness')],
          popular: true
        },
        {
          id: 3,
          question: t('faq.gettingStarted.q3'),
          answer: t('faq.gettingStarted.a3'),
          tags: [t('faq.tags.reconKit'), t('faq.tags.gettingStarted'), t('faq.tags.setup')],
          popular: false
        },
        {
          id: 4,
          question: t('faq.gettingStarted.q4'),
          answer: t('faq.gettingStarted.a4'),
          tags: [t('faq.tags.security'), t('faq.tags.privacy'), t('faq.tags.encryption'), t('faq.tags.dataProtection')],
          popular: true
        },
        {
          id: 5,
          question: t('faq.gettingStarted.q5'),
          answer: t('faq.gettingStarted.a5'),
          tags: [t('faq.tags.easeOfUse'), t('faq.tags.beginnerFriendly'), t('faq.tags.support')],
          popular: false
        }
      ]
    },
    'pricing': {
      title: t('faq.pricing.title'),
      icon: DollarSign,
      color: 'text-blue-400',
      description: t('faq.pricing.description'),
      faqs: [
        {
          id: 6,
          question: t('faq.pricing.q1'),
          answer: t('faq.pricing.a1'),
          tags: ['pricing', 'tiers', 'plans', 'features'],
          popular: true
        },
        {
          id: 7,
          question: t('faq.pricing.q2'),
          answer: t('faq.pricing.a2'),
          tags: ['upgrade', 'downgrade', 'billing', 'flexibility', 'annual savings'],
          popular: true
        },
        {
          id: 8,
          question: t('faq.pricing.q3'),
          answer: t('faq.pricing.a3'),
          tags: ['pricing strategy', 'value', 'comparison'],
          popular: false
        },
        {
          id: 9,
          question: t('faq.pricing.q4'),
          answer: t('faq.pricing.a4'),
          tags: ['refund', 'guarantee', 'cancellation', '30-day'],
          popular: false
        }
      ]
    },
    'founders-circle': {
      title: t('faq.foundersCircle.title'),
      icon: Crown,
      color: 'text-amber-400',
      description: t('faq.foundersCircle.description'),
      faqs: [
        {
          id: 10,
          question: t('faq.foundersCircle.q1'),
          answer: t('faq.foundersCircle.a1'),
          tags: ['founders circle', 'exclusive', 'benefits', 'lifetime pricing'],
          popular: true
        },
        {
          id: 11,
          question: t('faq.foundersCircle.q2'),
          answer: t('faq.foundersCircle.a2'),
          tags: ['availability', 'limited', 'spots remaining', 'launch date'],
          popular: true
        },
        {
          id: 12,
          question: t('faq.foundersCircle.q3'),
          answer: t('faq.foundersCircle.a3'),
          tags: ['cancellation', 'founder status', 'permanent'],
          popular: false
        }
      ]
    },
    'features': {
      title: t('faq.features.title'),
      icon: Wrench,
      color: 'text-purple-400',
      description: t('faq.features.description'),
      faqs: [
        {
          id: 13,
          question: t('faq.features.q1'),
          answer: t('faq.features.a1'),
          tags: ['budget calculator', '50/30/20', '6 jars', 'savings rate'],
          popular: true
        },
        {
          id: 14,
          question: t('faq.features.q2'),
          answer: t('faq.features.a2'),
          tags: ['side hustle', 'business tracking', 'profit', 'taxes'],
          popular: true
        },
        {
          id: 15,
          question: t('faq.features.q3'),
          answer: t('faq.features.a3'),
          tags: ['investments', 'portfolio', 'dividends', 'performance'],
          popular: false
        },
        {
          id: 16,
          question: t('faq.features.q4'),
          answer: t('faq.features.a4'),
          tags: ['currency', 'international', 'multi-currency'],
          popular: false
        }
      ]
    },
    'investing': {
      title: t('faq.investing.title'),
      icon: TrendingUp,
      color: 'text-violet-400',
      description: t('faq.investing.description'),
      faqs: [
        {
          id: 24,
          question: t('faq.investing.q1'),
          answer: t('faq.investing.a1'),
          tags: ['ticker', 'symbol', 'basics', 'stocks'],
          popular: true
        },
        {
          id: 25,
          question: t('faq.investing.q2'),
          answer: t('faq.investing.a2'),
          tags: ['shares', 'how many', 'beginner', 'starting out'],
          popular: true
        },
        {
          id: 26,
          question: t('faq.investing.q3'),
          answer: t('faq.investing.a3'),
          tags: ['average cost', 'cost basis', 'calculation', 'profit'],
          popular: true
        },
        {
          id: 27,
          question: t('faq.investing.q4'),
          answer: t('faq.investing.a4'),
          tags: ['drip', 'dividends', 'reinvestment', 'compounding', 'passive income'],
          popular: true
        },
        {
          id: 28,
          question: t('faq.investing.q5'),
          answer: t('faq.investing.a5'),
          tags: ['dividends', 'passive income', 'yield', 'payments'],
          popular: true
        },
        {
          id: 29,
          question: t('faq.investing.q6'),
          answer: t('faq.investing.a6'),
          tags: ['realized gains', 'unrealized gains', 'profit', 'taxes', 'selling'],
          popular: true
        },
        {
          id: 30,
          question: t('faq.investing.q7'),
          answer: t('faq.investing.a7'),
          tags: ['tfsa', 'rrsp', 'account types', 'tax', 'canada'],
          popular: false
        },
        {
          id: 31,
          question: t('faq.investing.q8'),
          answer: t('faq.investing.a8'),
          tags: ['stock price', 'current price', 'how to find', 'yahoo finance'],
          popular: false
        },
        {
          id: 32,
          question: t('faq.investing.q9'),
          answer: t('faq.investing.a9'),
          tags: ['beginner', 'getting started', 'first investment', 'how to start'],
          popular: true
        }
      ]
    },
    'account': {
      title: t('faq.account.title'),
      icon: Settings,
      color: 'text-cyan-400',
      description: t('faq.account.description'),
      faqs: [
        {
          id: 17,
          question: t('faq.account.q1'),
          answer: t('faq.account.a1'),
          tags: ['subscription', 'plan change', 'billing'],
          popular: true
        },
        {
          id: 18,
          question: t('faq.account.q2'),
          answer: t('faq.account.a2'),
          tags: ['export', 'data portability', 'CSV'],
          popular: false
        },
        {
          id: 19,
          question: t('faq.account.q3'),
          answer: t('faq.account.a3'),
          tags: ['account deletion', 'data removal', 'permanent'],
          popular: false
        },
        {
          id: 33,
          question: t('faq.account.q4'),
          answer: t('faq.account.a4'),
          tags: ['subscription management', 'invoices', 'billing', 'customer portal', 'payment methods'],
          popular: true
        }
      ]
    },
    'troubleshooting': {
      title: t('faq.troubleshooting.title'),
      icon: AlertTriangle,
      color: 'text-red-400',
      description: t('faq.troubleshooting.description'),
      faqs: [
        {
          id: 20,
          question: t('faq.troubleshooting.q1'),
          answer: t('faq.troubleshooting.a1'),
          tags: ['calculations', 'refresh', 'data accuracy'],
          popular: true
        },
        {
          id: 21,
          question: t('faq.troubleshooting.q2'),
          answer: t('faq.troubleshooting.a2'),
          tags: ['performance', 'slow', 'cache', 'browser'],
          popular: false
        },
        {
          id: 22,
          question: t('faq.troubleshooting.q3'),
          answer: t('faq.troubleshooting.a3'),
          tags: ['data missing', 'login', 'account', 'anonymous'],
          popular: true
        },
        {
          id: 23,
          question: t('faq.troubleshooting.q4'),
          answer: t('faq.troubleshooting.a4'),
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
              {activeCategory ? faqData[activeCategory].title : t('faq.title')}
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
            {t('faq.viewQuickStartGuide')}
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-400">
              {filteredFAQs.length} {t('faq.resultsFound')}
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
                  <p>{t('faq.noResultsFound')} "{searchTerm}"</p>
                  <p className="text-sm mt-2">{t('faq.tryDifferentKeywords')}</p>
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
                          {t('faq.category')} {faq.category}
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
                            {t('faq.popular')}
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
          <div className="mb-3">
            <a 
              href="https://billing.stripe.com/p/login/4gM00daP4gbN1bU56T7bW00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('faq.manageSubscription')}
            </a>
          </div>
          <p>{t('faq.stillNeedHelp')} <span className="text-blue-400">support@survivebackpacking.com</span></p>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;