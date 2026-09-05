import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { EventCard } from './EventCard';
import { HolidayModal } from './HolidayModal';
import { Calendar, Filter, Sparkles, CheckCircle2, AlertCircle, Palmtree } from 'lucide-react';
import { format } from 'date-fns';

export const WeeklyMatrixView: React.FC = () => {
  const { events, currentWeekDays, setSelectedDate, setViewMode, applyWeeklyBlueprint, children: childrenList, holidays } = useSchedule();
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [holidayModalTargetDate, setHolidayModalTargetDate] = useState<string | null>(null);

  const weekDays = currentWeekDays.map((d) => ({
    name: format(d, 'EEE'),
    fullName: format(d, 'EEEE'),
    dateStr: format(d, 'yyyy-MM-dd')
  }));

  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <button
            className={`btn ${selectedChildFilter === 'all' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setSelectedChildFilter('all')}
          >
            All Kids
          </button>
          {childrenList.map((ch) => {
            const isSelected = selectedChildFilter === ch.id;
            return (
              <button
                key={ch.id}
                className={`btn ${isSelected ? 'btn-primary' : ''}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderColor: isSelected ? ch.color : undefined,
                  background: isSelected ? ch.color : undefined,
                  color: isSelected ? '#fff' : undefined
                }}
                onClick={() => setSelectedChildFilter(ch.id)}
              >
                {ch.name}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn"
            onClick={() => applyWeeklyBlueprint('2026-08-31')}
            title="Refresh active week from routine blueprint"
          >
            <Sparkles size={15} color="var(--accent)" />
            <span>Reset to Blueprint</span>
          </button>
        </div>
      </div>

      {/* Responsive Day-by-Day Grid Matrix */}
      <div className="weekly-grid-layout">
        {weekDays.map((d) => {
          const dayEvents = events
            .filter((e) => {
              const matchesDate = e.date === d.dateStr;
              const matchesChild = selectedChildFilter === 'all' || e.childId === selectedChildFilter || e.childId === 'all';
              return matchesDate && matchesChild;
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const unassignedCount = dayEvents.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').length;
          const dayHoliday = holidays.find((h) => h.date === d.dateStr);

          return (
            <div key={d.dateStr} className="weekly-day-card">
              {/* Day Header */}
              <div className="weekly-day-header">
                <div 
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    setViewMode('daily');
                  }}
                >
                  <span className="weekly-day-title">{d.fullName}</span>
                  <span className="weekly-day-sub">{d.dateStr}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Holiday Action on Day */}
                  <button
                    type="button"
                    className="nav-btn"
                    style={{ color: dayHoliday ? '#10b981' : 'var(--text-muted)', padding: '4px' }}
                    onClick={() => setHolidayModalTargetDate(d.dateStr)}
                    title="Mark day as holiday / day off"
                  >
                    <Palmtree size={16} />
                  </button>

                  {unassignedCount > 0 ? (
                    <span className="count-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }}>
                      ⚠️ {unassignedCount} Gap
                    </span>
                  ) : (
                    <span className="count-badge">
                      {dayEvents.length} {dayEvents.length === 1 ? 'duty' : 'duties'}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Holiday Banner if set */}
              {dayHoliday && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <Palmtree size={13} />
                  <span>🌴 {dayHoliday.name}</span>
                </div>
              )}

              {/* Day Events Column */}
              <div className="weekly-day-body">
                {dayEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    No events scheduled
                  </div>
                ) : (
                  dayEvents.map((evt) => (
                    <EventCard key={evt.id} event={evt} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Holiday Modal */}
      {holidayModalTargetDate && (
        <HolidayModal
          isOpen={!!holidayModalTargetDate}
          onClose={() => setHolidayModalTargetDate(null)}
          targetDateStr={holidayModalTargetDate}
        />
      )}
    </div>
  );
};
