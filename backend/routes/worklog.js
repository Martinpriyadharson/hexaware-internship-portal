const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const WorkLog = require('../models/WorkLog');
const Task = require('../models/Task');
const User = require('../models/User');

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Find assigned task for a candidate
async function findAssignedTaskForCandidate(candidateId, dateStr) {
  // Find active task assigned to candidate
  const tasks = await Task.find({ candidateId }).sort({ createdAt: -1 });
  if (tasks.length > 0) {
    // Return latest or pending/in-progress task
    const activeTask = tasks.find(t => t.status === 'In Progress' || t.status === 'Pending') || tasks[0];
    return activeTask;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidate Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/worklog/date/:date
// @route   GET /api/worklog/date/:date
// @desc    Candidate gets work log for date & auto-syncs assigned task info
router.get('/date/:date', auth, async (req, res) => {
  try {
    const candidateId = req.user.id;
    const dateStr = req.params.date || getTodayString();

    const assignedTask = await findAssignedTaskForCandidate(candidateId, dateStr);
    let log = await WorkLog.findOne({ candidateId, date: dateStr });

    const candUser = await User.findById(candidateId).lean();
    const startDate = candUser?.internshipStartDate ? new Date(candUser.internshipStartDate).toISOString().split('T')[0] : getTodayString();
    const endDate = candUser?.internshipEndDate ? new Date(candUser.internshipEndDate).toISOString().split('T')[0] : new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

    let logData = {};
    if (!log) {
      logData = {
        candidateId,
        date: dateStr,
        taskId: assignedTask ? assignedTask._id : null,
        taskName: assignedTask ? assignedTask.title : '',
        taskDescription: assignedTask ? (assignedTask.description || '') : '',
        hasAssignedTask: !!assignedTask,
        summary: '',
        githubUrl: '',
        demoUrl: '',
        attachments: [],
        mentorPrivateNotes: '',
        internshipStartDate: startDate,
        internshipEndDate: endDate
      };
    } else {
      const logObj = log.toObject();
      logObj.hasAssignedTask = !!(assignedTask || log.taskName);
      if (assignedTask && !logObj.taskName) {
        logObj.taskName = assignedTask.title;
        logObj.taskDescription = assignedTask.description || '';
      }
      logObj.internshipStartDate = startDate;
      logObj.internshipEndDate = endDate;
      logData = logObj;
    }

    res.json(logData);
  } catch (err) {
    console.error('Error fetching work log:', err);
    res.status(500).json({ msg: 'Server error fetching work log' });
  }
});

// @route   POST /api/worklog/save
// @desc    Candidate saves or updates work log for selected date
router.post('/save', auth, async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { date, taskName, taskDescription, summary, githubUrl, demoUrl, attachments } = req.body;
    const dateStr = date || getTodayString();

    const assignedTask = await findAssignedTaskForCandidate(candidateId, dateStr);

    let log = await WorkLog.findOne({ candidateId, date: dateStr });

    const finalTaskName = taskName !== undefined && taskName !== '' ? taskName : (assignedTask ? assignedTask.title : '');
    const finalTaskDesc = taskDescription !== undefined && taskDescription !== '' ? taskDescription : (assignedTask ? (assignedTask.description || '') : '');

    if (log) {
      log.taskName = finalTaskName;
      log.taskDescription = finalTaskDesc;
      if (assignedTask) log.taskId = assignedTask._id;
      log.summary = summary !== undefined ? summary : log.summary;
      log.githubUrl = githubUrl !== undefined ? githubUrl : log.githubUrl;
      log.demoUrl = demoUrl !== undefined ? demoUrl : log.demoUrl;
      if (attachments) log.attachments = attachments;
      await log.save();
    } else {
      log = new WorkLog({
        candidateId,
        date: dateStr,
        taskId: assignedTask ? assignedTask._id : null,
        taskName: finalTaskName,
        taskDescription: finalTaskDesc,
        summary: summary || '',
        githubUrl: githubUrl || '',
        demoUrl: demoUrl || '',
        attachments: attachments || []
      });
      await log.save();
    }

    res.json(log);
  } catch (err) {
    console.error('Error saving work log:', err);
    res.status(500).json({ msg: 'Server error saving work log' });
  }
});

// @route   GET /api/worklog/timeline
// @desc    Candidate gets internship timeline history
router.get('/timeline', auth, async (req, res) => {
  try {
    const candidateId = req.user.id;
    const logs = await WorkLog.find({ candidateId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching timeline:', err);
    res.status(500).json({ msg: 'Server error fetching timeline' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Mentor & Admin Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/worklog/candidate/:candidateId/date/:date
// @desc    Mentor/Admin views candidate's log for a specific date in read-only mode
router.get('/candidate/:candidateId/date/:date', [auth, roleAuth(['Mentor', 'Admin'])], async (req, res) => {
  try {
    const { candidateId, date } = req.params;
    const assignedTask = await findAssignedTaskForCandidate(candidateId, date);
    let log = await WorkLog.findOne({ candidateId, date });

    const candUser = await User.findById(candidateId).lean();
    const startDate = candUser?.internshipStartDate ? new Date(candUser.internshipStartDate).toISOString().split('T')[0] : getTodayString();
    const endDate = candUser?.internshipEndDate ? new Date(candUser.internshipEndDate).toISOString().split('T')[0] : new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

    if (!log && !assignedTask) {
      return res.json({
        candidateId,
        date,
        taskId: null,
        taskName: '',
        taskDescription: '',
        hasAssignedTask: false,
        summary: '',
        isSaved: false,
        githubUrl: '',
        demoUrl: '',
        attachments: [],
        mentorPrivateNotes: '',
        internshipStartDate: startDate,
        internshipEndDate: endDate
      });
    }

    if (!log) {
      return res.json({
        candidateId,
        date,
        taskId: assignedTask._id,
        taskName: assignedTask.title,
        taskDescription: assignedTask.description || '',
        hasAssignedTask: true,
        summary: '',
        isSaved: false,
        githubUrl: '',
        demoUrl: '',
        attachments: [],
        mentorPrivateNotes: '',
        internshipStartDate: startDate,
        internshipEndDate: endDate
      });
    }

    const logObj = log.toObject();
    logObj.isSaved = true;
    logObj.hasAssignedTask = !!(assignedTask || log.taskName);
    if (assignedTask && !logObj.taskName) {
      logObj.taskName = assignedTask.title;
      logObj.taskDescription = assignedTask.description || '';
    }
    logObj.internshipStartDate = startDate;
    logObj.internshipEndDate = endDate;

    res.json(logObj);
  } catch (err) {
    console.error('Error fetching candidate work log:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/worklog/candidate/:candidateId/timeline
// @desc    Mentor/Admin views full timeline history for a candidate
router.get('/candidate/:candidateId/timeline', [auth, roleAuth(['Mentor', 'Admin'])], async (req, res) => {
  try {
    const { candidateId } = req.params;
    const logs = await WorkLog.find({ candidateId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching candidate timeline:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/worklog/candidate/:candidateId/date/:date/notes
// @desc    Mentor adds/updates private notes
router.put('/candidate/:candidateId/date/:date/notes', [auth, roleAuth(['Mentor', 'Admin'])], async (req, res) => {
  try {
    const { candidateId, date } = req.params;
    const { mentorPrivateNotes } = req.body;

    let log = await WorkLog.findOne({ candidateId, date });
    if (!log) {
      const assignedTask = await findAssignedTaskForCandidate(candidateId, date);
      log = new WorkLog({
        candidateId,
        date,
        taskId: assignedTask ? assignedTask._id : null,
        taskName: assignedTask ? assignedTask.title : '',
        taskDescription: assignedTask ? (assignedTask.description || '') : '',
        mentorPrivateNotes: mentorPrivateNotes || '',
        mentorNoteUpdatedBy: req.user.id,
        mentorNoteUpdatedAt: new Date()
      });
    } else {
      log.mentorPrivateNotes = mentorPrivateNotes || '';
      log.mentorNoteUpdatedBy = req.user.id;
      log.mentorNoteUpdatedAt = new Date();
    }

    await log.save();
    res.json(log);
  } catch (err) {
    console.error('Error saving mentor private notes:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
