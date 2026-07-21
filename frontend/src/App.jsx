import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import ProfileDetails from './pages/ProfileDetails';
import StackSelection from './pages/StackSelection';
import TestScreen from './pages/TestScreen';
import ResultScreen from './pages/ResultScreen';
import { ShieldAlert, LogOut } from 'lucide-react';
import HexawareLogo from './components/HexawareLogo';

function App() {
  const { user, token, loading, logout } = useContext(AuthContext);
  const [selectedStack, setSelectedStack] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const showVideoBg = !user || (user && user.isProfileCompleted && !selectedStack && !testResult);

  useEffect(() => {
    const fetchLatestAttempt = async () => {
      if (!user || !user.isProfileCompleted || !token) return;
      try {
        const res = await fetch('http://localhost:5000/api/test/attempts/latest', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const attempt = await res.json();
          if (attempt) {
            setTestResult(attempt);
            setSelectedStack(attempt.stack);
          }
        }
      } catch (err) {
        console.error('Error fetching latest attempt:', err);
      }
    };

    fetchLatestAttempt();
  }, [user, token]);

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }} className={!user ? 'auth-page' : ''}>
      {/* Antigravity Floating Particles (Layered 3D Depth) */}
      <div className="antigravity-bg">
        {/* Layer 1: Background (Far, Small, Slow, Muted) */}
        {Array.from({ length: 22 }).map((_, i) => {
          const size = Math.random() * 1.2 + 1; // 1px to 2.2px
          const left = Math.random() * 100;
          const delay = Math.random() * 25;
          const duration = Math.random() * 15 + 30; // 30s to 45s (very slow)
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
                '--particle-opacity': 0.25,
                '--drift-x': `${driftX}px`
              }}
            />
          );
        })}

        {/* Layer 2: Midground (Medium, Normal speed) */}
        {Array.from({ length: 14 }).map((_, i) => {
          const size = Math.random() * 1.5 + 2.2; // 2.2px to 3.7px
          const left = Math.random() * 100;
          const delay = Math.random() * 20;
          const duration = Math.random() * 10 + 20; // 20s to 30s
          const driftX = Math.random() * 80 - 40;
          return (
            <div
              key={`mid-${i}`}
              className="antigravity-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                '--particle-opacity': 0.45,
                '--drift-x': `${driftX}px`
              }}
            />
          );
        })}

        {/* Layer 3: Foreground (Near, Large, Fast, Bright) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const size = Math.random() * 1.5 + 3.7; // 3.7px to 5.2px
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = Math.random() * 8 + 12; // 12s to 20s (faster)
          const driftX = Math.random() * 100 - 50;
          return (
            <div
              key={`fg-${i}`}
              className="antigravity-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
                '--particle-opacity': 0.65,
                '--drift-x': `${driftX}px`
              }}
            />
          );
        })}
      </div>

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

      {/* Navigation */}
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
              <div style={{ textAlign: 'right', fontSize: '0.85rem', display: 'none', md: 'block' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>Candidate ID: ...{user.id?.substring(user.id.length - 6)}</div>
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

      {/* Main Content Area */}
      <main className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {!user ? (
          <Auth />
        ) : !user.isProfileCompleted ? (
          <ProfileDetails />
        ) : testResult ? (
          <ResultScreen 
            result={testResult} 
            stack={selectedStack} 
            onReset={() => {
              setSelectedStack(null);
              setTestResult(null);
            }} 
          />
        ) : selectedStack ? (
          <TestScreen 
            stack={selectedStack} 
            onTestFinished={(result) => setTestResult(result)} 
          />
        ) : (
          <StackSelection 
            onSelectStack={(stack) => setSelectedStack(stack)} 
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', padding: '12px 24px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', background: 'transparent', zIndex: 10 }}>
        <div>&copy; 2026 Hexaware Technologies. All rights reserved.</div>
        <div style={{ marginTop: '6px', fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secure Intern Examination Portal &bull; Sprint 1</div>
      </footer>
    </div>
  );
}

export default App;
