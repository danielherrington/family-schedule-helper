import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Modal } from './ui/Modal';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const ShareDispatchModal: React.FC = () => {
  const {
    isShareDispatchOpen,
    setIsShareDispatchOpen,
    selectedDate,
    changeDateByDays,
    events,
    caregivers,
    children: childrenList,
    selectedCaregiverFilter,
    addToast
  } = useSchedule();

  const [copied, setCopied] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'family' | 'caregiver'>('family');

  if (!isShareDispatchOpen) return null;

  const targetCaregiver = caregivers.find((c) => c.id === selectedCaregiverFilter);
  const isSpecificCaregiver = selectedCaregiverFilter !== 'all' && !!targetCaregiver;

  // Format date label
  let dateFormatted = selectedDate;
  try {
    dateFormatted = format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy');
  } catch {}

  // Filter events for this day
  const rawDayEvents = events.filter((e) => e.date === selectedDate);
  const filteredEvents = rawDayEvents
    .filter((e) => {
      if (filterMode === 'caregiver' && isSpecificCaregiver) {
        return e.assignedTo === selectedCaregiverFilter;
      }
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Build emoji-formatted text dispatch
  const generateDispatchText = (): string => {
    const lines: string[] = [];

    const headerTitle = filterMode === 'caregiver' && isSpecificCaregiver
      ? `🚗 ${targetCaregiver?.name}'s Schedule — ${dateFormatted}`
      : `📅 Los Herringtons Schedule — ${dateFormatted}`;

    lines.push(headerTitle);
    lines.push('──────────────────────────');

    if (filteredEvents.length === 0) {
      lines.push('🌴 No duties scheduled for this day!');
    } else {
      // Group events by category
      const morning = filteredEvents.filter((e) => e.category === 'dropoff' || (e.startTime < '12:00' && e.category === 'routine'));
      const pickups = filteredEvents.filter((e) => e.category === 'pickup');
      const activities = filteredEvents.filter((e) => e.category === 'activity');
      const routines = filteredEvents.filter((e) => e.category === 'routine' && !morning.includes(e));

      const formatEventLine = (e: typeof filteredEvents[0]) => {
        const cg = caregivers.find((c) => c.id === e.assignedTo);
        const driverName = cg ? cg.name.split(' ')[0] : 'Unassigned';
        const ch = childrenList.find((c) => c.id === e.childId);
        const kidName = ch ? ch.name : (e.childId === 'all' ? 'All' : e.childId);
        
        let statusTag = '';
        if (e.status === 'cancelled') {
          statusTag = ' [OFF / HOLIDAY]';
        } else if (e.status === 'no_pickup_needed') {
          statusTag = ` [🚫 No Pickup: ${e.cancellationReason || 'Playdate/Friend'}]`;
        }

        const loc = e.location ? ` (${e.location})` : '';
        return `• ${e.startTime}–${e.endTime}: ${e.title} ➔ ${driverName}${loc}${statusTag}`;
      };

      if (morning.length > 0) {
        lines.push('');
        lines.push('🌅 Morning Runs & Routines:');
        morning.forEach((e) => lines.push(formatEventLine(e)));
      }

      if (pickups.length > 0) {
        lines.push('');
        lines.push('☀️ School Pickups:');
        pickups.forEach((e) => lines.push(formatEventLine(e)));
      }

      if (activities.length > 0) {
        lines.push('');
        lines.push('🎨 Activities & Classes:');
        activities.forEach((e) => lines.push(formatEventLine(e)));
      }

      if (routines.length > 0) {
        lines.push('');
        lines.push('🌙 Evening & Routines:');
        routines.forEach((e) => lines.push(formatEventLine(e)));
      }
    }

    lines.push('');
    lines.push('──────────────────────────');
    lines.push('Shared via Los Herringtons Schedule Helper 🚀');
    lines.push('https://family-schedule-helper.web.app');

    return lines.join('\n');
  };

  const dispatchText = generateDispatchText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dispatchText);
      setCopied(true);
      addToast('✓ Dispatch copied to clipboard! Ready to paste into WhatsApp or Messages.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('Could not copy to clipboard automatically.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Los Herringtons Schedule (${selectedDate})`,
          text: dispatchText
        });
        addToast('✓ Shared successfully!', 'success');
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(dispatchText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <Modal
      isOpen={isShareDispatchOpen}
      onClose={() => setIsShareDispatchOpen(false)}
      title="Share Daily Dispatch"
      subtitle={`Formatted summary for WhatsApp, iMessage, and family group chat`}
      icon={<Share2 size={20} color="var(--primary)" />}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsShareDispatchOpen(false)}
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleWhatsApp}
              style={{
                background: '#25D366',
                borderColor: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNativeShare}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={16} />
                <span>Share...</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Date Selector Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px' }}>
          <button
            type="button"
            className="nav-btn"
            onClick={() => changeDateByDays(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>
              {dateFormatted}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {filteredEvents.length} {filteredEvents.length === 1 ? 'duty' : 'duties'} scheduled
            </div>
          </div>

          <button
            type="button"
            className="nav-btn"
            onClick={() => changeDateByDays(1)}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* View Filter Scope (Whole Family vs Driver) */}
        {isSpecificCaregiver && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${filterMode === 'family' ? 'btn-primary' : ''}`}
              style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
              onClick={() => setFilterMode('family')}
            >
              Whole Family Dispatch ({rawDayEvents.length})
            </button>
            <button
              type="button"
              className={`btn ${filterMode === 'caregiver' ? 'btn-primary' : ''}`}
              style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
              onClick={() => setFilterMode('caregiver')}
            >
              {targetCaregiver?.name.split(' ')[0]}'s Duties ({rawDayEvents.filter((e) => e.assignedTo === selectedCaregiverFilter).length})
            </button>
          </div>
        )}

        {/* Dispatch Preview Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Message Preview:
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
              1-Tap Ready for Chat
            </span>
          </div>
          <pre
            style={{
              background: '#0F172A',
              color: '#F8FAFC',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              padding: '12px 14px',
              borderRadius: '10px',
              overflowX: 'auto',
              maxHeight: '260px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {dispatchText}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
