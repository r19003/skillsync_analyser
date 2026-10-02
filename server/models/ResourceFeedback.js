const mongoose = require('mongoose');

const resourceFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  difficultyFeedback: {
    type: String,
    enum: ['too_easy', 'just_right', 'too_difficult'],
    default: 'just_right'
  },
  formatFeedback: {
    type: String,
    enum: ['not_my_format', 'preferred_format', 'too_long', 'broken_link', 'outdated'],
    default: null
  },
  helpful: {
    type: Boolean,
    default: true
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'resourcefeedbacks'
});

resourceFeedbackSchema.index({ userId: 1, resourceId: 1 });

module.exports = mongoose.model('ResourceFeedback', resourceFeedbackSchema);
