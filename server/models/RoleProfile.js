const mongoose = require('mongoose');

const RoleSkillSchema = new mongoose.Schema({
  canonicalName: { type: String, required: true },
  aliases: [{ type: String }],
  category: { type: String, required: true },
  importance: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['required', 'preferred'], default: 'required' },
  transferability: { type: Number, default: 80, min: 0, max: 100 },
  learningDifficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  learningFeasibility: { type: Number, default: 80, min: 0, max: 100 },
  marketDemand: { type: Number, default: 80, min: 0, max: 100 },
  suggestedLearningActivities: [{ type: String }],
  suggestedPortfolioEvidence: { type: String, default: '' },
  prerequisites: [{ type: String }],
  recommendedSequencing: { type: Number, default: 1 }
}, { _id: false });

const RoleProfileSchema = new mongoose.Schema({
  roleId: { type: String, required: true, unique: true },
  roleTitle: { type: String, required: true },
  roleTrack: { type: String, required: true, enum: ['Business Analyst', 'Software Engineer'] },
  level: { type: String, default: 'Entry-Level' },
  description: { type: String, default: '' },
  categories: [{ type: String }],
  hardEligibilityCriteria: {
    minExperienceYears: { type: Number, default: 0 },
    targetDegrees: [{ type: String }],
    allowedWorkAuth: [{ type: String }]
  },
  skills: [RoleSkillSchema]
}, { timestamps: true });

module.exports = mongoose.model('RoleProfile', RoleProfileSchema);
