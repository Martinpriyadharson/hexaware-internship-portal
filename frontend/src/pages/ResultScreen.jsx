import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, CheckCircle, XCircle, LogOut, ArrowLeft } from 'lucide-react';

const ResultScreen = ({ result, stack, onReset }) => {
  const { user, logout } = useContext(AuthContext);

  const { score, totalQuestions, percentage, passed } = result;

  // Determine mentor email based on selected stack
  const getMentorEmail = (selectedStack) => {
    switch (selectedStack?.toLowerCase()) {
      case 'java':
        return 'java.mentor@hexaware.com';
      case 'python':
        return 'python.mentor@hexaware.com';
      case 'c++':
        return 'cpp.mentor@hexaware.com';
      default:
        return 'internships@hexaware.com';
    }
  };

  const mentorEmail = getMentorEmail(stack);

  // Generate Email Details
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

  // Generate Mailto Link
  const generateMailto = () => {
    const { subject, body } = getEmailDetails();
    return `mailto:${mentorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Generate Web Gmail Link
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

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'left', marginBottom: '32px', fontSize: '0.9rem' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Next Steps for Onboarding</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Your scores have been validated. You must now email your results directly to the Hexaware incharge for <strong>{stack} Developer</strong> track. Select your preferred method below to compose the email scorecard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href={generateGmailLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-btn"
              style={{ textDecoration: 'none', padding: '14px 28px', background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)', boxShadow: '0 4px 12px rgba(234, 67, 53, 0.25)' }}
            >
              <Mail size={18} />
              <span>Compose in Web Gmail (Chrome)</span>
            </a>

            <a
              href={generateMailto()}
              className="secondary-btn"
              style={{ textDecoration: 'none', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Mail size={16} />
              <span>Compose in Desktop Mail Client</span>
            </a>
            
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

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '32px', fontSize: '0.9rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              The eligibility benchmark for the Hexaware Internship requires a minimum score of <strong>75%</strong> (23 out of 30 correct answers). Unfortunately, you did not meet this criteria.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onReset}
              className="secondary-btn"
              style={{ width: '100%' }}
            >
              <ArrowLeft size={16} />
              <span>View Other Specializations</span>
            </button>

            <button
              onClick={logout}
              className="glow-btn"
              style={{ width: '100%', background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', boxShadow: 'none' }}
            >
              <LogOut size={18} />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
