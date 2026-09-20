import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { DispatchEvent } from '../types/schedule';
import { HolidayModal } from './HolidayModal';
import { format, parseISO } from 'date-fns';
import { getHolidayForDate } from '../utils/holidayEngine';
import { getTodayDateStr, isTodayOrUpcoming } from '../utils/dateUtils';
import { 
  Filter, 
  Sparkles, 
  MapPin, 
  Check, 
  Clock, 
  Palmtree, 
  AlertTriangle,
  AlertCircle,
  Plus,
  Share2,
  X
} from 'lucide-react';

interface PositionedEvent {
  event: DispatchEvent;
  topPercent: number;
  heightPercent: number;
  columnIndex: number;
  totalColumns: number;
}

export const VisualWeeklyCalendarGrid: React.FC = () => {
  const { 
    events, 
    caregivers, 
    children: childrenList, 
    holidays, 
    currentWeekDays,
    reassignEvent, 
    rescheduleEvent,
    cancelEventInstance, 
    markNoPickupNeeded,
    restoreEventInstance,
    unmarkDayHoliday,
    applyWeeklyBlueprint,
    setSelectedDate,
    setViewMode,
    openAddEventModal,
    setReassignModalEvent,
    selectedCaregiverFilter,
    setSelectedCaregiverFilter,
    setIsShareDispatchOpen
  } = useSchedule();

  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [holidayModalTargetDate, setHolidayModalTargetDate] = useState<string | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<DispatchEvent | null>(null);
  const [dropPreview, setDropPreview] = useState<{
    dateStr: string;
    topPercent: number;
    heightPercent: number;
    timeStr: string;
    newStartTime: string;
    newEndTime: string;
  } | null>(null);

  const handleDragStart = (e: React.DragEvent, evt: DispatchEvent) => {
    setDraggingEvent(evt);
    e.dataTransfer.setData('text/plain', evt.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingEvent(null);
    setDropPreview(null);
  };

  const START_HOUR = 7; // 7:00 AM
  const END_HOUR = 20; // 8:00 PM (14th hour row, covers up to 9:00 PM)
  const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 14 hours
  const WINDOW_START_MIN = START_HOUR * 60; // 420 min
  const WINDOW_DURATION_MIN = TOTAL_HOURS * 60; // 840 min (7 AM to 9 PM)

  const handleColumnDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggingEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const fraction = Math.max(0, Math.min(1, y / rect.height));

    const [sH, sM] = (draggingEvent.startTime || '08:00').split(':').map(Number);
    const [eH, eM] = (draggingEvent.endTime || draggingEvent.startTime || '08:30').split(':').map(Number);
    const durMin = Math.max(15, (eH * 60 + eM) - (sH * 60 + sM));

    const rawMin = WINDOW_START_MIN + fraction * WINDOW_DURATION_MIN;

    // Snap to 15-minute slot
    const snappedStartMin = Math.round(rawMin / 15) * 15;
    const clampedStartMin = Math.max(WINDOW_START_MIN, Math.min((END_HOUR + 1) * 60 - durMin, snappedStartMin));
    const clampedEndMin = clampedStartMin + durMin;

    const formatM = (m: number) => {
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const newStartTime = formatM(clampedStartMin);
    const newEndTime = formatM(clampedEndMin);
    const topPercent = ((clampedStartMin - WINDOW_START_MIN) / WINDOW_DURATION_MIN) * 100;
    const heightPercent = (durMin / WINDOW_DURATION_MIN) * 100;

    setDropPreview({
      dateStr,
      topPercent,
      heightPercent,
      timeStr: `${newStartTime} – ${newEndTime}`,
      newStartTime,
      newEndTime
    });
  };

  const handleColumnDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    if (!draggingEvent || !dropPreview) {
      setDraggingEvent(null);
      setDropPreview(null);
      return;
    }

    const { newStartTime, newEndTime } = dropPreview;
    const evtId = draggingEvent.id;

    setDraggingEvent(null);
    setDropPreview(null);

    await rescheduleEvent(evtId, targetDateStr, newStartTime, newEndTime);
  };

  const weekDays = currentWeekDays.map((d) => ({
    dayName: format(d, 'EEEE'),
    shortName: format(d, 'EEE'),
    dateStr: format(d, 'yyyy-MM-dd'),
    dateNum: format(d, 'd')
  }));

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
    { hour: 19, label: '7 PM' },
    { hour: 20, label: '8 PM' }
  ];

  // Robust Overlap & Column Layout Algorithm (Google Calendar interval graph style)
  const layoutDayEvents = (dayEventsList: DispatchEvent[]): PositionedEvent[] => {
    if (dayEventsList.length === 0) return [];

    // 1. Sort events by start time, then duration descending
    const sorted = [...dayEventsList].sort((a, b) => {
      if (a.startTime !== b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return b.endTime.localeCompare(a.endTime);
    });

    // 2. Parse times to minutes
    const parsed = sorted.map((event) => {
      const [sH, sM] = event.startTime.split(':').map(Number);
      const [eH, eM] = (event.endTime || event.startTime).split(':').map(Number);
      const startMin = sH * 60 + sM;
      const endMin = Math.max(startMin + 30, eH * 60 + eM);
      return { event, startMin, endMin };
    });

    // 3. Cluster overlapping events
    const clusters: typeof parsed[] = [];
    let currentCluster: typeof parsed = [];
    let clusterEnd = -1;

    for (const item of parsed) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterEnd = item.endMin;
      } else if (item.startMin < clusterEnd) {
        // Overlaps with current cluster
        currentCluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.endMin);
      } else {
        // Break to new cluster
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // 4. In each cluster, assign sub-columns
    const result: PositionedEvent[] = [];

    for (const cluster of clusters) {
      const columns: (typeof parsed)[] = [];

      for (const item of cluster) {
        let placed = false;
        for (let c = 0; c < columns.length; c++) {
          const lastInCol = columns[c][columns[c].length - 1];
          if (lastInCol.endMin <= item.startMin) {
            columns[c].push(item);
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([item]);
        }
      }

      const totalColumns = columns.length;

      for (let c = 0; c < totalColumns; c++) {
        for (const item of columns[c]) {
          const topPercent = Math.max(0, ((item.startMin - WINDOW_START_MIN) / WINDOW_DURATION_MIN) * 100);
          const durationMin = Math.max(30, item.endMin - item.startMin);
          const heightPercent = (durationMin / WINDOW_DURATION_MIN) * 100;

          result.push({
            event: item.event,
            topPercent,
            heightPercent,
            columnIndex: c,
            totalColumns
          });
        }
      }
    }

    return result;
  };

  // Detect conflicts (two events on same date, same driver, overlapping time)
  const isEventConflicted = (event: DispatchEvent) => {
    if (event.assignedTo === 'unassigned' || event.status === 'cancelled' || event.status === 'no_pickup_needed') return false;
    return events.some((other) => {
      if (other.id === event.id || other.date !== event.date || other.assignedTo !== event.assignedTo || other.status === 'cancelled' || other.status === 'no_pickup_needed') {
        return false;
      }
      return other.startTime < event.endTime && event.startTime < other.endTime;
    });
  };

  return (
    <div className="visual-calendar-wrapper">
      {/* Top Filter & Blueprint Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
          {/* Kids Filter */}
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

          {/* Caregiver / Driver Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Driver:</span>
            <button
              className={`btn ${selectedCaregiverFilter === 'all' ? 'btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => setSelectedCaregiverFilter('all')}
            >
              All Drivers
            </button>
            {caregivers.map((cg) => (
              <button
                key={cg.id}
                className={`btn ${selectedCaregiverFilter === cg.id ? 'btn-primary' : ''}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => setSelectedCaregiverFilter(cg.id)}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: cg.avatarColor,
                    display: 'inline-block'
                  }}
                />
                {cg.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button 
            className="btn"
            onClick={() => applyWeeklyBlueprint(weekDays[0].dateStr)}
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
            const isToday = d.dateStr === getTodayDateStr();
            const dayHoliday = holidays.find((h) => h.date === d.dateStr);
            const knownHoliday = getHolidayForDate(d.dateStr);

            return (
              <div key={d.dateStr} className={`day-column-header ${isToday ? 'is-today' : ''}`}>
                <div 
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    setViewMode('daily');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="day-name-label">{d.shortName}</span>
                    <span className="day-number-label">{d.dateNum}</span>
                  </div>
                  {knownHoliday && !dayHoliday && isTodayOrUpcoming(d.dateStr) && (
                    <span style={{ fontSize: '0.625rem', color: knownHoliday.category === 'jewish' ? '#7C3AED' : '#00B4D8', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '95px' }}>
                      🌴 {knownHoliday.name.split('—')[0].trim()}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <button
                    type="button"
                    className="nav-btn"
                    style={{ padding: '2px 4px', color: 'var(--primary)' }}
                    onClick={() => openAddEventModal(d.dateStr)}
                    title={`Add new event for ${d.dayName} (${d.dateStr})`}
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    type="button"
                    className="nav-btn"
                    style={{ padding: '2px 4px', color: dayHoliday ? '#059669' : (knownHoliday && isTodayOrUpcoming(d.dateStr)) ? '#7C3AED' : 'var(--text-muted)' }}
                    onClick={() => setHolidayModalTargetDate(d.dateStr)}
                    title={dayHoliday ? `Holiday: ${dayHoliday.name}` : (knownHoliday && isTodayOrUpcoming(d.dateStr)) ? `Suggested: ${knownHoliday.name}` : 'Mark as holiday / day off'}
                  >
                    <Palmtree size={14} />
                  </button>
                </div>
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
                const matchesCaregiver = selectedCaregiverFilter === 'all' || e.assignedTo === selectedCaregiverFilter;
                return matchesDate && matchesChild && matchesCaregiver;
              });

              const dayHoliday = holidays.find((h) => h.date === d.dateStr);
              const positionedEvents = layoutDayEvents(dayEvents);

              return (
                <div 
                  key={d.dateStr} 
                  className="calendar-day-column"
                  onDragOver={(e) => handleColumnDragOver(e, d.dateStr)}
                  onDrop={(e) => handleColumnDrop(e, d.dateStr)}
                >
                  {/* Holiday Overlay Badge if active */}
                  {dayHoliday && (
                    <div 
                      className="column-holiday-banner"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setHolidayModalTargetDate(d.dateStr)}
                      title={`Holiday: ${dayHoliday.name}. Click to edit or click ✕ to restore duties.`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Palmtree size={12} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayHoliday.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          unmarkDayHoliday(d.dateStr);
                        }}
                        title="Remove holiday and restore duties"
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}

                  {/* Drag-and-Drop Time Slot Preview Target */}
                  {dropPreview && dropPreview.dateStr === d.dateStr && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${dropPreview.topPercent}%`,
                        height: `${Math.max(dropPreview.heightPercent, 6.5)}%`,
                        left: '2px',
                        right: '2px',
                        border: '2px dashed var(--primary)',
                        backgroundColor: 'rgba(0, 180, 216, 0.15)',
                        borderRadius: '8px',
                        zIndex: 40,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 180, 216, 0.2)'
                      }}
                    >
                      <span>⏰ {dropPreview.timeStr}</span>
                    </div>
                  )}

                  {/* Render Event Blocks with Non-Overlapping Column Calculations */}
                  {positionedEvents.map(({ event: evt, topPercent, heightPercent, columnIndex, totalColumns }) => {
                    const child = childrenList.find((c) => c.id === evt.childId);
                    const isCancelled = evt.status === 'cancelled';
                    const isNoPickupNeeded = evt.status === 'no_pickup_needed';
                    const hasConflict = isEventConflicted(evt);

                    // Sub-column horizontal placement
                    const colWidthPct = 100 / totalColumns;
                    const colLeftPct = columnIndex * colWidthPct;

                    return (
                      <div
                        key={evt.id}
                        draggable={!isCancelled}
                        onDragStart={(e) => handleDragStart(e, evt)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setReassignModalEvent(evt)}
                        className={`calendar-event-block ${isCancelled ? 'is-cancelled' : ''} ${hasConflict ? 'has-conflict' : ''}`}
                        style={{
                          top: `${topPercent}%`,
                          minHeight: `${Math.max(heightPercent, 6.5)}%`,
                          left: `calc(${colLeftPct}% + 2px)`,
                          width: `calc(${colWidthPct}% - 4px)`,
                          borderLeftColor: isCancelled ? '#059669' : isNoPickupNeeded ? '#8B5CF6' : (child?.color || '#FF5E7E'),
                          backgroundColor: '#FFFFFF',
                          cursor: isCancelled ? 'pointer' : 'grab',
                          opacity: draggingEvent?.id === evt.id ? 0.35 : 1,
                          backgroundImage: isCancelled 
                            ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.06), rgba(5, 150, 105, 0.02))'
                            : isNoPickupNeeded
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))'
                            : `linear-gradient(135deg, ${child?.badgeBg || 'rgba(255, 94, 126, 0.08)'}, rgba(255, 255, 255, 0.95))`
                        }}
                      >
                        {/* Event Header */}
                        <div 
                          className="cal-block-header"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setReassignModalEvent(evt)}
                          title="Click to view details, reassign, or change times"
                        >
                          <span className="cal-block-time">
                            {evt.startTime}
                          </span>

                          {hasConflict && (
                            <span className="conflict-badge" title="Driver Double-Booked!">
                              ⚠️ Clash
                            </span>
                          )}
                          {isCancelled && (
                            <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 800 }}>
                              🌴 OFF
                            </span>
                          )}
                          {isNoPickupNeeded && (
                            <span style={{ fontSize: '0.625rem', color: '#7C3AED', fontWeight: 800 }}>
                              🚫 No Pickup
                            </span>
                          )}
                        </div>

                        {/* Title - Cleanly truncated and styled */}
                        <div 
                          className={`cal-block-title ${isCancelled ? 'strikethrough' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setReassignModalEvent(evt)}
                          title={`${evt.title} — Click to reassign or permanently delete`}
                        >
                          {evt.title}
                        </div>

                        {evt.location && totalColumns === 1 && (
                          <div className="cal-block-location">
                            <MapPin size={10} style={{ flexShrink: 0 }} />
                            <span>{evt.location}</span>
                          </div>
                        )}

                        {/* Caregiver Checkbox Selector Pills directly on block */}
                        {!isCancelled && (
                          <div className="cal-block-caregivers" style={{ flexWrap: totalColumns > 1 ? 'wrap' : 'nowrap' }}>
                            {caregivers.map((cg) => {
                              const isSelected = evt.assignedTo === cg.id && !isNoPickupNeeded;
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
                                    width: totalColumns > 1 ? '20px' : '24px',
                                    height: totalColumns > 1 ? '20px' : '24px',
                                    fontSize: totalColumns > 1 ? '0.6rem' : '0.675rem',
                                    borderColor: isSelected ? cg.avatarColor : 'var(--border)',
                                    background: isSelected ? cg.avatarColor : '#FFFFFF',
                                    color: isSelected ? '#fff' : 'var(--text-muted)'
                                  }}
                                >
                                  {cg.avatarInitials}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              className={`cal-cg-pill ${isNoPickupNeeded ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                markNoPickupNeeded(evt.id, 'No Pickup Needed');
                              }}
                              title="Mark No Pickup Needed"
                              style={{
                                width: totalColumns > 1 ? '20px' : '24px',
                                height: totalColumns > 1 ? '20px' : '24px',
                                fontSize: totalColumns > 1 ? '0.6rem' : '0.675rem',
                                borderColor: isNoPickupNeeded ? '#8B5CF6' : 'var(--border)',
                                background: isNoPickupNeeded ? '#8B5CF6' : '#FFFFFF',
                                color: isNoPickupNeeded ? '#fff' : '#7C3AED'
                              }}
                            >
                              🚫
                            </button>
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
