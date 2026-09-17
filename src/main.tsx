import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ScheduleProvider } from './context/ScheduleContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ScheduleProvider>
      <App />
    </ScheduleProvider>
  </React.StrictMode>
);

// Register PWA Service Worker for offline car-line caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PWA Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('PWA Service Worker registration failed:', error);
      });
  });
}
