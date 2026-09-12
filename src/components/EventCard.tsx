import React, { useState } from 'react';
import { DispatchEvent } from '../types/schedule';
import { useSchedule } from '../context/ScheduleContext';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Check,
  Palmtree,
  RotateCcw,
  Ban,
  UserX,
  Smile,
  Trash2,
  Plane
} from 'lucide-react';

interface EventCardProps {
  event: DispatchEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { 
    children: childrenList, 
    caregivers, 
    reassignEvent, 
    cancelEventInstance, 
    markNoPickupNeeded,
    restoreEventInstance,
    isCaregiverOutOfTown,
    setReassignModalEvent
  } = useSchedule();
  
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showNoPickupPrompt, setShowNoPickupPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('No Class / Holiday');
  const [noPickupReason, setNoPickupReason] = useState('Playdate / With Friend');

  const child = childrenList.find((c) => c.id === event.childId);
  const childColor = child?.color || '#3b82f6';
  const childBg = child?.badgeBg || 'rgba(59, 130, 246, 0.12)';
  const childBorder = child?.badgeBorder || 'rgba(59, 130, 246, 0.35)';

  const isCancelled = event.status === 'cancelled';
  const isNoPickupNeeded = event.status === 'no_pickup_needed';

  const noPickupPresets = [
    'Playdate / Friend Driving',
    'After-School Program / Late Care',
    'Walking Home / Parent on Site',
    'Staying After School / Extra Curricular',
    'No Driver Needed Today'
  ];

  const handleSelectCaregiver = (cgId: string) => {
    if (event.assignedTo !== cgId || isNoPickupNeeded || isCancelled) {
      reassignEvent(event.id, cgId);
    }
  };

  const handleConfirmCancel = () => {
    cancelEventInstance(event.id, cancelReason);
    setShowCancelPrompt(false);
  };

  const handleConfirmNoPickup = (reasonToUse?: string) => {
    markNoPickupNeeded(event.id, reasonToUse || noPickupReason);
    setShowNoPickupPrompt(false);
  };

  // 1. Cancelled View (School Closed / Holiday)
  if (isCancelled) {
    return (
      <div className="event-card-mobile is-cancelled">
        <div className="event-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              className="child-badge"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)'
              }}
            >
              {child?.name || event.childId}
            </span>
            <span className="time-chip" style={{ textDecoration: 'line-through', opacity: 0.6 }}>
              {event.startTime} - {event.endTime}
            </span>
          </div>

          <span className="status-badge holiday">
            <Palmtree size={12} />
            <span>No Class / Off</span>
          </span>
        </div>

        <div className="event-mobile-title" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
          {event.title}
        </div>

        <div style={{ fontSize: '0.8rem', color: '#059669', margin: '6px 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Palmtree size={13} />
          <span><strong>Reason:</strong> {event.cancellationReason || 'Holiday / No Class'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <button 
            type="button"
            className="btn"
            style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '32px' }}
            onClick={() => restoreEventInstance(event.id)}
            title="Restore this pickup/drop-off"
          >
            <RotateCcw size={12} />
            <span>Restore Duty</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. "No Pickup Needed" View (Playdate, after-school care, walking home)
  if (isNoPickupNeeded) {
    return (
      <div 
        className="event-card-mobile"
        style={{
          borderLeft: '5px solid #8B5CF6',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 94, 126, 0.03) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.3)'
        }}
      >
        <div className="event-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              className="child-badge"
              style={{
                backgroundColor: childBg,
                borderColor: childBorder,
                color: childColor
              }}
            >
              {child?.name || event.childId}
            </span>
            <span className="time-chip" style={{ opacity: 0.85 }}>
              <Clock size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
              {event.startTime} - {event.endTime}
            </span>
          </div>

          <span 
            className="status-badge"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#7C3AED',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <Ban size={12} />
            <span>No Pickup Needed</span>
          </span>
        </div>

        <div className="event-mobile-title" style={{ color: 'var(--text)' }}>
          {event.title}
        </div>

        <div 
          style={{ 
            fontSize: '0.825rem', 
            color: '#6D28D9', 
            background: 'rgba(139, 92, 246, 0.08)',
            padding: '6px 10px',
            borderRadius: '8px',
            margin: '6px 0 12px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontWeight: 700
          }}
        >
          <Smile size={14} color="#7C3AED" />
          <span>{event.cancellationReason || 'No Pickup Needed (Playdate / Activity)'}</span>
        </div>

        {/* Tap any caregiver to re-assign if plans change */}
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
          Plans changed? Tap a driver to re-assign:
        </div>
        <div className="caregiver-checkbox-row" style={{ paddingTop: '6px' }}>
          {caregivers.map((cg) => (
            <button
              key={cg.id}
              type="button"
              className="caregiver-checkbox-pill"
              onClick={() => handleSelectCaregiver(cg.id)}
              title={`Assign driver: ${cg.name}`}
            >
              <span 
                className="checkbox-circle"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: cg.avatarColor
                }}
              />
              <span className="cg-label" style={{ color: 'var(--text-muted)' }}>
                {cg.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Normal Active Event View
  return (
    <div className={`event-card-mobile ${event.isException ? 'is-exception' : ''}`}>
      {/* Top Meta Row */}
      <div className="event-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className="child-badge"
            style={{
              backgroundColor: childBg,
              borderColor: childBorder,
              color: childColor
            }}
          >
            {child?.name || (event.childId === 'all' ? 'All Kids' : event.childId)}
          </span>
          <span className="time-chip">
            <Clock size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
            {event.startTime} - {event.endTime}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {event.travelCoveringFor ? (
            <span 
              className="status-badge"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#2563eb',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
              title={`Covering for ${caregivers.find((c) => c.id === event.travelCoveringFor)?.name || event.travelCoveringFor} (Out of Town)`}
            >
              <Plane size={11} />
              <span>Covering for {caregivers.find((c) => c.id === event.travelCoveringFor)?.name.split(' ')[0] || event.travelCoveringFor}</span>
            </span>
          ) : event.isException ? (
            <span className="status-badge exception" title="Single day override. Master repeating series unaffected.">
              <Sparkles size={12} />
              <span>Override</span>
            </span>
          ) : event.assignedTo === 'unassigned' ? (
            <span className="status-badge unassigned">
              <AlertCircle size={12} />
              <span>Unassigned</span>
            </span>
          ) : (
            <span className="status-badge routine">
              <CheckCircle2 size={12} />
              <span>Routine</span>
            </span>
          )}

          {/* No Class / Holiday Mini Action */}
          <button
            type="button"
            className="nav-btn"
            style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            onClick={() => {
              setShowCancelPrompt(!showCancelPrompt);
              setShowNoPickupPrompt(false);
            }}
            title="Mark as No Class / Holiday"
          >
            <Palmtree size={13} />
          </button>

          {/* Edit / Remove Action */}
          <button
            type="button"
            className="nav-btn"
            style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            onClick={() => setReassignModalEvent(event)}
            title="Reassign or permanently delete this event"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Inline No Class / Holiday Prompt */}
      {showCancelPrompt && (
        <div style={{ background: '#FAF7F2', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
            🌴 Mark as Holiday / No School:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Teacher Planning Day, School Break"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            />
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '30px', background: '#059669', borderColor: '#059669' }}
              onClick={handleConfirmCancel}
            >
              Confirm
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '30px' }}
              onClick={() => setShowCancelPrompt(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Inline "No Pickup Needed" Quick Reasons Drawer */}
      {showNoPickupPrompt && (
        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ban size={14} />
              <span>Select "No Pickup Needed" Reason:</span>
            </div>
            <button type="button" className="nav-btn" style={{ padding: '2px 4px' }} onClick={() => setShowNoPickupPrompt(false)}>
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {noPickupPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleConfirmNoPickup(preset)}
                style={{
                  textAlign: 'left',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  background: '#FFFFFF',
                  color: 'var(--text)',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={noPickupReason}
              onChange={(e) => setNoPickupReason(e.target.value)}
              placeholder="Or custom reason (e.g. Playdate with Leo)"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            />
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '4px 12px', fontSize: '0.775rem', minHeight: '32px', background: '#7C3AED', borderColor: '#7C3AED' }}
              onClick={() => handleConfirmNoPickup(noPickupReason)}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Title & Location */}
      <div className="event-mobile-title">{event.title}</div>
      {event.location && (
        <div className="event-location">
          <MapPin size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location}
          </span>
        </div>
      )}

      {event.notes && (
        <div style={{ fontSize: '0.75rem', color: '#D97706', marginBottom: '10px', fontStyle: 'italic', fontWeight: 600 }}>
          💡 {event.notes}
        </div>
      )}

      {/* Mobile-First Caregiver Checkbox Selector Row + "No Pickup" button */}
      <div className="caregiver-checkbox-row">
        {caregivers.map((cg) => {
          const isSelected = event.assignedTo === cg.id && !isNoPickupNeeded;
          const isOutOfTown = isCaregiverOutOfTown(cg.id, event.date);
          return (
            <button
              key={cg.id}
              type="button"
              className={`caregiver-checkbox-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectCaregiver(cg.id)}
              title={isOutOfTown ? `Assign to ${cg.name} (✈️ Out of Town on this day)` : `Assign to ${cg.name}`}
              style={{
                borderColor: isSelected ? cg.avatarColor : undefined,
                background: isSelected ? `${cg.avatarColor}18` : undefined,
                opacity: isOutOfTown && !isSelected ? 0.65 : 1
              }}
            >
              <span 
                className="checkbox-circle"
                style={{
                  backgroundColor: isSelected ? cg.avatarColor : 'transparent',
                  borderColor: isSelected ? cg.avatarColor : 'var(--border)'
                }}
              >
                {isSelected && <Check size={11} color="#fff" strokeWidth={3.5} />}
              </span>
              <span className="cg-label" style={{ color: isSelected ? cg.avatarColor : 'var(--text-muted)' }}>
                {cg.name.split(' ')[0]}
                {isOutOfTown && <span style={{ fontSize: '0.65rem', marginLeft: '2px' }}>✈️</span>}
              </span>
            </button>
          );
        })}

        {/* 1-Tap "No Pickup Needed" Pill */}
        <button
          type="button"
          className="caregiver-checkbox-pill"
          onClick={() => setShowNoPickupPrompt(!showNoPickupPrompt)}
          title="Mark No Pickup Needed (Playdate, friend driving, etc.)"
          style={{
            borderColor: showNoPickupPrompt ? '#8B5CF6' : 'var(--border)',
            background: showNoPickupPrompt ? 'rgba(139, 92, 246, 0.12)' : undefined,
            color: '#7C3AED'
          }}
        >
          <Ban size={13} />
          <span className="cg-label" style={{ color: '#7C3AED' }}>
            No Pickup
          </span>
        </button>
      </div>
    </div>
  );
};
