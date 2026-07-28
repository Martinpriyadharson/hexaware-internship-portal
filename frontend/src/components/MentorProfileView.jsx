import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Award, Clock, Users, Edit3, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

const MentorProfileView = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    designation: '',
    department: '',
    specialization: '',
    experience: '',
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/mentor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          name: data.name || '',
          designation: data.designation || '',
          department: data.department || '',
          specialization: data.specialization || '',
          experience: data.experience || '',
          skills: data.skills ? data.skills.join(', ') : ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/mentor/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Update failed');

      setMsg('Profile updated successfully!');
      fetchProfile();
      setTimeout(() => {
        setIsEditing(false);
        setMsg('');
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading mentor profile...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Mentor Profile</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Manage senior evaluator details and departmental preferences</p>
        </div>
        <button onClick={() => setIsEditing(true)} className="glow-btn">
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card" style={{ padding: '32px', background: 'rgba(15, 17, 32, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: '800', fontSize: '2rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'MT'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>{profile?.name || 'Martin (Senior Mentor)'}</h2>
              <span style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                Verified Mentor
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#818cf8', fontWeight: '600', marginTop: '4px' }}>{profile?.designation}</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>{profile?.department}</div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={20} style={{ color: '#818cf8' }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Email Address</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{profile?.email}</div>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={20} style={{ color: '#38bdf8' }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Department</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{profile?.department}</div>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={20} style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Experience</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{profile?.experience}</div>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} style={{ color: '#a78bfa' }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Assigned Candidates</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>{profile?.assignedCandidatesCount || 25} Interns</div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Technical Evaluation Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile?.skills && profile.skills.map((skill, idx) => (
              <span key={idx} style={{ background: 'rgba(129, 140, 248, 0.12)', color: '#a78bfa', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Edit Mentor Profile</h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {error && <div className="error-alert" style={{ marginBottom: '16px' }}><AlertCircle size={16} /><span>{error}</span></div>}
            {msg && <div className="success-alert" style={{ marginBottom: '16px' }}><CheckCircle2 size={16} /><span>{msg}</span></div>}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full Name</label>
                <input type="text" className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Designation</label>
                <input type="text" className="form-control" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Department</label>
                <input type="text" className="form-control" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Experience</label>
                <input type="text" className="form-control" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Skills (comma separated)</label>
                <input type="text" className="form-control" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
              </div>

              <button type="submit" className="glow-btn" style={{ width: '100%', marginTop: '8px' }}>
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileView;
