import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { X, Send, ClipboardList, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

const AssignTaskModal = ({ candidates = [], onClose, onTaskAssigned }) => {
  const { token } = useContext(AuthContext);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Full Stack Development');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId || !title.trim()) {
      setError('Please select a candidate and enter a Task Title');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/tasks/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: selectedCandidateId,
          title: title.trim(),
          domain,
          dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: description.trim()
        })
      });

      if (res.ok) {
        if (onTaskAssigned) onTaskAssigned();
        onClose();
      } else {
        const data = await res.json();
        setError(data.msg || 'Failed to assign task');
      }
    } catch (err) {
      console.error('Error assigning task:', err);
      setError('Server connection error assigning task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '520px', background: '#0a0c1a',
        border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '22px', padding: '28px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(99, 102, 241, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                Assign Task to Candidate
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Create real-world code deliverable for assigned intern
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.825rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
              Select Candidate *
            </label>
            <select
              className="form-control"
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
            >
              <option value="">Choose Assigned Candidate</option>
              {candidates.map((c, i) => (
                <option key={i} value={c._id || c.id}>{c.name} — ({c.preferredStack || c.college || 'Intern Candidate'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
              Task Title *
            </label>
            <input 
              type="text" 
              required 
              className="form-control"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Build Full-Stack MERN E-Commerce REST API & Frontend" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                Category / Domain
              </label>
              <select 
                className="form-control"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Database Engineering">Database Engineering</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="QA & Testing">QA & Testing</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                Due Date
              </label>
              <input 
                type="date" 
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
              Task Instructions & Code Requirements
            </label>
            <textarea 
              rows={3} 
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed instructions, API endpoints, or repository requirements..."
              style={{ resize: 'none', padding: '12px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="glow-btn"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? 'Assigning Task...' : 'Assign Task Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskModal;
