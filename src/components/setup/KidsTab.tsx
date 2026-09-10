import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';

export const KidsTab: React.FC = () => {
  const { 
    children: childrenList,
    addChild,
    updateChild,
    deleteChild
  } = useSchedule();

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        💡 <strong>Potential Kids & Pets</strong> represents the children and pets whose logistics, walks, schools, and extracurricular schedules you coordinate.
      </div>

      {/* Existing Kids & Pets */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Active Family Dependents:</div>
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

      {/* Add Child / Pet Form */}
      <form onSubmit={handleCreateChild} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} color="var(--accent)" />
          <span>Add New Child or Pet</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Name / Pet:</label>
            <input 
              type="text" 
              placeholder="e.g. Leo or Moe 🐕"
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>School / Routine / Details:</label>
            <input 
              type="text" 
              placeholder="e.g. Montessori or Dog Walk"
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
          <span>Save Dependent</span>
        </button>
      </form>
    </div>
  );
};
