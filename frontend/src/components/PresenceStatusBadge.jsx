import React from 'react';

const statusConfig = {
  'Available': { color: '#10b981', label: 'Available', icon: '🟢', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  'Busy': { color: '#ef4444', label: 'Busy', icon: '🔴', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  'DND': { color: '#f43f5e', label: 'Do Not Disturb', icon: '⛔', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' },
  'BRB': { color: '#f59e0b', label: 'Be Right Back', icon: '🟡', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  'Appear Away': { color: '#fbbf24', label: 'Away', icon: '🌙', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
  'Appear Offline': { color: '#64748b', label: 'Invisible', icon: '⚫', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)' },
  'Offline': { color: '#475569', label: 'Offline', icon: '⚪', bg: 'rgba(71, 85, 105, 0.15)', border: 'rgba(71, 85, 105, 0.3)' }
};

const PresenceStatusBadge = ({ status = 'Available', customStatus = '', size = 10, showLabel = false, showDot = true }) => {
  const config = statusConfig[status] || statusConfig['Offline'];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} title={`${config.label}${customStatus ? ` - ${customStatus}` : ''}`}>
      {showDot && (
        <span style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: config.color,
          border: '2px solid #0a0c1a',
          boxShadow: `0 0 8px ${config.color}`,
          display: 'inline-block',
          flexShrink: 0
        }} />
      )}
      {showLabel && (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {config.label} {customStatus ? `(${customStatus})` : ''}
        </span>
      )}
    </div>
  );
};

export default PresenceStatusBadge;
