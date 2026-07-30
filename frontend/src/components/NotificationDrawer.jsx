import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { X, CheckCheck, Trash2, Bell, CheckCircle2, Clock, UserPlus } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose, onSelectCandidateForAllocation, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    if (typeof onUnreadCountChange === 'function') {
      onUnreadCountChange(unread);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        // Candidate notifications (load from localStorage or initialize)
        const saved = localStorage.getItem('hexaware_candidate_notifs');
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          const initialNotifs = [
            {
              _id: 'c1',
              title: 'Assigned Corporate Mentor',
              message: 'Martin Priyadharson has been assigned as your corporate evaluator and mentor.',
              type: 'MentorAssigned',
              isRead: false,
              createdAt: new Date().toISOString()
            },
            {
              _id: 'c2',
              title: 'Specialization Track Assessment Passed',
              message: 'Your assessment performance has been verified by Hexaware admin evaluation panel.',
              type: 'AssessmentPassed',
              isRead: true,
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
            }
          ];
          setNotifications(initialNotifs);
          localStorage.setItem('hexaware_candidate_notifs', JSON.stringify(initialNotifs));
        }
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = (newList) => {
    setNotifications(newList);
    localStorage.setItem('hexaware_candidate_notifs', JSON.stringify(newList));
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/mentor/notifications/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    updateNotifications(updated);
  };

  const markRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/mentor/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
    const updated = notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
    updateNotifications(updated);
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/mentor/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
    const updated = notifications.filter(n => n._id !== id);
    updateNotifications(updated);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div 
        onClick={onClose} 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 9998 }} 
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh',
        background: '#0a0b16', borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex',
        flexDirection: 'column', transition: 'all 0.3s ease'
      }}>
        {/* Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontSize: '0.9rem' }}>No notifications found.</div>
          ) : (
            notifications.map(item => (
              <div 
                key={item._id}
                style={{
                  padding: '14px', borderRadius: '14px',
                  background: item.type === 'AssessmentPassed' ? 'rgba(16, 185, 129, 0.1)' : item.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(129, 140, 248, 0.08)',
                  border: `1px solid ${item.type === 'AssessmentPassed' ? 'rgba(16, 185, 129, 0.3)' : item.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(129, 140, 248, 0.2)'}`,
                  display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: item.type === 'AssessmentPassed' ? '#10b981' : '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.type === 'AssessmentPassed' && <CheckCircle2 size={16} />}
                    <span>{item.title}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!item.isRead && (
                      <button 
                        onClick={() => markRead(item._id)}
                        title="Mark Read"
                        style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0 }}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(item._id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.4 }}>{item.message}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {item.type === 'AssessmentPassed' && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectCandidateForAllocation) {
                          onSelectCandidateForAllocation(item);
                        }
                      }}
                      style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Review & Allocate Mentor &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
