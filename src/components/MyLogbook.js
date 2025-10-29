// 🎯 MY LOGBOOK - Unified Journal System with Tags, Search & Collapsible Cards
import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Calendar, Copy, Edit3, Trash2, ChevronDown, ChevronUp, X, Save, Filter, Download, Sparkles } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createBackup } from '../utils/dataSafetyUtils';
import { getTodayPrompt } from '../utils/journalPrompts';
import { useTranslation } from 'react-i18next';

export default function MyLogbook({ 
  data, 
  userId, 
  onUpdateData, 
  awardXp, 
  setXpRefreshTrigger,
  checkFeatureAccess,
  showUpgradePromptForFeature,
  onExport
}) {
  const { t } = useTranslation();
  
  // State
  const [entries, setEntries] = useState([]);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  // Add/Edit Entry Modal State
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryDate, setEntryDate] = useState(''); // NEW: Editable date
  const [entryTags, setEntryTags] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  
  // Notification State
  const [notification, setNotification] = useState(null);
  
  // 💫 NEW: Daily Prompt State
  const [todayPrompt, setTodayPrompt] = useState(null);
  const [promptProgress, setPromptProgress] = useState({ answered: 0, total: 365, streak: 0, cycle: 1 });
  const [showPromptCard, setShowPromptCard] = useState(true);

  // Calculate streak (consecutive days with entries) - DEFINED BEFORE useEffect
  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's an entry today or yesterday (to keep streak alive)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasRecentEntry = entries.some(e => {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() || entryDate.getTime() === yesterday.getTime();
    });
    
    if (!hasRecentEntry) return 0;
    
    // Count consecutive days backwards
    let checkDate = new Date(today);
    while (true) {
      const hasEntry = entries.some(e => {
        const entryDate = new Date(e.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (!hasEntry) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      
      if (streak > 365) break; // Safety limit
    }
    
    return streak;
  };

  // Load and unify all journal entries
  useEffect(() => {
    const unifiedEntries = [];
    
    // Load from fieldNotes (the "Add Note" entries)
    if (data?.fieldNotes && Array.isArray(data.fieldNotes)) {
      data.fieldNotes.forEach(note => {
        unifiedEntries.push({
          id: note.id,
          title: note.title || '',
          content: note.text,
          createdAt: note.timestamp || note.createdAt,
          updatedAt: note.lastEdited || note.timestamp,
          tags: note.tags || [],
          promptId: note.promptId || null,
          source: 'fieldNotes'
        });
      });
    }
    
    // Load from quickJournalEntries (the Quick Journal button entries)
    if (data?.quickJournalEntries && Array.isArray(data.quickJournalEntries)) {
      data.quickJournalEntries.forEach(entry => {
        unifiedEntries.push({
          id: entry.id,
          title: entry.title || '',
          content: entry.text,
          createdAt: entry.timestamp,
          updatedAt: entry.lastEdited || entry.timestamp,
          tags: entry.tags || [],
          promptId: entry.promptId || null,
          source: 'quickJournal'
        });
      });
    }
    
    // Sort by date (newest first)
    unifiedEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setEntries(unifiedEntries);
    
    // Extract all unique tags
    const tagsSet = new Set();
    unifiedEntries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    setAllTags(Array.from(tagsSet).sort());
    
    // 💫 NEW: Load today's prompt
    const answeredPromptIds = unifiedEntries
      .filter(e => e.promptId)
      .map(e => e.promptId);
    
    const userSeed = userId || 'default';
    const prompt = getTodayPrompt(answeredPromptIds, userSeed);
    setTodayPrompt(prompt);
    
    // Calculate progress
    const uniqueAnswered = new Set(answeredPromptIds);
    const completionCycles = Math.floor(uniqueAnswered.size / 365);
    
    setPromptProgress({
      answered: uniqueAnswered.size % 365 || (uniqueAnswered.size > 0 ? 365 : 0),
      total: 365,
      streak: calculateStreak(unifiedEntries),
      cycle: completionCycles > 0 ? completionCycles : 1
    });
  }, [data, userId]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // 💫 NEW: Answer today's prompt
  const answerPrompt = () => {
    if (todayPrompt) {
      setEntryTitle(`Prompt: ${todayPrompt.text.substring(0, 50)}...`);
      setEntryContent('');
      setEntryDate(new Date().toISOString().split('T')[0]);
      setEntryTags(todayPrompt.category);
      setShowAddEntryModal(true);
    }
  };

  // Toggle entry expansion
  const toggleEntry = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get excerpt
  const getExcerpt = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(t('logbook.copiedToClipboard'), 'success');
    }).catch(() => {
      showNotification(t('logbook.failedToCopy'), 'error');
    });
  };

  // Open Add Entry Modal
  const openAddEntryModal = () => {
    setEditingEntry(null);
    setEntryTitle('');
    setEntryContent('');
    setEntryDate(new Date().toISOString().split('T')[0]); // Default to today
    setEntryTags('');
    setShowAddEntryModal(true);
  };

  // Open Edit Entry Modal
  const openEditEntryModal = (entry) => {
    setEditingEntry(entry);
    setEntryTitle(entry.title || '');
    setEntryContent(entry.content);
    setEntryDate(new Date(entry.createdAt).toISOString().split('T')[0]); // Use entry's date
    setEntryTags(entry.tags ? entry.tags.join(', ') : '');
    setShowAddEntryModal(true);
  };

  // Close Add/Edit Modal
  const closeAddEntryModal = () => {
    setShowAddEntryModal(false);
    setEditingEntry(null);
    setEntryTitle('');
    setEntryContent('');
    setEntryDate('');
    setEntryTags('');
    setTagSuggestions([]);
  };

  // Handle tag input change (for autocomplete)
  const handleTagInput = (value) => {
    setEntryTags(value);
    
    // Simple autocomplete: show suggestions based on existing tags
    if (value.trim()) {
      const currentTags = value.split(',').map(t => t.trim()).filter(t => t);
      const lastTag = currentTags[currentTags.length - 1] || '';
      
      if (lastTag) {
        const suggestions = allTags.filter(tag => 
          tag.toLowerCase().startsWith(lastTag.toLowerCase()) &&
          !currentTags.includes(tag)
        );
        setTagSuggestions(suggestions.slice(0, 5));
      } else {
        setTagSuggestions([]);
      }
    } else {
      setTagSuggestions([]);
    }
  };

  // Apply tag suggestion
  const applyTagSuggestion = (suggestedTag) => {
    const currentTags = entryTags.split(',').map(t => t.trim()).filter(t => t);
    currentTags[currentTags.length - 1] = suggestedTag;
    setEntryTags(currentTags.join(', ') + ', ');
    setTagSuggestions([]);
  };

  // Save Entry (Add or Edit)
  const saveEntry = async () => {
    if (!entryContent.trim() || !userId) return;
    
    // 🛡️ SAFETY CHECK 1: Prevent data loss on edit!
    if (editingEntry) {
      const hasFieldNotes = data.fieldNotes && data.fieldNotes.length > 0;
      const hasQuickJournal = data.quickJournalEntries && data.quickJournalEntries.length > 0;
      
      if (editingEntry.source === 'fieldNotes' && !hasFieldNotes) {
        showNotification(t('logbook.dataErrorDetected'), 'error');
        console.error('🚨 CRITICAL: Attempting to edit when fieldNotes array is empty!');
        return;
      }
      
      if (editingEntry.source === 'quickJournal' && !hasQuickJournal) {
        showNotification(t('logbook.dataErrorDetected'), 'error');
        console.error('🚨 CRITICAL: Attempting to edit when quickJournal array is empty!');
        return;
      }
    }
    
    const parsedTags = entryTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t)
      .map(t => t.toLowerCase());
    
    const now = new Date().toISOString();
    
    let updatedFieldNotes = [...(data.fieldNotes || [])];
    let updatedQuickJournal = [...(data.quickJournalEntries || [])];
    
    if (editingEntry) {
      // EDIT EXISTING ENTRY
      // Update timestamp if date was changed
      const entryTimestamp = entryDate ? new Date(entryDate).toISOString() : editingEntry.createdAt;
      if (editingEntry.source === 'fieldNotes') {
        updatedFieldNotes = updatedFieldNotes.map(note =>
          note.id === editingEntry.id
            ? {
                ...note,
                title: entryTitle.trim(),
                text: entryContent.trim(),
                tags: parsedTags,
                timestamp: entryTimestamp, // Update timestamp
                lastEdited: now
              }
            : note
        );
        
        // 🛡️ SAFETY CHECK 2: Verify update succeeded
        const updated = updatedFieldNotes.find(note => note.id === editingEntry.id);
        if (!updated) {
          showNotification(t('logbook.updateFailed'), 'error');
          console.error('🚨 CRITICAL: Entry to update not found in fieldNotes!');
          return;
        }
        
        // 🛡️ SAFETY CHECK 3: Prevent mass deletion
        if (updatedFieldNotes.length === 0) {
          showNotification(t('logbook.cannotSave'), 'error');
          console.error('🚨 CRITICAL: Save blocked - would delete all fieldNotes!');
          return;
        }
      } else {
        updatedQuickJournal = updatedQuickJournal.map(entry =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                title: entryTitle.trim(),
                text: entryContent.trim(),
                tags: parsedTags,
                timestamp: entryTimestamp, // Update timestamp
                lastEdited: now
              }
            : entry
        );
        
        // 🛡️ SAFETY CHECK 2: Verify update succeeded
        const updated = updatedQuickJournal.find(entry => entry.id === editingEntry.id);
        if (!updated) {
          showNotification(t('logbook.updateFailed'), 'error');
          console.error('🚨 CRITICAL: Entry to update not found in quickJournal!');
          return;
        }
        
        // 🛡️ SAFETY CHECK 3: Prevent mass deletion
        if (updatedQuickJournal.length === 0) {
          showNotification(t('logbook.cannotSave'), 'error');
          console.error('🚨 CRITICAL: Save blocked - would delete all quickJournal!');
          return;
        }
      }
      showNotification(t('logbook.entryUpdated'), 'success');
    } else {
      // ADD NEW ENTRY
      // Use custom date if provided, otherwise use now
      const entryTimestamp = entryDate ? new Date(entryDate).toISOString() : now;
      
      // 💫 Check if this entry answers today's prompt
      const isAnsweringPrompt = todayPrompt && entryTitle.includes('Prompt:');
      
      const newEntry = {
        id: Date.now(),
        title: entryTitle.trim(),
        text: entryContent.trim(),
        tags: parsedTags,
        timestamp: entryTimestamp,
        createdAt: new Date(entryTimestamp).toLocaleString(),
        promptId: isAnsweringPrompt ? todayPrompt.id : null
      };
      
      updatedFieldNotes = [newEntry, ...updatedFieldNotes];
      
      // 🎮 GAMIFICATION: Award XP for milestones!
      const noteCount = updatedFieldNotes.length;
      if (awardXp && setXpRefreshTrigger) {
        try {
          if (noteCount === 1) {
            await awardXp(db, userId, 10);
            showNotification(t('logbook.firstEntry'), 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 5) {
            await awardXp(db, userId, 15);
            showNotification(t('logbook.milestone5'), 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 10) {
            await awardXp(db, userId, 25);
            showNotification(t('logbook.milestone10'), 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 25) {
            await awardXp(db, userId, 50);
            showNotification(t('logbook.milestone25'), 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else {
            showNotification(t('logbook.entrySaved'), 'success');
          }
        } catch (error) {
          console.warn('XP award failed (journal entry)', error);
          showNotification('📝 Entry saved!', 'success');
        }
      } else {
        showNotification('📝 Entry saved!', 'success');
      }
    }
    
    // 🛡️ SAFETY CHECK 4: Deep clone to prevent reference issues
    const updatedData = JSON.parse(JSON.stringify({
      ...data,
      fieldNotes: updatedFieldNotes,
      quickJournalEntries: updatedQuickJournal
    }));
    
    try {
      // 🛡️ SAFETY CHECK 5: Create backup BEFORE saving (if data exists)
      const hasData = (data.fieldNotes && data.fieldNotes.length > 0) || 
                      (data.quickJournalEntries && data.quickJournalEntries.length > 0);
      
      if (hasData) {
        await createBackup(userId, data, 'before-logbook-save');
      }
      
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      closeAddEntryModal();
    } catch (error) {
      console.error('Error saving entry:', error);
      showNotification(t('logbook.failedToSave'), 'error');
    }
  };

  // Delete Entry
  const deleteEntry = async (entry) => {
    if (!userId || !window.confirm(t('logbook.deleteConfirm'))) return;
    
    let updatedFieldNotes = [...(data.fieldNotes || [])];
    let updatedQuickJournal = [...(data.quickJournalEntries || [])];
    
    if (entry.source === 'fieldNotes') {
      updatedFieldNotes = updatedFieldNotes.filter(note => note.id !== entry.id);
    } else {
      updatedQuickJournal = updatedQuickJournal.filter(e => e.id !== entry.id);
    }
    
    const updatedData = {
      ...data,
      fieldNotes: updatedFieldNotes,
      quickJournalEntries: updatedQuickJournal
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      showNotification(t('logbook.entryDeleted'), 'success');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showNotification(t('logbook.failedToDelete'), 'error');
    }
  };

  // Toggle tag filter
  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Search filter
    const matchesSearch = 
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tag filter
    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.some(tag => entry.tags && entry.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Stats
  const totalEntries = entries.length;
  const totalTags = allTags.length;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* 💫 DAILY PROMPT CARD */}
      {todayPrompt && showPromptCard && (
        <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 rounded-xl p-6 border-2 border-purple-500/30 shadow-2xl mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-white">{t('logbook.todaysReflection')}</h3>
                <p className="text-xs text-gray-400">{t('logbook.dayOf365', { day: promptProgress.answered + 1, cycle: promptProgress.cycle })}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPromptCard(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-5 mb-4 border border-purple-400/20">
            <p className="text-white text-lg leading-relaxed italic">
              "{todayPrompt.text}"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Tag className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                {todayPrompt.category}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{t('logbook.progress')}</span>
              <span>{promptProgress.answered}/365 ({Math.round(promptProgress.answered / 365 * 100)}%)</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${(promptProgress.answered / 365 * 100)}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/60 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{promptProgress.streak}</div>
              <div className="text-xs text-gray-400">{t('logbook.dayStreak')}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{365 - promptProgress.answered}</div>
              <div className="text-xs text-gray-400">{t('logbook.toComplete')}</div>
            </div>
          </div>
          
          <button
            onClick={answerPrompt}
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl transform hover:scale-105"
          >
            <Edit3 className="w-5 h-5" />
            {t('logbook.answerThisPrompt')}
          </button>
        </div>
      )}
      
      {!showPromptCard && todayPrompt && (
        <button
          onClick={() => setShowPromptCard(true)}
          className="w-full bg-purple-900/20 hover:bg-purple-900/40 border-2 border-purple-500/30 text-purple-300 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Sparkles className="w-5 h-5" />
          {t('logbook.showTodaysPrompt')}
        </button>
      )}

      {/* 💎 ACTION BUTTONS ONLY - Moved header to ReflectionsPage! */}
      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Secondary Action - Export (Left) */}
          {checkFeatureAccess && checkFeatureAccess('field-notes-export') ? (
            <button
              onClick={onExport}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-gray-600"
              title="Export all logbook entries"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('logbook.exportNotes')}
            </button>
          ) : (
            <button
              onClick={() => showUpgradePromptForFeature && showUpgradePromptForFeature('field-notes-export')}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-gray-600"
              title="Upgrade to export notes"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="flex items-center gap-2">
                {t('logbook.exportNotes')}
                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </span>
            </button>
          )}

          {/* Primary Action - Add Entry (Right) - SMALLER! */}
          <button
            onClick={openAddEntryModal}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 sm:px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('logbook.addNewEntry')}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar - BRIGHT BLUE! */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/20 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('logbook.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-blue-500/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{t('logbook.filterByTag')}</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
                }`}
              >
                {tag}
              </button>
            ))}
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="ml-2 text-red-400 hover:text-red-300 text-xs underline"
              >
                {t('logbook.clearAll')}
              </button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {(searchQuery || selectedTags.length > 0) && (
          <div className="text-sm text-gray-400">
            {t('logbook.showing', { count: filteredEntries.length, total: totalEntries })}
          </div>
        )}
      </div>

      {/* Entries Feed */}
      {filteredEntries.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-lg p-12 border border-blue-500/20 text-center">
          {entries.length === 0 ? (
            <>
              <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('logbook.noEntriesYet')}</h3>
              <p className="text-gray-500 mb-4">
                {t('logbook.startJournal')}
              </p>
              <button
                onClick={openAddEntryModal}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-5 rounded-lg font-black text-lg transition-all inline-flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:rotate-1"
              >
                <Plus className="w-6 h-6" />
                {t('logbook.addFirstEntry')}
              </button>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('logbook.noMatchesFound')}</h3>
              <p className="text-gray-500 mb-4">
                {t('logbook.tryAdjusting')}
              </p>
              <button
                onClick={clearAllFilters}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {t('logbook.clearAllFilters')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            const hasTitle = entry.title && entry.title.trim();
            const excerpt = getExcerpt(entry.content, 120);
            const showReadMore = entry.content.length > 120;
            
            return (
              <div
                key={entry.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-blue-500/10 overflow-hidden hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
              >
                {/* Card Header (Always Visible) */}
                <div
                  onClick={() => showReadMore && toggleEntry(entry.id)}
                  className={`p-4 ${showReadMore ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 💎 PHASE 2: Bolder, Larger Entry Titles */}
                      {hasTitle && (
                        <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                          {entry.promptId && <Sparkles className="w-4 h-4 text-purple-400" />}
                          {entry.title}
                        </h3>
                      )}
                      
                      {/* Content Preview */}
                      <p className="text-gray-300 leading-relaxed mb-2">
                        {isExpanded ? entry.content : excerpt}
                      </p>
                      
                      {/* Read More Toggle - AMBER/GOLD for Brand! */}
                      {showReadMore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEntry(entry.id);
                          }}
                          className="hover:text-amber-200 text-sm flex items-center gap-1 transition-colors font-bold"
                          style={{ color: '#FBBF24' }}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              {t('logbook.showLess')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              {t('logbook.readMore')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Expand Icon (visual indicator) */}
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
                  
                  {/* Tags - AMBER/GOLD for Brand! */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.tags.map(tag => (
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
                  
                  {/* Footer: Date & Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                    {/* 💎 AMBER/GOLD Timestamps for Brand! */}
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#FBBF24' }}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.createdAt)}
                      {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                        <span className="ml-2">{t('logbook.edited')}</span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(entry.content);
                        }}
                        className="text-green-400 hover:text-green-300 p-1.5 hover:bg-green-900/20 rounded transition-colors"
                        title={t('logbook.copyToClipboard')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEntryModal(entry);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-900/20 rounded transition-colors"
                        title={t('logbook.editEntry')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry);
                        }}
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded transition-colors"
                        title={t('logbook.deleteEntry')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 💎 PHASE 3: STATS BAR - BLUE THEME with WHITE Numbers! */}
      {entries.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-8 border border-blue-500/30 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-5xl font-black text-white mb-2">{totalEntries}</div>
              <div className="text-gray-400 text-sm font-medium tracking-wide uppercase">{t('logbook.totalEntries')}</div>
            </div>
            <div>
              <div className="text-5xl font-black text-purple-400 mb-2">{promptProgress.answered}</div>
              <div className="text-gray-400 text-sm font-medium tracking-wide uppercase">{t('logbook.promptsAnswered')}</div>
            </div>
            <div>
              <div className="text-5xl font-black text-blue-400 mb-2">{promptProgress.streak}</div>
              <div className="text-gray-400 text-sm font-medium tracking-wide uppercase">{t('logbook.dayStreak')}</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white mb-2">{totalTags}</div>
              <div className="text-gray-400 text-sm font-medium tracking-wide uppercase">{t('logbook.uniqueTags')}</div>
            </div>
          </div>
          
          {/* Progress toward completion */}
          {promptProgress.answered > 0 && (
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-semibold">{t('logbook.journeyTo365')}</span>
                <span className="text-sm text-purple-400 font-bold">{t('logbook.percentComplete', { percent: Math.round(promptProgress.answered / 365 * 100) })}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
                  style={{ width: `${(promptProgress.answered / 365 * 100)}%` }}
                />
              </div>
              {promptProgress.answered >= 365 && (
                <div className="mt-3 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-purple-300 font-bold">{t('logbook.congratulations', { cycle: promptProgress.cycle })}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('logbook.startingFresh')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 💎 Add/Edit Entry Modal - Premium Gold! */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blue-500/30 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-700/30 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
              <h3 className="text-2xl font-black text-white">
                {editingEntry ? t('logbook.editEntryTitle') : t('logbook.addNewEntryTitle')}
              </h3>
              <button
                onClick={closeAddEntryModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('common.type')} <span className="text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder={t('logbook.titlePlaceholder')}
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full bg-gradient-to-br from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-blue-500/50"
                  autoFocus
                />
              </div>

              {/* Date (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  {t('logbook.entryDate')}
                  <span className="text-xs text-gray-500">{t('logbook.entryDateDefault')}</span>
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  style={{ maxWidth: '100%' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('logbook.missedDay')}
                </p>
              </div>

              {/* Content (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenu <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder={t('logbook.contentPlaceholder')}
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full bg-gradient-to-br from-gray-700 to-gray-800 text-white px-4 py-4 rounded-xl border-2 border-gray-600 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-blue-500/50 min-h-[200px] resize-none leading-relaxed"
                  rows="8"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Étiquettes <span className="text-gray-500">(séparées par des virgules)</span>
                </label>
                <input
                  type="text"
                  placeholder={t('logbook.tagsPlaceholder')}
                  value={entryTags}
                  onChange={(e) => handleTagInput(e.target.value)}
                  className="w-full bg-gradient-to-br from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-blue-500/50"
                />
                
                {/* Tag Suggestions */}
                {tagSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">{t('logbook.suggestions')}</span>
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => applyTagSuggestion(tag)}
                        className="px-2 py-1 text-xs rounded-full border hover:bg-blue-600/30 transition-colors font-semibold"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Tag Help Text */}
                <p className="text-xs text-gray-500 mt-2">
                  {t('logbook.proTip')}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={closeAddEntryModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={saveEntry}
                disabled={!entryContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-black transition-all flex items-center gap-2 shadow-2xl hover:shadow-3xl transform hover:scale-110"
              >
                <Save className="w-5 h-5" />
                {editingEntry ? t('logbook.saveChanges') : t('logbook.addEntry')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
