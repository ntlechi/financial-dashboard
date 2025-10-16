// 💫 MOMENTS FEED - Premium Freedom Journal with Timeline
// Project: Freedom Journal Transformation

import React, { useState, useEffect } from 'react';
import { Award, Camera, DollarSign, MapPin, Share2, Edit, Filter, BarChart2, Calendar, Image, Tag, X, Plus, Trash2, Search, BookOpen, Link } from 'lucide-react';

const MomentsFeed = ({ data, userId, onEditMoment, onShareMoment, onDeleteMoment }) => {
  const [moments, setMoments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'travel', 'achievements', 'expenses'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getMomentSourceBadge = (moment) => {
    if (moment.location) return <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3"/>Travel</span>;
    if (moment.isAchievement) return <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Award className="w-3 h-3"/>Achievement</span>;
    if (moment.expenseLink) return <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><DollarSign className="w-3 h-3"/>Expense</span>;
    return <span className="bg-gray-600/20 text-gray-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Tag className="w-3 h-3"/>General</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 💎 PHASE 1: PREMIUM HEADER - Inspiring & Elegant */}
      <div className="bg-gradient-to-br from-amber-900/30 via-purple-900/20 to-gray-900/40 rounded-2xl p-10 border border-amber-500/30 mb-8 text-center shadow-2xl">
        <h2 className="text-5xl font-black mb-4" style={{ color: '#FBBF24' }}>
          💫 Your Moments
        </h2>
        <p className="text-2xl text-amber-100 italic font-semibold mb-3">
          Every milestone. Every sacrifice. Every win — remembered forever.
        </p>
        <p className="text-base text-amber-200/70 font-medium">
          ✨ Because numbers fade, but moments don't.
        </p>
      </div>

      {/* 💎 PHASE 1: ELEGANT STATS BAR - Single Unified Bar */}
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-amber-500/20 mb-8 shadow-lg">
        <div className="flex justify-around items-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span className="text-5xl font-black" style={{ color: '#FBBF24' }}>{totalMoments}</span>
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Total Moments</p>
          </div>
          
          <div className="h-16 w-px bg-amber-500/20"></div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Link className="w-6 h-6 text-amber-400" />
              <span className="text-5xl font-black" style={{ color: '#FBBF24' }}>{totalExpensesLinked}</span>
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Expenses Linked</p>
          </div>
        </div>
      </div>

      {/* 💎 PHASE 3: PROMINENT SEARCH BAR */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-amber-400" />
          <input
            type="text"
            placeholder="Search moments by story, location, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800/60 text-white pl-14 pr-4 py-4 rounded-xl border border-amber-500/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-lg shadow-lg"
          />
        </div>
        {searchQuery && (
          <div className="mt-3 text-sm text-amber-300 font-medium">
            ✨ Showing {filteredMoments.length} of {totalMoments} moments
          </div>
        )}
      </div>

      {/* 💎 PHASE 3: ACTION BUTTONS - Filter (Secondary) + Add (Primary) */}
      <div className="flex justify-between items-center mb-10">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-gray-600/30 transition-all"
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
        
        {/* 💎 PRIMARY CTA - Vibrant Purple */}
        <button
          onClick={() => onEditMoment(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-base font-bold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5"/> Add New Moment
        </button>
      </div>

      {/* 💎 PREMIUM MOMENTS FEED - Simple & Usable! */}
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
        <div className="space-y-6">
          {filteredMoments.map((moment) => (
            <div 
              key={moment.id} 
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700/50 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {/* 💎 HERO TITLE - Large, Bold, White */}
                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-amber-100 transition-colors">
                    {moment.title || 'Untitled Moment'}
                  </h3>
                  
                  {/* 💎 DATE & LOCATION - Amber/Gold */}
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold mb-2" style={{ color: '#FBBF24' }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4"/> 
                      {new Date(moment.timestamp).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    {moment.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4"/> {moment.location}
                      </span>
                    )}
                  </div>
                  
                  {/* Source Badge */}
                  <div className="mb-3">
                    {getMomentSourceBadge(moment)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEditMoment(moment)} 
                    className="text-gray-400 hover:text-amber-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    title="Edit moment"
                  >
                    <Edit className="w-4 h-4"/>
                  </button>
                  <button 
                    onClick={() => onShareMoment(moment)} 
                    className="text-gray-400 hover:text-blue-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    title="Share moment"
                  >
                    <Share2 className="w-4 h-4"/>
                  </button>
                  {onDeleteMoment && (
                    <button 
                      onClick={() => onDeleteMoment(moment.id)} 
                      className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                      title="Delete moment"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              </div>

              {/* 💎 STORY - Soft Gray */}
              <p className="text-gray-300 leading-relaxed mb-4 text-base">
                {moment.story}
              </p>

              {/* 💎 LINKED EXPENSE - Premium Pill Button */}
              {moment.expenseLink && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20 transition-all">
                  <DollarSign className="w-4 h-4"/> 
                  {moment.expenseLink.description} • ${moment.expenseLink.amount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MomentsFeed;
