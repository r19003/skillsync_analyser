const mongoose = require('mongoose');

const learningTaskSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPlan',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekNumber: {
    type: Number,
    required: true,
    index: true
  },
  dayNumber: {
    type: Number, // 1 to 7
    default: 1
  },
  date: {
    type: Date
  },
  skill: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  whyThisMatters: {
    type: String,
    required: true
  },
  taskInstruction: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 45
  },
  type: {
    type: String,
    enum: ['learn', 'practice', 'prove', 'assess'],
    default: 'learn'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  resourceId: {
    type: String,
    default: null
  },
  resourceDetails: {
    title: String,
    url: String,
    provider: String,
    resourceType: String,
    selectionReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending',
    index: true
  },
  actualMinutesSpent: {
    type: Number,
    default: null
  },
  confidenceBefore: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  confidenceAfter: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  locked: {
    type: Boolean,
    default: false
  },
  completionEvidence: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'learningtasks'
});

learningTaskSchema.index({ planId: 1, weekNumber: 1, dayNumber: 1 });

module.exports = mongoose.model('LearningTask', learningTaskSchema);
