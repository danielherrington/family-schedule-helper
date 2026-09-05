import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { X, Key, Calendar, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

export const CalendarSettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, authStatus, caregivers } = useSchedule();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isSettingsOpen) return null;

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      } else {
        alert('To enable Live Google Calendar OAuth, provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env or Google Cloud Console.');
      }
    } catch (err) {
      alert('Could not initiate Google OAuth.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Calendar Sync & Manager Settings</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Configure Google OAuth 2.0 and Family Calendar ID mappings
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsSettingsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Manager Auth Status */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color={authStatus.mode === 'live_gcal' ? 'var(--success)' : 'var(--accent)'} />
                <span style={{ fontWeight: 800 }}>Manager Authentication (Parents)</span>
              </div>
              <span className={`status-indicator ${authStatus.mode === 'live_gcal' ? 'status-confirmed' : ''}`}>
                {authStatus.mode === 'live_gcal' ? '● Connected to Google API' : '● Running in Demo Mode'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Only managers (Daniel & Lucila) authenticate. Caregivers (Elizabeth, Matilda) do not need logins; the helper updates their shared Google calendars via manager authorization.
            </p>
            <button 
              className="btn btn-primary"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ExternalLink size={16} />
              <span>{authStatus.mode === 'live_gcal' ? 'Re-authenticate Google Account' : 'Connect Google Calendar Account'}</span>
            </button>
          </div>

          {/* Caregiver Calendar Mappings */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px' }}>
              Configured Caregiver Google Calendars:
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
                      <div style={{ fontWeight: 700 }}>{cg.name}</div>
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
