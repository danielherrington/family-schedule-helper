import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  X, 
  ShieldCheck, 
  CloudUpload, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

export const SyncReviewModal: React.FC = () => {
  const {
    isSyncReviewOpen,
    setIsSyncReviewOpen,
    pendingSyncQueue,
    pushStagedSyncToGoogle,
    discardStagedChanges,
    removeStagedItem,
    children,
    caregivers
  } = useSchedule();

  const [isPushing, setIsPushing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!isSyncReviewOpen) return null;

  const handlePush = async () => {
    setIsPushing(true);
    try {
      await pushStagedSyncToGoogle();
    } finally {
      setIsPushing(false);
    }
  };

  const handleDiscardAll = async () => {
    await discardStagedChanges();
    setConfirmDiscard(false);
  };

  const getChildName = (childId?: string) => {
    if (!childId) return 'FAMILY';
    const child = children.find((c) => c.id === childId);
    return child ? child.name : childId.toUpperCase();
  };

  const getCaregiverName = (caregiverId?: string) => {
    if (!caregiverId || caregiverId === 'unassigned') return 'Unassigned';
    const cg = caregivers.find((c) => c.id === caregiverId);
    return cg ? cg.name : caregiverId;
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSyncReviewOpen(false)}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '680px', width: '92%' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                background: 'rgba(0, 180, 216, 0.12)', 
                border: '1px solid rgba(0, 180, 216, 0.3)',
                padding: '8px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <ShieldCheck size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title">Sync Review & Push</span>
                <span 
                  style={{
                    background: pendingSyncQueue.length > 0 ? 'var(--accent)' : 'var(--border)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}
                >
                  {pendingSyncQueue.length} {pendingSyncQueue.length === 1 ? 'CHANGE' : 'CHANGES'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Protected Safe Mode: Review local changes before committing to Google Calendar.
              </div>
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsSyncReviewOpen(false)} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto', padding: '16px' }}>
          {pendingSyncQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-dim)' }}>
              <CheckCircle2 size={42} color="var(--success)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: '4px' }}>
                All Clear & Synchronized
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                There are no pending edits in your local queue. Any adjustments made on the schedule board will appear here for review.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                style={{
                  background: 'rgba(255, 183, 3, 0.1)',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={18} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Safe Mode is Active:</strong> Google Calendar has <em>not</em> been modified yet. Click <strong>Push Sync to Google</strong> below to push these {pendingSyncQueue.length} update{pendingSyncQueue.length === 1 ? '' : 's'}.
                </span>
              </div>

              {pendingSyncQueue.map((item) => {
                const isReassign = item.type === 'reassign';
                const isNoPickup = item.type === 'no_pickup';
                const isCreate = item.type === 'create';
                const isDelete = item.type === 'delete';

                let typeBadgeColor = 'var(--primary)';
                let typeBadgeBg = 'rgba(0, 180, 216, 0.12)';
                let typeLabel = 'DRIVER CHANGE';

                if (isNoPickup) {
                  typeBadgeColor = 'var(--accent-secondary)';
                  typeBadgeBg = 'rgba(255, 183, 3, 0.15)';
                  typeLabel = 'NO PICKUP / EXCEPTION';
                } else if (isCreate) {
                  typeBadgeColor = 'var(--success)';
                  typeBadgeBg = 'rgba(42, 157, 143, 0.15)';
                  typeLabel = 'NEW EVENT';
                } else if (isDelete) {
                  typeBadgeColor = 'var(--danger)';
                  typeBadgeBg = 'rgba(230, 57, 70, 0.15)';
                  typeLabel = 'DELETE EVENT';
                }

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {/* Item Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: typeBadgeBg,
                            color: typeBadgeColor,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.4px'
                          }}
                        >
                          {typeLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            background: 'rgba(255, 94, 126, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {getChildName(item.childId)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          className="nav-btn"
                          style={{ width: '26px', height: '26px', padding: 0 }}
                          onClick={() => removeStagedItem(item.id)}
                          title="Discard this single edit"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} color="var(--danger)" />
                        </button>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                        {item.eventTitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {item.eventDate}
                        </span>
                        {item.eventTime && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} />
                            {item.eventTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Change Diff / Summary */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.03)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                        borderLeft: `3px solid ${typeBadgeColor}`
                      }}
                    >
                      {isReassign && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {getCaregiverName(item.previousValue)}
                          </span>
                          <ArrowRight size={13} color="var(--text-muted)" />
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                            {getCaregiverName(item.newValue)}
                          </span>
                        </div>
                      )}

                      {isNoPickup && (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>Status:</span>{' '}
                          <span>{item.summary}</span>
                        </div>
                      )}

                      {isCreate && (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>New Entry:</span>{' '}
                          <span>{item.summary}</span>
                        </div>
                      )}

                      {isDelete && (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Removal:</span>{' '}
                          <span>{item.summary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="modal-footer" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'var(--surface-sunken)',
            padding: '12px 16px'
          }}
        >
          <div>
            {pendingSyncQueue.length > 0 && (
              confirmDiscard ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>Discard all edits?</span>
                  <button 
                    className="btn" 
                    style={{ background: 'var(--danger)', color: '#fff', fontSize: '0.78rem', padding: '4px 10px' }}
                    onClick={handleDiscardAll}
                  >
                    Yes, Discard
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                    onClick={() => setConfirmDiscard(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--danger)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setConfirmDiscard(true)}
                >
                  <Trash2 size={14} />
                  Discard All
                </button>
              )
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsSyncReviewOpen(false)}
            >
              {pendingSyncQueue.length > 0 ? 'Keep Staged' : 'Close'}
            </button>
            
            {pendingSyncQueue.length > 0 && (
              <button 
                className="btn btn-primary" 
                style={{ 
                  background: 'var(--accent)', 
                  borderColor: 'var(--accent)',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={handlePush}
                disabled={isPushing}
              >
                {isPushing ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Pushing to Google...
                  </>
                ) : (
                  <>
                    <CloudUpload size={16} />
                    Push Sync to Google ({pendingSyncQueue.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
