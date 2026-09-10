import { DispatchEvent } from '../types/schedule';

export type ShiftCategory = 'dropoff' | 'pickup' | 'activity';

export interface ShiftInfo {
  type: ShiftCategory;
  title: string;
  shortTitle: string;
  timeRange: string;
  iconColor: string;
  badgeClass: string;
}

export const SHIFT_CONFIGS: Record<ShiftCategory, ShiftInfo> = {
  dropoff: {
    type: 'dropoff',
    title: 'Morning Runs & Routines',
    shortTitle: 'Morning',
    timeRange: '7:00 AM – 9:00 AM',
    iconColor: '#f59e0b',
    badgeClass: 'amber'
  },
  pickup: {
    type: 'pickup',
    title: 'School Dismissals & Pickups',
    shortTitle: 'Pickups',
    timeRange: '1:00 PM – 3:30 PM',
    iconColor: '#3b82f6',
    badgeClass: 'blue'
  },
  activity: {
    type: 'activity',
    title: 'Classes, Activities & Evening',
    shortTitle: 'Activities & Evening',
    timeRange: '4:00 PM – 7:30 PM',
    iconColor: '#a855f7',
    badgeClass: 'purple'
  }
};

/**
 * Categorizes an event into dropoff, pickup, or activity using:
 * 1. Explicit event category ('dropoff' | 'pickup' | 'activity')
 * 2. Title keywords ('drop', 'pick', 'walk', 'chess', 'gym', etc.)
 * 3. Chronological fallback (< 12:00 = dropoff, 12:00-15:30 = pickup, > 15:30 = activity)
 */
export function getEventShift(evt: DispatchEvent): ShiftCategory {
  // 1. Explicit category takes precedence if dropoff or pickup or activity
  if (evt.category === 'dropoff') return 'dropoff';
  if (evt.category === 'pickup') return 'pickup';
  if (evt.category === 'activity') return 'activity';

  // 2. Keyword check on title
  const title = (evt.title || '').toLowerCase();
  if (title.includes('drop') || title.includes('morning') || (title.includes('walk') && evt.startTime < '12:00')) return 'dropoff';
  if (title.includes('pick') || title.includes('dismissal') || title.includes('aftercare')) return 'pickup';
  if (
    title.includes('chess') ||
    title.includes('gym') ||
    title.includes('swim') ||
    title.includes('soccer') ||
    title.includes('class') ||
    title.includes('lesson') ||
    title.includes('practice') ||
    title.includes('tutor') ||
    title.includes('club') ||
    title.includes('evening') ||
    (title.includes('walk') && evt.startTime >= '16:00')
  ) {
    return 'activity';
  }

  // 3. Fallback based on start time
  if (evt.startTime < '12:00') return 'dropoff';
  if (evt.startTime <= '15:30') return 'pickup';
  return 'activity';
}
