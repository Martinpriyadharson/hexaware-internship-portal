import React, { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';
import NotificationDrawer from './NotificationDrawer';
import AccountSecurityModal from './AccountSecurityModal';
import HelpCenterModal from './HelpCenterModal';
import { 
  Bell, ChevronDown, Menu, User, Settings, Lock, HelpCircle, LogOut 
} from 'lucide-react';

const TopNavigation = ({ 
  user, 
  onToggleSidebar, 
  onDateRangeChange, 
  setActiveTab, 
  onLogout,
  onSelectCandidateForAllocation
}) => {
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user?.role === 'Mentor' || user?.role === 'Admin') {
      fetchNotifications();
      fetchProfile();
    }
  }, [user]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/mentor/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/mentor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error('Error fetching mentor profile:', err);
    }
  };

  return (
    <>
      <header style={{
        height: '68px', background: 'rgba(10, 11, 22, 0.85)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30
      }}>
        {/* Left Hamburger & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onToggleSidebar}
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', 
              color: '#94a3b8', borderRadius: '10px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Right Tools: Date Range Picker, Notifications, Profile Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Interactive Date Range Picker */}
          <DateRangePicker onDateRangeChange={onDateRangeChange} />

          {/* Notification Bell Icon */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotificationDrawer(true)}
              style={{
                position: 'relative', width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px',
                  borderRadius: '50%', background: '#ef4444', color: '#ffffff', fontSize: '0.7rem',
                  fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0a0b16'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mentor Profile Avatar & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px',
                borderLeft: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer'
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem'
              }}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'AD'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: '#f8fafc', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{user?.name || 'Hexaware Admin'}</span>
                  <ChevronDown size={14} style={{ color: '#94a3b8' }} />
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  {user?.role === 'Admin' ? 'System Administrator' : (profileData?.designation || (user?.role === 'Mentor' ? 'Senior Evaluator' : 'Intern Candidate'))}
                </div>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div style={{
                position: 'absolute', right: 0, marginTop: '10px', width: '220px',
                background: '#0f1120', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', padding: '8px',
                zIndex: 60
              }}>
                {user?.role === 'Candidate' && (
                  <button
                    onClick={() => {
                      if (typeof setActiveTab === 'function') setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                      padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                      color: '#f8fafc', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} style={{ color: '#818cf8' }} />
                    <span>My Profile</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowSecurityModal(true);
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                    color: '#f8fafc', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Lock size={16} style={{ color: '#f59e0b' }} />
                  <span>Account Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                    color: '#f8fafc', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <HelpCircle size={16} style={{ color: '#10b981' }} />
                  <span>Help Center</span>
                </button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '6px 0' }} />

                <button
                  onClick={onLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                    color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer Slide-Over */}
      <NotificationDrawer 
        isOpen={showNotificationDrawer} 
        onClose={() => setShowNotificationDrawer(false)}
        onSelectCandidateForAllocation={onSelectCandidateForAllocation}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />

      {/* Account Security / Change Password Modal */}
      <AccountSecurityModal 
        isOpen={showSecurityModal} 
        onClose={() => setShowSecurityModal(false)} 
      />

      {/* Help & Support Center Modal */}
      <HelpCenterModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
};

export default TopNavigation;
