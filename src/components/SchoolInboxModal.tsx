import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  X, 
  Mail, 
  GraduationCap, 
  RefreshCw, 
  Check, 
  Clock, 
  Calendar, 
  Sparkles, 
  FileText, 
  Trash2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { SchoolCalendarException } from '../types/schedule';
import { SchoolCalendarService } from '../services/schoolCalendarService';
import { format, parseISO } from 'date-fns';

export const SchoolInboxModal: React.FC = () => {
  const { 
    isSchoolInboxOpen, 
    setIsSchoolInboxOpen, 
    schoolExceptions, 
    applySchoolException,
    addSchoolException,
    scanSchoolInbox,
    connectedEmail
  } = useSchedule();

  const [activeTab, setActiveTab] = useState<'updates' | 'paste'>('updates');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'applied'>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Paste form state
  const [pasteSubject, setPasteSubject] = useState<string>('');
  const [pasteBody, setPasteBody] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<SchoolCalendarException | null>(null);

  if (!isSchoolInboxOpen) return null;

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanSchoolInbox();
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = async (exc: SchoolCalendarException) => {
    setApplyingId(exc.id);
    try {
      await applySchoolException(exc.id);
    } finally {
      setApplyingId(null);
    }
  };

  const handlePasteChange = (text: string, subject: string) => {
    setPasteBody(text);
    setPasteSubject(subject);
    if (text.trim().length > 10) {
      const parsed = SchoolCalendarService.parseSchoolNoticeText(text, subject);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleSavePastedNotice = async () => {
    if (!parsedPreview) return;
    await addSchoolException(parsedPreview);
    setPasteBody('');
    setPasteSubject('');
    setParsedPreview(null);
    setActiveTab('updates');
  };

  const filteredExceptions = schoolExceptions.filter((exc) => {
    if (filterStatus === 'pending') return !exc.applied && !exc.dismissed;
    if (filterStatus === 'applied') return exc.applied;
    return true;
  });

  const lastScan = SchoolCalendarService.getLastScanTimestamp();

  return (
    <div className="modal-overlay" onClick={() => setIsSchoolInboxOpen(false)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{ 
            borderBottom: '1px solid var(--border)',
            paddingBottom: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 42, 133, 0.05) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706'
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                School Calendar & Gmail Ingestion
                <span 
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#FF2A85',
                    color: '#fff',
                    letterSpacing: '0.04em'
                  }}
                >
                  DAN-15
                </span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automated Gmail inbox scanning & early dismissal auto-detection for Lehrman Community Day School
              </div>
            </div>
          </div>
          <button className="nav-btn" onClick={() => setIsSchoolInboxOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div 
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            background: 'var(--surface-raised)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={handleScan}
              disabled={isScanning}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderColor: '#d97706',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '7px 14px'
              }}
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning Inbox...' : 'Scan Gmail Inbox'}</span>
            </button>

            {lastScan && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Last checked: {format(new Date(lastScan), 'MMM d, h:mm a')}
              </span>
            )}
          </div>

          {/* Connected Email Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <Mail size={14} color="var(--accent)" />
            <span style={{ color: 'var(--text-muted)' }}>Inbox:</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>
              {connectedEmail || 'daniel.j.herrington@gmail.com'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          <button
            onClick={() => setActiveTab('updates')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'updates' ? '3px solid #f59e0b' : '3px solid transparent',
              color: activeTab === 'updates' ? '#d97706' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} />
            <span>School Updates ({schoolExceptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'paste' ? '3px solid #f59e0b' : '3px solid transparent',
              color: activeTab === 'paste' ? '#d97706' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} />
            <span>Paste Notice / Flyer Text</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'updates' && (
            <div>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                {(['all', 'pending', 'applied'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid var(--border)',
                      background: filterStatus === s ? 'var(--accent)' : 'transparent',
                      color: filterStatus === s ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {s} ({s === 'all' ? schoolExceptions.length : s === 'pending' ? schoolExceptions.filter(e => !e.applied && !e.dismissed).length : schoolExceptions.filter(e => e.applied).length})
                  </button>
                ))}
              </div>

              {filteredExceptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <GraduationCap size={36} style={{ opacity: 0.4, margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No school exceptions in this view</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Click "Scan Gmail Inbox" above or paste an email snippet in the Paste tab.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredExceptions.map((exc) => {
                    let formattedDate = exc.date;
                    try {
                      formattedDate = format(parseISO(exc.date), 'EEEE, MMMM d, yyyy');
                    } catch {}

                    const isEarlyDismissal = exc.type === 'early_dismissal';

                    return (
                      <div
                        key={exc.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          background: exc.applied 
                            ? 'rgba(16, 185, 129, 0.04)' 
                            : 'var(--surface-raised)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>
                                {exc.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  background: isEarlyDismissal ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: isEarlyDismissal ? '#b45309' : '#dc2626',
                                  border: `1px solid ${isEarlyDismissal ? '#f59e0b' : '#ef4444'}`
                                }}
                              >
                                {isEarlyDismissal ? `Dismissal: ${formatTimeDisplay(exc.dismissalTime || '13:15')}` : 'School Closed'}
                              </span>

                              {exc.applied && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#059669',
                                    border: '1px solid #10b981',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <Check size={12} /> Applied to Schedule
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                              🏫 <strong>{exc.schoolName || 'Lehrman'}</strong> &bull; Date: <strong>{formattedDate}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!exc.applied ? (
                              <button
                                className="btn btn-primary"
                                style={{
                                  background: '#f59e0b',
                                  borderColor: '#d97706',
                                  fontSize: '0.78rem',
                                  padding: '6px 12px',
                                  fontWeight: 700
                                }}
                                disabled={applyingId === exc.id}
                                onClick={() => handleApply(exc)}
                              >
                                <Check size={14} />
                                <span>{applyingId === exc.id ? 'Applying...' : 'Apply to Schedule'}</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                                Active on Blueprint
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Email Source Snippet */}
                        {exc.sourceSnippet && (
                          <div
                            style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              lineHeight: '1.4'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} color="var(--accent)" />
                              <span>{exc.sourceSubject || 'Incoming Email Snippet'}:</span>
                            </div>
                            "{exc.sourceSnippet}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Paste any email announcement, flyer text, or school bulletin below. The NLP engine will automatically extract the date, early dismissal time, and conflict reason.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '5px' }}>
                  Email Subject / Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lehrman Friday Newsletter: Sukkot Early Dismissal Notice"
                  value={pasteSubject}
                  onChange={(e) => handlePasteChange(pasteBody, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '5px' }}>
                  Email Body / Announcement Text
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste school newsletter, flyer announcement, or message here (e.g. 'Reminder: This Friday, October 2nd is Shabbat dismissal at 1:15 PM for all Isabella\'s grade levels...')"
                  value={pasteBody}
                  onChange={(e) => handlePasteChange(e.target.value, pasteSubject)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Parsed Preview Card */}
              {parsedPreview && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.08))',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#d97706', fontSize: '0.85rem' }}>
                    <Sparkles size={16} />
                    <span>AI / Pattern Extraction Detected:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Detected Date: </span>
                      <strong>{parsedPreview.date}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Dismissal Time: </span>
                      <strong>{formatTimeDisplay(parsedPreview.dismissalTime || '13:15')}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Event Type: </span>
                      <strong style={{ textTransform: 'capitalize' }}>{parsedPreview.type.replace('_', ' ')}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>School: </span>
                      <strong>{parsedPreview.schoolName}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSavePastedNotice}
                      style={{
                        background: '#f59e0b',
                        borderColor: '#d97706',
                        fontSize: '0.82rem',
                        padding: '7px 14px',
                        fontWeight: 800
                      }}
                    >
                      <Check size={14} />
                      <span>Confirm & Add Exception</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          style={{ 
            padding: '12px 20px', 
            borderTop: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'flex-end',
            background: 'var(--surface-raised)'
          }}
        >
          <button className="btn" onClick={() => setIsSchoolInboxOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
