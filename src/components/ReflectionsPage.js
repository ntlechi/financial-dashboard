import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Calendar, MapPin, Eye, EyeOff, Plus, Edit3, Trash2, Save, X, Copy } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ReflectionsPage({ data, userPlan, onExportPDF, onUpdateData, userId, checkFeatureAccess, showUpgradePromptForFeature, awardXp, setXpRefreshTrigger }) {
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [allJournalEntries, setAllJournalEntries] = useState([]);
  
  // Quick Notes State
  const [quickNotes, setQuickNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [notification, setNotification] = useState(null);

  // Collect all journal entries from all trips and quick notes
  useEffect(() => {
    const entries = [];
    const trips = data?.travel?.trips || [];
    
    // Add trip journal entries
    trips.forEach(trip => {
      if (trip.journalEntries && trip.journalEntries.length > 0) {
        trip.journalEntries.forEach(entry => {
          entries.push({
            ...entry,
            tripName: trip.name,
            tripId: trip.id,
            tripCountries: trip.countries || [],
            entryType: 'trip-journal'
          });
        });
      }
    });

    // Add quick journal entries
    if (data?.quickJournalEntries && data.quickJournalEntries.length > 0) {
      data.quickJournalEntries.forEach(entry => {
        entries.push({
          ...entry,
          tripName: 'Quick Notes',
          tripId: 'quick-notes',
          tripCountries: [],
          entryType: 'quick-note'
        });
      });
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllJournalEntries(entries);
    
    // Load persisted field notes
    if (data?.fieldNotes) {
      setQuickNotes(data.fieldNotes);
    }
  }, [data]);

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

  // Toggle note expansion
  const toggleNote = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get excerpt of text
  const getExcerpt = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('📋 Copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  };

  // Quick Notes Handlers
  const addQuickNote = async () => {
    if (!newNote.trim() || !userId) return;
    
    const note = {
      id: Date.now(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleString()
    };
    
    const updatedNotes = [note, ...(data.fieldNotes || [])];
    
    // Save to Firebase
    const updatedData = {
      ...data,
      fieldNotes: updatedNotes
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      setQuickNotes(updatedNotes);
      
      // 🎮 GAMIFICATION: Award XP for Field Notes milestones!
      const noteCount = updatedNotes.length;
      if (awardXp && setXpRefreshTrigger) {
        try {
          if (noteCount === 1) {
            await awardXp(db, userId, 10);
            showNotification('📝 First note! +10 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 5) {
            await awardXp(db, userId, 15);
            showNotification('🎯 5 notes milestone! +15 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 10) {
            await awardXp(db, userId, 25);
            showNotification('📚 10 notes milestone! +25 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else if (noteCount === 25) {
            await awardXp(db, userId, 50);
            showNotification('🏆 25 notes milestone! +50 XP', 'success');
            setXpRefreshTrigger(prev => prev + 1);
          } else {
            showNotification('📝 Note saved!', 'success');
          }
        } catch (error) {
          console.warn('XP award failed (field note)', error);
          showNotification('📝 Note saved!', 'success');
        }
      } else {
        showNotification('📝 Note saved!', 'success');
      }
      
      setNewNote('');
      setShowAddNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
      showNotification('Failed to save note', 'error');
    }
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const saveEditedNote = async () => {
    if (!editingText.trim() || !userId) return;
    
    const updatedNotes = (data.fieldNotes || []).map(note => 
      note.id === editingNoteId 
        ? { ...note, text: editingText.trim(), lastEdited: new Date().toLocaleString() }
        : note
    );
    
    const updatedData = {
      ...data,
      fieldNotes: updatedNotes
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      setEditingNoteId(null);
      setEditingText('');
      showNotification('✏️ Note updated!', 'success');
    } catch (error) {
      console.error('Error updating note:', error);
      showNotification('Failed to update note', 'error');
    }
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const deleteNote = async (noteId) => {
    if (!userId || !window.confirm('Delete this note?')) return;
    
    const updatedNotes = (data.fieldNotes || []).filter(note => note.id !== noteId);
    const updatedData = {
      ...data,
      fieldNotes: updatedNotes
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      showNotification('🗑️ Note deleted', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Failed to delete note', 'error');
    }
  };

  // Quick Journal Entry Handlers (for editing/deleting in Reflections)
  const handleEditQuickNote = async (noteId, newText) => {
    if (!newText.trim() || !userId) return;
    
    const updatedData = {
      ...data,
      quickJournalEntries: data.quickJournalEntries.map(entry => 
        entry.id === noteId 
          ? { ...entry, text: newText.trim(), lastEdited: new Date().toLocaleString() }
          : entry
      )
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      console.log('Quick note edited successfully');
    } catch (error) {
      console.error('Error editing quick note:', error);
    }
  };

  const handleDeleteQuickNote = async (noteId) => {
    if (!userId) return;
    
    const updatedData = {
      ...data,
      quickJournalEntries: data.quickJournalEntries.filter(entry => entry.id !== noteId)
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      onUpdateData(updatedData);
      console.log('Quick note deleted successfully');
    } catch (error) {
      console.error('Error deleting quick note:', error);
    }
  };

  // Export Field Notes to PDF
  const exportFieldNotesToPDF = () => {
    const content = [];
    
    // Add all journal entries
    allJournalEntries.forEach(entry => {
      content.push(`\n${'='.repeat(60)}\n`);
      content.push(`${entry.tripName}\n`);
      content.push(`${formatDate(entry.timestamp)}\n`);
      if (entry.tripCountries.length > 0) {
        content.push(`📍 ${entry.tripCountries.join(', ')}\n`);
      }
      if (entry.prompt) {
        content.push(`\n"${entry.prompt}"\n`);
      }
      content.push(`\n${entry.text}\n`);
    });
    
    // Add quick notes
    if (quickNotes.length > 0) {
      content.push(`\n${'='.repeat(60)}\n`);
      content.push(`QUICK NOTES & IDEAS\n`);
      content.push(`${'='.repeat(60)}\n\n`);
      quickNotes.forEach(note => {
        content.push(`📝 ${formatDate(note.timestamp)}\n`);
        content.push(`${note.text}\n\n`);
      });
    }
    
    const fullContent = `FIELD NOTES ARCHIVE\n${'='.repeat(60)}\n` + content.join('');
    
    // Create a blob and download
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Field Notes exported!', 'success');
  };

  // Check if user has Operator access
  const hasOperatorAccess = userPlan === 'OPERATOR' || userPlan === 'FOUNDER\'S_CIRCLE';

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-6 border border-slate-500/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-400" />
              📓 Field Notes Archive
            </h1>
            <p className="text-slate-300">
              Your collection of expedition memories and financial insights
            </p>
          </div>
          
          {/* Export Button - FREE users see upgrade prompt */}
          {checkFeatureAccess && checkFeatureAccess('field-notes-export') ? (
            <button
              onClick={() => exportFieldNotesToPDF()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              title="Export all field notes"
            >
              <Download className="w-5 h-5" />
              Export Notes
            </button>
          ) : (
            <button
              onClick={() => showUpgradePromptForFeature && showUpgradePromptForFeature('field-notes-export')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
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
      </div>

      {/* Quick Notes Section */}
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-6 border border-blue-500/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              Quick Notes & Ideas
            </h2>
            <p className="text-blue-300 text-sm">Jot down thoughts, ideas, and reflections</p>
          </div>
          <button
            onClick={() => setShowAddNote(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>

        {/* Add Note Form */}
        {showAddNote && (
          <div className="mb-4 p-4 bg-blue-800/20 rounded-lg border border-blue-600/30">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind? Ideas, reflections, goals..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none"
              rows="3"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNewNote('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={addQuickNote}
                disabled={!newNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {quickNotes.length === 0 ? (
          <div className="text-center py-8 text-blue-300">
            <Edit3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notes yet. Click "Add Note" to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quickNotes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30"
              >
                {editingNoteId === note.id ? (
                  // Editing Mode
                  <div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none min-h-[80px] resize-none"
                      rows="3"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                      <button
                        onClick={saveEditedNote}
                        disabled={!editingText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    {note.text.length > 150 ? (
                      <>
                        <p className="text-gray-200 leading-relaxed mb-3">
                          {expandedNotes.has(note.id) ? note.text : getExcerpt(note.text, 150)}
                        </p>
                        <button
                          onClick={() => toggleNote(note.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-3"
                        >
                          {expandedNotes.has(note.id) ? (
                            <><EyeOff className="w-4 h-4" /> Show Less</>
                          ) : (
                            <><Eye className="w-4 h-4" /> Read More</>
                          )}
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-200 leading-relaxed mb-3">{note.text}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {note.lastEdited ? `Edited ${note.lastEdited}` : `Created ${note.createdAt}`}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(note.text)}
                          className="text-green-400 hover:text-green-300 p-1 hover:bg-green-900/20 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditingNote(note)}
                          className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Note Editing Modal */}
      {editingNoteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-blue-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Edit Quick Note</h3>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none min-h-[120px] resize-none"
              rows="4"
              autoFocus
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelEditing}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleEditQuickNote(editingNoteId, editingText);
                  cancelEditing();
                }}
                disabled={!editingText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      {allJournalEntries.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-8 border border-slate-500/40 text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Field Notes Yet</h3>
          <p className="text-slate-400 mb-4">
            Start documenting your expedition memories and financial insights!
          </p>
          <p className="text-sm text-slate-500">
            Go to the Travel page and add your first Freedom Journal entry!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allJournalEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.entryID);
            const excerpt = getExcerpt(entry.text);
            
            return (
              <div
                key={entry.entryID}
                className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-500/40 overflow-hidden"
              >
                {/* Entry Header */}
                <div className="p-4 border-b border-slate-600/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {entry.tripName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.timestamp)}
                        </div>
                        {entry.tripCountries.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {entry.tripCountries.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEntry(entry.entryID)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Entry Content */}
                <div className="p-4">
                  {entry.prompt && (
                    <div className="bg-amber-900/20 rounded-lg p-3 mb-3 border border-amber-600/30">
                      <p className="text-amber-200 text-sm font-medium italic">
                        "{entry.prompt}"
                      </p>
                    </div>
                  )}
                  
                  <p className="text-slate-300 leading-relaxed">
                    {isExpanded ? entry.text : excerpt}
                  </p>
                  
                  {!isExpanded && entry.text.length > 150 && (
                    <button
                      onClick={() => toggleEntry(entry.entryID)}
                      className="text-amber-400 hover:text-amber-300 text-sm mt-2 transition-colors"
                    >
                      Read more...
                    </button>
                  )}
                  
                  {/* Photo */}
                  {entry.photoURL && (
                    <div className="mt-4">
                      <img
                        src={entry.photoURL}
                        alt="Journal entry photo"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600/30"
                      />
                    </div>
                  )}

                  {/* Edit/Delete buttons for quick notes */}
                  {entry.entryType === 'quick-note' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingNoteId(entry.id);
                          setEditingText(entry.text);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit note"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuickNote(entry.id)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {allJournalEntries.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-4 border border-slate-500/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{allJournalEntries.length}</div>
              <div className="text-slate-400 text-sm">Total Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(allJournalEntries.map(e => e.tripId)).size}
              </div>
              <div className="text-slate-400 text-sm">Trips Documented</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {allJournalEntries.filter(e => e.photoURL).length}
              </div>
              <div className="text-slate-400 text-sm">Photos Captured</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
