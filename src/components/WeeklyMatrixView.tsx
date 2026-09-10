import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { EventCard } from './EventCard';
import { HolidayModal } from './HolidayModal';
import { 
  Filter, 
  Sparkles, 
  Palmtree, 
  Sunrise, 
  Sun, 
  Moon, 
  Plus,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { isTodayOrUpcoming } from '../utils/dateUtils';
import { getEventShift, ShiftCategory, SHIFT_CONFIGS } from '../utils/shiftUtils';

export const WeeklyMatrixView: React.FC = () => {
  const { 
    events, 
    currentWeekDays, 
    setSelectedDate, 
    setViewMode, 
    applyWeeklyBlueprint, 
    children: childrenList, 
    holidays,
    openAddEventModal
  } = useSchedule();

  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ShiftCategory>('all');
  const [holidayModalTargetDate, setHolidayModalTargetDate] = useState<string | null>(null);

  const weekDays = currentWeekDays.map((d) => ({
    name: format(d, 'EEE'),
    fullName: format(d, 'EEEE'),
    dateStr: format(d, 'yyyy-MM-dd')
  }));

  const activeMondayStr = weekDays.length > 0 ? weekDays[0].dateStr : '2026-08-31';

  return (
    <div>
      {/* Header Controls: Filters & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Child & Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Kids Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Filter size={15} color="var(--text-muted)" />
            <button
              className={`btn ${selectedChildFilter === 'all' ? 'btn-primary' : ''}`}
              style={{ padding: '5px 12px', fontSize: '0.82rem' }}
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
                    padding: '5px 12px',
                    fontSize: '0.82rem',
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

          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} className="hide-mobile" />

          {/* Shift / Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${selectedCategoryFilter === 'all' ? 'btn-primary' : ''}`}
              style={{ padding: '5px 12px', fontSize: '0.82rem' }}
              onClick={() => setSelectedCategoryFilter('all')}
            >
              All Shifts
            </button>
            <button
              className="btn"
              style={{
                padding: '5px 12px',
                fontSize: '0.82rem',
                borderColor: selectedCategoryFilter === 'dropoff' ? '#f59e0b' : undefined,
                background: selectedCategoryFilter === 'dropoff' ? 'rgba(245, 158, 11, 0.15)' : undefined,
                color: selectedCategoryFilter === 'dropoff' ? '#b45309' : undefined,
                fontWeight: selectedCategoryFilter === 'dropoff' ? 700 : undefined
              }}
              onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === 'dropoff' ? 'all' : 'dropoff')}
            >
              <Sunrise size={13} style={{ marginRight: '4px', verticalAlign: '-1px', color: '#f59e0b' }} />
              <span>Morning Runs</span>
            </button>
            <button
              className="btn"
              style={{
                padding: '5px 12px',
                fontSize: '0.82rem',
                borderColor: selectedCategoryFilter === 'pickup' ? '#3b82f6' : undefined,
                background: selectedCategoryFilter === 'pickup' ? 'rgba(59, 130, 246, 0.15)' : undefined,
                color: selectedCategoryFilter === 'pickup' ? '#1d4ed8' : undefined,
                fontWeight: selectedCategoryFilter === 'pickup' ? 700 : undefined
              }}
              onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === 'pickup' ? 'all' : 'pickup')}
            >
              <Sun size={13} style={{ marginRight: '4px', verticalAlign: '-1px', color: '#3b82f6' }} />
              <span>Pickups</span>
            </button>
            <button
              className="btn"
              style={{
                padding: '5px 12px',
                fontSize: '0.82rem',
                borderColor: selectedCategoryFilter === 'activity' ? '#a855f7' : undefined,
                background: selectedCategoryFilter === 'activity' ? 'rgba(168, 85, 247, 0.15)' : undefined,
                color: selectedCategoryFilter === 'activity' ? '#7e22ce' : undefined,
                fontWeight: selectedCategoryFilter === 'activity' ? 700 : undefined
              }}
              onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === 'activity' ? 'all' : 'activity')}
            >
              <Moon size={13} style={{ marginRight: '4px', verticalAlign: '-1px', color: '#a855f7' }} />
              <span>Evening Routines</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
            onClick={() => openAddEventModal(activeMondayStr)}
            title="Schedule a new pickup, drop-off, or activity event"
          >
            <Plus size={15} />
            <span>Add Event</span>
          </button>
          <button 
            className="btn"
            onClick={() => applyWeeklyBlueprint(activeMondayStr)}
            title={`Refresh active week (${activeMondayStr}) from routine blueprint`}
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

          // Categorize into the 3 core logistics shifts
          const dropoffs = dayEvents.filter((e) => getEventShift(e) === 'dropoff');
          const pickups = dayEvents.filter((e) => getEventShift(e) === 'pickup');
          const activities = dayEvents.filter((e) => getEventShift(e) === 'activity');

          const unassignedCount = dayEvents.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').length;
          const dayHoliday = holidays.find((h) => h.date === d.dateStr);

          // Shift display visibility based on category filter
          const showDropoffs = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'dropoff') && dropoffs.length > 0;
          const showPickups = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'pickup') && pickups.length > 0;
          const showActivities = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'activity') && activities.length > 0;

          const hasVisibleCategories = showDropoffs || showPickups || showActivities;

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
                  title="Click to switch to Daily Shifts view for this day"
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="weekly-day-title">{d.fullName}</span>
                    <span className="weekly-day-sub">{d.dateStr}</span>
                  </div>
                  
                  {/* Mini Shift Indicator Pills */}
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      {dropoffs.length > 0 && (
                        <span className="shift-mini-pill amber" title={`${dropoffs.length} morning run/routine(s)`}>
                          <Sunrise size={11} /> {dropoffs.length}
                        </span>
                      )}
                      {pickups.length > 0 && (
                        <span className="shift-mini-pill blue" title={`${pickups.length} school pickup(s)`}>
                          <Sun size={11} /> {pickups.length}
                        </span>
                      )}
                      {activities.length > 0 && (
                        <span className="shift-mini-pill purple" title={`${activities.length} activity/evening routine(s)`}>
                          <Moon size={11} /> {activities.length}
                        </span>
                      )}
                    </div>
                  )}
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

                  {unassignedCount > 0 && isTodayOrUpcoming(d.dateStr) ? (
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

              {/* Day Events Body with Categorized Shifts */}
              <div className="weekly-day-body">
                {dayEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <Calendar size={28} color="var(--text-dim)" style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <div>No logistics scheduled</div>
                    <button
                      className="btn"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', marginTop: '8px' }}
                      onClick={() => openAddEventModal(d.dateStr)}
                    >
                      <Plus size={12} />
                      <span>Add Event</span>
                    </button>
                  </div>
                ) : !hasVisibleCategories ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.82rem', background: '#F8FAFC', borderRadius: '10px' }}>
                    No {selectedCategoryFilter === 'dropoff' ? 'morning drop-offs' : selectedCategoryFilter === 'pickup' ? 'school pickups' : 'activities'} on {d.name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      ({dayEvents.length} other {dayEvents.length === 1 ? 'duty' : 'duties'} scheduled)
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SHIFT 1: MORNING RUNS & ROUTINES */}
                    {showDropoffs && (
                      <div className="matrix-shift-section matrix-shift-dropoff">
                        <div className="matrix-shift-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sunrise size={14} color="#f59e0b" />
                            <span className="matrix-shift-title">Morning Runs & Routines</span>
                          </div>
                          <span className="matrix-shift-badge amber">
                            {dropoffs.length} {dropoffs.length === 1 ? 'event' : 'events'}
                          </span>
                        </div>
                        <div className="matrix-shift-cards">
                          {dropoffs.map((evt) => (
                            <EventCard key={evt.id} event={evt} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SHIFT 2: SCHOOL PICKUPS & DISMISSALS */}
                    {showPickups && (
                      <div className="matrix-shift-section matrix-shift-pickup">
                        <div className="matrix-shift-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sun size={14} color="#3b82f6" />
                            <span className="matrix-shift-title">School Pickups</span>
                          </div>
                          <span className="matrix-shift-badge blue">
                            {pickups.length} {pickups.length === 1 ? 'pickup' : 'pickups'}
                          </span>
                        </div>
                        <div className="matrix-shift-cards">
                          {pickups.map((evt) => (
                            <EventCard key={evt.id} event={evt} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SHIFT 3: AFTER-SCHOOL CLASSES & EVENING ROUTINES */}
                    {showActivities && (
                      <div className="matrix-shift-section matrix-shift-activity">
                        <div className="matrix-shift-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Moon size={14} color="#a855f7" />
                            <span className="matrix-shift-title">Classes & Evening Routines</span>
                          </div>
                          <span className="matrix-shift-badge purple">
                            {activities.length} {activities.length === 1 ? 'event' : 'events'}
                          </span>
                        </div>
                        <div className="matrix-shift-cards">
                          {activities.map((evt) => (
                            <EventCard key={evt.id} event={evt} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
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
