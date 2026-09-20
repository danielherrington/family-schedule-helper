import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getHolidayForDate, CATEGORIZED_HOLIDAY_PRESETS } from '../utils/holidayEngine';
import { Palmtree, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Modal } from './ui/Modal';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateStr: string;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, targetDateStr }) => {
  const { markDayAsHoliday, unmarkDayHoliday, holidays, children: childrenList } = useSchedule();
  const [holidayName, setHolidayName] = useState('School Holiday / No Classes');
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'jewish' | 'federal' | 'school'>('jewish');

  const existingHoliday = holidays.find((h) => h.date === targetDateStr);

  // If the target date has a recognized holiday or existing marked holiday, prefill it!
  useEffect(() => {
    if (targetDateStr) {
      const existing = holidays.find((h) => h.date === targetDateStr);
      if (existing) {
        setHolidayName(existing.name);
        if (existing.childId) setSelectedChildId(existing.childId);
      } else {
        const known = getHolidayForDate(targetDateStr);
        if (known) {
          setHolidayName(`${known.name} (No School)`);
          if (known.category === 'jewish') setActiveTab('jewish');
          else if (known.category === 'federal') setActiveTab('federal');
        } else {
          setHolidayName('School Holiday / No Classes');
        }
      }
    }
  }, [targetDateStr, isOpen, holidays]);

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

  const handleRemove = async () => {
    try {
      setIsSubmitting(true);
      await unmarkDayHoliday(targetDateStr);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingHoliday ? "Manage Holiday / Day Off" : "Mark Holiday / Day Off"}
      subtitle={
        <span>
          Target Date: <strong>{targetDateStr}</strong> {existingHoliday ? `(Currently Marked: ${existingHoliday.name})` : ''}
        </span>
      }
      icon={<Palmtree size={22} color={existingHoliday ? "#ef4444" : "#10b981"} />}
      size="md"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            {existingHoliday && (
              <button 
                type="button"
                className="btn" 
                style={{
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)',
                  background: 'rgba(225, 29, 72, 0.08)',
                  fontWeight: 700
                }}
                disabled={isSubmitting}
                onClick={handleRemove}
                title="Unmark this holiday and restore all cancelled duties"
              >
                <RotateCcw size={15} />
                <span>Remove Holiday & Restore Duties</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button 
              type="button"
              className="btn" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="btn btn-primary"
              style={{ background: '#10b981', borderColor: '#10b981' }}
              disabled={isSubmitting || !holidayName.trim()}
              onClick={handleConfirm}
            >
              <Check size={16} />
              <span>{existingHoliday ? 'Update Holiday' : isSendingSubmit(isSubmitting)}</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Existing Marked Holiday Banner */}
      {existingHoliday && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.85rem',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palmtree size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
            <div>
              <strong>Currently marked as Day Off:</strong> "{existingHoliday.name}"
              <div style={{ fontSize: '0.78rem', color: '#991b1b', marginTop: '2px' }}>
                Pickup & drop-off duties are cancelled. Click below to unmark and restore schedule.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn"
            style={{
              borderColor: '#dc2626',
              color: '#dc2626',
              background: '#fff',
              fontSize: '0.78rem',
              padding: '4px 10px',
              minHeight: '32px',
              fontWeight: 700
            }}
            disabled={isSubmitting}
            onClick={handleRemove}
          >
            <RotateCcw size={13} />
            <span>Restore Duties</span>
          </button>
        </div>
      )}
      {/* Detected Holiday Callout */}
      {detectedHoliday && (
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.825rem',
            color: '#7c3aed',
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
          color: '#059669',
          display: 'flex',
          gap: '10px'
        }}
      >
        <Palmtree size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          Cancelling duties for this day will mark them as <strong>"🌴 No Class / Holiday"</strong> and suppress driver assignments without breaking recurring schedules for subsequent weeks.
          <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
            🐕 <em>Note: Dog walks (Moe 🐕) remain scheduled and active during holidays.</em>
          </div>
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
                color: activeTab === 'jewish' ? '#7c3aed' : 'var(--text-muted)',
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
                color: activeTab === 'federal' ? '#2563eb' : 'var(--text-muted)',
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
                color: activeTab === 'school' ? '#059669' : 'var(--text-muted)',
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
    </Modal>
  );
};

function isSendingSubmit(submitting: boolean) {
  return submitting ? 'Applying...' : 'Confirm Holiday / Day Off';
}
