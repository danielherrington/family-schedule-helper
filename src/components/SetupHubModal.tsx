import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { 
  Users, 
  Smile, 
  CalendarRange, 
  SlidersHorizontal 
} from 'lucide-react';
import { isStaging } from '../services/firebaseClient';
import { Modal } from './ui/Modal';
import { SegmentedTabs, TabItem } from './ui/SegmentedTabs';
import { CaregiversTab } from './setup/CaregiversTab';
import { KidsTab } from './setup/KidsTab';
import { BlueprintsTab } from './setup/BlueprintsTab';

export const SetupHubModal: React.FC = () => {
  const { 
    isSetupOpen, 
    setIsSetupOpen, 
    activeSetupTab, 
    setActiveSetupTab,
    caregivers,
    children: childrenList,
    templates,
    cloudSyncActive
  } = useSchedule();

  const tabs: TabItem[] = [
    {
      id: 'caregivers',
      label: '1. Potential Caregivers',
      mobileLabel: 'Caregivers',
      icon: <Users size={16} />,
      count: caregivers.length
    },
    {
      id: 'kids',
      label: '2. Potential Kids & Pets',
      mobileLabel: 'Kids & Pets',
      icon: <Smile size={16} />,
      count: childrenList.length
    },
    {
      id: 'blueprint',
      label: '3. Event Blueprints',
      mobileLabel: 'Blueprints',
      icon: <CalendarRange size={16} />,
      count: templates.length
    }
  ];

  const cloudBadge = cloudSyncActive ? (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px', 
      fontSize: '0.72rem', 
      fontWeight: 700, 
      padding: '3px 9px', 
      borderRadius: '12px', 
      background: isStaging ? '#fef3c7' : 'rgba(16, 185, 129, 0.12)', 
      color: isStaging ? '#b45309' : '#059669', 
      border: isStaging ? '1px solid #f59e0b' : '1px solid rgba(16, 185, 129, 0.3)' 
    }}>
      {isStaging ? '🧪 Staging Cloud (Firestore)' : '☁️ Shared Cloud (Firestore)'}
    </span>
  ) : null;

  return (
    <Modal
      isOpen={isSetupOpen}
      onClose={() => setIsSetupOpen(false)}
      title="Family Logistics Setup Hub"
      subtitle="Configure your Potential Caregivers, Potential Kids & Pets, and Weekly Routine Blueprint"
      icon={<SlidersHorizontal size={20} color="var(--accent)" />}
      badge={cloudBadge}
      size="lg"
      className="setup-hub-modal"
      headerContent={
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeSetupTab}
          onChange={(tabId) => setActiveSetupTab(tabId as 'caregivers' | 'kids' | 'blueprint')}
        />
      }
      footer={
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={() => setIsSetupOpen(false)}
          style={{ minWidth: '100px', justifyContent: 'center' }}
        >
          Done
        </button>
      }
    >
      {activeSetupTab === 'caregivers' && <CaregiversTab />}
      {activeSetupTab === 'kids' && <KidsTab />}
      {activeSetupTab === 'blueprint' && <BlueprintsTab />}
    </Modal>
  );
};
