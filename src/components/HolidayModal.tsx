import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { X, Palmtree, Sparkles, Check, AlertCircle } from 'lucide-react';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateStr: string;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, targetDateStr }) => {
  const { markDayAsHoliday, children: childrenList } = useSchedule();
  const [holidayName, setHolidayName] = useState('School Holiday / No Classes');
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickPresets = [
    'Labor Day — No School',
    'Teacher Planning Day (No Classes)',
    'School Holiday / Break',
    'Yom Kippur / Religious Holiday',
    'Sick Day — Stay Home',
    'Weather / Storm Closure'
  ];

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await markDayAsHoliday(targetDateStr, holidayName, selectedChildId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palmtree size={22} color="#10b981" />
            <div>
              <div className="modal-title">Mark Holiday / Day Off</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Date: <strong>{targetDateStr}</strong>
              </div>
            </div>
          </div>
          <button className="nav-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Info notice */}
          <div 
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.825rem',
              color: '#6ee7b7',
              display: 'flex',
              gap: '10px'
            }}
          >
            <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Cancelling duties for this day will mark them as <strong>"🌴 No Class / Holiday"</strong> and suppress calendar alerts for caregivers without breaking recurring schedules for future weeks.
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Quick Presets:
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHolidayName(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: holidayName === preset ? 'var(--accent)' : 'var(--border)',
                    background: holidayName === preset ? 'var(--accent-alpha)' : 'var(--surface-card)',
                    color: holidayName === preset ? 'var(--accent)' : 'var(--text-muted)'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Holiday or Reason:
            </label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Labor Day, Spring Break, No Classes"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.875rem'
              }}
              required
            />
          </div>

          {/* Applies to */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Applies to:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${selectedChildId === 'all' ? 'btn-primary' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={() => setSelectedChildId('all')}
              >
                All Kids
              </button>
              {childrenList.map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  className={`btn ${selectedChildId === ch.id ? 'btn-primary' : ''}`}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    borderColor: selectedChildId === ch.id ? ch.color : undefined,
                    background: selectedChildId === ch.id ? ch.color : undefined,
                    color: selectedChildId === ch.id ? '#fff' : undefined
                  }}
                  onClick={() => setSelectedChildId(ch.id)}
                >
                  {ch.name} Only
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            style={{ background: '#10b981', borderColor: '#10b981' }}
            disabled={isSubmitting || !holidayName.trim()}
            onClick={handleConfirm}
          >
            <Check size={16} />
            <span>{isSubmitting ? 'Cancelling...' : 'Confirm Holiday / Day Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
