const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Environment-aware Allowed Origins Configuration for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hexaware-internship-portal.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching allowed origins / vercel.app domains
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || (typeof origin === 'string' && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: Access denied for origin ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Store io instance on app context for REST API access
app.set('io', io);

// Security Middleware - Secure HTTP Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal';
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB Database connected successfully.'))
  .catch((err) => console.error('MongoDB database connection error:', err));

const UserPresence = require('./models/UserPresence');
const JWT_SECRET = process.env.JWT_SECRET || 'hexaware_secret_jwt_token_key_123!';

// Socket.IO Connection & Event Handlers
io.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.user?.id || decoded.id;
    } catch (err) {}
  }

  if (userId) {
    socket.join(String(userId));
    
    // Preserve custom status if set, otherwise default to Available
    let existing = await UserPresence.findOne({ userId });
    let statusToSet = 'Available';
    if (existing && existing.currentStatus && existing.currentStatus !== 'Offline') {
      statusToSet = existing.currentStatus;
    }

    const updatedPresence = await UserPresence.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          isOnline: true, 
          currentStatus: statusToSet, 
          socketId: socket.id, 
          lastActivity: new Date(),
          lastSeen: new Date()
        } 
      },
      { upsert: true, new: true }
    );

    // Broadcast user online event
    io.emit('presence:update', {
      userId,
      currentStatus: updatedPresence.currentStatus,
      customStatus: updatedPresence.customStatus || '',
      isOnline: true,
      lastSeen: new Date()
    });
  }

  // Typing Indicators
  socket.on('presence:typing', ({ recipientId, isTyping }) => {
    if (recipientId && userId) {
      io.to(String(recipientId)).emit('presence:typing', {
        senderId: userId,
        isTyping
      });
    }
  });

  // Manual Status Override
  socket.on('presence:statusChange', async ({ currentStatus, customStatus }) => {
    if (userId) {
      const isOnline = currentStatus !== 'Offline' && currentStatus !== 'Appear Offline';
      const updated = await UserPresence.findOneAndUpdate(
        { userId },
        { $set: { currentStatus, customStatus, isOnline, lastSeen: new Date() } },
        { new: true, upsert: true }
      );

      io.emit('presence:update', {
        userId,
        currentStatus: updated.currentStatus,
        customStatus: updated.customStatus,
        isOnline: updated.isOnline,
        lastSeen: updated.lastSeen
      });
    }
  });

  // ── WebRTC Real-Time Call Signaling ───────────────────────────────────────
  socket.on('call:initiate', ({ recipientId, callerName, callerRole, callType, offer }) => {
    if (recipientId && userId) {
      io.to(String(recipientId)).emit('call:incoming', {
        callerId: userId,
        callerName,
        callerRole,
        callType,
        offer
      });
    }
  });

  socket.on('call:accept', ({ callerId, answer }) => {
    if (callerId && userId) {
      io.to(String(callerId)).emit('call:accepted', {
        acceptorId: userId,
        answer
      });
    }
  });

  socket.on('call:reject', ({ callerId, reason }) => {
    if (callerId && userId) {
      io.to(String(callerId)).emit('call:rejected', {
        rejectorId: userId,
        reason: reason || 'Call declined'
      });
    }
  });

  socket.on('call:ice-candidate', ({ recipientId, candidate }) => {
    if (recipientId && userId) {
      io.to(String(recipientId)).emit('call:ice-candidate', {
        senderId: userId,
        candidate
      });
    }
  });

  socket.on('call:end', ({ recipientId }) => {
    if (recipientId && userId) {
      io.to(String(recipientId)).emit('call:ended', {
        senderId: userId
      });
    }
  });

  socket.on('call:toggle-media', ({ recipientId, mediaType, enabled }) => {
    if (recipientId && userId) {
      io.to(String(recipientId)).emit('call:media-toggled', {
        senderId: userId,
        mediaType,
        enabled
      });
    }
  });

  // Disconnect Handler
  socket.on('disconnect', async () => {
    if (userId) {
      const updated = await UserPresence.findOneAndUpdate(
        { userId },
        { $set: { isOnline: false, currentStatus: 'Offline', lastSeen: new Date() } },
        { new: true }
      );

      io.emit('presence:update', {
        userId,
        currentStatus: 'Offline',
        isOnline: false,
        lastSeen: new Date()
      });
    }
  });
});

// Centralized Error Handler Import
const errorHandler = require('./middleware/errorHandler');

// Routes mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/presence', require('./routes/presence'));
app.use('/api/worklog', require('./routes/worklog'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Centralized Error Handling Middleware (must be registered after routes)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});
