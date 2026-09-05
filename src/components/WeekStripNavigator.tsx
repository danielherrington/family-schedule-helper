import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { ChevronLeft, ChevronRight, Palmtree, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WeekStripNavigator: React.FC = () => {
  const { selectedDate, setSelectedDate, events, holidays, changeDateByDays } = useSchedule();

  const weekDays = [
    { dayName: 'Mon', dateNum: '31', fullDate: '2026-08-31' },
    { dayName: 'Tue', dateNum: '01', fullDate: '2026-09-01' },
    { dayName: 'Wed', dateNum: '02', fullDate: '2026-09-02' },
    { dayName: 'Thu', dateNum: '03', fullDate: '2026-09-03' },
    { dayName: 'Fri', dateNum: '04', fullDate: '2026-09-04' },
    { dayName: 'Sat', dateNum: '05', fullDate: '2026-09-05' },
    { dayName: 'Sun', dateNum: '06', fullDate: '2026-09-06' }
  ];

  return (
    <div className="week-strip-container">
      <button 
        className="nav-btn"
        onClick={() => changeDateByDays(-7)}
        title="Previous Week"
        style={{ height: '52px', padding: '0 8px' }}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="week-strip-days">
        {weekDays.map((d) => {
          const isSelected = selectedDate === d.fullDate;
          const dayEvents = events.filter((e) => e.date === d.fullDate);
          const hasGap = dayEvents.some((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled');
          const isHoliday = holidays.some((h) => h.date === d.fullDate) || (dayEvents.length > 0 && dayEvents.every((e) => e.status === 'cancelled'));
          const activeCount = dayEvents.filter((e) => e.status !== 'cancelled').length;

          return (
            <button
              key={d.fullDate}
              type="button"
              className={`week-day-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(d.fullDate)}
            >
              <span className="week-day-name">{d.dayName}</span>
              <span className="week-day-num">{d.dateNum}</span>

              {/* Status Dot / Badge */}
              <div className="week-day-status">
                {isHoliday ? (
                  <span className="mini-status-icon holiday" title="Holiday / Day Off">
                    <Palmtree size={11} />
                  </span>
                ) : hasGap ? (
                  <span className="mini-status-dot gap" title="Unassigned Driver Gap" />
                ) : activeCount > 0 ? (
                  <span className="mini-status-dot covered" title={`${activeCount} duties covered`} />
                ) : (
                  <span className="mini-status-dot empty" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button 
        className="nav-btn"
        onClick={() => changeDateByDays(7)}
        title="Next Week"
        style={{ height: '52px', padding: '0 8px' }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
