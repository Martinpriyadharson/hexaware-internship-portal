import React, { useState } from 'react';
import { API_URL } from '../config/api';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const AssignAssessmentModal = ({ candidates, onClose, onAssignSuccess }) => {
  const [formData, setFormData] = useState({
    candidateId: candidates && candidates.length ? candidates[0].id : '',
    title: 'Custom Evaluation Test',
    stack: 'Python Full Stack',
    difficulty: 'Medium',
    duration: 30,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const stacksList = [
    'Java Full Stack', 'Python Full Stack', 'MERN Stack', 'MEAN Stack', 
    'React Developer', 'Angular Developer', 'Vue.js Developer', 'Node.js Backend', 
    'Django Backend', 'Spring Boot Microservices', 'Android App Dev', 'iOS App Dev', 
    'Flutter App Dev', 'React Native App Dev', 'Data Structures', 'Aptitude & Logic', 
    'Cyber Security', 'DevOps & Cloud', 'Data Science', 'AI & Machine Learning', 
    'UI/UX Design', 'SQL & Database Design'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/mentor/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to assign assessment');

      setMsg('Assessment assigned successfully!');
      setTimeout(() => {
        if (onAssignSuccess) onAssignSuccess();
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
        width: '100%', maxWidth: '520px', background: '#0f1120',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Assign Assessment</h2>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Candidate Selection */}
          <div className="form-group">
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Target Candidate *</label>
            <select
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              className="form-control"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {candidates && candidates.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0f1120', color: '#fff' }}>
                  {c.name} ({c.college})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Assessment Title *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Stack */}
          <div className="form-group">
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Specialization Stack *</label>
            <select
              value={formData.stack}
              onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
              className="form-control"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              {stacksList.map(st => (
                <option key={st} value={st} style={{ background: '#0f1120', color: '#fff' }}>{st}</option>
              ))}
            </select>
          </div>

          {/* Grid 2: Difficulty & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="form-control"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
              >
                <option value="Easy" style={{ background: '#0f1120' }}>Easy</option>
                <option value="Medium" style={{ background: '#0f1120' }}>Medium</option>
                <option value="Hard" style={{ background: '#0f1120' }}>Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Duration (Mins)</label>
              <input
                type="number"
                className="form-control"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submission Deadline *</label>
            <input
              type="date"
              className="form-control"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <Send size={16} />
            <span>{loading ? 'Assigning...' : 'Generate & Send Assignment'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignAssessmentModal;
