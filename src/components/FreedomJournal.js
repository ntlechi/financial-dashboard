import React, { useState, useEffect } from 'react';
import { BookOpen, Save, X, RotateCcw } from 'lucide-react';

export default function FreedomJournal({ trip, onSaveEntry, onClose }) {
  const [journalText, setJournalText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Rotating prompts for journal entries
  const journalPrompts = [
    "What did this adventure teach you?",
    "What was your favorite moment?",
    "What did you leave behind on this climb?",
    "How did this trip bring you closer to freedom?",
    "What surprised you most about this journey?",
    "How has this experience changed your perspective?",
    "What would you do differently next time?",
    "What memories will you treasure most?"
  ];

  // Initialize with random prompt
  useEffect(() => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setCurrentPrompt(randomPrompt);
  }, []);


  // Rotate to next prompt
  const rotatePrompt = () => {
    const currentIndex = journalPrompts.indexOf(currentPrompt);
    const nextIndex = (currentIndex + 1) % journalPrompts.length;
    setCurrentPrompt(journalPrompts[nextIndex]);
  };

  // Save journal entry
  const handleSaveEntry = async () => {
    if (!journalText.trim()) return;

    setIsSaving(true);
    
    try {
      const entry = {
        entryID: Date.now().toString(),
        timestamp: new Date().toISOString(),
        text: journalText.trim(),
        prompt: currentPrompt
      };

      await onSaveEntry(entry);
      
      // Reset form
      setJournalText('');
      
      // Rotate to next prompt
      rotatePrompt();
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-500/30 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          📓 Freedom Journal
        </h3>
        <button
          onClick={onClose}
          className="text-amber-300 hover:text-amber-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Rotating Prompt */}
      <div className="bg-amber-800/20 rounded-lg p-3 mb-4 border border-amber-600/30">
        <div className="flex items-center justify-between">
          <p className="text-amber-200 text-sm font-medium">{currentPrompt}</p>
          <button
            onClick={rotatePrompt}
            className="text-amber-300 hover:text-amber-200 transition-colors"
            title="Get a new prompt"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Journal Text Input */}
      <textarea
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        placeholder="Share your thoughts about this adventure..."
        className="w-full bg-gray-800/50 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none resize-none"
        rows="6"
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEntry}
          disabled={!journalText.trim() || isSaving}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}


