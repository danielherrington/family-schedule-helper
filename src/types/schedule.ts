export type CaregiverId = string;

export interface Caregiver {
  id: CaregiverId;
  name: string;
  role: string;
  avatarColor: string;
  calendarId: string;
  isManager: boolean;
  avatarInitials: string;
}

export type ChildId = string;

export interface Child {
  id: ChildId;
  name: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  school?: string;
}

export type EventCategory = 'dropoff' | 'pickup' | 'activity' | 'routine';

export interface DispatchEvent {
  id: string;
  title: string;
  childId: ChildId;
  assignedTo: CaregiverId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  category: EventCategory;
  isRecurringMaster: boolean;
  masterSeriesId?: string;
  isException?: boolean;
  notes?: string;
  sourceCalendarId?: string;
  status: 'confirmed' | 'swap_requested' | 'unassigned' | 'cancelled' | 'no_pickup_needed';
  cancellationReason?: string;
  isHoliday?: boolean;
  hasConflict?: boolean;
}

export interface DayHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  childId?: ChildId;
}

export interface EventTemplate {
  id: string;
  title: string;
  childId: ChildId;
  category: EventCategory;
  daysOfWeek: number[]; // 1=Mon ... 7=Sun
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  defaultCaregiverId: CaregiverId;
  notes?: string;
}

export interface ScheduleGap {
  eventId: string;
  title: string;
  childName: string;
  date: string;
  time: string;
  location: string;
  severity: 'high' | 'medium';
}

export interface DriverConflict {
  caregiverId: string;
  caregiverName: string;
  date: string;
  eventIds: string[];
  message: string;
}

export interface CalendarMapping {
  caregiverId: CaregiverId;
  calendarId: string;
  calendarName: string;
  isPrimary: boolean;
}

export interface StagedSyncItem {
  id: string;
  type: 'reassign' | 'no_pickup' | 'create' | 'delete';
  eventId: string;
  eventTitle: string;
  childId: string;
  eventDate: string;
  eventTime: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
  payload: any;
  timestamp: number;
}
