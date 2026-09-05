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
  CalendarDays
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    selectedDate, 
    viewMode, 
    setViewMode, 
    changeDateByDays, 
    gaps, 
    setIsSettingsOpen,
    setIsAuditLogOpen,
    setIsSetupOpen,
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

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
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

        {/* Center Controls: 3-Way View Switcher */}
        <div className="header-controls">
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

          {viewMode === 'daily' && (
            <div className="date-navigator">
              <button 
                className="nav-btn" 
                onClick={() => changeDateByDays(-1)}
                title="Previous Day"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="current-date-label">
                {formatDateLabel(selectedDate)}
              </span>
              <button 
                className="nav-btn" 
                onClick={() => changeDateByDays(1)}
                title="Next Day"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Setup Hub, Gaps, Settings */}
        <div className="header-controls">
          {/* Family Setup Hub Button */}
          <button 
            className="btn btn-primary"
            onClick={() => setIsSetupOpen(true)}
            title="Manage Potential Caregivers, Potential Kids, and Weekly Blueprint"
            style={{ fontWeight: 700 }}
          >
            <Users size={16} />
            <span>Family Setup</span>
          </button>

          {gaps.length > 0 && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
            >
              <AlertCircle size={14} />
              <span>{gaps.length} Gap{gaps.length === 1 ? '' : 's'}</span>
            </div>
          )}

          {/* Audit Log Trigger */}
          <button 
            className="btn" 
            onClick={() => setIsAuditLogOpen(true)}
            title="View Single-Instance Exceptions Audit Log"
          >
            <FileText size={16} />
            <span className="hide-mobile">Audit</span>
          </button>

          {/* Settings Modal */}
          <button 
            className="btn" 
            onClick={() => setIsSettingsOpen(true)}
            title="Google Calendar & OAuth Sync Settings"
          >
            <Settings size={16} />
            <span className="hide-mobile">Google Sync</span>
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
    </header>
  );
};
