// 🛠️ QUICK JOURNAL MODAL - Feeds into unified My Logbook system
// 🎯 REDESIGNED: Simplified for "Capture Now, Organize Later" workflow
import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FixedModal, { FixedTextarea, FixedButton } from './FixedModal';

const QuickJournalModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
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
      title={t('quickActions.quickJournal')}
      description={t('quickActions.quickJournalDescription')}
      size="md"
      headerClassName="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-blue-700/30"
    >
      <div className="space-y-4 bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-lg p-4 border border-blue-500/20">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            {t('quickActions.whatsOnYourMind')}
          </label>
          <FixedTextarea
            placeholder={t('quickActions.journalPlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>

        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600/30">
          <div className="text-xs text-blue-200">
            💡 <strong>{t('quickActions.captureNowOrganizeLater')}</strong> {t('quickActions.journalTip')}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <FixedButton
          onClick={handleClose}
          variant="secondary"
        >
          {t('common.cancel')}
        </FixedButton>
        <FixedButton
          onClick={handleSave}
          disabled={!note.trim()}
          variant="primary"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {t('quickActions.saveNote')}
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default QuickJournalModal;

