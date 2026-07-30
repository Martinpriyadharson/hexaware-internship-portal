const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action:    { type: String, enum: ['edit', 'delete_everyone', 'delete_me', 'undo_edit', 'redo_edit', 'undo_delete'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} }
});

const SnapshotSchema = new mongoose.Schema({
  text:          { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  attachmentName:{ type: String, default: '' },
  attachmentType:{ type: String, default: '' },
  attachmentSize:{ type: Number, default: 0 },
  audioUrl:      { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },
  codeSnippet:   { type: String, default: '' },
  codeLanguage:  { type: String, default: 'javascript' },
  reactions:     { type: mongoose.Schema.Types.Mixed, default: [] },
  status:        { type: String, default: 'delivered' },
  seenAt:        { type: Date },
  savedAt:       { type: Date, default: Date.now }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  text:          { type: String, default: '' },
  status:        { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  deliveredAt:   { type: Date },
  seenAt:        { type: Date },

  attachmentUrl:  { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  attachmentType: { type: String, default: '' },
  attachmentSize: { type: Number, default: 0 },
  audioUrl:       { type: String, default: '' },
  audioDuration:  { type: Number, default: 0 },
  codeSnippet:    { type: String, default: '' },
  codeLanguage:   { type: String, default: 'javascript' },

  replyToId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  isPinned:  { type: Boolean, default: false },
  isStarred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Lifecycle
  deletedForEveryone: { type: Boolean, default: false },
  deletedForMe:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Edit history (full record of previous text values)
  editHistory: [{
    text:     String,
    editedAt: { type: Date, default: Date.now }
  }],

  // Undo/Redo snapshots
  // undoStack[last] = state before the most recent mutating action
  // redoStack[last] = state that was undone (available for redo)
  undoSnapshot: { type: SnapshotSchema, default: null },
  redoSnapshot: { type: SnapshotSchema, default: null },

  // Undo/Redo window timestamps (set server-side)
  undoExpiresAt: { type: Date, default: null }, // 5s window
  redoExpiresAt: { type: Date, default: null }, // 5s window after undo

  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji:  String
  }],

  isRead: { type: Boolean, default: false },

  // Secure audit log
  auditLog: [AuditLogSchema]

}, { timestamps: true });

// ── Helpers (used in route layer) ──────────────────────────────────────────
MessageSchema.methods.canEdit = function () {
  const AGE_MS = 15 * 60 * 1000; // 15 minutes
  return Date.now() - this.createdAt.getTime() <= AGE_MS;
};

MessageSchema.methods.canDeleteForEveryone = function () {
  const AGE_MS = 30 * 60 * 1000; // 30 minutes
  return Date.now() - this.createdAt.getTime() <= AGE_MS;
};

MessageSchema.methods.canUndo = function () {
  return this.undoExpiresAt && Date.now() <= this.undoExpiresAt.getTime();
};

MessageSchema.methods.canRedo = function () {
  return this.redoExpiresAt && Date.now() <= this.redoExpiresAt.getTime();
};

// Capture a full content snapshot of the current state
MessageSchema.methods.captureSnapshot = function () {
  return {
    text:          this.text,
    attachmentUrl: this.attachmentUrl,
    attachmentName:this.attachmentName,
    attachmentType:this.attachmentType,
    attachmentSize:this.attachmentSize,
    audioUrl:      this.audioUrl,
    audioDuration: this.audioDuration,
    codeSnippet:   this.codeSnippet,
    codeLanguage:  this.codeLanguage,
    reactions:     JSON.parse(JSON.stringify(this.reactions)),
    status:        this.status,
    seenAt:        this.seenAt,
    savedAt:       new Date()
  };
};

// Restore state from a snapshot
MessageSchema.methods.applySnapshot = function (snap) {
  this.text          = snap.text;
  this.attachmentUrl = snap.attachmentUrl;
  this.attachmentName= snap.attachmentName;
  this.attachmentType= snap.attachmentType;
  this.attachmentSize= snap.attachmentSize;
  this.audioUrl      = snap.audioUrl;
  this.audioDuration = snap.audioDuration;
  this.codeSnippet   = snap.codeSnippet;
  this.codeLanguage  = snap.codeLanguage;
  this.reactions     = snap.reactions;
  this.status        = snap.status;
  this.seenAt        = snap.seenAt;
  this.deletedForEveryone = false;
};

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
