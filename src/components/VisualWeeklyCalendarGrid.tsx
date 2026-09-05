import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { DispatchEvent } from '../types/schedule';
import { HolidayModal } from './HolidayModal';
import { 
  Filter, 
  Sparkles, 
  MapPin, 
  Check, 
  Clock, 
  Palmtree, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const VisualWeeklyCalendarGrid: React.FC = () => {
  const { 
    events, 
    caregivers, 
    children: childrenList, 
    holidays, 
    reassignEvent, 
    cancelEventInstance, 
    restoreEventInstance,
    applyWeeklyBlueprint,
    setSelectedDate,
    setViewMode
  } = useSchedule();

  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [holidayModalTargetDate, setHolidayModalTargetDate] = useState<string | null>(null);
  const [activePopoverEventId, setActivePopoverEventId] = useState<string | null>(null);

  const weekDays = [
    { dayName: 'Monday', shortName: 'Mon', dateStr: '2026-08-31', dateNum: '31' },
    { dayName: 'Tuesday', shortName: 'Tue', dateStr: '2026-09-01', dateNum: '01' },
    { dayName: 'Wednesday', shortName: 'Wed', dateStr: '2026-09-02', dateNum: '02' },
    { dayName: 'Thursday', shortName: 'Thu', dateStr: '2026-09-03', dateNum: '03' },
    { dayName: 'Friday', shortName: 'Fri', dateStr: '2026-09-04', dateNum: '04' },
    { dayName: 'Saturday', shortName: 'Sat', dateStr: '2026-09-05', dateNum: '05' },
    { dayName: 'Sunday', shortName: 'Sun', dateStr: '2026-09-06', dateNum: '06' }
  ];

  const timeHours = [
    { hour: 7, label: '7 AM' },
    { hour: 8, label: '8 AM' },
    { hour: 9, label: '9 AM' },
    { hour: 10, label: '10 AM' },
    { hour: 11, label: '11 AM' },
    { hour: 12, label: '12 PM' },
    { hour: 13, label: '1 PM' },
    { hour: 14, label: '2 PM' },
    { hour: 15, label: '3 PM' },
    { hour: 16, label: '4 PM' },
    { hour: 17, label: '5 PM' },
    { hour: 18, label: '6 PM' },
    { hour: 19, label: '7 PM' }
  ];

  // Calculate top & height percentage based on 7:00 AM (420 min) to 7:00 PM (1140 min)
  const calculatePosition = (startTimeStr: string, endTimeStr: string) => {
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = (endTimeStr || startTimeStr).split(':').map(Number);

    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    const windowStart = 7 * 60; // 7:00 AM = 420 min
    const windowDuration = 12 * 60; // 12 hours = 720 min

    const topPercent = Math.max(0, ((startTotalMin - windowStart) / windowDuration) * 100);
    const durationMin = Math.max(30, endTotalMin - startTotalMin);
    const heightPercent = (durationMin / windowDuration) * 100;

    return { topPercent, heightPercent };
  };

  // Detect conflicts (two events on same date, same driver, overlapping time)
  const isEventConflicted = (event: DispatchEvent) => {
    if (event.assignedTo === 'unassigned' || event.status === 'cancelled') return false;
    return events.some((other) => {
      if (other.id === event.id || other.date !== event.date || other.assignedTo !== event.assignedTo || other.status === 'cancelled') {
        return false;
      }
      return other.startTime < event.endTime && event.startTime < other.endTime;
    });
  };

  return (
    <div className="visual-calendar-wrapper">
      {/* Top Filter & Blueprint Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <button
            className={`btn ${selectedChildFilter === 'all' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setSelectedChildFilter('all')}
          >
            All Kids
          </button>
          {childrenList.map((ch) => (
            <button
              key={ch.id}
              className={`btn ${selectedChildFilter === ch.id ? 'btn-primary' : ''}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                borderColor: selectedChildFilter === ch.id ? ch.color : undefined,
                background: selectedChildFilter === ch.id ? ch.color : undefined,
                color: selectedChildFilter === ch.id ? '#fff' : undefined
              }}
              onClick={() => setSelectedChildFilter(ch.id)}
            >
              {ch.name}
            </button>
          ))}
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

      {/* Main Calendar Grid Canvas */}
      <div className="calendar-grid-canvas">
        {/* Header Days Row */}
        <div className="calendar-grid-header">
          <div className="time-axis-header">GMT-4</div>
          {weekDays.map((d) => {
            const isToday = d.dateStr === '2026-09-01';
            const dayHoliday = holidays.find((h) => h.date === d.dateStr);

            return (
              <div key={d.dateStr} className={`day-column-header ${isToday ? 'is-today' : ''}`}>
                <div 
                  style={{ display: 'flex', alignItems: 'baseline', gap: '6px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    setViewMode('daily');
                  }}
                >
                  <span className="day-name-label">{d.shortName}</span>
                  <span className="day-number-label">{d.dateNum}</span>
                </div>

                <button
                  type="button"
                  className="nav-btn"
                  style={{ padding: '2px 4px', color: dayHoliday ? '#10b981' : 'var(--text-muted)' }}
                  onClick={() => setHolidayModalTargetDate(d.dateStr)}
                  title="Mark as holiday / day off"
                >
                  <Palmtree size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Scrollable Body: Time Axis + 7 Columns */}
        <div className="calendar-grid-body">
          {/* Left Time Axis */}
          <div className="time-axis-column">
            {timeHours.map((t) => (
              <div key={t.hour} className="time-hour-marker">
                <span>{t.label}</span>
              </div>
            ))}
          </div>

          {/* 7 Day Event Columns */}
          <div className="calendar-columns-container">
            {/* Background Horizontal Grid Lines */}
            <div className="grid-horizontal-lines">
              {timeHours.map((t) => (
                <div key={t.hour} className="grid-hour-line" />
              ))}
            </div>

            {/* Columns for each day */}
            {weekDays.map((d) => {
              const dayEvents = events.filter((e) => {
                const matchesDate = e.date === d.dateStr;
                const matchesChild = selectedChildFilter === 'all' || e.childId === selectedChildFilter || e.childId === 'all';
                return matchesDate && matchesChild;
              });

              const dayHoliday = holidays.find((h) => h.date === d.dateStr);

              return (
                <div key={d.dateStr} className="calendar-day-column">
                  {/* Holiday Overlay Badge if active */}
                  {dayHoliday && (
                    <div className="column-holiday-banner">
                      <Palmtree size={12} />
                      <span>{dayHoliday.name}</span>
                    </div>
                  )}

                  {/* Render Event Blocks Positioned Proportionally */}
                  {dayEvents.map((evt) => {
                    const child = childrenList.find((c) => c.id === evt.childId);
                    const assignedCg = caregivers.find((c) => c.id === evt.assignedTo);
                    const { topPercent, heightPercent } = calculatePosition(evt.startTime, evt.endTime);
                    const isCancelled = evt.status === 'cancelled';
                    const hasConflict = isEventConflicted(evt);

                    return (
                      <div
                        key={evt.id}
                        className={`calendar-event-block ${isCancelled ? 'is-cancelled' : ''} ${hasConflict ? 'has-conflict' : ''}`}
                        style={{
                          top: `${topPercent}%`,
                          minHeight: `${Math.max(heightPercent, 5.5)}%`,
                          borderLeftColor: isCancelled ? '#10b981' : (child?.color || '#3b82f6'),
                          backgroundColor: isCancelled ? 'rgba(16, 185, 129, 0.1)' : (child?.badgeBg || 'rgba(59, 130, 246, 0.15)')
                        }}
                      >
                        {/* Event Header */}
                        <div className="cal-block-header">
                          <span className="cal-block-time">
                            {evt.startTime} - {evt.endTime}
                          </span>
                          {hasConflict && (
                            <span className="conflict-badge" title="Driver Double-Booked!">
                              ⚠️ Clash
                            </span>
                          )}
                          {isCancelled && (
                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>
                              🌴 OFF
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div className={`cal-block-title ${isCancelled ? 'strikethrough' : ''}`}>
                          {evt.title}
                        </div>

                        {evt.location && (
                          <div className="cal-block-location">
                            <MapPin size={10} style={{ flexShrink: 0 }} />
                            <span>{evt.location}</span>
                          </div>
                        )}

                        {/* Caregiver Checkbox Selector Pills directly on block */}
                        {!isCancelled && (
                          <div className="cal-block-caregivers">
                            {caregivers.map((cg) => {
                              const isSelected = evt.assignedTo === cg.id;
                              return (
                                <button
                                  key={cg.id}
                                  type="button"
                                  className={`cal-cg-pill ${isSelected ? 'selected' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    reassignEvent(evt.id, cg.id);
                                  }}
                                  title={`Assign to ${cg.name}`}
                                  style={{
                                    borderColor: isSelected ? cg.avatarColor : undefined,
                                    background: isSelected ? cg.avatarColor : undefined,
                                    color: isSelected ? '#fff' : undefined
                                  }}
                                >
                                  {cg.avatarInitials}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
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
