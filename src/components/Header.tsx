import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  RotateCcw, 
  AlertCircle,
  FileText,
  Users,
  Grid,
  ListTodo,
  CalendarDays,
  Bell,
  Plus
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    selectedDate, 
    viewMode, 
    setViewMode, 
    changeDateByDays, 
    currentWeekDays,
    gaps, 
    authStatus,
    connectedEmail,
    setIsSettingsOpen,
    setIsAuditLogOpen,
    setIsSetupOpen,
    setIsSundayAlertOpen,
    openAddEventModal,
    resetToDemoSchedule 
  } = useSchedule();

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeekRangeLabel = (days: Date[]) => {
    if (!days || days.length === 0) return '';
    const start = days[0];
    const end = days[days.length - 1];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Row 1: Brand + Global Family Actions */}
        <div className="header-row header-row-top">
          <div className="brand-section">
            <div className="brand-icon">
              <Calendar size={20} />
            </div>
            <div>
              <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Los Herringtons</span>
                <span className="brand-badge">🌴 Miami</span>
              </div>
              <div className="brand-subtitle">Family Logistics & Dispatch</div>
            </div>
          </div>

          <div className="header-actions">
            {/* Add Event Button */}
            <button
              className="btn btn-add-event"
              onClick={() => openAddEventModal(selectedDate)}
              title="Schedule a new pickup, drop-off, or activity event"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>

            {/* Family Setup Hub Button */}
            <button 
              className="btn"
              onClick={() => setIsSetupOpen(true)}
              title="Manage Potential Caregivers, Potential Kids, and Weekly Blueprint"
              style={{ fontWeight: 700 }}
            >
              <Users size={16} />
              <span className="hide-mobile">Family Setup</span>
            </button>

            {gaps.length > 0 && (
              <div className="gap-alert-pill">
                <AlertCircle size={14} />
                <span>{gaps.length} Gap{gaps.length === 1 ? '' : 's'}</span>
              </div>
            )}

            {/* Sunday Night Alert Trigger */}
            <button 
              className="btn" 
              onClick={() => setIsSundayAlertOpen(true)}
              title="Configure Sunday Night Schedule Reminder"
              style={{ borderColor: 'rgba(255, 94, 126, 0.4)', color: 'var(--accent)' }}
            >
              <Bell size={15} />
              <span className="hide-tablet">Sunday Alert</span>
            </button>

            {/* Audit Log Trigger */}
            <button 
              className="btn" 
              onClick={() => setIsAuditLogOpen(true)}
              title="View Single-Instance Exceptions Audit Log"
            >
              <FileText size={16} />
              <span className="hide-tablet">Audit</span>
            </button>

            {/* Settings Modal / Google Sync Status */}
            <button 
              className="btn" 
              onClick={() => setIsSettingsOpen(true)}
              title={authStatus.mode === 'live_gcal' ? `Connected to Google Calendar (${connectedEmail || 'Live'})` : "Connect Google Calendar"}
              style={{
                borderColor: authStatus.mode === 'live_gcal' ? 'var(--success)' : undefined,
                color: authStatus.mode === 'live_gcal' ? 'var(--success)' : undefined,
                background: authStatus.mode === 'live_gcal' ? 'rgba(5, 150, 105, 0.08)' : undefined,
                fontWeight: authStatus.mode === 'live_gcal' ? 700 : undefined
              }}
            >
              <Settings size={16} />
              <span className="hide-tablet">{authStatus.mode === 'live_gcal' ? '● Live' : 'Sync'}</span>
            </button>

            {/* Reset Demo */}
            <button 
              className="btn" 
              onClick={resetToDemoSchedule}
              title="Reset to Original Schedule Demo"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: View Mode Switcher + Persistent Date Navigator */}
        <div className="header-row header-row-nav">
          <div className="btn-toggle-group">
            <button
              className={`toggle-item ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Visual Weekly Calendar Grid (Google Calendar style)"
            >
              <CalendarDays size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              <span>Calendar</span>
            </button>
            <button
              className={`toggle-item ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
              title="Daily Shift Dispatch (Morning, Pickups, Activities)"
            >
              <ListTodo size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              <span>Daily Shifts</span>
            </button>
            <button
              className={`toggle-item ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
              title="Caregiver Roster Matrix View"
            >
              <Grid size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              <span>Matrix</span>
            </button>
          </div>

          <div className="date-navigator">
            <button 
              className="nav-btn" 
              onClick={() => changeDateByDays(viewMode === 'daily' ? -1 : -7)}
              title={viewMode === 'daily' ? "Previous Day" : "Previous Week"}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="current-date-label">
              {viewMode === 'daily' ? formatDateLabel(selectedDate) : formatWeekRangeLabel(currentWeekDays)}
            </span>
            <button 
              className="nav-btn" 
              onClick={() => changeDateByDays(viewMode === 'daily' ? 1 : 7)}
              title={viewMode === 'daily' ? "Next Day" : "Next Week"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
