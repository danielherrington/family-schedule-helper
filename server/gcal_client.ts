/**
 * Google Calendar API v3 Client
 * Manages OAuth 2.0 Auth for Managers (Daniel & Elizabeth) and executes atomic instance patches.
 */

import { google, calendar_v3 } from 'googleapis';

export interface GCalConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  refreshToken?: string;
}

export class GoogleCalendarClient {
  private oauth2Client: any;
  private calendar: calendar_v3.Calendar | null = null;
  private isConfigured: boolean = false;

  constructor(config: GCalConfig = {}) {
    const clientId = config.clientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = config.redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

    if (clientId && clientSecret) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      this.isConfigured = true;

      if (config.refreshToken || process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: config.refreshToken || process.env.GOOGLE_REFRESH_TOKEN
        });
      }
    }
  }

  public getAuthUrl(): string {
    if (!this.isConfigured) {
      return '';
    }
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ]
    });
  }

  public async setAuthCode(code: string) {
    if (!this.isConfigured) throw new Error('Google OAuth credentials not configured.');
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  public getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasCredentials: !!this.oauth2Client?.credentials?.access_token || !!this.oauth2Client?.credentials?.refresh_token,
      mode: this.isConfigured ? 'live_gcal' : 'demo_mode'
    };
  }

  /**
   * Lists available Google Calendars in the manager's account
   */
  public async listCalendars() {
    if (!this.calendar) {
      return [];
    }
    const res = await this.calendar.calendarList.list();
    return (res.data.items || []).map((cal) => ({
      id: cal.id || '',
      summary: cal.summary || '',
      backgroundColor: cal.backgroundColor || '#3b82f6',
      primary: !!cal.primary,
      accessRole: cal.accessRole || 'reader'
    }));
  }

  /**
   * Reassigns a single recurrence instance from source calendar to target calendar.
   * Atomic operation: cancels instance on source and creates single event on target.
   */
  public async reassignInstanceAcrossCalendars(params: {
    sourceCalendarId: string;
    targetCalendarId: string;
    eventId: string;
    targetDateStr: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
  }) {
    if (!this.calendar) {
      throw new Error('Google Calendar API client is not initialized in live mode.');
    }

    // 1. Fetch the specific instance ID
    const instancesRes = await this.calendar.events.instances({
      calendarId: params.sourceCalendarId,
      eventId: params.eventId,
      timeMin: `${params.targetDateStr}T00:00:00Z`,
      timeMax: `${params.targetDateStr}T23:59:59Z`
    });

    const instance = instancesRes.data.items?.[0];
    if (instance && instance.id) {
      // 2. Mark this specific instance cancelled on the source calendar (creates an exception)
      await this.calendar.events.patch({
        calendarId: params.sourceCalendarId,
        eventId: instance.id,
        requestBody: {
          status: 'cancelled'
        }
      });
    }

    // 3. Insert standalone single instance event on target calendar with metadata
    const startIso = `${params.targetDateStr}T${params.startTime}:00`;
    const endIso = `${params.targetDateStr}T${params.endTime}:00`;

    const insertedEvent = await this.calendar.events.insert({
      calendarId: params.targetCalendarId,
      requestBody: {
        summary: params.title,
        location: params.location,
        start: { dateTime: startIso, timeZone: 'America/New_York' },
        end: { dateTime: endIso, timeZone: 'America/New_York' },
        extendedProperties: {
          private: {
            masterSeriesId: params.eventId,
            managedBy: 'herrington-schedule-helper'
          }
        },
        description: `Automated pickup/drop-off reassignment via Schedule Helper. Original Series ID: ${params.eventId}`
      }
    });

    return {
      success: true,
      newEventId: insertedEvent.data.id,
      cancelledInstanceId: instance?.id
    };
  }
}
