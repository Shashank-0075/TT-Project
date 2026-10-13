import React from 'react';

export const StatCard = ({ label, title, value, subtext, icon: Icon, variant = 'primary' }) => {
  const displayLabel = label || title;
  return (
    <div className={`stat-card variant-${variant}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-label">{displayLabel}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon ${variant}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
