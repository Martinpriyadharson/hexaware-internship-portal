import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config/api';
import { 
  Calendar, User, FileText, CheckCircle2, 
  GitBranch, ExternalLink, Save, Lock, Info, ClipboardList
} from 'lucide-react';

const BACKEND = BASE_URL;

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MentorWorkLogView = () => {
  const { token } = useContext(AuthContext);

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  
  const [currentLog, setCurrentLog] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [mentorNotes, setMentorNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  const [viewMode, setViewMode] = useState('day'); // 'day' or 'timeline'

  const [internshipStartDate, setInternshipStartDate] = useState('');
  const [internshipEndDate, setInternshipEndDate] = useState('');
  const [rangeNotice, setRangeNotice] = useState('');

  // Fetch candidates list on mount
  useEffect(() => {
    if (token) {
      fetchCandidates();
    }
  }, [token]);

  // Fetch work log when candidate or date changes
  useEffect(() => {
    if (token && selectedCandidateId) {
      fetchLogForDate(selectedCandidateId, selectedDate);
      fetchTimeline(selectedCandidateId);
    }
  }, [selectedCandidateId, selectedDate, token]);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/mentor/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.candidates || []);
        setCandidates(list);
        if (list.length > 0) {
          const first = list[0];
          setSelectedCandidateId(first._id || first.id);
          if (first.internshipStartDate) setInternshipStartDate(new Date(first.internshipStartDate).toISOString().split('T')[0]);
          if (first.internshipEndDate) setInternshipEndDate(new Date(first.internshipEndDate).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const fetchLogForDate = async (candId, dateStr) => {
    setIsLoading(true);
    setCurrentLog(null);
    try {
      const res = await fetch(`${BACKEND}/api/worklog/candidate/${candId}/date/${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentLog(data);
        setMentorNotes(data.mentorPrivateNotes || '');
        if (data.internshipStartDate) setInternshipStartDate(data.internshipStartDate);
        if (data.internshipEndDate) setInternshipEndDate(data.internshipEndDate);
      } else {
        setCurrentLog(null);
        setMentorNotes('');
      }
    } catch (err) {
      console.error('Error fetching log:', err);
    }
    setIsLoading(false);
  };

  const handleDateChange = (val) => {
    if (!val) return;
    setRangeNotice('');
    setViewMode('day');
    let target = val;
    if (internshipStartDate && val < internshipStartDate) {
      target = internshipStartDate;
      setRangeNotice(`⚠️ Date restricted to Internship Start Date (${internshipStartDate})`);
      setTimeout(() => setRangeNotice(''), 4000);
    } else if (internshipEndDate && val > internshipEndDate) {
      target = internshipEndDate;
      setRangeNotice(`⚠️ Date restricted to Internship End Date (${internshipEndDate})`);
      setTimeout(() => setRangeNotice(''), 4000);
    }
    setSelectedDate(target);
    if (selectedCandidateId) {
      fetchLogForDate(selectedCandidateId, target);
    }
  };

  const fetchTimeline = async (candId) => {
    try {
      const res = await fetch(`${BACKEND}/api/worklog/candidate/${candId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTimeline(await res.json());
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId) return;
    setIsSavingNotes(true);
    setNotesSavedSuccess(false);

    try {
      const res = await fetch(`${BACKEND}/api/worklog/candidate/${selectedCandidateId}/date/${selectedDate}/notes`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mentorPrivateNotes: mentorNotes })
      });

      if (res.ok) {
        setNotesSavedSuccess(true);
        fetchTimeline(selectedCandidateId);
        setTimeout(() => setNotesSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error saving mentor notes:', err);
    }
    setIsSavingNotes(false);
  };

  const selectedCandidate = candidates.find(c => (c._id || c.id) === selectedCandidateId);

  const selectedDateObj = new Date(selectedDate);
  const selectedDayOfWeek = selectedDateObj.getDay();
  const isWeekendSelected = selectedDayOfWeek === 0 || selectedDayOfWeek === 6;
  const weekendDayName = selectedDayOfWeek === 0 ? 'Sunday' : selectedDayOfWeek === 6 ? 'Saturday' : '';

  const hasValidSummary = currentLog && 
    currentLog.isSaved !== false && 
    currentLog.summary && 
    currentLog.summary.trim().length > 0 && 
    !currentLog.summary.toLowerCase().includes('no daily work summary') && 
    !currentLog.summary.toLowerCase().includes('no work log recorded');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>Candidate Work Logs & Internship Timeline</h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Daily Work Logs are for monitoring candidate progress. Final task approval occurs on the Task Board.
          </p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            onClick={() => setViewMode('day')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: viewMode === 'day' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            Single Day View
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: viewMode === 'timeline' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            Full Timeline ({timeline.length})
          </button>
        </div>
      </div>

      {/* Candidate & Date Selector */}
      <div className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <User size={15} style={{ color: '#6366f1' }} /> Select Candidate
          </label>
          <select 
            className="form-control"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            style={{ fontSize: '0.9rem', color: '#fff' }}
          >
            {candidates.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name} ({c.preferredStack || c.department || 'Candidate'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} style={{ color: '#6366f1' }} /> Internship Date Picker
            </label>
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
                style={{ fontSize: '0.9rem', color: '#fff', colorScheme: 'dark', cursor: 'pointer', width: '100%' }}
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

      {viewMode === 'day' ? (
        isLoading ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading candidate work log...
          </div>
        ) : !hasValidSummary ? (
          isWeekendSelected ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '18px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌴</div>
              <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Official Weekly Off ({weekendDayName}, {selectedDate})
              </h4>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '18px' }}>
              <h4 style={{ color: '#f87171', margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                No Work Log Recorded for {selectedDate}
              </h4>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Read-Only Daily Log Details Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
                📅 Logged for {currentLog.date}
              </div>

              {/* Synchronized Assigned Task Details */}
              <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Assigned Task
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  {currentLog.taskName || 'No specific task assigned for this date'}
                </h3>
                {currentLog.taskDescription && (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {currentLog.taskDescription}
                  </p>
                )}
              </div>

              {/* Daily Work Summary */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8' }}>
                  Daily Work Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {currentLog.summary}
                </p>
              </div>

              {/* Optional Links */}
              {(currentLog.githubUrl || currentLog.demoUrl) && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {currentLog.githubUrl && (
                    <a href={currentLog.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#c7d2fe', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                      <GitBranch size={14} /> GitHub Repository
                    </a>
                  )}
                  {currentLog.demoUrl && (
                    <a href={currentLog.demoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>
        )
      ) : (
        /* Full Timeline View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
            Internship Timeline for {selectedCandidate ? selectedCandidate.name : 'Candidate'}
          </h3>

          {timeline.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No work logs recorded yet for this candidate.
            </div>
          ) : (
            timeline.map((item, idx) => (
              <div key={item._id || idx} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '3px 10px', borderRadius: '20px' }}>
                      📅 {item.date}
                    </span>
                    <h4 style={{ margin: '6px 0 0', fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                      {item.taskName || 'Daily Log'}
                    </h4>
                  </div>
                </div>

                {item.taskDescription && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 8px', fontStyle: 'italic' }}>
                    Task: {item.taskDescription}
                  </p>
                )}

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 10px' }}>
                  {item.summary}
                </p>

                {/* Optional Links (GitHub & Live Demo) */}
                {(item.githubUrl || item.demoUrl) && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#c7d2fe', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                        <GitBranch size={14} /> GitHub Repository
                      </a>
                    )}
                    {item.demoUrl && (
                      <a href={item.demoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                        <ExternalLink size={14} /> Live Demo
                      </a>
                    )}
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

export default MentorWorkLogView;
