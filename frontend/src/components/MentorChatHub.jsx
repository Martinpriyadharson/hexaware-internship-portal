import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  X, Send, User, Search, MessageSquare, Clock, CheckCheck, 
  GraduationCap, BookOpen, ShieldCheck, Sparkles, Paperclip, 
  Trash2, Edit2, Smile, FileText, Download, Check, Ban, AlertTriangle,
  Image, File
} from 'lucide-react';

const MentorChatHub = ({ isOpen, onClose, initialCandidateId, candidates = [] }) => {
  const { user, token } = useContext(AuthContext);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState(''); // 'document' | 'image'
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteModalMsgId, setDeleteModalMsgId] = useState(null);
  const [activeHoverMsgId, setActiveHoverMsgId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const docFileRef = useRef(null);
  const imageFileRef = useRef(null);

  useEffect(() => {
    if (candidates.length > 0) {
      if (initialCandidateId) {
        const found = candidates.find(c => (c._id || c.id) === initialCandidateId);
        setSelectedCandidate(found || candidates[0]);
      } else if (!selectedCandidate) {
        setSelectedCandidate(candidates[0]);
      }
    }
  }, [candidates, initialCandidateId]);

  useEffect(() => {
    if (!selectedCandidate || !isOpen) return;

    const candId = selectedCandidate._id || selectedCandidate.id;
    fetchMessages(candId);

    const interval = setInterval(() => {
      fetchMessages(candId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCandidate, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (candidateId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${candidateId}`, {
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
    if ((!newMsg.trim() && !attachmentUrl.trim()) || !selectedCandidate) return;

    const candidateId = selectedCandidate._id || selectedCandidate.id;
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
          recipientId: candidateId,
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

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.preferredStack && c.preferredStack.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
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

      <div style={{
        width: '100%', maxWidth: '960px', height: '640px',
        background: '#0a0c1a', border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(99, 102, 241, 0.15)',
        display: 'flex', overflow: 'hidden'
      }}>
        
        {/* Left Side: Candidates List Inbox */}
        <div style={{
          width: '320px', borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 17, 32, 0.95)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>Candidate Inbox</h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{candidates.length} Assigned Candidates</div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                style={{
                  width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {filteredCandidates.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No candidates found</div>
            ) : (
              filteredCandidates.map((cand) => {
                const candId = cand._id || cand.id;
                const isSelected = selectedCandidate && ((selectedCandidate._id || selectedCandidate.id) === candId);
                return (
                  <div
                    key={candId}
                    onClick={() => setSelectedCandidate(cand)}
                    style={{
                      padding: '12px', borderRadius: '14px', marginBottom: '6px', cursor: 'pointer',
                      background: isSelected ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #818cf8' : '3px solid transparent',
                      transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.08)',
                        color: '#ffffff', fontWeight: '700', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {cand.name ? cand.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', border: '2px solid #0a0c1a' }} />
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isSelected ? '#ffffff' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cand.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cand.preferredStack || cand.attemptedStack || 'Full Stack Developer'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#070913', position: 'relative' }}>
          {selectedCandidate ? (
            <>
              {/* Chat Top Bar */}
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(10, 12, 26, 0.8)', backdropFilter: 'blur(10px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#ffffff', fontWeight: '800', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                  }}>
                    {selectedCandidate.name ? selectedCandidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{selectedCandidate.name}</span>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                        Active Candidate
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      Intern Role: <span style={{ color: '#818cf8', fontWeight: '700' }}>{selectedCandidate.preferredStack || selectedCandidate.attemptedStack || 'Full Stack Developer'}</span>
                    </div>
                  </div>
                </div>

                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', margin: 'auto', fontSize: '0.875rem' }}>
                    <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.4, display: 'block' }} />
                    No previous messages with {selectedCandidate.name}. Send a message to start direct mentoring!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const currentUserId = String(user?._id || user?.id || '');
                    const msgSenderId = String(msg.senderId?._id || msg.senderId || '');
                    const isMe = Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);
                    const isHovered = activeHoverMsgId === msg._id;
                    const isEditingThis = editingMsgId === msg._id;

                    return (
                      <div
                        key={msg._id || index}
                        onMouseEnter={() => setActiveHoverMsgId(msg._id)}
                        onMouseLeave={() => setActiveHoverMsgId(null)}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          position: 'relative',
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
                              <span
                                key={emoji}
                                onClick={() => handleReactMessage(msg._id, emoji)}
                                style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '2px' }}
                              >
                                {emoji}
                              </span>
                            ))}
                            {isMe && (
                              <>
                                <button
                                  onClick={() => { setEditingMsgId(msg._id); setEditingText(msg.text); }}
                                  style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: '2px' }}
                                  title="Edit Message"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteModalMsgId(msg._id)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                  title="Delete Message"
                                >
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
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: '10px',
                                background: '#1e1b4b', border: '1px solid #6366f1',
                                color: '#ffffff', fontSize: '0.85rem', outline: 'none'
                              }}
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
                            padding: '12px 16px', borderRadius: '18px',
                            borderBottomRightRadius: isMe ? '4px' : '18px',
                            borderBottomLeftRadius: isMe ? '18px' : '4px',
                            background: msg.isDeleted
                              ? 'rgba(255, 255, 255, 0.03)'
                              : isMe 
                                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            border: msg.isDeleted ? '1px dashed rgba(255,255,255,0.1)' : isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: msg.isDeleted ? '#64748b' : '#ffffff', fontSize: '0.875rem', lineHeight: '1.5',
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
                                      <img 
                                        src={msg.attachmentUrl} 
                                        alt="Attachment" 
                                        style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '12px', display: 'block', objectFit: 'cover' }} 
                                      />
                                    ) : (
                                      <a
                                        href={msg.attachmentUrl}
                                        download={msg.attachmentName || 'download'}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                          padding: '8px 12px', borderRadius: '10px', color: '#ffffff',
                                          textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600'
                                        }}
                                      >
                                        <FileText size={14} />
                                        <span>{msg.attachmentName || 'Attachment File'}</span>
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

                        {/* Message Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.75rem' }}>
                              {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                                <span key={emoji}>{emoji}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={10} />
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.isEdited && <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>(edited)</span>}
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
                  position: 'absolute', bottom: '70px', left: '24px', zIndex: 100,
                  background: '#111428', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px', padding: '8px', width: '180px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(99, 102, 241, 0.2)',
                  display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                  <div
                    onClick={() => docFileRef.current?.click()}
                    style={{
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      color: '#ffffff', fontSize: '0.875rem', fontWeight: '600',
                      transition: 'background 0.2s ease'
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
                      color: '#ffffff', fontSize: '0.875rem', fontWeight: '600',
                      transition: 'background 0.2s ease'
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
                <div style={{ padding: '10px 24px', background: '#0d0f22', borderTop: '1px solid rgba(99,102,241,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.825rem', fontWeight: '700' }}>
                    <File size={16} />
                    <span>Attached: {attachmentName}</span>
                  </div>
                  <button onClick={() => { setAttachmentUrl(''); setAttachmentName(''); setAttachmentType(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 12, 26, 0.9)', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                  placeholder={`Write a direct message to ${selectedCandidate.name}...`}
                  style={{
                    flex: 1, padding: '12px 18px', borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff', fontSize: '0.875rem', outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() && !attachmentUrl.trim()}
                  className="glow-btn"
                  style={{
                    padding: '12px 20px', borderRadius: '14px',
                    opacity: (newMsg.trim() || attachmentUrl.trim()) ? 1 : 0.4,
                    cursor: (newMsg.trim() || attachmentUrl.trim()) ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>Select a candidate to start mentoring chat</div>
          )}
        </div>

      </div>

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

export default MentorChatHub;
