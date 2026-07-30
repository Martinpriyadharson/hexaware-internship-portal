import React from 'react';
import { useCall } from '../context/CallContext';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  Monitor, Maximize2, Minimize2, User
} from 'lucide-react';

const formatSecs = (totalSecs) => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CallOverlayModal = () => {
  const call = useCall();
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (!call || call.callState === 'idle') return null;

  const {
    callState, callType, peerInfo, isMuted, isVideoOff, isScreenSharing,
    remoteMediaStatus, callDuration, localVideoRef, remoteVideoRef,
    acceptCall, rejectCall, endCall, toggleAudio, toggleVideo, toggleScreenShare
  } = call;

  // 1. Incoming Call Ringing Dialog
  if (callState === 'incoming_ringing') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(5, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        animation: 'fadeIn 0.25s ease'
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', background: '#0f142a',
          border: '1px solid rgba(167, 139, 250, 0.4)', borderRadius: '28px',
          padding: '32px 24px', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(99,102,241,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          {/* Ringing Avatar Pulse */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{
              width: '84px', height: '84px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', fontWeight: '800', color: '#fff',
              boxShadow: '0 8px 25px rgba(99,102,241,0.5)'
            }}>
              {peerInfo?.name?.[0] || '?'}
            </div>
            <div style={{
              position: 'absolute', inset: '-8px', borderRadius: '50%',
              border: '2px solid #818cf8', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
          </div>

          <span style={{
            fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#a78bfa', background: 'rgba(167,139,250,0.15)',
            padding: '4px 12px', borderRadius: '20px', marginBottom: '8px'
          }}>
            Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
          </span>

          <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
            {peerInfo?.name || 'User'}
          </h3>
          <p style={{ margin: '0 0 28px', fontSize: '0.85rem', color: '#94a3b8' }}>
            {peerInfo?.role || 'Portal Member'} is calling you...
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {/* Decline */}
            <button
              onClick={rejectCall}
              style={{
                width: '60px', height: '60px', borderRadius: '50%', border: 'none',
                background: '#ef4444', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)', transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
              title="Decline Call"
            >
              <PhoneOff size={24} />
            </button>

            {/* Accept */}
            <button
              onClick={acceptCall}
              style={{
                width: '60px', height: '60px', borderRadius: '50%', border: 'none',
                background: '#10b981', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)', transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
              title="Accept Call"
            >
              {callType === 'video' ? <Video size={24} /> : <Phone size={24} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Outgoing Call Ringing Dialog
  if (callState === 'outgoing_ringing') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(5, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        animation: 'fadeIn 0.25s ease'
      }}>
        <div style={{
          width: '100%', maxWidth: '400px', background: '#0f142a',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px',
          padding: '32px 24px', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', fontWeight: '800', color: '#fff',
            marginBottom: '20px', boxShadow: '0 8px 25px rgba(99,102,241,0.4)'
          }}>
            {peerInfo?.name?.[0] || '?'}
          </div>

          <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>
            Calling {peerInfo?.name || 'User'}...
          </h3>
          <p style={{ margin: '0 0 28px', fontSize: '0.85rem', color: '#94a3b8' }}>
            Ringing... Waiting for answer
          </p>

          <button
            onClick={endCall}
            style={{
              width: '56px', height: '56px', borderRadius: '50%', border: 'none',
              background: '#ef4444', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(239,68,68,0.4)'
            }}
            title="Cancel Call"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Call Ended Overlay
  if (callState === 'ended') {
    return (
      <div style={{
        position: 'fixed', bottom: '30px', right: '30px', zIndex: 999999,
        background: '#0f142a', border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '16px', padding: '14px 20px', color: '#f87171',
        fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
      }}>
        📵 Call Ended
      </div>
    );
  }

  // 4. Active Call Window (Video & Audio)
  return (
    <div style={{
      position: 'fixed',
      bottom: isMinimized ? '20px' : 'auto',
      right: isMinimized ? '20px' : 'auto',
      inset: isMinimized ? 'auto' : '0',
      width: isMinimized ? '320px' : '100%',
      height: isMinimized ? '200px' : '100%',
      zIndex: 999990,
      background: isMinimized ? '#0a0c1a' : '#040612',
      border: isMinimized ? '2px solid rgba(99,102,241,0.5)' : 'none',
      borderRadius: isMinimized ? '20px' : '0',
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '12px 20px', background: 'rgba(15, 20, 42, 0.85)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '0.85rem' }}>
            {peerInfo?.name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.9rem' }}>{peerInfo?.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
              ● {formatSecs(callDuration)} {callType === 'video' ? '· 720p HD' : '· HD Audio'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(p => !p)}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
          title={isMinimized ? 'Expand Call' : 'Minimize Call'}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </div>

      {/* Main Stream Area */}
      <div style={{ flex: 1, position: 'relative', background: '#02030a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {callType === 'video' ? (
          <>
            {/* Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%', height: '100%', objectFit: isScreenSharing ? 'contain' : 'cover',
                display: remoteMediaStatus.video ? 'block' : 'none'
              }}
            />

            {!remoteMediaStatus.video && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>
                  {peerInfo?.name?.[0]}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>Camera is turned off</div>
              </div>
            )}

            {/* Local Video Stream Inset (PIP) */}
            {!isMinimized && (
              <div style={{
                position: 'absolute', bottom: '24px', right: '24px',
                width: '200px', height: '130px', borderRadius: '16px',
                overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)', background: '#0f142a'
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: isVideoOff ? 'none' : 'block' }}
                />
                {isVideoOff && (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0c1a', color: '#64748b' }}>
                    <VideoOff size={24} />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Audio Call Presentation */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3.5rem', fontWeight: '800', color: '#fff',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)'
              }}>
                {peerInfo?.name?.[0]}
              </div>
              <div style={{
                position: 'absolute', inset: '-10px', borderRadius: '50%',
                border: '2px solid #34d399', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
              }} />
            </div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: '800' }}>{peerInfo?.name}</h3>
            <p style={{ margin: 0, color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>
              ● Audio Call Connected ({formatSecs(callDuration)})
            </p>
            {/* Hidden audio element for WebRTC audio playback */}
            <video ref={remoteVideoRef} autoPlay playsInline style={{ display: 'none' }} />
            <video ref={localVideoRef} autoPlay muted playsInline style={{ display: 'none' }} />
          </div>
        )}
      </div>

      {/* Floating Control Bar */}
      {!isMinimized && (
        <div style={{
          padding: '16px', background: 'rgba(15, 20, 42, 0.92)',
          backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 10
        }}>
          {/* Mute Mic */}
          <button
            onClick={toggleAudio}
            style={{
              width: '48px', height: '48px', borderRadius: '50%', border: 'none',
              background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
              color: isMuted ? '#ef4444' : '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
            }}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Camera (Video call only) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: isVideoOff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                color: isVideoOff ? '#ef4444' : '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
              }}
              title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}

          {/* Screen Share (Video call only) */}
          {callType === 'video' && (
            <button
              onClick={toggleScreenShare}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: isScreenSharing ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isScreenSharing ? '#818cf8' : 'rgba(255,255,255,0.15)'}`,
                color: isScreenSharing ? '#818cf8' : '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
              }}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Monitor size={20} />
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            style={{
              width: '54px', height: '54px', borderRadius: '50%', border: 'none',
              background: '#ef4444', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)', transition: 'transform 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
            title="End Call"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallOverlayModal;
