// 🛡️ DATA SAFETY UTILITIES - Protecting user data like it's sacred
// This file handles all data backup, recovery, and version management

import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';

// 🎯 Data Safety Constants
const BACKUP_COLLECTION = 'backups';
const VERSION_COLLECTION = 'versions';
const MAX_BACKUPS = 10; // Keep last 10 backups
const MAX_VERSIONS = 5; // Keep last 5 versions

// 🛡️ Create automatic backup before destructive operations
export const createBackup = async (userId, data, operation = 'manual') => {
  try {
    if (!userId || !data) {
      console.warn('🛡️ Cannot create backup: missing userId or data');
      return null;
    }

    const backupId = `backup_${Date.now()}`;
    const backup = {
      ...data,
      backupId,
      backupDate: new Date().toISOString(),
      backupType: operation,
      version: '1.0',
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    await setDoc(doc(db, `users/${userId}/${BACKUP_COLLECTION}`, backupId), backup);
    console.log(`🛡️ Backup created: ${backupId} for operation: ${operation}`);
    return backupId;
  } catch (error) {
    console.error('🛡️ Backup creation failed:', error);
    return null;
  }
};

// 🛡️ Get all backups for a user
export const getUserBackups = async (userId) => {
  try {
    if (!userId) return [];

    const backupsRef = collection(db, `users/${userId}/${BACKUP_COLLECTION}`);
    const q = query(backupsRef, orderBy('backupDate', 'desc'), limit(MAX_BACKUPS));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('🛡️ Failed to get user backups:', error);
    return [];
  }
};

// 🛡️ Restore data from backup
export const restoreFromBackup = async (userId, backupId) => {
  try {
    if (!userId || !backupId) {
      console.warn('🛡️ Cannot restore: missing userId or backupId');
      return false;
    }

    const backupDoc = await getDoc(doc(db, `users/${userId}/${BACKUP_COLLECTION}`, backupId));
    if (!backupDoc.exists()) {
      console.warn('🛡️ Backup not found:', backupId);
      return false;
    }

    const backupData = backupDoc.data();
    const { backupId: _, backupDate, backupType, version, userAgent, timestamp, ...restoredData } = backupData;

    // 🛡️ CRITICAL FIX: Backup CURRENT data before restoring (not the backup data!)
    try {
      const currentDataDoc = await getDoc(doc(db, `users/${userId}/financials`, 'data'));
      if (currentDataDoc.exists()) {
        const currentData = currentDataDoc.data();
        await createBackup(userId, currentData, 'pre-restore');
        console.log('🛡️ Current data backed up before restore');
      }
    } catch (backupError) {
      console.error('🛡️ Failed to backup current data:', backupError);
      // Continue with restore even if backup fails (user explicitly wants to restore)
    }

    // Restore the data
    await setDoc(doc(db, `users/${userId}/financials`, 'data'), restoredData);
    console.log(`🛡️ Data restored from backup: ${backupId}`);
    return true;
  } catch (error) {
    console.error('🛡️ Restore failed:', error);
    return false;
  }
};

// 🛡️ Save version history
export const saveVersion = async (userId, data, changeType = 'update') => {
  try {
    if (!userId || !data) return null;

    const versionId = `v_${Date.now()}`;
    const version = {
      ...data,
      versionId,
      versionDate: new Date().toISOString(),
      changeType,
      timestamp: Date.now()
    };

    await setDoc(doc(db, `users/${userId}/${VERSION_COLLECTION}`, versionId), version);
    console.log(`🛡️ Version saved: ${versionId} for change: ${changeType}`);
    return versionId;
  } catch (error) {
    console.error('🛡️ Version save failed:', error);
    return null;
  }
};

// 🛡️ Get version history
export const getVersionHistory = async (userId) => {
  try {
    if (!userId) return [];

    const versionsRef = collection(db, `users/${userId}/${VERSION_COLLECTION}`);
    const q = query(versionsRef, orderBy('versionDate', 'desc'), limit(MAX_VERSIONS));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('🛡️ Failed to get version history:', error);
    return [];
  }
};

// 🛡️ Restore from version
export const restoreFromVersion = async (userId, versionId) => {
  try {
    if (!userId || !versionId) return false;

    const versionDoc = await getDoc(doc(db, `users/${userId}/${VERSION_COLLECTION}`, versionId));
    if (!versionDoc.exists()) {
      console.warn('🛡️ Version not found:', versionId);
      return false;
    }

    const versionData = versionDoc.data();
    const { versionId: _, versionDate, changeType, timestamp, ...restoredData } = versionData;

    // Create backup before restoring
    await createBackup(userId, restoredData, 'pre-version-restore');

    // Restore the data
    await setDoc(doc(db, `users/${userId}/financials`, 'data'), restoredData);
    console.log(`🛡️ Data restored from version: ${versionId}`);
    return true;
  } catch (error) {
    console.error('🛡️ Version restore failed:', error);
    return false;
  }
};

// 🛡️ Clean up old backups (keep only recent ones)
export const cleanupOldBackups = async (userId) => {
  try {
    if (!userId) return;

    const backups = await getUserBackups(userId);
    if (backups.length <= MAX_BACKUPS) return;

    const backupsToDelete = backups.slice(MAX_BACKUPS);
    for (const backup of backupsToDelete) {
      await deleteDoc(doc(db, `users/${userId}/${BACKUP_COLLECTION}`, backup.id));
      console.log(`🛡️ Deleted old backup: ${backup.id}`);
    }
  } catch (error) {
    console.error('🛡️ Backup cleanup failed:', error);
  }
};

// 🛡️ Clean up old versions
export const cleanupOldVersions = async (userId) => {
  try {
    if (!userId) return;

    const versions = await getVersionHistory(userId);
    if (versions.length <= MAX_VERSIONS) return;

    const versionsToDelete = versions.slice(MAX_VERSIONS);
    for (const version of versionsToDelete) {
      await deleteDoc(doc(db, `users/${userId}/${VERSION_COLLECTION}`, version.id));
      console.log(`🛡️ Deleted old version: ${version.id}`);
    }
  } catch (error) {
    console.error('🛡️ Version cleanup failed:', error);
  }
};

// 🛡️ Get data safety summary
export const getDataSafetySummary = async (userId) => {
  try {
    if (!userId) return null;

    const [backups, versions] = await Promise.all([
      getUserBackups(userId),
      getVersionHistory(userId)
    ]);

    return {
      totalBackups: backups.length,
      totalVersions: versions.length,
      latestBackup: backups[0]?.backupDate || null,
      latestVersion: versions[0]?.versionDate || null,
      lastBackupType: backups[0]?.backupType || null,
      lastChangeType: versions[0]?.changeType || null
    };
  } catch (error) {
    console.error('🛡️ Failed to get data safety summary:', error);
    return null;
  }
};

// 🛡️ Export data for user download
export const exportUserData = (data) => {
  try {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      appName: 'Freedom Compass'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `freedom-compass-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('🛡️ Data exported successfully');
    return true;
  } catch (error) {
    console.error('🛡️ Data export failed:', error);
    return false;
  }
};

// 🛡️ Import data from file
export const importUserData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        console.log('🛡️ Data imported successfully');
        resolve(importedData);
      } catch (error) {
        console.error('🛡️ Data import failed:', error);
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

// 🛡️ Validate data integrity
export const validateDataIntegrity = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }

    const requiredFields = ['transactions', 'expenses', 'recentTransactions'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return { valid: false, error: `Missing required fields: ${missingFields.join(', ')}` };
    }

    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: 'Data validation failed' };
  }
};

// 🛡️ Export all utilities
export default {
  createBackup,
  getUserBackups,
  restoreFromBackup,
  saveVersion,
  getVersionHistory,
  restoreFromVersion,
  cleanupOldBackups,
  cleanupOldVersions,
  getDataSafetySummary,
  exportUserData,
  importUserData,
  validateDataIntegrity
};

