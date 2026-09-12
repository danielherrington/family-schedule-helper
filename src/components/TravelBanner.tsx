import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Plane, ArrowRight, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';

export const TravelBanner: React.FC = () => {
  const { currentWeekDays, caregiverTravels, caregivers, setIsTravelModalOpen } = useSchedule();

  if (caregiverTravels.length === 0) return null;

  const weekStartStr = format(currentWeekDays[0], 'yyyy-MM-dd');
  const weekEndStr = format(currentWeekDays[6], 'yyyy-MM-dd');

  // Filter travels that overlap with this visible week
  const activeTravelsThisWeek = caregiverTravels.filter((t) => {
    return t.startDate <= weekEndStr && t.endDate >= weekStartStr;
  });

  if (activeTravelsThisWeek.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      {activeTravelsThisWeek.map((travel) => {
        const cg = caregivers.find((c) => c.id === travel.caregiverId);
        const target = caregivers.find((c) => c.id === travel.routeToCaregiverId);

        return (
          <div
            key={travel.id}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.10))',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  flexShrink: 0
                }}
              >
                <Plane size={18} />
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text)', marginRight: '6px' }}>
                  ✈️ Caregiver Out of Town:
                </span>
                <strong style={{ color: cg?.avatarColor || 'var(--primary)' }}>
                  {cg?.name || travel.caregiverId}
                </strong>
                <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>
                  is traveling ({travel.startDate} to {travel.endDate}).
                </span>
                <span>
                  All roles & duties auto-routed to{' '}
                  <strong style={{ color: target?.avatarColor || 'var(--accent)' }}>
                    {target?.name || travel.routeToCaregiverId}
                  </strong>.
                </span>
                {travel.reason && (
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#2563eb'
                    }}
                  >
                    {travel.reason}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => setIsTravelModalOpen(true)}
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                color: '#2563eb',
                background: 'rgba(59, 130, 246, 0.08)',
                fontWeight: 700
              }}
            >
              <SlidersHorizontal size={13} />
              <span>Manage Coverage</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
