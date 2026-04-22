/**
 * deepReportController.js
 *
 * POST /api/deep-report/generate   — trigger full Grok + Gemini generation
 * GET  /api/deep-report/:analysisId — fetch existing report
 */

const { generateUnifiedReport } = require('../services/unifiedReportService');
const AIReport     = require('../models/AIReport');
const AdvStudyPlan = require('../models/AdvStudyPlan');

// ─────────────────────────────────────────────────────────────────────
// POST /api/deep-report/generate
// ─────────────────────────────────────────────────────────────────────
exports.generateDeepReport = async (req, res) => {
  try {
    const { analysisId, targetRole, userGoal, durationWeeks = 4 } = req.body;
    const userId = req.user._id.toString();

    if (!analysisId) {
      return res.status(400).json({ success: false, message: 'analysisId is required' });
    }

    const { report, studyPlan } = await generateUnifiedReport({
      analysisId,
      userId,
      targetRole,
      userGoal,
      durationWeeks
    });

    res.status(201).json({
      success: true,
      report,
      studyPlan,
      meta: {
        grokUsed:     report.grokUsed,
        geminiUsed:   report.geminiUsed,
        fallbackUsed: report.fallbackUsed
      }
    });
  } catch (err) {
    console.error('[deepReportController] Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate report' });
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/deep-report/:analysisId
// ─────────────────────────────────────────────────────────────────────
exports.getDeepReport = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user._id.toString();

    const report = await AIReport.findOne({ analysisId, userId })
      .populate('studyPlanId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'No deep report found for this analysis. Generate one first.' });
    }

    // Also fetch full study plan if linked
    let studyPlan = null;
    if (report.studyPlanId) {
      studyPlan = await AdvStudyPlan.findById(report.studyPlanId);
    }

    res.status(200).json({ success: true, report, studyPlan });
  } catch (err) {
    console.error('[deepReportController] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/deep-report/task/:taskId
// Toggle study plan task status
// ─────────────────────────────────────────────────────────────────────
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, studyPlanId } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const plan = await AdvStudyPlan.findById(studyPlanId);
    if (!plan || plan.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }

    // Find task inside weeklyPlan
    let taskFound = false;
    for (const week of plan.weeklyPlan) {
      const task = week.tasks.id(taskId);
      if (task) {
        task.status = status;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({ success: false, message: 'Task not found in any week' });
    }

    // Recalculate overall progress
    const allTasks = plan.weeklyPlan.flatMap(w => w.tasks);
    const completed = allTasks.filter(t => t.status === 'completed').length;
    plan.progressPercentage = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
    if (plan.progressPercentage === 100) plan.status = 'completed';

    await plan.save();
    res.status(200).json({ success: true, progressPercentage: plan.progressPercentage, taskId, status });
  } catch (err) {
    console.error('[deepReportController] Task update error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/deep-report/milestone/:milestoneId
// ─────────────────────────────────────────────────────────────────────
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { status, studyPlanId } = req.body;

    const plan = await AdvStudyPlan.findById(studyPlanId);
    if (!plan || plan.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.status = status;
    await plan.save();
    res.status(200).json({ success: true, milestoneId, status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update milestone' });
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/deep-report/study-plan/:planId
// Fetch an AdvStudyPlan directly by its _id
// ─────────────────────────────────────────────────────────────────────
exports.getStudyPlanById = async (req, res) => {
  try {
    const plan = await AdvStudyPlan.findById(req.params.planId);
    if (!plan || plan.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }
    res.status(200).json({ success: true, studyPlan: plan });
  } catch (err) {
    console.error('[getStudyPlanById]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch study plan' });
  }
};
