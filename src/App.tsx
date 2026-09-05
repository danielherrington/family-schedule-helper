import React from 'react';
import { useSchedule } from './context/ScheduleContext';
import { Header } from './components/Header';
import { WeekStripNavigator } from './components/WeekStripNavigator';
import { GapAlertBanner } from './components/GapAlertBanner';
import { HolidaySuggestionBanner } from './components/HolidaySuggestionBanner';
import { VisualWeeklyCalendarGrid } from './components/VisualWeeklyCalendarGrid';
import { DailyDispatchBoard } from './components/DailyDispatchBoard';
import { WeeklyMatrixView } from './components/WeeklyMatrixView';
import { QuickAssignModal } from './components/QuickAssignModal';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SetupHubModal } from './components/SetupHubModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { viewMode, isLoading, toasts, removeToast } = useSchedule();

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        <GapAlertBanner />
        <HolidaySuggestionBanner />
        <WeekStripNavigator />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Loading Family Logistics Dispatch...
            </div>
            <div>Syncing caregiver calendars & recurrence rules...</div>
          </div>
        ) : viewMode === 'calendar' ? (
          <VisualWeeklyCalendarGrid />
        ) : viewMode === 'daily' ? (
          <DailyDispatchBoard />
        ) : (
          <WeeklyMatrixView />
        )}
      </main>

      {/* Modals */}
      <SetupHubModal />
      <QuickAssignModal />
      <CalendarSettingsModal />
      <AuditLogModal />

      {/* Toast System */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="toast"
            onClick={() => removeToast(toast.id)}
            style={{
              cursor: 'pointer',
              borderColor: toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--border)'
            }}
          >
            {toast.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="var(--warning)" />}
            {toast.type === 'info' && <Info size={18} color="var(--accent)" />}
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
