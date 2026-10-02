const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  roleTrack: { type: String, required: true, enum: ['Business Analyst', 'Software Engineer'] },
  seniority: { type: String, default: 'Entry-Level' },
  location: { type: String, default: '' },
  minExperienceYears: { type: Number, default: 0 },
  degreeRequirements: [{ type: String }],
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  description: { type: String, default: '' },
  datasetSource: { type: String, default: 'Curated Sample Dataset' },
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

JobPostingSchema.index({ roleTrack: 1 });

module.exports = mongoose.model('JobPosting', JobPostingSchema);
