import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  X, Send, User, MessageSquare, Clock, Paperclip, 
  Trash2, Edit2, Smile, FileText, Download, Check, Ban, AlertTriangle,
  Image, File, ShieldCheck, Mic, Square, Play, Pause, Code, Pin, Star,
  Search, Reply, CheckCheck, UploadCloud
} from 'lucide-react';
import PresenceStatusBadge from './PresenceStatusBadge';

let socket = null;

const ChatDrawer = ({ recipient, onClose }) => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Advanced Enterprise Chat Features
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [codeModal, setCodeModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlayingAudioId, setIsPlayingAudioId] = useState(null);

  // Presence State
  const [recipientPresence, setRecipientPresence] = useState({ currentStatus: 'Available', customStatus: '', isOnline: true });

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    if (!recipient) return;

    // Initialize Socket.IO connection
    socket = io('http://localhost:5000', {
      auth: { token }
    });

    fetchMessages();
    fetchRecipientPresence();

    // Listen for incoming messages
    socket.on('message:received', (incomingMsg) => {
      if (incomingMsg.senderId === recipient._id || incomingMsg.senderId === recipient.id) {
        setMessages(prev => [...prev, incomingMsg]);
      }
    });

    // Listen for typing events
    socket.on('presence:typing', ({ senderId, isTyping: typingFlag }) => {
      if (senderId === recipient._id || senderId === recipient.id) {
        setIsTyping(typingFlag);
        setTypingUser(recipient.name);
      }
    });

    // Listen for presence updates
    socket.on('presence:update', (presenceData) => {
      if (presenceData.userId === recipient._id || presenceData.userId === recipient.id) {
        setRecipientPresence(presenceData);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [recipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRecipientPresence = async () => {
    try {
      const recipientId = recipient._id || recipient.id;
      const res = await fetch(`http://localhost:5000/api/presence/user/${recipientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipientPresence(data);
      }
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const recipientId = recipient._id || recipient.id;
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

  // Typing event emitter
  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    if (socket && recipient) {
      const recipientId = recipient._id || recipient.id;
      socket.emit('presence:typing', { recipientId, isTyping: e.target.value.length > 0 });
    }
  };

  // Drag & Drop File Upload Handler
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds maximum 25MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadProgress(100);
      setTimeout(() => {
        setAttachmentUrl(event.target.result);
        setAttachmentName(file.name);
        setAttachmentType(file.type.startsWith('image/') ? 'image' : 'document');
        setAttachmentSize(file.size);
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required for voice messaging.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMsg.trim() && !attachmentUrl && !audioUrl && !codeSnippet) || !recipient) return;

    const recipientId = recipient._id || recipient.id;
    const payload = {
      recipientId,
      text: newMsg.trim(),
      attachmentUrl,
      attachmentName,
      attachmentType,
      attachmentSize,
      audioUrl,
      audioDuration: recordingTime,
      codeSnippet,
      codeLanguage,
      replyToId: replyToMsg ? replyToMsg._id : null
    };

    setNewMsg('');
    setAttachmentUrl('');
    setAttachmentName('');
    setAudioUrl('');
    setAudioBlob(null);
    setCodeSnippet('');
    setCodeModal(false);
    setReplyToMsg(null);

    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const sentMsg = await res.json();
        setMessages(prev => [...prev, sentMsg]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const togglePin = async (msgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}/pin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m._id === msgId ? updated : m));
      }
    } catch (err) {}
  };

  const toggleStar = async (msgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}/star`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m._id === msgId ? updated : m));
      }
    } catch (err) {}
  };

  const filteredMessages = messages.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (m.text && m.text.toLowerCase().includes(q)) || 
           (m.attachmentName && m.attachmentName.toLowerCase().includes(q)) ||
           (m.codeSnippet && m.codeSnippet.toLowerCase().includes(q));
  });

  if (!recipient) return null;

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
      style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        width: '440px', height: '620px', maxHeight: 'calc(100vh - 40px)', background: '#0a0c1a',
        border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(99, 102, 241, 0.25)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 17, 32, 0.98) 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              color: '#ffffff', fontWeight: '800', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {recipient.name ? recipient.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div style={{ position: 'absolute', bottom: '0px', right: '0px' }}>
              <PresenceStatusBadge status={recipientPresence.currentStatus} size={10} />
            </div>
          </div>

          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{recipient.name}</span>
              <PresenceStatusBadge status={recipientPresence.currentStatus} showLabel={true} showDot={false} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>
              {isTyping ? <span style={{ color: '#10b981', fontWeight: '700' }}>typing...</span> : (recipientPresence.customStatus || recipient.preferredStack || 'Assigned Member')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setShowSearch(!showSearch)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={15} />
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      {showSearch && (
        <div style={{ padding: '8px 16px', background: 'rgba(15, 17, 32, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search keyword, file name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          />
        </div>
      )}

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#060814' }}>
        {filteredMessages.map((msg, idx) => {
          const isMe = String(user?._id || user?.id) === String(msg.senderId?._id || msg.senderId);
          return (
            <div key={msg._id || idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              {/* Reply Preview */}
              {msg.replyToId && (
                <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #6366f1', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', color: '#94a3b8' }}>
                  Replying to: {msg.replyToId.text || 'Attachment'}
                </div>
              )}

              {/* Chat Bubble */}
              <div style={{
                background: isMe ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(30, 41, 59, 0.85)',
                color: '#ffffff', padding: '10px 14px', borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)', position: 'relative'
              }}>
                {msg.text && <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{msg.text}</div>}

                {/* Audio Voice Player */}
                {msg.audioUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '10px' }}>
                    <button onClick={() => setIsPlayingAudioId(isPlayingAudioId === msg._id ? null : msg._id)} style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isPlayingAudioId === msg._id ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <audio src={msg.audioUrl} controls style={{ height: '24px', width: '180px' }} />
                  </div>
                )}

                {/* Attachment Link */}
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.78rem', marginTop: '6px', textDecoration: 'underline' }}>
                    <FileText size={14} /> {msg.attachmentName || 'Attachment'}
                  </a>
                )}

                {/* Time & Read Receipts */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.68rem', opacity: 0.75, marginTop: '4px' }}>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    msg.status === 'seen' ? <CheckCheck size={13} style={{ color: '#34d399' }} /> : <Check size={13} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Controls & Input */}
      <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', background: '#0f1120', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ cursor: 'pointer', color: '#94a3b8' }}>
          <Paperclip size={18} />
          <input type="file" style={{ display: 'none' }} onChange={handleFileDrop} />
        </label>

        <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ background: 'none', border: 'none', color: isRecording ? '#ef4444' : '#94a3b8', cursor: 'pointer' }}>
          {isRecording ? <Square size={18} /> : <Mic size={18} />}
        </button>

        <input 
          type="text" 
          className="form-control" 
          placeholder={isRecording ? `Recording... (${recordingTime}s)` : "Type a message..."} 
          value={newMsg}
          onChange={handleInputChange}
          style={{ flex: 1, fontSize: '0.85rem' }}
        />

        <button type="submit" className="glow-btn" style={{ padding: '8px 14px' }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatDrawer;
