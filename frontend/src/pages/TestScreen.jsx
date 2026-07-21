import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';

const TestScreen = ({ stack, onTestFinished }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { token } = useContext(AuthContext);

  // Synchronization refs to avoid stale closures in setInterval and async operations
  const questionsRef = useRef(questions);
  const currentIndexRef = useRef(currentIndex);
  const selectedAnswersRef = useRef(selectedAnswers);
  const submittingRef = useRef(submitting);

  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { selectedAnswersRef.current = selectedAnswers; }, [selectedAnswers]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/test/questions/${stack}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.msg || 'Failed to fetch test questions');
        }

        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [stack, token]);

  // Unified Timer Hook: manages the 60s countdown and auto-advances cleanly using refs
  useEffect(() => {
    if (loading || questions.length === 0) return;

    // Reset countdown to 60s for the current question
    setTimeLeft(60);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired! Trigger next question using the latest refs
          if (!submittingRef.current) {
            handleNextQuestion();
          }
          return 60; // Reset timeLeft state immediately to prevent multiple triggers
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, loading, questions.length]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    // If it's the last question, submit the test
    if (currentIndexRef.current === questionsRef.current.length - 1) {
      submitTest();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const submitTest = async () => {
    if (submittingRef.current) return;
    
    setSubmitting(true);
    setError('');

    // Format answers: array of { questionId, answerIndex } using latest refs
    const formattedAnswers = questionsRef.current.map((q, idx) => ({
      questionId: q._id,
      answerIndex: selectedAnswersRef.current[idx] !== undefined ? selectedAnswersRef.current[idx] : -1 // -1 means unanswered
    }));

    try {
      const res = await fetch('http://localhost:5000/api/test/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stack,
          answers: formattedAnswers
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Error submitting test');
      }

      const data = await res.json();
      onTestFinished(data);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }} className="animate-fade">
        <div className="timer-text" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Retrieving eligibility test suite...
        </div>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }} className="animate-fade">
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Assessment Load Failure</h2>
        <div className="error-alert">
          <span>{error}</span>
        </div>
        <button onClick={() => window.location.reload()} className="glow-btn" style={{ marginTop: '16px' }}>
          Retry Loading Test
        </button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // Circular timer calculations (2 * PI * R) where R = 54
  const radius = 54;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (timeLeft / 60) * strokeDasharray;

  // Dynamic timer classes
  let timerClass = 'timer-progress';
  if (timeLeft <= 10) timerClass += ' danger';
  else if (timeLeft <= 30) timerClass += ' warning';

  return (
    <div className="app-container test-layout animate-fade">
      {/* Question Panel */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%)',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {stack} Assessment
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Question <strong style={{ color: 'var(--text-primary)' }}>{currentIndex + 1}</strong> of {questions.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
            <HelpCircle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.6' }}>
            {currentQuestion.questionText ? currentQuestion.questionText.replace(/^\[[^\]]+\]\s*/, '') : ''}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentIndex] === index;
            const optionLetters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={index}
                className={`question-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(index)}
                disabled={submitting}
              >
                <div className="option-badge">{optionLetters[index]}</div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
            <span>Answers save automatically on timeout.</span>
          </div>

          <button
            onClick={() => handleNextQuestion(false)}
            className="glow-btn"
            disabled={submitting}
            style={{ minWidth: '150px' }}
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish & Submit' : 'Next Question'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Timer / Panel Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Timer Card */}
        <div className="glass-card timer-container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question Timer
          </span>
          <div className="timer-circle">
            <svg>
              <circle className="timer-bg" cx="60" cy="60" r="54" />
              <circle
                className={timerClass}
                cx="60"
                cy="60"
                r="54"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="timer-text" style={{ color: timeLeft <= 10 ? 'var(--danger)' : timeLeft <= 30 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {timeLeft}s
            </div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '16px' }}>
            <Clock size={14} />
            <span>Time remaining for Q#{currentIndex + 1}</span>
          </span>
        </div>

        {/* Candidate / Stats Card */}
        <div className="glass-card" style={{ padding: '24px', fontSize: '0.9rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
            Assessment Summary
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Questions:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{questions.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Answered:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {Object.keys(selectedAnswers).length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unanswered:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {questions.length - Object.keys(selectedAnswers).length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Target to Pass:</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>75% (23/30)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
