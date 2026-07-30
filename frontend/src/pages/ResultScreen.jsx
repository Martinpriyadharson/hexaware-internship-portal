import React, { useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, LogOut, ArrowLeft, Send, Clock, ShieldCheck, Lock, RefreshCw, CheckCircle2, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

const ResultScreen = ({ result, stack, onReset }) => {
  const { user, logout, token, loadUser } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(user?.isAssessmentSubmitted || false);
  const [refreshing, setRefreshing] = useState(false);

  const score = result?.score || 0;
  const totalQuestions = result?.totalQuestions || 30;
  const percentage = result?.percentage || Math.round((score / totalQuestions) * 100);
  const passed = result?.passed ?? (percentage >= 75);

  const isApproved = Boolean(user?.assignedMentorId || user?.assessmentStatus === 'Mentor Allocated');

  const checkApprovalStatus = async () => {
    setRefreshing(true);
    try {
      if (loadUser) await loadUser();
    } catch (err) {
      console.error('Error checking approval status:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (submitted || user?.isAssessmentSubmitted) {
      const interval = setInterval(checkApprovalStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [submitted, user?.isAssessmentSubmitted]);

  const handleSubmitToAdmin = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/test/submit-to-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stack: stack || 'Full Stack & Development',
          score,
          totalQuestions,
          percentage
        })
      });

      if (res.ok) {
        setSubmitted(true);
        if (loadUser) await loadUser();
      }
    } catch (err) {
      console.error('Error submitting assessment to admin:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Set recipient email address to admin@hexaware.com
  const getMentorEmail = (selectedStack) => {
    return 'admin@hexaware.com';
  };

  const mentorEmail = getMentorEmail(stack);

  const getEmailDetails = () => {
    const subject = `Hexaware Internship Request - ${user?.name || ''} - ${stack} Track`;
    const body = `Dear Hexaware Internship Incharge,

I am writing to submit my eligibility test scorecard for the Hexaware Internship Program. Please find my detailed candidate profile and assessment results below:

=== PERSONAL PROFILE ===
Full Name      : ${user?.name || ''}
Email Address  : ${user?.email || ''}
Mobile Number  : ${user?.mobile || ''}
Date of Birth  : ${user?.dob || ''}
Gender         : ${user?.gender || ''}

=== ACADEMIC DETAILS ===
College Name   : ${user?.college || ''}
Degree         : ${user?.degree || ''}
Specialization : ${user?.branch || ''}
Current Year   : ${user?.currentYear || ''}
Graduation Year: ${user?.graduationYear || ''}
Current CGPA   : ${user?.cgpa || ''}

=== LOCATION ===
City/Town      : ${user?.city || ''}
State/Province : ${user?.state || ''}
Country        : ${user?.country || ''}

=== ELIGIBILITY ASSESSMENT ===
Internship Track: ${stack} Developer
Test Score       : ${score} / ${totalQuestions}
Exam Percentage  : ${percentage}%
Evaluation       : PASSED (Minimum Benchmark: 75%)

I look forward to discussing the onboarding process.

Best regards,
${user?.name || ''}`;

    return { subject, body };
  };

  // Generate a shortened template for Web Gmail (prevents ERR_CONNECTION_RESET from URL length limit)
  const getEmailDetailsShort = () => {
    const subject = `Hexaware Internship Request - ${user?.name || ''} - ${stack} Track`;
    const body = `Dear Hexaware Internship Incharge,

I have successfully passed the eligibility test for the Hexaware Internship Program (${stack} Developer track) with a score of ${score}/${totalQuestions} (${percentage}%).

Best regards,
${user?.name || ''}`;

    return { subject, body };
  };

  // Generate Mailto Link
  const generateMailto = () => {
    const { subject, body } = getEmailDetails();
    return `mailto:${mentorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Generate Web Gmail Link (uses official view=cm & su parameter for full draft pre-fill)
  const generateGmailLink = () => {
    const { subject, body } = getEmailDetails();
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${mentorEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }} className="animate-fade">
      {passed ? (
        // SUCCESS CARD
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderTopColor: 'var(--success)', borderWidth: '2px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px', color: '#f3f4f6' }}>Congratulations!</h1>
          <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '32px' }}>
            You are allowed to Hexaware Internship!
          </p>

          <div className="result-gauge" style={{ '--percentage': `${percentage}%` }}>
            <div className="result-percentage">{percentage}%</div>
            <div className="result-label">{score} / {totalQuestions} Correct</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem' }}>
            <h4 style={{ marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              <span>Next Steps for Mentor Allocation</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Your scores have been validated for the <strong>{stack || 'Full Stack & Development'}</strong> track. Submit your assessment report to Hexaware Administration to receive your assigned corporate mentor.
            </p>
          </div>

          {submitted || user?.isAssessmentSubmitted ? (
            <div style={{
              background: isApproved 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)' 
                : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
              boxShadow: isApproved ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none',
              padding: '28px 24px', borderRadius: '20px', marginBottom: '20px', textAlign: 'center',
              animation: isApproved ? 'pulseGlow 2s infinite alternate' : 'none'
            }}>
              <div style={{
                color: isApproved ? '#10b981' : '#f59e0b',
                fontWeight: '800', fontSize: '1.25rem', marginBottom: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}>
                {isApproved ? <Sparkles size={24} style={{ color: '#10b981' }} /> : <Clock size={20} className="animate-pulse" />}
                <span>{isApproved ? '🎉 Dashboard Unlocked & Mentor Allocated!' : 'Report Submitted to Admin!'}</span>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
                {isApproved ? (
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Official Admin Authorization
                    </div>
                    <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.95rem' }}>
                      Assigned Mentor: {user?.assignedMentorId?.name || 'Corporate Evaluator'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                      {user?.assignedMentorId?.designation || 'Senior Corporate Mentor'} &bull; {user?.assignedMentorId?.department || 'Technology & AI'}
                    </div>
                  </div>
                ) : (
                  <span>Status: <strong style={{ color: '#f59e0b' }}>Pending Corporate Mentor Allocation</strong> &bull; Auto-checking approval status...</span>
                )}
              </div>

              {isApproved ? (
                <button 
                  onClick={onReset} 
                  className="glow-btn animate-bounce"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)', fontSize: '0.95rem' }}
                >
                  <CheckCircle2 size={20} />
                  <span>Enter Candidate Dashboard Now</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    disabled
                    style={{
                      width: '100%', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: '600', fontSize: '0.875rem',
                      cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Lock size={16} />
                    <span>Awaiting Admin Mentor Approval & Allocation...</span>
                  </button>

                  <button
                    onClick={checkApprovalStatus}
                    className="secondary-btn"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px' }}
                  >
                    <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    <span>{refreshing ? 'Checking Status...' : 'Check Approval Status Now'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleSubmitToAdmin}
                disabled={submitting}
                className="glow-btn"
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  justify: 'center'
                }}
              >
                <Send size={18} />
                <span>{submitting ? 'Submitting to Admin...' : 'Submit Assessment Report to Admin'}</span>
              </button>
              
              <button
                onClick={onReset}
                className="secondary-btn"
                style={{ marginTop: '4px' }}
              >
                <ArrowLeft size={16} />
                <span>View Other Specializations</span>
              </button>
              
              <button
                onClick={logout}
                className="secondary-btn"
                style={{ marginTop: '4px' }}
              >
                <LogOut size={16} />
                <span>Log Out & Exit</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // FAIL / NOT SELECTED CARD
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderTopColor: 'var(--danger)', borderWidth: '2px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: '24px' }}>
            <XCircle size={40} />
          </div>

          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px', color: '#f3f4f6' }}>Test Complete</h1>
          <p style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '32px' }}>
            You are not selected for the internship
          </p>

          <div className="result-gauge fail" style={{ '--percentage': `${percentage}%` }}>
            <div className="result-percentage">{percentage}%</div>
            <div className="result-label">{score} / {totalQuestions} Correct</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '32px', fontSize: '0.9rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              The eligibility benchmark for the Hexaware Internship requires a minimum score of <strong>75%</strong> (23 out of 30 correct answers). Candidates receive <strong>1 single eligibility assessment attempt</strong> across all 22 tracks. Since your score was <strong>{percentage}%</strong>, you are not shortlisted for this internship cycle.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={logout}
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={18} />
              <span>Sign Out & Exit Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
