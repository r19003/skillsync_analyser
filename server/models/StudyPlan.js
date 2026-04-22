const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: String },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  weekNumber: { type: Number, required: true }
});

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetWeek: { type: Number },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

const StudyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
  
  targetRole: { type: String, required: true },
  skillGaps: [{ type: String }],
  
  prioritySkills: {
    high: [{ type: String }],
    medium: [{ type: String }],
    low: [{ type: String }]
  },
  
  durationWeeks: { type: Number, default: 4 },
  tasks: [TaskSchema],
  milestones: [MilestoneSchema],
  
  progressPercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
