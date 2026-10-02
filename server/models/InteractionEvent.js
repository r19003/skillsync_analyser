const mongoose = require('mongoose');

const interactionEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'resource_viewed',
      'resource_started',
      'resource_completed',
      'resource_skipped',
      'resource_helpful',
      'resource_too_easy',
      'resource_too_difficult',
      'task_completed',
      'task_overdue',
      'assessment_attempted',
      'assessment_score_changed',
      'roadmap_rescheduled',
      'skill_confidence_updated',
      'evidence_feedback_submitted'
    ],
    index: true
  },
  resourceId: {
    type: String,
    default: null,
    index: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningTask',
    default: null
  },
  skill: {
    type: String,
    trim: true,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  collection: 'interactionevents'
});

module.exports = mongoose.model('InteractionEvent', interactionEventSchema);
