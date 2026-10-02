const mongoose = require('mongoose');

const learningPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  careerAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerAnalysis',
    required: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  targetRole: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  totalWeeks: {
    type: Number,
    default: 6
  },
  weeklyHours: {
    type: Number,
    default: 10
  },
  currentPhaseIndex: {
    type: Number,
    default: 0
  },
  currentWeekNumber: {
    type: Number,
    default: 1
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalHoursCompleted: {
    type: Number,
    default: 0
  },
  phases: [{
    phaseIndex: Number,
    name: {
      type: String,
      enum: ['Foundation', 'Practice', 'Application', 'Interview Preparation', 'Validation'],
      required: true
    },
    description: String,
    weekNumbers: [Number],
    status: {
      type: String,
      enum: ['upcoming', 'in_progress', 'completed'],
      default: 'upcoming'
    }
  }],
  weeks: [{
    weekNumber: Number,
    phase: String,
    title: String,
    mainObjective: String,
    expectedOutcome: String,
    plannedHours: Number,
    completedHours: { type: Number, default: 0 },
    taskCount: Number,
    completedTaskCount: { type: Number, default: 0 },
    isExpanded: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['completed', 'current', 'upcoming'],
      default: 'upcoming'
    }
  }],
  assumptions: {
    weeklyHours: Number,
    targetDate: String,
    sessionDuration: Number,
    prerequisiteOrder: String,
    replannedCount: { type: Number, default: 0 },
    lastReplannedAt: Date
  }
}, {
  timestamps: true,
  collection: 'learningplans'
});

learningPlanSchema.index({ userId: 1, careerAnalysisId: 1 });

module.exports = mongoose.model('LearningPlan', learningPlanSchema);
