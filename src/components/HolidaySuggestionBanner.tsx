import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getHolidaysForDates, HolidayInfo } from '../utils/holidayEngine';
import { Palmtree, Sparkles, X, Check, Calendar, RotateCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { isTodayOrUpcoming } from '../utils/dateUtils';

export const HolidaySuggestionBanner: React.FC = () => {
  const { currentWeekDays, holidays, markDayAsHoliday, unmarkDayHoliday } = useSchedule();
  const [dismissedHolidays, setDismissedHolidays] = useState<string[]>([]);
  const [applyingDate, setApplyingDate] = useState<string | null>(null);

  const weekDateStrings = currentWeekDays.map((d) => format(d, 'yyyy-MM-dd'));
  const holidaysInWeek = getHolidaysForDates(weekDateStrings);

  // Find holidays that have not yet been marked in the schedule, not dismissed, and have not already passed
  const pendingHolidays = holidaysInWeek.filter((h) => {
    const isAlreadyMarked = holidays.some((hm) => hm.date === h.date);
    const isDismissed = dismissedHolidays.includes(h.date);
    const isUpcoming = isTodayOrUpcoming(h.date);
    return !isAlreadyMarked && !isDismissed && isUpcoming;
  });

  // Find holidays in the active week that ARE marked
  const markedHolidaysInWeek = holidaysInWeek.filter((h) => holidays.some((hm) => hm.date === h.date));

  if (pendingHolidays.length === 0 && markedHolidaysInWeek.length === 0) return null;

  const handleApply = async (h: HolidayInfo) => {
    setApplyingDate(h.date);
    try {
      await markDayAsHoliday(h.date, `${h.name} (No School)`, 'all');
    } finally {
      setApplyingDate(null);
    }
  };

  const handleDismiss = (dateStr: string) => {
    setDismissedHolidays((prev) => [...prev, dateStr]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      {/* Active Marked Holidays with 1-Tap Undo */}
      {markedHolidaysInWeek.map((h) => {
        const matchingHoliday = holidays.find((hm) => hm.date === h.date);
        const formattedDate = format(parseISO(h.date), 'EEEE, MMM d');
        return (
          <div
            key={`marked-${h.date}`}
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <Palmtree size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                  🌴 Marked as Day Off: {matchingHoliday?.name || h.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formattedDate} • Pickups & drop-offs cancelled (Moe walks active)
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn"
              style={{
                borderColor: 'var(--danger)',
                color: 'var(--danger)',
                background: 'rgba(225, 29, 72, 0.08)',
                fontSize: '0.78rem',
                padding: '5px 12px',
                minHeight: '34px',
                fontWeight: 700
              }}
              onClick={() => unmarkDayHoliday(h.date)}
              title="Undo day off and restore duties"
            >
              <RotateCcw size={14} />
              <span>Undo Day Off & Restore Duties</span>
            </button>
          </div>
        );
      })}

      {/* Suggested Holidays */}
      {pendingHolidays.map((h) => {
        const formattedDate = format(parseISO(h.date), 'EEEE, MMM d');
        const badgeColor = h.category === 'jewish' ? '#8b5cf6' : '#3b82f6';

        return (
          <div
            key={h.date}
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <Palmtree size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>
                    🌴 Holiday Suggestion: {h.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: `${badgeColor}22`,
                      color: badgeColor,
                      border: `1px solid ${badgeColor}44`
                    }}
                  >
                    {h.category === 'jewish' ? 'Jewish Holiday' : 'Major Holiday'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Detected on <strong>{formattedDate}</strong>. Schools are typically closed — would you like to cancel pickups & drop-offs for this day?
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-primary"
                style={{
                  background: '#10b981',
                  borderColor: '#10b981',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
                disabled={applyingDate === h.date}
                onClick={() => handleApply(h)}
              >
                <Check size={15} />
                <span>{applyingDate === h.date ? 'Applying...' : 'Mark Day Off & Cancel Duties'}</span>
              </button>
              <button
                className="nav-btn"
                onClick={() => handleDismiss(h.date)}
                title="Dismiss suggestion"
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
