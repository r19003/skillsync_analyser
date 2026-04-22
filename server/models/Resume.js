const mongoose = require('mongoose');

/**
 * Resume Schema
 * Stores uploaded PDF info and extracted/parsed content.
 */
const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    // Raw text extracted from the PDF
    extractedText: {
      type: String,
      default: '',
    },
    // Structured data parsed from extracted text
    parsedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      skills: { type: [String], default: [] },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      // Detected sections (for completeness scoring later)
      sections: {
        hasObjective: { type: Boolean, default: false },
        hasSummary: { type: Boolean, default: false },
        hasExperience: { type: Boolean, default: false },
        hasEducation: { type: Boolean, default: false },
        hasSkills: { type: Boolean, default: false },
        hasProjects: { type: Boolean, default: false },
        hasCertifications: { type: Boolean, default: false },
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
