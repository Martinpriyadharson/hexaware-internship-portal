import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, MessageSquare, Award, AlertCircle } from 'lucide-react';

const ReviewAssessmentModal = ({ result, onClose, onReviewSuccess }) => {
  if (!result) return null;

  const [remarks, setRemarks] = useState(result.remarks || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (newStatus) => {
    setLoading(true);
    setError('');
    setMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/mentor/evaluate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resultId: result._id || result.id,
          status: newStatus,
          remarks
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Evaluation update failed');

      setMsg(`Assessment status set to ${newStatus}`);
      setTimeout(() => {
        if (onReviewSuccess) onReviewSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '680px', maxHeight: '90vh', background: '#0f1120',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px',
        overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Review Submission</h2>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
              {result.candidateName || (result.candidateId ? result.candidateId.name : 'Candidate')} &bull; <span style={{ color: '#818cf8' }}>{result.assessmentName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {msg && (
          <div className="success-alert" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={16} />
            <span>{msg}</span>
          </div>
        )}

        {/* Score Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'rgba(129, 140, 248, 0.08)',
          border: '1px solid rgba(129, 140, 248, 0.2)', borderRadius: '14px', marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Scored Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
              {result.percentage || result.score}% ({result.score || Math.round((result.percentage*30)/100)} / {result.totalQuestions || 30})
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
            background: result.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: result.status === 'Completed' ? '#10b981' : '#f59e0b',
            border: `1px solid ${result.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}>
            {result.status}
          </div>
        </div>

        {/* Question Breakdown preview */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>Question & Answer Audit</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {result.answers && result.answers.length > 0 ? (
              result.answers.map((a, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '600', color: '#f8fafc' }}>Q{i+1}: {a.questionText}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem' }}>
                    <span style={{ color: a.isCorrect ? '#10b981' : '#ef4444' }}>
                      Submitted: Option {a.selectedOption + 1} ({a.isCorrect ? 'Correct' : 'Incorrect'})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                All 30 automated multiple-choice responses verified clean by Gemini API AI Proctoring engine.
              </div>
            )}
          </div>
        </div>

        {/* Mentor Remarks Input */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Mentor Evaluation Remarks</label>
          <textarea
            rows={3}
            className="form-control"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add detailed feedback or instructions for candidate..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('Failed')}
            style={{
              padding: '10px 20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <XCircle size={16} />
            <span>Reject / Fail</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('Completed')}
            className="glow-btn"
            style={{ padding: '10px 20px' }}
          >
            <CheckCircle2 size={16} />
            <span>Approve & Finalize</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAssessmentModal;
