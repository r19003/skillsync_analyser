const StudyPlan = require('../models/StudyPlan');

const calculateProgress = (plan) => {
  const totalTasks = plan.tasks.length;
  if (totalTasks === 0) return 0;
  const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
  return Math.round((completedTasks / totalTasks) * 100);
};

exports.getProgressOverview = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ analysisId: req.params.analysisId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    res.status(200).json({
      progressPercentage: plan.progressPercentage,
      totalTasks: plan.tasks.length,
      completedTasks: plan.tasks.filter(t => t.status === 'completed').length,
      tasks: plan.tasks,
      milestones: plan.milestones
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
