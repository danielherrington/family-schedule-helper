import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { CaregiverId } from '../types/schedule';
import { X, Check, ShieldAlert, Sparkles, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

export const QuickAssignModal: React.FC = () => {
  const { 
    reassignModalEvent, 
    setReassignModalEvent, 
    caregivers, 
    reassignEvent, 
    deletePermanently, 
    deleteSingleEvent 
  } = useSchedule();
  
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<CaregiverId>(
    reassignModalEvent?.assignedTo || 'daniel'
  );
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'single' | 'permanent' | null>(null);

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

  const handleExecuteDeleteSingle = async () => {
    try {
      setIsSubmitting(true);
      await deleteSingleEvent(reassignModalEvent.id);
      setReassignModalEvent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDeletePermanent = async () => {
    try {
      setIsSubmitting(true);
      await deletePermanently(reassignModalEvent.id);
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
            <div className="modal-title">Event Logistics & Assignment</div>
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
              background: 'rgba(0, 180, 216, 0.1)',
              border: '1px solid rgba(0, 180, 216, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.825rem',
              color: 'var(--primary)',
              display: 'flex',
              gap: '10px'
            }}
          >
            <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Atomic Exception:</strong> Selecting a new driver updates only the <strong>{reassignModalEvent.date}</strong> occurrence without affecting future recurring dates.
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

          {/* Delete / Remove Permanently Section */}
          <div 
            style={{ 
              marginTop: '10px', 
              paddingTop: '14px', 
              borderTop: '1px solid var(--border)' 
            }}
          >
            {showDeleteConfirm === null ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Need to cancel or permanently remove this duty?
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '0.75rem', padding: '5px 10px', color: 'var(--text-muted)' }}
                    onClick={() => setShowDeleteConfirm('single')}
                  >
                    Remove This Day
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '0.75rem', padding: '5px 10px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    onClick={() => setShowDeleteConfirm('permanent')}
                  >
                    <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Delete Permanently
                  </button>
                </div>
              </div>
            ) : showDeleteConfirm === 'single' ? (
              <div style={{ background: 'var(--surface-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Remove "{reassignModalEvent.title}" for {reassignModalEvent.date} only?
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn" onClick={() => setShowDeleteConfirm(null)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ background: '#ef4444', color: '#fff', fontWeight: 700 }}
                    onClick={handleExecuteDeleteSingle}
                    disabled={isSubmitting}
                  >
                    Confirm Remove Today
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                  <AlertTriangle size={16} />
                  <span>Permanently Delete From All Weeks?</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  This will remove the event template from your Weekly Blueprint and permanently delete all repeating instances of "{reassignModalEvent.title}" across every week.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn" onClick={() => setShowDeleteConfirm(null)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ background: '#ef4444', color: '#fff', fontWeight: 800 }}
                    onClick={handleExecuteDeletePermanent}
                    disabled={isSubmitting}
                  >
                    Yes, Delete Permanently
                  </button>
                </div>
              </div>
            )}
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

