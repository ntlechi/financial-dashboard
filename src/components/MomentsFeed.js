// src/components/MomentsFeed.js
// 💫 MOMENTS FEED - Emotional Timeline Component

import React, { useState, useEffect } from 'react';
import { Award, Camera, DollarSign, MapPin, Share2, Edit, Filter, BarChart2, Calendar, Image, Tag, X, Plus } from 'lucide-react';

const MomentsFeed = ({ data, userId, onEditMoment, onShareMoment }) => {
  const [moments, setMoments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'travel', 'achievements', 'expenses'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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
    if (filter === 'all') return true;
    if (filter === 'travel' && moment.location) return true;
    if (filter === 'achievements' && moment.isAchievement) return true;
    if (filter === 'expenses' && moment.expenseLink) return true;
    return false;
  });

  const totalMoments = moments.length;
  const totalPhotos = moments.reduce((sum, moment) => sum + (moment.photos?.length || 0), 0);
  const totalExpensesLinked = moments.filter(moment => moment.expenseLink).length;

  const getMomentSourceBadge = (moment) => {
    if (moment.location) return <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3"/>Travel</span>;
    if (moment.isAchievement) return <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Award className="w-3 h-3"/>Achievement</span>;
    if (moment.expenseLink) return <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><DollarSign className="w-3 h-3"/>Expense</span>;
    return <span className="bg-gray-600/20 text-gray-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Tag className="w-3 h-3"/>General</span>;
  };

  const getGamificationBadge = () => {
    if (totalMoments >= 10) {
      return (
        <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <Award className="w-4 h-4"/> Memory Keeper (10+ Moments)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">💫 Your Moments</h2>
      <p className="text-gray-400 mb-8">
        "Where money meets meaning." Capture the stories behind your financial journey.
      </p>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border-purple-500/30 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Moments</p>
            <p className="text-2xl font-bold text-white">{totalMoments}</p>
          </div>
          <Calendar className="w-8 h-8 text-purple-500"/>
        </div>
        <div className="bg-gray-800 border-purple-500/30 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Photos</p>
            <p className="text-2xl font-bold text-white">{totalPhotos}</p>
          </div>
          <Camera className="w-8 h-8 text-purple-500"/>
        </div>
        <div className="bg-gray-800 border-purple-500/30 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Expenses Linked</p>
            <p className="text-2xl font-bold text-white">{totalExpensesLinked}</p>
          </div>
          <DollarSign className="w-8 h-8 text-purple-500"/>
        </div>
      </div>

      {/* Gamification Badge */}
      {getGamificationBadge() && (
        <div className="mb-8 text-center">
          {getGamificationBadge()}
        </div>
      )}

      {/* Filters and Add Moment */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Filter className="w-4 h-4"/>
            Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
          {showFilterDropdown && (
            <div className="absolute z-10 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg">
              <button onClick={() => { setFilter('all'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">All</button>
              <button onClick={() => { setFilter('travel'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">Travel</button>
              <button onClick={() => { setFilter('achievements'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">Achievements</button>
              <button onClick={() => { setFilter('expenses'); setShowFilterDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">Expenses Linked</button>
            </div>
          )}
        </div>
        <button
          onClick={() => onEditMoment(null)} // Pass null for new moment
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4"/> Add New Moment
        </button>
      </div>

      {/* Moments Timeline */}
      <div className="space-y-8">
        {filteredMoments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No moments yet. Start capturing your story!</p>
        ) : (
          filteredMoments.map(moment => (
            <div key={moment.id} className="bg-gray-800 border-purple-500/30 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{moment.title || 'Untitled Moment'}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3"/> {new Date(moment.timestamp).toLocaleDateString()}
                    {moment.location && <><MapPin className="w-3 h-3"/> {moment.location}</>}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getMomentSourceBadge(moment)}
                  <button onClick={() => onEditMoment(moment)} className="text-gray-400 hover:text-purple-400"><Edit className="w-4 h-4"/></button>
                  <button onClick={() => onShareMoment(moment)} className="text-gray-400 hover:text-purple-400"><Share2 className="w-4 h-4"/></button>
                </div>
              </div>

              {moment.photos && moment.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {moment.photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="relative w-full h-24 bg-gray-700 rounded-lg overflow-hidden">
                      <img src={photo.url} alt={`Moment photo ${index + 1}`} className="w-full h-full object-cover"/>
                      {index === 3 && moment.photos.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                          +{moment.photos.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-gray-300 mb-4">{moment.story}</p>

              {moment.expenseLink && (
                <div className="bg-gray-700/50 border border-red-600/30 text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
                  <DollarSign className="w-4 h-4"/> Linked to expense: {moment.expenseLink.description} (${moment.expenseLink.amount})
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MomentsFeed;
