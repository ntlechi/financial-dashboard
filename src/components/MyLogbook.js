// 🎯 MY LOGBOOK - Unified Journal System with Tags, Search & Collapsible Cards
import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Calendar, Copy, Edit3, Trash2, ChevronDown, ChevronUp, X, Save, Filter } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function MyLogbook({ 
  data, 
  userId, 
  onUpdateData, 
  awardXp, 
  setXpRefreshTrigger 
}) {
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
  const [entryTags, setEntryTags] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  
  // Notification State
  const [notification, setNotification] = useState(null);

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
  }, [data]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
      showNotification('📋 Copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  };

  // Open Add Entry Modal
  const openAddEntryModal = () => {
    setEditingEntry(null);
    setEntryTitle('');
    setEntryContent('');
    setEntryTags('');
    setShowAddEntryModal(true);
  };

  // Open Edit Entry Modal
  const openEditEntryModal = (entry) => {
    setEditingEntry(entry);
    setEntryTitle(entry.title || '');
    setEntryContent(entry.content);
    setEntryTags(entry.tags ? entry.tags.join(', ') : '');
    setShowAddEntryModal(true);
  };

  // Close Add/Edit Modal
  const closeAddEntryModal = () => {
    setShowAddEntryModal(false);
    setEditingEntry(null);
    setEntryTitle('');
    setEntryContent('');
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
      if (editingEntry.source === 'fieldNotes') {
        updatedFieldNotes = updatedFieldNotes.map(note =>
          note.id === editingEntry.id
            ? {
                ...note,
                title: entryTitle.trim(),
                text: entryContent.trim(),
                tags: parsedTags,
                lastEdited: now
              }
            : note
        );
      } else {
        updatedQuickJournal = updatedQuickJournal.map(entry =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                title: entryTitle.trim(),
                text: entryContent.trim(),
                tags: parsedTags,
                lastEdited: now
              }
            : entry
        );
      }
      showNotification('✏️ Entry updated!', 'success');
    } else {
      // ADD NEW ENTRY
      const newEntry = {
        id: Date.now(),
        title: entryTitle.trim(),
        text: entryContent.trim(),
        tags: parsedTags,
        timestamp: now,
        createdAt: new Date().toLocaleString()
      };
      
      updatedFieldNotes = [newEntry, ...updatedFieldNotes];
      
      // 🎮 GAMIFICATION: Award XP for milestones!
      const noteCount = updatedFieldNotes.length;
      if (awardXp && setXpRefreshTrigger) {
        try {
          if (noteCount === 1) {
            await awardXp(db, userId, 10);
            showNotification('📝 First entry! +10 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 5) {
            await awardXp(db, userId, 15);
            showNotification('🎯 5 entries milestone! +15 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 10) {
            await awardXp(db, userId, 25);
            showNotification('📚 10 entries milestone! +25 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 25) {
            await awardXp(db, userId, 50);
            showNotification('🏆 25 entries milestone! +50 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else {
            showNotification('📝 Entry saved!', 'success');
          }
        } catch (error) {
          console.warn('XP award failed (journal entry)', error);
          showNotification('📝 Entry saved!', 'success');
        }
      } else {
        showNotification('📝 Entry saved!', 'success');
      }
    }
    
    // Save to Firebase
    const updatedData = {
      ...data,
      fieldNotes: updatedFieldNotes,
      quickJournalEntries: updatedQuickJournal
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      closeAddEntryModal();
    } catch (error) {
      console.error('Error saving entry:', error);
      showNotification('Failed to save entry', 'error');
    }
  };

  // Delete Entry
  const deleteEntry = async (entry) => {
    if (!userId || !window.confirm('Delete this entry? This cannot be undone.')) return;
    
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
      showNotification('🗑️ Entry deleted', 'success');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showNotification('Failed to delete entry', 'error');
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
  const entriesWithTags = entries.filter(e => e.tags && e.tags.length > 0).length;

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

      {/* Header with Add New Entry Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Logbook</h2>
          <p className="text-gray-400 text-sm">Your unified journal feed</p>
        </div>
        <button
          onClick={openAddEntryModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New Entry
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by tag:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {(searchQuery || selectedTags.length > 0) && (
          <div className="text-sm text-gray-400">
            Showing {filteredEntries.length} of {totalEntries} entries
          </div>
        )}
      </div>

      {/* Entries Feed */}
      {filteredEntries.length === 0 ? (
        <div className="bg-gray-800/30 rounded-lg p-12 border border-gray-700/50 text-center">
          {entries.length === 0 ? (
            <>
              <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Entries Yet</h3>
              <p className="text-gray-500 mb-4">
                Start your journal by adding your first entry!
              </p>
              <button
                onClick={openAddEntryModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Entry
              </button>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Matches Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearAllFilters}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear all filters
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
                className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-blue-500/30 transition-all"
              >
                {/* Card Header (Always Visible) */}
                <div
                  onClick={() => showReadMore && toggleEntry(entry.id)}
                  className={`p-4 ${showReadMore ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title (if exists) */}
                      {hasTitle && (
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {entry.title}
                        </h3>
                      )}
                      
                      {/* Content Preview */}
                      <p className="text-gray-300 leading-relaxed mb-2">
                        {isExpanded ? entry.content : excerpt}
                      </p>
                      
                      {/* Read More Toggle */}
                      {showReadMore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEntry(entry.id);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
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
                  
                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Footer: Date & Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.createdAt)}
                      {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                        <span className="ml-2">(edited)</span>
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
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEntryModal(entry);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry);
                        }}
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded transition-colors"
                        title="Delete entry"
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

      {/* Interactive Stats Footer */}
      {entries.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{totalEntries}</div>
              <div className="text-gray-400 text-sm">Total Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalTags}</div>
              <div className="text-gray-400 text-sm">Unique Tags</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{entriesWithTags}</div>
              <div className="text-gray-400 text-sm">Tagged Entries</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blue-500/30 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingEntry ? 'Edit Entry' : 'Add New Entry'}
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
                  Title <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Give your entry a title..."
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                />
              </div>

              {/* Content (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="What's on your mind? Ideas, reflections, goals, insights..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[200px] resize-none"
                  rows="8"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags <span className="text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="work, motivation, travel, goals..."
                  value={entryTags}
                  onChange={(e) => handleTagInput(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                
                {/* Tag Suggestions */}
                {tagSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">Suggestions:</span>
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => applyTagSuggestion(tag)}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Tag Help Text */}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Pro tip: Use tags to organize entries (e.g., "work", "personal", "goals", "travel")
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={closeAddEntryModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!entryContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingEntry ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
