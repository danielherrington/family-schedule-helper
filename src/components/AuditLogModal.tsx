import React, { useEffect, useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { FileText, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { Modal } from './ui/Modal';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { SyncLogsViewer } from './SyncLogsViewer';

export const AuditLogModal: React.FC = () => {
  const { isAuditLogOpen, setIsAuditLogOpen } = useSchedule();
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sync' | 'overrides'>('sync');

  useEffect(() => {
    if (isAuditLogOpen) {
      fetch('/api/audit-log')
        .then((res) => res.json())
        .then((data) => setLogs(data.logs || []))
        .catch(() => setLogs([]));
    }
  }, [isAuditLogOpen]);

  if (!isAuditLogOpen) return null;

  return (
    <Modal
      isOpen={isAuditLogOpen}
      onClose={() => setIsAuditLogOpen(false)}
      title="Audit & Live Sync Telemetry"
      subtitle="Inspect Google Calendar API HTTP responses, payload telemetry, and single-occurrence atomic overrides"
      icon={<Activity size={20} color="var(--primary)" />}
      size="lg"
      footer={
        <button 
          type="button"
          className="btn btn-primary" 
          onClick={() => setIsAuditLogOpen(false)}
          style={{ minWidth: '100px', justifyContent: 'center' }}
        >
          Close
        </button>
      }
    >
      <SegmentedTabs
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'sync' | 'overrides')}
        tabs={[
          {
            id: 'sync',
            label: 'Google Calendar Sync Logs',
            mobileLabel: 'Sync Logs',
            icon: <Activity size={14} />
          },
          {
            id: 'overrides',
            label: 'Atomic Overrides Audit',
            mobileLabel: 'Overrides',
            icon: <FileText size={14} />
          }
        ]}
        style={{ marginBottom: '16px' }}
      />

      {activeTab === 'sync' ? (
        <SyncLogsViewer />
      ) : (
        <div>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)' }}>
              No single-instance reassignments made in this session yet. Reassign any pickup on the board to view its atomic audit trail.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>
                      Date: {log.date}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{log.previousAssignee}</span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{log.newAssignee}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

