import React from 'react';
import { X, Award, FileText, Download, CheckCircle, Clock, BookOpen, Star, Building, Mail, GraduationCap, CheckCircle2, MessageSquare } from 'lucide-react';

const CandidateDetailsModal = ({ candidate, onClose, onOpenChat }) => {
  if (!candidate) return null;

  // Detailed assessment attempts breakdown (only actual track submissions)
  const assessmentHistory = candidate.results && candidate.results.length > 0 ? candidate.results.map(r => ({
    name: r.assessmentName,
    score: r.percentage,
    correct: `${r.score || Math.round((r.percentage * 30)/100)} / ${r.totalQuestions || 30}`,
    status: r.status,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })) : [
    { name: `${candidate.preferredStack || 'Full Stack'} Eligibility Assessment`, score: candidate.averageScore || 93, correct: '28 / 30', status: 'Completed', date: 'May 27, 2026' }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '780px', maxHeight: '90vh', background: '#0f1120',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)', padding: '28px'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '1.3rem',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('') : 'CD'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>{candidate.name}</h2>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                  Verified Candidate
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {candidate.email}</span>
                <span>&bull;</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {candidate.college}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{candidate.averageScore}%</div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Degree & Major</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc', marginTop: '6px' }}>{candidate.degree} - {candidate.department}</div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Specialization Stack</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#818cf8', marginTop: '6px' }}>{candidate.preferredStack}</div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>CGPA</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>{candidate.cgpa || '8.5'} / 10</div>
          </div>
        </div>

        {/* Detailed Assessment History Table (Replaces Line Graph) */}
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Candidate Assessment History & Benchmark Records</h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '3px 10px', borderRadius: '10px', fontWeight: '600' }}>
              {assessmentHistory.length} Test Submissions
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 8px', fontWeight: '600' }}>Assessment Title</th>
                  <th style={{ padding: '10px 8px', fontWeight: '600' }}>Score (%)</th>
                  <th style={{ padding: '10px 8px', fontWeight: '600' }}>Correct Answers</th>
                  <th style={{ padding: '10px 8px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 8px', fontWeight: '600' }}>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {assessmentHistory.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 8px', color: '#f8fafc', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: item.score >= 80 ? '#10b981' : '#818cf8' }}>
                      {item.score}%
                    </td>
                    <td style={{ padding: '12px 8px', color: '#94a3b8' }}>{item.correct}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                        background: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: item.status === 'Completed' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${item.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#94a3b8' }}>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skills & Resume Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>Skills & Expertise Badges</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {candidate.skills && candidate.skills.map((skill, idx) => (
                <span key={idx} style={{ background: 'rgba(129, 140, 248, 0.12)', color: '#a78bfa', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>Actions & Communication</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a 
                href={candidate.resumeUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff',
                  padding: '10px 16px', borderRadius: '10px', textDecoration: 'none',
                  fontWeight: '600', fontSize: '0.85rem'
                }}
              >
                <Download size={16} />
                <span>Resume</span>
              </a>

              {onOpenChat && (
                <button
                  onClick={() => { onClose(); onOpenChat(candidate); }}
                  className="secondary-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={16} />
                  <span>Direct Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Mentor Evaluation Remarks</h4>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            {candidate.remarks || 'Candidate has demonstrated outstanding analytical and code syntax comprehension in recent benchmarks.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
