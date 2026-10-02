const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
  resourceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  roleTracks: [{
    type: String,
    trim: true
  }],
  skill: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    trim: true
  },
  resourceType: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    trim: true
  },
  estimatedMinutes: {
    type: Number,
    default: 0
  },
  costType: {
    type: String,
    trim: true
  },
  handsOn: {
    type: Boolean,
    default: false
  },
  qualityScore: {
    type: Number,
    default: 90
  },
  description: {
    type: String,
    trim: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  lastVerifiedAt: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'learningresources'
});

module.exports = mongoose.model('LearningResource', learningResourceSchema);
