export interface Caregiver {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  calendarId: string;
  isManager: boolean;
  avatarInitials: string;
}

export interface Child {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  school?: string;
}

export interface EventTemplate {
  id: string;
  title: string;
  childId: string;
  category: 'dropoff' | 'pickup' | 'activity' | 'routine';
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  defaultCaregiverId: string;
  notes?: string;
}

export const INITIAL_CAREGIVERS: Caregiver[] = [
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'Parent / Manager',
    avatarColor: '#2563eb', // Blue
    calendarId: 'family_daniel@herrington.ai',
    isManager: true,
    avatarInitials: 'DH'
  },
  {
    id: 'elizabeth',
    name: 'Elizabeth',
    role: 'Parent / Manager',
    avatarColor: '#059669', // Green
    calendarId: 'family_elizabeth@herrington.ai',
    isManager: true,
    avatarInitials: 'EH'
  },
  {
    id: 'lucila',
    name: 'Lucila (Lu)',
    role: 'Nanny',
    avatarColor: '#9333ea', // Purple
    calendarId: 'family_lucila@herrington.ai',
    isManager: false,
    avatarInitials: 'LU'
  },
  {
    id: 'matilde',
    name: 'Matilde (Abu / Eli)',
    role: 'Grandmother',
    avatarColor: '#d97706', // Amber
    calendarId: 'family_matilde@herrington.ai',
    isManager: false,
    avatarInitials: 'AB'
  }
];

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'izzy',
    name: 'Izzy',
    color: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
    school: 'Lehrman Community Day School'
  },
  {
    id: 'vale',
    name: 'Vale',
    color: '#22c55e',
    badgeBg: 'rgba(34, 197, 94, 0.15)',
    badgeBorder: 'rgba(34, 197, 94, 0.4)',
    school: 'Lehrman / North Beach Elementary'
  }
];

export const INITIAL_EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'tpl-vale-drop',
    title: 'Vale School Drop Off',
    childId: 'vale',
    category: 'dropoff',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '08:00',
    endTime: '08:30',
    location: 'Lehrman Community / North Beach',
    defaultCaregiverId: 'daniel'
  },
  {
    id: 'tpl-izzy-drop',
    title: 'Izzy School Drop Off',
    childId: 'izzy',
    category: 'dropoff',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
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
    daysOfWeek: [2, 4], // Tue, Thu
    startTime: '13:50',
    endTime: '14:45',
    location: 'North Beach Center',
    defaultCaregiverId: 'lucila'
  },
  {
    id: 'tpl-vale-pickup',
    title: 'Eli Vale Pick Up',
    childId: 'vale',
    category: 'pickup',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '15:00',
    endTime: '15:30',
    location: 'Lehrman School',
    defaultCaregiverId: 'matilde'
  },
  {
    id: 'tpl-izzy-pickup',
    title: 'Izzy School Pick Up',
    childId: 'izzy',
    category: 'pickup',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
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
    daysOfWeek: [2, 3], // Tue, Wed
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
    daysOfWeek: [2], // Tue
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
    daysOfWeek: [1, 4], // Mon, Thu
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
    daysOfWeek: [5], // Fri
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
    daysOfWeek: [6], // Sat
    startTime: '09:00',
    endTime: '10:00',
    location: 'Miami Ballet Studio',
    defaultCaregiverId: 'elizabeth'
  }
];

export function getWeekSchedule(baseDateStr: string = '2026-09-02') {
  return [
    // Monday
    {
      id: 'evt-mon-drop-1',
      title: 'Vale School Drop Off',
      childId: 'vale',
      assignedTo: 'daniel',
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
      assignedTo: 'lucila',
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

    // Tuesday (Today)
    {
      id: 'evt-tue-drop-1',
      title: 'Vale School Drop Off',
      childId: 'vale',
      assignedTo: 'lucila',
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
      assignedTo: 'daniel',
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
      title: 'Eli Vale Pick Up',
      childId: 'vale',
      assignedTo: 'matilde',
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
      id: 'evt-wed-drop-2',
      title: 'Izzy School Drop Off',
      childId: 'izzy',
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
      title: 'Eli Vale Pick Up',
      childId: 'vale',
      assignedTo: 'matilde',
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
      assignedTo: 'lucila',
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
      assignedTo: 'elizabeth',
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
      assignedTo: 'unassigned', // Intentional unassigned gap for test
      date: '2026-09-03',
      startTime: '15:15',
      endTime: '15:45',
      location: 'Lehrman School',
      category: 'pickup',
      isRecurringMaster: false,
      status: 'unassigned',
      notes: 'Matilde has doctor appointment, need someone to cover Vale pickup!'
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
      id: 'evt-fri-drop-2',
      title: 'Izzy School Drop Off',
      childId: 'izzy',
      assignedTo: 'elizabeth',
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
}
