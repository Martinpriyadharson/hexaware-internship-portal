import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

const BACKEND = SOCKET_URL;
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

const CallContext = createContext(null);

export const CallProvider = ({ children, user, token }) => {
  const [callState, setCallState] = useState('idle'); // 'idle' | 'outgoing_ringing' | 'incoming_ringing' | 'active' | 'ended'
  const [callType, setCallType] = useState('video'); // 'video' | 'audio'
  
  const [peerInfo, setPeerInfo] = useState(null); // { id, name, role }
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteMediaStatus, setRemoteMediaStatus] = useState({ audio: true, video: true });
  const [callDuration, setCallDuration] = useState(0);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const durationTimerRef = useRef(null);
  const ringAudioRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize Socket.IO connection for signaling
  const userId = user?._id || user?.id;
  useEffect(() => {
    if (!token || !userId) return;
    const socket = io(BACKEND, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    // Incoming Call Listener
    socket.on('call:incoming', async (data) => {
      // If already in a call, reject automatically
      if (callState !== 'idle') {
        socket.emit('call:reject', { callerId: data.callerId, reason: 'User is busy on another call' });
        return;
      }

      setPeerInfo({ id: data.callerId, name: data.callerName, role: data.callerRole });
      setCallType(data.callType || 'video');
      setCallState('incoming_ringing');

      // Store SDP Offer
      socketRef.current.pendingOffer = data.offer;

      // Play ringing audio sound
      try {
        if (!ringAudioRef.current) {
          ringAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
          ringAudioRef.current.loop = true;
        }
        ringAudioRef.current.play().catch(() => {});
      } catch (e) {}
    });

    // Call Accepted Listener
    socket.on('call:accepted', async (data) => {
      stopRinging();
      setCallState('active');
      startDurationTimer();

      if (pcRef.current && data.answer) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    // Call Rejected Listener
    socket.on('call:rejected', (data) => {
      stopRinging();
      setCallState('ended');
      setTimeout(() => resetCallState(), 2500);
    });

    // ICE Candidate Listener
    socket.on('call:ice-candidate', async (data) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    // Remote Toggle Media
    socket.on('call:media-toggled', (data) => {
      setRemoteMediaStatus(prev => ({ ...prev, [data.mediaType]: data.enabled }));
    });

    // Call Ended Listener
    socket.on('call:ended', () => {
      stopRinging();
      cleanupWebRTC();
      setCallState('ended');
      setTimeout(() => resetCallState(), 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  const stopRinging = () => {
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    }
  };

  const startDurationTimer = () => {
    clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const resetCallState = () => {
    stopRinging();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(t => t.stop());
      remoteStreamRef.current = null;
    }
    setCallState('idle');
    setPeerInfo(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setHasRemoteVideo(false);
    setHasLocalVideo(false);
    setRemoteMediaStatus({ audio: true, video: true });
    setCallDuration(0);
  };

  // WebRTC PeerConnection Setup
  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('call:ice-candidate', {
          targetId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      const vTracks = stream ? stream.getVideoTracks() : [];
      const isActive = vTracks.length > 0 && vTracks[0].enabled && !vTracks[0].muted && vTracks[0].readyState === 'live';
      setHasRemoteVideo(!!isActive);

      vTracks.forEach(track => {
        track.onunmute = () => setHasRemoteVideo(true);
        track.onmute = () => setHasRemoteVideo(false);
        track.onended = () => setHasRemoteVideo(false);
      });
    };

    return pc;
  };

  // Helper to obtain media stream with graceful fallbacks
  const getMediaStream = async (requestedType) => {
    // 1. Try requested video + audio stream
    if (requestedType === 'video') {
      try {
        const fullStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        const vTracks = fullStream.getVideoTracks();
        setHasLocalVideo(vTracks.length > 0 && vTracks[0].enabled);
        return { stream: fullStream, effectiveType: 'video' };
      } catch (err) {
        console.warn('Video device unavailable or permission denied, falling back to audio-only stream:', err);
      }
    }

    // 2. Audio-only stream
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setHasLocalVideo(false);
      return { stream: audioStream, effectiveType: 'audio' };
    } catch (err) {
      console.warn('Audio device unavailable or permission denied, creating synthetic stream:', err);
    }

    // 3. Fallback canvas/audio stream if no physical hardware detected
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c1a';
      ctx.fillRect(0, 0, 640, 480);
      const synthStream = canvas.captureStream(10);
      setHasLocalVideo(false);
      return { stream: synthStream, effectiveType: 'audio' };
    } catch (e) {
      throw new Error('No media devices available');
    }
  };

  // Initiate a call
  const startCall = async (targetContact, type = 'video') => {
    if (!targetContact) return;
    const targetId = String(targetContact._id || targetContact.id);
    const targetName = targetContact.name || 'User';
    const targetRole = targetContact.role || 'Member';

    setPeerInfo({ id: targetId, name: targetName, role: targetRole });
    setCallState('outgoing_ringing');

    try {
      const { stream, effectiveType } = await getMediaStream(type);
      setCallType(effectiveType);
      setIsVideoOff(effectiveType === 'audio');

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(targetId);

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('call:initiate', {
        recipientId: targetId,
        callerName: user?.name || user?.email || 'User',
        callerRole: user?.role || 'User',
        callType: effectiveType,
        offer
      });
    } catch (err) {
      console.error('Error starting call:', err);
      resetCallState();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    stopRinging();
    if (!peerInfo || !socketRef.current?.pendingOffer) return;

    try {
      const { stream, effectiveType } = await getMediaStream(callType);
      setCallType(effectiveType);
      setIsVideoOff(effectiveType === 'audio');

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(peerInfo.id);

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(socketRef.current.pendingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('call:accept', {
        callerId: peerInfo.id,
        answer
      });

      setCallState('active');
      startDurationTimer();
    } catch (err) {
      console.error('Error accepting call:', err);
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    stopRinging();
    if (peerInfo && socketRef.current) {
      socketRef.current.emit('call:reject', {
        callerId: peerInfo.id,
        reason: 'Call declined'
      });
    }
    resetCallState();
  };

  // End active call
  const endCall = () => {
    if (peerInfo && socketRef.current) {
      socketRef.current.emit('call:end', {
        recipientId: peerInfo.id
      });
    }
    resetCallState();
  };

  // Toggle Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        if (peerInfo && socketRef.current) {
          socketRef.current.emit('call:toggle-media', {
            recipientId: peerInfo.id,
            mediaType: 'audio',
            enabled: audioTrack.enabled
          });
        }
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);

        if (peerInfo && socketRef.current) {
          socketRef.current.emit('call:toggle-media', {
            recipientId: peerInfo.id,
            mediaType: 'video',
            enabled: videoTrack.enabled
          });
        }
      }
    }
  };

  // Screen Share Stream Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera / normal view
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
        if (camStream) {
          const camVideoTrack = camStream.getVideoTracks()[0];
          const sender = pcRef.current?.getSenders()?.find(s => s.track?.kind === 'video');
          if (sender && camVideoTrack) {
            sender.replaceTrack(camVideoTrack);
          }
          localStreamRef.current = camStream;
          if (localVideoRef.current) localVideoRef.current.srcObject = camStream;
        }
      } catch (err) {
        console.warn('Could not restore camera stream:', err);
      } finally {
        setIsScreenSharing(false);
      }
    } else {
      // Switch to Screen Share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: 'always' }, 
          audio: false 
        });
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        if (pcRef.current) {
          const sender = pcRef.current.getSenders()?.find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          } else {
            pcRef.current.addTrack(screenVideoTrack, screenStream);
          }
        }

        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setIsScreenSharing(true);

        // When user stops sharing via browser bar ("Stop sharing")
        screenVideoTrack.onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          // User clicked Cancel on browser screen picker dialog - handle gracefully
          console.log('[INFO] Screen sharing canceled by user.');
        } else {
          console.warn('Screen share error:', err);
        }
        setIsScreenSharing(false);
      }
    }
  };

  return (
    <CallContext.Provider value={{
      callState,
      callType,
      peerInfo,
      isMuted,
      isVideoOff,
      isScreenSharing,
      remoteMediaStatus,
      callDuration,
      localVideoRef,
      remoteVideoRef,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleAudio,
      toggleVideo,
      toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
