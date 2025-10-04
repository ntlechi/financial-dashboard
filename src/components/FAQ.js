import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, X, ArrowLeft } from 'lucide-react';
import { faqCategories, faqData, getFAQsByCategory, searchFAQs } from '../data/faqData';

const FAQ = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Filter FAQs based on search or category
  const filteredFAQs = useMemo(() => {
    if (searchQuery.trim()) {
      return searchFAQs(searchQuery);
    } else if (selectedCategory) {
      return getFAQsByCategory(selectedCategory);
    }
    return [];
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setExpandedFAQ(null);
    setShowSearch(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setExpandedFAQ(null);
    setShowSearch(false);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    setSelectedCategory(null);
    setSearchQuery('');
    setExpandedFAQ(null);
  };

  const selectedCategoryInfo = selectedCategory 
    ? faqCategories.find(cat => cat.id === selectedCategory)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(selectedCategory || showSearch) && (
                <button
                  onClick={handleBackToCategories}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <HelpCircle className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {showSearch ? 'Search FAQ' : selectedCategoryInfo ? selectedCategoryInfo.name : 'Help Center'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {showSearch ? 'Find answers to your questions' : 
                   selectedCategoryInfo ? selectedCategoryInfo.description : 
                   'Get help with The Freedom Compass App'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearchToggle}
                className={`p-2 rounded-lg transition-colors ${
                  showSearch 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Categories View */}
          {!selectedCategory && !showSearch && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                    <div className="mt-2 text-xs text-blue-400">
                      {getFAQsByCategory(category.id).length} articles
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  👑 Popular Questions
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleCategorySelect('founders-circle')}
                    className="block text-yellow-300 hover:text-yellow-200 text-sm"
                  >
                    → What is The Founder's Circle?
                  </button>
                  <button 
                    onClick={() => handleCategorySelect('pricing-plans')}
                    className="block text-yellow-300 hover:text-yellow-200 text-sm"
                  >
                    → What are the different pricing tiers?
                  </button>
                  <button 
                    onClick={() => handleCategorySelect('getting-started')}
                    className="block text-yellow-300 hover:text-yellow-200 text-sm"
                  >
                    → Why manual entry instead of bank connections?
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQ List View */}
          {(selectedCategory || showSearch) && (
            <div className="p-6">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    {searchQuery ? 'No results found' : 'No FAQs in this category'}
                  </h3>
                  <p className="text-gray-400">
                    {searchQuery 
                      ? 'Try different keywords or browse categories' 
                      : 'Check back soon for more content'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
                      >
                        <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4 border-t border-gray-700">
                          <div className="pt-4 text-gray-300 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                          
                          {/* Tags */}
                          {faq.tags && faq.tags.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-700">
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results Count */}
              {searchQuery && filteredFAQs.length > 0 && (
                <div className="mt-6 text-center text-gray-400 text-sm">
                  Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-center text-sm text-gray-400">
            <p>Still need help? Contact us at <span className="text-blue-400">janara@survivebackpacking.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;