// 📶 Offline Storage Manager
// Handles data storage and sync when internet is unavailable

class OfflineStorageManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = [];
    this.localStorageKey = 'survive-backpacking-offline-data';
    this.pendingKey = 'survive-backpacking-pending-operations';
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
      this.notifyOnlineStatus(true);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });
  }

  // Check if we're currently online
  checkOnlineStatus() {
    return navigator.onLine;
  }

  // Save data locally (works offline)
  saveDataLocally(data) {
    try {
      const dataWithTimestamp = {
        ...data,
        lastSaved: new Date().toISOString(),
        savedOffline: !this.isOnline
      };
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(dataWithTimestamp));
      console.log('📱 Data saved locally:', this.isOnline ? 'online' : 'offline');
      return true;
    } catch (error) {
      console.error('❌ Failed to save data locally:', error);
      return false;
    }
  }

  // Load data from local storage
  getLocalData() {
    try {
      const localData = localStorage.getItem(this.localStorageKey);
      return localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error('❌ Failed to load local data:', error);
      return null;
    }
  }

  // Add operation to pending queue (for when back online)
  addPendingOperation(operation) {
    const pendingOp = {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString(),
      type: operation.type || 'update'
    };

    this.pendingOperations.push(pendingOp);
    this.savePendingOperations();
    
    console.log('📝 Added pending operation:', pendingOp.type);
  }

  // Save pending operations to localStorage
  savePendingOperations() {
    try {
      localStorage.setItem(this.pendingKey, JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('❌ Failed to save pending operations:', error);
    }
  }

  // Load pending operations from localStorage
  loadPendingOperations() {
    try {
      const pending = localStorage.getItem(this.pendingKey);
      this.pendingOperations = pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('❌ Failed to load pending operations:', error);
      this.pendingOperations = [];
    }
  }

  // Sync all pending operations when back online
  async syncPendingOperations() {
    if (!this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    console.log(`📡 Syncing ${this.pendingOperations.length} pending operations...`);

    const successfulSyncs = [];
    const failedSyncs = [];

    for (const operation of this.pendingOperations) {
      try {
        // Here you would call your Firebase sync function
        await this.syncSingleOperation(operation);
        successfulSyncs.push(operation);
        console.log('✅ Synced operation:', operation.type);
      } catch (error) {
        console.error('❌ Failed to sync operation:', operation.type, error);
        failedSyncs.push(operation);
      }
    }

    // Remove successful operations from pending list
    this.pendingOperations = failedSyncs;
    this.savePendingOperations();

    // Notify user of sync results
    if (successfulSyncs.length > 0) {
      this.notifyUser(`✅ Synced ${successfulSyncs.length} offline changes`);
    }
    if (failedSyncs.length > 0) {
      this.notifyUser(`⚠️ ${failedSyncs.length} changes failed to sync`);
    }
  }

  // Sync a single operation (placeholder for Firebase integration)
  async syncSingleOperation(operation) {
    // This will be integrated with your Firebase functions
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(operation);
        } else {
          reject(new Error('Sync failed'));
        }
      }, 100);
    });
  }

  // Get offline status info for UI
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.pendingOperations.length,
      lastSaved: this.getLocalData()?.lastSaved || null,
      hasLocalData: !!this.getLocalData()
    };
  }

  // Clear all offline data (for reset/logout)
  clearOfflineData() {
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.pendingKey);
    this.pendingOperations = [];
    console.log('🗑️ Cleared all offline data');
  }

  // Notify user of online/offline status
  notifyOnlineStatus(isOnline) {
    const status = isOnline ? 'online' : 'offline';
    console.log(`📶 Status: ${status}`);
    
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('offlineStatusChange', {
      detail: { isOnline, pendingOperations: this.pendingOperations.length }
    }));
  }

  // Show notification to user
  notifyUser(message) {
    console.log('📢 User notification:', message);
    
    // Dispatch notification event
    window.dispatchEvent(new CustomEvent('offlineNotification', {
      detail: { message }
    }));
  }

  // Export data for backup/transfer
  exportOfflineData() {
    const localData = this.getLocalData();
    const pendingOps = this.pendingOperations;
    
    return {
      userData: localData,
      pendingOperations: pendingOps,
      exportDate: new Date().toISOString(),
      isOnline: this.isOnline
    };
  }

  // Import data from backup
  importOfflineData(exportedData) {
    try {
      if (exportedData.userData) {
        this.saveDataLocally(exportedData.userData);
      }
      
      if (exportedData.pendingOperations) {
        this.pendingOperations = exportedData.pendingOperations;
        this.savePendingOperations();
      }
      
      console.log('📥 Imported offline data successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import offline data:', error);
      return false;
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorageManager();

// Load any existing pending operations on startup
offlineStorage.loadPendingOperations();

export default offlineStorage;