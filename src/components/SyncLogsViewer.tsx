import React, { useState, useEffect } from 'react';
import { GoogleCalendarService } from '../services/googleCalendarClient';
import { SyncLogEntry } from '../types/schedule';
import { useSchedule } from '../context/ScheduleContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  ShieldCheck, 
  Filter,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';

export const SyncLogsViewer: React.FC = () => {
  const { 
    authStatus, 
    connectedEmail, 
    activeCalendarId, 
    caregiverCalendarMappings, 
    events, 
    refreshCalendarEvents, 
    isLoading 
  } = useSchedule();

  const [logs, setLogs] = useState<SyncLogEntry[]>(() => GoogleCalendarService.getSyncLogs());
  const [filter, setFilter] = useState<'all' | 'errors' | 'mutations'>('all');
  const [copied, setCopied] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    const handleLogUpdate = () => {
      setLogs(GoogleCalendarService.getSyncLogs());
    };

    window.addEventListener('gcal_sync_log_added', handleLogUpdate);
    return () => {
      window.removeEventListener('gcal_sync_log_added', handleLogUpdate);
    };
  }, []);

  const isLive = authStatus.mode === 'live_gcal';
  const linkedEventsCount = events.filter((e) => e.isGCalLinked ?? !e.id.startsWith('evt-')).length;
  const blueprintEventsCount = events.length - linkedEventsCount;
  const errorCount = logs.filter((l) => l.status === 'error').length;

  const filteredLogs = logs.filter((log) => {
    if (filter === 'errors') return log.status === 'error';
    if (filter === 'mutations') return ['patch_assignment', 'move_event', 'no_pickup', 'create_event', 'delete_event'].includes(log.action);
    return true;
  });

  const handleCopyLogs = () => {
    const report = {
      timestamp: new Date().toISOString(),
      auth: {
        isLive,
        connectedEmail,
        activeCalendarId,
        mappings: caregiverCalendarMappings
      },
      eventsSummary: {
        total: events.length,
        gcalLinked: linkedEventsCount,
        localBlueprint: blueprintEventsCount
      },
      logs
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    if (confirm('Clear all Google Calendar sync logs?')) {
      GoogleCalendarService.clearSyncLogs();
      setLogs([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Diagnostics Health Summary Card */}
      <div 
        style={{ 
          background: isLive ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)', 
          border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          borderRadius: '10px', 
          padding: '12px 16px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color={isLive ? 'var(--success)' : '#d97706'} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              {isLive ? 'Live Google Calendar Sync Active' : 'Disconnected / Blueprint Mode'}
            </span>
          </div>
          <span 
            style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: '12px',
              background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isLive ? '#059669' : '#d97706'
            }}
          >
            {isLive ? `User: ${connectedEmail || 'Authenticated'}` : 'Offline'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '0.78rem' }}>
          <div style={{ background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Board Events</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
              {events.length} Total
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>GCal Linked (In-Place)</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#059669' }}>
              🟢 {linkedEventsCount} Invites
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Local Blueprints</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#d97706' }}>
              🟡 {blueprintEventsCount} Routines
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Logged Errors</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: errorCount > 0 ? '#ef4444' : 'var(--text)' }}>
              {errorCount > 0 ? `🔴 ${errorCount} Error${errorCount === 1 ? '' : 's'}` : '✓ 0 Errors'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <button
            type="button"
            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => setFilter('all')}
          >
            All Logs ({logs.length})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'errors' ? 'btn-primary' : ''}`}
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.78rem',
              borderColor: filter === 'errors' ? '#ef4444' : errorCount > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined,
              color: filter === 'errors' ? '#fff' : errorCount > 0 ? '#ef4444' : undefined,
              background: filter === 'errors' ? '#ef4444' : undefined
            }}
            onClick={() => setFilter('errors')}
          >
            Errors ({errorCount})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'mutations' ? 'btn-primary' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => setFilter('mutations')}
          >
            Edits & Pushes
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={refreshCalendarEvents}
            disabled={isLoading || !isLive}
            title="Fetch real Google Calendar events for the week and reconcile in place"
          >
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
            <span>Refresh Google Calendar</span>
          </button>

          <button
            type="button"
            className="btn"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={handleCopyLogs}
            title="Copy diagnostic logs and setup to clipboard"
          >
            {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Report'}</span>
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              className="btn"
              style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--danger)' }}
              onClick={handleClear}
              title="Clear logged sync items"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          maxHeight: '380px', 
          overflowY: 'auto',
          paddingRight: '4px' 
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Info size={28} color="var(--text-dim)" style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.6 }} />
            <div>{filter === 'errors' ? 'No sync errors recorded! Everything is clean.' : 'No sync logs recorded yet in this browser session.'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Connect your Google Calendar or make a driver assignment to view live API request telemetry.
            </div>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.status === 'error';
            const isSuccess = log.status === 'success';
            const isWarning = log.status === 'warning';
            const isExpanded = expandedLogId === log.id;

            let badgeColor = isError ? '#ef4444' : isSuccess ? '#059669' : isWarning ? '#d97706' : '#2563eb';
            let badgeBg = isError ? 'rgba(239, 68, 68, 0.12)' : isSuccess ? 'rgba(16, 185, 129, 0.12)' : isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)';

            return (
              <div
                key={log.id}
                style={{
                  background: 'var(--surface-card)',
                  border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.35)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: badgeBg,
                        color: badgeColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {log.statusCode ? `HTTP ${log.statusCode}` : log.status}
                    </span>

                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: 'var(--text-muted)',
                        background: 'var(--surface)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {log.action.replace('_', ' ').toUpperCase()}
                    </span>

                    {log.calendarId && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        📅 {log.calendarId === 'primary' ? 'Primary' : log.calendarId.split('@')[0]}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: isError ? '#b91c1c' : 'var(--text)' }}>
                  {log.summary}
                </div>

                {log.details && (
                  <div>
                    <div 
                      style={{ 
                        fontSize: '0.78rem', 
                        color: 'var(--text-muted)',
                        background: 'rgba(0, 0, 0, 0.02)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontFamily: isError ? 'var(--font-mono)' : undefined,
                        lineHeight: 1.4,
                        whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {log.details}
                    </div>

                    {log.details.length > 80 && (
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 0 0 0',
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? '▲ Collapse details' : '▼ Expand full error/details'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
