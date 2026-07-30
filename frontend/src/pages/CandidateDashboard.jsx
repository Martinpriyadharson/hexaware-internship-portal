import React, { useState, useContext, useEffect } from 'react';
import { API_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';
import ProfileDetails from './ProfileDetails';
import StackSelection from './StackSelection';
import TestScreen from './TestScreen';
import ResultScreen from './ResultScreen';
import ChatHub from './ChatHub';
import CandidateWorkLogView from '../components/CandidateWorkLogView';
import { 
  ClipboardList, CheckCircle2, UserCheck, Clock, TrendingUp, 
  Calendar, Check, X, ShieldCheck, Mail, BookOpen, Layers, Award, Send, MessageSquare, AlertCircle, Eye, Download, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { openResumeInNewTab, downloadResumeFile, getResumeFileName } from '../utils/resumeHelper';

const CandidateDashboard = ({ onSelectStack }) => {
  const { user, logout, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [workMode, setWorkMode] = useState('Office');
  const [attendanceRemarks, setAttendanceRemarks] = useState('');
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [realTasks, setRealTasks] = useState([]);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [popupModal, setPopupModal] = useState({ open: false, title: '', message: '', type: 'info' });

  const candidateKey = user?._id || user?.id || 'candidate_default';
  const getSavedAttendance = () => {
    try {
      const saved = localStorage.getItem(`hexaware_att_${candidateKey}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { presentDays: 0, officeDays: 0, wfhDays: 0, hasLoggedToday: false, lastLoggedDate: '' };
  };

  const [attRecord, setAttRecord] = useState(getSavedAttendance);

  useEffect(() => {
    if (token) fetchCandidateTasks();
  }, [token]);

  const fetchCandidateTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks/my-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRealTasks(data);
      }
    } catch (err) {
      console.error('Error fetching candidate tasks:', err);
    }
  };

  const getAttendanceSummaryStats = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let workingDaysCount = 0;
    let weekendOffCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday (0) & Saturday (6) = Weekly Off / Leave
        weekendOffCount++;
      } else {
        workingDaysCount++;
      }
    }

    const currentDayOfWeek = now.getDay();
    const isTodayWeeklyOff = currentDayOfWeek === 0 || currentDayOfWeek === 6;

    const rate = workingDaysCount > 0 
      ? Math.min(100, Math.round((attRecord.presentDays / workingDaysCount) * 100))
      : 0;

    return {
      daysInMonth,
      weekendOffCount,
      workingDaysCount,
      isTodayWeeklyOff,
      todayDayName: currentDayOfWeek === 0 ? 'Sunday' : currentDayOfWeek === 6 ? 'Saturday' : '',
      rate
    };
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
      const dayName = currentDayOfWeek === 0 ? 'Sunday' : 'Saturday';
      setPopupModal({
        open: true,
        title: 'Official Weekly Off',
        message: `Today is ${dayName} (Official Weekly Off / Leave). No attendance required today!`,
        type: 'info'
      });
      return;
    }

    const todayStr = now.toDateString();
    if (attRecord.lastLoggedDate === todayStr) {
      setPopupModal({
        open: true,
        title: 'Attendance Already Logged',
        message: 'You have already logged your attendance for today!',
        type: 'warning'
      });
      return;
    }

    const isPresent = attendanceStatus === 'Present';
    const isOffice = workMode === 'Office' || workMode.includes('Office');
    
    const newPresent = isPresent ? attRecord.presentDays + 1 : attRecord.presentDays;
    const newOffice = (isPresent && isOffice) ? attRecord.officeDays + 1 : attRecord.officeDays;
    const newWfh = (isPresent && !isOffice) ? attRecord.wfhDays + 1 : attRecord.wfhDays;

    const newRecord = {
      presentDays: newPresent,
      officeDays: newOffice,
      wfhDays: newWfh,
      hasLoggedToday: true,
      lastLoggedDate: todayStr
    };

    setAttRecord(newRecord);
    localStorage.setItem(`hexaware_att_${candidateKey}`, JSON.stringify(newRecord));
    setAttendanceSubmitted(true);
    setPopupModal({
      open: true,
      title: 'Attendance Logged Successfully',
      message: `Daily Attendance marked as ${attendanceStatus} (${workMode}) successfully!`,
      type: 'success'
    });
  };

  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForSubmit) return;

    setSubmittingDeliverable(true);
    try {
      const res = await fetch(`${API_URL}/tasks/${selectedTaskForSubmit._id}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliverableUrl, submissionNotes })
      });

      if (res.ok) {
        setPopupModal({
          open: true,
          title: 'Deliverable Submitted',
          message: 'Code deliverable submitted to mentor successfully!',
          type: 'success'
        });
        setSelectedTaskForSubmit(null);
        setDeliverableUrl('');
        setSubmissionNotes('');
        fetchCandidateTasks();
      }
    } catch (err) {
      console.error('Error submitting deliverable:', err);
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'results' && token) {
      fetchCandidateAttempt();
    }
  }, [activeTab, token]);

  const fetchCandidateAttempt = async () => {
    setLoadingAttempt(true);
    try {
      const res = await fetch(`${API_URL}/test/attempts/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const attempt = await res.json();
        setCandidateAttempt(attempt);
      }
    } catch (err) {
      console.error('Error fetching candidate attempt:', err);
    } finally {
      setLoadingAttempt(false);
    }
  };

  const taskDonutData = [
    { name: 'Completed', value: 12, color: '#10b981' },
    { name: 'In Progress', value: 4, color: '#38bdf8' },
    { name: 'Pending', value: 2, color: '#f59e0b' }
  ];

  const recentTasks = [
    { title: 'Implement User Authentication', desc: 'Backend Development', status: 'Completed', date: 'May 27, 2026', color: '#10b981' },
    { title: 'Build Task Management Module', desc: 'Frontend Development', status: 'In Progress', date: 'May 27, 2026', color: '#38bdf8' },
    { title: 'Write Unit Tests', desc: 'Testing', status: 'Pending', date: 'May 28, 2026', color: '#f59e0b' },
    { title: 'API Documentation', desc: 'Documentation', status: 'In Progress', date: 'May 29, 2026', color: '#38bdf8' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070913', color: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        role="Candidate"
      />

      {/* Main Container */}
      <div style={{ 
        flexGrow: 1, 
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        transition: 'all 300ms ease',
        display: 'flex', flexDirection: 'column', minHeight: '100vh'
      }}>
        {/* Top Navbar */}
        <TopNavigation 
          user={user} 
          onLogout={logout}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main style={{ padding: '28px', flexGrow: 1 }}>
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Candidate Dashboard</h1>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Track your tasks, attendance, and performance</p>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '8px 16px', borderRadius: '14px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} />
                  <span>Internship Period: {user?.internshipDuration || '3 Months'}</span>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Tasks</div>
                    <ClipboardList size={18} style={{ color: '#818cf8' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>{realTasks.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '4px' }}>Assigned to you</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tasks Completed</div>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {realTasks.filter(t => t.status === 'Completed').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Verified deliverables</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Attendance</div>
                    <UserCheck size={18} style={{ color: '#38bdf8' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {attRecord.presentDays > 0 ? '100%' : '0%'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>{attRecord.presentDays} Days logged</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending Tasks</div>
                    <Clock size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {realTasks.filter(t => t.status !== 'Completed').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>In progress</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Overall Progress</div>
                    <TrendingUp size={18} style={{ color: '#a78bfa' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {realTasks.length > 0 ? Math.round((realTasks.filter(t => t.status === 'Completed').length / realTasks.length) * 100) : 0}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${realTasks.length > 0 ? Math.round((realTasks.filter(t => t.status === 'Completed').length / realTasks.length) * 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #a78bfa 100%)' }} />
                  </div>
                </div>
              </div>

              {/* MY ASSIGNED MENTOR CARD (CONNECTS CANDIDATE TO MENTOR) */}
              <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(167, 139, 250, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '1.25rem',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                  }}>
                    {user?.assignedMentorId ? user.assignedMentorId.name.split(' ').map(n => n[0]).join('') : 'MP'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Corporate Mentor</span>
                      <ShieldCheck size={16} style={{ color: '#10b981' }} />
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
                      {user?.assignedMentorId ? user.assignedMentorId.name : 'Martin Priyadharson'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                      {user?.assignedMentorId ? user.assignedMentorId.designation : 'Senior Mentor & Evaluator'} &bull; {user?.assignedMentorId ? user.assignedMentorId.department : 'Technology & AI'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="glow-btn"
                    style={{ padding: '10px 16px', fontSize: '0.875rem' }}
                  >
                    <MessageSquare size={16} />
                    <span>Direct Chat with Mentor</span>
                  </button>

                  <a 
                    href={`mailto:${user?.assignedMentorId ? user.assignedMentorId.email : 'mentor@hexaware.com'}?subject=Hexaware%20Internship%20Inquiry%20from%20${encodeURIComponent(user?.name || 'Candidate')}`}
                    className="secondary-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '12px', textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Mail size={16} />
                    <span>Email Mentor</span>
                  </a>
                </div>
              </div>

              {/* Internship Roadmap & Quick Access Bar */}
              <div className="glass-card" style={{ padding: '28px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>Hexaware Internship Journey Roadmap</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Phase 1 &bull; Complete</div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>Onboarding & Profile</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Academic details verified</div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Phase 2 &bull; Complete</div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>Mentor Allocation</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Assigned to Corporate Evaluator</div>
                  </div>

                  <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase' }}>Phase 3 &bull; In Progress</div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>Daily Sprint Deliverables</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Active task execution</div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Phase 4 &bull; Upcoming</div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>Evaluation & Certification</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Final project review</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveTab('tasks')} className="glow-btn">
                    <ClipboardList size={16} />
                    <span>Go to My Tasks</span>
                  </button>
                  <button onClick={() => setActiveTab('attendance')} className="secondary-btn">
                    <UserCheck size={16} />
                    <span>Log Daily Attendance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <ProfileDetails />
          )}

          {/* MY TASKS TAB */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>My Internship Tasks</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Manage and submit your technical deliverables assigned by your corporate mentor</p>
              </div>

              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Assigned Deliverables ({realTasks.length})</h3>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>
                    {realTasks.filter(t => t.status === 'Completed').length} Completed &bull; {realTasks.filter(t => t.status !== 'Completed').length} Active
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px' }}>Task Module & Title</th>
                        <th style={{ padding: '12px' }}>Assigned Mentor</th>
                        <th style={{ padding: '12px' }}>Due Date</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realTasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                            No tasks assigned yet by your mentor. Check back soon!
                          </td>
                        </tr>
                      ) : (
                        realTasks.map((task, idx) => (
                          <tr key={task._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '14px 12px' }}>
                              <div style={{ fontWeight: '700', color: '#ffffff' }}>{task.title}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{task.description || task.domain}</div>
                            </td>
                            <td style={{ padding: '14px 12px', color: '#818cf8', fontWeight: '600' }}>
                              {task.mentorId?.name || user?.assignedMentorId?.name || 'Martin Priyadharson'}
                            </td>
                            <td style={{ padding: '14px 12px', color: '#94a3b8' }}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{
                                background: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: task.status === 'Completed' ? '#10b981' : '#f59e0b',
                                border: `1px solid ${task.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600'
                              }}>
                                {task.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              {task.status === 'Completed' ? (
                                <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={16} /> Deliverable Submitted
                                </span>
                              ) : (
                                <button 
                                  onClick={() => setSelectedTaskForSubmit(task)} 
                                  className="secondary-btn" 
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#818cf8' }}
                                >
                                  Submit Code Deliverable
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (() => {
            const attStats = getAttendanceSummaryStats();
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Daily Attendance Logger</h1>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                    Log your daily work attendance. Saturdays & Sundays are skipped as official weekly leave days.
                  </p>
                </div>

                {attStats.isTodayWeeklyOff && (
                  <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.5rem' }}>🌴</div>
                    <div>
                      <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '0.95rem', fontWeight: '800' }}>
                        Official Weekly Off ({attStats.todayDayName})
                      </h4>
                      <p style={{ margin: '2px 0 0', color: '#cbd5e1', fontSize: '0.82rem' }}>
                        Saturdays and Sundays are designated as official weekly leave days. Mandatory attendance is paused today.
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Submit Today's Attendance</h3>
                    <form onSubmit={handleAttendanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setAttendanceStatus('Present')}
                          disabled={attStats.isTodayWeeklyOff}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            border: `1px solid ${attendanceStatus === 'Present' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                            background: attendanceStatus === 'Present' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: attendanceStatus === 'Present' ? '#10b981' : '#94a3b8',
                            fontWeight: '600', cursor: attStats.isTodayWeeklyOff ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Check size={16} /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttendanceStatus('Absent')}
                          disabled={attStats.isTodayWeeklyOff}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            border: `1px solid ${attendanceStatus === 'Absent' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            background: attendanceStatus === 'Absent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: attendanceStatus === 'Absent' ? '#ef4444' : '#94a3b8',
                            fontWeight: '600', cursor: attStats.isTodayWeeklyOff ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <X size={16} /> Absent
                        </button>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Work Mode</label>
                        <select className="form-control" value={workMode} onChange={(e) => setWorkMode(e.target.value)} disabled={attStats.isTodayWeeklyOff}>
                          <option value="Office">Office (On-site)</option>
                          <option value="Remote">Remote (WFH)</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <button type="submit" className="glow-btn" disabled={attStats.isTodayWeeklyOff} style={{ justifyContent: 'center', opacity: attStats.isTodayWeeklyOff ? 0.6 : 1 }}>
                        <CheckCircle2 size={16} />
                        <span>
                          {attStats.isTodayWeeklyOff ? 'Weekly Off (No Attendance)' : (attendanceSubmitted ? 'Attendance Confirmed!' : 'Log Attendance')}
                        </span>
                      </button>
                    </form>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Monthly Presence Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Days Present</span>
                        <span style={{ color: '#10b981', fontWeight: '800' }}>{attRecord.presentDays} {attRecord.presentDays === 1 ? 'Day' : 'Days'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Weekly Off / Leave (Sat & Sun)</span>
                        <span style={{ color: '#f59e0b', fontWeight: '800' }}>🌴 {attStats.weekendOffCount} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Working Days (Mon – Fri)</span>
                        <span style={{ color: '#a78bfa', fontWeight: '800' }}>{attStats.workingDaysCount} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>On-site (Office)</span>
                        <span style={{ color: '#818cf8', fontWeight: '800' }}>{attRecord.officeDays} {attRecord.officeDays === 1 ? 'Day' : 'Days'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Remote (WFH)</span>
                        <span style={{ color: '#38bdf8', fontWeight: '800' }}>{attRecord.wfhDays} {attRecord.wfhDays === 1 ? 'Day' : 'Days'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Working Day Attendance Rate</span>
                        <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1.1rem' }}>
                          {attStats.rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DAILY WORK LOG & TIMELINE TAB */}
          {activeTab === 'worklog' && (
            <CandidateWorkLogView />
          )}

          {/* MENTOR CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ height: 'calc(100vh - 68px - 48px)' }}>
              <ChatHub />
            </div>
          )}
        </main>
      </div>

      {/* Code Deliverable Submission Modal */}
      {selectedTaskForSubmit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <form onSubmit={handleDeliverableSubmit} style={{
            width: '100%', maxWidth: '480px', background: '#0a0c1a',
            border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.9)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              Submit Deliverable for "{selectedTaskForSubmit.title}"
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
              Provide your GitHub repository link or live project demo URL for mentor evaluation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                  Repository / Live Demo URL *
                </label>
                <input 
                  type="url" 
                  required 
                  className="form-control"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://github.com/username/hexaware-project-task"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                  Submission Notes / Technical Brief
                </label>
                <textarea 
                  rows={3} 
                  className="form-control"
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Mention architecture decisions, environment variables, or testing notes..."
                  style={{ resize: 'none', padding: '12px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedTaskForSubmit(null)} className="secondary-btn">Cancel</button>
              <button 
                type="submit" 
                disabled={submittingDeliverable || !deliverableUrl.trim()} 
                className="glow-btn"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Send size={16} />
                <span>{submittingDeliverable ? 'Submitting Code...' : 'Submit Deliverable Now'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Dark Glassmorphism Popup Modal Card */}
      {popupModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px', background: '#0a0c1a',
            border: `1px solid ${popupModal.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : popupModal.type === 'warning' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(99, 102, 241, 0.35)'}`,
            borderRadius: '24px', padding: '28px',
            boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 35px ${popupModal.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : popupModal.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
            textAlign: 'center', position: 'relative'
          }}>
            {/* Header Badge & Icon */}
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              background: popupModal.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : popupModal.type === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${popupModal.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : popupModal.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
              color: popupModal.type === 'success' ? '#10b981' : popupModal.type === 'warning' ? '#f59e0b' : '#818cf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto', boxShadow: `0 0 20px ${popupModal.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : popupModal.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
            }}>
              {popupModal.type === 'success' ? <CheckCircle2 size={26} /> : popupModal.type === 'warning' ? <Clock size={26} /> : <AlertCircle size={26} />}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
              {popupModal.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 22px 0', lineHeight: 1.5 }}>
              {popupModal.message}
            </p>

            <button
              onClick={() => setPopupModal({ open: false, title: '', message: '', type: 'info' })}
              className="glow-btn"
              style={{
                width: '100%', padding: '12px', borderRadius: '14px', justifyContent: 'center', fontSize: '0.875rem',
                background: popupModal.type === 'success'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : popupModal.type === 'warning'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              }}
            >
              <span>Okay, Got It</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
