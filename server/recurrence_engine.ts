/**
 * Recurrence Engine: Atomic Single-Instance Exception Splitter & Holiday Cancellation
 */

export interface ReassignRequest {
  eventId: string;
  targetCaregiverId: string;
  targetCalendarId?: string;
  sourceCalendarId?: string;
  date: string;
  reason?: string;
}

export interface ReassignResult {
  success: boolean;
  eventId: string;
  previousAssignee: string;
  newAssignee: string;
  date: string;
  isException: boolean;
  actionTaken: 'atomic_split' | 'reassigned_in_memory' | 'cancelled_holiday' | 'restored';
  message: string;
  timestamp: string;
}

export class RecurrenceEngine {
  /**
   * Performs the atomic instance reassignment logic
   */
  public static executeReassignment(
    eventsList: any[],
    request: ReassignRequest
  ): { updatedEvents: any[]; result: ReassignResult } {
    const eventIndex = eventsList.findIndex((e) => e.id === request.eventId);
    
    if (eventIndex === -1) {
      throw new Error(`Event with ID ${request.eventId} not found.`);
    }

    const event = { ...eventsList[eventIndex] };
    const previousAssignee = event.assignedTo;

    const isMasterOrRecurring = event.isRecurringMaster || !!event.masterSeriesId;

    event.assignedTo = request.targetCaregiverId;
    event.isException = isMasterOrRecurring;
    event.status = request.targetCaregiverId === 'unassigned' ? 'unassigned' : 'confirmed';
    event.cancellationReason = undefined; // Clear any cancellation
    if (request.reason) {
      event.notes = request.reason;
    }

    const updatedEvents = [...eventsList];
    updatedEvents[eventIndex] = event;

    const result: ReassignResult = {
      success: true,
      eventId: event.id,
      previousAssignee,
      newAssignee: request.targetCaregiverId,
      date: event.date,
      isException: isMasterOrRecurring,
      actionTaken: isMasterOrRecurring ? 'atomic_split' : 'reassigned_in_memory',
      message: `Successfully transferred "${event.title}" to ${request.targetCaregiverId} without duplicating recurring rules.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, result };
  }

  /**
   * Cancels a single event instance for holiday / no class
   */
  public static cancelEventInstance(
    eventsList: any[],
    eventId: string,
    reason: string = 'No Class / Holiday'
  ): { updatedEvents: any[]; result: ReassignResult } {
    const eventIndex = eventsList.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) throw new Error(`Event ${eventId} not found`);

    const event = { ...eventsList[eventIndex] };
    const previousAssignee = event.assignedTo;

    event.status = 'cancelled';
    event.isException = true;
    event.cancellationReason = reason;

    const updatedEvents = [...eventsList];
    updatedEvents[eventIndex] = event;

    const result: ReassignResult = {
      success: true,
      eventId: event.id,
      previousAssignee,
      newAssignee: 'cancelled',
      date: event.date,
      isException: true,
      actionTaken: 'cancelled_holiday',
      message: `Marked "${event.title}" as cancelled (${reason}) for ${event.date}.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, result };
  }

  /**
   * Marks a single event as No Pickup / Drop-off Needed (playdate, after-school program, etc.)
   */
  public static markNoPickupNeeded(
    eventsList: any[],
    eventId: string,
    reason: string = 'No Pickup Needed'
  ): { updatedEvents: any[]; result: ReassignResult } {
    const eventIndex = eventsList.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) throw new Error(`Event ${eventId} not found`);

    const event = { ...eventsList[eventIndex] };
    const previousAssignee = event.assignedTo;

    event.status = 'no_pickup_needed';
    event.isException = true;
    event.cancellationReason = reason;

    const updatedEvents = [...eventsList];
    updatedEvents[eventIndex] = event;

    const result: ReassignResult = {
      success: true,
      eventId: event.id,
      previousAssignee,
      newAssignee: 'none',
      date: event.date,
      isException: true,
      actionTaken: 'cancelled_holiday',
      message: `Marked "${event.title}" as No Pickup Needed (${reason}) for ${event.date}.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, result };
  }

  /**
   * Restores a previously cancelled event
   */
  public static restoreEventInstance(
    eventsList: any[],
    eventId: string
  ): { updatedEvents: any[]; result: ReassignResult } {
    const eventIndex = eventsList.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) throw new Error(`Event ${eventId} not found`);

    const event = { ...eventsList[eventIndex] };
    event.status = event.assignedTo === 'unassigned' ? 'unassigned' : 'confirmed';
    event.cancellationReason = undefined;

    const updatedEvents = [...eventsList];
    updatedEvents[eventIndex] = event;

    const result: ReassignResult = {
      success: true,
      eventId: event.id,
      previousAssignee: 'cancelled',
      newAssignee: event.assignedTo,
      date: event.date,
      isException: false,
      actionTaken: 'restored',
      message: `Restored "${event.title}" for ${event.date}.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, result };
  }

  /**
   * Cancels all events for a given day as a School Holiday / Day Off
   */
  public static markDayAsHoliday(
    eventsList: any[],
    date: string,
    holidayName: string = 'School Holiday',
    childId: string = 'all'
  ): { updatedEvents: any[]; cancelledCount: number } {
    let cancelledCount = 0;
    const updatedEvents = eventsList.map((e) => {
      const matchesDate = e.date === date;
      const matchesChild = childId === 'all' || e.childId === childId || e.childId === 'all';
      if (matchesDate && matchesChild && e.status !== 'cancelled') {
        cancelledCount++;
        return {
          ...e,
          status: 'cancelled',
          isException: true,
          cancellationReason: holidayName
        };
      }
      return e;
    });

    return { updatedEvents, cancelledCount };
  }

  /**
   * Permanently removes an event template and all its recurring instances from the schedule
   */
  public static deletePermanently(
    eventsList: any[],
    templatesList: any[],
    eventId: string
  ): { updatedEvents: any[]; updatedTemplates: any[]; result: ReassignResult } {
    const targetEvent = eventsList.find((e) => e.id === eventId);
    const seriesId = targetEvent?.masterSeriesId || targetEvent?.id || eventId;
    const title = targetEvent?.title || 'Event';
    const childId = targetEvent?.childId;

    // Filter out matching templates
    const updatedTemplates = templatesList.filter(
      (t) => t.id !== seriesId && t.id !== eventId && !(t.title === title && (!childId || t.childId === childId))
    );

    // Filter out all matching events across the entire schedule
    const updatedEvents = eventsList.filter(
      (e) => e.id !== eventId && e.masterSeriesId !== seriesId && !(e.title === title && (!childId || e.childId === childId))
    );

    const removedCount = eventsList.length - updatedEvents.length;

    const result: ReassignResult = {
      success: true,
      eventId,
      previousAssignee: targetEvent?.assignedTo || 'system',
      newAssignee: 'deleted_permanently',
      date: targetEvent?.date || new Date().toISOString().split('T')[0],
      isException: false,
      actionTaken: 'atomic_split',
      message: `Permanently deleted "${title}" from weekly blueprint and removed ${removedCount} scheduled instances.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, updatedTemplates, result };
  }

  /**
   * Deletes a single event instance from the schedule
   */
  public static deleteSingleEvent(
    eventsList: any[],
    eventId: string
  ): { updatedEvents: any[]; result: ReassignResult } {
    const targetEvent = eventsList.find((e) => e.id === eventId);
    const updatedEvents = eventsList.filter((e) => e.id !== eventId);

    const result: ReassignResult = {
      success: true,
      eventId,
      previousAssignee: targetEvent?.assignedTo || 'system',
      newAssignee: 'deleted',
      date: targetEvent?.date || new Date().toISOString().split('T')[0],
      isException: true,
      actionTaken: 'atomic_split',
      message: `Removed single instance of "${targetEvent?.title || 'Event'}" on ${targetEvent?.date}.`,
      timestamp: new Date().toISOString()
    };

    return { updatedEvents, result };
  }

  /**
   * Scans a schedule for unassigned or missing pickups and drop-offs (ignoring cancelled & no-pickup-needed)
   */
  public static detectGaps(eventsList: any[], targetDate?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    return eventsList
      .filter((e) => {
        const matchesDate = targetDate ? e.date === targetDate : e.date >= todayStr;
        // Ignore cancelled & no_pickup_needed events!
        const isNotCancelled = e.status !== 'cancelled' && e.status !== 'no_pickup_needed';
        return matchesDate && isNotCancelled && (e.assignedTo === 'unassigned' || e.status === 'unassigned');
      })
      .map((e) => ({
        eventId: e.id,
        title: e.title,
        childName: e.childId.toUpperCase(),
        date: e.date,
        time: `${e.startTime} - ${e.endTime}`,
        location: e.location,
        severity: (e.category === 'pickup' || e.category === 'dropoff' ? 'high' : 'medium') as 'high' | 'medium'
      }));
  }
}
