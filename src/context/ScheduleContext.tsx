import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { Caregiver, Child, DispatchEvent, ScheduleGap, CaregiverId, EventTemplate, DayHoliday } from '../types/schedule';
import { 
  DEFAULT_CAREGIVERS, 
  DEFAULT_CHILDREN, 
  DEFAULT_TEMPLATES, 
  DEFAULT_WEEK_EVENTS 
} from './defaultSeed';
import { GoogleCalendarService, GCalUserCalendar } from '../services/googleCalendarClient';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ScheduleContextType {
  caregivers: Caregiver[];
  children: Child[];
  templates: EventTemplate[];
  events: DispatchEvent[];
  holidays: DayHoliday[];
  selectedDate: string; // YYYY-MM-DD
  currentWeekDays: Date[];
  viewMode: 'calendar' | 'daily' | 'weekly';
  gaps: ScheduleGap[];
  isLoading: boolean;
  toasts: Toast[];
  authStatus: { mode: 'demo_mode' | 'live_gcal'; isConfigured: boolean };
  reassignModalEvent: DispatchEvent | null;
  isSettingsOpen: boolean;
  isAuditLogOpen: boolean;
  isSetupOpen: boolean;
  isSundayAlertOpen: boolean;
  isAddEventOpen: boolean;
  addEventInitialDate: string;
  activeSetupTab: 'caregivers' | 'kids' | 'blueprint';
  userCalendars: import('../services/googleCalendarClient').GCalUserCalendar[];
  activeCalendarId: string;
  connectedEmail: string | null;
  
  // Actions
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'calendar' | 'daily' | 'weekly') => void;
  reassignEvent: (eventId: string, targetCaregiverId: CaregiverId, reason?: string) => Promise<void>;
  cancelEventInstance: (eventId: string, reason?: string) => Promise<void>;
  markNoPickupNeeded: (eventId: string, reason?: string) => Promise<void>;
  restoreEventInstance: (eventId: string) => Promise<void>;
  markDayAsHoliday: (dateStr: string, holidayName: string, childId?: string) => Promise<void>;
  setReassignModalEvent: (event: DispatchEvent | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsAuditLogOpen: (open: boolean) => void;
  setIsSetupOpen: (open: boolean) => void;
  setIsSundayAlertOpen: (open: boolean) => void;
  setIsAddEventOpen: (open: boolean) => void;
  openAddEventModal: (dateStr?: string) => void;
  setActiveSetupTab: (tab: 'caregivers' | 'kids' | 'blueprint') => void;
  resetToDemoSchedule: () => Promise<void>;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  changeDateByDays: (days: number) => void;

  // Google Calendar Live Sync Actions
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => void;
  setActiveCalendarId: (calendarId: string) => void;
  refreshCalendarEvents: () => Promise<void>;

  // Event & Blueprint Management
  addNewEvent: (data: {
    title: string;
    childId: string;
    category?: 'dropoff' | 'pickup' | 'activity' | 'routine';
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    assignedTo?: string;
    isRecurring?: boolean;
    recurringDays?: number[];
    notes?: string;
  }) => Promise<void>;
  deletePermanently: (eventId: string) => Promise<void>;
  deleteSingleEvent: (eventId: string) => Promise<void>;

  // Setup CRUD
  addCaregiver: (data: Partial<Caregiver>) => Promise<void>;
  deleteCaregiver: (id: string) => Promise<void>;
  addChild: (data: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  addTemplate: (data: Partial<EventTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyWeeklyBlueprint: (mondayDateStr: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [viewMode, setViewMode] = useState<'calendar' | 'daily' | 'weekly'>('calendar');
  const [caregivers, setCaregivers] = useState<Caregiver[]>(DEFAULT_CAREGIVERS);
  const [childrenList, setChildrenList] = useState<Child[]>(DEFAULT_CHILDREN);
  const [templates, setTemplates] = useState<EventTemplate[]>(DEFAULT_TEMPLATES);
  const [events, setEvents] = useState<DispatchEvent[]>(DEFAULT_WEEK_EVENTS);
  const [holidays, setHolidays] = useState<DayHoliday[]>([]);
  const [gaps, setGaps] = useState<ScheduleGap[]>([
    {
      eventId: 'evt-thu-pick-gap',
      title: 'Abu Pick Up Vale',
      childName: 'VALE',
      date: '2026-09-03',
      time: '15:15 - 15:45',
      location: 'Lehrman School',
      severity: 'high'
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authStatus, setAuthStatus] = useState<{ mode: 'demo_mode' | 'live_gcal'; isConfigured: boolean }>({
    mode: GoogleCalendarService.isConnected() ? 'live_gcal' : 'demo_mode',
    isConfigured: GoogleCalendarService.isConnected()
  });
  const [userCalendars, setUserCalendars] = useState<GCalUserCalendar[]>([]);
  const [activeCalendarId, setActiveCalendarIdState] = useState<string>(GoogleCalendarService.getActiveCalendarId());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(GoogleCalendarService.getConnectedEmail());
  const [reassignModalEvent, setReassignModalEvent] = useState<DispatchEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isSundayAlertOpen, setIsSundayAlertOpen] = useState<boolean>(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [addEventInitialDate, setAddEventInitialDate] = useState<string>('2026-09-01');
  const [activeSetupTab, setActiveSetupTab] = useState<'caregivers' | 'kids' | 'blueprint'>('caregivers');

  const openAddEventModal = (dateStr?: string) => {
    setAddEventInitialDate(dateStr || selectedDate);
    setIsAddEventOpen(true);
  };

  const setActiveCalendarId = (calendarId: string) => {
    setActiveCalendarIdState(calendarId);
    GoogleCalendarService.setActiveCalendarId(calendarId);
  };

  const currentWeekDays = useMemo(() => {
    try {
      const baseDate = parseISO(selectedDate);
      const start = startOfWeek(baseDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    } catch {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }
  }, [selectedDate]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshCalendarEvents = async () => {
    if (!GoogleCalendarService.isConnected()) return;
    try {
      setIsLoading(true);
      const mondayStr = format(currentWeekDays[0], 'yyyy-MM-dd');
      const sundayStr = format(currentWeekDays[6], 'yyyy-MM-dd');
      
      const rawEvents = await GoogleCalendarService.fetchEventsForRange(activeCalendarId, mondayStr, sundayStr);
      const parsedEvents: DispatchEvent[] = [];

      for (const raw of rawEvents) {
        const parsed = GoogleCalendarService.parseGCalEvent(raw, caregivers, childrenList);
        if (parsed) parsedEvents.push(parsed);
      }

      if (parsedEvents.length > 0) {
        setEvents(parsedEvents);
        setGaps(parsedEvents.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').map((e) => ({
          eventId: e.id,
          title: e.title,
          childName: e.childId.toUpperCase(),
          date: e.date,
          time: `${e.startTime} - ${e.endTime}`,
          location: e.location,
          severity: 'high'
        })));
      }
    } catch (err: any) {
      console.warn('Google Calendar fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      setIsLoading(true);
      await GoogleCalendarService.requestAccessToken();
      const email = GoogleCalendarService.getConnectedEmail();
      setConnectedEmail(email);
      setAuthStatus({ mode: 'live_gcal', isConfigured: true });

      const cals = await GoogleCalendarService.listCalendars();
      setUserCalendars(cals);

      const mondayStr = format(currentWeekDays[0], 'yyyy-MM-dd');
      const sundayStr = format(currentWeekDays[6], 'yyyy-MM-dd');
      const rawEvents = await GoogleCalendarService.fetchEventsForRange(activeCalendarId, mondayStr, sundayStr);
      const parsedEvents: DispatchEvent[] = [];

      for (const raw of rawEvents) {
        const parsed = GoogleCalendarService.parseGCalEvent(raw, caregivers, childrenList);
        if (parsed) parsedEvents.push(parsed);
      }

      if (parsedEvents.length > 0) {
        setEvents(parsedEvents);
        setGaps(parsedEvents.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled' && e.status !== 'no_pickup_needed').map((e) => ({
          eventId: e.id,
          title: e.title,
          childName: e.childId.toUpperCase(),
          date: e.date,
          time: `${e.startTime} - ${e.endTime}`,
          location: e.location,
          severity: 'high'
        })));
      }

      addToast(`✨ Live Google Calendar Connected (${email || 'Ready'})`, 'success');
    } catch (err: any) {
      addToast(`Google Sign-In: ${err.message || 'Failed to authenticate'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleCalendar = () => {
    GoogleCalendarService.disconnect();
    setAuthStatus({ mode: 'demo_mode', isConfigured: false });
    setConnectedEmail(null);
    setUserCalendars([]);
    addToast('Disconnected Google Calendar. Switched to local mode.', 'info');
  };

  const fetchData = async () => {
    try {
      if (GoogleCalendarService.isConnected()) {
        const cals = await GoogleCalendarService.listCalendars().catch(() => []);
        if (cals.length > 0) setUserCalendars(cals);
        await refreshCalendarEvents();
      }

      const [rosterRes, scheduleRes, statusRes, gapsRes] = await Promise.all([
        fetch('/api/roster').catch(() => null),
        fetch('/api/schedule').catch(() => null),
        fetch('/api/status').catch(() => null),
        fetch('/api/schedule/gaps').catch(() => null)
      ]);

      if (rosterRes && rosterRes.ok) {
        const rosterData = await rosterRes.json();
        if (rosterData.caregivers?.length) setCaregivers(rosterData.caregivers);
        if (rosterData.children?.length) setChildrenList(rosterData.children);
        if (rosterData.templates?.length) setTemplates(rosterData.templates);
        if (rosterData.holidays) setHolidays(rosterData.holidays);
      }

      if (!GoogleCalendarService.isConnected() && scheduleRes && scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        if (scheduleData.events?.length) setEvents(scheduleData.events);
      }

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        if (!GoogleCalendarService.isConnected()) {
          setAuthStatus({
            mode: statusData.mode || 'demo_mode',
            isConfigured: statusData.gcalStatus?.isConfigured || false
          });
        }
      }

      if (gapsRes && gapsRes.ok) {
        const gapsData = await gapsRes.json();
        if (gapsData.gaps) setGaps(gapsData.gaps);
      }
    } catch (err) {
      console.warn('Backend fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (GoogleCalendarService.isConnected()) {
      refreshCalendarEvents();
    }
  }, [selectedDate, activeCalendarId]);

  const changeDateByDays = (days: number) => {
    const curr = new Date(selectedDate + 'T12:00:00');
    curr.setDate(curr.getDate() + days);
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const reassignEvent = async (eventId: string, targetCaregiverId: CaregiverId, reason?: string) => {
    const targetCaregiver = caregivers.find((c) => c.id === targetCaregiverId);
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updated = events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          assignedTo: targetCaregiverId,
          isException: e.isRecurringMaster || !!e.masterSeriesId,
          status: (targetCaregiverId === 'unassigned' ? 'unassigned' : 'confirmed') as 'confirmed' | 'unassigned',
          cancellationReason: undefined
        };
      }
      return e;
    });

    setEvents(updated);
    addToast(
      `✓ Reassigned "${targetEvent.title}" to ${targetCaregiver ? targetCaregiver.name : 'Unassigned'}`,
      'success'
    );

    // Update local gaps
    setGaps(updated.filter((e) => e.assignedTo === 'unassigned' && e.status !== 'cancelled').map((e) => ({
      eventId: e.id,
      title: e.title,
      childName: e.childId.toUpperCase(),
      date: e.date,
      time: `${e.startTime} - ${e.endTime}`,
      location: e.location,
      severity: 'high'
    })));

    if (GoogleCalendarService.isConnected()) {
      GoogleCalendarService.patchEventAssignment(activeCalendarId, eventId, targetEvent, targetCaregiver || null)
        .catch((e) => console.warn('GCal patch warning:', e));
    }

    try {
      await fetch('/api/schedule/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          targetCaregiverId,
          date: targetEvent.date,
          reason
        })
      });
    } catch (err) {}
  };

  // Cancel Single Event for No Class / Holiday
  const cancelEventInstance = async (eventId: string, reason: string = 'No Class / Holiday') => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updated = events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          status: 'cancelled' as const,
          isException: true,
          cancellationReason: reason
        };
      }
      return e;
    });

    setEvents(updated);
    addToast(`🌴 Marked "${targetEvent.title}" as No Class (${reason})`, 'info');

    // Remove from gaps
    setGaps((prev) => prev.filter((g) => g.eventId !== eventId));

    if (GoogleCalendarService.isConnected()) {
      GoogleCalendarService.patchEventNoPickup(activeCalendarId, eventId, targetEvent, reason)
        .catch((e) => console.warn('GCal cancel patch warning:', e));
    }

    try {
      await fetch('/api/schedule/cancel-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, reason })
      });
    } catch (err) {}
  };

  // Mark Event as No Pickup / Drop-off Needed (e.g. Playdate, After-school care)
  const markNoPickupNeeded = async (eventId: string, reason: string = 'No Pickup Needed') => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updated = events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          status: 'no_pickup_needed' as const,
          isException: true,
          cancellationReason: reason
        };
      }
      return e;
    });

    setEvents(updated);
    addToast(`🚫 Marked "${targetEvent.title}" as No Pickup Needed (${reason})`, 'info');

    // Remove from gaps so no false alarms are triggered
    setGaps((prev) => prev.filter((g) => g.eventId !== eventId));

    if (GoogleCalendarService.isConnected()) {
      GoogleCalendarService.patchEventNoPickup(activeCalendarId, eventId, targetEvent, reason)
        .catch((e) => console.warn('GCal no pickup patch warning:', e));
    }

    try {
      await fetch('/api/schedule/no-pickup-needed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, reason })
      });
    } catch (err) {}
  };

  // Restore Cancelled Event
  const restoreEventInstance = async (eventId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updated = events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          status: (e.assignedTo === 'unassigned' ? 'unassigned' : 'confirmed') as 'confirmed' | 'unassigned',
          cancellationReason: undefined
        };
      }
      return e;
    });

    setEvents(updated);
    addToast(`✓ Restored "${targetEvent.title}" to active schedule`, 'success');

    try {
      await fetch('/api/schedule/restore-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
    } catch (err) {}
  };

  // Mark Full Day as Holiday
  const markDayAsHoliday = async (dateStr: string, holidayName: string, childId: string = 'all') => {
    let cancelledCount = 0;
    const updated = events.map((e) => {
      const matchesDate = e.date === dateStr;
      const matchesChild = childId === 'all' || e.childId === childId || e.childId === 'all';
      if (matchesDate && matchesChild) {
        cancelledCount++;
        return {
          ...e,
          status: 'cancelled' as const,
          isException: true,
          cancellationReason: holidayName
        };
      }
      return e;
    });

    setEvents(updated);
    setHolidays((prev) => [...prev.filter((h) => h.date !== dateStr), { date: dateStr, name: holidayName, childId }]);
    // Remove gaps for this day
    setGaps((prev) => prev.filter((g) => g.date !== dateStr));

    addToast(`🌴 Marked ${dateStr} as "${holidayName}" (${cancelledCount} duties cancelled)`, 'success');

    try {
      await fetch('/api/schedule/mark-day-holiday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, holidayName, childId })
      });
    } catch (err) {}
  };

  const resetToDemoSchedule = async () => {
    setEvents(DEFAULT_WEEK_EVENTS);
    setCaregivers(DEFAULT_CAREGIVERS);
    setChildrenList(DEFAULT_CHILDREN);
    setTemplates(DEFAULT_TEMPLATES);
    setHolidays([]);
    addToast('Reset schedule and blueprint to default family seed.', 'info');
    try {
      await fetch('/api/schedule/reset', { method: 'POST' });
    } catch (err) {}
  };

  // CRUD Implementations
  const addCaregiver = async (data: Partial<Caregiver>) => {
    const id = (data.name || 'cg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const initials = (data.name || 'CG')
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newCaregiver: Caregiver = {
      id,
      name: data.name || 'New Caregiver',
      role: data.role || 'Caregiver',
      avatarColor: data.avatarColor || '#6366f1',
      calendarId: data.calendarId || `${id}@herrington.ai`,
      isManager: !!data.isManager,
      avatarInitials: initials || 'CG'
    };

    setCaregivers((prev) => [...prev, newCaregiver]);
    addToast(`Added Caregiver "${newCaregiver.name}"`, 'success');

    try {
      await fetch('/api/caregivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const deleteCaregiver = async (id: string) => {
    setCaregivers((prev) => prev.filter((c) => c.id !== id));
    addToast('Caregiver removed.', 'info');
    try {
      await fetch(`/api/caregivers/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const addChild = async (data: Partial<Child>) => {
    const id = (data.name || 'child').toLowerCase().replace(/[^a-z0-9]/g, '');
    const childColor = data.color || '#ec4899';

    const newChild: Child = {
      id,
      name: data.name || 'New Child',
      color: childColor,
      badgeBg: 'rgba(236, 72, 153, 0.15)',
      badgeBorder: 'rgba(236, 72, 153, 0.4)',
      school: data.school || 'School'
    };

    setChildrenList((prev) => [...prev, newChild]);
    addToast(`Added Child "${newChild.name}"`, 'success');

    try {
      await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const deleteChild = async (id: string) => {
    setChildrenList((prev) => prev.filter((c) => c.id !== id));
    addToast('Child profile removed.', 'info');
    try {
      await fetch(`/api/children/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const addTemplate = async (data: Partial<EventTemplate>) => {
    const newTemplate: EventTemplate = {
      id: `tpl-${Date.now()}`,
      title: data.title || 'Routine Event',
      childId: data.childId || 'izzy',
      category: data.category || 'pickup',
      daysOfWeek: data.daysOfWeek || [1, 2, 3, 4, 5],
      startTime: data.startTime || '15:00',
      endTime: data.endTime || '15:30',
      location: data.location || 'School',
      defaultCaregiverId: data.defaultCaregiverId || 'daniel',
      notes: data.notes
    };

    setTemplates((prev) => [...prev, newTemplate]);
    addToast(`Added Routine Template "${newTemplate.title}"`, 'success');

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addToast('Template removed from blueprint.', 'info');
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Add New Event (Single or Recurring)
  const addNewEvent = async (data: {
    title: string;
    childId: string;
    category?: 'dropoff' | 'pickup' | 'activity' | 'routine';
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    assignedTo?: string;
    isRecurring?: boolean;
    recurringDays?: number[];
    notes?: string;
  }) => {
    const isRec = !!data.isRecurring && Array.isArray(data.recurringDays) && data.recurringDays.length > 0;
    const newEventsToAdd: DispatchEvent[] = [];

    if (isRec) {
      const templateId = `tpl-${Date.now()}`;
      const newTemplate: EventTemplate = {
        id: templateId,
        title: data.title,
        childId: data.childId,
        category: data.category || 'pickup',
        daysOfWeek: data.recurringDays!,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || 'School',
        defaultCaregiverId: data.assignedTo || 'daniel',
        notes: data.notes
      };

      setTemplates((prev) => [...prev, newTemplate]);

      // Generate for the current week of the given date
      const baseDate = new Date(data.date + 'T12:00:00');
      const dayOfWeek = baseDate.getDay();
      const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(baseDate.setDate(diff));

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dNum = d.getDay() === 0 ? 7 : d.getDay();
        if (data.recurringDays!.includes(dNum)) {
          const dStr = d.toISOString().split('T')[0];
          newEventsToAdd.push({
            id: `evt-${dStr}-${templateId}`,
            title: data.title,
            childId: data.childId,
            assignedTo: data.assignedTo || 'daniel',
            date: dStr,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location || 'School',
            category: data.category || 'pickup',
            isRecurringMaster: true,
            masterSeriesId: templateId,
            notes: data.notes,
            status: data.assignedTo === 'unassigned' ? 'unassigned' : 'confirmed'
          });
        }
      }
      addToast(`Added recurring event "${data.title}" to weekly blueprint (${newEventsToAdd.length} days)`, 'success');
    } else {
      const newId = `evt-${Date.now()}`;
      newEventsToAdd.push({
        id: newId,
        title: data.title,
        childId: data.childId,
        assignedTo: data.assignedTo || 'daniel',
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || 'School',
        category: data.category || 'pickup',
        isRecurringMaster: false,
        notes: data.notes,
        status: data.assignedTo === 'unassigned' ? 'unassigned' : 'confirmed'
      });
      addToast(`Added event "${data.title}" for ${data.date}`, 'success');
    }

    setEvents((prev) => [...prev, ...newEventsToAdd]);

    if (GoogleCalendarService.isConnected()) {
      const driver = caregivers.find((c) => c.id === data.assignedTo);
      GoogleCalendarService.createEvent(activeCalendarId, {
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        notes: data.notes,
        driverName: driver ? driver.name.split(' ')[0] : undefined
      }).catch((e) => console.warn('GCal create event warning:', e));
    }

    try {
      await fetch('/api/schedule/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  // Permanently Delete Event from all weeks and blueprint
  const deletePermanently = async (eventId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const seriesId = targetEvent?.masterSeriesId || targetEvent?.id || eventId;
    const title = targetEvent?.title || 'Event';
    const childId = targetEvent?.childId;

    // Filter out templates
    setTemplates((prev) =>
      prev.filter(
        (t) => t.id !== seriesId && t.id !== eventId && !(t.title === title && (!childId || t.childId === childId))
      )
    );

    // Filter out all matching events across all dates
    setEvents((prev) =>
      prev.filter(
        (e) => e.id !== eventId && e.masterSeriesId !== seriesId && !(e.title === title && (!childId || e.childId === childId))
      )
    );

    // Clear from gaps
    setGaps((prev) => prev.filter((g) => g.eventId !== eventId));

    addToast(`🗑️ Permanently removed "${title}" from weekly schedule & blueprint`, 'info');

    if (GoogleCalendarService.isConnected()) {
      GoogleCalendarService.deleteEvent(activeCalendarId, eventId)
        .catch((e) => console.warn('GCal delete permanent warning:', e));
    }

    try {
      await fetch('/api/schedule/delete-permanent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
    } catch (err) {}
  };

  // Delete Single Event Instance
  const deleteSingleEvent = async (eventId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setGaps((prev) => prev.filter((g) => g.eventId !== eventId));

    addToast(`Removed "${targetEvent?.title || 'Event'}" from ${targetEvent?.date || 'schedule'}`, 'info');

    if (GoogleCalendarService.isConnected()) {
      GoogleCalendarService.deleteEvent(activeCalendarId, eventId)
        .catch((e) => console.warn('GCal delete single warning:', e));
    }

    try {
      await fetch(`/api/schedule/events/${eventId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const applyWeeklyBlueprint = async (mondayDateStr: string = '2026-08-31') => {
    const monday = new Date(mondayDateStr + 'T12:00:00');
    const generatedEvents: DispatchEvent[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + dayOffset);
      const dayOfWeek = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
      const dateStr = currentDay.toISOString().split('T')[0];

      const matchingTemplates = templates.filter((t) => t.daysOfWeek.includes(dayOfWeek));

      for (const tpl of matchingTemplates) {
        generatedEvents.push({
          id: `evt-${dateStr}-${tpl.id}`,
          title: tpl.title,
          childId: tpl.childId,
          assignedTo: tpl.defaultCaregiverId,
          date: dateStr,
          startTime: tpl.startTime,
          endTime: tpl.endTime,
          location: tpl.location,
          category: tpl.category,
          isRecurringMaster: true,
          masterSeriesId: tpl.id,
          notes: tpl.notes,
          status: tpl.defaultCaregiverId === 'unassigned' ? 'unassigned' : 'confirmed'
        });
      }
    }

    const sundayDate = new Date(monday);
    sundayDate.setDate(monday.getDate() + 6);
    const sundayStr = sundayDate.toISOString().split('T')[0];

    const merged = events.filter((e) => e.date < mondayDateStr || e.date > sundayStr).concat(generatedEvents);
    setEvents(merged);
    setHolidays((prev) => prev.filter((h) => h.date < mondayDateStr || h.date > sundayStr));
    addToast(`Applied weekly blueprint (${generatedEvents.length} events generated)`, 'success');

    try {
      await fetch('/api/templates/apply-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mondayDateStr })
      });
    } catch (err) {}
  };

  return (
    <ScheduleContext.Provider
      value={{
        caregivers,
        children: childrenList,
        templates,
        events,
        holidays,
        selectedDate,
        currentWeekDays,
        viewMode,
        gaps,
        isLoading,
        toasts,
        authStatus,
        reassignModalEvent,
        isSettingsOpen,
        isAuditLogOpen,
        isSetupOpen,
        activeSetupTab,
        setSelectedDate,
        setViewMode,
        reassignEvent,
        cancelEventInstance,
        markNoPickupNeeded,
        restoreEventInstance,
        markDayAsHoliday,
        setReassignModalEvent,
        setIsSettingsOpen,
        setIsAuditLogOpen,
        setIsSetupOpen,
        isSundayAlertOpen,
        setIsSundayAlertOpen,
        isAddEventOpen,
        setIsAddEventOpen,
        addEventInitialDate,
        openAddEventModal,
        setActiveSetupTab,
        resetToDemoSchedule,
        addToast,
        removeToast,
        changeDateByDays,
        userCalendars,
        activeCalendarId,
        setActiveCalendarId,
        connectedEmail,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        refreshCalendarEvents,
        addNewEvent,
        deletePermanently,
        deleteSingleEvent,
        addCaregiver,
        deleteCaregiver,
        addChild,
        deleteChild,
        addTemplate,
        deleteTemplate,
        applyWeeklyBlueprint
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
