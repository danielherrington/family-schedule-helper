import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { 
  INITIAL_CAREGIVERS, 
  INITIAL_CHILDREN, 
  INITIAL_EVENT_TEMPLATES, 
  getWeekSchedule,
  Caregiver,
  Child,
  EventTemplate
} from './mock_data.js';
import { RecurrenceEngine, ReassignRequest } from './recurrence_engine.js';
import { GoogleCalendarClient } from './gcal_client.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Disk persistence for server templates
const TEMPLATES_STORE_FILE = path.resolve(process.cwd(), 'server/templates_store.json');

function loadTemplatesFromDisk(): EventTemplate[] {
  try {
    if (fs.existsSync(TEMPLATES_STORE_FILE)) {
      const content = fs.readFileSync(TEMPLATES_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Notice: Failed loading templates from disk, falling back to initial seeds.');
  }
  return [...INITIAL_EVENT_TEMPLATES];
}

function saveTemplatesToDisk(templates: EventTemplate[]): void {
  try {
    fs.writeFileSync(TEMPLATES_STORE_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Notice: Failed writing templates to disk.');
  }
}

// State store for Demo/Interactive Mode
let caregiversState: Caregiver[] = [...INITIAL_CAREGIVERS];
let childrenState: Child[] = [...INITIAL_CHILDREN];
let templatesState: EventTemplate[] = loadTemplatesFromDisk();
let eventsState = getWeekSchedule();
let holidaysState: { date: string; name: string; childId: string }[] = [];
let auditLog: any[] = [];

const gcalClient = new GoogleCalendarClient();

// --- API Endpoints ---

// 1. Health & Mode Status
app.get('/api/status', (req, res) => {
  const gcalStatus = gcalClient.getStatus();
  res.json({
    status: 'online',
    version: '1.2.0',
    app: 'Google Calendar Schedule Helper',
    mode: gcalStatus.isConfigured ? 'live_gcal' : 'demo_mode',
    gcalStatus
  });
});

// 2. Fetch Caregivers, Children & Templates Roster
app.get('/api/roster', (req, res) => {
  res.json({
    caregivers: caregiversState,
    children: childrenState,
    templates: templatesState,
    holidays: holidaysState
  });
});

// --- CAREGIVERS CRUD ---
app.get('/api/caregivers', (req, res) => {
  res.json({ caregivers: caregiversState });
});

app.post('/api/caregivers', (req, res) => {
  const { name, role, avatarColor, calendarId, isManager } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const newCaregiver: Caregiver = {
    id,
    name,
    role: role || 'Caregiver',
    avatarColor: avatarColor || '#6366f1',
    calendarId: calendarId || `${id}@herrington.ai`,
    isManager: !!isManager,
    avatarInitials: initials || 'CG'
  };

  caregiversState.push(newCaregiver);
  res.status(201).json({ success: true, caregiver: newCaregiver });
});

app.put('/api/caregivers/:id', (req, res) => {
  const { id } = req.params;
  const index = caregiversState.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Caregiver not found' });

  caregiversState[index] = { ...caregiversState[index], ...req.body };
  res.json({ success: true, caregiver: caregiversState[index] });
});

app.delete('/api/caregivers/:id', (req, res) => {
  const { id } = req.params;
  caregiversState = caregiversState.filter((c) => c.id !== id);
  res.json({ success: true, id });
});

// --- CHILDREN CRUD ---
app.get('/api/children', (req, res) => {
  res.json({ children: childrenState });
});

app.post('/api/children', (req, res) => {
  const { name, color, school } = req.body;
  if (!name) return res.status(400).json({ error: 'Child name is required' });

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const childColor = color || '#ec4899';

  const newChild: Child = {
    id,
    name,
    color: childColor,
    badgeBg: `rgba(${parseInt(childColor.slice(1, 3), 16) || 236}, ${parseInt(childColor.slice(3, 5), 16) || 72}, ${parseInt(childColor.slice(5, 7), 16) || 153}, 0.15)`,
    badgeBorder: `rgba(${parseInt(childColor.slice(1, 3), 16) || 236}, ${parseInt(childColor.slice(3, 5), 16) || 72}, ${parseInt(childColor.slice(5, 7), 16) || 153}, 0.4)`,
    school: school || 'School'
  };

  childrenState.push(newChild);
  res.status(201).json({ success: true, child: newChild });
});

app.put('/api/children/:id', (req, res) => {
  const { id } = req.params;
  const index = childrenState.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Child not found' });

  childrenState[index] = { ...childrenState[index], ...req.body };
  res.json({ success: true, child: childrenState[index] });
});

app.delete('/api/children/:id', (req, res) => {
  const { id } = req.params;
  childrenState = childrenState.filter((c) => c.id !== id);
  res.json({ success: true, id });
});

// --- EVENT TEMPLATES CRUD ---
app.get('/api/templates', (req, res) => {
  res.json({ templates: templatesState });
});

app.post('/api/templates', (req, res) => {
  const { title, childId, category, daysOfWeek, startTime, endTime, location, defaultCaregiverId, notes } = req.body;
  if (!title || !childId) return res.status(400).json({ error: 'Title and Child are required' });

  const newTemplate: EventTemplate = {
    id: `tpl-${Date.now()}`,
    title,
    childId,
    category: category || 'pickup',
    daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [1, 2, 3, 4, 5],
    startTime: startTime || '15:00',
    endTime: endTime || '15:30',
    location: location || 'School',
    defaultCaregiverId: defaultCaregiverId || 'daniel',
    notes
  };

  templatesState.push(newTemplate);
  saveTemplatesToDisk(templatesState);
  res.status(201).json({ success: true, template: newTemplate });
});

app.put('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const index = templatesState.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Template not found' });

  const prevTpl = templatesState[index];
  templatesState[index] = { ...templatesState[index], ...req.body };
  saveTemplatesToDisk(templatesState);

  // Sync any active server events that match this blueprint
  const targetTitle = prevTpl.title;
  eventsState = eventsState.map((evt) => {
    if (evt.masterSeriesId === id || evt.id.includes(id) || evt.title.toLowerCase() === targetTitle.toLowerCase()) {
      return {
        ...evt,
        ...(req.body.title ? { title: req.body.title } : {}),
        ...(req.body.childId ? { childId: req.body.childId } : {}),
        ...(req.body.category ? { category: req.body.category } : {}),
        ...(req.body.startTime ? { startTime: req.body.startTime } : {}),
        ...(req.body.endTime ? { endTime: req.body.endTime } : {}),
        ...(req.body.location ? { location: req.body.location } : {}),
        ...(req.body.defaultCaregiverId && evt.assignedTo === 'unassigned' ? { assignedTo: req.body.defaultCaregiverId } : {})
      };
    }
    return evt;
  });

  res.json({ success: true, template: templatesState[index] });
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  templatesState = templatesState.filter((t) => t.id !== id);
  saveTemplatesToDisk(templatesState);
  res.json({ success: true, id });
});

app.post('/api/templates/apply-week', (req, res) => {
  const { mondayDateStr } = req.body;
  if (!mondayDateStr) return res.status(400).json({ error: 'mondayDateStr is required' });

  const monday = new Date(mondayDateStr + 'T12:00:00');
  const generatedEvents: any[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + dayOffset);
    const dayOfWeek = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
    const dateStr = currentDay.toISOString().split('T')[0];

    const matchingTemplates = templatesState.filter((t) => t.daysOfWeek.includes(dayOfWeek));

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

  eventsState = eventsState.filter((e) => e.date < mondayDateStr || e.date > sundayStr).concat(generatedEvents);

  res.json({
    success: true,
    message: `Generated ${generatedEvents.length} events for week ${mondayDateStr} to ${sundayStr}`,
    count: generatedEvents.length,
    events: eventsState
  });
});

// --- SCHEDULE & REASSIGNMENT ---
app.get('/api/schedule', (req, res) => {
  const dateQuery = req.query.date as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  let filtered = [...eventsState];

  if (dateQuery) {
    filtered = filtered.filter((e) => e.date === dateQuery);
  } else if (startDate && endDate) {
    filtered = filtered.filter((e) => e.date >= startDate && e.date <= endDate);
  }

  res.json({
    date: dateQuery || 'all',
    count: filtered.length,
    events: filtered
  });
});

// Reassign Duty
app.post('/api/schedule/reassign', async (req, res) => {
  try {
    const payload: ReassignRequest = req.body;
    if (!payload.eventId || !payload.targetCaregiverId) {
      return res.status(400).json({ error: 'Missing required fields: eventId and targetCaregiverId' });
    }

    const { updatedEvents, result } = RecurrenceEngine.executeReassignment(eventsState, payload);
    eventsState = updatedEvents;
    auditLog.unshift(result);

    res.json({
      success: true,
      result,
      event: eventsState.find((e) => e.id === payload.eventId)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reassign event' });
  }
});

// Cancel Single Event for Holiday / No Class
app.post('/api/schedule/cancel-event', (req, res) => {
  try {
    const { eventId, reason } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const { updatedEvents, result } = RecurrenceEngine.cancelEventInstance(eventsState, eventId, reason || 'No Class / Holiday');
    eventsState = updatedEvents;
    auditLog.unshift(result);

    res.json({ success: true, result, event: eventsState.find((e) => e.id === eventId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel event' });
  }
});

// Mark Single Event as No Pickup Needed
app.post('/api/schedule/no-pickup-needed', (req, res) => {
  try {
    const { eventId, reason } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const { updatedEvents, result } = RecurrenceEngine.markNoPickupNeeded(eventsState, eventId, reason || 'No Pickup Needed');
    eventsState = updatedEvents;
    auditLog.unshift(result);

    res.json({ success: true, result, event: eventsState.find((e) => e.id === eventId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark as no pickup needed' });
  }
});

// Restore Cancelled Event
app.post('/api/schedule/restore-event', (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const { updatedEvents, result } = RecurrenceEngine.restoreEventInstance(eventsState, eventId);
    eventsState = updatedEvents;
    auditLog.unshift(result);

    res.json({ success: true, result, event: eventsState.find((e) => e.id === eventId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to restore event' });
  }
});

// Delete Single Event Occurrence
app.delete('/api/schedule/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { updatedEvents, result } = RecurrenceEngine.deleteSingleEvent(eventsState, id);
    eventsState = updatedEvents;
    auditLog.unshift(result);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
});

// Permanently Delete Recurring Series & Blueprint Template
app.post('/api/schedule/delete-permanent', (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const { updatedEvents, updatedTemplates, result } = RecurrenceEngine.deletePermanently(
      eventsState,
      templatesState,
      eventId
    );
    eventsState = updatedEvents;
    templatesState = updatedTemplates;
    auditLog.unshift(result);

    res.json({ success: true, result, events: eventsState, templates: templatesState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete permanently' });
  }
});

// Add New Event (Single or Recurring)
app.post('/api/schedule/add-event', (req, res) => {
  try {
    const {
      title,
      childId,
      category,
      date,
      startTime,
      endTime,
      location,
      assignedTo,
      isRecurring,
      recurringDays,
      notes
    } = req.body;

    if (!title || !childId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required event parameters' });
    }

    const newEventId = `evt-${Date.now()}`;
    const newEventsToAdd: any[] = [];

    if (isRecurring && Array.isArray(recurringDays) && recurringDays.length > 0) {
      const templateId = `tpl-${Date.now()}`;
      const newTemplate: EventTemplate = {
        id: templateId,
        title,
        childId,
        category: category || 'pickup',
        daysOfWeek: recurringDays,
        startTime,
        endTime,
        location: location || 'School',
        defaultCaregiverId: assignedTo || 'daniel',
        notes
      };
      templatesState.push(newTemplate);

      // Generate for the current week of the given date
      const baseDate = new Date(date + 'T12:00:00');
      const dayOfWeek = baseDate.getDay();
      const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(baseDate.setDate(diff));

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dNum = d.getDay() === 0 ? 7 : d.getDay();
        if (recurringDays.includes(dNum)) {
          const dStr = d.toISOString().split('T')[0];
          newEventsToAdd.push({
            id: `evt-${dStr}-${templateId}`,
            title,
            childId,
            assignedTo: assignedTo || 'daniel',
            date: dStr,
            startTime,
            endTime,
            location: location || 'School',
            category: category || 'pickup',
            isRecurringMaster: true,
            masterSeriesId: templateId,
            notes,
            status: assignedTo === 'unassigned' ? 'unassigned' : 'confirmed'
          });
        }
      }
    } else {
      // One-off single event
      newEventsToAdd.push({
        id: newEventId,
        title,
        childId,
        assignedTo: assignedTo || 'daniel',
        date,
        startTime,
        endTime,
        location: location || 'School',
        category: category || 'pickup',
        isRecurringMaster: false,
        notes,
        status: assignedTo === 'unassigned' ? 'unassigned' : 'confirmed'
      });
    }

    eventsState = [...eventsState, ...newEventsToAdd];

    auditLog.unshift({
      success: true,
      eventId: newEventId,
      previousAssignee: 'none',
      newAssignee: assignedTo || 'daniel',
      date,
      isException: false,
      actionTaken: 'reassigned_in_memory',
      message: `Added ${isRecurring ? 'recurring' : 'one-off'} event "${title}" for ${childId.toUpperCase()} (${startTime} - ${endTime}).`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      addedCount: newEventsToAdd.length,
      events: newEventsToAdd,
      allEvents: eventsState
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add event' });
  }
});

// Mark Whole Day as Holiday
app.post('/api/schedule/mark-day-holiday', (req, res) => {
  try {
    const { date, holidayName, childId } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required' });

    const name = holidayName || 'School Holiday / No School';
    const { updatedEvents, cancelledCount } = RecurrenceEngine.markDayAsHoliday(eventsState, date, name, childId || 'all');
    eventsState = updatedEvents;

    holidaysState.push({ date, name, childId: childId || 'all' });
    auditLog.unshift({
      success: true,
      date,
      actionTaken: 'cancelled_holiday',
      message: `Marked ${date} as Holiday ("${name}"): ${cancelledCount} duties cancelled.`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, cancelledCount, date, name, events: eventsState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to set holiday' });
  }
});

app.get('/api/schedule/gaps', (req, res) => {
  const dateQuery = req.query.date as string;
  const gaps = RecurrenceEngine.detectGaps(eventsState, dateQuery);
  res.json({ count: gaps.length, gaps });
});

// Sunday Night Alert Simulation / Trigger
app.post('/api/alerts/sunday-test', (req, res) => {
  const { recipients, time, dateRange } = req.body;
  const gaps = RecurrenceEngine.detectGaps(eventsState);
  
  auditLog.unshift({
    success: true,
    eventId: 'sunday-alert',
    previousAssignee: 'system',
    newAssignee: 'email-dispatch',
    date: new Date().toISOString().split('T')[0],
    isException: false,
    actionTaken: 'reassigned_in_memory',
    message: `Dispatched Sunday Night Schedule Alert to ${recipients?.join(', ') || 'parents'}. Active gaps: ${gaps.length}.`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Sunday Night Reminder sent to ${recipients?.length || 2} recipients for week ${dateRange || 'upcoming'}.`,
    recipients,
    time: time || '19:00',
    gapsCount: gaps.length
  });
});

app.post('/api/schedule/reset', (req, res) => {
  eventsState = getWeekSchedule();
  caregiversState = [...INITIAL_CAREGIVERS];
  childrenState = [...INITIAL_CHILDREN];
  templatesState = [...INITIAL_EVENT_TEMPLATES];
  holidaysState = [];
  auditLog = [];
  res.json({ success: true, message: 'Schedule and roster reset to default demo seed.' });
});

app.get('/api/audit-log', (req, res) => {
  res.json({ total: auditLog.length, logs: auditLog });
});

app.get('/api/auth/google/url', (req, res) => {
  const authUrl = gcalClient.getAuthUrl();
  res.json({ authUrl });
});

app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Authorization code required' });
    const tokens = await gcalClient.setAuthCode(code);
    res.json({ success: true, tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OAuth token exchange failed' });
  }
});

app.get('/api/calendars', async (req, res) => {
  try {
    const list = await gcalClient.listCalendars();
    res.json({ calendars: list });
  } catch (err: any) {
    res.json({ calendars: [] });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Google Calendar Schedule Helper API running on http://127.0.0.1:${PORT}`);
});
