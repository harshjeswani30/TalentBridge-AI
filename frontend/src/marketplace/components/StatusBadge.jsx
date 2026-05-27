import React from 'react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'rgba(238, 238, 238, 0.1)', text: '#EEEEEE', dot: '#EEEEEE' },
  reviewed: { label: 'Reviewed', bg: '#393E46', text: '#00ADB5', dot: '#00ADB5' },
  accepted: { label: 'Accepted', bg: '#00ADB5', text: '#222831', dot: '#222831' },
  rejected: { label: 'Rejected', bg: '#393E46', text: 'rgba(238, 238, 238, 0.5)', dot: 'rgba(238, 238, 238, 0.5)' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="mp-status-badge"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="mp-status-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
