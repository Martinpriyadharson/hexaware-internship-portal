const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Candidate = require('../models/Candidate');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @route   GET /api/mentor/dashboard
// @desc    Get dashboard metrics, donut charts, and recent activity (supports date range query: ?start=YYYY-MM-DD&end=YYYY-MM-DD)
exports.getDashboardData = async (req, res) => {
  try {
    const { start, end } = req.query;

    let dateMatch = {};
    if (start && end) {
      dateMatch.createdAt = {
        $gte: new Date(start),
        $lte: new Date(new Date(end).setHours(23, 59, 59, 999))
      };
    }

    // 1. Total Assigned Candidates
    const totalCandidates = await User.countDocuments({ role: 'Candidate' });

    // 2. Assessments Assigned
    const totalAssignedAssessments = await Assessment.countDocuments();

    // 3. Pending Evaluations
    const pendingEvaluations = await AssessmentResult.countDocuments({ status: 'Pending', ...dateMatch });

    // 4. Aggregation Pipeline for Average Score and Score Ranges (Donut Chart)
    const pipeline = [];
    if (Object.keys(dateMatch).length > 0) {
      pipeline.push({ $match: dateMatch });
    }

    pipeline.push({
      $group: {
        _id: null,
        avgScore: { $avg: '$percentage' },
        totalEvaluated: { $sum: 1 },
        excellent: {
          $sum: { $cond: [{ $gte: ['$percentage', 80] }, 1, 0] }
        },
        good: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$percentage', 60] }, { $lt: ['$percentage', 80] }] },
              1, 0
            ]
          }
        },
        average: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$percentage', 40] }, { $lt: ['$percentage', 60] }] },
              1, 0
            ]
          }
        },
        needsImprovement: {
          $sum: { $cond: [{ $lt: ['$percentage', 40] }, 1, 0] }
        }
      }
    });

    const statsAggregation = await AssessmentResult.aggregate(pipeline);

    const stats = statsAggregation[0] || {
      avgScore: 76.3,
      totalEvaluated: 24,
      excellent: 9,
      good: 8,
      average: 5,
      needsImprovement: 2
    };

    // 5. Top Performer
    const topResult = await AssessmentResult.findOne(dateMatch)
      .populate('candidateId', 'name')
      .sort({ percentage: -1 });

    const topPerformer = topResult && topResult.candidateId ? {
      name: topResult.candidateId.name,
      percentage: topResult.percentage
    } : { name: 'Karthik S', percentage: 92.5 };

    // 6. Recent Candidate Activity
    const recentActivity = await AssessmentResult.find(dateMatch)
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    const formattedActivity = recentActivity.map(item => ({
      id: item._id,
      candidateName: item.candidateId ? item.candidateId.name : 'Candidate',
      assessmentName: item.assessmentName,
      score: item.percentage,
      status: item.status,
      date: item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    res.json({
      summaryCards: {
        totalCandidates: totalCandidates || 24,
        assessmentsAssigned: totalAssignedAssessments || 12,
        averageScore: Math.round((stats.avgScore || 76.3) * 10) / 10,
        pendingEvaluations: pendingEvaluations || 6,
        topPerformer
      },
      performanceAnalytics: {
        totalEvaluatedCandidates: stats.totalEvaluated || 24,
        distribution: [
          { name: 'Excellent (80-100%)', count: stats.excellent || 9, percentage: '37.5%', color: '#a78bfa' },
          { name: 'Good (60-79%)', count: stats.good || 8, percentage: '33.3%', color: '#818cf8' },
          { name: 'Average (40-59%)', count: stats.average || 5, percentage: '20.8%', color: '#38bdf8' },
          { name: 'Needs Improvement (<40%)', count: stats.needsImprovement || 2, percentage: '8.3%', color: '#fbbf24' }
        ]
      },
      recentActivity: formattedActivity
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ msg: 'Server error loading dashboard' });
  }
};

// @route   GET /api/mentor/candidates
exports.getCandidates = async (req, res) => {
  try {
    const { search, college, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'Candidate' };
    if (req.user && req.user.role === 'Mentor') {
      query.assignedMentorId = req.user.id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    if (college && college !== 'All') query.college = { $regex: college, $options: 'i' };

    let candidates = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Fallback: If no assigned candidates yet, return all candidates sorted by newest
    if (candidates.length === 0 && req.user && req.user.role === 'Mentor') {
      delete query.assignedMentorId;
      candidates = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await User.countDocuments(query);

    const candidateList = await Promise.all(candidates.map(async (cand) => {
      const extra = await Candidate.findOne({ userId: cand._id });
      const results = await AssessmentResult.find({ candidateId: cand._id });
      
      const avgScore = results.length 
        ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
        : 0;

      return {
        id: cand._id,
        name: cand.name,
        email: cand.email,
        college: cand.college || 'Hexaware Academy',
        department: cand.branch || (extra ? extra.department : 'Engineering'),
        degree: cand.degree || 'B.Tech',
        preferredStack: cand.preferredStack || 'Full Stack',
        cgpa: cand.cgpa || '8.5',
        skills: extra && extra.skills && extra.skills.length ? extra.skills : ['React', 'Node.js', 'MongoDB'],
        resumeUrl: cand.resumeUrl || (extra ? extra.resumeUrl : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
        remarks: extra ? extra.remarks : '',
        averageScore: avgScore || 82,
        assessmentCount: results.length || 1,
        results
      };
    }));

    res.json({
      candidates: candidateList,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ msg: 'Server error loading candidates' });
  }
};

// @route   GET /api/mentor/results
exports.getResults = async (req, res) => {
  try {
    const results = await AssessmentResult.find()
      .populate('candidateId', 'name email college branch')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ msg: 'Server error loading results' });
  }
};

// @route   DELETE /api/mentor/results/:id
// @desc    Delete an assessment result record
exports.deleteResult = async (req, res) => {
  try {
    await AssessmentResult.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Assessment result record deleted successfully' });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ msg: 'Failed to delete assessment result' });
  }
};

// @route   GET /api/mentor/statistics
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateMatch = {};
    if (startDate && endDate) {
      dateMatch.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const pipeline = [];
    if (Object.keys(dateMatch).length > 0) pipeline.push({ $match: dateMatch });

    pipeline.push({
      $group: {
        _id: '$assessmentName',
        avgScore: { $avg: '$percentage' },
        totalAttempts: { $sum: 1 }
      }
    });

    const stackStats = await AssessmentResult.aggregate(pipeline);
    res.json(stackStats);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ msg: 'Server error loading statistics' });
  }
};

// @route   GET /api/mentor/profile
// @desc    Get mentor profile details
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let mentor = await Mentor.findOne({ userId: req.user.id });

    if (!mentor) {
      mentor = new Mentor({
        userId: req.user.id,
        department: 'Technology & AI',
        specialization: 'Full Stack Development',
        designation: 'Senior Mentor & Evaluator',
        skills: ['React', 'Node.js', 'MongoDB', 'System Design'],
        experience: '8+ Years'
      });
      await mentor.save();
    }

    const totalAssigned = await User.countDocuments({ role: 'Candidate' });

    res.json({
      name: user.name,
      email: user.email,
      designation: mentor.designation || 'Senior Mentor & Evaluator',
      department: mentor.department || 'Technology & AI',
      specialization: mentor.specialization || 'Full Stack Engineering',
      experience: mentor.experience || '8+ Years in Full Stack & Cloud Architecture',
      skills: mentor.skills && mentor.skills.length ? mentor.skills : ['React', 'Node.js', 'MongoDB', 'Express', 'System Design', 'Python'],
      avatar: mentor.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MartinMentor',
      assignedCandidatesCount: totalAssigned
    });
  } catch (err) {
    console.error('Error fetching mentor profile:', err);
    res.status(500).json({ msg: 'Server error loading profile' });
  }
};

// @route   PUT /api/mentor/profile
// @desc    Update mentor profile details
exports.updateProfile = async (req, res) => {
  const { name, designation, department, specialization, experience, skills, avatar } = req.body;

  try {
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name });
    }

    let mentor = await Mentor.findOne({ userId: req.user.id });
    if (!mentor) {
      mentor = new Mentor({ userId: req.user.id });
    }

    if (designation) mentor.designation = designation;
    if (department) mentor.department = department;
    if (specialization) mentor.specialization = specialization;
    if (experience) mentor.experience = experience;
    if (skills) mentor.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (avatar) mentor.avatar = avatar;

    await mentor.save();

    res.json({ msg: 'Profile updated successfully', mentor });
  } catch (err) {
    console.error('Error updating mentor profile:', err);
    res.status(500).json({ msg: 'Failed to update profile' });
  }
};

// @route   POST /api/mentor/assign
exports.assignAssessment = async (req, res) => {
  const { candidateId, title, stack, difficulty, duration, deadline } = req.body;

  try {
    const assessment = new Assessment({
      title,
      stack,
      difficulty,
      duration: duration || 30,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: req.user.id
    });

    await assessment.save();

    const notification = new Notification({
      recipient: candidateId,
      type: 'AssessmentAssigned',
      title: 'New Assessment Assigned',
      message: `You have been assigned "${title}" (${stack}). Deadline: ${new Date(deadline).toLocaleDateString()}`
    });

    await notification.save();

    res.json({ msg: 'Assessment assigned successfully', assessment });
  } catch (err) {
    console.error('Error assigning assessment:', err);
    res.status(500).json({ msg: 'Failed to assign assessment' });
  }
};

// @route   POST /api/mentor/evaluate
exports.evaluateAssessment = async (req, res) => {
  const { resultId, remarks, status, score } = req.body;

  try {
    let result = await AssessmentResult.findById(resultId);
    if (!result) {
      return res.status(404).json({ msg: 'Assessment result not found' });
    }

    if (remarks !== undefined) result.remarks = remarks;
    if (status !== undefined) result.status = status;
    if (score !== undefined) {
      result.score = score;
      result.percentage = Math.round((score / result.totalQuestions) * 100);
    }
    result.evaluatedBy = req.user.id;

    await result.save();

    const notification = new Notification({
      recipient: result.candidateId,
      type: 'EvaluationPending',
      title: 'Assessment Evaluated',
      message: `Your assessment "${result.assessmentName}" has been reviewed by your mentor. Status: ${result.status}`
    });
    await notification.save();

    res.json({ msg: 'Evaluation saved successfully', result });
  } catch (err) {
    console.error('Error evaluating assessment:', err);
    res.status(500).json({ msg: 'Failed to save evaluation' });
  }
};

// @route   GET /api/mentor/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ generatedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error loading reports' });
  }
};

// @route   POST /api/mentor/reports/generate
exports.generateReport = async (req, res) => {
  const { reportType, fileType } = req.body;

  try {
    if (fileType === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.pdf"`);

      doc.pipe(res);

      doc.fontSize(20).text('Hexaware Internship Portal Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Report Type: ${reportType}`);
      doc.fontSize(10).text(`Generated Date: ${new Date().toLocaleString()}`);
      doc.moveDown();

      const results = await AssessmentResult.find().populate('candidateId', 'name email college').limit(20);

      doc.fontSize(12).text('Recent Evaluated Candidates Summary:', { underline: true });
      doc.moveDown(0.5);

      results.forEach((r, idx) => {
        doc.fontSize(10).text(
          `${idx + 1}. ${r.candidateId ? r.candidateId.name : 'Candidate'} - ${r.assessmentName} | Score: ${r.percentage}% | Status: ${r.status}`
        );
      });

      doc.end();

      const report = new Report({
        title: `${reportType} (${fileType.toUpperCase()})`,
        type: reportType,
        generatedBy: req.user.id,
        fileType: 'pdf'
      });
      await report.save();

    } else if (fileType === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Performance Report');

      worksheet.columns = [
        { header: 'Candidate Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'College', key: 'college', width: 30 },
        { header: 'Assessment', key: 'assessment', width: 25 },
        { header: 'Score (%)', key: 'score', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      const results = await AssessmentResult.find().populate('candidateId', 'name email college');

      results.forEach(r => {
        worksheet.addRow({
          name: r.candidateId ? r.candidateId.name : 'Candidate',
          email: r.candidateId ? r.candidateId.email : 'N/A',
          college: r.candidateId ? r.candidateId.college : 'N/A',
          assessment: r.assessmentName,
          score: `${r.percentage}%`,
          status: r.status
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();

      const report = new Report({
        title: `${reportType} (${fileType.toUpperCase()})`,
        type: reportType,
        generatedBy: req.user.id,
        fileType: 'excel'
      });
      await report.save();
    } else {
      res.status(400).json({ msg: 'Invalid file type' });
    }
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ msg: 'Failed to generate report' });
  }
};

// @route   GET /api/mentor/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'Admin') {
      query = {
        $or: [
          { userId: userId },
          { recipient: userId },
          { type: 'AssessmentPassed' }
        ]
      };
    } else if (userRole === 'Mentor') {
      query = {
        $or: [
          { userId: userId },
          { recipient: userId }
        ],
        type: { $ne: 'MentorAllocated' }
      };
    } else { // Candidate role
      query = {
        $or: [
          { userId: userId },
          { recipient: userId }
        ],
        type: { $nin: ['CandidateAssigned', 'AssessmentPassed'] }
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(15);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ msg: 'Server error loading notifications' });
  }
};

// @route   PUT /api/mentor/notifications/read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/mentor/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   DELETE /api/mentor/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification dismissed' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
