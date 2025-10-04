import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import offlineStorage from '../utils/offlineStorage';

const OfflineStatus = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    pendingOperations: 0,
    lastSaved: null,
    hasLocalData: false
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Update status on mount
    setStatus(offlineStorage.getOfflineStatus());

    // Listen for online/offline changes
    const handleStatusChange = (event) => {
      setStatus(offlineStorage.getOfflineStatus());
    };

    // Listen for notifications
    const handleNotification = (event) => {
      setNotification(event.detail.message);
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener('offlineStatusChange', handleStatusChange);
    window.addEventListener('offlineNotification', handleNotification);

    return () => {
      window.removeEventListener('offlineStatusChange', handleStatusChange);
      window.removeEventListener('offlineNotification', handleNotification);
    };
  }, []);

  const getStatusColor = () => {
    if (status.isOnline) {
      return status.pendingOperations > 0 ? 'text-yellow-500' : 'text-green-500';
    }
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (status.isOnline) {
      return status.pendingOperations > 0 ? 
        <RefreshCw className="w-4 h-4 animate-spin" /> : 
        <Wifi className="w-4 h-4" />;
    }
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (status.isOnline) {
      if (status.pendingOperations > 0) {
        return `Syncing ${status.pendingOperations} changes...`;
      }
      return 'Online & Synced';
    }
    return 'Offline Mode';
  };

  const getStorageInfo = () => {
    if (status.lastSaved) {
      const lastSaved = new Date(status.lastSaved);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSaved) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'Saved just now';
      } else if (diffMinutes < 60) {
        return `Saved ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Saved ${diffHours}h ago`;
      }
    }
    return 'No local data';
  };

  return (
    <>
      {/* Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${status.isOnline ? 'bg-gray-800' : 'bg-orange-600'} text-white text-xs py-1 px-4 flex items-center justify-between transition-all duration-300`}>
        <div className="flex items-center gap-2">
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          <span>{getStatusText()}</span>
          {!status.isOnline && (
            <span className="text-orange-200">• {getStorageInfo()}</span>
          )}
        </div>
        
        {!status.isOnline && (
          <div className="flex items-center gap-1 text-orange-200">
            <CloudOff className="w-3 h-3" />
            <span>Changes saved locally</span>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-12 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <Cloud className="w-4 h-4" />
          <span className="text-sm">{notification}</span>
        </div>
      )}

      {/* Offline Banner (when offline) */}
      {!status.isOnline && (
        <div className="fixed top-8 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">You're in Offline Mode</div>
              <div className="text-sm opacity-90">
                Perfect for travel! All changes are saved locally and will sync when you're back online.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default OfflineStatus;