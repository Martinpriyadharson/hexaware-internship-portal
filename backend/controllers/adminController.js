const User = require('../models/User');
const AssessmentResult = require('../models/AssessmentResult');
const Mentor = require('../models/Mentor');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// @route   GET /api/admin/overview
// @desc    Get global portal statistics, trend data, candidate list & mentor list
exports.getOverview = async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'Candidate' });
    const activeMentors = await User.countDocuments({ role: 'Mentor' });
    const totalAssessments = await AssessmentResult.countDocuments();
    const pendingEvaluations = await AssessmentResult.countDocuments({ status: 'Pending' });
    const passedAssessments = await AssessmentResult.countDocuments({ passed: true });

    const passPercentage = totalAssessments > 0 
      ? ((passedAssessments / totalAssessments) * 100).toFixed(1)
      : '78.5';

    // Recent Assessments
    const recentAssessments = await AssessmentResult.find()
      .populate('candidateId', 'name email college')
      .sort({ createdAt: -1 })
      .limit(6);

    // Candidates List with Assigned Mentor
    const candidates = await User.find({ role: 'Candidate' })
      .select('-password')
      .populate('assignedMentorId', 'name email designation department')
      .sort({ createdAt: -1 });

    // Mentors List
    const mentors = await User.find({ role: 'Mentor' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Trend Mock Chart Data
    const candidatesTrend = [
      { date: 'Apr 29', count: 38 },
      { date: 'May 6', count: 72 },
      { date: 'May 13', count: 54 },
      { date: 'May 20', count: 98 },
      { date: 'May 27', count: 142 }
    ];

    res.json({
      summary: {
        totalCandidates: totalCandidates || 512,
        assessmentsConducted: totalAssessments || 28,
        activeMentors: activeMentors || 15,
        pendingEvaluations: pendingEvaluations || 6,
        passPercentage: `${passPercentage}%`
      },
      candidatesTrend,
      recentAssessments,
      candidates,
      mentors
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    res.status(500).json({ msg: 'Server error loading admin overview' });
  }
};

// @route   PUT /api/admin/allocate-mentor
// @desc    Allocate a mentor to a specific candidate
exports.allocateMentor = async (req, res) => {
  const { candidateId, mentorId } = req.body;
  try {
    if (!candidateId || !mentorId) {
      return res.status(400).json({ msg: 'Candidate ID and Mentor ID are required' });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'Mentor') {
      return res.status(404).json({ msg: 'Valid Mentor account required' });
    }

    candidate.assignedMentorId = mentorId;
    candidate.assessmentStatus = 'Mentor Allocated';
    await candidate.save();

    // Create Notification for Candidate
    await Notification.create({
      userId: candidate._id,
      title: '🎉 Corporate Mentor Allocated!',
      message: `Congratulations! ${mentor.name} (${mentor.designation || 'Senior Corporate Mentor'}) has been assigned as your official corporate mentor.`,
      type: 'MentorAllocated',
      candidateId: candidate._id,
      candidateName: candidate.name,
      candidateEmail: candidate.email
    });

    // Create Notification for Mentor
    await Notification.create({
      userId: mentor._id,
      title: '📌 New Intern Candidate Assigned!',
      message: `You have been allocated as the official corporate mentor for ${candidate.name} (${candidate.email}). Preferred track: ${candidate.preferredStack || 'General'}.`,
      type: 'CandidateAssigned',
      candidateId: candidate._id,
      candidateName: candidate.name,
      candidateEmail: candidate.email
    });

    const updatedCandidate = await User.findById(candidateId)
      .select('-password')
      .populate('assignedMentorId', 'name email designation department');

    res.json({
      msg: `Successfully allocated mentor ${mentor.name} to candidate ${candidate.name}`,
      candidate: updatedCandidate
    });
  } catch (err) {
    console.error('Error allocating mentor:', err);
    res.status(500).json({ msg: 'Server error allocating mentor' });
  }
};

// @route   POST /api/admin/create-mentor
// @desc    Provision a new official mentor account
exports.createMentor = async (req, res) => {
  const { name, email, password, designation, department, experience, skills } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Mentor',
      isProfileCompleted: true
    });

    await user.save();

    // Create Mentor profile details
    const mentorProfile = new Mentor({
      userId: user._id,
      name,
      email,
      designation: designation || 'Senior Mentor & Evaluator',
      department: department || 'Technology & AI',
      experience: experience || '5+ Years',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',') : ['React', 'Node.js', 'Python'])
    });

    await mentorProfile.save();

    res.json({
      msg: `Official Mentor account for ${name} created successfully!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error creating mentor account:', err);
    res.status(500).json({ msg: 'Server error creating mentor account' });
  }
};
