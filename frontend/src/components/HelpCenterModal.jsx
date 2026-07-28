import React, { useState } from 'react';
import HexawareLogo from './HexawareLogo';
import { X, HelpCircle, BookOpen, Mail, ShieldCheck, ChevronDown, ChevronUp, MessageSquare, ExternalLink } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I submit code deliverables to my assigned mentor?',
    a: 'Go to your "My Tasks" section or click on assigned tasks from the dashboard. Paste your GitHub repository link or live demo URL in the deliverable submission modal and click Submit.'
  },
  {
    q: 'How do I communicate directly with my Corporate Mentor?',
    a: 'Click on the "Mentor Chat" tab in your left navigation sidebar or click "Direct Chat with Mentor" from your Dashboard to send direct messages, attach files/images, and receive real-time guidance.'
  },
  {
    q: 'How is daily attendance recorded?',
    a: 'Go to the "Attendance" tab on your sidebar. Select your presence status (Present / WFH) and enter daily work remarks before submitting.'
  },
  {
    q: 'Can I change my specialization track after starting?',
    a: 'Track changes require corporate mentor and administrator approval. Please contact your assigned mentor via Direct Chat for guidance.'
  }
];

const HelpCenterModal = ({ isOpen, onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '560px', maxHeight: '85vh', background: '#0a0c1a',
        border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '24px', padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(99, 102, 241, 0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <HexawareLogo style={{ height: '20px', width: 'auto' }} />
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internship Portal</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Help & Support Center</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Official Portal User Guide & FAQs</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px' }}>
          {/* Support Banner */}
          <div style={{
            padding: '16px 20px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(167, 139, 250, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
                <span>Hexaware Corporate Support</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                Need technical assistance or mentor re-allocation?
              </div>
            </div>
            <a
              href="mailto:support@hexaware.com?subject=Hexaware%20Internship%20Portal%20Support"
              className="glow-btn"
              style={{ padding: '8px 14px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Mail size={14} />
              <span>Contact</span>
            </a>
          </div>

          {/* FAQs Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} style={{ color: '#818cf8' }} />
              <span>Frequently Asked Questions</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      style={{
                        padding: '14px 16px', cursor: 'pointer', display: 'flex',
                        justify: 'space-between', alignItems: 'center', gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isOpen ? '#818cf8' : '#f8fafc' }}>
                        {faq.q}
                      </span>
                      {isOpen ? <ChevronUp size={16} style={{ color: '#818cf8' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}
                    </div>
                    {isOpen && (
                      <div style={{ padding: '0 16px 14px 16px', fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.55, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '10px 24px', fontSize: '0.85rem', width: '100%' }}
          >
            Close Help Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;
