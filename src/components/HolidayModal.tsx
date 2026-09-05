import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getHolidayForDate, CATEGORIZED_HOLIDAY_PRESETS } from '../utils/holidayEngine';
import { X, Palmtree, Sparkles, Check, Star, Flag, School } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'jewish' | 'federal' | 'school'>('jewish');

  // If the target date has a recognized holiday, prefill it!
  useEffect(() => {
    if (targetDateStr) {
      const known = getHolidayForDate(targetDateStr);
      if (known) {
        setHolidayName(`${known.name} (No School)`);
        if (known.category === 'jewish') setActiveTab('jewish');
        else if (known.category === 'federal') setActiveTab('federal');
      } else {
        setHolidayName('School Holiday / No Classes');
      }
    }
  }, [targetDateStr, isOpen]);

  if (!isOpen) return null;

  const detectedHoliday = targetDateStr ? getHolidayForDate(targetDateStr) : null;

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
      <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palmtree size={22} color="#10b981" />
            <div>
              <div className="modal-title">Mark Holiday / Day Off</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target Date: <strong>{targetDateStr}</strong>
              </div>
            </div>
          </div>
          <button className="nav-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Detected Holiday Callout */}
          {detectedHoliday && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.825rem',
                color: '#c4b5fd',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Recognized Holiday: {detectedHoliday.name}</strong> ({detectedHoliday.category === 'jewish' ? 'Jewish Holiday' : 'Major Holiday'}). We've pre-filled the reason below.
              </div>
            </div>
          )}

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
            <Palmtree size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Cancelling duties for this day will mark them as <strong>"🌴 No Class / Holiday"</strong> and suppress driver assignments without breaking recurring schedules for subsequent weeks.
            </div>
          </div>

          {/* Categorized Quick Presets */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Presets & Jewish / US Holidays:
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('jewish')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: activeTab === 'jewish' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: activeTab === 'jewish' ? '#c4b5fd' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  ✡️ Jewish
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('federal')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: activeTab === 'federal' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: activeTab === 'federal' ? '#93c5fd' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  🇺🇸 Federal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('school')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: activeTab === 'school' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: activeTab === 'school' ? '#6ee7b7' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  🏫 School
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIZED_HOLIDAY_PRESETS[activeTab].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHolidayName(preset)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: holidayName === preset ? 'var(--accent)' : 'var(--border)',
                    background: holidayName === preset ? 'var(--accent-alpha)' : 'var(--surface-card)',
                    color: holidayName === preset ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Holiday Name / Reason:
            </label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Rosh Hashanah, Labor Day, Teacher Planning Day"
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
            <span>{isSubmitting ? 'Applying...' : 'Confirm Holiday / Day Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
