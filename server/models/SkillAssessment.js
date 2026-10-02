const mongoose = require('mongoose');

const SkillAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleTrack: { type: String, required: true, enum: ['Business Analyst', 'Software Engineer'] },
  assessed: { type: Boolean, default: false },
  overallScore: { type: Number, default: null }, // Null when unassessed
  statusMessage: { type: String, default: 'Interview readiness has not yet been assessed.' },
  topicScores: { type: mongoose.Schema.Types.Mixed, default: {} },
  assessedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('SkillAssessment', SkillAssessmentSchema);
