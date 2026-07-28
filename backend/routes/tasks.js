const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// @route   POST /api/tasks/create
// @desc    Mentor assigns a new task to a candidate
// @access  Private (Mentor)
router.post('/create', auth, async (req, res) => {
  const { candidateId, title, description, domain, dueDate } = req.body;

  try {
    if (!candidateId || !title) {
      return res.status(400).json({ msg: 'Candidate selection and Task Title are required' });
    }

    const task = new Task({
      candidateId,
      mentorId: req.user.id,
      title,
      description: description || '',
      domain: domain || 'Development',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'Pending'
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ msg: 'Server error creating task' });
  }
});

// @route   GET /api/tasks/candidate
// @desc    Candidate fetches all tasks assigned to them
// @access  Private (Candidate)
router.get('/candidate', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ candidateId: req.user.id })
      .populate('mentorId', 'name email designation department')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching candidate tasks:', err);
    res.status(500).json({ msg: 'Server error loading tasks' });
  }
});

// @route   GET /api/tasks/mentor
// @desc    Mentor fetches all tasks assigned to candidates
// @access  Private (Mentor)
router.get('/mentor', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ mentorId: req.user.id })
      .populate('candidateId', 'name email college preferredStack')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching mentor tasks:', err);
    res.status(500).json({ msg: 'Server error loading tasks' });
  }
});

// @route   PUT /api/tasks/:id/submit
// @desc    Candidate submits code deliverable / GitHub link for a task
// @access  Private (Candidate)
router.put('/:id/submit', auth, async (req, res) => {
  const { deliverableUrl, submissionNotes } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to submit this task' });
    }

    task.deliverableUrl = deliverableUrl || task.deliverableUrl;
    task.submissionNotes = submissionNotes || task.submissionNotes;
    task.status = 'Completed';

    await task.save();
    res.json(task);
  } catch (err) {
    console.error('Error submitting task deliverable:', err);
    res.status(500).json({ msg: 'Server error submitting task' });
  }
});

module.exports = router;
