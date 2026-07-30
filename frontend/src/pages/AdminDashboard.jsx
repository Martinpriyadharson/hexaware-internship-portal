import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';
import NotificationDrawer from '../components/NotificationDrawer';
import CandidateDetailsModal from '../components/CandidateDetailsModal';
import ChatHub from './ChatHub';
import { 
  Users, ClipboardList, UserCheck, Clock, CheckCircle2, 
  TrendingUp, Search, Plus, Eye, Award, Building, FileText, ChevronRight, ShieldCheck, Mail, LogOut, Copy, Download, AlertCircle, User, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { openResumeInNewTab, downloadResumeFile, getResumeFileName } from '../utils/resumeHelper';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [provisionedMentorCredentials, setProvisionedMentorCredentials] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [viewingProfileCandidate, setViewingProfileCandidate] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [popupModal, setPopupModal] = useState({ open: false, title: '', message: '', type: 'info' });
  const [overviewData, setOverviewData] = useState({
    summary: {
      totalCandidates: 512,
      assessmentsConducted: 28,
      activeMentors: 15,
      pendingEvaluations: 32,
      passPercentage: '68.4%'
    },
    candidatesTrend: [
      { date: 'Apr 29', count: 38 },
      { date: 'May 6', count: 72 },
      { date: 'May 13', count: 54 },
      { date: 'May 20', count: 98 },
      { date: 'May 27', count: 142 }
    ],
    recentAssessments: [
      { title: 'Python Full Stack Test', candidates: 78, date: '30 May 2026', status: 'Completed' },
      { title: 'Java Full Stack Test', candidates: 64, date: '29 May 2026', status: 'Completed' },
      { title: 'React Developer Test', candidates: 55, date: '28 May 2026', status: 'Completed' },
      { title: 'Data Structures Test', candidates: 48, date: '27 May 2026', status: 'Completed' },
      { title: 'Aptitude & Logic Test', candidates: 63, date: '26 May 2026', status: 'Completed' }
    ],
    candidates: [],
    mentors: []
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [showCreateMentorModal, setShowCreateMentorModal] = useState(false);

  const [newMentorData, setNewMentorData] = useState({
    name: '', email: '', password: 'password123', designation: 'Senior Mentor & Evaluator', department: 'Technology & AI'
  });

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOverviewData(prev => ({
          ...prev,
          summary: data.summary || prev.summary,
          candidatesTrend: data.candidatesTrend || prev.candidatesTrend,
          recentAssessments: data.recentAssessments && data.recentAssessments.length ? data.recentAssessments.map(r => ({
            title: r.assessmentName || 'Specialization Test',
            candidates: 1,
            date: new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: r.status || 'Completed'
          })) : prev.recentAssessments,
          candidates: data.candidates || [],
          mentors: data.mentors || []
        }));
      }
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateMentor = async () => {
    if (!selectedCandidate || !selectedMentorId) return;
    const token = localStorage.getItem('token');

    let candId = selectedCandidate._id || selectedCandidate.id;
    if (!candId) {
      const match = overviewData.candidates.find(c => c.email?.toLowerCase() === selectedCandidate.email?.toLowerCase());
      if (match) candId = match._id || match.id;
    }

    if (!candId) {
      setPopupModal({
        open: true,
        title: 'Candidate Not Found',
        message: 'Unable to locate candidate ID in database. Please select from the Candidates list.',
        type: 'warning'
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/allocate-mentor`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: candId,
          mentorId: selectedMentorId
        })
      });

      if (res.ok) {
        setShowAllocateModal(false);
        setPopupModal({
          open: true,
          title: 'Mentor Allocated Successfully',
          message: 'Official corporate mentor allocated to candidate successfully!',
          type: 'success'
        });
        fetchAdminOverview();
      } else {
        const errData = await res.json().catch(() => ({}));
        setPopupModal({
          open: true,
          title: 'Allocation Error',
          message: errData.msg || 'Failed to allocate mentor to candidate.',
          type: 'warning'
        });
      }
    } catch (err) {
      console.error('Error allocating mentor:', err);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/create-mentor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMentorData)
      });

      if (res.ok) {
        setProvisionedMentorCredentials({
          name: newMentorData.name,
          email: newMentorData.email,
          password: newMentorData.password
        });
        setShowCreateMentorModal(false);
        setNewMentorData({ name: '', email: '', password: 'password123', designation: 'Senior Mentor & Evaluator', department: 'Technology & AI' });
        fetchAdminOverview();
      }
    } catch (err) {
      console.error('Error creating mentor:', err);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/candidates/${candidateToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setOverviewData(prev => ({
          ...prev,
          candidates: prev.candidates.filter(c => c._id !== candidateToDelete._id)
        }));
        setPopupModal({
          open: true,
          title: 'Candidate Cancelled & Deleted',
          message: `Candidate ${candidateToDelete.name} (${candidateToDelete.email}) has been permanently deleted from the portal database.`,
          type: 'success'
        });
        setCandidateToDelete(null);
      } else {
        const data = await res.json();
        setPopupModal({
          open: true,
          title: 'Deletion Failed',
          message: data.msg || 'Error deleting candidate account.',
          type: 'warning'
        });
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setPopupModal({
        open: true,
        title: 'Deletion Error',
        message: 'Network error deleting candidate account.',
        type: 'warning'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070913', color: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        role="Admin"
      />

      {/* Main Content Area */}
      <div style={{ 
        flexGrow: 1, 
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        width: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        maxWidth: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        boxSizing: 'border-box',
        transition: 'all 300ms ease',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        overflowX: 'hidden'
      }}>
        {/* Top Navbar */}
        <TopNavigation 
          user={user || { name: 'Hexaware Admin', role: 'Admin' }} 
          onLogout={onLogout}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectCandidateForAllocation={(notif) => {
            const cand = overviewData.candidates.find(c => c.email === notif.candidateEmail) || {
              name: notif.candidateName,
              email: notif.candidateEmail,
              preferredStack: notif.stack,
              assessmentPercentage: notif.percentage,
              assessmentScore: Math.round((notif.percentage / 100) * 30)
            };
            setSelectedCandidate(cand);
            setShowAllocateModal(true);
          }}
        />

        <main style={{ padding: '28px', flexGrow: 1 }}>
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Admin Dashboard</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Overview of the internship portal</p>
              </div>

              {/* KPI Summary Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Candidates</div>
                    <Users size={18} style={{ color: '#818cf8' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {overviewData.candidates.length || overviewData.summary.totalCandidates}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Registered in portal</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Corporate Mentors</div>
                    <UserCheck size={18} style={{ color: '#34d399' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {overviewData.mentors.length || overviewData.summary.activeMentors}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Evaluators active</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending Mentor Allocation</div>
                    <Clock size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {overviewData.candidates.filter(c => !c.assignedMentorId && c.isProfileCompleted && (c.hasPassedAssessment || c.assessmentStatus === 'Pending Mentor Allocation' || (c.assessmentPercentage !== undefined && c.assessmentPercentage >= 75))).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>Awaiting mentor assignment</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Allocated Candidates</div>
                    <ShieldCheck size={18} style={{ color: '#38bdf8' }} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                    {overviewData.candidates.filter(c => c.assignedMentorId).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Assigned to mentors</div>
                </div>
              </div>

              {/* Pending Allocation Roster Card */}
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Pending Allocation Roster</h3>
                    <button onClick={() => setActiveTab('mentors')} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Allocate Mentors <ChevronRight size={14} />
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    {overviewData.candidates.filter(c => !c.assignedMentorId && c.isProfileCompleted && (c.hasPassedAssessment || c.assessmentStatus === 'Pending Mentor Allocation' || (c.assessmentPercentage !== undefined && c.assessmentPercentage >= 75))).length === 0 ? (
                      <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                        All eligible candidates have been allocated to mentors! 🎉
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                            <th style={{ padding: '8px' }}>Candidate Name</th>
                            <th style={{ padding: '8px' }}>Track</th>
                            <th style={{ padding: '8px' }}>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewData.candidates.filter(c => !c.assignedMentorId && c.isProfileCompleted && (c.hasPassedAssessment || c.assessmentStatus === 'Pending Mentor Allocation' || (c.assessmentPercentage !== undefined && c.assessmentPercentage >= 75))).slice(0, 5).map((cand, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '10px 8px', color: '#f8fafc', fontWeight: '600' }}>{cand.name}</td>
                              <td style={{ padding: '10px 8px', color: '#a78bfa' }}>{cand.preferredStack || 'Python Full Stack'}</td>
                              <td style={{ padding: '10px 8px', color: '#10b981', fontWeight: '700' }}>
                                {cand.assessmentPercentage !== undefined ? `${cand.assessmentPercentage}%` : 'Pending Test'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* MENTORS TAB */}
          {activeTab === 'mentors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Mentor Allocation & Provisioning</h1>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Allocate corporate mentors to candidates and provision evaluator accounts</p>
                </div>
                <button 
                  onClick={() => setShowCreateMentorModal(true)}
                  className="glow-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff',
                    fontWeight: '700', cursor: 'pointer', border: 'none'
                  }}
                >
                  <Plus size={18} /> Create Official Mentor
                </button>
              </div>

              {/* Mentors Table */}
              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Candidate Mentor Allocation List</h3>
                <div className="responsive-table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>Candidate Name</th>
                        <th style={{ padding: '12px' }}>Email & College</th>
                        <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>Track</th>
                        <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>Assigned Mentor</th>
                        <th style={{ padding: '12px', whiteSpace: 'nowrap', minWidth: '170px' }}>Prerequisite Status</th>
                        <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData.candidates.filter(c => {
                        const hasFailed = (c.hasAttemptedAssessment || c.assessmentPercentage > 0) && !c.hasPassedAssessment && c.assessmentPercentage !== undefined && c.assessmentPercentage < 75;
                        return !hasFailed;
                      }).map((cand, idx) => {
                        const hasFailedTest = (cand.hasAttemptedAssessment || cand.assessmentPercentage > 0) && !cand.hasPassedAssessment && cand.assessmentPercentage !== undefined && cand.assessmentPercentage < 75;
                        const isTestDone = (cand.isAssessmentSubmitted || cand.hasPassedAssessment || (cand.assessmentPercentage !== undefined && cand.assessmentPercentage >= 75)) && !hasFailedTest;
                        const isEligible = cand.isProfileCompleted && isTestDone;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap' }}>{cand.name}</td>
                            <td style={{ padding: '14px 12px', maxWidth: '220px' }}>
                              <div style={{ color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cand.email}>{cand.email}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={cand.college || ''}>
                                {cand.college || (cand.isProfileCompleted ? 'College Provided' : 'Pending Profile Details')}
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                              <span style={{ background: 'rgba(129, 140, 248, 0.12)', color: '#a78bfa', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                {cand.preferredStack || 'Python Full Stack'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                              {cand.assignedMentorId ? (
                                <div style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <ShieldCheck size={16} />
                                  <span>{cand.assignedMentorId.name}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600' }}>Unallocated</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                              {!cand.isProfileCompleted ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)', 
                                  color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', 
                                  padding: '5px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
                                }}>
                                  <Clock size={13} style={{ color: '#fbbf24' }} /> Profile Incomplete
                                </span>
                              ) : hasFailedTest ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)', 
                                  color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', 
                                  padding: '5px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                                }}>
                                  <AlertCircle size={13} style={{ color: '#f87171' }} /> Test Failed ({cand.assessmentPercentage}%)
                                </span>
                              ) : !isTestDone ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.08) 100%)', 
                                  color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', 
                                  padding: '5px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 8px rgba(56, 189, 248, 0.15)'
                                }}>
                                  <Clock size={13} style={{ color: '#38bdf8' }} /> Test Pending
                                </span>
                              ) : (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)', 
                                  color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', 
                                  padding: '5px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                                }}>
                                  <CheckCircle2 size={13} style={{ color: '#34d399' }} /> Ready for Allocation
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                              {isEligible ? (
                                <button 
                                  onClick={() => { setSelectedCandidate(cand); setShowAllocateModal(true); }}
                                  className="glow-btn" 
                                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', whiteSpace: 'nowrap' }}
                                >
                                  Allocate Mentor
                                </button>
                              ) : hasFailedTest ? (
                                <button 
                                  disabled
                                  style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', whiteSpace: 'nowrap' }}
                                  title="Candidate did not achieve 75% passing threshold on test"
                                >
                                  Test Failed ({cand.assessmentPercentage}%)
                                </button>
                              ) : (
                                <button 
                                  disabled
                                  style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', whiteSpace: 'nowrap' }}
                                  title="Candidate must complete collegiate profile and test before allocation"
                                >
                                  Prerequisites Pending
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CANDIDATES TAB */}
          {activeTab === 'candidates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Candidates Directory</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>View and manage registered intern candidates across specializations</p>
              </div>

              <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px' }}>
                <div className="responsive-table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Candidate Name</th>
                        <th style={{ padding: '10px 8px' }}>Email & College</th>
                        <th style={{ padding: '10px 8px' }}>Degree & Branch</th>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Preferred Track</th>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Onboarding Status</th>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Assigned Mentor</th>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Resume / Document</th>
                        <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData.candidates.map((cand, idx) => {
                        const hasFailed = (cand.hasAttemptedAssessment || cand.assessmentPercentage > 0) && !cand.hasPassedAssessment && cand.assessmentPercentage !== undefined && cand.assessmentPercentage < 75;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap' }}>{cand.name}</td>
                            <td style={{ padding: '10px 8px', maxWidth: '180px' }}>
                              <div style={{ color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cand.email}>{cand.email}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={cand.college || ''}>
                                {cand.college || (cand.isProfileCompleted ? 'College Provided' : 'Pending Profile Setup')}
                              </div>
                            </td>
                            <td style={{ padding: '10px 8px', maxWidth: '120px' }}>
                              <div style={{ color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cand.degree || (cand.isProfileCompleted ? 'B.Tech / B.E' : 'Not Set')}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cand.branch || 'Engineering'}</div>
                            </td>
                            <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                              <span style={{ background: 'rgba(129, 140, 248, 0.12)', color: '#a78bfa', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '3px 9px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                {cand.preferredStack || 'Python Full Stack'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {cand.isProfileCompleted ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)', 
                                    color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', 
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700', 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)', whiteSpace: 'nowrap'
                                  }}>
                                    <CheckCircle2 size={11} style={{ color: '#34d399' }} /> Profile Completed
                                  </span>
                                ) : (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)', 
                                    color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', 
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700', 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)', whiteSpace: 'nowrap'
                                  }}>
                                    <Clock size={11} style={{ color: '#fbbf24' }} /> Profile Incomplete
                                  </span>
                                )}
                                
                                {cand.isAssessmentSubmitted || cand.hasPassedAssessment || (cand.assessmentPercentage !== undefined && cand.assessmentPercentage >= 75) ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)', 
                                    color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.35)', 
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700', 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)', whiteSpace: 'nowrap'
                                  }}>
                                    <Award size={11} style={{ color: '#a5b4fc' }} /> Test Passed ({cand.assessmentPercentage || 100}%)
                                  </span>
                                ) : hasFailed ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)', 
                                    color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', 
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700', 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)', whiteSpace: 'nowrap'
                                  }}>
                                    <AlertCircle size={11} style={{ color: '#f87171' }} /> Test Failed ({cand.assessmentPercentage}%)
                                  </span>
                                ) : (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.08) 100%)', 
                                    color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', 
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700', 
                                    display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                                    boxShadow: '0 2px 8px rgba(56, 189, 248, 0.15)', whiteSpace: 'nowrap'
                                  }}>
                                    <Clock size={11} style={{ color: '#38bdf8' }} /> Test Pending
                                  </span>
                                )}
                              </div>
                            </td>
                          <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                            {cand.assignedMentorId ? (
                              <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem' }}>{cand.assignedMentorId.name}</span>
                            ) : (
                              <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>Unallocated</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                            {cand.resumeUrl ? (
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <button 
                                  onClick={() => openResumeInNewTab(cand.resumeUrl, cand.resumeName || getResumeFileName(cand))}
                                  title="View Resume in New Tab"
                                  style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 7px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: '600' }}
                                >
                                  <Eye size={12} /> View
                                </button>
                                <button 
                                  onClick={() => downloadResumeFile(cand.resumeUrl, `${cand.name || 'Candidate'}_Resume.pdf`)}
                                  title="Download Resume PDF"
                                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 7px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: '600' }}
                                >
                                  <Download size={12} /> Download
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No Document</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                            <button 
                              onClick={() => setCandidateToDelete(cand)}
                              title="Cancel & Delete candidate account"
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', 
                                border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 9px', 
                                borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', 
                                alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600'
                              }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>System Settings & Controls</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Manage security controls, pass thresholds, and notification settings</p>
              </div>

              <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>Minimum Benchmark Pass Score</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Set minimum passing percentage for specialization assessments</div>
                  </div>
                  <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>75%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>Automatic Mentor Email Notifications</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Notify mentors when a candidate completes a test</div>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat Hub Tab */}
          {activeTab === 'chat' && (
            <div style={{ height: 'calc(100vh - 68px - 48px)' }}>
              <ChatHub />
            </div>
          )}
        </main>
      </div>

      {/* Allocate Mentor & Report Review Modal */}
      {showAllocateModal && selectedCandidate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '520px', background: '#0a0c1a',
            border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '22px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(99, 102, 241, 0.15)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Candidate Assessment Report
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Submitted Report for Admin Validation & Mentor Allocation
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '20px',
                fontWeight: '700', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px',
                flexShrink: 0
              }}>
                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                <span>Report Verified</span>
              </span>
            </div>

            {/* Candidate & Test Summary Box */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.05rem' }}>{selectedCandidate.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '2px' }}>{selectedCandidate.email}</div>
                </div>

                {selectedCandidate.resumeUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={13} style={{ color: '#10b981' }} />
                      <span>{selectedCandidate.resumeName || getResumeFileName(selectedCandidate)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button 
                        type="button"
                        onClick={() => openResumeInNewTab(selectedCandidate.resumeUrl, selectedCandidate.resumeName || getResumeFileName(selectedCandidate))}
                        className="secondary-btn"
                        style={{
                          fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 10px', borderRadius: '8px',
                          cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Eye size={12} /> View
                      </button>

                      <button 
                        type="button"
                        onClick={() => downloadResumeFile(selectedCandidate.resumeUrl, `${selectedCandidate.name || 'Candidate'}_Resume.pdf`)}
                        className="glow-btn"
                        style={{
                          fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff',
                          padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <div>College: <strong style={{ color: '#ffffff' }}>{selectedCandidate.college || 'Tagore Engineering College'}</strong></div>
                <div>Degree: <strong style={{ color: '#ffffff' }}>{selectedCandidate.degree || 'B.Tech'} ({selectedCandidate.branch || 'CSE'})</strong></div>
                <div>CGPA: <strong style={{ color: '#ffffff' }}>{selectedCandidate.cgpa || '8.50'}</strong></div>
                <div>Track: <strong style={{ color: '#a78bfa' }}>{selectedCandidate.preferredStack || selectedCandidate.attemptedStack || 'MERN Stack'}</strong></div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Validated Test Scorecard</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>
                  {selectedCandidate.assessmentScore || 29} / 30 ({selectedCandidate.assessmentPercentage || 97}%)
                </span>
              </div>
            </div>

            {/* Mentor Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                Select Corporate Mentor to Allocate *
              </label>
              <select
                className="form-control"
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                <option value="">Choose a Mentor from Directory</option>
                {overviewData.mentors.map((m, i) => (
                  <option key={i} value={m._id || m.id}>{m.name} — {m.designation || 'Senior Mentor'} ({m.department || 'Technology'})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAllocateModal(false)} className="secondary-btn">Cancel</button>
              <button 
                onClick={handleAllocateMentor} 
                disabled={!selectedMentorId}
                className="glow-btn"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  opacity: selectedMentorId ? 1 : 0.5,
                  cursor: selectedMentorId ? 'pointer' : 'not-allowed'
                }}
              >
                <ShieldCheck size={16} />
                <span>Approve Report & Allocate Mentor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Mentor Modal */}
      {showCreateMentorModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <form onSubmit={handleCreateMentor} style={{
            width: '100%', maxWidth: '480px', background: '#0f1120',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
              Create Official Mentor Account
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '20px' }}>
              Admin provisions the email and initial access password for the corporate mentor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Mentor Full Name *</label>
                <input type="text" required className="form-control" value={newMentorData.name} onChange={(e) => setNewMentorData({ ...newMentorData, name: e.target.value })} placeholder="e.g. Martin Priyadharson" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Hexaware Email *</label>
                <input type="email" required className="form-control" value={newMentorData.email} onChange={(e) => setNewMentorData({ ...newMentorData, email: e.target.value })} placeholder="e.g. martin@hexaware.com" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Initial Access Password *</label>
                <input type="text" required className="form-control" value={newMentorData.password} onChange={(e) => setNewMentorData({ ...newMentorData, password: e.target.value })} placeholder="e.g. password123" />
                <span style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '2px', display: 'block' }}>Share this temporary password with the mentor for their first sign-in.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Designation</label>
                  <input type="text" className="form-control" value={newMentorData.designation} onChange={(e) => setNewMentorData({ ...newMentorData, designation: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Department</label>
                  <input type="text" className="form-control" value={newMentorData.department} onChange={(e) => setNewMentorData({ ...newMentorData, department: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreateMentorModal(false)} className="secondary-btn">Cancel</button>
              <button type="submit" className="glow-btn">Provision Mentor</button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM PROVISIONED MENTOR CREDENTIALS MODAL CARD */}
      {provisionedMentorCredentials && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '460px', background: '#0a0c1a',
            border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '22px', padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 35px rgba(16, 185, 129, 0.2)',
            textAlign: 'center', position: 'relative'
          }}>
            {/* Animated Icon Badge */}
            <div style={{
              width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
              Official Mentor Account Provisioned!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
              Corporate evaluator account created successfully.
            </p>

            {/* Credentials Card Box */}
            <div style={{
              background: 'rgba(15, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px', padding: '20px', textAlign: 'left', display: 'flex',
              flexDirection: 'column', gap: '12px', marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Mentor Name</span>
                <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '700', marginTop: '2px' }}>{provisionedMentorCredentials.name}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Hexaware Email</span>
                <div style={{ fontSize: '0.95rem', color: '#818cf8', fontWeight: '700', marginTop: '2px' }}>{provisionedMentorCredentials.email}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Initial Access Password</span>
                <div style={{ fontSize: '1.05rem', color: '#f59e0b', fontWeight: '800', fontFamily: 'monospace', marginTop: '2px' }}>
                  {provisionedMentorCredentials.password}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '24px' }}>
              Share these credentials with the mentor to allow immediate login.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Mentor: ${provisionedMentorCredentials.name}\nEmail: ${provisionedMentorCredentials.email}\nPassword: ${provisionedMentorCredentials.password}`);
                  setCopiedCredentials(true);
                  setTimeout(() => setCopiedCredentials(false), 2000);
                }}
                className="secondary-btn"
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Copy size={16} />
                <span>{copiedCredentials ? 'Copied!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setProvisionedMentorCredentials(null)}
                className="glow-btn"
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                Done
              </button>
            </div>
          </div>
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

      {/* Candidate Details Modal for Admin */}
      {viewingProfileCandidate && (
        <CandidateDetailsModal 
          candidate={viewingProfileCandidate} 
          onClose={() => setViewingProfileCandidate(null)} 
        />
      )}

      {/* Delete Candidate Confirmation Modal */}
      {candidateToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '460px', background: '#0a0c1a',
            border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '22px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 35px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ef4444', flexShrink: 0
              }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Cancel Candidate Account
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Permanent Admin Action
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '0.95rem' }}>{candidateToDelete.name}</div>
              <div style={{ color: '#818cf8', fontSize: '0.8rem', marginTop: '2px' }}>{candidateToDelete.email}</div>
              <p style={{ color: '#cbd5e1', fontSize: '0.825rem', marginTop: '12px', marginBottom: 0, lineHeight: '1.5' }}>
                Are you sure you want to cancel and delete this candidate account from the portal database? This will permanently remove their profile, test records, and allocation history.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCandidateToDelete(null)}
                disabled={isDeleting}
                className="secondary-btn"
                style={{ padding: '10px 18px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteCandidate}
                disabled={isDeleting}
                className="glow-btn"
                style={{
                  padding: '10px 20px', fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', color: '#ffffff', cursor: 'pointer', border: 'none'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
