/**
 * Client-Side Google Calendar API v3 Service
 * Connects directly from the browser using Google Identity Services (GIS)
 * Enables live Google Calendar read/write without requiring a dedicated backend server.
 */

import { DispatchEvent, Caregiver, Child, EventTemplate } from '../types/schedule';

declare const google: any;

export const GOOGLE_CLIENT_ID = 
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  '86168229528-ikmsu51fk9olk4cpskipg2v0h5935pcv.apps.googleusercontent.com';

export interface GCalUserCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole?: string;
}

const STORAGE_KEY_TOKEN = 'gcal_access_token';
const STORAGE_KEY_EXPIRES = 'gcal_token_expires_at';
const STORAGE_KEY_CALENDAR_ID = 'gcal_active_calendar_id';
const STORAGE_KEY_ACCOUNT = 'gcal_connected_email';

export class GoogleCalendarService {
  private static tokenClient: any = null;

  public static isGisLoaded(): boolean {
    return typeof google !== 'undefined' && !!google.accounts && !!google.accounts.oauth2;
  }

  public static getStoredToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEY_EXPIRES);
    if (!token || !expiresAt) return null;
    if (Date.now() > parseInt(expiresAt, 10)) {
      this.disconnect();
      return null;
    }
    return token;
  }

  public static getActiveCalendarId(): string {
    return localStorage.getItem(STORAGE_KEY_CALENDAR_ID) || 'primary';
  }

  public static setActiveCalendarId(calendarId: string) {
    localStorage.setItem(STORAGE_KEY_CALENDAR_ID, calendarId);
  }

  public static getConnectedEmail(): string | null {
    return localStorage.getItem(STORAGE_KEY_ACCOUNT);
  }

  public static setConnectedEmail(email: string) {
    localStorage.setItem(STORAGE_KEY_ACCOUNT, email);
  }

  public static isConnected(): boolean {
    return !!this.getStoredToken();
  }

  public static disconnect() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
    localStorage.removeItem(STORAGE_KEY_ACCOUNT);
  }

  /**
   * Triggers the Google OAuth popup flow
   */
  public static requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isGisLoaded()) {
        reject(new Error('Google Identity Services library is still loading. Please try again in 2 seconds.'));
        return;
      }

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email',
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Google OAuth authorization blocked or cancelled. Check Authorized JavaScript origins in Google Cloud Console.'));
        },
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          const accessToken = response.access_token;
          const expiresInSeconds = parseInt(response.expires_in || '3599', 10);
          const expiresAt = Date.now() + expiresInSeconds * 1000;

          localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt.toString());

          // Try fetching user email
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              if (userData.email) {
                this.setConnectedEmail(userData.email);
              }
            }
          } catch (e) {}

          resolve(accessToken);
        }
      });

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Lists available Google Calendars in the manager's account
   */
  public static async listCalendars(): Promise<GCalUserCalendar[]> {
    const token = this.getStoredToken();
    if (!token) return [];

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) this.disconnect();
      throw new Error(`Failed to list calendars (${res.status})`);
    }

    const data = await res.json();
    return (data.items || []).map((cal: any) => ({
      id: cal.id,
      summary: cal.summary || 'Untitled Calendar',
      description: cal.description,
      primary: !!cal.primary,
      backgroundColor: cal.backgroundColor || '#00B4D8',
      accessRole: cal.accessRole
    }));
  }

  /**
   * Fetches events for a given week date range
   */
  public static async fetchEventsForRange(
    calendarId: string = 'primary',
    mondayDateStr: string,
    sundayDateStr: string
  ): Promise<any[]> {
    const token = this.getStoredToken();
    if (!token) return [];

    const timeMin = new Date(`${mondayDateStr}T00:00:00`).toISOString();
    const timeMax = new Date(`${sundayDateStr}T23:59:59`).toISOString();

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.append('timeMin', timeMin);
    url.searchParams.append('timeMax', timeMax);
    url.searchParams.append('singleEvents', 'true'); // Expands recurring rules into standalone instances!
    url.searchParams.append('orderBy', 'startTime');
    url.searchParams.append('maxResults', '250');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) this.disconnect();
      throw new Error(`Failed to fetch events from Google Calendar (${res.status})`);
    }

    const data = await res.json();
    return data.items || [];
  }

  /**
   * Checks if a Google Calendar event matches our kid logistics blueprints.
   * Only events that match a configured blueprint or are explicit helper events will be accepted.
   */
  public static matchesBlueprint(
    summary: string,
    description: string = '',
    templates: EventTemplate[] = [],
    childrenList: Child[] = []
  ): { matches: boolean; matchedTemplate?: EventTemplate; childId?: string; category?: 'dropoff' | 'pickup' | 'activity' | 'routine' } {
    if (!summary) return { matches: false };

    const lowerSummary = summary.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();

    // 1. Explicit helper tag check: created or updated by this helper
    if (
      lowerDesc.includes('schedule helper') || 
      lowerDesc.includes('[child logistics]') || 
      lowerDesc.includes('assigned driver:')
    ) {
      return { matches: true };
    }

    // 2. Strip bracketed driver tags and parenthetical tags from summary
    // e.g. "[Daniel] Vale School Drop Off" -> "Vale School Drop Off"
    const cleaned = summary
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();

    if (!cleaned) return { matches: false };

    // 3. Match against configured blueprint templates
    for (const tpl of templates) {
      const tplTitle = tpl.title.toLowerCase().trim();

      // Direct exact or substring match with template title
      if (cleaned === tplTitle || lowerSummary.includes(tplTitle) || (cleaned.length >= 5 && tplTitle.includes(cleaned))) {
        return { 
          matches: true, 
          matchedTemplate: tpl, 
          childId: tpl.childId,
          category: tpl.category
        };
      }

      // Check child name associated with template
      const child = childrenList.find((c) => c.id === tpl.childId);
      const childName = (child?.name || tpl.childId).toLowerCase();

      const mentionsChild = lowerSummary.includes(childName) || lowerDesc.includes(childName);

      if (mentionsChild) {
        // Dropoff match
        if (tpl.category === 'dropoff' && (lowerSummary.includes('drop') || lowerSummary.includes('dropoff') || lowerSummary.includes('drop-off'))) {
          return { matches: true, matchedTemplate: tpl, childId: tpl.childId, category: 'dropoff' };
        }
        // Pickup match
        if (tpl.category === 'pickup' && (lowerSummary.includes('pick') || lowerSummary.includes('pickup') || lowerSummary.includes('pick-up') || lowerSummary.includes('abu'))) {
          return { matches: true, matchedTemplate: tpl, childId: tpl.childId, category: 'pickup' };
        }

        // Activity / custom keyword match from template title
        const tplWords = tplTitle
          .split(/[\s-]+/)
          .map((w) => w.replace(/[^a-z0-9]/g, ''))
          .filter((w) => w.length >= 3 && !['school', 'pick', 'drop', 'off', 'with', 'the', 'for', childName].includes(w));

        for (const w of tplWords) {
          if (lowerSummary.includes(w) || lowerDesc.includes(w)) {
            return { matches: true, matchedTemplate: tpl, childId: tpl.childId, category: tpl.category };
          }
        }
      } else {
        // Distinct activity name match without explicit child name in title (e.g. "Ballet", "Gymnastics", "Chess")
        const uniqueActivityWords = tplTitle
          .split(/[\s-]+/)
          .map((w) => w.replace(/[^a-z0-9]/g, ''))
          .filter((w) => ['ballet', 'gymnastics', 'chess', 'karate', 'soccer', 'swimming', 'dance', 'piano', 'martial'].includes(w));

        for (const w of uniqueActivityWords) {
          if (lowerSummary.includes(w) || lowerDesc.includes(w)) {
            return { matches: true, matchedTemplate: tpl, childId: tpl.childId, category: tpl.category };
          }
        }
      }
    }

    return { matches: false };
  }

  /**
   * Converts a Google Calendar API event item into our typed DispatchEvent
   * Strictly filters to ONLY events that match configured kid logistics blueprints.
   */
  public static parseGCalEvent(
    gcalEvent: any,
    caregivers: Caregiver[],
    childrenList: Child[],
    overrideCaregiverId?: string,
    sourceCalendarId?: string,
    templates?: EventTemplate[]
  ): DispatchEvent | null {
    if (!gcalEvent || !gcalEvent.id) return null;

    const summary = (gcalEvent.summary || '').trim();
    if (!summary) return null;

    // Filter to ONLY events that match kid logistics blueprints!
    let matchedChildId: string | undefined;
    let matchedCategory: 'dropoff' | 'pickup' | 'activity' | 'routine' | undefined;

    if (templates && templates.length > 0) {
      const matchResult = this.matchesBlueprint(summary, gcalEvent.description, templates, childrenList);
      if (!matchResult.matches) {
        // Unrelated event on family calendar (e.g. doctor, meeting, flight, dinner) -> ignore completely!
        return null;
      }
      matchedChildId = matchResult.childId;
      matchedCategory = matchResult.category;
    }

    // Determine event date and times
    let dateStr = '';
    let startTimeStr = '08:00';
    let endTimeStr = '08:30';

    if (gcalEvent.start?.dateTime) {
      const startD = new Date(gcalEvent.start.dateTime);
      dateStr = startD.toISOString().split('T')[0];
      startTimeStr = startD.toTimeString().substring(0, 5);

      if (gcalEvent.end?.dateTime) {
        const endD = new Date(gcalEvent.end.dateTime);
        endTimeStr = endD.toTimeString().substring(0, 5);
      }
    } else if (gcalEvent.start?.date) {
      dateStr = gcalEvent.start.date;
      startTimeStr = '08:00';
      endTimeStr = '08:30';
    }

    if (!dateStr) return null;

    // Detect Child
    let childId = matchedChildId || 'izzy';
    const lowerSummary = summary.toLowerCase();
    const lowerDesc = (gcalEvent.description || '').toLowerCase();
    
    if (!matchedChildId) {
      if (lowerSummary.includes('vale') || lowerDesc.includes('vale')) {
        childId = 'vale';
      } else if (lowerSummary.includes('izzy') || lowerDesc.includes('izzy')) {
        childId = 'izzy';
      }
    }

    // Detect Category
    let category: 'dropoff' | 'pickup' | 'activity' | 'routine' = matchedCategory || 'pickup';
    if (!matchedCategory) {
      if (lowerSummary.includes('drop') || lowerSummary.includes('dropoff') || lowerSummary.includes('drop-off')) {
        category = 'dropoff';
      } else if (lowerSummary.includes('pick') || lowerSummary.includes('pickup') || lowerSummary.includes('pick-up')) {
        category = 'pickup';
      } else if (lowerSummary.includes('ballet') || lowerSummary.includes('gym') || lowerSummary.includes('soccer') || lowerSummary.includes('class')) {
        category = 'activity';
      }
    }

    // Detect Status
    let status: 'confirmed' | 'unassigned' | 'cancelled' | 'no_pickup_needed' = 'confirmed';
    let cancellationReason: string | undefined = undefined;

    if (lowerSummary.includes('[no pickup') || lowerSummary.includes('no pickup needed') || lowerDesc.includes('no pickup')) {
      status = 'no_pickup_needed';
      cancellationReason = 'Marked No Pickup in Calendar';
    } else if (gcalEvent.status === 'cancelled' || lowerSummary.includes('cancelled') || lowerSummary.includes('holiday') || lowerSummary.includes('no school')) {
      status = 'cancelled';
      cancellationReason = 'Calendar Event Cancelled';
    }

    // Detect Assigned Caregiver:
    // If the event comes from a specific caregiver's calendar (e.g. Family - Daniel),
    // it belongs to that caregiver directly!
    let assignedTo = (overrideCaregiverId && overrideCaregiverId !== 'shared') ? overrideCaregiverId : 'unassigned';

    // 1. Check title prefix tags: e.g. [Daniel], [Lucila], [Elizabeth], [Matilda], DH, LU, EH, MA
    for (const cg of caregivers) {
      const firstName = cg.name.split(' ')[0].toLowerCase();
      const initials = cg.avatarInitials.toLowerCase();
      if (
        lowerSummary.includes(`[${firstName}]`) || 
        lowerSummary.includes(`(${firstName})`) || 
        lowerSummary.startsWith(`${firstName}:`) ||
        lowerSummary.startsWith(`${firstName} `) ||
        lowerSummary.includes(`[${initials}]`) ||
        lowerSummary.includes(` ${initials} `)
      ) {
        assignedTo = cg.id;
        break;
      }
    }

    // 2. Check attendees
    if (assignedTo === 'unassigned' && Array.isArray(gcalEvent.attendees)) {
      for (const att of gcalEvent.attendees) {
        const attEmail = (att.email || '').toLowerCase();
        const matchedCg = caregivers.find((c) => c.calendarId && attEmail.includes(c.calendarId.toLowerCase()));
        if (matchedCg) {
          assignedTo = matchedCg.id;
          break;
        }
      }
    }

    // 3. Check extended properties or description
    if (assignedTo === 'unassigned' && gcalEvent.description) {
      for (const cg of caregivers) {
        const firstName = cg.name.split(' ')[0].toLowerCase();
        if (lowerDesc.includes(`driver: ${firstName}`) || lowerDesc.includes(`assigned: ${firstName}`)) {
          assignedTo = cg.id;
          break;
        }
      }
    }

    if (status !== 'cancelled' && status !== 'no_pickup_needed' && assignedTo === 'unassigned') {
      status = 'unassigned';
    }

    // Clean title for display (remove tag brackets)
    const displayTitle = summary
      .replace(/\[.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || summary;

    return {
      id: gcalEvent.id,
      title: displayTitle,
      childId,
      assignedTo,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      location: gcalEvent.location || 'School',
      category,
      isRecurringMaster: !!gcalEvent.recurringEventId,
      masterSeriesId: gcalEvent.recurringEventId,
      notes: gcalEvent.description,
      sourceCalendarId,
      status,
      cancellationReason
    };
  }

  /**
   * Updates an event's driver / assignment in Google Calendar
   */
  public static async patchEventAssignment(
    calendarId: string = 'primary',
    eventId: string,
    currentEvent: DispatchEvent,
    newCaregiver: Caregiver | null
  ): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    const newDriverTag = newCaregiver ? `[${newCaregiver.name.split(' ')[0]}]` : '[Unassigned]';
    const cleanTitle = currentEvent.title.replace(/\[.*?\]/g, '').trim();
    const updatedSummary = `${newDriverTag} ${cleanTitle}`;

    const patchBody: any = {
      summary: updatedSummary,
      description: `${currentEvent.notes || ''}\n\nAssigned Driver: ${newCaregiver ? newCaregiver.name : 'Unassigned'} (Updated via Los Herringtons Schedule Helper)`
    };

    if (newCaregiver && newCaregiver.calendarId && newCaregiver.calendarId.includes('@')) {
      patchBody.attendees = [{ email: newCaregiver.calendarId, responseStatus: 'accepted' }];
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchBody)
      }
    );

    return res.ok;
  }

  /**
   * Marks event as No Pickup Needed in Google Calendar
   */
  public static async patchEventNoPickup(
    calendarId: string = 'primary',
    eventId: string,
    currentEvent: DispatchEvent,
    reason: string
  ): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    const cleanTitle = currentEvent.title.replace(/\[.*?\]/g, '').trim();
    const updatedSummary = `[No Pickup] ${cleanTitle}`;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: updatedSummary,
          description: `${currentEvent.notes || ''}\n\nNo Pickup Needed: ${reason} (via Schedule Helper)`
        })
      }
    );

    return res.ok;
  }

  /**
   * Adds a new event to Google Calendar
   */
  public static async createEvent(
    calendarId: string = 'primary',
    eventData: {
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      location?: string;
      notes?: string;
      driverName?: string;
    }
  ): Promise<any> {
    const token = this.getStoredToken();
    if (!token) return null;

    const tag = eventData.driverName ? `[${eventData.driverName}] ` : '';
    const summary = `${tag}${eventData.title}`;
    const startIso = `${eventData.date}T${eventData.startTime}:00`;
    const endIso = `${eventData.date}T${eventData.endTime}:00`;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary,
          location: eventData.location,
          description: eventData.notes,
          start: { dateTime: new Date(startIso).toISOString() },
          end: { dateTime: new Date(endIso).toISOString() }
        })
      }
    );

    if (res.ok) {
      return await res.json();
    }
    return null;
  }

  /**
   * Deletes an event from Google Calendar
   */
  public static async deleteEvent(
    calendarId: string = 'primary',
    eventId: string
  ): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return res.ok || res.status === 404 || res.status === 410;
  }

  /**
   * Moves an event from one Google Calendar to another (e.g. from Family - Daniel to Family - Lucila)
   * Uses Google Calendar API events.move, with automatic copy & delete fallback.
   */
  public static async moveEvent(
    sourceCalendarId: string,
    eventId: string,
    destinationCalendarId: string
  ): Promise<{ success: boolean; newEventId?: string }> {
    const token = this.getStoredToken();
    if (!token) return { success: false };

    if (!sourceCalendarId || !destinationCalendarId || sourceCalendarId === destinationCalendarId) {
      return { success: true, newEventId: eventId };
    }

    try {
      // 1. Try native Google Calendar API events.move endpoint
      const moveUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(sourceCalendarId)}/events/${encodeURIComponent(eventId)}/move?destination=${encodeURIComponent(destinationCalendarId)}`;
      const res = await fetch(moveUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const moved = await res.json();
        return { success: true, newEventId: moved.id };
      }

      console.warn(`Native events.move returned ${res.status}, attempting copy & delete fallback...`);
    } catch (e) {
      console.warn('Native events.move failed, falling back to copy & delete:', e);
    }

    // 2. Fallback: fetch event from source, create in target, delete from source
    try {
      const getUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(sourceCalendarId)}/events/${encodeURIComponent(eventId)}`;
      const getRes = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!getRes.ok) {
        throw new Error(`Failed to fetch source event (${getRes.status})`);
      }

      const originalEvent = await getRes.json();
      const payload: any = {
        summary: originalEvent.summary,
        description: originalEvent.description,
        location: originalEvent.location,
        start: originalEvent.start,
        end: originalEvent.end
      };

      const createRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(destinationCalendarId)}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!createRes.ok) {
        throw new Error(`Failed to recreate event in target calendar (${createRes.status})`);
      }

      const created = await createRes.json();

      // Cleanly delete from source calendar
      await this.deleteEvent(sourceCalendarId, eventId);

      return { success: true, newEventId: created.id };
    } catch (err) {
      console.error('Cross-calendar fallback move failed:', err);
      return { success: false };
    }
  }

  /**
   * Fetches and aggregates events across multiple family Google Calendars concurrently
   */
  public static async fetchMultiCalendarEvents(
    calendarConfigs: { calendarId: string; caregiverId?: string }[],
    mondayDateStr: string,
    sundayDateStr: string,
    caregivers: Caregiver[],
    childrenList: Child[],
    templates: EventTemplate[] = []
  ): Promise<DispatchEvent[]> {
    const token = this.getStoredToken();
    if (!token || !calendarConfigs.length) return [];

    const results = await Promise.allSettled(
      calendarConfigs.map(async (cfg) => {
        const rawItems = await this.fetchEventsForRange(cfg.calendarId, mondayDateStr, sundayDateStr);
        return rawItems.map((raw) => {
          return this.parseGCalEvent(
            raw, 
            caregivers, 
            childrenList, 
            cfg.caregiverId, 
            cfg.calendarId,
            templates
          );
        }).filter(Boolean) as DispatchEvent[];
      })
    );

    const allEvents: DispatchEvent[] = [];
    for (const res of results) {
      if (res.status === 'fulfilled') {
        allEvents.push(...res.value);
      }
    }

    return allEvents;
  }
}
