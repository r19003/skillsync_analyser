const mongoose = require('mongoose');

/**
 * Analysis Schema
 * Stores the full ATS analysis result for a resume+job description pair.
 */
const AnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },

    // ── Extracted from job description ──────────────────
    jobRole: { type: String, default: '' },
    extractedJobSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    jobKeywords: { type: [String], default: [] },

    // ── Extracted from resume ────────────────────────────
    extractedResumeSkills: { type: [String], default: [] },

    // ── Skill-gap analysis ───────────────────────────────
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    extraSkills: { type: [String], default: [] },   // skills in resume not in JD

    // ── Scores ──────────────────────────────────────────
    atsScore: { type: Number, default: 0 },         // 0-100
    matchPercentage: { type: Number, default: 0 },  // 0-100

    // ── Score breakdown (transparent formula) ───────────
    scoreBreakdown: {
      keywordMatch: { score: Number, maxScore: Number, detail: String },
      skillsOverlap: { score: Number, maxScore: Number, detail: String },
      sectionCompleteness: { score: Number, maxScore: Number, detail: String },
      formatting: { score: Number, maxScore: Number, detail: String },
      experienceRelevance: { score: Number, maxScore: Number, detail: String },
    },

    // ── Feedback ─────────────────────────────────────────
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);
