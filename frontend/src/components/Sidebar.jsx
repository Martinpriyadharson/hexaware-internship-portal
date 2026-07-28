import React from 'react';
import HexawareLogo from './HexawareLogo';
import { 
  LayoutDashboard, Users, ClipboardList, BarChart3, 
  FileText, User, Settings, LogOut, X, Hexagon, ChevronLeft, ChevronRight, UserCheck, ShieldCheck, BookOpen, MessageSquare 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed, onLogout, role }) => {
  const getMenuItems = () => {
    if (role === 'Admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'mentors', label: 'Mentors', icon: UserCheck },
      ];
    } else if (role === 'Candidate') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'chat', label: 'Mentor Chat', icon: MessageSquare },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'My Candidates', icon: Users },
        { id: 'assessments', label: 'Assessments', icon: ClipboardList },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(4px)', zIndex: 40, display: 'block'
          }} 
        />
      )}

      <aside style={{
        width: isCollapsed ? '80px' : '260px', flexShrink: 0,
        background: 'rgba(10, 11, 22, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
        flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0,
        zIndex: 45, transition: 'all 300ms ease'
      }}>
        {/* Header Branding (Clicking logo navigates to Dashboard) */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: isCollapsed ? '20px 12px' : '24px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          {isCollapsed ? (
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #006CC0 0%, #EF3830 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
              fontWeight: '900', fontSize: '0.9rem', fontStyle: 'italic'
            }}>
              hi.
            </div>
          ) : (
            <div>
              <HexawareLogo style={{ height: '32px', width: 'auto' }} />
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px', paddingLeft: '4px', fontWeight: '600' }}>
                INTERNSHIP PORTAL
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof setIsOpen === 'function') {
                    setIsOpen(false);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: isCollapsed ? 0 : '14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  width: '100%', padding: isCollapsed ? '12px' : '12px 16px', borderRadius: '12px',
                  fontSize: '0.9rem', fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={20} style={{ color: isActive ? '#818cf8' : '#94a3b8', flexShrink: 0 }} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Toggle Button & Logout */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Desktop Expand/Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
            }}
          >
            {!isCollapsed && <span>Collapse Sidebar</span>}
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : '12px', width: '100%',
              padding: '12px', borderRadius: '12px', fontSize: '0.9rem',
              fontWeight: '500', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
