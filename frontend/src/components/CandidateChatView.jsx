import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Send, Clock, Paperclip, Trash2, Edit2, Smile, 
  FileText, Download, Check, Ban, ShieldCheck, Mail, MessageSquare, Image, File, User
} from 'lucide-react';

const CandidateChatView = () => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteModalMsgId, setDeleteModalMsgId] = useState(null);
  const [activeHoverMsgId, setActiveHoverMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const docFileRef = useRef(null);
  const imageFileRef = useRef(null);

  const mentor = user?.assignedMentorId || {
    _id: '665123456789012345678901',
    name: 'Martin Priyadharson',
    designation: 'Senior Mentor & Evaluator',
    department: 'Technology & AI',
    email: 'mentor@hexaware.com'
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const recipientId = mentor._id || mentor.id;
      const res = await fetch(`http://localhost:5000/api/messages/${recipientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleFileSelected = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentUrl(event.target.result);
      setAttachmentName(file.name);
      setAttachmentType(type);
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() && !attachmentUrl.trim()) return;

    const recipientId = mentor._id || mentor.id;
    const textToSend = newMsg.trim();
    const urlToSend = attachmentUrl.trim();
    const nameToSend = attachmentName.trim() || 'Attached File';
    const typeToSend = attachmentType || 'document';

    setNewMsg('');
    setAttachmentUrl('');
    setAttachmentName('');
    setAttachmentType('');
    setShowAttachMenu(false);

    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId,
          text: textToSend,
          attachmentUrl: urlToSend,
          attachmentName: nameToSend,
          attachmentType: typeToSend
        })
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages(prev => [...prev, savedMsg]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleEditSubmit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: editingText.trim() })
      });

      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m._id === msgId ? updatedMsg : m));
        setEditingMsgId(null);
        setEditingText('');
      }
    } catch (err) {
      console.error('Error editing message:', err);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!deleteModalMsgId) return;
    const msgId = deleteModalMsgId;
    setDeleteModalMsgId(null);

    try {
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const deletedMsg = await res.json();
        setMessages(prev => prev.map(m => m._id === msgId ? deletedMsg : m));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleReactMessage = async (msgId, emoji) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m._id === msgId ? updatedMsg : m));
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)',
      background: 'rgba(10, 12, 26, 0.75)', border: '1px solid rgba(99, 102, 241, 0.25)',
      borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      position: 'relative'
    }}>
      {/* Hidden Native File Explorer Inputs */}
      <input 
        type="file" 
        ref={docFileRef} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx,.xls,.xlsx,.csv" 
        onChange={(e) => handleFileSelected(e, 'document')}
      />
      <input 
        type="file" 
        ref={imageFileRef} 
        style={{ display: 'none' }} 
        accept="image/*,video/*" 
        onChange={(e) => handleFileSelected(e, 'image')}
      />

      {/* Top Header Card */}
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 17, 32, 0.95) 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              color: '#ffffff', fontWeight: '800', fontSize: '1.15rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '11px', height: '11px', borderRadius: '50%', background: '#10b981', border: '2px solid #0a0c1a' }} />
          </div>

          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{mentor.name}</span>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '2px', fontWeight: '600' }}>
              {mentor.designation || 'Senior Corporate Mentor'} &bull; {mentor.department || 'Technology & AI'}
            </div>
          </div>
        </div>

        <a
          href={`mailto:${mentor.email}?subject=Hexaware%20Internship%20Inquiry`}
          className="secondary-btn"
          style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Mail size={14} />
          <span>Email Mentor</span>
        </a>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#050714' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '380px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#818cf8' }}>
              <MessageSquare size={28} />
            </div>
            <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.05rem', marginBottom: '6px' }}>Direct Corporate Mentoring</div>
            <div style={{ fontSize: '0.825rem', opacity: 0.85, lineHeight: 1.5 }}>
              Send direct messages, submit deliverables, or ask questions to your assigned mentor {mentor.name}!
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const currentUserId = String(user?._id || user?.id || '');
            const msgSenderId = String(msg.senderId?._id || msg.senderId || '');
            const isMe = Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);
            const isHovered = activeHoverMsgId === msg._id;
            const isEditingThis = editingMsgId === msg._id;

            return (
              <div
                key={msg._id || idx}
                onMouseEnter={() => setActiveHoverMsgId(msg._id)}
                onMouseLeave={() => setActiveHoverMsgId(null)}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '70%', position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Hover Quick Actions Bar */}
                {isHovered && !msg.isDeleted && (
                  <div style={{
                    position: 'absolute', top: '-28px', [isMe ? 'right' : 'left']: '0',
                    background: '#1e1b4b', border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10
                  }}>
                    {['👍', '❤️', '🔥', '😂'].map(emoji => (
                      <span key={emoji} onClick={() => handleReactMessage(msg._id, emoji)} style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '2px' }}>
                        {emoji}
                      </span>
                    ))}
                    {isMe && (
                      <>
                        <button onClick={() => { setEditingMsgId(msg._id); setEditingText(msg.text); }} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: '2px' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteModalMsgId(msg._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Inline Edit Form */}
                {isEditingThis ? (
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      style={{ flex: 1, padding: '8px 14px', borderRadius: '10px', background: '#1e1b4b', border: '1px solid #6366f1', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <button onClick={() => handleEditSubmit(msg._id)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingMsgId(null)} style={{ background: '#64748b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 18px', borderRadius: '20px',
                    borderBottomRightRadius: isMe ? '4px' : '20px',
                    borderBottomLeftRadius: isMe ? '20px' : '4px',
                    background: msg.isDeleted
                      ? 'rgba(255, 255, 255, 0.03)'
                      : isMe 
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                        : 'rgba(255, 255, 255, 0.06)',
                    border: msg.isDeleted ? '1px dashed rgba(255,255,255,0.1)' : isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: msg.isDeleted ? '#64748b' : '#ffffff', fontSize: '0.9rem', lineHeight: '1.5',
                    fontStyle: msg.isDeleted ? 'italic' : 'normal',
                    boxShadow: isMe && !msg.isDeleted ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                  }}>
                    {msg.isDeleted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ban size={14} />
                        <span>This message was deleted</span>
                      </div>
                    ) : (
                      <>
                        {msg.attachmentUrl && (
                          <div style={{ marginBottom: msg.text ? '8px' : '0' }}>
                            {msg.attachmentType === 'image' ? (
                              <img src={msg.attachmentUrl} alt="Attachment" style={{ maxWidth: '280px', maxHeight: '200px', borderRadius: '14px', display: 'block', objectFit: 'cover' }} />
                            ) : (
                              <a href={msg.attachmentUrl} download={msg.attachmentName || 'download'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '12px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                                <FileText size={16} style={{ color: '#a78bfa' }} />
                                <span>{msg.attachmentName || 'Download File'}</span>
                                <Download size={14} style={{ marginLeft: '4px' }} />
                              </a>
                            )}
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </>
                    )}
                  </div>
                )}

                {/* Footer Timestamp & Reactions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.75rem' }}>
                      {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                        <span key={emoji}>{emoji}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.isEdited && <span>(edited)</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-Style Floating Attachment Popup Menu */}
      {showAttachMenu && (
        <div style={{
          position: 'absolute', bottom: '75px', left: '28px', zIndex: 100,
          background: '#111428', border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px', padding: '8px', width: '200px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(99, 102, 241, 0.2)',
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <div
            onClick={() => docFileRef.current?.click()}
            style={{
              padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px',
              color: '#ffffff', fontSize: '0.875rem', fontWeight: '600'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FileText size={18} style={{ color: '#a78bfa' }} />
            <span>Document</span>
          </div>

          <div
            onClick={() => imageFileRef.current?.click()}
            style={{
              padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px',
              color: '#ffffff', fontSize: '0.875rem', fontWeight: '600'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Image size={18} style={{ color: '#38bdf8' }} />
            <span>Photos & videos</span>
          </div>
        </div>
      )}

      {/* Selected File Attachment Tag Strip */}
      {attachmentName && (
        <div style={{ padding: '12px 28px', background: '#0d0f22', borderTop: '1px solid rgba(99,102,241,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700' }}>
            <File size={16} />
            <span>Attached: {attachmentName}</span>
          </div>
          <button onClick={() => { setAttachmentUrl(''); setAttachmentName(''); setAttachmentType(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} style={{ padding: '16px 28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 12, 26, 0.95)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          style={{
            background: showAttachMenu ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', color: showAttachMenu ? '#818cf8' : '#94a3b8',
            padding: '12px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Attach File from Explorer"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder={`Write a direct message to ${mentor.name}...`}
          style={{ flex: 1, padding: '12px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={!newMsg.trim() && !attachmentUrl.trim()}
          className="glow-btn"
          style={{ padding: '12px 22px', borderRadius: '14px', opacity: (newMsg.trim() || attachmentUrl.trim()) ? 1 : 0.4 }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>

      {/* Custom Dark Glassmorphism Delete Confirmation Modal */}
      {deleteModalMsgId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px', background: '#0a0c1a',
            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
              Delete Message for Everyone?
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              This message will be permanently deleted for all participants in this conversation.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteModalMsgId(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMessage}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none',
                  color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                Delete for Everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateChatView;
