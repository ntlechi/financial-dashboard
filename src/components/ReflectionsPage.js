// 🎯 REFLECTIONS PAGE - Unified My Logbook + The Trail
import React, { useState } from 'react';
import { BookOpen, Compass } from 'lucide-react';
import TheTrail from './TheTrail';
import MyLogbook from './MyLogbook';

export default function ReflectionsPage({ 
  data, 
  userPlan, 
  onExportPDF, 
  onUpdateData, 
  userId, 
  checkFeatureAccess, 
  showUpgradePromptForFeature, 
  awardXp, 
  setXpRefreshTrigger 
}) {
  // 🆕 Tab State
  const [activeTab, setActiveTab] = useState('logbook'); // 'logbook' or 'trail'

  // Export My Logbook to TXT
  const exportMyLogbookToTXT = () => {
    const content = [];
    
    // Add all field notes
    const fieldNotes = data?.fieldNotes || [];
    fieldNotes.forEach(note => {
      content.push(`\n${'='.repeat(60)}\n`);
      if (note.title) {
        content.push(`${note.title}\n`);
      }
      content.push(`${new Date(note.timestamp || note.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n`);
      if (note.tags && note.tags.length > 0) {
        content.push(`Tags: ${note.tags.join(', ')}\n`);
      }
      content.push(`\n${note.text}\n`);
    });
    
    // Add quick journal entries
    const quickJournal = data?.quickJournalEntries || [];
    if (quickJournal.length > 0) {
      content.push(`\n${'='.repeat(60)}\n`);
      content.push(`QUICK JOURNAL ENTRIES\n`);
      content.push(`${'='.repeat(60)}\n\n`);
      quickJournal.forEach(entry => {
        if (entry.title) {
          content.push(`${entry.title}\n`);
        }
        content.push(`📝 ${new Date(entry.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n`);
        if (entry.tags && entry.tags.length > 0) {
          content.push(`Tags: ${entry.tags.join(', ')}\n`);
        }
        content.push(`${entry.text}\n\n`);
      });
    }
    
    const fullContent = `MY LOGBOOK ARCHIVE\n${'='.repeat(60)}\n` + content.join('');
    
    // Create a blob and download
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-logbook-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* 🆕 UNIFIED HEADER: Tabs + Title + Tagline - SLATE BACKGROUND! */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-500/40">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-600/30 flex-wrap">
          <button
            onClick={() => setActiveTab('logbook')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'logbook'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            My Logbook
          </button>
          <button
            onClick={() => setActiveTab('trail')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'trail'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            The Trail
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-semibold border border-amber-500/30">
              NEW
            </span>
          </button>
        </div>

        {/* Header: Book Icon + Title + Tagline */}
        <div className="p-6">
          {activeTab === 'logbook' && (
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
                Your Mission Logbook
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium px-4">
                Your thoughts are the blueprint for your freedom. Capture them here.
              </p>
            </div>
          )}
          
          {activeTab === 'trail' && (
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                The Trail
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium px-4">
                Guided missions spanning Financial Freedom, Becoming Great, Entrepreneurship, Essential Survival, and Traveler's Wisdom
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🆕 CONDITIONAL CONTENT BASED ON ACTIVE TAB */}
      {activeTab === 'trail' ? (
        <TheTrail 
          userId={userId}
          awardXp={awardXp}
          setXpRefreshTrigger={setXpRefreshTrigger}
        />
      ) : (
        <MyLogbook
          data={data}
          userId={userId}
          onUpdateData={onUpdateData}
          awardXp={awardXp}
          setXpRefreshTrigger={setXpRefreshTrigger}
          checkFeatureAccess={checkFeatureAccess}
          showUpgradePromptForFeature={showUpgradePromptForFeature}
          onExport={exportMyLogbookToTXT}
        />
      )}
    </div>
  );
}
