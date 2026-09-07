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

        <div className="modal-body">
          {/* Manager Auth Card */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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

          {/* Caregiver Calendar Mappings */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px' }}>
              Caregiver Calendar / Email Mappings:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {caregivers.map((cg) => (
                <div 
                  key={cg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
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
