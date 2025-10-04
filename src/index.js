import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import OfflineStatus from './components/OfflineStatus';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <OfflineStatus />
      <App />
    </>
  </React.StrictMode>
);