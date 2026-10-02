const StudyPlan = require('../models/StudyPlan');
const Analysis  = require('../models/Analysis');
const { buildStudyPlan } = require('../services/studyPlanService');

const calculateProgress = (plan) => {
  const totalTasks = plan.tasks.length;
  if (totalTasks === 0) return 0;
  const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
  return Math.round((completedTasks / totalTasks) * 100);
};

exports.getProgressOverview = async (req, res) => {
  try {
    const { analysisId } = req.params;

    // Try to find an existing plan
    let plan = await StudyPlan.findOne({ analysisId });

    // Auto-create if it doesn't exist yet
    if (!plan) {
      const analysis = await Analysis.findById(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found. Please run an analysis first.' });
      }

      const planData = buildStudyPlan(analysis);
      plan = new StudyPlan({
        userId: req.user._id,
        analysisId: analysis._id,
        ...planData,
      });
      await plan.save();
    }

    const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
    const completedMilestones = plan.milestones.filter(m => m.status === 'completed').length;

    res.status(200).json({
      progressPercentage: plan.progressPercentage,
      totalTasks: plan.tasks.length,
      completedTasks,
      totalMilestones: plan.milestones.length,
      completedMilestones,
      targetRole: plan.targetRole,
      durationWeeks: plan.durationWeeks,
      status: plan.status,
      tasks: plan.tasks,
      milestones: plan.milestones,
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'pending', 'in-progress', 'completed'

    const plan = await StudyPlan.findOne({ 'tasks._id': taskId, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Task or Plan not found' });

    const task = plan.tasks.id(taskId);
    task.status = status;

    plan.progressPercentage = calculateProgress(plan);
    
    // Auto-complete plan if 100%
    if (plan.progressPercentage === 100) plan.status = 'completed';

    await plan.save();
    res.status(200).json(plan);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { status } = req.body; // 'pending', 'completed'

    const plan = await StudyPlan.findOne({ 'milestones._id': milestoneId, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Milestone or Plan not found' });

    const mx = plan.milestones.id(milestoneId);
    mx.status = status;

    await plan.save();
    res.status(200).json(plan);
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
