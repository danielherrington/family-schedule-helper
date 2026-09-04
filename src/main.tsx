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
