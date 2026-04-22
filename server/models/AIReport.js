const mongoose = require('mongoose');

// ── Sub-schema: individual scored category ──────────────────────────────────
const ScoreSectionSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  detail: { type: String, default: '' }
}, { _id: false });

// ── Sub-schema: resume vs JD comparison ────────────────────────────────────
const ComparisonSchema = new mongoose.Schema({
  overallMatchPercentage: { type: Number, default: 0 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  relevantExperienceMatch: { type: String, default: '' },
  priorityGaps: [{ type: String }],
  fitCategory: { type: String, enum: ['weak', 'moderate', 'strong'], default: 'weak' }
}, { _id: false });

// ── Sub-schema: candidate profile summary ──────────────────────────────────
const CandidateProfileSchema = new mongoose.Schema({
  professionalSummary: { type: String, default: '' },
  currentLevelAssessment: { type: String, default: '' },
  likelyTargetFit: { type: String, default: '' }
}, { _id: false });

// ── Sub-schema: ATS review ─────────────────────────────────────────────────
const ATSReviewSchema = new mongoose.Schema({
  compatibilityScore: { type: Number, default: 0 },
  formattingObservations: { type: String, default: '' },
  keywordCoverage: { type: String, default: '' },
  sectionCompleteness: { type: String, default: '' },
  readabilityObservations: { type: String, default: '' }
}, { _id: false });

// ── Sub-schema: action plan ────────────────────────────────────────────────
const ActionPlanSchema = new mongoose.Schema({
  today: [{ type: String }],
  thisWeek: [{ type: String }],
  thisMonth: [{ type: String }],
  topThreeHighImpactActions: [{ type: String }]
}, { _id: false });

// ── Sub-schema: final evaluation ───────────────────────────────────────────
const FinalEvaluationSchema = new mongoose.Schema({
  jobReadinessLevel: { type: String, default: '' },   // e.g. "65% — Moderate"
  confidenceScore: { type: Number, default: 0 },       // 0-100
  estimatedReadinessAfterPlan: { type: String, default: '' },
  motivationalAdvice: { type: String, default: '' }
}, { _id: false });

// ── Main AIReport schema ───────────────────────────────────────────────────
const AIReportSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  resumeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Resume',   required: true },
  analysisId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },

  targetRole:      { type: String, default: '' },
  userGoal:        { type: String, default: '' }, // e.g. "get shortlisted in 3 months"
  jobDescription:  { type: String, default: '' },

  // ── AI source flags ──────────────────────────────────────────────────────
  grokUsed:   { type: Boolean, default: false },
  geminiUsed: { type: Boolean, default: false },
  fallbackUsed: { type: Boolean, default: false },

  // ── Raw AI outputs (stored for debugging/regeneration) ───────────────────
  grokRawOutput:   { type: mongoose.Schema.Types.Mixed, default: null },
  geminiRawOutput: { type: mongoose.Schema.Types.Mixed, default: null },

  // ── Section 1: Candidate Profile ─────────────────────────────────────────
  candidateProfile: { type: CandidateProfileSchema, default: {} },

  // ── Section 2: ATS & Resume Quality ──────────────────────────────────────
  atsReview: { type: ATSReviewSchema, default: {} },
  scoreBreakdown: {
    keywordMatch:        ScoreSectionSchema,
    skillsOverlap:       ScoreSectionSchema,
    sectionCompleteness: ScoreSectionSchema,
    formatting:          ScoreSectionSchema,
    experienceRelevance: ScoreSectionSchema,
  },

  // ── Section 3 & 4: Strengths and Weaknesses ──────────────────────────────
  strengths:  [{ type: String }],   // what's already good
  weaknesses: [{ type: String }],   // what needs work

  // ── Section 5: Resume vs JD Comparison ───────────────────────────────────
  jdComparison: { type: ComparisonSchema, default: {} },

  // ── Section 6: Recommendations ───────────────────────────────────────────
  recommendations: {
    improveFirst:  [{ type: String }],
    rewrite:       [{ type: String }],
    toAdd:         [{ type: String }],
    toRemove:      [{ type: String }],
    sectionOptimizations: [{ type: String }],
    atsAndReadability:    [{ type: String }]
  },

  // ── Section 7: is handled by linked StudyPlan document ──────────────────
  studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvStudyPlan', default: null },

  // ── Section 8: Action Plan ────────────────────────────────────────────────
  actionPlan: { type: ActionPlanSchema, default: {} },

  // ── Section 10: Final Evaluation ──────────────────────────────────────────
  finalEvaluation: { type: FinalEvaluationSchema, default: {} },

  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AIReport', AIReportSchema);
