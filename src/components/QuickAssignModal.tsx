import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { CaregiverId } from '../types/schedule';
import { X, Check, ShieldAlert, Sparkles } from 'lucide-react';

export const QuickAssignModal: React.FC = () => {
  const { reassignModalEvent, setReassignModalEvent, caregivers, reassignEvent } = useSchedule();
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<CaregiverId>(
    reassignModalEvent?.assignedTo || 'daniel'
  );
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!reassignModalEvent) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await reassignEvent(reassignModalEvent.id, selectedCaregiverId, reason.trim() || undefined);
      setReassignModalEvent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    ...caregivers,
    {
      id: 'unassigned' as CaregiverId,
      name: 'Unassigned',
      role: 'Mark as Unassigned / Open Gap',
      avatarColor: '#ef4444',
      avatarInitials: '⚠️',
      calendarId: '',
      isManager: false
    }
  ];

  return (
    <div className="modal-overlay" onClick={() => setReassignModalEvent(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Reassign Caregiver</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {reassignModalEvent.title} • {reassignModalEvent.date} ({reassignModalEvent.startTime} - {reassignModalEvent.endTime})
            </div>
          </div>
          <button 
            className="nav-btn" 
            onClick={() => setReassignModalEvent(null)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Recurrence Safety Notice */}
          <div 
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.825rem',
              color: '#93c5fd',
              display: 'flex',
              gap: '10px'
            }}
          >
            <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Atomic Recurrence Exception:</strong> This will reassign only the <strong>{reassignModalEvent.date}</strong> occurrence. The master repeating series will remain completely intact without creating phantom duplicates.
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              Select Responsible Caregiver:
            </label>
            <div className="caregiver-option-grid">
              {options.map((cg) => {
                const isSelected = selectedCaregiverId === cg.id;
                return (
                  <div
                    key={cg.id}
                    className={`caregiver-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCaregiverId(cg.id as CaregiverId)}
                  >
                    <div
                      className="avatar"
                      style={{ backgroundColor: cg.avatarColor, width: '32px', height: '32px', fontSize: '0.8rem' }}
                    >
                      {cg.avatarInitials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cg.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {cg.role}
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="var(--accent)" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Reason or Handoff Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g., Dad late meeting, Lu handling gymnastics pickup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn" 
            onClick={() => setReassignModalEvent(null)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Syncing...' : 'Confirm Reassignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
