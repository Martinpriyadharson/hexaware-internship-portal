import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config/api';
import { 
  Calendar, Save, FileText, GitBranch, ExternalLink, 
  CheckCircle2, AlertCircle, Info, History, Layers, ClipboardList
} from 'lucide-react';

const BACKEND = BASE_URL;

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const CandidateWorkLogView = () => {
  const { token, user } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [hasAssignedTask, setHasAssignedTask] = useState(false);
  const [summary, setSummary] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLogSaved, setIsLogSaved] = useState(false);

  const [timeline, setTimeline] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'timeline'

  const [internshipStartDate, setInternshipStartDate] = useState('');
  const [internshipEndDate, setInternshipEndDate] = useState('');
  const [rangeNotice, setRangeNotice] = useState('');

  const isWeekendSelected = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  const getWeekendDayName = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 ? 'Sunday' : day === 6 ? 'Saturday' : '';
  };

  // Fetch log & task details whenever date changes
  useEffect(() => {
    if (token && selectedDate) {
      fetchLogForDate(selectedDate);
      fetchTimeline();
    }
  }, [selectedDate, token]);

  const fetchLogForDate = async (dateStr) => {
    try {
      const res = await fetch(`${BACKEND}/api/worklog/date/${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTaskName(data.taskName || '');
        setTaskDescription(data.taskDescription || '');
        setHasAssignedTask(data.hasAssignedTask || false);
        setSummary(data.summary || '');
        setGithubUrl(data.githubUrl || '');
        setDemoUrl(data.demoUrl || '');
        setAttachments(data.attachments || []);
        setIsLogSaved(data.isSaved !== false && Boolean(data.summary && data.summary.trim().length > 0));
        if (data.internshipStartDate) setInternshipStartDate(data.internshipStartDate);
        if (data.internshipEndDate) setInternshipEndDate(data.internshipEndDate);
      }
    } catch (err) {
      console.error('Error fetching log:', err);
    }
  };

  const handleDateChange = (val) => {
    if (!val) return;
    setRangeNotice('');
    if (internshipStartDate && val < internshipStartDate) {
      setSelectedDate(internshipStartDate);
      setRangeNotice(`⚠️ Date restricted to Internship Start Date (${internshipStartDate})`);
      setTimeout(() => setRangeNotice(''), 4000);
      return;
    }
    if (internshipEndDate && val > internshipEndDate) {
      setSelectedDate(internshipEndDate);
      setRangeNotice(`⚠️ Date restricted to Internship End Date (${internshipEndDate})`);
      setTimeout(() => setRangeNotice(''), 4000);
      return;
    }
    setSelectedDate(val);
  };

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/worklog/timeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTimeline(await res.json());
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${BACKEND}/api/worklog/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          taskName,
          taskDescription,
          summary,
          githubUrl,
          demoUrl,
          attachments
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setIsLogSaved(true);
        fetchTimeline();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error saving work log:', err);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>Daily Work Log</h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Track daily task progress linked with your internship timeline. No daily approval required.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            onClick={() => setActiveTab('log')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'log' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Work Log Entry
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'timeline' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Internship Timeline ({timeline.length})
          </button>
        </div>
      </div>

      {activeTab === 'log' ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Internship Date Selector */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                <Calendar size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>Select Internship Date</label>
                  {(internshipStartDate || internshipEndDate) && (
                    <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '600' }}>
                      📅 Duration: {internshipStartDate || 'Start'} – {internshipEndDate || 'End'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={selectedDate}
                      min={internshipStartDate || undefined}
                      max={internshipEndDate || undefined}
                      onChange={(e) => handleDateChange(e.target.value)}
                      onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }}
                      style={{ fontSize: '0.9rem', color: '#fff', colorScheme: 'dark', cursor: 'pointer', width: '100%', padding: '6px 12px' }}
                    />
                  </div>
                </div>

                {rangeNotice && (
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600', marginTop: '6px' }}>
                    {rangeNotice}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isWeekendSelected() ? (
            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.5rem' }}>🌴</div>
              <div>
                <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '0.95rem', fontWeight: '800' }}>
                  Official Weekly Off ({getWeekendDayName()}, {selectedDate})
                </h4>
                <p style={{ margin: '2px 0 0', color: '#cbd5e1', fontSize: '0.82rem' }}>
                  Saturdays and Sundays are designated as official weekly leave days. Daily work log entries are optional on weekends.
                </p>
              </div>
            </div>
          ) : !isLogSaved && (
            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.5rem' }}>✏️</div>
              <div>
                <h4 style={{ margin: 0, color: '#818cf8', fontSize: '0.95rem', fontWeight: '800' }}>
                  Working Day ({selectedDate})
                </h4>
                <p style={{ margin: '2px 0 0', color: '#cbd5e1', fontSize: '0.82rem' }}>
                  No work log submitted for this working day yet. Fill out your task details below and click "Save & Submit Work Log".
                </p>
              </div>
            </div>
          )}

          {/* Today's Assigned Task */}
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ClipboardList size={18} style={{ color: '#818cf8' }} />
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Today's Assigned Task
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Task Title / Activity Name *
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Implement User Authentication Module / Bug fixing..."
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Task Description (Optional)
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Optional details or scope of today's assigned task..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  style={{ fontSize: '0.85rem', color: '#cbd5e1' }}
                />
              </div>
            </div>
          </div>

          {/* Daily Work Summary */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
              Daily Work Summary *
            </label>
            <textarea 
              rows={5} 
              className="form-control"
              placeholder="Describe the work completed today, features built, bug fixes, or key learning milestones..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
            />
          </div>

          {/* Optional Fields: Deliverable Links */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: '700', color: '#e2e8f0' }}>
              Optional Deliverable Links & Attachments
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <GitBranch size={14} /> GitHub Repository URL (Optional)
                </label>
                <input 
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/org/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <ExternalLink size={14} /> Live Demo URL (Optional)
                </label>
                <input 
                  type="url"
                  className="form-control"
                  placeholder="https://demo.app.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              type="submit" 
              className="glow-btn"
              disabled={isSaving}
              style={{ padding: '14px 32px', fontSize: '0.95rem', fontWeight: '800' }}
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving...' : 'Save Work Log'}</span>
            </button>

            {saveSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700', fontSize: '0.875rem' }}>
                <CheckCircle2 size={18} /> Daily work log saved successfully!
              </div>
            )}
          </div>

        </form>
      ) : (
        /* Timeline View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
            Internship Day-by-Day Activity Stream
          </h3>

          {timeline.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No work logs recorded yet. Log your daily progress to build your internship timeline!
            </div>
          ) : (
            timeline.map((item, idx) => (
              <div key={item._id || idx} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '3px 10px', borderRadius: '20px' }}>
                      📅 {item.date}
                    </span>
                    <h4 style={{ margin: '8px 0 0', fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
                      {item.taskName || 'Daily Log'}
                    </h4>
                  </div>
                </div>

                {item.taskDescription && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 10px', fontStyle: 'italic' }}>
                    Task: {item.taskDescription}
                  </p>
                )}

                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {item.summary}
                </p>

                {(item.githubUrl || item.demoUrl) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <GitBranch size={12} /> GitHub
                      </a>
                    )}
                    {item.demoUrl && (
                      <a href={item.demoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> Live Demo
                      </a>
                    )}
                  </div>
                )}

                {item.mentorPrivateNotes && (
                  <div style={{ fontSize: '0.78rem', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '8px 12px', borderRadius: '8px', marginTop: '10px', borderLeft: '3px solid #a78bfa' }}>
                    💬 <strong>Mentor Private Note Attached</strong>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default CandidateWorkLogView;
