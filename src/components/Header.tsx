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
  Plus,
  CloudUpload,
  Plane,
  Share2,
  UserCheck,
  Phone,
  GraduationCap,
  X
} from 'lucide-react';

import { isTodayOrUpcoming, getTodayDateStr } from '../utils/dateUtils';
import { isStaging } from '../services/firebaseClient';
import { DachshundIcon } from './ui/DachshundIcon';

export const Header: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate,
    viewMode, 
    setViewMode, 
    changeDateByDays, 
    currentWeekDays,
    gaps, 
    authStatus,
    connectedEmail,
    pendingSyncQueue,
    setIsSyncReviewOpen,
    setIsSettingsOpen,
    setIsAuditLogOpen,
    setIsSetupOpen,
    setIsSundayAlertOpen,
    setIsTravelModalOpen,
    caregiverTravels,
    caregivers,
    selectedCaregiverFilter,
    setSelectedCaregiverFilter,
    setIsShareDispatchOpen,
    setIsParentDirectoryOpen,
    schoolExceptions,
    setIsSchoolInboxOpen,
    openAddEventModal,
    resetToDemoSchedule 
  } = useSchedule();

  const pendingSchoolCount = schoolExceptions.filter((e) => !e.applied && !e.dismissed).length;

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
              <div className="brand-title">
                <span>Los Herringtons</span>
                <span className="brand-badge">🌴 Miami</span>
                <span 
                  className="doxie-mascot-pill"
                  title="Moe the Long-Haired Dachshund 🐾"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255, 42, 133, 0.16) 0%, rgba(255, 110, 199, 0.08) 100%)',
                    border: '1px solid rgba(255, 42, 133, 0.45)',
                    color: '#FF2A85',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(255, 42, 133, 0.25)',
                    cursor: 'default'
                  }}
                >
                  <DachshundIcon size={14} color="#FF2A85" glow />
                  <span>Moe 🐾</span>
                </span>
                {isStaging && (
                  <a
                    href="https://family-schedule-helper.web.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #f59e0b',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                    title="You are viewing the STAGING environment. Click to open Production."
                  >
                    🧪 Staging
                  </a>
                )}
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

            {/* Staged Review & Push Button (Visible when changes are pending) */}
            {pendingSyncQueue.length > 0 && (
              <button
                className="btn btn-review-push"
                onClick={() => setIsSyncReviewOpen(true)}
                title={`${pendingSyncQueue.length} pending change(s) staged. Click to review and push to Google Calendar.`}
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #FF758F 100%)',
                  color: '#fff',
                  borderColor: 'var(--accent)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(255, 94, 126, 0.4)'
                }}
              >
                <CloudUpload size={16} />
                <span>Review & Push ({pendingSyncQueue.length})</span>
              </button>
            )}

            {/* Family Setup Hub Button */}
            <button 
              className="btn"
              onClick={() => setIsSetupOpen(true)}
              title="Manage Potential Caregivers, Potential Kids & Pets, and Weekly Blueprint"
              style={{ fontWeight: 700 }}
            >
              <Users size={16} />
              <span className="hide-laptop">Family Setup</span>
            </button>

            {/* Out of Town / Travel Coverage Button */}
            <button 
              className="btn"
              onClick={() => setIsTravelModalOpen(true)}
              title="Mark caregivers traveling for work and auto-route roles"
              style={{ 
                fontWeight: 700,
                borderColor: caregiverTravels.length > 0 ? '#3b82f6' : undefined,
                color: caregiverTravels.length > 0 ? '#2563eb' : undefined,
                background: caregiverTravels.length > 0 ? 'rgba(59, 130, 246, 0.12)' : undefined
              }}
            >
              <Plane size={15} />
              <span className="hide-laptop">Out of Town{caregiverTravels.length > 0 ? ` (${caregiverTravels.length})` : ''}</span>
            </button>

            {/* Playdate & Carpool Parent Contact Directory (DAN-14) */}
            <button
              className="btn"
              onClick={() => setIsParentDirectoryOpen(true)}
              title="Playdate & Carpool Parent Contact Directory"
              style={{ fontWeight: 700 }}
            >
              <Phone size={14} color="#7928CA" />
              <span className="hide-desktop-compact">Contacts</span>
            </button>

            {/* School Calendar & Gmail Inbox (DAN-15) */}
            <button
              className="btn"
              onClick={() => setIsSchoolInboxOpen(true)}
              title="School Calendar & Gmail Inbox Ingestion (Early Dismissals)"
              style={{
                borderColor: pendingSchoolCount > 0 ? '#f59e0b' : undefined,
                color: pendingSchoolCount > 0 ? '#b45309' : undefined,
                background: pendingSchoolCount > 0 ? 'rgba(245, 158, 11, 0.12)' : undefined,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <GraduationCap size={15} color={pendingSchoolCount > 0 ? '#d97706' : '#f59e0b'} />
              <span className="hide-laptop">School Inbox</span>
              {pendingSchoolCount > 0 && (
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    fontWeight: 800
                  }}
                >
                  {pendingSchoolCount}
                </span>
              )}
            </button>

            {/* 1-Tap Share Daily Dispatch (DAN-9) */}
            <button
              className="btn"
              onClick={() => setIsShareDispatchOpen(true)}
              title="Share Today's Schedule via WhatsApp, iMessage, or Copy"
              style={{
                borderColor: '#25D366',
                color: '#128C7E',
                background: 'rgba(37, 211, 102, 0.08)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={15} color="#25D366" />
              <span className="hide-desktop-compact">Share</span>
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
              aria-label="Sunday Night Schedule Reminder"
              style={{ borderColor: 'rgba(255, 94, 126, 0.4)', color: 'var(--accent)' }}
            >
              <Bell size={15} />
            </button>

            {/* Audit Log Trigger */}
            <button 
              className="btn" 
              onClick={() => setIsAuditLogOpen(true)}
              title="View Single-Instance Exceptions Audit Log"
              aria-label="View Single-Instance Exceptions Audit Log"
            >
              <FileText size={16} />
            </button>

            {/* Settings Modal / Google Sync Status */}
            <button 
              className="btn" 
              onClick={() => setIsSettingsOpen(true)}
              title={authStatus.mode === 'live_gcal' ? `Connected to Google Calendar (${connectedEmail || 'Live'})` : "Connect Google Calendar"}
              aria-label="Google Calendar Sync Settings"
              style={{
                borderColor: authStatus.mode === 'live_gcal' ? 'var(--success)' : undefined,
                color: authStatus.mode === 'live_gcal' ? 'var(--success)' : undefined,
                background: authStatus.mode === 'live_gcal' ? 'rgba(5, 150, 105, 0.08)' : undefined,
                fontWeight: authStatus.mode === 'live_gcal' ? 700 : undefined
              }}
            >
              <Settings size={16} />
            </button>

            {/* Reset Demo */}
            <button 
              className="btn" 
              onClick={resetToDemoSchedule}
              title="Reset to Original Schedule Demo"
              aria-label="Reset to Original Schedule Demo"
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

          {/* Driver Filter Active Badge (DAN-10) */}
          {selectedCaregiverFilter !== 'all' && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: `${caregivers.find(c => c.id === selectedCaregiverFilter)?.avatarColor || '#00B4D8'}18`,
                border: `1px solid ${caregivers.find(c => c.id === selectedCaregiverFilter)?.avatarColor || '#00B4D8'}60`,
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: caregivers.find(c => c.id === selectedCaregiverFilter)?.avatarColor || '#00B4D8'
              }}
            >
              <span>Driver: {caregivers.find(c => c.id === selectedCaregiverFilter)?.name.split(' ')[0] || selectedCaregiverFilter}</span>
              <button
                type="button"
                onClick={() => setSelectedCaregiverFilter('all')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit'
                }}
                title="Clear Driver Filter (Show All Drivers)"
              >
                <X size={13} />
              </button>
            </div>
          )}

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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedDate(getTodayDateStr())}
              style={{
                padding: '3px 9px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                marginLeft: '4px',
                lineHeight: 1.2
              }}
              title="Return to Today"
            >
              Today
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
