import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Modal } from './ui/Modal';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  UserCheck, 
  Check, 
  X 
} from 'lucide-react';
import { ParentContact } from '../types/schedule';

export const ParentDirectoryModal: React.FC = () => {
  const { 
    isParentDirectoryOpen, 
    setIsParentDirectoryOpen, 
    parentContacts, 
    addParentContact, 
    updateParentContact, 
    deleteParentContact 
  } = useSchedule();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setParentName('');
    setChildName('');
    setPhone('');
    setRelationship('');
    setNotes('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (contact: ParentContact) => {
    setEditingId(contact.id);
    setParentName(contact.parentName);
    setChildName(contact.childName);
    setPhone(contact.phone);
    setRelationship(contact.relationship || '');
    setNotes(contact.notes || '');
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !phone.trim()) return;

    if (editingId) {
      await updateParentContact(editingId, {
        parentName: parentName.trim(),
        childName: childName.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      await addParentContact({
        parentName: parentName.trim(),
        childName: childName.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
        notes: notes.trim() || undefined
      });
    }
    resetForm();
  };

  const filteredContacts = parentContacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.parentName.toLowerCase().includes(q) ||
      c.childName.toLowerCase().includes(q) ||
      (c.relationship && c.relationship.toLowerCase().includes(q)) ||
      c.phone.includes(q)
    );
  });

  const formatCleanPhoneForWhatsApp = (rawPhone: string) => {
    return rawPhone.replace(/[^\d]/g, '');
  };

  return (
    <Modal
      isOpen={isParentDirectoryOpen}
      onClose={() => {
        setIsParentDirectoryOpen(false);
        resetForm();
      }}
      title="Playdate & Carpool Contact Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Quick-dial contacts and friend directory for playdates, carpool rides, and emergency pickup coverage.
        </p>

        {/* Top Controls: Search + Add Button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search parents or kids..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
            }}
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Cancel' : 'Add Contact'}</span>
          </button>
        </div>

        {/* Add / Edit Form */}
        {(isAdding || editingId) && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--primary)',
              background: 'rgba(0, 180, 216, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} />
              <span>{editingId ? 'Edit Parent Contact' : 'Add New Parent / Carpool Contact'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                  Child / Classmate Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leo Jenkins"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. (305) 555-0142"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                  Relationship / Class
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leo's Mom (Lehrman Pre-K)"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                Notes / Carpool Arrangements
              </label>
              <input
                type="text"
                placeholder="e.g. Can drive Izzy home on Tuesdays, booster seat in silver Honda"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={14} />
                <span>{editingId ? 'Save Changes' : 'Save Contact'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Contacts Directory List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No contacts found. Tap <strong>Add Contact</strong> to add friends, carpool parents, or babysitters.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const cleanPhone = formatCleanPhoneForWhatsApp(contact.phone);
              return (
                <div
                  key={contact.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{contact.parentName}</span>
                        {contact.childName && (
                          <span 
                            style={{ 
                              fontSize: '0.725rem', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              background: 'rgba(121, 40, 202, 0.1)', 
                              color: '#7928CA',
                              fontWeight: 700 
                            }}
                          >
                            Child: {contact.childName}
                          </span>
                        )}
                      </div>
                      {contact.relationship && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {contact.relationship}
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                        onClick={() => handleStartEdit(contact)}
                        title="Edit contact"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                        onClick={() => deleteParentContact(contact.id)}
                        title="Remove contact"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {contact.notes && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text)', background: 'var(--surface-raised, rgba(0,0,0,0.03))', padding: '6px 10px', borderRadius: '6px' }}>
                      💬 {contact.notes}
                    </div>
                  )}

                  {/* Quick Action Dialing / Messaging Row */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={13} />
                      <span>Call {contact.phone}</span>
                    </a>

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          color: '#25D366',
                          borderColor: '#25D366',
                          background: 'rgba(37, 211, 102, 0.08)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
