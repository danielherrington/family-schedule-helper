import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  Repeat, 
  Check, 
  Plus,
  Car,
  FileText
} from 'lucide-react';
import { CaregiverId, EventCategory } from '../types/schedule';

export const AddEventModal: React.FC = () => {
  const { 
    isAddEventOpen, 
    setIsAddEventOpen, 
    addEventInitialDate, 
    children: childrenList, 
    caregivers, 
    addNewEvent 
  } = useSchedule();

  const [title, setTitle] = useState('');
  const [childId, setChildId] = useState('izzy');
  const [category, setCategory] = useState<EventCategory>('pickup');
  const [date, setDate] = useState(addEventInitialDate || '2026-09-01');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('15:30');
  const [location, setLocation] = useState('Lehrman School');
  const [assignedTo, setAssignedTo] = useState<CaregiverId>('daniel');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAddEventOpen) {
      setDate(addEventInitialDate || '2026-09-01');
    }
  }, [isAddEventOpen, addEventInitialDate]);

  if (!isAddEventOpen) return null;

  const titlePresets = [
    { label: 'School Drop-Off', category: 'dropoff' as EventCategory, start: '08:00', end: '08:30' },
    { label: 'School Pick-Up', category: 'pickup' as EventCategory, start: '15:00', end: '15:30' },
    { label: 'Ballet / Dance', category: 'activity' as EventCategory, start: '16:00', end: '17:00' },
    { label: 'Gymnastics Class', category: 'activity' as EventCategory, start: '15:45', end: '16:45' },
    { label: 'Soccer Practice', category: 'activity' as EventCategory, start: '16:30', end: '17:30' },
    { label: 'Doctor / Dentist', category: 'routine' as EventCategory, start: '14:00', end: '15:00' }
  ];

  const handleApplyPreset = (preset: typeof titlePresets[0]) => {
    const selectedChild = childrenList.find((c) => c.id === childId);
    setTitle(`${selectedChild?.name || 'Child'} ${preset.label}`);
    setCategory(preset.category);
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const handleToggleDay = (dayNum: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await addNewEvent({
        title: title.trim(),
        childId,
        category,
        date,
        startTime,
        endTime,
        location: location.trim() || 'School',
        assignedTo,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : undefined,
        notes: notes.trim() || undefined
      });
      setIsAddEventOpen(false);
      // Reset form
      setTitle('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayLabels = [
    { num: 1, label: 'M' },
    { num: 2, label: 'Tu' },
    { num: 3, label: 'W' },
    { num: 4, label: 'Th' },
    { num: 5, label: 'F' },
    { num: 6, label: 'Sa' },
    { num: 7, label: 'Su' }
  ];

  const driverOptions = [
    ...caregivers,
    {
      id: 'unassigned',
      name: 'Unassigned (Needs Driver)',
      role: 'Open Gap',
      avatarColor: '#ef4444',
      avatarInitials: '⚠️',
      calendarId: '',
      isManager: false
    }
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsAddEventOpen(false)}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} color="var(--primary)" />
              <span>Add Pick-Up, Drop-Off, or Event</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Schedule a one-time logistics event or create a recurring weekly blueprint
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsAddEventOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              ⚡ Quick Presets:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {titlePresets.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  className="btn"
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'var(--surface-card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Event Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Vale Gymnastics Pick-Up, Izzy Ballet Drop-Off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface-card)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            />
          </div>

          {/* Child & Category Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Child
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {childrenList.map((ch) => {
                  const isSelected = childId === ch.id;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setChildId(ch.id)}
                      className="btn"
                      style={{
                        flex: 1,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderColor: isSelected ? ch.color : 'var(--border)',
                        background: isSelected ? ch.color : 'var(--surface-card)',
                        color: isSelected ? '#ffffff' : 'var(--text)'
                      }}
                    >
                      {ch.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Category
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['dropoff', 'pickup', 'activity'] as EventCategory[]).map((cat) => {
                  const isSelected = category === cat;
                  const label = cat === 'dropoff' ? 'Drop-Off' : cat === 'pickup' ? 'Pick-Up' : 'Activity';
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="btn"
                      style={{
                        flex: 1,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                        background: isSelected ? 'rgba(255, 94, 126, 0.15)' : 'var(--surface-card)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-muted)'
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--primary)" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="var(--accent)" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="var(--text-muted)" />
                <span>End Time</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Responsible Driver */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={15} color="var(--primary)" />
              <span>Assigned Driver / Caregiver</span>
            </label>
            <div className="caregiver-option-grid">
              {driverOptions.map((cg) => {
                const isSelected = assignedTo === cg.id;
                return (
                  <div
                    key={cg.id}
                    className={`caregiver-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setAssignedTo(cg.id)}
                    style={{ padding: '8px 12px' }}
                  >
                    <div
                      className="avatar"
                      style={{ backgroundColor: cg.avatarColor, width: '28px', height: '28px', fontSize: '0.75rem' }}
                    >
                      {cg.avatarInitials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cg.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cg.role}</div>
                    </div>
                    {isSelected && <Check size={16} color="var(--accent)" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="var(--text-muted)" />
                <span>Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Lehrman School, Miami Gym"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                  color: 'var(--text)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} color="var(--text-muted)" />
                <span>Notes (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bring booster seat / snacks"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                  color: 'var(--text)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Recurrence Switch */}
          <div 
            style={{ 
              background: 'var(--surface-card)', 
              border: isRecurring ? '1px solid var(--accent)' : '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '14px',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={18} color={isRecurring ? 'var(--accent)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Make this a Weekly Recurring Event
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isRecurring 
                      ? 'Adds to your permanent Weekly Blueprint and repeats every selected day.' 
                      : 'One-off event: schedules for this specific date only.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`btn ${isRecurring ? 'btn-primary' : ''}`}
                onClick={() => setIsRecurring(!isRecurring)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {isRecurring ? '✓ Recurring' : 'Single Event'}
              </button>
            </div>

            {isRecurring && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Select Repeating Days of the Week:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {dayLabels.map((d) => {
                    const isSelected = recurringDays.includes(d.num);
                    return (
                      <button
                        type="button"
                        key={d.num}
                        onClick={() => handleToggleDay(d.num)}
                        className="btn"
                        style={{
                          width: '38px',
                          height: '38px',
                          padding: 0,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          borderRadius: '50%',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          background: isSelected ? 'var(--accent)' : 'var(--surface)',
                          color: isSelected ? '#ffffff' : 'var(--text)'
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit / Cancel Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setIsAddEventOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
              style={{ fontWeight: 800, padding: '10px 20px' }}
            >
              <Sparkles size={16} />
              <span>{isRecurring ? 'Create Recurring Blueprint' : 'Add Event to Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
