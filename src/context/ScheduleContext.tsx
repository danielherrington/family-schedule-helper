import React, { createContext, useContext, useState, useEffect } from 'react';
import { Caregiver, Child, DispatchEvent, ScheduleGap, CaregiverId, EventTemplate, DayHoliday } from '../types/schedule';
import { 
  DEFAULT_CAREGIVERS, 
  DEFAULT_CHILDREN, 
  DEFAULT_TEMPLATES, 
  DEFAULT_WEEK_EVENTS 
} from './defaultSeed';

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
  viewMode: 'calendar' | 'daily' | 'weekly';
  gaps: ScheduleGap[];
  isLoading: boolean;
  toasts: Toast[];
  authStatus: { mode: 'demo_mode' | 'live_gcal'; isConfigured: boolean };
  reassignModalEvent: DispatchEvent | null;
  isSettingsOpen: boolean;
  isAuditLogOpen: boolean;
  isSetupOpen: boolean;
  activeSetupTab: 'caregivers' | 'kids' | 'blueprint';
  
  // Actions
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'calendar' | 'daily' | 'weekly') => void;
  reassignEvent: (eventId: string, targetCaregiverId: CaregiverId, reason?: string) => Promise<void>;
  cancelEventInstance: (eventId: string, reason?: string) => Promise<void>;
  restoreEventInstance: (eventId: string) => Promise<void>;
  markDayAsHoliday: (dateStr: string, holidayName: string, childId?: string) => Promise<void>;
  setReassignModalEvent: (event: DispatchEvent | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsAuditLogOpen: (open: boolean) => void;
  setIsSetupOpen: (open: boolean) => void;
  setActiveSetupTab: (tab: 'caregivers' | 'kids' | 'blueprint') => void;
  resetToDemoSchedule: () => Promise<void>;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  changeDateByDays: (days: number) => void;

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
    mode: 'demo_mode',
    isConfigured: false
  });
  const [reassignModalEvent, setReassignModalEvent] = useState<DispatchEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [activeSetupTab, setActiveSetupTab] = useState<'caregivers' | 'kids' | 'blueprint'>('caregivers');

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = async () => {
    try {
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

      if (scheduleRes && scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        if (scheduleData.events?.length) setEvents(scheduleData.events);
      }

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setAuthStatus({
          mode: statusData.mode || 'demo_mode',
          isConfigured: statusData.gcalStatus?.isConfigured || false
        });
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

    try {
      await fetch('/api/schedule/cancel-event', {
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
        restoreEventInstance,
        markDayAsHoliday,
        setReassignModalEvent,
        setIsSettingsOpen,
        setIsAuditLogOpen,
        setIsSetupOpen,
        setActiveSetupTab,
        resetToDemoSchedule,
        addToast,
        removeToast,
        changeDateByDays,
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
