import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { EventTemplate } from '../types/schedule';
import { 
  X, 
  Users, 
  Smile, 
  CalendarRange, 
  Plus, 
  Trash2, 
  Pencil,
  Check, 
  Sparkles,
  Clock,
  MapPin,
  HelpCircle,
  Play,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export const SetupHubModal: React.FC = () => {
  const { 
    isSetupOpen, 
    setIsSetupOpen, 
    activeSetupTab, 
    setActiveSetupTab,
    caregivers,
    children: childrenList,
    templates,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    addChild,
    updateChild,
    deleteChild,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyWeeklyBlueprint,
    resetToDemoSchedule,
    currentWeekDays,
    selectedDate,
    cloudSyncActive,
    caregiverCalendarMappings,
    setCaregiverCalendarMapping,
    userCalendars
  } = useSchedule();

  // Caregiver Form State
  const [cgName, setCgName] = useState('');
  const [cgRole, setCgRole] = useState('Parent / Manager');
  const [cgColor, setCgColor] = useState('#3b82f6');
  const [cgCalendar, setCgCalendar] = useState('');
  const [cgIsManager, setCgIsManager] = useState(false);

  // Child Form State
  const [kidName, setKidName] = useState('');
  const [kidColor, setKidColor] = useState('#a855f7');
  const [kidSchool, setKidSchool] = useState('');

  // Editing Child State
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildSchool, setEditChildSchool] = useState('');
  const [editChildColor, setEditChildColor] = useState('#a855f7');

  const startEditingChild = (ch: any) => {
    setEditingChildId(ch.id);
    setEditChildName(ch.name);
    setEditChildSchool(ch.school || '');
    setEditChildColor(ch.color || '#a855f7');
  };

  const cancelEditingChild = () => {
    setEditingChildId(null);
  };

  const handleSaveChildEdit = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editChildName.trim()) return;
    await updateChild(id, {
      name: editChildName.trim(),
      school: editChildSchool.trim(),
      color: editChildColor
    });
    setEditingChildId(null);
  };

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
      role: editCaregiverRole.trim(),
      avatarColor: editCaregiverColor
    });
    setEditingCaregiverId(null);
  };

  // Template Form State
  const [tplTitle, setTplTitle] = useState('');
  const [tplChildId, setTplChildId] = useState('izzy');
  const [tplCategory, setTplCategory] = useState<'dropoff' | 'pickup' | 'activity'>('pickup');
  const [tplDays, setTplDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [tplStartTime, setTplStartTime] = useState('15:00');
  const [tplEndTime, setTplEndTime] = useState('15:30');
  const [tplLocation, setTplLocation] = useState('');
  const [tplDefaultCg, setTplDefaultCg] = useState('lucila');

  // Editing Blueprint State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editChildId, setEditChildId] = useState('izzy');
  const [editCategory, setEditCategory] = useState<'dropoff' | 'pickup' | 'activity'>('pickup');
  const [editDays, setEditDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editStartTime, setEditStartTime] = useState('15:00');
  const [editEndTime, setEditEndTime] = useState('15:30');
  const [editLocation, setEditLocation] = useState('');
  const [editDefaultCg, setEditDefaultCg] = useState('lucila');
  const [editSyncCurrentWeek, setEditSyncCurrentWeek] = useState(true);

  const startEditingTemplate = (tpl: EventTemplate) => {
    setEditingTemplateId(tpl.id);
    setEditTitle(tpl.title);
    setEditChildId(tpl.childId);
    setEditCategory(tpl.category as any || 'pickup');
    setEditDays([...tpl.daysOfWeek]);
    setEditStartTime(tpl.startTime);
    setEditEndTime(tpl.endTime);
    setEditLocation(tpl.location);
    setEditDefaultCg(tpl.defaultCaregiverId);
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
    if (editDays.length === 0) {
      alert('Please select at least one repeating day of the week.');
      return;
    }

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

  if (!isSetupOpen) return null;

  const handleCreateCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgName.trim()) return;
    await addCaregiver({
      name: cgName.trim(),
      role: cgRole,
      avatarColor: cgColor,
      calendarId: cgCalendar.trim() || `${cgName.toLowerCase().replace(/[^a-z0-9]/g, '')}@herrington.ai`,
      isManager: cgIsManager
    });
    setCgName('');
    setCgCalendar('');
  };

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidName.trim()) return;
    await addChild({
      name: kidName.trim(),
      color: kidColor,
      school: kidSchool.trim() || 'School'
    });
    setKidName('');
    setKidSchool('');
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
    <div className="modal-overlay" onClick={() => setIsSetupOpen(false)}>
      <div className="modal-card setup-hub-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px', padding: '18px 22px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={20} color="var(--accent)" />
                  <span>Family Logistics Setup Hub</span>
                </div>
                {cloudSyncActive && (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '3px 9px', 
                    borderRadius: '12px', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    color: '#059669', 
                    border: '1px solid rgba(16, 185, 129, 0.3)' 
                  }}>
                    ☁️ Shared Cloud (Firestore)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Configure your Potential Caregivers, Potential Kids, and Weekly Routine Blueprint
              </div>
            </div>
            <button className="nav-btn" onClick={() => setIsSetupOpen(false)} title="Close">
              <X size={20} />
            </button>
          </div>

          {/* Segmented Pill Tab Switcher */}
          <div className="setup-tab-bar">
            <button
              type="button"
              className={`setup-tab-btn ${activeSetupTab === 'caregivers' ? 'active' : ''}`}
              onClick={() => setActiveSetupTab('caregivers')}
            >
              <Users size={16} />
              <span><span className="hide-mobile">1. Potential </span>Caregivers</span>
              <span className="setup-tab-count">{caregivers.length}</span>
            </button>
            <button
              type="button"
              className={`setup-tab-btn ${activeSetupTab === 'kids' ? 'active' : ''}`}
              onClick={() => setActiveSetupTab('kids')}
            >
              <Smile size={16} />
              <span><span className="hide-mobile">2. Potential </span>Kids</span>
              <span className="setup-tab-count">{childrenList.length}</span>
            </button>
            <button
              type="button"
              className={`setup-tab-btn ${activeSetupTab === 'blueprint' ? 'active' : ''}`}
              onClick={() => setActiveSetupTab('blueprint')}
            >
              <CalendarRange size={16} />
              <span><span className="hide-mobile">3. Event </span>Blueprints</span>
              <span className="setup-tab-count">{templates.length}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          
          {/* TAB 1: CAREGIVERS */}
          {activeSetupTab === 'caregivers' && (
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
          )}

          {/* TAB 2: KIDS */}
          {activeSetupTab === 'kids' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                💡 <strong>Potential Kids</strong> represents the children whose logistics, schools, and extracurricular schedules you coordinate.
              </div>

              {/* Existing Kids */}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Active Children:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {childrenList.map((ch) => {
                    const isEditing = editingChildId === ch.id;

                    if (isEditing) {
                      return (
                        <div 
                          key={ch.id} 
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
                              <span>Edit Child Profile: <strong>{ch.name}</strong></span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={cancelEditingChild}
                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                              >
                                <X size={14} /> Cancel
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={() => handleSaveChildEdit(ch.id)}
                                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                              >
                                <Check size={14} /> Save Changes
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 80px', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Child Name:</label>
                              <input 
                                type="text" 
                                value={editChildName}
                                onChange={(e) => setEditChildName(e.target.value)}
                                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600 }}
                                placeholder="Child Name"
                                required
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>School / Program:</label>
                              <input 
                                type="text" 
                                value={editChildSchool}
                                onChange={(e) => setEditChildSchool(e.target.value)}
                                style={{ width: '100%', padding: '7px 10px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.88rem' }}
                                placeholder="School / Program details"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Badge Color:</label>
                              <input 
                                type="color" 
                                value={editChildColor}
                                onChange={(e) => setEditChildColor(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '2px', background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={ch.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: 'var(--surface-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: ch.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.9rem'
                            }}
                          >
                            {ch.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ch.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ch.school || 'School'}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => startEditingChild(ch)}
                            title="Edit child details"
                            style={{ color: 'var(--primary)', padding: '6px 8px' }}
                          >
                            <Pencil size={15} />
                          </button>

                          <button 
                            className="nav-btn"
                            onClick={() => deleteChild(ch.id)}
                            title="Remove child"
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

              {/* Add Child Form */}
              <form onSubmit={handleCreateChild} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} color="var(--accent)" />
                  <span>Add New Child</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Child Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Leo"
                      value={kidName}
                      onChange={(e) => setKidName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>School / Program:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Montessori"
                      value={kidSchool}
                      onChange={(e) => setKidSchool(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Badge Color:</label>
                    <input 
                      type="color" 
                      value={kidColor}
                      onChange={(e) => setKidColor(e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} />
                  <span>Save Child</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: EVENT TEMPLATES (WEEKLY BLUEPRINT) */}
          {activeSetupTab === 'blueprint' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  💡 <strong>Event Blueprint</strong> is your master weekly routine (e.g. *"Vale Drop Off Mon–Fri"*, *"Izzy Gymnastics Tue/Thu"*).
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setIsSetupOpen(false)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
