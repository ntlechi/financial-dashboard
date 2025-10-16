// 🛠️ QUICK JOURNAL MODAL - Feeds into unified My Logbook system
// 🎯 REDESIGNED: Simplified for "Capture Now, Organize Later" workflow
import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import FixedModal, { FixedTextarea, FixedButton } from './FixedModal';

const QuickJournalModal = ({ isOpen, onClose, onSave }) => {
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!note.trim()) {
      return;
    }

    onSave(note.trim());

    // Reset form
    setNote('');
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setNote('');
    onClose();
  };

  return (
    <FixedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Quick Journal"
      description="Capture your thoughts instantly!"
      size="md"
      headerClassName="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-b border-amber-700/30"
    >
      <div className="space-y-4 bg-gradient-to-br from-amber-900/10 to-yellow-900/10 rounded-lg p-4 border border-amber-500/20">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            What's on your mind?
          </label>
          <FixedTextarea
            placeholder="Ideas, reflections, goals, insights..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>

        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600/30">
          <div className="text-xs text-blue-200">
            💡 <strong>Capture Now, Organize Later:</strong> Your note will appear in My Logbook where you can add a title, tags, and edit it anytime!
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <FixedButton
          onClick={handleClose}
          variant="secondary"
        >
          Cancel
        </FixedButton>
        <FixedButton
          onClick={handleSave}
          disabled={!note.trim()}
          variant="primary"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Save Note
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default QuickJournalModal;

