import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { 
  Caregiver, 
  Child, 
  DispatchEvent, 
  ScheduleGap, 
  CaregiverId, 
  EventTemplate, 
  DayHoliday,
  StagedSyncItem 
} from '../types/schedule';
import { 
  DEFAULT_CAREGIVERS, 
  DEFAULT_CHILDREN, 
  DEFAULT_TEMPLATES, 
  DEFAULT_WEEK_EVENTS 
} from './defaultSeed';
import { GoogleCalendarService, GCalUserCalendar } from '../services/googleCalendarClient';
import { 
  saveSharedBlueprints, 
  saveSharedCaregivers, 
  saveSharedKids, 
  saveSharedCalendarMappings,
  subscribeToSharedFamilySetup 
} from '../services/firebaseClient';

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

  // Staged Sync ("Safe Mode")
  syncMode: 'staged' | 'immediate';
  setSyncMode: (mode: 'staged' | 'immediate') => void;
  pendingSyncQueue: StagedSyncItem[];
  isSyncReviewOpen: boolean;
  setIsSyncReviewOpen: (open: boolean) => void;
  pushStagedSyncToGoogle: () => Promise<{ success: boolean; syncedCount: number }>;
  discardStagedChanges: () => void;
  removeStagedItem: (id: string) => void;
  userCalendars: import('../services/googleCalendarClient').GCalUserCalendar[];
  activeCalendarId: string;
  connectedEmail: string | null;
  cloudSyncActive: boolean;
  caregiverCalendarMappings: Record<string, { calendarId: string; calendarName: string }>;
  setCaregiverCalendarMapping: (caregiverId: string, calendarId: string, calendarName: string) => void;
  autoDetectCalendarMappings: (availableCals?: import('../services/googleCalendarClient').GCalUserCalendar[]) => void;
  
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
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => Promise<void>;
  deleteCaregiver: (id: string) => Promise<void>;
  addChild: (data: Partial<Child>) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  addTemplate: (data: Partial<EventTemplate>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<EventTemplate>, updateCurrentWeekEvents?: boolean) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyWeeklyBlueprint: (mondayDateStr: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [viewMode, setViewMode] = useState<'calendar' | 'daily' | 'weekly'>('calendar');
  const [caregivers, setCaregivers] = useState<Caregiver[]>(DEFAULT_CAREGIVERS);
  const [childrenList, setChildrenList] = useState<Child[]>(DEFAULT_CHILDREN);
  const [templates, setTemplates] = useState<EventTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('gcal_blueprints_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TEMPLATES;
  });
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
  const [cloudSyncActive, setCloudSyncActive] = useState<boolean>(true);
  const [caregiverCalendarMappings, setCaregiverCalendarMappings] = useState<
    Record<string, { calendarId: string; calendarName: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('gcal_caregiver_calendar_map');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const setCaregiverCalendarMapping = (caregiverId: string, calendarId: string, calendarName: string) => {
    setCaregiverCalendarMappings((prev) => {
      const next = {
        ...prev,
        [caregiverId]: { calendarId, calendarName }
      };
      try {
        localStorage.setItem('gcal_caregiver_calendar_map', JSON.stringify(next));
      } catch {}
      saveSharedCalendarMappings(next);
      return next;
    });
    addToast(`Mapped ${caregiverId} to calendar "${calendarName}"`, 'info');
  };

  const autoDetectCalendarMappings = (availableCals: GCalUserCalendar[] = userCalendars) => {
    if (!availableCals || availableCals.length === 0) return;

    setCaregiverCalendarMappings((prev) => {
      const next = { ...prev };
      let updated = false;

      const danielCal = availableCals.find((c) => c.summary.toLowerCase().includes('daniel'));
      if (danielCal && (!next['daniel'] || next['daniel'].calendarId !== danielCal.id)) {
        next['daniel'] = { calendarId: danielCal.id, calendarName: danielCal.summary };
        updated = true;
      }

      const lucilaCal = availableCals.find((c) => c.summary.toLowerCase().includes('lucila'));
      if (lucilaCal && (!next['lucila'] || next['lucila'].calendarId !== lucilaCal.id)) {
        next['lucila'] = { calendarId: lucilaCal.id, calendarName: lucilaCal.summary };
        updated = true;
      }

      const elizabethCal = availableCals.find((c) => c.summary.toLowerCase().includes('elizabeth'));
      if (elizabethCal && (!next['elizabeth'] || next['elizabeth'].calendarId !== elizabethCal.id)) {
        next['elizabeth'] = { calendarId: elizabethCal.id, calendarName: elizabethCal.summary };
        updated = true;
      }

      const matildaCal = availableCals.find((c) => 
        c.summary.toLowerCase().includes('matild') || c.summary.toLowerCase().includes('abu')
      );
      if (matildaCal && (!next['matilda'] || next['matilda'].calendarId !== matildaCal.id)) {
        next['matilda'] = { calendarId: matildaCal.id, calendarName: matildaCal.summary };
        updated = true;
      }

      const sharedCal = availableCals.find((c) => c.summary.toLowerCase().includes('shared'));
      if (sharedCal && (!next['shared'] || next['shared'].calendarId !== sharedCal.id)) {
        next['shared'] = { calendarId: sharedCal.id, calendarName: sharedCal.summary };
        updated = true;
      }

      if (updated) {
        try {
          localStorage.setItem('gcal_caregiver_calendar_map', JSON.stringify(next));
        } catch {}
        saveSharedCalendarMappings(next);
        addToast('Auto-detected and mapped family Google Calendars!', 'success');
      }
      return next;
    });
  };

  const [reassignModalEvent, setReassignModalEvent] = useState<DispatchEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isSundayAlertOpen, setIsSundayAlertOpen] = useState<boolean>(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [addEventInitialDate, setAddEventInitialDate] = useState<string>('2026-09-01');
  const [activeSetupTab, setActiveSetupTab] = useState<'caregivers' | 'kids' | 'blueprint'>('caregivers');

  // Staged Sync State ("Safe Mode")
  const [syncMode, setSyncModeState] = useState<'staged' | 'immediate'>(() => {
    return (localStorage.getItem('gcal_sync_mode') as 'staged' | 'immediate') || 'staged';
  });
  const [pendingSyncQueue, setPendingSyncQueue] = useState<StagedSyncItem[]>(() => {
    try {
      const saved = localStorage.getItem('gcal_pending_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncReviewOpen, setIsSyncReviewOpen] = useState<boolean>(false);

  const setSyncMode = (mode: 'staged' | 'immediate') => {
    setSyncModeState(mode);
    localStorage.setItem('gcal_sync_mode', mode);
    addToast(`Sync Mode: ${mode === 'staged' ? 'Review & Push (Safe Mode)' : 'Immediate Auto-Sync'}`, 'info');
  };

  const updatePendingQueue = (updater: (prev: StagedSyncItem[]) => StagedSyncItem[]) => {
    setPendingSyncQueue((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('gcal_pending_sync_queue', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeStagedItem = (id: string) => {
    updatePendingQueue((prev) => prev.filter((item) => item.id !== id));
    addToast('Removed change from sync queue.', 'info');
  };

  const discardStagedChanges = async () => {
    updatePendingQueue(() => []);
    if (GoogleCalendarService.isConnected()) {
      await refreshCalendarEvents();
      addToast('Discarded all staged changes. Schedule restored from Google Calendar.', 'info');
    } else {
      addToast('Discarded all staged changes.', 'info');
    }
    setIsSyncReviewOpen(false);
  };

  const pushStagedSyncToGoogle = async (): Promise<{ success: boolean; syncedCount: number }> => {
    if (!GoogleCalendarService.isConnected()) {
      addToast('Please connect your Google Calendar first.', 'warning');
      return { success: false, syncedCount: 0 };
    }

    if (pendingSyncQueue.length === 0) {
      addToast('No pending changes to sync.', 'info');
      return { success: true, syncedCount: 0 };
    }

    setIsLoading(true);
    let successCount = 0;
    const errors: string[] = [];

    for (const item of pendingSyncQueue) {
      try {
        if (item.type === 'reassign') {
          const sourceCal = item.sourceCalendarId || item.payload?.sourceCalendarId || activeCalendarId;
          const targetCal = item.targetCalendarId || item.payload?.targetCalendarId || activeCalendarId;

          if (sourceCal && targetCal && sourceCal !== targetCal) {
            const moveRes = await GoogleCalendarService.moveEvent(sourceCal, item.eventId, targetCal);
            if (!moveRes.success) {
              throw new Error(`Failed to move event from ${item.sourceCalendarName || sourceCal} to ${item.targetCalendarName || targetCal}`);
            }
          } else {
            const currentEvt = events.find((e) => e.id === item.eventId) || item.payload.event;
            const targetCg = caregivers.find((c) => c.id === item.payload.targetCaregiverId) || null;
            await GoogleCalendarService.patchEventAssignment(sourceCal || activeCalendarId, item.eventId, currentEvt, targetCg);
          }
          successCount++;
        } else if (item.type === 'no_pickup') {
          const cal = item.sourceCalendarId || item.payload?.sourceCalendarId || activeCalendarId;
          const currentEvt = events.find((e) => e.id === item.eventId) || item.payload.event;
          await GoogleCalendarService.patchEventNoPickup(cal, item.eventId, currentEvt, item.payload.reason || 'No pickup needed');
          successCount++;
        } else if (item.type === 'create') {
          const targetCal = item.targetCalendarId || (item.payload?.createData?.assignedTo && caregiverCalendarMappings[item.payload.createData.assignedTo]?.calendarId) || caregiverCalendarMappings['shared']?.calendarId || activeCalendarId;
          await GoogleCalendarService.createEvent(targetCal, item.payload.createData);
          successCount++;
        } else if (item.type === 'delete') {
          const cal = item.sourceCalendarId || item.payload?.sourceCalendarId || activeCalendarId;
          await GoogleCalendarService.deleteEvent(cal, item.eventId);
          successCount++;
        }
      } catch (err: any) {
        console.error('Failed to sync item:', item, err);
        errors.push(item.summary);
      }
    }

    updatePendingQueue(() => []);
    await refreshCalendarEvents();
    setIsLoading(false);
    setIsSyncReviewOpen(false);

    if (errors.length === 0) {
      addToast(`Successfully pushed ${successCount} change${successCount === 1 ? '' : 's'} to Google Calendar!`, 'success');
      return { success: true, syncedCount: successCount };
    } else {
      addToast(`Synced ${successCount} change(s). ${errors.length} failed.`, 'warning');
      return { success: false, syncedCount: successCount };
    }
  };

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
      const mondayStr = format(currentWeekDays[0], 'yyyy-MM-dd');
      const sundayStr = format(currentWeekDays[6], 'yyyy-MM-dd');
      
      const configs: { calendarId: string; caregiverId?: string }[] = [];
      const seenCalIds = new Set<string>();

      for (const cg of caregivers) {
        const mapped = caregiverCalendarMappings[cg.id];
        if (mapped?.calendarId && !seenCalIds.has(mapped.calendarId)) {
          configs.push({ calendarId: mapped.calendarId, caregiverId: cg.id });
          seenCalIds.add(mapped.calendarId);
        }
      }

      const sharedMapped = caregiverCalendarMappings['shared'];
      if (sharedMapped?.calendarId && !seenCalIds.has(sharedMapped.calendarId)) {
        configs.push({ calendarId: sharedMapped.calendarId, caregiverId: 'shared' });
        seenCalIds.add(sharedMapped.calendarId);
      } else if (activeCalendarId && !seenCalIds.has(activeCalendarId)) {
        configs.push({ calendarId: activeCalendarId, caregiverId: 'shared' });
        seenCalIds.add(activeCalendarId);
      }

      if (configs.length > 0) {
        const parsedEvents = await GoogleCalendarService.fetchMultiCalendarEvents(
          configs,
          mondayStr,
          sundayStr,
          caregivers,
          childrenList
        );

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
      }
    } catch (err: any) {
      console.warn('Google Calendar fetch warning:', err);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      await GoogleCalendarService.requestAccessToken();
      const email = GoogleCalendarService.getConnectedEmail();
      setConnectedEmail(email);
      setAuthStatus({ mode: 'live_gcal', isConfigured: true });

      const cals = await GoogleCalendarService.listCalendars().catch(() => []);
      setUserCalendars(cals);
      autoDetectCalendarMappings(cals);

      await refreshCalendarEvents();
      addToast(`✨ Live Google Calendar Connected (${email || 'Ready'})`, 'success');
    } catch (err: any) {
      addToast(`Google Sign-In: ${err.message || 'Failed to authenticate'}`, 'error');
      throw err;
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
        if (cals.length > 0) {
          setUserCalendars(cals);
          autoDetectCalendarMappings(cals);
        }
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

    // Subscribe to shared Cloud Firestore so blueprints and caregivers sync across all devices
    const unsubscribe = subscribeToSharedFamilySetup((data) => {
      setCloudSyncActive(true);
      if (data.blueprints && Array.isArray(data.blueprints) && data.blueprints.length > 0) {
        setTemplates(data.blueprints);
        try {
          localStorage.setItem('gcal_blueprints_v2', JSON.stringify(data.blueprints));
        } catch {}
      } else if (!data.blueprints || data.blueprints.length === 0) {
        saveSharedBlueprints(DEFAULT_TEMPLATES);
      }

      if (data.caregivers && Array.isArray(data.caregivers) && data.caregivers.length > 0) {
        setCaregivers(data.caregivers);
      } else if (!data.caregivers || data.caregivers.length === 0) {
        saveSharedCaregivers(DEFAULT_CAREGIVERS);
      }

      if (data.children && Array.isArray(data.children) && data.children.length > 0) {
        setChildrenList(data.children);
      } else if (!data.children || data.children.length === 0) {
        saveSharedKids(DEFAULT_CHILDREN);
      }

      if (data.calendarMappings && Object.keys(data.calendarMappings).length > 0) {
        setCaregiverCalendarMappings(data.calendarMappings);
        try {
          localStorage.setItem('gcal_caregiver_calendar_map', JSON.stringify(data.calendarMappings));
        } catch {}
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (GoogleCalendarService.isConnected()) {
      refreshCalendarEvents();
    }
  }, [selectedDate, activeCalendarId, caregiverCalendarMappings]);

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

    const currentCgId = targetEvent.assignedTo;
    const newCgId = targetCaregiverId;

    const sourceCal = targetEvent.sourceCalendarId || caregiverCalendarMappings[currentCgId]?.calendarId || caregiverCalendarMappings['shared']?.calendarId || activeCalendarId;
    const targetCal = caregiverCalendarMappings[newCgId]?.calendarId || caregiverCalendarMappings['shared']?.calendarId || activeCalendarId;

    const sourceCalName = caregiverCalendarMappings[currentCgId]?.calendarName || (userCalendars.find(c => c.id === sourceCal)?.summary) || 'Current Calendar';
    const targetCalName = caregiverCalendarMappings[newCgId]?.calendarName || (userCalendars.find(c => c.id === targetCal)?.summary) || 'New Calendar';

    const updated = events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          assignedTo: targetCaregiverId,
          sourceCalendarId: targetCal,
          isException: e.isRecurringMaster || !!e.masterSeriesId,
          status: (targetCaregiverId === 'unassigned' ? 'unassigned' : 'confirmed') as 'confirmed' | 'unassigned',
          cancellationReason: undefined
        };
      }
      return e;
    });

    setEvents(updated);
    addToast(
      `✓ Reassigned "${targetEvent.title}" to ${targetCaregiver ? targetCaregiver.name : 'Unassigned'} (${targetCalName})`,
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
      if (syncMode === 'immediate') {
        if (sourceCal && targetCal && sourceCal !== targetCal) {
          GoogleCalendarService.moveEvent(sourceCal, eventId, targetCal)
            .catch((e) => console.warn('GCal move warning:', e));
        } else {
          GoogleCalendarService.patchEventAssignment(sourceCal || activeCalendarId, eventId, targetEvent, targetCaregiver || null)
            .catch((e) => console.warn('GCal patch warning:', e));
        }
      } else {
        const staged: StagedSyncItem = {
          id: `sync-reassign-${eventId}-${Date.now()}`,
          type: 'reassign',
          eventId,
          eventTitle: targetEvent.title,
          childId: targetEvent.childId,
          eventDate: targetEvent.date,
          eventTime: `${targetEvent.startTime} - ${targetEvent.endTime}`,
          summary: `Move Event: ${targetEvent.title} (${sourceCalName} ➔ ${targetCalName})`,
          previousValue: `${caregivers.find((c) => c.id === currentCgId)?.name || 'Unassigned'} (${sourceCalName})`,
          newValue: `${targetCaregiver ? targetCaregiver.name : 'Unassigned'} (${targetCalName})`,
          sourceCalendarId: sourceCal,
          targetCalendarId: targetCal,
          sourceCalendarName: sourceCalName,
          targetCalendarName: targetCalName,
          payload: { 
            targetCaregiverId, 
            event: targetEvent, 
            reason,
            sourceCalendarId: sourceCal,
            targetCalendarId: targetCal,
            sourceCalendarName: sourceCalName,
            targetCalendarName: targetCalName
          },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev.filter((p) => !(p.eventId === eventId && p.type === 'reassign')), staged]);
      }
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
      if (syncMode === 'immediate') {
        GoogleCalendarService.patchEventNoPickup(activeCalendarId, eventId, targetEvent, reason)
          .catch((e) => console.warn('GCal cancel patch warning:', e));
      } else {
        const staged: StagedSyncItem = {
          id: `sync-cancel-${eventId}-${Date.now()}`,
          type: 'no_pickup',
          eventId,
          eventTitle: targetEvent.title,
          childId: targetEvent.childId,
          eventDate: targetEvent.date,
          eventTime: `${targetEvent.startTime} - ${targetEvent.endTime}`,
          summary: `Cancelled / No Class: ${targetEvent.title} (${reason})`,
          previousValue: targetEvent.status,
          newValue: 'cancelled',
          payload: { event: targetEvent, reason },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev, staged]);
      }
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
      if (syncMode === 'immediate') {
        GoogleCalendarService.patchEventNoPickup(activeCalendarId, eventId, targetEvent, reason)
          .catch((e) => console.warn('GCal no pickup patch warning:', e));
      } else {
        const staged: StagedSyncItem = {
          id: `sync-nopickup-${eventId}-${Date.now()}`,
          type: 'no_pickup',
          eventId,
          eventTitle: targetEvent.title,
          childId: targetEvent.childId,
          eventDate: targetEvent.date,
          eventTime: `${targetEvent.startTime} - ${targetEvent.endTime}`,
          summary: `No Pickup Needed: ${targetEvent.title} (${reason})`,
          previousValue: targetEvent.status,
          newValue: 'no_pickup_needed',
          payload: { event: targetEvent, reason },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev, staged]);
      }
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
    try {
      localStorage.removeItem('gcal_blueprints');
      localStorage.removeItem('gcal_blueprints_v2');
      localStorage.removeItem('gcal_pending_sync_queue');
    } catch (e) {}
    setEvents(DEFAULT_WEEK_EVENTS);
    setCaregivers(DEFAULT_CAREGIVERS);
    setChildrenList(DEFAULT_CHILDREN);
    setTemplates(DEFAULT_TEMPLATES);
    setPendingSyncQueue([]);
    setHolidays([]);
    saveSharedBlueprints(DEFAULT_TEMPLATES);
    saveSharedCaregivers(DEFAULT_CAREGIVERS);
    saveSharedKids(DEFAULT_CHILDREN);
    addToast('Reset schedule and blueprint to default family seed (alternating drop-offs).', 'info');
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

    setCaregivers((prev) => {
      const next = [...prev, newCaregiver];
      saveSharedCaregivers(next);
      return next;
    });
    addToast(`Added Caregiver "${newCaregiver.name}"`, 'success');

    try {
      await fetch('/api/caregivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const updateCaregiver = async (id: string, updates: Partial<Caregiver>) => {
    setCaregivers((prev) => {
      const next = prev.map((cg) => {
        if (cg.id === id) {
          const name = updates.name !== undefined ? updates.name : cg.name;
          const initials = name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
          return {
            ...cg,
            ...updates,
            name,
            avatarInitials: updates.avatarInitials || (updates.name ? initials : cg.avatarInitials)
          };
        }
        return cg;
      });
      saveSharedCaregivers(next);
      return next;
    });
    addToast('Caregiver updated.', 'success');
    try {
      await fetch(`/api/caregivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {}
  };

  const deleteCaregiver = async (id: string) => {
    setCaregivers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveSharedCaregivers(next);
      return next;
    });
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
      badgeBg: `${childColor}20`,
      badgeBorder: `${childColor}55`,
      school: data.school || 'School'
    };

    setChildrenList((prev) => {
      const next = [...prev, newChild];
      saveSharedKids(next);
      return next;
    });
    addToast(`Added Child "${newChild.name}"`, 'success');

    try {
      await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    setChildrenList((prev) => {
      const next = prev.map((c) => {
        if (c.id === id) {
          const color = updates.color || c.color;
          return {
            ...c,
            ...updates,
            color,
            badgeBg: updates.color ? `${color}20` : c.badgeBg,
            badgeBorder: updates.color ? `${color}55` : c.badgeBorder
          };
        }
        return c;
      });
      saveSharedKids(next);
      return next;
    });
    addToast('Child details updated.', 'success');

    try {
      await fetch(`/api/children/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {}
  };

  const deleteChild = async (id: string) => {
    setChildrenList((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveSharedKids(next);
      return next;
    });
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

    setTemplates((prev) => {
      const next = [...prev, newTemplate];
      try { localStorage.setItem('gcal_blueprints_v2', JSON.stringify(next)); } catch (e) {}
      saveSharedBlueprints(next);
      return next;
    });
    addToast(`Added Routine Template "${newTemplate.title}"`, 'success');

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {}
  };

  const updateTemplate = async (
    id: string, 
    updates: Partial<EventTemplate>, 
    updateCurrentWeekEvents: boolean = true
  ) => {
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      try { localStorage.setItem('gcal_blueprints_v2', JSON.stringify(next)); } catch (e) {}
      saveSharedBlueprints(next);
      return next;
    });

    if (updateCurrentWeekEvents) {
      setEvents((prev) =>
        prev.map((evt) => {
          if (evt.masterSeriesId === id || evt.id.includes(id)) {
            return {
              ...evt,
              title: updates.title !== undefined ? updates.title : evt.title,
              childId: updates.childId !== undefined ? updates.childId : evt.childId,
              category: updates.category !== undefined ? updates.category : evt.category,
              startTime: updates.startTime !== undefined ? updates.startTime : evt.startTime,
              endTime: updates.endTime !== undefined ? updates.endTime : evt.endTime,
              location: updates.location !== undefined ? updates.location : evt.location,
              assignedTo: updates.defaultCaregiverId !== undefined && (evt.assignedTo === 'unassigned' || !evt.isException)
                ? updates.defaultCaregiverId
                : evt.assignedTo
            };
          }
          return evt;
        })
      );
    }

    addToast(`Updated blueprint "${updates.title || 'Event'}"`, 'success');

    try {
      await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {}
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try { localStorage.setItem('gcal_blueprints_v2', JSON.stringify(next)); } catch (e) {}
      saveSharedBlueprints(next);
      return next;
    });
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

      setTemplates((prev) => {
        const next = [...prev, newTemplate];
        try { localStorage.setItem('gcal_blueprints_v2', JSON.stringify(next)); } catch (e) {}
        saveSharedBlueprints(next);
        return next;
      });

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
      if (syncMode === 'immediate') {
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
      } else {
        const driver = caregivers.find((c) => c.id === data.assignedTo);
        const staged: StagedSyncItem = {
          id: `sync-create-${newEventsToAdd[0]?.id || Date.now()}`,
          type: 'create',
          eventId: newEventsToAdd[0]?.id || `evt-${Date.now()}`,
          eventTitle: data.title,
          childId: data.childId,
          eventDate: data.date,
          eventTime: `${data.startTime} - ${data.endTime}`,
          summary: `Create Event: ${data.title} (${driver ? driver.name.split(' ')[0] : 'Unassigned'})`,
          newValue: driver ? driver.name.split(' ')[0] : 'Unassigned',
          payload: {
            createData: {
              title: data.title,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              location: data.location,
              notes: data.notes,
              driverName: driver ? driver.name.split(' ')[0] : undefined
            }
          },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev, staged]);
      }
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

    const deleteCalId = targetEvent?.sourceCalendarId || activeCalendarId;
    if (GoogleCalendarService.isConnected()) {
      if (syncMode === 'immediate') {
        GoogleCalendarService.deleteEvent(deleteCalId, eventId)
          .catch((e) => console.warn('GCal delete permanent warning:', e));
      } else {
        const staged: StagedSyncItem = {
          id: `sync-delete-${eventId}-${Date.now()}`,
          type: 'delete',
          eventId,
          eventTitle: title,
          childId: childId || 'unknown',
          eventDate: targetEvent?.date || '',
          eventTime: targetEvent ? `${targetEvent.startTime} - ${targetEvent.endTime}` : '',
          summary: `Delete Event (Blueprint): ${title}`,
          sourceCalendarId: deleteCalId,
          payload: { sourceCalendarId: deleteCalId },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev, staged]);
      }
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
    const deleteCalId = targetEvent?.sourceCalendarId || activeCalendarId;
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setGaps((prev) => prev.filter((g) => g.eventId !== eventId));

    addToast(`Removed "${targetEvent?.title || 'Event'}" from ${targetEvent?.date || 'schedule'}`, 'info');

    if (GoogleCalendarService.isConnected()) {
      if (syncMode === 'immediate') {
        GoogleCalendarService.deleteEvent(deleteCalId, eventId)
          .catch((e) => console.warn('GCal delete single warning:', e));
      } else {
        const staged: StagedSyncItem = {
          id: `sync-delete-${eventId}-${Date.now()}`,
          type: 'delete',
          eventId,
          eventTitle: targetEvent?.title || 'Event',
          childId: targetEvent?.childId || 'unknown',
          eventDate: targetEvent?.date || '',
          eventTime: targetEvent ? `${targetEvent.startTime} - ${targetEvent.endTime}` : '',
          summary: `Delete Event Instance: ${targetEvent?.title || 'Event'} (${targetEvent?.date || ''})`,
          sourceCalendarId: deleteCalId,
          payload: { sourceCalendarId: deleteCalId },
          timestamp: Date.now()
        };
        updatePendingQueue((prev) => [...prev, staged]);
      }
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
        cloudSyncActive,
        caregiverCalendarMappings,
        setCaregiverCalendarMapping,
        autoDetectCalendarMappings,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        refreshCalendarEvents,
        syncMode,
        setSyncMode,
        pendingSyncQueue,
        isSyncReviewOpen,
        setIsSyncReviewOpen,
        pushStagedSyncToGoogle,
        discardStagedChanges,
        removeStagedItem,
        addNewEvent,
        deletePermanently,
        deleteSingleEvent,
        addCaregiver,
        updateCaregiver,
        deleteCaregiver,
        addChild,
        updateChild,
        deleteChild,
        addTemplate,
        updateTemplate,
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
