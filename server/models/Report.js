const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
  
  executiveSummary: { type: String, required: true },
  atsEvaluation: { type: String },
  
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  
  resumeQualityReview: { type: String },
  jdAlignmentReview: { type: String },
  
  recommendedImprovements: [{ type: String }],
  suggestedActionPlan: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
