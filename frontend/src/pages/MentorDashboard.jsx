import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';
import CandidateDetailsModal from '../components/CandidateDetailsModal';
import AssignAssessmentModal from '../components/AssignAssessmentModal';
import MentorProfileView from '../components/MentorProfileView';
import ChatDrawer from '../components/ChatDrawer';
import ChatHub from './ChatHub';
import MentorWorkLogView from '../components/MentorWorkLogView';
import AssignTaskModal from '../components/AssignTaskModal';
import PresenceStatusBadge from '../components/PresenceStatusBadge';
import { 
  Users, ClipboardList, TrendingUp, Clock, Trophy, 
  Search, ArrowUpDown, ChevronLeft, ChevronRight, Send, 
  FileText, Download, CheckCircle2, AlertCircle, Plus, Eye, MessageSquare, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const MentorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeChatRecipient, setActiveChatRecipient] = useState(null);
  const [showChatHub, setShowChatHub] = useState(false);
  const [chatHubCandidateId, setChatHubCandidateId] = useState(null);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [mentorTasks, setMentorTasks] = useState([]);

  // Dashboard Data State
  const [summaryCards, setSummaryCards] = useState({
    totalCandidates: 25,
    assessmentsAssigned: 13,
    averageScore: 67.9,
    pendingEvaluations: 5,
    topPerformer: { name: 'Anish V', percentage: 95 }
  });

  const [donutData, setDonutData] = useState([
    { name: 'Excellent (80-100%)', count: 8, percentage: '37.5%', color: '#a78bfa' },
    { name: 'Good (60-79%)', count: 9, percentage: '33.3%', color: '#818cf8' },
    { name: 'Average (40-59%)', count: 5, percentage: '20.8%', color: '#38bdf8' },
    { name: 'Needs Improvement (<40%)', count: 2, percentage: '8.3%', color: '#fbbf24' }
  ]);

  const [totalEvaluated, setTotalEvaluated] = useState(24);
  const [recentActivity, setRecentActivity] = useState([]);
  const [candidatesList, setCandidatesList] = useState([]);
  const [resultsList, setResultsList] = useState([]);

  // Modals & Overlays
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResultForReview, setSelectedResultForReview] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchCandidatesData();
    fetchResultsData();
    fetchMentorTasks();
  }, []);

  const fetchMentorTasks = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/tasks/mentor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMentorTasks(data);
      }
    } catch (err) {
      console.error('Error fetching mentor tasks:', err);
    }
  };

  const fetchDashboardData = async (start, end) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      let url = `${API_URL}/mentor/dashboard`;
      if (start && end) url += `?start=${start}&end=${end}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summaryCards) setSummaryCards(data.summaryCards);
        if (data.performanceAnalytics) {
          setDonutData(data.performanceAnalytics.distribution);
          setTotalEvaluated(data.performanceAnalytics.totalEvaluatedCandidates);
        }
        if (data.recentActivity) setRecentActivity(data.recentActivity);
      }
    } catch (err) {
      console.error('Error fetching mentor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatesData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCandidatesList(data.candidates || []);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const fetchResultsData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResultsList(data || []);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDeleteResult = (resultId) => {
    setDeleteConfirmId(resultId);
  };

  const executeDeleteResult = async () => {
    if (!deleteConfirmId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/results/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResultsList(prev => prev.filter(r => (r._id || r.id) !== deleteConfirmId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error deleting result:', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleGenerateReport = async (reportType, fileType) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportType, fileType })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}.${fileType === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Report download error:', err);
    }
  };

  // Status Badge Colors Mapping
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Pending':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Failed':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      case 'Rejected':
        return { bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' };
      case 'Excellent':
        return { bg: 'rgba(234, 179, 8, 0.12)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05060b', color: '#f8fafc' }}>
      {/* Collapsible Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={onLogout}
        role="Mentor"
      />

      {/* Main Container */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        width: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        maxWidth: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        boxSizing: 'border-box',
        transition: 'all 300ms ease',
        overflowX: 'hidden'
      }}>
        {/* Top Navigation */}
        <TopNavigation 
          user={user} 
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          onDateRangeChange={(start, end) => fetchDashboardData(start, end)}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {/* Main Dashboard View */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Mentor Dashboard</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Track and evaluate candidate performance</p>
              </div>

              {/* Clean Mentor Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: '500' }}>My Candidates</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>{summaryCards.totalCandidates}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '2px' }}>Total assigned interns</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: '500' }}>Tasks Assigned</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>{mentorTasks.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>Total intern deliverables</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: '500' }}>Completed Deliverables</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>
                      {mentorTasks.filter(t => t.status === 'Completed').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>Submitted & verified</div>
                  </div>
                </div>
              </div>

              {/* Quick Assigned Candidates Roster */}
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Assigned Candidates Overview</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>Quick roster of interns assigned for direct mentoring</p>
                  </div>
                  <button onClick={() => setActiveTab('candidates')} className="secondary-btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    View Full Directory
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Candidate Intern</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>College & Degree</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Intern Role / Track</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Internship Tenure</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesList.slice(0, 5).map((cand, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.8rem' }}>
                              {cand.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#f8fafc' }}>{cand.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{cand.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{cand.college || 'Hexaware Academy'}</td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#a78bfa', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-flex' }}>
                              {cand.preferredStack || 'Full Stack'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>
                            {cand.internshipDuration || '3 Months'}
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <button 
                              onClick={() => setActiveChatRecipient(cand)} 
                              className="secondary-btn" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              <MessageSquare size={14} />
                              <span>Direct Chat</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div onClick={() => setShowAssignTaskModal(true)} className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}><Plus size={22} /></div>
                    <div><div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.925rem' }}>Assign Task Deliverable</div><div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Assign code repo & project task</div></div>
                  </div>

                  <div onClick={() => setActiveTab('candidates')} className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}><Users size={22} /></div>
                    <div><div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.925rem' }}>My Candidates Roster</div><div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>View all assigned interns</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <MentorProfileView user={user} />
          )}

          {/* My Candidates Directory Tab */}
          {activeTab === 'candidates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>My Candidates Directory</h1>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Manage enrolled interns and evaluate profiles</p>
                </div>
                <button onClick={() => setShowAssignModal(true)} className="glow-btn"><Plus size={16} /><span>Assign New Assessment</span></button>
              </div>

              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Candidate</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>College & Degree</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Preferred Stack</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Internship Duration</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesList.map((cand, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700' }}>
                              {cand.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#f8fafc' }}>{cand.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{cand.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ color: '#f8fafc', fontWeight: '500' }}>{cand.college}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{cand.degree} ({cand.department})</div>
                          </td>
                          <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              background: 'rgba(129, 140, 248, 0.12)', color: '#a78bfa', 
                              border: '1px solid rgba(129, 140, 248, 0.25)', padding: '5px 12px', 
                              borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
                              whiteSpace: 'nowrap', display: 'inline-block'
                            }}>
                              {cand.preferredStack || 'Full Stack'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 10px',
                              borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
                              whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                              <Clock size={12} /> {cand.internshipDuration || '3 Months'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setSelectedCandidate(cand)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#818cf8', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                                <Eye size={14} /><span>Profile</span>
                              </button>
                              <button onClick={() => setActiveChatRecipient(cand)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a78bfa', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                                <MessageSquare size={14} /><span>Direct Chat</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Specialization Task & Deliverable Board</h1>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Assign real-world technical tasks and code deliverables directly to your candidates</p>
                </div>
                <button onClick={() => setShowAssignTaskModal(true)} className="glow-btn">
                  <Plus size={16} /><span>Assign Task to Candidate</span>
                </button>
              </div>

              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Candidate Intern</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Task Title & Domain</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Due Date</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', fontWeight: '600' }}>Deliverable Code Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorTasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                            No tasks assigned yet. Click "Assign Task to Candidate" above to create a task!
                          </td>
                        </tr>
                      ) : (
                        mentorTasks.map((t, idx) => (
                          <tr key={t._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff' }}>
                              {t.candidateId?.name || 'Assigned Candidate'}
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '400' }}>{t.candidateId?.email}</div>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <div style={{ fontWeight: '600', color: '#f8fafc' }}>{t.title}</div>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '6px' }}>
                                {t.domain}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px', color: '#94a3b8' }}>
                              {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
                                background: t.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: t.status === 'Completed' ? '#10b981' : '#f59e0b',
                                border: `1px solid ${t.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              {t.deliverableUrl ? (
                                <a 
                                  href={t.deliverableUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#10b981', padding: '6px 12px', borderRadius: '8px',
                                    textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700'
                                  }}
                                >
                                  <FileText size={14} />
                                  <span>View Code Submission</span>
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Awaiting Candidate Code</span>
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
          {/* Work Logs & Timeline Tab */}
          {activeTab === 'timeline' && (
            <MentorWorkLogView />
          )}

          {/* Chat Hub Tab */}
          {activeTab === 'chat' && (
            <div style={{ height: 'calc(100vh - 68px - 48px)' }}>
              <ChatHub />
            </div>
          )}

        </main>
      </div>

      {/* Floating Mentor Chat Hub Launcher Button (Only on My Candidates tab) */}
      {activeTab === 'candidates' && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 100 }}>
          <button 
            onClick={() => setShowChatHub(true)}
            className="glow-btn"
            style={{
              padding: '12px 20px', borderRadius: '30px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={18} />
            <span style={{ fontWeight: '700' }}>Mentor Chat Hub</span>
          </button>
        </div>
      )}

      {/* Render ChatDrawer for Direct Candidate Chat */}
      {activeChatRecipient && (
        <ChatDrawer 
          recipient={activeChatRecipient} 
          onClose={() => setActiveChatRecipient(null)} 
        />
      )}

      {/* Candidate Details Profile Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
          onOpenChat={(cand) => setActiveChatRecipient(cand)}
        />
      )}

      {/* Render ChatHub Modal when launcher button clicked */}
      {showChatHub && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '1200px', height: '90vh',
            background: '#0a0c1a', borderRadius: '24px', overflow: 'hidden',
            position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <button 
              onClick={() => { setShowChatHub(false); setChatHubCandidateId(null); }}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10000,
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            <ChatHub />
          </div>
        </div>
      )}

      {/* Render AssignTaskModal */}
      {showAssignTaskModal && (
        <AssignTaskModal 
          candidates={candidatesList}
          onClose={() => setShowAssignTaskModal(false)}
          onTaskAssigned={fetchMentorTasks}
        />
      )}
    </div>
  );
};

export default MentorDashboard;
