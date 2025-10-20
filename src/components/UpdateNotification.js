import React, { useEffect, useState } from 'react';

/**
 * Update Notification Component
 * Shows a prompt when a new version of the app is available
 * Allows users to refresh and get the latest version
 */
const UpdateNotification = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every 30 minutes
        const checkForUpdates = () => {
          reg.update();
        };

        checkForUpdates(); // Check immediately
        const interval = setInterval(checkForUpdates, 30 * 60 * 1000); // Every 30 min

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available!
              console.log('🎉 New version available!');
              setShowUpdatePrompt(true);
            }
          });
        });

        return () => clearInterval(interval);
      });

      // Listen for controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdatePrompt(false);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎉</div>
          <div>
            <p className="font-bold text-slate-900 text-lg">
              New Version Available!
            </p>
            <p className="text-sm text-slate-800">
              Tap "Update" to get the latest features
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-slate-800/20 text-slate-900 rounded-lg font-semibold hover:bg-slate-800/30 transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-slate-900 text-amber-400 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            Update Now ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
