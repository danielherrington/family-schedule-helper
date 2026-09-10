import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { EventTemplate, EventCategory } from '../../types/schedule';
import { Plus, Trash2, Pencil, Check, X, Sparkles, RotateCcw } from 'lucide-react';
import { isStaging, copyProdSetupToStaging } from '../../services/firebaseClient';

export const BlueprintsTab: React.FC = () => {
  const { 
    templates,
    caregivers,
    children: childrenList,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyWeeklyBlueprint,
    resetToDemoSchedule,
    currentWeekDays
  } = useSchedule();

  // New Template Form State
  const [tplTitle, setTplTitle] = useState('');
  const [tplChildId, setTplChildId] = useState(childrenList[0]?.id || 'vale');
  const [tplCategory, setTplCategory] = useState<EventCategory>('dropoff');
  const [tplDays, setTplDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [tplStartTime, setTplStartTime] = useState('08:00');
  const [tplEndTime, setTplEndTime] = useState('08:30');
  const [tplLocation, setTplLocation] = useState('');
  const [tplDefaultCg, setTplDefaultCg] = useState(caregivers[0]?.id || 'daniel');

  // Editing Template State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editChildId, setEditChildId] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('dropoff');
  const [editDays, setEditDays] = useState<number[]>([]);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDefaultCg, setEditDefaultCg] = useState('');
  const [editSyncCurrentWeek, setEditSyncCurrentWeek] = useState(true);

  const startEditingTemplate = (tpl: EventTemplate) => {
    setEditingTemplateId(tpl.id);
    setEditTitle(tpl.title);
    setEditChildId(tpl.childId);
    setEditCategory(tpl.category);
    setEditDays([...tpl.daysOfWeek]);
    setEditStartTime(tpl.startTime);
    setEditEndTime(tpl.endTime);
    setEditLocation(tpl.location || '');
    setEditDefaultCg(tpl.defaultCaregiverId || 'daniel');
    setEditSyncCurrentWeek(true);
  };

  const cancelEditingTemplate = () => {
    setEditingTemplateId(null);
  };

  const handleToggleEditDay = (dayNum: number) => {
    setEditDays((prev) => 
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleSaveEditedTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateId || !editTitle.trim()) return;

    await updateTemplate(
      editingTemplateId, 
      {
        title: editTitle.trim(),
        childId: editChildId,
        category: editCategory,
        daysOfWeek: editDays,
        startTime: editStartTime,
        endTime: editEndTime,
        location: editLocation.trim() || 'School',
        defaultCaregiverId: editDefaultCg
      },
      editSyncCurrentWeek
    );
    setEditingTemplateId(null);
  };

  const handleToggleDay = (dayNum: number) => {
    setTplDays((prev) => 
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplTitle.trim()) return;
    await addTemplate({
      title: tplTitle.trim(),
      childId: tplChildId,
      category: tplCategory,
      daysOfWeek: tplDays,
      startTime: tplStartTime,
      endTime: tplEndTime,
      location: tplLocation.trim() || 'School',
      defaultCaregiverId: tplDefaultCg
    });
    setTplTitle('');
    setTplLocation('');
  };

  const dayLabels = [
    { num: 1, label: 'M' },
    { num: 2, label: 'Tu' },
    { num: 3, label: 'W' },
    { num: 4, label: 'Th' },
    { num: 5, label: 'F' },
    { num: 6, label: 'Sa' },
    { num: 7, label: 'Su' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          💡 <strong>Event Blueprint</strong> is your master weekly routine (e.g. <em>"Vale Drop Off Mon–Fri"</em>, <em>"Izzy Gymnastics Tue/Thu"</em>).
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isStaging && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={async () => {
                if (confirm('Copy latest production routine blueprint and settings into this staging environment? This will overwrite your staging test data with current prod.')) {
                  const ok = await copyProdSetupToStaging();
                  if (ok) {
                    window.location.reload();
                  } else {
                    alert('Failed to copy from production. Please try again.');
                  }
                }
              }}
              style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', borderColor: '#f59e0b', color: '#b45309' }}
              title="Sync latest setup from production to staging"
            >
              <RotateCcw size={14} />
              <span>Sync from Prod</span>
            </button>
          )}
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              if (confirm('Reset your weekly blueprint to default family routine (Vale/Izzy alternating drop-offs)?')) {
                resetToDemoSchedule();
              }
            }}
            style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
            title="Restore default family blueprints (alternating drop-offs)"
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => {
              const mondayStr = currentWeekDays && currentWeekDays[0] 
                ? currentWeekDays[0].toISOString().split('T')[0] 
                : '2026-08-31';
              applyWeeklyBlueprint(mondayStr);
            }}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Sparkles size={16} />
            <span>Apply Blueprint to Week</span>
          </button>
        </div>
      </div>

      {/* Existing Templates */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>
          Routine Weekly Blueprint ({templates.length} Repeating Events):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {templates.map((tpl) => {
            const child = childrenList.find((c) => c.id === tpl.childId);
            const defCg = caregivers.find((c) => c.id === tpl.defaultCaregiverId);
            const isEditing = editingTemplateId === tpl.id;

            if (isEditing) {
              return (
                <form 
                  key={tpl.id} 
                  onSubmit={handleSaveEditedTemplate}
                  style={{
                    background: 'var(--surface-hover)',
                    border: '2px solid var(--accent)',
                    borderRadius: '10px',
                    padding: '16px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}>
                      <Pencil size={16} />
                      <span>Editing Blueprint Event: <u>{tpl.title}</u></span>
                    </div>
                    <button 
                      type="button" 
                      className="nav-btn" 
                      onClick={cancelEditingTemplate}
                      title="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Event Title:</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontWeight: 600 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Child:</label>
                      <select 
                        value={editChildId}
                        onChange={(e) => setEditChildId(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      >
                        {childrenList.map((ch) => (
                          <option key={ch.id} value={ch.id}>{ch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category:</label>
                      <select 
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      >
                        <option value="dropoff">School Drop Off</option>
                        <option value="pickup">School Pick Up</option>
                        <option value="activity">Activity / Class</option>
                      </select>
                    </div>
                  </div>

                  {/* Repeating Days */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Repeating Days:</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {dayLabels.map((d) => {
                        const isSelected = editDays.includes(d.num);
                        return (
                          <button 
                            type="button" 
                            key={d.num}
                            onClick={() => handleToggleEditDay(d.num)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                              background: isSelected ? 'var(--accent)' : 'var(--surface)',
                              color: isSelected ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time, Location, Default Caregiver */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1.5fr', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Start Time:</label>
                      <input 
                        type="time" 
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>End Time:</label>
                      <input 
                        type="time" 
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location:</label>
                      <input 
                        type="text" 
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Default Caregiver:</label>
                      <select 
                        value={editDefaultCg}
                        onChange={(e) => setEditDefaultCg(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      >
                        {caregivers.map((cg) => (
                          <option key={cg.id} value={cg.id}>{cg.name} ({cg.role})</option>
                        ))}
                        <option value="unassigned">⚠️ Unassigned (Open Gap)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sync Checkbox & Save/Cancel Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={editSyncCurrentWeek} 
                        onChange={(e) => setEditSyncCurrentWeek(e.target.checked)}
                      />
                      <span>Update matching events on this week's active schedule</span>
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={cancelEditingTemplate}
                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        <Check size={15} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              );
            }

            return (
              <div 
                key={tpl.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <span 
                    className="child-badge" 
                    style={{ 
                      backgroundColor: child?.badgeBg || 'rgba(59, 130, 246, 0.15)',
                      borderColor: child?.badgeBorder || 'rgba(59, 130, 246, 0.4)',
                      color: child?.color || '#3b82f6'
                    }}
                  >
                    {child?.name || tpl.childId}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tpl.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>🕒 {tpl.startTime} - {tpl.endTime}</span>
                      <span>📍 {tpl.location}</span>
                      <span>👤 Default: <strong>{defCg?.name || tpl.defaultCaregiverId}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Repeating Day Badges */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {dayLabels.map((d) => (
                    <span 
                      key={d.num} 
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: tpl.daysOfWeek.includes(d.num) ? 'var(--accent)' : 'var(--surface)',
                        color: tpl.daysOfWeek.includes(d.num) ? '#fff' : 'var(--text-dim)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button 
                    type="button" 
                    className="nav-btn" 
                    onClick={() => startEditingTemplate(tpl)}
                    title="Edit blueprint event"
                    style={{ color: 'var(--primary)', padding: '6px' }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="nav-btn" 
                    onClick={() => deleteTemplate(tpl.id)}
                    title="Remove template"
                    style={{ color: 'var(--danger)', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Routine Template Form */}
      <form onSubmit={handleCreateTemplate} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} color="var(--accent)" />
          <span>Add New Routine Event to Blueprint</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Event Title:</label>
            <input 
              type="text" 
              placeholder="e.g. Vale Ballet Pick Up"
              value={tplTitle}
              onChange={(e) => setTplTitle(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Child:</label>
            <select 
              value={tplChildId}
              onChange={(e) => setTplChildId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            >
              {childrenList.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category:</label>
            <select 
              value={tplCategory}
              onChange={(e) => setTplCategory(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            >
              <option value="dropoff">School Drop Off</option>
              <option value="pickup">School Pick Up</option>
              <option value="activity">Activity / Class</option>
            </select>
          </div>
        </div>

        {/* Day Selection Checkboxes */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Repeating Days:</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dayLabels.map((d) => {
              const isSelected = tplDays.includes(d.num);
              return (
                <button 
                  type="button" 
                  key={d.num}
                  onClick={() => handleToggleDay(d.num)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Start Time:</label>
            <input 
              type="time" 
              value={tplStartTime}
              onChange={(e) => setTplStartTime(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>End Time:</label>
            <input 
              type="time" 
              value={tplEndTime}
              onChange={(e) => setTplEndTime(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location:</label>
            <input 
              type="text" 
              placeholder="e.g. North Beach"
              value={tplLocation}
              onChange={(e) => setTplLocation(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Default Caregiver:</label>
            <select 
              value={tplDefaultCg}
              onChange={(e) => setTplDefaultCg(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
            >
              {caregivers.map((cg) => (
                <option key={cg.id} value={cg.id}>{cg.name}</option>
              ))}
              <option value="unassigned">⚠️ Unassigned</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Plus size={16} />
          <span>Save to Routine Blueprint</span>
        </button>
      </form>
    </div>
  );
};
