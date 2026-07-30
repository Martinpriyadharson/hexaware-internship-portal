import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import {
  Send, Paperclip, Mic, Square, Code, X, Search,
  CheckCheck, Check, Pin, Star, Reply, Edit2, Trash2,
  Smile, FileText, Download, ChevronLeft, Upload, AlertCircle, Hash, Undo2, Redo2,
  Phone, Video, ChevronDown
} from 'lucide-react';
import PresenceStatusBadge from '../components/PresenceStatusBadge';
import { useCall } from '../context/CallContext';

const BACKEND      = 'http://localhost:5000';
const EMOJI_LIST   = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const CODE_LANGS   = ['javascript','java','python','cpp','sql','html','css','json','typescript','csharp'];
const CAN_EDIT_MS  = 15 * 60 * 1000;   // 15 min
const CAN_DEL_MS   = 30 * 60 * 1000;   // 30 min
const UNDO_WIN_MS  = 5  * 1000;        // 5 s

let socket = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const msAgo = (d) => Date.now() - new Date(d).getTime();
function isSameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }
function dateSep(date) {
  const d = new Date(date), now = new Date(), yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}
function humanSize(b) {
  if (!b) return '';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

// ── Toast Component ───────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{
    position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center'
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(15, 17, 32, 0.97)', border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '14px', padding: '10px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)', minWidth: '260px', maxWidth: '380px',
        animation: 'toastIn 0.25s ease'
      }}>
        <span style={{ fontSize: '1rem' }}>{t.icon}</span>
        <span style={{ flex: 1, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: '600' }}>{t.message}</span>
        {t.undoLabel && t.onUndo && (
          <button onClick={t.onUndo} style={{
            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
            color: '#a5b4fc', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
            flexShrink: 0, transition: 'all 0.15s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.35)'}
             onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}>
            {t.undoLabel === 'Redo' ? <Redo2 size={13} /> : <Undo2 size={13} />}
            {t.undoLabel}
          </button>
        )}
        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
          borderRadius: '0 0 14px 14px',
          animation: `toastProgress ${t.duration || 5000}ms linear forwards`
        }} />
      </div>
    ))}
    <style>{`
      @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// ── MessageBubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe, onReply, onPin, onStar, onReact, onEdit, onDelete, onDeleteMe, userId }) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const pickerRef = useRef(null);

  useEffect(() => {
    if (!showEmojiPicker && !showDeleteMenu) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
        setShowDeleteMenu(false);
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showDeleteMenu]);

  const isStarred       = msg.isStarred?.map?.(String)?.includes?.(String(userId));
  const isPinned        = msg.isPinned;
  const isDelEveryone   = msg.deletedForEveryone || msg.text === 'This message was deleted';
  const isDelForMe      = msg.deletedForMe?.map?.(String)?.includes?.(String(userId));

  const age             = msAgo(msg.createdAt);
  const editAllowed     = isMe && age <= CAN_EDIT_MS && !isDelEveryone;
  const delEvAllowed    = isMe && age <= CAN_DEL_MS  && !isDelEveryone;

  if (isDelForMe) return null;

  return (
    <div
      ref={pickerRef}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!showEmojiPicker && !showDeleteMenu) {
          setShowActions(false);
        }
      }}
      style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginBottom: '4px', position: 'relative' }}
    >
      {!isMe && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#fff' }}>
          {msg.senderName?.[0] ?? '?'}
        </div>
      )}

      <div style={{ maxWidth: '70%', position: 'relative' }}>
        {msg.replyToId && !isDelEveryone && (
          <div style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px 8px 0 0', background: 'rgba(255,255,255,0.06)', borderLeft: '3px solid #6366f1', color: '#94a3b8', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            ↩ {msg.replyToId.text || msg.replyToId.attachmentName || 'Voice message'}
          </div>
        )}

        <div style={{ background: isMe ? 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)' : 'rgba(30,41,59,0.9)', color: '#fff', padding: isDelEveryone ? '8px 14px' : '10px 14px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px', boxShadow: '0 4px 15px rgba(0,0,0,0.35)', position: 'relative' }}>
          {isPinned && <div style={{ fontSize: '0.65rem', color: '#fbbf24', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Pin size={10} /> Pinned</div>}

          {isDelEveryone ? (
            <div style={{ fontStyle: 'italic', opacity: 0.55, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={12} /> This message was deleted</div>
          ) : (
            <>
              {msg.text && <div style={{ fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'word-break' }}>{msg.text}</div>}
              {msg.attachmentType === 'image' && msg.attachmentUrl && (
                <img src={msg.attachmentUrl} alt={msg.attachmentName} style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '10px', cursor: 'pointer', objectFit: 'cover', marginTop: '8px' }} onClick={() => window.open(msg.attachmentUrl, '_blank')} />
              )}
              {msg.attachmentType === 'document' && msg.attachmentUrl && (
                <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#38bdf8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
                  <FileText size={16} /><div><div style={{ color: '#e2e8f0', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.attachmentName}</div><div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{humanSize(msg.attachmentSize)}</div></div><Download size={14} style={{ marginLeft: 'auto' }} />
                </a>
              )}
              {msg.audioUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '12px' }}>
                  <Mic size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                  <audio controls src={msg.audioUrl} style={{ height: '28px', flex: 1, maxWidth: '200px' }} />
                  {msg.audioDuration > 0 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{msg.audioDuration}s</span>}
                </div>
              )}
            </>
          )}

          {msg.reactions?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {Object.entries(msg.reactions.reduce((a, r) => { a[r.emoji] = (a[r.emoji] || 0) + 1; return a; }, {})).map(([emoji, count]) => (
                <span key={emoji} onClick={() => onReact(msg._id, emoji)} style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>{emoji}</span>
                  {count > 1 && <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#cbd5e1' }}>{count}</span>}
                </span>
              ))}
            </div>
          )}

          {!isDelEveryone && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
              {isStarred && <Star size={10} style={{ color: '#fbbf24' }} />}
              {msg.editHistory?.length > 0 && <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>edited</span>}
              <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{fmt(msg.createdAt)}</span>
              {isMe && (msg.status === 'seen' ? <CheckCheck size={12} style={{ color: '#34d399' }} /> : msg.status === 'delivered' ? <CheckCheck size={12} style={{ opacity: 0.5 }} /> : <Check size={12} style={{ opacity: 0.5 }} />)}
            </div>
          )}
        </div>

        {/* Emoji picker - WhatsApp style reaction pill */}
        {showEmojiPicker && !isDelEveryone && (
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', zIndex: 500, bottom: 'calc(100% + 8px)',
              left: isMe ? 'auto' : '0', right: isMe ? '0' : 'auto',
              background: 'rgba(20, 24, 40, 0.96)', border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '30px', padding: '6px 14px', display: 'flex', alignItems: 'center',
              gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(99,102,241,0.25)',
              backdropFilter: 'blur(16px)', whiteSpace: 'nowrap'
            }}
          >
            {EMOJI_LIST.map(e => (
              <span 
                key={e} 
                onClick={() => { onReact(msg._id, e); setShowEmojiPicker(false); setShowActions(false); }} 
                style={{
                  fontSize: '1.45rem', cursor: 'pointer', padding: '2px 4px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none'
                }}
                onMouseEnter={el => {
                  el.currentTarget.style.transform = 'scale(1.4) translateY(-3px)';
                }}
                onMouseLeave={el => {
                  el.currentTarget.style.transform = 'scale(1.0) translateY(0)';
                }}
              >
                {e}
              </span>
            ))}
          </div>
        )}

        {/* Delete submenu */}
        {showDeleteMenu && isMe && (
          <div style={{
            position: 'absolute', zIndex: 500, bottom: 'calc(100% + 8px)', right: 0,
            background: 'rgba(15, 20, 42, 0.98)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '14px', padding: '6px', width: '170px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)'
          }}>
            {delEvAllowed && (
              <button 
                onClick={() => { setShowDeleteMenu(false); setShowActions(false); onDelete(msg._id, 'everyone'); }} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  textAlign: 'left', background: 'none', border: 'none', color: '#f87171',
                  padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span>🗑</span> Delete for Everyone
              </button>
            )}
            <button 
              onClick={() => { setShowDeleteMenu(false); setShowActions(false); onDeleteMe(msg._id); }} 
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8',
                padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>👁</span> Delete for Me
            </button>
          </div>
        )}
      </div>

      {/* Action toolbar */}
      {(showActions || showEmojiPicker || showDeleteMenu) && !isDelEveryone && (
        <div style={{ display: 'flex', flexDirection: isMe ? 'row' : 'row-reverse', gap: '4px', alignSelf: 'center', background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px 6px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          {[
            { icon: <Reply size={13} />, title: 'Reply', action: () => onReply(msg), show: true },
            { icon: <Smile size={13} />, title: 'React', action: () => setShowEmojiPicker(p => !p), show: true },
            { icon: <Pin size={13} />, title: isPinned ? 'Unpin' : 'Pin', action: () => onPin(msg._id), show: true },
            { icon: <Star size={13} />, title: isStarred ? 'Unstar' : 'Star', action: () => onStar(msg._id), show: true },
            { icon: <Edit2 size={13} />, title: editAllowed ? 'Edit message' : 'Edit window expired (15 min)', action: () => editAllowed && onEdit(msg), show: isMe, disabled: !editAllowed },
            { icon: <Trash2 size={13} />, title: 'Delete', action: () => setShowDeleteMenu(p => !p), show: isMe },
          ].filter(b => b.show).map((btn, i) => (
            <button key={i} title={btn.title} onClick={btn.action} style={{ background: 'none', border: 'none', color: btn.disabled ? '#2d3748' : '#94a3b8', cursor: btn.disabled ? 'not-allowed' : 'pointer', padding: '3px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s', position: 'relative' }}
              onMouseEnter={e => { if (!btn.disabled) e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = btn.disabled ? '#2d3748' : '#94a3b8'; }}>
              {btn.icon}
              {btn.disabled && <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '5px', height: '5px', borderRadius: '50%', background: '#475569' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main ChatHub ──────────────────────────────────────────────────────────────
const ChatHub = () => {
  const { user, token } = useContext(AuthContext);

  const [contacts,     setContacts]    = useState([]);
  const [activeContact,setActiveContact] = useState(null);
  const [messages,     setMessages]    = useState([]);
  const [presenceMap,  setPresenceMap] = useState({});
  const [unreadMap,    setUnreadMap]   = useState({});

  // Input
  const [newMsg,    setNewMsg]   = useState('');
  const [replyTo,   setReplyTo]  = useState(null);
  const [editingMsg,setEditingMsg] = useState(null);

  // Attachment
  const [attachment,    setAttachment]    = useState({ url: '', name: '', type: '', size: 0 });
  const [uploadProgress,setUploadProgress] = useState(0);
  const [isUploading,   setIsUploading]   = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs,  setRecordSecs]  = useState(0);
  const [voiceUrl,    setVoiceUrl]    = useState('');
  const mediaRecRef   = useRef(null);
  const audioChunks   = useRef([]);
  const recTimerRef   = useRef(null);

  // Code snippet
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeSnippet,   setCodeSnippet]   = useState('');
  const [codeLang,      setCodeLang]      = useState('javascript');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch,  setShowSearch]  = useState(false);

  // WebRTC Audio/Video Call
  const call = useCall();
  const [showCallMenu, setShowCallMenu] = useState(false);
  const callMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (callMenuRef.current && !callMenuRef.current.contains(e.target)) {
        setShowCallMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Typing
  const [typingUsers,  setTypingUsers] = useState({});
  const typingTimer    = useRef(null);

  // UI
  const [showContactList, setShowContactList] = useState(true);
  const [isLoadingMsgs,   setIsLoadingMsgs]   = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback(({ icon = '✅', message, undoLabel, onUndo, duration = 5000 }) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, icon, message, undoLabel, onUndo, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration + 300);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Last Messages
  const [lastMsgMap, setLastMsgMap] = useState({});

  const updateLastMessage = useCallback((msg) => {
    if (!msg) return;
    const myIdStr = String(user?._id || user?.id || '');

    let senderIdStr = '';
    if (typeof msg.senderId === 'object' && msg.senderId !== null) {
      senderIdStr = String(msg.senderId._id || msg.senderId.id || '');
    } else if (msg.senderId) {
      senderIdStr = String(msg.senderId);
    }

    let recipientIdStr = '';
    if (typeof msg.recipientId === 'object' && msg.recipientId !== null) {
      recipientIdStr = String(msg.recipientId._id || msg.recipientId.id || '');
    } else if (msg.recipientId) {
      recipientIdStr = String(msg.recipientId);
    }

    const otherId = senderIdStr === myIdStr ? recipientIdStr : senderIdStr;
    if (!otherId) return;

    const rawDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
    const timestamp = !isNaN(rawDate.getTime()) ? rawDate.getTime() : Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const snippet = msg.text || (msg.attachmentName ? `📎 ${msg.attachmentName}` : msg.audioUrl ? '🎙️ Voice note' : 'Message');

    setLastMsgMap(prev => ({
      ...prev,
      [otherId]: {
        text: snippet,
        time: timeStr,
        timestamp: timestamp
      }
    }));
  }, [user]);

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

  // ── Socket init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    socket = io(BACKEND, { auth: { token }, reconnection: true, reconnectionDelay: 1000 });

    socket.on('message:received', (m) => {
      setMessages(prev => {
        if (prev.some(p => String(p._id) === String(m._id))) return prev;
        return [...prev, m];
      });

      const senderIdStr = String(typeof m.senderId === 'object' ? (m.senderId._id || m.senderId.id) : m.senderId);
      const myIdStr = String(user?._id || user?.id);

      updateLastMessage(m);

      if (senderIdStr !== myIdStr) {
        setUnreadMap(prev => ({
          ...prev,
          [senderIdStr]: (prev[senderIdStr] || 0) + 1
        }));
        playChime();
        const senderName = typeof m.senderId === 'object' ? (m.senderId.name || 'Contact') : 'Contact';
        const snippet = m.text || (m.attachmentName ? `📎 ${m.attachmentName}` : m.audioUrl ? '🎙️ Voice note' : 'New message');
        addToast({
          icon: '💬',
          message: `${senderName}: "${snippet.length > 28 ? snippet.substring(0, 28) + '...' : snippet}"`,
          duration: 4500
        });
      }
    });

    // Real-time lifecycle events from other clients
    const updateMsg = (updated) => {
      setMessages(prev => prev.map(m => m._id === updated._id ? { ...m, ...updated } : m));
      updateLastMessage(updated);
    };
    socket.on('message:edited',         updateMsg);
    socket.on('message:deleted:everyone', updateMsg);
    socket.on('message:undone',         updateMsg);
    socket.on('message:redone',         updateMsg);
    socket.on('message:reacted',        updateMsg);

    socket.on('presence:typing',  ({ senderId, isTyping }) => setTypingUsers(prev => ({ ...prev, [senderId]: isTyping })));
    socket.on('presence:update',  ({ userId: uid, currentStatus, customStatus, isOnline, lastSeen }) =>
      setPresenceMap(prev => ({ ...prev, [uid]: { currentStatus, customStatus, isOnline, lastSeen } })));

    return () => socket?.disconnect();
  }, [token, addToast, updateLastMessage]);

  // ── Load contacts, presence & unread/last message counts ──────────────────
  useEffect(() => { 
    if (token && user) { 
      fetchContacts(); 
      fetchPresenceMap(); 
      fetchUnreadCounts();
    } 
  }, [user, token]);

  const fetchUnreadCounts = async () => {
    try {
      const t = token || localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/api/messages/unread/counts`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        setUnreadMap(await res.json());
      }
    } catch (e) {}
  };

  const fetchContacts = async () => {
    try {
      const t = token || localStorage.getItem('token');
      if (!t || !user) return;

      const res = await fetch(`${BACKEND}/api/messages/contacts`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const list = await res.json();
        setContacts(list.map(c => ({ ...c, _id: c._id || c.id })));
      }
    } catch (err) { console.error('[ChatHub] Contacts error:', err); }
  };

  const fetchPresenceMap = async () => {
    try {
      const t = token || localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/api/presence/online`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) setPresenceMap(await res.json());
    } catch (e) {}
  };

  // ── Load messages ──────────────────────────────────────────────────────────
  const loadMessages = async (contact) => {
    setIsLoadingMsgs(true); setMessages([]);
    const cid = contact._id || contact.id;
    try {
      const res = await fetch(`${BACKEND}/api/messages/${cid}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch (e) {}
    setIsLoadingMsgs(false);
    setUnreadMap(prev => ({ ...prev, [cid]: 0 }));
  };

  const selectContact = (contact) => { setActiveContact(contact); loadMessages(contact); if (window.innerWidth < 768) setShowContactList(false); };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Typing ─────────────────────────────────────────────────────────────────
  const emitTyping = (val) => {
    if (!socket || !activeContact) return;
    const rid = activeContact._id || activeContact.id;
    socket.emit('presence:typing', { recipientId: rid, isTyping: val.length > 0 });
    clearTimeout(typingTimer.current);
    if (val.length > 0) typingTimer.current = setTimeout(() => socket.emit('presence:typing', { recipientId: rid, isTyping: false }), 3000);
  };

  // ── File drop ──────────────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { alert('Max 25 MB'); return; }
    processFile(file);
  }, []);

  const processFile = (file) => {
    setIsUploading(true); setUploadProgress(10);
    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 90)); };
    reader.onload = (ev) => { setUploadProgress(100); setTimeout(() => { setAttachment({ url: ev.target.result, name: file.name, type: file.type.startsWith('image/') ? 'image' : 'document', size: file.size }); setIsUploading(false); setUploadProgress(0); }, 300); };
    reader.readAsDataURL(file);
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecRef.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mediaRecRef.current.onstop = () => { const blob = new Blob(audioChunks.current, { type: 'audio/webm' }); setVoiceUrl(URL.createObjectURL(blob)); };
      mediaRecRef.current.start(); setIsRecording(true); setRecordSecs(0);
      recTimerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } catch { alert('Microphone access required.'); }
  };
  const stopRecording = () => { mediaRecRef.current?.stop(); setIsRecording(false); clearInterval(recTimerRef.current); };

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const t = token || localStorage.getItem('token');
    if ((!newMsg.trim() && !attachment.url && !voiceUrl && !codeSnippet) || !activeContact) return;

    const rid = activeContact._id || activeContact.id;

    if (editingMsg) {
      // Edit existing message
      try {
        const res = await fetch(`${BACKEND}/api/messages/${editingMsg._id}/edit`, {
          method: 'PUT', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newMsg.trim() })
        });
        if (res.ok) {
          const updated = await res.json();
          setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));

          // Show Undo toast
          const toastId = addToast({
            icon: '✏️', message: 'Message edited',
            undoLabel: 'Undo', duration: UNDO_WIN_MS,
            onUndo: async () => {
              removeToast(toastId);
              try {
                const r2 = await fetch(`${BACKEND}/api/messages/${updated._id}/undo`, {
                  method: 'POST', headers: { Authorization: `Bearer ${t}` }
                });
                if (r2.ok) {
                  const restored = await r2.json();
                  setMessages(prev => prev.map(m => m._id === restored._id ? restored : m));
                  // Show Redo toast
                  addToast({
                    icon: '↩️', message: 'Edit undone',
                    undoLabel: 'Redo', duration: UNDO_WIN_MS,
                    onUndo: async () => {
                      try {
                        const r3 = await fetch(`${BACKEND}/api/messages/${restored._id}/redo`, {
                          method: 'POST', headers: { Authorization: `Bearer ${t}` }
                        });
                        if (r3.ok) {
                          const redone = await r3.json();
                          setMessages(prev => prev.map(m => m._id === redone._id ? redone : m));
                          addToast({ icon: '🔁', message: 'Edit restored', duration: 3000 });
                        }
                      } catch {}
                    }
                  });
                } else {
                  const err = await r2.json();
                  if (err.code === 'UNDO_WINDOW_EXPIRED') addToast({ icon: '⏱', message: 'Undo window expired', duration: 3000 });
                }
              } catch {}
            }
          });
        } else {
          const err = await res.json();
          if (err.code === 'EDIT_WINDOW_EXPIRED') addToast({ icon: '⏱', message: 'Edit window expired (15 minutes)', duration: 3500 });
        }
      } catch {}
      setEditingMsg(null); setNewMsg(''); return;
    }

    // New message
    const payload = { recipientId: rid, text: newMsg.trim(), attachmentUrl: attachment.url, attachmentName: attachment.name, attachmentType: attachment.type, attachmentSize: attachment.size, audioUrl: voiceUrl, audioDuration: recordSecs, codeSnippet, codeLanguage: codeLang, replyToId: replyTo?._id || null };
    setNewMsg(''); setAttachment({ url: '', name: '', type: '', size: 0 }); setVoiceUrl(''); setRecordSecs(0); setCodeSnippet(''); setShowCodeModal(false); setReplyTo(null);

    try {
      const res = await fetch(`${BACKEND}/api/messages/send`, {
        method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { 
        const sent = await res.json(); 
        setMessages(prev => [...prev, sent]); 
        updateLastMessage(sent);
      }
    } catch {}
  };

  // ── Lifecycle actions ──────────────────────────────────────────────────────
  const authHdr = () => ({ Authorization: `Bearer ${token || localStorage.getItem('token')}` });

  const handleDelete = async (msgId, mode) => {
    const t = token || localStorage.getItem('token');
    if (mode === 'everyone') {
      try {
        const res = await fetch(`${BACKEND}/api/messages/${msgId}/everyone`, { method: 'DELETE', headers: authHdr() });
        if (res.ok) {
          const updated = await res.json();
          setMessages(prev => prev.map(m => m._id === msgId ? updated : m));

          // Undo toast
          const toastId = addToast({
            icon: '🗑️', message: 'Message deleted for everyone',
            undoLabel: 'Undo', duration: UNDO_WIN_MS,
            onUndo: async () => {
              removeToast(toastId);
              try {
                const r2 = await fetch(`${BACKEND}/api/messages/${msgId}/undo`, { method: 'POST', headers: authHdr() });
                if (r2.ok) {
                  const restored = await r2.json();
                  setMessages(prev => prev.map(m => m._id === msgId ? restored : m));
                  addToast({ icon: '✅', message: 'Message restored for everyone', duration: 3000 });
                } else {
                  const err = await r2.json();
                  if (err.code === 'UNDO_WINDOW_EXPIRED') addToast({ icon: '⏱', message: 'Undo window expired', duration: 3000 });
                }
              } catch {}
            }
          });
        } else {
          const err = await res.json();
          if (err.code === 'DELETE_WINDOW_EXPIRED') addToast({ icon: '⏱', message: 'Delete for Everyone expired (30 minutes)', duration: 3500 });
        }
      } catch {}
    }
  };

  const handleDeleteMe = async (msgId) => {
    try {
      const res = await fetch(`${BACKEND}/api/messages/${msgId}/me`, { method: 'DELETE', headers: authHdr() });
      if (res.ok) setMessages(prev => prev.map(m => m._id === msgId ? { ...m, deletedForMe: [...(m.deletedForMe || []), user?._id || user?.id] } : m));
    } catch {}
  };

  const handlePin  = async (id) => { try { const r = await fetch(`${BACKEND}/api/messages/${id}/pin`,  { method: 'PUT', headers: authHdr() }); if (r.ok) { const u = await r.json(); setMessages(prev => prev.map(m => m._id === id ? u : m)); } } catch {} };
  const handleStar = async (id) => { try { const r = await fetch(`${BACKEND}/api/messages/${id}/star`, { method: 'PUT', headers: authHdr() }); if (r.ok) { const u = await r.json(); setMessages(prev => prev.map(m => m._id === id ? u : m)); } } catch {} };
  const handleReact= async (id, emoji) => { try { const r = await fetch(`${BACKEND}/api/messages/${id}/react`, { method: 'POST', headers: { ...authHdr(), 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }) }); if (r.ok) { const u = await r.json(); setMessages(prev => prev.map(m => m._id === id ? u : m)); } } catch {} };

  const handleEditStart = (msg) => { setEditingMsg(msg); setNewMsg(msg.text); };

  // ── Filtered messages ──────────────────────────────────────────────────────
  const myId = String(user?._id || user?.id);
  const filtered = messages.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.text?.toLowerCase().includes(q) || m.attachmentName?.toLowerCase().includes(q) || m.codeSnippet?.toLowerCase().includes(q);
  });

  const activeContactId = String(activeContact?._id || activeContact?.id || '');
  const recipientPresence = presenceMap[activeContactId] || {};
  const isTypingNow = typingUsers[activeContactId];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast toasts={toasts} />

      <div style={{ display: 'flex', height: '100%', minHeight: 0, background: '#060814', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Contacts sidebar */}
        <div style={{ width: '300px', flexShrink: 0, background: '#0a0c1a', borderRight: '1px solid rgba(255,255,255,0.06)', display: showContactList ? 'flex' : 'none', flexDirection: 'column' }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>Messages</h2>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input type="text" placeholder="Search contacts..." className="form-control" style={{ paddingLeft: '32px', fontSize: '0.82rem', background: 'rgba(255,255,255,0.04)' }} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {contacts
              .filter(c => !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
              .sort((a, b) => {
                const cidA = String(a._id || a.id);
                const cidB = String(b._id || b.id);
                const unreadA = unreadMap[cidA] || 0;
                const unreadB = unreadMap[cidB] || 0;
                const timeA = lastMsgMap[cidA]?.timestamp || 0;
                const timeB = lastMsgMap[cidB]?.timestamp || 0;
                const scoreA = (unreadA > 0 ? 1e14 * unreadA : 0) + timeA;
                const scoreB = (unreadB > 0 ? 1e14 * unreadB : 0) + timeB;
                return scoreB - scoreA;
              })
              .map(contact => {
                const cid = String(contact._id || contact.id);
                const presence = presenceMap[cid] || {};
                const unread = unreadMap[cid] || 0;
                const lastMsg = lastMsgMap[cid];
                const isActive = cid === activeContactId;
                return (
                  <div key={cid} onClick={() => selectContact(contact)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '14px', cursor: 'pointer', marginBottom: '4px', background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent', border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: contact.role === 'Admin' ? 'linear-gradient(135deg,#ef4444,#ec4899)' : contact.role === 'Mentor' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#fff' }}>
                        {contact.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div style={{ position: 'absolute', bottom: '1px', right: '1px' }}><PresenceStatusBadge status={presence.currentStatus || 'Offline'} size={10} /></div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</div>
                        {lastMsg?.time && (
                          <span style={{ fontSize: '0.68rem', color: unread > 0 ? '#10b981' : '#64748b', fontWeight: unread > 0 ? '700' : '400', flexShrink: 0 }}>
                            {lastMsg.time}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.72rem', color: lastMsg?.text ? '#94a3b8' : (contact.role === 'Admin' ? '#f472b6' : '#64748b'), fontWeight: lastMsg?.text ? '500' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: unread > 0 ? '140px' : '180px' }}>
                          {lastMsg?.text || presence.customStatus || contact.preferredStack || (contact.role === 'Admin' ? '🛡️ Administrator' : contact.role) || 'Member'}
                        </div>
                        {unread > 0 && (
                          <span style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            borderRadius: '20px',
                            padding: '2px 8px',
                            minWidth: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.45)'
                          }}>
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {contacts.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontSize: '0.85rem' }}>No contacts available</div>}
          </div>
        </div>

        {/* Chat window */}
        {activeContact ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}>

            {isDragging && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.25)', backdropFilter: 'blur(4px)', border: '2px dashed rgba(99,102,241,0.7)', borderRadius: '20px' }}>
                <Upload size={42} style={{ color: '#6366f1', marginBottom: '12px' }} />
                <p style={{ color: '#c7d2fe', fontWeight: '700', fontSize: '1.1rem' }}>Drop file to send</p>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Max 25 MB · Images, Docs, ZIP, PDF</p>
              </div>
            )}

            {/* Chat header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,12,26,0.95)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setShowContactList(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '4px' }}><ChevronLeft size={18} /></button>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: activeContact.role === 'Mentor' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#fff' }}>{activeContact.name?.charAt(0).toUpperCase()}</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0 }}><PresenceStatusBadge status={recipientPresence.currentStatus || 'Offline'} size={11} /></div>
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeContact.name}
                    <PresenceStatusBadge status={recipientPresence.currentStatus || 'Offline'} showLabel={true} showDot={false} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isTypingNow ? '#10b981' : '#64748b', transition: 'color 0.2s' }}>
                    {isTypingNow ? `${activeContact.name?.split(' ')[0]} is typing...` : (recipientPresence.customStatus || activeContact.preferredStack || activeContact.role || 'Member')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <button onClick={() => setShowSearch(p => !p)} style={{ background: showSearch ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={15} /></button>

                {/* Call Dropdown Control - Teams/WhatsApp Style */}
                <div ref={callMenuRef} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <button
                      onClick={() => call?.startCall(activeContact, 'video')}
                      style={{ background: 'none', border: 'none', color: '#cbd5e1', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      title="Start Video Call"
                    >
                      <Video size={16} />
                    </button>
                    <button
                      onClick={() => setShowCallMenu(p => !p)}
                      style={{ background: 'none', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      title="Call Options"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Dropdown Menu matching user's screenshot */}
                  {showCallMenu && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 500,
                      background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '14px', padding: '6px', width: '160px',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
                      animation: 'fadeIn 0.15s ease'
                    }}>
                      <button
                        onClick={() => { setShowCallMenu(false); call?.startCall(activeContact, 'video'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          textAlign: 'left', background: 'none', border: 'none', color: '#e2e8f0',
                          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Video size={16} style={{ color: '#818cf8' }} />
                        <span>Video call</span>
                      </button>

                      <button
                        onClick={() => { setShowCallMenu(false); call?.startCall(activeContact, 'audio'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          textAlign: 'left', background: 'none', border: 'none', color: '#e2e8f0',
                          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Phone size={16} style={{ color: '#34d399' }} />
                        <span>Audio call</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showSearch && (
              <div style={{ padding: '8px 16px', background: 'rgba(10,12,26,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <input type="text" className="form-control" placeholder="Search messages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ fontSize: '0.82rem' }} autoFocus />
              </div>
            )}

            {/* Messages feed */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isLoadingMsgs && <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}><div style={{ width: '32px', height: '32px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} /><p>Loading messages...</p></div>}

              {!isLoadingMsgs && filtered.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
                  <p style={{ fontWeight: '700', color: '#94a3b8', fontSize: '1rem' }}>Start a conversation</p>
                  <p style={{ fontSize: '0.82rem' }}>Send a message to {activeContact.name}</p>
                </div>
              )}

              {!isLoadingMsgs && filtered.map((msg, idx) => {
                const isMe = myId === String(msg.senderId?._id || msg.senderId);
                const prev = filtered[idx - 1];
                const showSep = !prev || !isSameDay(prev.createdAt, msg.createdAt);
                return (
                  <React.Fragment key={msg._id || idx}>
                    {showSep && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0 8px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#475569', background: '#0a0c1a', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>{dateSep(msg.createdAt)}</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    )}
                    <MessageBubble
                      msg={{ ...msg, senderName: isMe ? (user?.name || 'Me') : activeContact.name }}
                      isMe={isMe} userId={myId}
                      onReply={setReplyTo} onPin={handlePin} onStar={handleStar}
                      onReact={handleReact} onEdit={handleEditStart}
                      onDelete={handleDelete} onDeleteMe={handleDeleteMe}
                    />
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0c1a', padding: '12px 16px', flexShrink: 0 }}>
              {replyTo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '8px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Reply size={13} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Replying to: {replyTo.text || replyTo.attachmentName || 'Voice message'}</div>
                  <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={13} /></button>
                </div>
              )}

              {editingMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '8px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Edit2 size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.78rem', color: '#94a3b8' }}>Editing message</span>
                  <button onClick={() => { setEditingMsg(null); setNewMsg(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={13} /></button>
                </div>
              )}

              {attachment.url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '8px', borderRadius: '10px', background: 'rgba(30,41,59,0.8)' }}>
                  {attachment.type === 'image' ? <img src={attachment.url} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} /> : <FileText size={28} style={{ color: '#6366f1' }} />}
                  <div style={{ flex: 1, fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name} <span style={{ fontSize: '0.7rem' }}>({humanSize(attachment.size)})</span></div>
                  <button onClick={() => setAttachment({ url: '', name: '', type: '', size: 0 })} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}

              {voiceUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Mic size={14} style={{ color: '#10b981' }} />
                  <audio controls src={voiceUrl} style={{ height: '28px', flex: 1 }} />
                  <button onClick={() => { setVoiceUrl(''); setRecordSecs(0); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={13} /></button>
                </div>
              )}

              {isUploading && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}><span>Uploading...</span><span>{uploadProgress}%</span></div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg,#6366f1,#a78bfa)', borderRadius: '4px', transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
                <button type="button" title="Attach file" onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px' }} onMouseEnter={e => e.currentTarget.style.color = '#c7d2fe'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}><Paperclip size={18} /></button>
                <button type="button" title={isRecording ? `Stop (${recordSecs}s)` : 'Record voice'} onClick={isRecording ? stopRecording : startRecording} style={{ background: isRecording ? 'rgba(239,68,68,0.15)' : 'none', border: isRecording ? '1px solid rgba(239,68,68,0.3)' : 'none', color: isRecording ? '#ef4444' : '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>
                  {isRecording ? <Square size={18} /> : <Mic size={18} />}
                </button>
                {isRecording && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', minWidth: '32px' }}>{recordSecs}s</span>}

                <input type="text" className="form-control" placeholder={isRecording ? 'Recording... click ■ to stop' : editingMsg ? 'Edit message...' : `Message ${activeContact.name?.split(' ')[0]}...`} value={newMsg} onChange={e => { setNewMsg(e.target.value); emitTyping(e.target.value); }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }} style={{ flex: 1, fontSize: '0.875rem' }} disabled={isRecording} />

                <button type="submit" disabled={!newMsg.trim() && !attachment.url && !voiceUrl} style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', border: 'none', color: '#fff', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)', opacity: (!newMsg.trim() && !attachment.url && !voiceUrl) ? 0.4 : 1, transition: 'all 0.15s' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569', padding: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
            <h3 style={{ color: '#94a3b8', fontWeight: '800', fontSize: '1.2rem', margin: '0 0 8px' }}>Enterprise Chat</h3>
            <p style={{ fontSize: '0.875rem', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>Select a contact from the sidebar to start a secure, real-time conversation.</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Real-time Messaging','Voice Notes','File Sharing','Read Receipts','Presence Status','Undo / Redo','Lifecycle Management'].map(f => (
                <span key={f} style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHub;
