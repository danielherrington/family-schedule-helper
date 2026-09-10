import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';

export const CaregiversTab: React.FC = () => {
  const { 
    caregivers,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    caregiverCalendarMappings,
    setCaregiverCalendarMapping,
    userCalendars
  } = useSchedule();

  // New Caregiver Form State
  const [cgName, setCgName] = useState('');
  const [cgRole, setCgRole] = useState('Parent / Manager');
  const [cgColor, setCgColor] = useState('#3b82f6');
  const [cgCalendar, setCgCalendar] = useState('');

  // Editing Caregiver State
  const [editingCaregiverId, setEditingCaregiverId] = useState<string | null>(null);
  const [editCaregiverName, setEditCaregiverName] = useState('');
  const [editCaregiverRole, setEditCaregiverRole] = useState('');
  const [editCaregiverColor, setEditCaregiverColor] = useState('#3b82f6');

  const startEditingCaregiver = (cg: any) => {
    setEditingCaregiverId(cg.id);
    setEditCaregiverName(cg.name);
    setEditCaregiverRole(cg.role || 'Caregiver');
    setEditCaregiverColor(cg.avatarColor || '#3b82f6');
  };

  const cancelEditingCaregiver = () => {
    setEditingCaregiverId(null);
  };

  const handleSaveCaregiverEdit = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editCaregiverName.trim()) return;
    await updateCaregiver(id, {
      name: editCaregiverName.trim(),
      role: editCaregiverRole.trim() || 'Caregiver',
      avatarColor: editCaregiverColor
    });
    setEditingCaregiverId(null);
  };

  const handleCreateCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgName.trim()) return;
    const isManager = cgRole.includes('Manager') || cgRole.includes('Parent');
    await addCaregiver({
      name: cgName.trim(),
      role: cgRole,
      avatarColor: cgColor,
      calendarId: cgCalendar.trim() || undefined,
      isManager
    });
    setCgName('');
    setCgCalendar('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        💡 <strong>Potential Caregivers</strong> are the adults and helpers who take turns driving and managing pick-ups (Parents, Nannies, Grandparents). Each caregiver can have their shared Google Calendar ID linked.
      </div>

      {/* Existing Caregivers */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Active Caregiver Roster:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {caregivers.map((cg) => {
            const isEditing = editingCaregiverId === cg.id;

            if (isEditing) {
              return (
                <div 
                  key={cg.id} 
                  style={{
                    padding: '14px 16px',
                    background: 'var(--surface)',
                    border: '2px solid var(--accent)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Pencil size={15} color="var(--accent)" />
                      <span>Edit Caregiver: <strong>{cg.name}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={cancelEditingCaregiver}
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => handleSaveCaregiverEdit(cg.id)}
                        style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                      >
                        <Check size={14} /> Save Changes
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 80px', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Full Name:</label>
                      <input 
                        type="text" 
                        value={editCaregiverName}
                        onChange={(e) => setEditCaregiverName(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600 }}
                        placeholder="Caregiver Name"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Role / Description:</label>
                      <input 
                        type="text" 
                        value={editCaregiverRole}
                        onChange={(e) => setEditCaregiverRole(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.88rem' }}
                        placeholder="e.g. Parent / Manager or Nanny"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Color:</label>
                      <input 
                        type="color" 
                        value={editCaregiverColor}
                        onChange={(e) => setEditCaregiverColor(e.target.value)}
                        style={{ width: '100%', height: '36px', padding: '2px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            const calName = caregiverCalendarMappings[cg.id]?.calendarName || (
              cg.id === 'daniel' ? 'Family - Daniel' :
              cg.id === 'lucila' ? 'Family - Lucila' :
              cg.id === 'elizabeth' ? 'Family - Elizabeth' :
              cg.id === 'matilda' ? 'Family - Matilde' :
              (cg.calendarId && !cg.calendarId.includes('@') ? cg.calendarId : `Family - ${cg.name.split(' ')[0]}`)
            );

            return (
              <div 
                key={cg.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar" style={{ backgroundColor: cg.avatarColor, width: '36px', height: '36px' }}>
                    {cg.avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {cg.name} {cg.isManager && <span style={{ fontSize: '0.75rem', background: 'var(--accent-alpha)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Manager</span>}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                      <span>{cg.role}</span>
                      <span>•</span>
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          background: 'rgba(0, 180, 216, 0.12)', 
                          color: 'var(--primary)', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        <span>📅</span>
                        <span>Synced to: <strong>{calName}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {userCalendars.length > 0 && (
                    <select
                      value={caregiverCalendarMappings[cg.id]?.calendarId || ''}
                      onChange={(e) => {
                        const cal = userCalendars.find((c) => c.id === e.target.value);
                        setCaregiverCalendarMapping(cg.id, e.target.value, cal?.summary || e.target.value);
                      }}
                      style={{
                        fontSize: '0.78rem',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        fontWeight: 600,
                        maxWidth: '170px'
                      }}
                      title="Change synced Google Calendar"
                    >
                      <option value="">Link Calendar...</option>
                      {userCalendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary}
                        </option>
                      ))}
                    </select>
                  )}

                  <button 
                    className="nav-btn"
                    onClick={() => startEditingCaregiver(cg)}
                    title="Edit caregiver details"
                    style={{ color: 'var(--primary)', padding: '6px 8px' }}
                  >
                    <Pencil size={15} />
                  </button>

                  <button 
                    className="nav-btn"
                    onClick={() => deleteCaregiver(cg.id)}
                    title="Remove caregiver"
                    style={{ color: 'var(--danger)', padding: '6px 8px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Caregiver Form */}
      <form onSubmit={handleCreateCaregiver} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} color="var(--accent)" />
          <span>Add New Potential Caregiver</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name:</label>
            <input 
              type="text" 
              placeholder="e.g. Babysitter Sarah"
              value={cgName}
              onChange={(e) => setCgName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role:</label>
            <select
              value={cgRole}
              onChange={(e) => setCgRole(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            >
              <option value="Parent / Manager">Parent / Manager</option>
              <option value="Nanny">Nanny</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Babysitter / Driver">Babysitter / Driver</option>
              <option value="Family Helper">Family Helper</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Synced Google Calendar:</label>
            {userCalendars.length > 0 ? (
              <select
                value={cgCalendar}
                onChange={(e) => setCgCalendar(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontWeight: 600 }}
              >
                <option value="">-- Select from your Google Calendars --</option>
                {userCalendars.map((cal) => (
                  <option key={cal.id} value={cal.summary}>
                    {cal.summary}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                placeholder="e.g. Family - Sarah"
                value={cgCalendar}
                onChange={(e) => setCgCalendar(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
              />
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Color Theme:</label>
            <input 
              type="color" 
              value={cgColor}
              onChange={(e) => setCgColor(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Plus size={16} />
          <span>Save Caregiver</span>
        </button>
      </form>
    </div>
  );
};
