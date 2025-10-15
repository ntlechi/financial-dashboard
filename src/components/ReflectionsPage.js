// 🎯 REFLECTIONS PAGE - Unified My Logbook + The Trail
import React, { useState } from 'react';
import { BookOpen, Download, Compass } from 'lucide-react';
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
      {/* 🆕 TWO-TAB HEADER */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-500/40">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-600/30">
          <button
            onClick={() => setActiveTab('logbook')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'logbook'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            My Logbook
          </button>
          <button
            onClick={() => setActiveTab('trail')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'trail'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5" />
            The Trail
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-semibold border border-amber-500/30">
              NEW
            </span>
          </button>
        </div>

        {/* Tab Content Header */}
        <div className="p-6">
          {activeTab === 'logbook' ? (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                  My Logbook
                </h1>
                <p className="text-slate-300">
                  Your unified journal feed with powerful search and organization
                </p>
              </div>
              
              {/* Export Button - FREE users see upgrade prompt */}
              {checkFeatureAccess && checkFeatureAccess('field-notes-export') ? (
                <button
                  onClick={() => exportMyLogbookToTXT()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  title="Export all logbook entries"
                >
                  <Download className="w-5 h-5" />
                  Export Notes
                </button>
              ) : (
                <button
                  onClick={() => showUpgradePromptForFeature && showUpgradePromptForFeature('field-notes-export')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  title="Upgrade to export notes"
                >
                  <Download className="w-5 h-5" />
                  <span className="flex items-center gap-2">
                    Export Notes
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Compass className="w-8 h-8 text-amber-400" />
                The Trail
              </h1>
              <p className="text-slate-300">
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
        />
      )}
    </div>
  );
}
