import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { format, parseISO } from 'date-fns';
import { SchoolCalendarException } from '../types/schedule';
import { 
  GraduationCap, 
  Clock, 
  Check, 
  X, 
  Mail, 
  Calendar, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { isTodayOrUpcoming } from '../utils/dateUtils';

export const SchoolAlertBanner: React.FC = () => {
  const { 
    currentWeekDays, 
    schoolExceptions, 
    applySchoolException, 
    dismissSchoolException,
    setIsSchoolInboxOpen,
    events
  } = useSchedule();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const weekDateStrings = currentWeekDays.map((d) => format(d, 'yyyy-MM-dd'));

  // Filter exceptions that fall in this week, are not dismissed, not applied, and are upcoming
  const pendingWeekExceptions = schoolExceptions.filter((exc) => {
    const isInWeek = weekDateStrings.includes(exc.date);
    const isUpcoming = isTodayOrUpcoming(exc.date);
    return isInWeek && isUpcoming && !exc.applied && !exc.dismissed;
  });

  if (pendingWeekExceptions.length === 0) return null;

  const handleApply = async (exc: SchoolCalendarException) => {
    setApplyingId(exc.id);
    try {
      await applySchoolException(exc.id);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
      {pendingWeekExceptions.map((exc) => {
        let formattedDate = exc.date;
        try {
          formattedDate = format(parseISO(exc.date), 'EEEE, MMM d');
        } catch {}

        // Find existing pickup event on that date to show comparison
        const existingPickup = events.find(
          (e) => e.date === exc.date && e.status !== 'cancelled' && (e.category === 'pickup' || e.title.toLowerCase().includes('pickup'))
        );

        const isEarlyDismissal = exc.type === 'early_dismissal';

        return (
          <div
            key={exc.id}
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 42, 133, 0.08))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 340px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706',
                  flexShrink: 0
                }}
              >
                <GraduationCap size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)' }}>
                    🎒 {exc.schoolName || 'School Alert'}: {exc.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isEarlyDismissal ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: isEarlyDismissal ? '#b45309' : '#dc2626',
                      border: `1px solid ${isEarlyDismissal ? '#f59e0b' : '#ef4444'}`
                    }}
                  >
                    {isEarlyDismissal ? `Early Dismissal: ${formatTimeDisplay(exc.dismissalTime || '13:15')}` : 'School Closed'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Mail size={11} />
                    {exc.source === 'gmail' ? 'Gmail Ingested' : 'School Notice'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Detected on <strong>{formattedDate}</strong>.
                  {isEarlyDismissal && exc.dismissalTime ? (
                    existingPickup ? (
                      <span>
                        {' '}Current pickup scheduled at <strong>{formatTimeDisplay(existingPickup.startTime)}</strong>. Shift to <strong>{formatTimeDisplay(exc.dismissalTime)}</strong>?
                      </span>
                    ) : (
                      <span>
                        {' '}No pickup currently scheduled. Would you like to schedule pickup for <strong>{formatTimeDisplay(exc.dismissalTime)}</strong>?
                      </span>
                    )
                  ) : (
                    <span>
                      {' '}Would you like to cancel school drop-off & pickup runs for this date? (Moe walks remain safe).
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderColor: '#d97706',
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                disabled={applyingId === exc.id}
                onClick={() => handleApply(exc)}
              >
                <Check size={15} />
                <span>
                  {applyingId === exc.id
                    ? 'Updating Schedule...'
                    : isEarlyDismissal
                    ? `Adjust Pickup to ${formatTimeDisplay(exc.dismissalTime || '13:15')}`
                    : 'Cancel School Runs'}
                </span>
              </button>

              <button
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  fontWeight: 700
                }}
                onClick={() => setIsSchoolInboxOpen(true)}
                title="View in School Inbox"
              >
                <span>View Email</span>
              </button>

              <button
                className="nav-btn"
                onClick={() => dismissSchoolException(exc.id)}
                title="Dismiss school alert"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
