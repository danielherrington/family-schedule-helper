import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const GapAlertBanner: React.FC = () => {
  const { gaps, events, setReassignModalEvent, setSelectedDate, setViewMode } = useSchedule();

  if (gaps.length === 0) return null;

  const topGap = gaps[0];
  const targetEvent = events.find((e) => e.id === topGap.eventId);

  const handleResolve = () => {
    if (targetEvent) {
      setSelectedDate(targetEvent.date);
      setViewMode('daily');
      setReassignModalEvent(targetEvent);
    }
  };

  return (
    <div className="gap-banner">
      <div className="gap-banner-left">
        <div className="gap-icon">
          <AlertTriangle size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f59e0b' }}>
            Unassigned Coverage Alert: {topGap.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Date: <strong>{topGap.date}</strong> at <strong>{topGap.time}</strong> ({topGap.location}) — No caregiver assigned yet.
          </div>
        </div>
      </div>
      <button 
        className="btn btn-warning"
        onClick={handleResolve}
      >
        <span>Assign Driver</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
