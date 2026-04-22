const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  resumeName: { type: String },
  atsScore: { type: Number },
  matchPercentage: { type: Number },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  rank: { type: Number },
  verdict: { type: String },
  strengths: [{ type: String }],
  scoreBreakdown: { type: mongoose.Schema.Types.Mixed }
});

const MultiComparisonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String, required: true },
  jobRole: { type: String },
  results: [ResultSchema],
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MultiComparison', MultiComparisonSchema);
