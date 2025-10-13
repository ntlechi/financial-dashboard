// 🛠️ QUICK EXPENSE MODAL - Fixed version that prevents all modal bugs
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FixedModal, { FixedInput, FixedButton } from './FixedModal';

const QuickExpenseModal = ({ isOpen, onClose, onSave }) => {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSave = () => {
    if (!expense.description || !expense.amount) {
      return;
    }

    onSave({
      ...expense,
      amount: parseFloat(expense.amount),
      category: 'personal',
      subcategory: 'other',
    });

    // Reset form
    setExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form
    setExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <FixedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Quick Expense"
      description="Log a quick expense to your personal cash expenses"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            What did you spend on?
          </label>
          <FixedInput
            type="text"
            placeholder="e.g., Coffee, Lunch, Gas, Groceries..."
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            autoFocus
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Amount</label>
            <FixedInput
              type="number"
              placeholder="0.00"
              step="0.01"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Date</label>
            <FixedInput
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-red-900/20 rounded-lg p-3 border border-red-600/30">
          <div className="text-xs text-red-200">
            💡 <strong>Quick Tip:</strong> This logs to your personal cash expenses. 
            For business expenses or other categories, use the full Transaction tab.
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
          disabled={!expense.description || !expense.amount}
          variant="danger"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default QuickExpenseModal;

