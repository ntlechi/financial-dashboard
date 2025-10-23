// 🧳 OFFLINE UTILITIES - Perfect for travelers and digital nomads
// This file handles offline functionality for the Freedom Compass app

// 🎯 Offline Storage Keys
const OFFLINE_KEYS = {
  TRANSACTIONS: 'freedom_compass_offline_transactions',
  EXPENSES: 'freedom_compass_offline_expenses',
  JOURNAL: 'freedom_compass_offline_journal',
  USER_DATA: 'freedom_compass_offline_user_data',
  PENDING_SYNC: 'freedom_compass_pending_sync'
};

// 🎯 Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// 🎯 Get offline status
export const getOfflineStatus = () => {
  return {
    isOnline: isOnline(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
};

// 🎯 Store data offline
export const storeOffline = (key, data) => {
  try {
    const offlineData = {
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    localStorage.setItem(key, JSON.stringify(offlineData));
    console.log(`🧳 Offline: Stored ${key}`, data);
    return true;
  } catch (error) {
    console.error('🧳 Offline storage error:', error);
    return false;
  }
};

// 🎯 Retrieve offline data
export const getOffline = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.data;
    }
    return null;
  } catch (error) {
    console.error('🧳 Offline retrieval error:', error);
    return null;
  }
};

// 🎯 Store transaction offline
export const storeTransactionOffline = (transaction) => {
  const offlineTransactions = getOffline(OFFLINE_KEYS.TRANSACTIONS) || [];
  const newTransaction = {
    ...transaction,
    id: transaction.id || `offline_${Date.now()}`,
    offline: true,
    pendingSync: true,
    createdAt: new Date().toISOString()
  };
  
  offlineTransactions.push(newTransaction);
  storeOffline(OFFLINE_KEYS.TRANSACTIONS, offlineTransactions);
  
  // Also store in pending sync
  const pendingSync = getOffline(OFFLINE_KEYS.PENDING_SYNC) || [];
  pendingSync.push({
    type: 'transaction',
    data: newTransaction,
    timestamp: new Date().toISOString()
  });
  storeOffline(OFFLINE_KEYS.PENDING_SYNC, pendingSync);
  
  return newTransaction;
};

// 🎯 Store expense offline
export const storeExpenseOffline = (expense) => {
  const offlineExpenses = getOffline(OFFLINE_KEYS.EXPENSES) || [];
  const newExpense = {
    ...expense,
    id: expense.id || `offline_expense_${Date.now()}`,
    offline: true,
    pendingSync: true,
    createdAt: new Date().toISOString()
  };
  
  offlineExpenses.push(newExpense);
  storeOffline(OFFLINE_KEYS.EXPENSES, offlineExpenses);
  
  // Also store in pending sync
  const pendingSync = getOffline(OFFLINE_KEYS.PENDING_SYNC) || [];
  pendingSync.push({
    type: 'expense',
    data: newExpense,
    timestamp: new Date().toISOString()
  });
  storeOffline(OFFLINE_KEYS.PENDING_SYNC, pendingSync);
  
  return newExpense;
};

// 🎯 Store journal entry offline
export const storeJournalOffline = (journalEntry) => {
  const offlineJournal = getOffline(OFFLINE_KEYS.JOURNAL) || [];
  const newEntry = {
    ...journalEntry,
    id: journalEntry.id || `offline_journal_${Date.now()}`,
    offline: true,
    pendingSync: true,
    createdAt: new Date().toISOString()
  };
  
  offlineJournal.push(newEntry);
  storeOffline(OFFLINE_KEYS.JOURNAL, offlineJournal);
  
  // Also store in pending sync
  const pendingSync = getOffline(OFFLINE_KEYS.PENDING_SYNC) || [];
  pendingSync.push({
    type: 'journal',
    data: newEntry,
    timestamp: new Date().toISOString()
  });
  storeOffline(OFFLINE_KEYS.PENDING_SYNC, pendingSync);
  
  return newEntry;
};

// 🎯 Get offline transactions
export const getOfflineTransactions = () => {
  return getOffline(OFFLINE_KEYS.TRANSACTIONS) || [];
};

// 🎯 Get offline expenses
export const getOfflineExpenses = () => {
  return getOffline(OFFLINE_KEYS.EXPENSES) || [];
};

// 🎯 Get offline journal entries
export const getOfflineJournal = () => {
  return getOffline(OFFLINE_KEYS.JOURNAL) || [];
};

// 🎯 Get pending sync items
export const getPendingSync = () => {
  return getOffline(OFFLINE_KEYS.PENDING_SYNC) || [];
};

// 🎯 Clear pending sync (after successful sync)
export const clearPendingSync = () => {
  localStorage.removeItem(OFFLINE_KEYS.PENDING_SYNC);
  console.log('🧳 Offline: Cleared pending sync items');
};

// 🎯 Mark item as synced
export const markAsSynced = (itemId, type) => {
  const pendingSync = getPendingSync();
  const updatedSync = pendingSync.filter(item => 
    !(item.data.id === itemId && item.type === type)
  );
  storeOffline(OFFLINE_KEYS.PENDING_SYNC, updatedSync);
  
  // Also update the specific offline storage
  if (type === 'transaction') {
    const transactions = getOfflineTransactions();
    const updatedTransactions = transactions.map(t => 
      t.id === itemId ? { ...t, synced: true, pendingSync: false } : t
    );
    storeOffline(OFFLINE_KEYS.TRANSACTIONS, updatedTransactions);
  } else if (type === 'expense') {
    const expenses = getOfflineExpenses();
    const updatedExpenses = expenses.map(e => 
      e.id === itemId ? { ...e, synced: true, pendingSync: false } : e
    );
    storeOffline(OFFLINE_KEYS.EXPENSES, updatedExpenses);
  } else if (type === 'journal') {
    const journal = getOfflineJournal();
    const updatedJournal = journal.map(j => 
      j.id === itemId ? { ...j, synced: true, pendingSync: false } : j
    );
    storeOffline(OFFLINE_KEYS.JOURNAL, updatedJournal);
  }
};

// 🎯 Get offline storage size
export const getOfflineStorageSize = () => {
  let totalSize = 0;
  Object.values(OFFLINE_KEYS).forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      totalSize += new Blob([data]).size;
    }
  });
  return totalSize;
};

// 🎯 Clear all offline data
export const clearAllOfflineData = () => {
  Object.values(OFFLINE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🧳 Offline: Cleared all offline data');
};

// 🎯 Get offline status summary
export const getOfflineSummary = () => {
  const transactions = getOfflineTransactions();
  const expenses = getOfflineExpenses();
  const journal = getOfflineJournal();
  const pendingSync = getPendingSync();
  
  return {
    isOnline: isOnline(),
    offlineTransactions: transactions.length,
    offlineExpenses: expenses.length,
    offlineJournal: journal.length,
    pendingSync: pendingSync.length,
    storageSize: getOfflineStorageSize(),
    lastUpdated: new Date().toISOString()
  };
};

// 🎯 Check if offline data exists
export const hasOfflineData = () => {
  const summary = getOfflineSummary();
  return summary.offlineTransactions > 0 || 
         summary.offlineExpenses > 0 || 
         summary.offlineJournal > 0;
};

// 🎯 Export all utilities
const offlineUtilsModule = {
  isOnline,
  getOfflineStatus,
  storeOffline,
  getOffline,
  storeTransactionOffline,
  storeExpenseOffline,
  storeJournalOffline,
  getOfflineTransactions,
  getOfflineExpenses,
  getOfflineJournal,
  getPendingSync,
  clearPendingSync,
  markAsSynced,
  getOfflineStorageSize,
  clearAllOfflineData,
  getOfflineSummary,
  hasOfflineData
};

export default offlineUtilsModule;

