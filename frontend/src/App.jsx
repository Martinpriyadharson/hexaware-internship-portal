import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import ProfileDetails from './pages/ProfileDetails';
import StackSelection from './pages/StackSelection';
import TestScreen from './pages/TestScreen';
import ResultScreen from './pages/ResultScreen';
import { ShieldAlert, LogOut } from 'lucide-react';
import HexawareLogo from './components/HexawareLogo';

import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

import { CallProvider } from './context/CallContext';
import CallOverlayModal from './components/CallOverlayModal';

function App() {
  const { user, token, loading, logout } = useContext(AuthContext);
  const [selectedStack, setSelectedStack] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [hasClearedAssessment, setHasClearedAssessment] = useState(false);
  const showVideoBg = !user || (user && !user.isProfileCompleted);

  // Reset state when user changes
  useEffect(() => {
    setSelectedStack(null);
    setTestResult(null);
    setHasClearedAssessment(false);
  }, [user?._id || user?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading Portal...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <CallProvider user={user} token={token}>
      <CallOverlayModal />
      {(() => {
        // 1. Role Router: ADMIN DASHBOARD
        if (user && user.role === 'Admin') {
          return <AdminDashboard user={user} onLogout={logout} />;
        }

        // 2. Role Router: MENTOR DASHBOARD
        if (user && user.role === 'Mentor') {
          return <MentorDashboard user={user} onLogout={logout} />;
        }

        // 3. Candidate Experience & Dashboard
        return (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }} className={!user ? 'auth-page' : ''}>
            {/* Antigravity Floating Particles */}
            {(!user || user.isProfileCompleted) && (
              <div className="antigravity-bg">
                <div className="ambient-glow-1" />
                <div className="ambient-glow-2" />
              {Array.from({ length: 30 }).map((_, i) => {
                const size = Math.random() * 1.2 + 1.2;
                const left = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = Math.random() * 4 + 5;
                const driftX = Math.random() * 60 - 30;
                return (
                  <div
                    key={`bg-${i}`}
                    className="antigravity-particle"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${left}%`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                      filter: 'blur(0.5px)',
                      '--particle-opacity': 0.35,
                      '--drift-x': `${driftX}px`
                    }}
                  />
                );
              })}
              </div>
            )}

            {/* Background Container with Milky Way Galaxy Video */}
            {showVideoBg && (
              <div className="video-bg-container">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="video-bg"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, position: 'absolute', top: 0, left: 0 }}
                >
                  <source src="/milky-way.mp4" type="video/mp4" />
                </video>
                <div className="video-bg-overlay"></div>
              </div>
            )}

            {/* Navigation (Only for Unauthenticated / Assessment Flow) */}
            {(!user || !user.assignedMentorId) && (
              <header className="navbar">
                <div className="nav-content">
                  <div className="logo" style={{ display: 'flex', alignItems: 'center', height: '36px' }}>
                    <HexawareLogo style={{ height: '28px', width: 'auto' }} />
                    <span style={{ marginLeft: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '10px' }}>
                      Internships
                    </span>
                  </div>
                  {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{user.name}</div>
                        <div style={{ color: '#818cf8', fontSize: '0.78rem' }}>{user.email}</div>
                      </div>
                      <button 
                        onClick={logout} 
                        className="secondary-btn" 
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>
            )}

            {/* Main Content Area */}
            <main style={{ width: '100%', flexGrow: 1 }}>
              {(() => {
                if (!user) return <Auth />;

                const hasAttempted = Boolean(user.hasAttemptedAssessment || user.isAssessmentSubmitted || (user.assessmentScore && user.assessmentScore > 0));
                const hasPassed = Boolean(user.hasPassedAssessment || (user.assessmentPercentage && user.assessmentPercentage >= 75) || user.assessmentStatus === 'Mentor Allocated');
                const isApproved = Boolean(user.assignedMentorId || user.assessmentStatus === 'Mentor Allocated');

                // 1. ALLOCATED / ENROLLED CANDIDATE -> ALWAYS CANDIDATE DASHBOARD
                if (isApproved || (hasAttempted && hasPassed && user.assignedMentorId)) {
                  return <CandidateDashboard onSelectStack={(stack) => setSelectedStack(stack)} />;
                }

                // 2. FAILED ATTEMPT -> NOT SHORTLISTED SCREEN
                if (hasAttempted && !hasPassed) {
                  return (
                    <ResultScreen 
                      result={{
                        score: user.assessmentScore || 0,
                        percentage: user.assessmentPercentage || 0,
                        totalQuestions: 30,
                        passed: false
                      }} 
                      stack={user.attemptedStack || user.preferredStack || 'Specialization Track'} 
                      onReset={() => {}} 
                    />
                  );
                }

                // 3. PASSED ATTEMPT & PENDING MENTOR ALLOCATION
                if (hasAttempted && hasPassed && !isApproved) {
                  return (
                    <ResultScreen 
                      result={{
                        score: user.assessmentScore || 0,
                        percentage: user.assessmentPercentage || 0,
                        totalQuestions: 30,
                        passed: true
                      }} 
                      stack={user.attemptedStack || user.preferredStack || 'Specialization Track'} 
                      onReset={() => {}} 
                    />
                  );
                }

                // 4. FRESH CANDIDATE -> PROFILE SETUP NOT COMPLETED
                if (!user.isProfileCompleted) {
                  return <ProfileDetails />;
                }

                if (selectedStack && !testResult) {
                  // ACTIVE TEST SCREEN FOR FRESH CANDIDATE
                  return (
                    <TestScreen 
                      stack={selectedStack} 
                      onTestFinished={(result) => setTestResult(result)} 
                    />
                  );
                }

                if (testResult) {
                  // TEST FINISHED IN ACTIVE SESSION
                  return (
                    <ResultScreen 
                      result={testResult} 
                      stack={selectedStack} 
                      onReset={() => {
                        setSelectedStack(null);
                        setTestResult(null);
                      }} 
                    />
                  );
                }

                // FRESH CANDIDATE -> SELECT 1 TRACK FROM 22
                return <StackSelection onSelectStack={(stack) => setSelectedStack(stack)} />;
              })()}
            </main>

            {/* Footer (Only for Auth / Onboarding / Test Flow) */}
            {(!user || !user.assignedMentorId) && (
              <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', padding: '14px 24px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', background: 'transparent', zIndex: 10 }}>
                <div>&copy; 2026 Hexaware Technologies. All rights reserved.</div>
              </footer>
            )}
          </div>
        );
      })()}
    </CallProvider>
  );
}

export default App;
