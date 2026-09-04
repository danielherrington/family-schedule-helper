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
  Ban
} from 'lucide-react';

interface EventCardProps {
  event: DispatchEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { children: childrenList, caregivers, reassignEvent, cancelEventInstance, restoreEventInstance } = useSchedule();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('No Class / Holiday');

  const child = childrenList.find((c) => c.id === event.childId);
  const childColor = child?.color || '#3b82f6';
  const childBg = child?.badgeBg || 'rgba(59, 130, 246, 0.15)';
  const childBorder = child?.badgeBorder || 'rgba(59, 130, 246, 0.4)';

  const isCancelled = event.status === 'cancelled';

  const handleSelectCaregiver = (cgId: string) => {
    if (event.assignedTo !== cgId) {
      reassignEvent(event.id, cgId);
    }
  };

  const handleConfirmCancel = () => {
    cancelEventInstance(event.id, cancelReason);
    setShowCancelPrompt(false);
  };

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

        <div style={{ fontSize: '0.8rem', color: '#10b981', margin: '6px 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          {event.isException ? (
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
            onClick={() => setShowCancelPrompt(!showCancelPrompt)}
            title="Mark as No Class / Holiday"
          >
            <Palmtree size={13} />
          </button>
        </div>
      </div>

      {/* Inline Cancel Reason Input if opened */}
      {showCancelPrompt && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
            🌴 Mark as Holiday / No Class:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Teacher Work Day, No Ballet"
              style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
            />
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '28px', background: '#10b981', borderColor: '#10b981' }}
              onClick={handleConfirmCancel}
            >
              Confirm
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '28px' }}
              onClick={() => setShowCancelPrompt(false)}
            >
              ✕
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
        <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '10px', fontStyle: 'italic' }}>
          💡 {event.notes}
        </div>
      )}

      {/* Mobile-First Caregiver Checkbox Selector Row */}
      <div className="caregiver-checkbox-row">
        {caregivers.map((cg) => {
          const isSelected = event.assignedTo === cg.id;
          return (
            <button
              key={cg.id}
              type="button"
              className={`caregiver-checkbox-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectCaregiver(cg.id)}
              title={`Assign to ${cg.name}`}
              style={{
                borderColor: isSelected ? cg.avatarColor : undefined,
                background: isSelected ? `${cg.avatarColor}25` : undefined
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
              <span className="cg-label" style={{ color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                {cg.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
