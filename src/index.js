import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import startMojibakeSanitizer from './utils/mojibakeSanitizer';

// 🧳 Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🧳 Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('🧳 Service Worker registration failed:', error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
// Start runtime sanitizer early to clean visible UI (navs, banners, tabs)
startMojibakeSanitizer();
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);