/**
 * Client-Side Google Calendar API v3 Service
 * Connects directly from the browser using Google Identity Services (GIS)
 * Enables live Google Calendar read/write without requiring a dedicated backend server.
 */

import { DispatchEvent, Caregiver, Child } from '../types/schedule';

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
   * Converts a Google Calendar API event item into our typed DispatchEvent
   */
  public static parseGCalEvent(
    gcalEvent: any,
    caregivers: Caregiver[],
    childrenList: Child[]
  ): DispatchEvent | null {
    if (!gcalEvent || !gcalEvent.id) return null;

    const summary = (gcalEvent.summary || '').trim();
    if (!summary) return null;

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
    let childId = 'izzy';
    const lowerSummary = summary.toLowerCase();
    const lowerDesc = (gcalEvent.description || '').toLowerCase();
    
    if (lowerSummary.includes('vale') || lowerDesc.includes('vale')) {
      childId = 'vale';
    } else if (lowerSummary.includes('izzy') || lowerDesc.includes('izzy')) {
      childId = 'izzy';
    }

    // Detect Category
    let category: 'dropoff' | 'pickup' | 'activity' | 'routine' = 'pickup';
    if (lowerSummary.includes('drop') || lowerSummary.includes('dropoff') || lowerSummary.includes('drop-off')) {
      category = 'dropoff';
    } else if (lowerSummary.includes('pick') || lowerSummary.includes('pickup') || lowerSummary.includes('pick-up')) {
      category = 'pickup';
    } else if (lowerSummary.includes('ballet') || lowerSummary.includes('gym') || lowerSummary.includes('soccer') || lowerSummary.includes('class')) {
      category = 'activity';
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

    // Detect Assigned Caregiver
    let assignedTo = 'unassigned';

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
}
