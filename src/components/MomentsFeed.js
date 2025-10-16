// 💫 MOMENTS FEED - Premium Freedom Journal with Timeline
// Project: Freedom Journal Transformation

import React, { useState, useEffect } from 'react';
import { Award, Camera, DollarSign, MapPin, Share2, Edit, Filter, BarChart2, Calendar, Image, Tag, X, Plus, Trash2, Search, BookOpen, Link, ChevronDown, ChevronUp } from 'lucide-react';

const MomentsFeed = ({ data, userId, onEditMoment, onShareMoment, onDeleteMoment }) => {
  const [moments, setMoments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'travel', 'achievements', 'expenses'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMoments, setExpandedMoments] = useState(new Set()); // NEW: Collapsible state

  useEffect(() => {
    // Simulate fetching moments from data or Firebase
    if (data?.moments) {
      setMoments(data.moments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } else {
      // Add sample moments for demo
      const sampleMoments = [
        {
          id: 1,
          title: "First Debt Payment",
          story: "Made my first extra payment on my credit card. It's small but it's progress!",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Home",
          isAchievement: true,
          photos: []
        },
        {
          id: 2,
          title: "Coffee Shop Budget Win",
          story: "Instead of buying coffee every day, I started making it at home. Saving $150/month!",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Coffee Shop",
          expenseLink: {
            description: "Daily Coffee",
            amount: 150
          },
          photos: []
        },
        {
          id: 3,
          title: "Emergency Fund Milestone",
          story: "Reached $1000 in my emergency fund! It took 3 months but I'm so proud.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Bank",
          isAchievement: true,
          photos: []
        }
      ];
      setMoments(sampleMoments);
    }
  }, [data]);

  const filteredMoments = moments.filter(moment => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (moment.location && moment.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'travel' && moment.isTravel) ||
      (filter === 'achievements' && moment.isAchievement) ||
      (filter === 'expenses' && moment.expenseLink);
    
    return matchesSearch && matchesFilter;
  });

  const totalMoments = moments.length;
  const totalExpensesLinked = moments.filter(moment => moment.expenseLink).length;

  // Toggle moment expansion
  const toggleMoment = (momentId) => {
    const newExpanded = new Set(expandedMoments);
    if (newExpanded.has(momentId)) {
      newExpanded.delete(momentId);
    } else {
      newExpanded.add(momentId);
    }
    setExpandedMoments(newExpanded);
  };

  // Get excerpt for collapsed view
  const getExcerpt = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getMomentSourceBadge = (moment) => {
    if (moment.isTravel) return <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold"><MapPin className="w-3 h-3"/>Travel</span>;
    if (moment.isAchievement) return <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold"><Award className="w-3 h-3"/>Achievement</span>;
    if (moment.expenseLink) return <span className="bg-red-600/20 text-red-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold"><DollarSign className="w-3 h-3"/>Expense</span>;
    return <span className="bg-gray-600/20 text-gray-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold"><Tag className="w-3 h-3"/>General</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* 💎 PREMIUM HEADER - Inspiring & Elegant - MOBILE RESPONSIVE! */}
      <div className="bg-gradient-to-br from-amber-900/30 via-purple-900/20 to-gray-900/40 rounded-2xl p-6 sm:p-10 border border-amber-500/30 mb-6 sm:mb-8 text-center shadow-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4" style={{ color: '#FBBF24' }}>
          💫 Your Moments
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-amber-100 italic font-semibold mb-2 sm:mb-3 px-2">
          Every milestone. Every sacrifice. Every win — remembered forever.
        </p>
        <p className="text-sm sm:text-base text-amber-200/70 font-medium px-2">
          ✨ Because numbers fade, but moments don't.
        </p>
      </div>

      {/* 💎 STATS BAR - BLUE THEME with WHITE Numbers! */}
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-4 sm:p-6 border border-blue-500/30 mb-6 sm:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-4xl sm:text-5xl font-black text-white">{totalMoments}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-medium">Total Moments</p>
          </div>
          
          <div className="hidden sm:block h-16 w-px bg-blue-500/20"></div>
          <div className="sm:hidden w-full h-px bg-blue-500/20"></div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              <Link className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-4xl sm:text-5xl font-black text-white">{totalExpensesLinked}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-medium">Expenses Linked</p>
          </div>
        </div>
      </div>

      {/* 💎 PHASE 3: PROMINENT SEARCH BAR - MOBILE RESPONSIVE! */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
          <input
            type="text"
            placeholder="Search moments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800/60 text-white pl-10 sm:pl-14 pr-4 py-3 sm:py-4 rounded-xl border border-amber-500/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-base sm:text-lg shadow-lg"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-amber-300 font-medium">
            ✨ Showing {filteredMoments.length} of {totalMoments} moments
          </div>
        )}
      </div>

      {/* 💎 PHASE 3: ACTION BUTTONS - MOBILE RESPONSIVE! */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-10">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="w-full sm:w-auto bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 sm:px-5 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border border-gray-600/30 transition-all"
          >
            <Filter className="w-4 h-4"/>
            Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
          {showFilterDropdown && (
            <div className="absolute z-10 mt-2 w-48 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
              <button onClick={() => { setFilter('all'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 rounded-t-lg">All</button>
              <button onClick={() => { setFilter('travel'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700">Travel</button>
              <button onClick={() => { setFilter('achievements'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700">Achievements</button>
              <button onClick={() => { setFilter('expenses'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 rounded-b-lg">Expenses Linked</button>
            </div>
          )}
        </div>
        
        {/* 💎 PRIMARY CTA - Vibrant Purple - MOBILE RESPONSIVE! */}
        <button
          onClick={() => onEditMoment(null)}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-base font-bold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5"/> Add New Moment
        </button>
      </div>

      {/* 💎 MOMENTS FEED - EXACT Logbook Structure! */}
      {filteredMoments.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block bg-gradient-to-br from-amber-900/20 to-purple-900/20 rounded-2xl p-12 border border-amber-500/20">
            <BookOpen className="w-20 h-20 text-amber-400/50 mx-auto mb-4" />
            <p className="text-2xl font-bold text-amber-200 mb-2">Your Freedom Journal Awaits</p>
            <p className="text-gray-400 mb-6">Start capturing your story!</p>
            <button
              onClick={() => onEditMoment(null)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl inline-flex items-center gap-3 text-base font-bold shadow-2xl transform hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5"/> Add Your First Moment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMoments.map((moment) => {
            const isExpanded = expandedMoments.has(moment.id);
            const excerpt = getExcerpt(moment.story, 120);
            const showReadMore = moment.story.length > 120;
            
            return (
              <div 
                key={moment.id} 
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-amber-500/10 overflow-hidden hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
              >
                {/* Card - Click to Expand (EXACT Logbook Structure!) */}
                <div
                  onClick={() => showReadMore && toggleMoment(moment.id)}
                  className={`p-4 ${showReadMore ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 💎 TITLE - Amber/Gold */}
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#FBBF24' }}>
                        {moment.title || 'Untitled Moment'}
                      </h3>
                      
                      {/* Content Preview */}
                      <p className="text-gray-300 leading-relaxed mb-2">
                        {isExpanded ? moment.story : excerpt}
                      </p>
                      
                      {/* Read More Toggle - Amber/Gold */}
                      {showReadMore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMoment(moment.id);
                          }}
                          className="hover:text-amber-200 text-sm flex items-center gap-1 transition-colors font-bold"
                          style={{ color: '#FBBF24' }}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Read More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Expand Icon */}
                    {showReadMore && (
                      <div className="text-gray-500">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 💎 DATE & LOCATION - Amber/Gold */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mt-3" style={{ color: '#FBBF24' }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> 
                      {new Date(moment.timestamp).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    {moment.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3"/> {moment.location}
                      </span>
                    )}
                  </div>
                  
                  {/* Source Badge - Amber/Gold */}
                  <div className="mt-2">
                    {getMomentSourceBadge(moment)}
                  </div>
                  
                  {/* Tags - Amber/Gold */}
                  {moment.tags && moment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {moment.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border border-amber-400/50"
                          style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Footer: Actions */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-700/50 opacity-100 sm:opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditMoment(moment); }} 
                      className="text-gray-400 hover:text-amber-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                      title="Edit moment"
                    >
                      <Edit className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onShareMoment(moment); }} 
                      className="text-gray-400 hover:text-blue-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                      title="Share moment"
                    >
                      <Share2 className="w-4 h-4"/>
                    </button>
                    {onDeleteMoment && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteMoment(moment.id); }} 
                        className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                        title="Delete moment"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 💎 LINKED EXPENSE - Premium Pill Button */}
                {moment.expenseLink && (
                  <div className="px-4 pb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20 transition-all">
                      <DollarSign className="w-4 h-4"/> 
                      {moment.expenseLink.description} • ${moment.expenseLink.amount}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MomentsFeed;
