import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  mobileLabel?: string;
  icon?: React.ReactNode;
  count?: number | string;
}

export interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  style
}) => {
  return (
    <div className={`setup-tab-bar ${className}`} style={style}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`setup-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">
              {tab.mobileLabel ? (
                <>
                  <span className="hide-mobile">{tab.label}</span>
                  <span className="show-mobile-only">{tab.mobileLabel}</span>
                </>
              ) : (
                tab.label
              )}
            </span>
            {tab.count !== undefined && (
              <span className="setup-tab-count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
