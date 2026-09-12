import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { EventCard } from './EventCard';
import { HolidayModal } from './HolidayModal';
import { 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Palmtree, 
  Sunrise, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { getHolidayForDate } from '../utils/holidayEngine';
import { isTodayOrUpcoming } from '../utils/dateUtils';
import { getEventShift } from '../utils/shiftUtils';
import { DachshundIcon } from './ui/DachshundIcon';

export const DailyDispatchBoard: React.FC = () => {
  const { 
    events, 
    selectedDate, 
    children: childrenList, 
    holidays, 
    caregivers, 
    setIsSetupOpen, 
    setActiveSetupTab,
    openAddEventModal
  } = useSchedule();
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState<boolean>(false);

  const dayEvents = events
    .filter((e) => {
      const matchesDate = e.date === selectedDate;
      const matchesChild = selectedChildFilter === 'all' || e.childId === selectedChildFilter || e.childId === 'all';
      return matchesDate && matchesChild;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Detect Driver Double-Booking Conflicts
  const conflicts: { caregiverName: string; events: string[]; time: string }[] = [];
  caregivers.forEach((cg) => {
    const cgEvents = dayEvents.filter((e) => e.assignedTo === cg.id && e.status !== 'cancelled' && e.status !== 'no_pickup_needed');
    for (let i = 0; i < cgEvents.length; i++) {
      for (let j = i + 1; j < cgEvents.length; j++) {
        const e1 = cgEvents[i];
        const e2 = cgEvents[j];
        if (e1.startTime < e2.endTime && e2.startTime < e1.endTime) {
          conflicts.push({
            caregiverName: cg.name,
            events: [e1.title, e2.title],
            time: `${e1.startTime} - ${e1.endTime}`
          });
        }
      }
    }
  });

  // Group events into 3 Family Shifts
  const morningRuns = dayEvents.filter((e) => getEventShift(e) === 'dropoff');
  const middayPickups = dayEvents.filter((e) => getEventShift(e) === 'pickup');
  const afternoonActivities = dayEvents.filter((e) => getEventShift(e) === 'activity');

  const totalAssigned = dayEvents.filter((e) => e.assignedTo !== 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').length;
  const totalUnassigned = dayEvents.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').length;
  const totalNoPickup = dayEvents.filter((e) => e.status === 'no_pickup_needed').length;
  const totalCancelled = dayEvents.filter((e) => e.status === 'cancelled').length;

  const activeHoliday = holidays.find((h) => h.date === selectedDate);
  const detectedHoliday = isTodayOrUpcoming(selectedDate) ? getHolidayForDate(selectedDate) : null;

  return (
    <div>
      {/* Day-level Holiday Banner if active */}
      {activeHoliday && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palmtree size={22} color="#10b981" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                🌴 Day Off / Holiday: {activeHoliday.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                School drop-offs & pick-ups cancelled for this day. Recurring schedule remains active for next week.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Double-Booking Conflict Alert if any */}
      {conflicts.length > 0 && (
        <div 
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ef4444' }}>
              ⚠️ Driver Double-Booking Conflict Detected!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
              <strong>{conflicts[0].caregiverName}</strong> is assigned to conflicting events at {conflicts[0].time}: <em>"{conflicts[0].events.join('" and "')}"</em>. Reassign one driver to resolve.
            </div>
          </div>
        </div>
      )}

      {/* Top Filter & Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <button
            className={`btn ${selectedChildFilter === 'all' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setSelectedChildFilter('all')}
          >
            All Kids ({events.filter((e) => e.date === selectedDate).length})
          </button>
          {childrenList.map((ch) => {
            const count = events.filter((e) => e.date === selectedDate && (e.childId === ch.id || e.childId === 'all')).length;
            const isSelected = selectedChildFilter === ch.id;
            const isMoe = ch.id === 'moe';
            return (
              <button
                key={ch.id}
                className={`btn ${isSelected ? 'btn-primary' : ''}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderColor: isSelected ? ch.color : isMoe ? 'rgba(255, 42, 133, 0.45)' : undefined,
                  background: isSelected ? ch.color : isMoe ? 'rgba(255, 42, 133, 0.08)' : undefined,
                  color: isSelected ? '#fff' : isMoe ? '#FF2A85' : undefined,
                  boxShadow: isMoe && isSelected ? '0 0 12px rgba(255, 42, 133, 0.45)' : undefined,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => setSelectedChildFilter(ch.id)}
              >
                {isMoe && <DachshundIcon size={14} color={isSelected ? '#fff' : '#FF2A85'} />}
                <span>{ch.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
            onClick={() => openAddEventModal(selectedDate)}
            title="Add pickup, drop-off, or activity for this day"
          >
            <Plus size={15} />
            <span>Add Event</span>
          </button>

          <button
            className="btn"
            style={{
              borderColor: detectedHoliday ? 'rgba(139, 92, 246, 0.5)' : 'rgba(16, 185, 129, 0.4)',
              color: detectedHoliday ? '#c4b5fd' : '#10b981',
              background: detectedHoliday ? 'rgba(139, 92, 246, 0.12)' : undefined
            }}
            onClick={() => setIsHolidayModalOpen(true)}
            title={detectedHoliday ? `Recognized: ${detectedHoliday.name}` : "Mark this day as a holiday or no classes"}
          >
            <Palmtree size={15} />
            <span>{detectedHoliday ? `Mark ${detectedHoliday.name.split('—')[0].trim()}` : 'Mark Holiday'}</span>
          </button>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.85rem' }}>
            <CheckCircle2 size={15} />
            <span><strong>{totalAssigned}</strong> Active</span>
          </span>
          {totalUnassigned > 0 && isTodayOrUpcoming(selectedDate) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: 700, fontSize: '0.85rem' }}>
              <AlertTriangle size={15} />
              <span><strong>{totalUnassigned}</strong> Unassigned</span>
            </span>
          )}
          {totalNoPickup > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#7C3AED', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>🚫 <strong>{totalNoPickup}</strong> No Pickup</span>
            </span>
          )}
          {totalCancelled > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Palmtree size={15} />
              <span><strong>{totalCancelled}</strong> Off</span>
            </span>
          )}
        </div>
      </div>

      {/* SHIFT-BASED CHRONOLOGICAL LOGISTICS */}
      {dayEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <Calendar size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No logistics scheduled for this day</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            You can generate the routine schedule from your weekly blueprint.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setActiveSetupTab('blueprint');
              setIsSetupOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Open Event Blueprint</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SHIFT 1: MORNING RUNS */}
          {morningRuns.length > 0 && (
            <div className="shift-group-container">
              <div className="shift-group-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sunrise size={18} color="#f59e0b" />
                  <span className="shift-title">Morning Runs & Routines (7:00 AM – 9:00 AM)</span>
                </div>
                <span className="count-badge">{morningRuns.length} {morningRuns.length === 1 ? 'duty' : 'duties'}</span>
              </div>
              <div className="shift-card-grid">
                {morningRuns.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </div>
          )}

          {/* SHIFT 2: MIDDAY PICKUPS */}
          {middayPickups.length > 0 && (
            <div className="shift-group-container">
              <div className="shift-group-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sun size={18} color="#3b82f6" />
                  <span className="shift-title">School Dismissals & Pickups (1:00 PM – 3:30 PM)</span>
                </div>
                <span className="count-badge">{middayPickups.length} {middayPickups.length === 1 ? 'pickup' : 'pickups'}</span>
              </div>
              <div className="shift-card-grid">
                {middayPickups.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </div>
          )}

          {/* SHIFT 3: AFTER-SCHOOL ACTIVITIES & EVENING */}
          {afternoonActivities.length > 0 && (
            <div className="shift-group-container">
              <div className="shift-group-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Moon size={18} color="#a855f7" />
                  <span className="shift-title">Classes, Activities & Evening Routines (4:00 PM – 7:30 PM)</span>
                </div>
                <span className="count-badge">{afternoonActivities.length} {afternoonActivities.length === 1 ? 'duty' : 'duties'}</span>
              </div>
              <div className="shift-card-grid">
                {afternoonActivities.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Holiday Modal */}
      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        targetDateStr={selectedDate}
      />
    </div>
  );
};
