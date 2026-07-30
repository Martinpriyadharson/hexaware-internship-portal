import React, { useState } from 'react';
import { Check, X, Shield, Clock, BellOff, Coffee, Moon, EyeOff, UserX } from 'lucide-react';
import PresenceStatusBadge from './PresenceStatusBadge';

const statusOptions = [
  { status: 'Available', label: 'Available', desc: 'Online and actively working', color: '#10b981', icon: '🟢' },
  { status: 'Busy', label: 'Busy', desc: 'Online but focused on tasks', color: '#ef4444', icon: '🔴' },
  { status: 'DND', label: 'Do Not Disturb', desc: 'Mute non-critical notifications', color: '#f43f5e', icon: '⛔' },
  { status: 'BRB', label: 'Be Right Back', desc: 'Temporarily away from desk', color: '#f59e0b', icon: '🟡' },
  { status: 'Appear Away', label: 'Appear Away', desc: 'Set status as away', color: '#fbbf24', icon: '🌙' },
  { status: 'Appear Offline', label: 'Appear Offline', desc: 'Stealth mode while active', color: '#64748b', icon: '⚫' }
];

const PresenceSelectorModal = ({ currentStatus, customStatus, onClose, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Available');
  const [statusMsg, setStatusMsg] = useState(customStatus || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(selectedStatus, statusMsg);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#0a0c1a',
        border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '24px',
        padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Set Availability Status</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Teams & Slack style presence management</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Custom Status Message</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. In Meeting, Reviewing Tasks, Lunch Break..." 
              value={statusMsg}
              onChange={(e) => setStatusMsg(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Presence State</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {statusOptions.map(opt => (
                <div 
                  key={opt.status} 
                  onClick={() => setSelectedStatus(opt.status)}
                  style={{
                    padding: '10px 14px', borderRadius: '12px',
                    border: `1px solid ${selectedStatus === opt.status ? opt.color : 'rgba(255,255,255,0.08)'}`,
                    background: selectedStatus === opt.status ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PresenceStatusBadge status={opt.status} size={12} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#ffffff' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{opt.desc}</div>
                    </div>
                  </div>
                  {selectedStatus === opt.status && <Check size={16} style={{ color: opt.color }} />}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="glow-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}>
            <span>Update Status</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PresenceSelectorModal;
