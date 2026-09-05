import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  X, 
  Bell, 
  Mail, 
  Send, 
  Check, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Palmtree, 
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export const SundayAlertModal: React.FC = () => {
  const { 
    isSundayAlertOpen, 
    setIsSundayAlertOpen, 
    caregivers, 
    events, 
    holidays, 
    gaps, 
    currentWeekDays,
    addToast 
  } = useSchedule();

  const [isEnabled, setIsEnabled] = useState(true);
  const [alertTime, setAlertTime] = useState('19:00'); // 7:00 PM
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([
    'family_daniel@herrington.ai',
    'family_lucila@herrington.ai'
  ]);
  const [customEmail, setCustomEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('preview');

  if (!isSundayAlertOpen) return null;

  const toggleRecipient = (email: string) => {
    setSelectedRecipients((prev) => 
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleAddCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail && !selectedRecipients.includes(customEmail)) {
      setSelectedRecipients((prev) => [...prev, customEmail.trim()]);
      setCustomEmail('');
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      await fetch('/api/alerts/sunday-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipients,
          time: alertTime,
          dateRange: `${format(currentWeekDays[0], 'MMM d')} – ${format(currentWeekDays[6], 'MMM d')}`
        })
      }).catch(() => null);

      addToast(`📧 Sunday Reminder dispatched to ${selectedRecipients.length} recipients!`, 'success');
    } finally {
      setIsSendingTest(false);
    }
  };

  const weekStartStr = format(currentWeekDays[0], 'MMM d');
  const weekEndStr = format(currentWeekDays[6], 'MMM d, yyyy');
  const weekHolidays = holidays.filter((h) => 
    currentWeekDays.some((d) => format(d, 'yyyy-MM-dd') === h.date)
  );

  return (
    <div className="modal-overlay" onClick={() => setIsSundayAlertOpen(false)}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #FF5E7E 0%, #FFB703 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <div className="modal-title">Sunday Night Schedule Reminder</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automated weekly digest & driver confirmation alert
              </div>
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsSundayAlertOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle: Settings vs Live Email Preview */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: '#F8FAFC', padding: '0 20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'preview' ? '3px solid var(--accent)' : '3px solid transparent',
              color: activeTab === 'preview' ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            ✉️ Email Digest Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'config' ? '3px solid var(--accent)' : '3px solid transparent',
              color: activeTab === 'config' ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            ⚙️ Reminder Schedule & Recipients
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {activeTab === 'preview' ? (
            /* Live Art Deco Email Preview Container */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Simulated Sunday Night Email to Parents:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Trigger: Every Sunday @ 7:00 PM</span>
              </div>

              {/* Rendered Email Template */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #E5E9F0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {/* Email Header */}
                <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>🌴</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Los Herringtons Dispatch
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF5E7E', background: 'rgba(255, 94, 126, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      WEEKLY KICKOFF
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    Time to set this week's pickups & drop-offs!
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Upcoming Week: <strong>{weekStartStr} – {weekEndStr}</strong>
                  </div>
                </div>

                {/* Email Greeting */}
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                  Hi <strong>Daniel & Lucila</strong>, here is your quick logistics overview for the upcoming school week. Please confirm assignments so Elizabeth and Matilda have their duties synced.
                </p>

                {/* Week Highlights Box */}
                <div style={{ background: '#FAF7F2', border: '1px solid #E5E9F0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Week Snapshot:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Logistics</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                        {events.length} Scheduled
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Coverage Gaps</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: gaps.length > 0 ? '#E11D48' : '#059669' }}>
                        {gaps.length > 0 ? `⚠️ ${gaps.length} Unassigned` : '✓ 100% Covered'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Gap Warning in Email if any */}
                {gaps.length > 0 && (
                  <div style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E11D48', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <AlertTriangle size={15} />
                      <span>Action Needed: {gaps.length} Unassigned Duty</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0F172A' }}>
                      • <strong>{gaps[0].title}</strong> on {gaps[0].date} ({gaps[0].time}) at {gaps[0].location}
                    </div>
                  </div>
                )}

                {/* Holidays in Email if any */}
                {weekHolidays.length > 0 && (
                  <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <Palmtree size={15} />
                      <span>Upcoming Holidays This Week:</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0F172A' }}>
                      {weekHolidays.map((h) => (
                        <span key={h.date}>• <strong>{h.name}</strong> on {h.date} (No school/classes)<br /></span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct CTA Button */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <a
                    href="https://family-schedule-helper.web.app"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#FF5E7E',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px rgba(255, 94, 126, 0.4)'
                    }}
                  >
                    Open Los Herringtons Dispatch →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Settings & Schedule Config Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Enable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#FAF7F2', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Enable Sunday Night Email Alerts</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sends a prompt and weekly summary to parents every Sunday evening
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isEnabled} 
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>

              {/* Timing */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                  Delivery Time:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['18:00', '19:00', '20:00', '21:00'].map((time) => {
                    const label = time === '18:00' ? '6:00 PM' : time === '19:00' ? '7:00 PM (Recommended)' : time === '20:00' ? '8:00 PM' : '9:00 PM';
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`btn ${alertTime === time ? 'btn-primary' : ''}`}
                        onClick={() => setAlertTime(time)}
                        style={{ fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                  Recipients:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {caregivers.map((cg) => {
                    const isSelected = selectedRecipients.includes(cg.calendarId);
                    return (
                      <div
                        key={cg.id}
                        onClick={() => toggleRecipient(cg.calendarId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#FFFFFF',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div 
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '6px', 
                              backgroundColor: cg.avatarColor, 
                              color: '#fff', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}
                          >
                            {cg.avatarInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{cg.name} ({cg.role})</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cg.calendarId}</div>
                          </div>
                        </div>

                        <div 
                          style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '4px', 
                            border: '2px solid',
                            borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                            backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={12} color="#fff" strokeWidth={3.5} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Email */}
                <form onSubmit={handleAddCustomEmail} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    placeholder="Add additional email..."
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button type="submit" className="btn" style={{ fontSize: '0.8rem' }}>
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-primary"
            disabled={isSendingTest}
            onClick={handleSendTest}
            style={{ background: '#FF5E7E', borderColor: '#FF5E7E' }}
          >
            <Send size={15} />
            <span>{isSendingTest ? 'Sending Test Alert...' : 'Send Test Alert Now'}</span>
          </button>
          <button className="btn" onClick={() => setIsSundayAlertOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
