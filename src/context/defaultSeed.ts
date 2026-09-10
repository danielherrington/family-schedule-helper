import { Caregiver, Child, EventTemplate, DispatchEvent } from '../types/schedule';

export const DEFAULT_CAREGIVERS: Caregiver[] = [
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'Parent / Manager',
    avatarColor: '#008B8B', // Ocean Teal
    calendarId: 'Family - Daniel',
    isManager: true,
    avatarInitials: 'DH'
  },
  {
    id: 'lucila',
    name: 'Lucila',
    role: 'Parent / Manager',
    avatarColor: '#FF5E7E', // Miami Flamingo Coral
    calendarId: 'Family - Lucila',
    isManager: true,
    avatarInitials: 'LU'
  },
  {
    id: 'elizabeth',
    name: 'Elizabeth',
    role: 'Caregiver',
    avatarColor: '#00B4D8', // Biscayne Cyan
    calendarId: 'Family - Elizabeth',
    isManager: false,
    avatarInitials: 'EH'
  },
  {
    id: 'matilda',
    name: 'Matilda (Abu)',
    role: 'Caregiver / Grandmother',
    avatarColor: '#FF9F1C', // Sunset Gold
    calendarId: 'Family - Matilde',
    isManager: false,
    avatarInitials: 'MA'
  }
];

export const DEFAULT_CHILDREN: Child[] = [
  {
    id: 'izzy',
    name: 'Izzy',
    color: '#7928CA', // Art Deco Violet
    badgeBg: 'rgba(121, 40, 202, 0.12)',
    badgeBorder: 'rgba(121, 40, 202, 0.35)',
    school: 'Lehrman Community Day School'
  },
  {
    id: 'vale',
    name: 'Vale',
    color: '#059669', // South Beach Emerald
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    badgeBorder: 'rgba(5, 150, 105, 0.35)',
    school: 'Lehrman / North Beach Elementary'
  },
  {
    id: 'moe',
    name: 'Moe 🐕',
    color: '#D97706', // Golden Amber
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    badgeBorder: 'rgba(217, 119, 6, 0.35)',
    school: 'Family Dog'
  }
];

export const DEFAULT_TEMPLATES: EventTemplate[] = [
  {
    id: 'tpl-vale-drop-tue-thu',
    title: 'Vale School Drop Off (Tue, Thu)',
    childId: 'vale',
    category: 'dropoff',
    daysOfWeek: [2, 4],
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community / North Beach',
    defaultCaregiverId: 'daniel'
  },
  {
    id: 'tpl-vale-drop-mon-wed-fri',
    title: 'Vale School Drop Off (Mon, Wed, Fri)',
    childId: 'vale',
    category: 'dropoff',
    daysOfWeek: [1, 3, 5],
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community / North Beach',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-izzy-drop-mon-wed-fri',
    title: 'Izzy School Drop Off (Mon, Wed, Fri)',
    childId: 'izzy',
    category: 'dropoff',
    daysOfWeek: [1, 3, 5],
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community Day School',
    defaultCaregiverId: 'daniel'
  },
  {
    id: 'tpl-izzy-drop-tue-thu',
    title: 'Izzy School Drop Off (Tue, Thu)',
    childId: 'izzy',
    category: 'dropoff',
    daysOfWeek: [2, 4],
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community Day School',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-izzy-chess',
    title: 'Izzy Chess Club',
    childId: 'izzy',
    category: 'activity',
    daysOfWeek: [2, 4],
    startTime: '13:50',
    endTime: '14:45',
    location: 'North Beach Center',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-vale-pickup',
    title: 'Abu Pick Up Vale',
    childId: 'vale',
    category: 'pickup',
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    defaultCaregiverId: 'matilda'
  },
  {
    id: 'tpl-izzy-pickup',
    title: 'Izzy School Pick Up',
    childId: 'izzy',
    category: 'pickup',
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-izzy-gym',
    title: 'Izzy Gymnastics',
    childId: 'izzy',
    category: 'activity',
    daysOfWeek: [2, 3],
    startTime: '16:00',
    endTime: '17:00',
    location: 'Miami Gymnastics Academy',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-vale-dance',
    title: 'Vale Dance Class',
    childId: 'vale',
    category: 'activity',
    daysOfWeek: [2],
    startTime: '16:00',
    endTime: '16:45',
    location: 'La Dance Studio',
    defaultCaregiverId: 'elizabeth'
  },
  {
    id: 'tpl-izzy-hiphop',
    title: 'Izzy Hip Hop Dance',
    childId: 'izzy',
    category: 'activity',
    daysOfWeek: [1, 4],
    startTime: '17:15',
    endTime: '18:15',
    location: 'Miami Dance Studio',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-izzy-tennis',
    title: 'Izzy Tennis Practice',
    childId: 'izzy',
    category: 'activity',
    daysOfWeek: [5],
    startTime: '17:00',
    endTime: '18:00',
    location: 'Flamingo Park Courts',
    defaultCaregiverId: 'daniel'
  },
  {
    id: 'tpl-vale-ballet',
    title: 'Vale Ballet & Dance',
    childId: 'vale',
    category: 'activity',
    daysOfWeek: [6],
    startTime: '09:00',
    endTime: '10:00',
    location: 'Miami Ballet Studio',
    defaultCaregiverId: 'elizabeth'
  },
  {
    id: 'tpl-moe-morning-walk',
    title: 'Walk Moe 🐕 (Morning)',
    childId: 'moe',
    category: 'routine',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    startTime: '07:15',
    endTime: '07:45',
    location: 'Neighborhood Walk',
    defaultCaregiverId: 'daniel'
  },
  {
    id: 'tpl-moe-evening-walk',
    title: 'Walk Moe 🐕 (Evening)',
    childId: 'moe',
    category: 'routine',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    startTime: '18:30',
    endTime: '19:00',
    location: 'Neighborhood Walk',
    defaultCaregiverId: 'elizabeth'
  }
];

export const DEFAULT_WEEK_EVENTS: DispatchEvent[] = [
  // Monday
  {
    id: 'evt-mon-drop-1',
    title: 'Vale School Drop Off',
    childId: 'vale',
    assignedTo: 'lucila',
    date: '2026-08-31',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community Day School',
    category: 'dropoff',
    isRecurringMaster: true,
    masterSeriesId: 'series-vale-drop',
    status: 'confirmed'
  },
  {
    id: 'evt-mon-drop-2',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    assignedTo: 'daniel',
    date: '2026-08-31',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community Day School',
    category: 'dropoff',
    isRecurringMaster: true,
    masterSeriesId: 'series-izzy-drop',
    status: 'confirmed'
  },
  {
    id: 'evt-mon-pick-1',
    title: 'Izzy School Pick Up',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-08-31',
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: true,
    masterSeriesId: 'series-izzy-pick',
    status: 'confirmed'
  },
  {
    id: 'evt-mon-act-1',
    title: 'Izzy Hip Hop Class',
    childId: 'izzy',
    assignedTo: 'elizabeth',
    date: '2026-08-31',
    startTime: '16:30',
    endTime: '17:15',
    location: 'Miami Dance Studio',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },

  // Tuesday
  {
    id: 'evt-tue-drop-1',
    title: 'Vale School Drop Off',
    childId: 'vale',
    assignedTo: 'daniel',
    date: '2026-09-01',
    startTime: '08:00',
    endTime: '08:30',
    location: 'North Beach Elementary',
    category: 'dropoff',
    isRecurringMaster: true,
    masterSeriesId: 'series-vale-drop',
    status: 'confirmed'
  },
  {
    id: 'evt-tue-drop-2',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-01',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman School',
    category: 'dropoff',
    isRecurringMaster: true,
    masterSeriesId: 'series-izzy-drop',
    status: 'confirmed'
  },
  {
    id: 'evt-tue-chess',
    title: 'Izzy Chess Club',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-01',
    startTime: '13:50',
    endTime: '14:45',
    location: 'North Beach Center',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-tue-pick-1',
    title: 'Abu Pick Up Vale',
    childId: 'vale',
    assignedTo: 'matilda',
    date: '2026-09-01',
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-tue-gym',
    title: 'Izzy Gymnastics',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-01',
    startTime: '16:00',
    endTime: '17:00',
    location: 'Miami Gymnastics Academy',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-tue-dance',
    title: 'Vale Dance Class',
    childId: 'vale',
    assignedTo: 'elizabeth',
    date: '2026-09-01',
    startTime: '16:00',
    endTime: '16:45',
    location: 'La Dance Studio',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },

  // Wednesday
  {
    id: 'evt-wed-drop-1',
    title: 'Vale School Drop Off',
    childId: 'vale',
    assignedTo: 'lucila',
    date: '2026-09-02',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-wed-drop-2',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    assignedTo: 'daniel',
    date: '2026-09-02',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-wed-pick-1',
    title: 'Izzy School Pick Up',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-02',
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-wed-pick-2',
    title: 'Abu Pick Up Vale',
    childId: 'vale',
    assignedTo: 'matilda',
    date: '2026-09-02',
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-wed-gym',
    title: 'Izzy Gymnastics',
    childId: 'izzy',
    assignedTo: 'daniel',
    date: '2026-09-02',
    startTime: '16:00',
    endTime: '17:30',
    location: 'Miami Gymnastics',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },

  // Thursday
  {
    id: 'evt-thu-drop-1',
    title: 'Vale School Drop Off',
    childId: 'vale',
    assignedTo: 'daniel',
    date: '2026-09-03',
    startTime: '08:00',
    endTime: '08:30',
    location: 'North Beach',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-thu-drop-2',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-03',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-thu-chess',
    title: 'Izzy Puzzle & Chess',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-03',
    startTime: '13:50',
    endTime: '14:45',
    location: 'North Beach',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-thu-pick-gap',
    title: 'Abu Pick Up Vale',
    childId: 'vale',
    assignedTo: 'unassigned',
    date: '2026-09-03',
    startTime: '15:15',
    endTime: '15:45',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: false,
    status: 'unassigned',
    notes: 'Matilda has appointment, need someone to cover Vale pickup!'
  },
  {
    id: 'evt-thu-hiphop',
    title: 'Izzy Hip Hop Dance',
    childId: 'izzy',
    assignedTo: 'lucila',
    date: '2026-09-03',
    startTime: '17:15',
    endTime: '18:15',
    location: 'Miami Dance Studio',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },

  // Friday
  {
    id: 'evt-fri-drop-1',
    title: 'Vale School Drop Off',
    childId: 'vale',
    assignedTo: 'lucila',
    date: '2026-09-04',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-fri-drop-2',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    assignedTo: 'daniel',
    date: '2026-09-04',
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community',
    category: 'dropoff',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-fri-pick-1',
    title: 'Vale School Pick Up (Early)',
    childId: 'vale',
    assignedTo: 'lucila',
    date: '2026-09-04',
    startTime: '13:00',
    endTime: '13:30',
    location: 'Lehrman School',
    category: 'pickup',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-fri-tennis',
    title: 'Izzy Tennis Practice',
    childId: 'izzy',
    assignedTo: 'daniel',
    date: '2026-09-04',
    startTime: '17:00',
    endTime: '18:00',
    location: 'Flamingo Park Courts',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },

  // Saturday
  {
    id: 'evt-sat-ballet',
    title: 'Vale Ballet & Dance',
    childId: 'vale',
    assignedTo: 'elizabeth',
    date: '2026-09-05',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Miami Ballet Studio',
    category: 'activity',
    isRecurringMaster: true,
    status: 'confirmed'
  },
  {
    id: 'evt-sat-party',
    title: 'Gray Birthday Party',
    childId: 'all',
    assignedTo: 'daniel',
    date: '2026-09-05',
    startTime: '10:00',
    endTime: '12:00',
    location: 'SkyZone Trampoline',
    category: 'activity',
    isRecurringMaster: false,
    status: 'confirmed'
  }
];
