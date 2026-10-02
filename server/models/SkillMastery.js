const mongoose = require('mongoose');

const skillMasterySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  careerAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerAnalysis',
    index: true
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
  masteryScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
    default: 0
  },
  targetMastery: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  confidenceLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Estimated'],
    default: 'Estimated'
  },
  evidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  assessmentScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  practiceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isAssessed: {
    type: Boolean,
    default: false
  },
  selfRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  consistencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  evidenceSources: {
    type: [String],
    default: ['Resume Scan']
  },
  updateReason: {
    type: String,
    default: 'Initial career readiness scan'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'skillmasteries'
});

skillMasterySchema.index({ userId: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('SkillMastery', skillMasterySchema);
