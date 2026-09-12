import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { format } from 'date-fns';
import { getHolidayForDate } from '../utils/holidayEngine';
import { ChevronLeft, ChevronRight, Palmtree, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isTodayOrUpcoming } from '../utils/dateUtils';

export const WeekStripNavigator: React.FC = () => {
  const { selectedDate, setSelectedDate, currentWeekDays, events, holidays, changeDateByDays } = useSchedule();

  const weekDays = currentWeekDays.map((d) => ({
    dayName: format(d, 'EEE'),
    dateNum: format(d, 'd'),
    fullDate: format(d, 'yyyy-MM-dd')
  }));

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
          const hasGap = isTodayOrUpcoming(d.fullDate) && dayEvents.some((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled');
          const isMarkedHoliday = holidays.some((h) => h.date === d.fullDate) || (dayEvents.length > 0 && dayEvents.every((e) => e.status === 'cancelled'));
          const knownHoliday = getHolidayForDate(d.fullDate);
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
                {isMarkedHoliday ? (
                  <span className="mini-status-icon holiday" title="Holiday / Day Off Marked">
                    <Palmtree size={11} color="#10b981" />
                  </span>
                ) : (knownHoliday && isTodayOrUpcoming(d.fullDate)) ? (
                  <span className="mini-status-icon" title={`Upcoming Holiday: ${knownHoliday.name}`}>
                    <Palmtree size={11} color={knownHoliday.category === 'jewish' ? '#c4b5fd' : '#93c5fd'} />
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
