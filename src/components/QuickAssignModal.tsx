import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { CaregiverId } from '../types/schedule';
import { Check, Sparkles, Trash2, AlertTriangle, RotateCcw, UserCheck } from 'lucide-react';
import { Modal } from './ui/Modal';

export const QuickAssignModal: React.FC = () => {
  const { 
    reassignModalEvent, 
    setReassignModalEvent, 
    caregivers, 
    reassignEvent, 
    deletePermanently, 
    deleteSingleEvent,
    caregiverCalendarMappings
  } = useSchedule();
  
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<CaregiverId>(
    reassignModalEvent?.assignedTo || 'daniel'
  );
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'single' | 'permanent' | null>(null);

  // Sync selected caregiver with the target event whenever modal opens
  useEffect(() => {
    if (reassignModalEvent) {
      setSelectedCaregiverId(reassignModalEvent.assignedTo || 'daniel');
      setReason('');
      setShowDeleteConfirm(null);
    }
  }, [reassignModalEvent]);

  if (!reassignModalEvent) return null;

  const currentCgId = reassignModalEvent.assignedTo;
  const currentCg = caregivers.find(c => c.id === currentCgId);
  const sourceCalName = caregiverCalendarMappings[currentCgId]?.calendarName || (currentCg ? `${currentCg.name}'s Calendar` : 'Current Calendar');
  const targetCalName = caregiverCalendarMappings[selectedCaregiverId]?.calendarName || (selectedCaregiverId === 'unassigned' ? 'Unassigned' : `${selectedCaregiverId}'s Calendar`);
  const isChangingCaregiver = selectedCaregiverId !== currentCgId;

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
    <Modal
      isOpen={!!reassignModalEvent}
      onClose={() => setReassignModalEvent(null)}
      title="Event Logistics & Assignment"
      subtitle={
        <span>
          <strong style={{ color: 'var(--text)' }}>{reassignModalEvent.title}</strong> • {reassignModalEvent.date} ({reassignModalEvent.startTime} – {reassignModalEvent.endTime})
        </span>
      }
      icon={<UserCheck size={20} color="var(--accent)" />}
      size="md"
      footer={
        <>
          <button 
            type="button"
            className="btn" 
            onClick={() => setReassignModalEvent(null)}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Syncing...' : 'Confirm Reassignment'}
          </button>
        </>
      }
    >
      {/* Recurrence Safety Notice */}
      <div 
        style={{
          background: 'rgba(0, 180, 216, 0.08)',
          border: '1px solid rgba(0, 180, 216, 0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          lineHeight: '1.4'
        }}
      >
        <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Atomic Exception:</strong> Selecting a new caregiver updates only <strong>{reassignModalEvent.date}</strong> in Google Calendar. Your master recurring routine blueprint is preserved.
        </div>
      </div>

      {/* Calendar Shift Notice if changing caregiver */}
      {isChangingCaregiver && (
        <div 
          style={{
            background: 'rgba(255, 94, 126, 0.08)',
            border: '1px solid rgba(255, 94, 126, 0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <RotateCcw size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
          <div>
            Moving event from <strong>{sourceCalName}</strong> ➔ <strong>{targetCalName}</strong>
          </div>
        </div>
      )}

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', display: 'block', color: 'var(--text)' }}>
          Select Responsible Caregiver:
        </label>
        <div className="caregiver-option-grid">
          {options.map((cg) => {
            const isSelected = selectedCaregiverId === cg.id;
            const isCurrent = currentCgId === cg.id;
            const calName = cg.id !== 'unassigned' ? caregiverCalendarMappings[cg.id]?.calendarName : null;

            return (
              <div
                key={cg.id}
                className={`caregiver-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCaregiverId(cg.id as CaregiverId)}
              >
                <div
                  className="avatar"
                  style={{ 
                    backgroundColor: cg.avatarColor, 
                    width: '36px', 
                    height: '36px', 
                    fontSize: '0.85rem',
                    borderRadius: '10px'
                  }}
                >
                  {cg.avatarInitials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                      {cg.name}
                    </span>
                    {isCurrent && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        background: 'rgba(0, 180, 216, 0.12)', 
                        color: 'var(--primary)', 
                        fontWeight: 800, 
                        padding: '2px 6px', 
                        borderRadius: '6px' 
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cg.role}
                  </div>
                  {calName ? (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--primary)', 
                      fontWeight: 600,
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>📅</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {calName}
                      </span>
                    </div>
                  ) : cg.id !== 'unassigned' ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                      No calendar linked
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', flexShrink: 0 }}>
                  {isSelected ? (
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: 'var(--accent)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  ) : (
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      border: '2px solid var(--border)',
                      background: 'transparent' 
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text)' }}>
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

      {/* Delete / Remove Duty Section */}
      <div 
        style={{ 
          marginTop: '4px', 
          paddingTop: '12px', 
          borderTop: '1px solid var(--border)' 
        }}
      >
        {showDeleteConfirm === null ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Need to cancel or permanently remove this duty?
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn"
                style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--text-muted)' }}
                onClick={() => setShowDeleteConfirm('single')}
              >
                Remove This Day
              </button>
              <button
                type="button"
                className="btn"
                style={{ fontSize: '0.75rem', padding: '6px 12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                onClick={() => setShowDeleteConfirm('permanent')}
              >
                <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Delete Permanently
              </button>
            </div>
          </div>
        ) : showDeleteConfirm === 'single' ? (
          <div style={{ background: 'var(--surface-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Remove "{reassignModalEvent.title}" for {reassignModalEvent.date} only?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              This will delete the duty on this day without affecting future scheduled weeks.
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
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
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
    </Modal>
  );
};
