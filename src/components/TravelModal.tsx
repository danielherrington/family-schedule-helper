import React, { useState, useMemo } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Modal } from './ui/Modal';
import { 
  Plane, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Users,
  Clock
} from 'lucide-react';
import { format, addDays, parseISO, startOfWeek } from 'date-fns';
import { getTodayDateStr } from '../utils/dateUtils';

export const TravelModal: React.FC = () => {
  const { 
    isTravelModalOpen, 
    setIsTravelModalOpen, 
    caregivers, 
    events, 
    caregiverTravels, 
    addCaregiverTravel, 
    removeCaregiverTravel 
  } = useSchedule();

  const todayStr = getTodayDateStr();

  // Form State
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>('daniel');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(() => {
    try {
      return format(addDays(parseISO(todayStr), 3), 'yyyy-MM-dd');
    } catch {
      return todayStr;
    }
  });

  // Default fallback routing caregiver
  const [routeToCaregiverId, setRouteToCaregiverId] = useState<string>('elizabeth');
  const [reason, setReason] = useState<string>('Work Travel');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When selectedCaregiverId changes, pick a sensible fallback
  const handleCaregiverChange = (cgId: string) => {
    setSelectedCaregiverId(cgId);
    if (cgId === 'daniel') {
      setRouteToCaregiverId('elizabeth');
    } else if (cgId === 'lucila') {
      setRouteToCaregiverId('elizabeth');
    } else if (cgId === 'elizabeth') {
      setRouteToCaregiverId('daniel');
    } else {
      setRouteToCaregiverId('elizabeth');
    }
  };

  // Quick Date Presets
  const setQuickDates = (preset: 'next3' | 'restOfWeek' | 'nextWeek' | 'weekend') => {
    const today = parseISO(todayStr);
    if (preset === 'next3') {
      setStartDate(todayStr);
      setEndDate(format(addDays(today, 2), 'yyyy-MM-dd'));
    } else if (preset === 'restOfWeek') {
      setStartDate(todayStr);
      const sun = addDays(startOfWeek(today, { weekStartsOn: 1 }), 6);
      setEndDate(format(sun, 'yyyy-MM-dd'));
    } else if (preset === 'nextWeek') {
      const nextMon = addDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
      const nextFri = addDays(nextMon, 4);
      setStartDate(format(nextMon, 'yyyy-MM-dd'));
      setEndDate(format(nextFri, 'yyyy-MM-dd'));
    } else if (preset === 'weekend') {
      const sat = addDays(startOfWeek(today, { weekStartsOn: 1 }), 5);
      const sun = addDays(sat, 1);
      setStartDate(format(sat, 'yyyy-MM-dd'));
      setEndDate(format(sun, 'yyyy-MM-dd'));
    }
  };

  // Preview affected events
  const affectedEvents = useMemo(() => {
    if (!startDate || !endDate || !selectedCaregiverId) return [];
    return events.filter(
      (e) =>
        e.assignedTo === selectedCaregiverId &&
        e.date >= startDate &&
        e.date <= endDate &&
        e.status !== 'cancelled' &&
        e.status !== 'no_pickup_needed'
    );
  }, [events, selectedCaregiverId, startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaregiverId || !routeToCaregiverId || !startDate || !endDate) return;
    if (startDate > endDate) {
      alert('Start date must be before or equal to end date.');
      return;
    }
    if (selectedCaregiverId === routeToCaregiverId) {
      alert('Routing target must be a different caregiver.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCaregiverTravel({
        caregiverId: selectedCaregiverId,
        startDate,
        endDate,
        routeToCaregiverId,
        reason: reason.trim() || 'Work Travel'
      });
      setIsTravelModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTravel = async (travelId: string) => {
    const shouldRestore = window.confirm(
      'Would you like to restore the original driver assignments for covered shifts?'
    );
    await removeCaregiverTravel(travelId, shouldRestore);
  };

  const travelingCaregiver = caregivers.find((c) => c.id === selectedCaregiverId);
  const targetCaregiver = caregivers.find((c) => c.id === routeToCaregiverId);

  return (
    <Modal
      isOpen={isTravelModalOpen}
      onClose={() => setIsTravelModalOpen(false)}
      title="Out of Town / Travel Coverage"
      subtitle="Mark a caregiver traveling for work and auto-route their shifts & duties"
      icon={<Plane size={22} color="var(--primary)" />}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Existing Active Travels */}
        {caregiverTravels.length > 0 && (
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plane size={16} color="var(--primary)" />
              <span>Active & Scheduled Travels ({caregiverTravels.length}):</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {caregiverTravels.map((travel) => {
                const cg = caregivers.find((c) => c.id === travel.caregiverId);
                const target = caregivers.find((c) => c.id === travel.routeToCaregiverId);
                return (
                  <div
                    key={travel.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: cg?.avatarColor ? `${cg.avatarColor}22` : 'var(--border)',
                          color: cg?.avatarColor || 'var(--text)',
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }}
                      >
                        {cg?.name || travel.caregiverId}
                      </span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: target?.avatarColor ? `${target.avatarColor}22` : 'var(--border)',
                          color: target?.avatarColor || 'var(--text)',
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }}
                      >
                        {target?.name || travel.routeToCaregiverId}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ({travel.startDate} to {travel.endDate})
                      </span>
                      {travel.reason && (
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontWeight: 600 }}>
                          {travel.reason}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={() => handleRemoveTravel(travel.id)}
                      title="Remove travel schedule"
                      style={{ color: 'var(--danger)', padding: '4px 8px' }}
                    >
                      <Trash2 size={15} />
                      <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Travel Form */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Mark Caregiver Out of Town:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            {/* Who is traveling? */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Who is Traveling?
              </label>
              <select
                value={selectedCaregiverId}
                onChange={(e) => handleCaregiverChange(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: 700 }}
              >
                {caregivers.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} ({cg.avatarInitials})
                  </option>
                ))}
              </select>
            </div>

            {/* Route roles to */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Auto-Route Roles & Shifts To:
              </label>
              <select
                value={routeToCaregiverId}
                onChange={(e) => setRouteToCaregiverId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: 700 }}
              >
                {caregivers
                  .filter((cg) => cg.id !== selectedCaregiverId)
                  .map((cg) => (
                    <option key={cg.id} value={cg.id}>
                      {cg.name} ({cg.avatarInitials})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Travel Date Range:
              </label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => setQuickDates('next3')}
                >
                  Next 3 Days
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => setQuickDates('restOfWeek')}
                >
                  Rest of Week
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => setQuickDates('weekend')}
                >
                  This Weekend
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => setQuickDates('nextWeek')}
                >
                  Next Week
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Departing:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                  required
                />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Returning:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Reason / Tag */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Reason / Trip Notes:
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {['Work Travel', 'Client Meetings', 'Conference', 'Personal Trip', 'Vacation'].map((presetReason) => (
                <button
                  key={presetReason}
                  type="button"
                  onClick={() => setReason(presetReason)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    border: '1px solid var(--border)',
                    background: reason === presetReason ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: reason === presetReason ? '#2563eb' : 'var(--text-muted)',
                    fontWeight: reason === presetReason ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {presetReason}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Work Travel / Conference"
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            />
          </div>

          {/* Impact Preview */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: affectedEvents.length > 0 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${affectedEvents.length > 0 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
              marginBottom: '16px',
              fontSize: '0.825rem'
            }}
          >
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: affectedEvents.length > 0 ? '#1d4ed8' : '#059669', marginBottom: affectedEvents.length > 0 ? '6px' : '0' }}>
              <Clock size={15} />
              <span>
                {affectedEvents.length > 0
                  ? `⚡ ${affectedEvents.length} scheduled duties will be automatically reassigned from ${travelingCaregiver?.name} to ${targetCaregiver?.name}:`
                  : `No existing scheduled duties found for ${travelingCaregiver?.name} between ${startDate} and ${endDate}. Blueprint shifts generated during this time will automatically route to ${targetCaregiver?.name}.`}
              </span>
            </div>
            {affectedEvents.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {affectedEvents.slice(0, 5).map((evt) => (
                  <li key={evt.id} style={{ marginBottom: '2px' }}>
                    <strong>{evt.date}</strong> ({evt.startTime}): {evt.title}
                  </li>
                ))}
                {affectedEvents.length > 5 && (
                  <li>...and {affectedEvents.length - 5} more duty/ies</li>
                )}
              </ul>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setIsTravelModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !selectedCaregiverId || !routeToCaregiverId}
              style={{ padding: '8px 18px', fontWeight: 700 }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Routing...' : `Confirm & Route to ${targetCaregiver?.name || 'Caregiver'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
