import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  X, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  RotateCcw, 
  LogOut, 
  RefreshCw, 
  Check, 
  Sparkles 
} from 'lucide-react';

export const CalendarSettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    authStatus, 
    caregivers,
    userCalendars,
    activeCalendarId,
    setActiveCalendarId,
    connectedEmail,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    refreshCalendarEvents,
    syncMode,
    setSyncMode,
    isLoading
  } = useSchedule();

  const [isConnecting, setIsConnecting] = useState(false);

  if (!isSettingsOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectGoogleCalendar();
    } finally {
      setIsConnecting(false);
    }
  };

  const isLive = authStatus.mode === 'live_gcal';

  return (
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
              <span>Google Calendar Live Sync Settings</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Configure live Google OAuth 2.0 and Family Calendar mappings
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsSettingsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Manager Auth Card */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color={isLive ? 'var(--success)' : 'var(--accent)'} />
                <span style={{ fontWeight: 800 }}>Google Account Connection</span>
              </div>
              <span className={`status-indicator ${isLive ? 'status-confirmed' : ''}`} style={{ fontWeight: 700 }}>
                {isLive ? '● Live Google Calendar Connected' : '● Demo / Blueprint Mode'}
              </span>
            </div>

            {isLive ? (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '14px' }}>
                  Connected as: <strong style={{ color: 'var(--primary)' }}>{connectedEmail || 'Authenticated User'}</strong>
                </div>

                {/* Active Calendar Picker */}
                {userCalendars.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                      Syncing with Google Calendar:
                    </label>
                    <select
                      value={activeCalendarId}
                      onChange={(e) => setActiveCalendarId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      {userCalendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary} {cal.primary ? '(Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={refreshCalendarEvents}
                    disabled={isLoading}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
                    <span>Refresh Calendar Events</span>
                  </button>

                  <button 
                    className="btn"
                    onClick={disconnectGoogleCalendar}
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    <LogOut size={15} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                  Click below to sign in with your Google account (<strong>daniel.j.herrington@gmail.com</strong>). The app will read your real pickup/drop-off calendar events and keep driver assignments in sync directly from your browser!
                </p>

                <button 
                  className="btn btn-primary"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '12px 18px', 
                    fontWeight: 800,
                    boxShadow: '0 2px 10px rgba(0, 180, 216, 0.3)'
                  }}
                >
                  <ExternalLink size={16} />
                  <span>{isConnecting ? 'Opening Google Sign-In...' : 'Connect Google Calendar (daniel.j.herrington@gmail.com)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Protection Mode Card */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Sync Protection Mode</span>
              </div>
              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: syncMode === 'staged' ? 'rgba(0, 180, 216, 0.15)' : 'rgba(255, 94, 126, 0.15)',
                  color: syncMode === 'staged' ? 'var(--primary)' : 'var(--accent)'
                }}
              >
                {syncMode === 'staged' ? 'SAFE MODE' : 'IMMEDIATE AUTO-SYNC'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Option 1: Staged (Safe Mode) */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: syncMode === 'staged' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: syncMode === 'staged' ? 'rgba(0, 180, 216, 0.05)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="radio" 
                  name="syncMode" 
                  value="staged"
                  checked={syncMode === 'staged'}
                  onChange={() => setSyncMode('staged')}
                  style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Review & Push (Recommended Safe Mode)</span>
                    <span style={{ background: 'rgba(5, 150, 105, 0.15)', color: 'var(--success)', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                      SAFEST
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Make multiple changes locally, review the exact before & after diffs, and push them to Google Calendar in one verified batch. Prevents unintended live calendar edits.
                  </div>
                </div>
              </label>

              {/* Option 2: Immediate Auto-Sync */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: syncMode === 'immediate' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: syncMode === 'immediate' ? 'rgba(255, 94, 126, 0.05)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="radio" 
                  name="syncMode" 
                  value="immediate"
                  checked={syncMode === 'immediate'}
                  onChange={() => setSyncMode('immediate')}
                  style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
                    Auto-Sync Immediately
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Every reassign, cancellation, or addition instantly modifies your live Google Calendar event via the Google Calendar API.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Caregiver Calendar Mappings */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '6px' }}>
              Caregiver Calendar / Email Mappings:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {caregivers.map((cg) => (
                <div 
                  key={cg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar" style={{ backgroundColor: cg.avatarColor, width: '28px', height: '28px', fontSize: '0.75rem' }}>
                      {cg.avatarInitials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{cg.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({cg.role})</span></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {cg.calendarId}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={13} />
                    <span>Mapped</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setIsSettingsOpen(false)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
