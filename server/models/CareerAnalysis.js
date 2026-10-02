const mongoose = require('mongoose');

const DetectedSkillSchema = new mongoose.Schema({
  canonicalSkill: { type: String, required: true },
  originalPhrase: { type: String, default: '' },
  category: { type: String, default: 'General' },
  section: { type: String, default: 'unknown' },
  exactSentence: { type: String, default: '' },
  evidenceLevel: {
    type: String,
    enum: ['none', 'mentioned', 'project', 'experience', 'quantified', 'verified'],
    default: 'none'
  },
  evidenceScore: { type: Number, default: 0, min: 0, max: 100 },
  extractionConfidence: { type: Number, default: 1.0, min: 0, max: 1.0 },
  matchType: { type: String, enum: ['exact', 'alias', 'semantic'], default: 'exact' }
}, { _id: false });

const PrioritizedSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  category: { type: String, required: true },
  roleImportance: { type: Number, required: true },
  marketDemand: { type: Number, required: true },
  gapSeverity: { type: Number, required: true },
  transferability: { type: Number, required: true },
  learningFeasibility: { type: Number, required: true },
  priorityScore: { type: Number, required: true },
  priorityLabel: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  currentEvidenceLevel: { type: String, default: 'none' },
  currentEvidenceScore: { type: Number, default: 0 },
  explanation: { type: String, default: '' },
  suggestedAction: { type: String, default: '' },
  estimatedEffort: { type: String, default: '' },
  evidenceToProduce: { type: String, default: '' },
  expectedContribution: { type: Number, default: 0 }
}, { _id: false });

const RoadmapTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  theme: { type: String, default: '' },
  focusSkill: { type: String, required: true },
  category: { type: String, default: '' },
  learningObjective: { type: String, default: '' },
  task: { type: String, default: '' },
  estimatedTime: { type: String, default: '4-6 hours' },
  deliverable: { type: String, default: '' },
  evidenceToProduce: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  expectedReadinessContribution: { type: Number, default: 0 }
}, { _id: false });

const CareerAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  targetRole: { type: String, required: true },
  roleTrack: { type: String, required: true, enum: ['Business Analyst', 'Software Engineer'] },
  jobDescription: { type: String, default: '' },
  analysisType: { type: String, enum: ['Role-Profile', 'Job-Description'], required: true },
  
  // Eligibility Warnings
  eligibilityWarnings: [{
    criteria: { type: String },
    status: { type: String, enum: ['pass', 'warning', 'fail'] },
    detail: { type: String }
  }],

  // 1. General ATS Readiness Score
  atsReadiness: {
    overallScore: { type: Number, default: 0 },
    signals: {
      parseabilityAndReadingOrder: {
        score: Number,
        maxScore: { type: Number, default: 30 },
        passed: Boolean,
        detail: String
      },
      requiredSectionsAndContact: {
        score: Number,
        maxScore: { type: Number, default: 20 },
        passed: Boolean,
        detail: String,
        missing: [String]
      },
      bulletAndAchievementQuality: {
        score: Number,
        maxScore: { type: Number, default: 20 },
        passed: Boolean,
        detail: String,
        quantifiedRatio: Number
      },
      chronologyAndConsistency: {
        score: Number,
        maxScore: { type: Number, default: 15 },
        passed: Boolean,
        detail: String
      },
      readabilityLengthStructure: {
        score: Number,
        maxScore: { type: Number, default: 15 },
        passed: Boolean,
        detail: String,
        wordCount: Number
      },
      visualLayoutInspection: {
        status: { type: String, default: 'unavailable' },
        detail: { type: String, default: 'Visual layout inspection unavailable for plain extracted text.' }
      }
    }
  },

  // 2. Job / Role Fit Score
  roleFit: {
    overallScore: { type: Number, default: 0 },
    label: { type: String, enum: ['Role Fit', 'JD Match'], default: 'Role Fit' },
    breakdown: {
      mandatorySkillCoverage: { score: Number, maxScore: { type: Number, default: 30 }, detail: String, coverageRatio: Number },
      responsibilitySemanticAlignment: { score: Number, maxScore: { type: Number, default: 25 }, detail: String },
      experienceRecencyAlignment: { score: Number, maxScore: { type: Number, default: 20 }, detail: String },
      educationCertificationAlignment: { score: Number, maxScore: { type: Number, default: 10 }, detail: String },
      preferredSkillCoverage: { score: Number, maxScore: { type: Number, default: 10 }, detail: String },
      titleDomainAlignment: { score: Number, maxScore: { type: Number, default: 5 }, detail: String }
    }
  },

  // 3. Interview Readiness Score
  interviewReadiness: {
    assessed: { type: Boolean, default: false },
    score: { type: Number, default: null },
    statusMessage: { type: String, default: 'Interview readiness has not yet been assessed.' },
    topicBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  // 4. Overall Career Readiness
  overallCareerReadiness: {
    score: { type: Number, default: 0 },
    componentsIncluded: [{
      name: String,
      weight: Number,
      score: Number
    }],
    formulaExplanation: String
  },

  // Extracted Evidence & Skills
  detectedSkills: [DetectedSkillSchema],

  // Skill Priorities
  prioritizedSkills: [PrioritizedSkillSchema],

  // Category Distribution & Readiness
  categoryReadiness: [{
    category: { type: String },
    score: { type: Number },
    requiredSkillCount: { type: Number },
    matchedSkillCount: { type: Number },
    coverageRatio: { type: Number }
  }],

  // Personalized Roadmap
  weeklyPlan: [RoadmapTaskSchema],

  // Market Demands
  marketContext: {
    marketCorpusSize: { type: Number, default: 25 },
    marketDatasetSource: { type: String, default: 'SkillSync Curated Market Corpus (Sample Dataset - Disclosed)' },
    topDemandedSkills: [{
      skill: String,
      frequency: Number,
      requiredPercent: Number,
      preferredPercent: Number
    }],
    skillCoOccurrence: [{
      skillA: String,
      skillB: String,
      count: Number
    }],
    sweReadinessAnalytics: {
      dsaScore: Number,
      csFundamentalsScore: Number,
      systemDesignScore: Number,
      details: String
    }
  },

  // What-If Simulations
  simulations: [{
    simulationId: String,
    selectedSkills: [String],
    baselineReadiness: Number,
    projectedReadiness: Number,
    readinessDelta: Number,
    baselineRoleFit: Number,
    projectedRoleFit: Number,
    roleFitDelta: Number,
    coverageBefore: Number,
    coverageAfter: Number,
    assumptions: [String],
    timestamp: { type: Date, default: Date.now }
  }],

  // 5. ATS Keyword Intelligence
  keywordAnalytics: {
    mode: { type: String, enum: ['JD Keyword Analysis', 'Role Keyword Analysis'], default: 'Role Keyword Analysis' },
    optimizationScore: { type: Number, default: 0 },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    formulaSummary: { type: String, default: '' },
    summaryKPIs: { type: mongoose.Schema.Types.Mixed, default: {} },
    matchedKeywords: [{ type: mongoose.Schema.Types.Mixed }],
    missingKeywords: [{ type: mongoose.Schema.Types.Mixed }],
    relatedKeywords: [{ type: mongoose.Schema.Types.Mixed }],
    unsupportedKeywords: [{ type: mongoose.Schema.Types.Mixed }],
    overuseWarnings: [{ type: mongoose.Schema.Types.Mixed }],
    missingPriorities: [{ type: mongoose.Schema.Types.Mixed }],
    contextualBulletImprovements: [{ type: mongoose.Schema.Types.Mixed }],
    actionVerbAnalytics: { type: mongoose.Schema.Types.Mixed, default: {} },
    jobTitleAlignment: { type: mongoose.Schema.Types.Mixed, default: {} },
    categoryBreakdown: [{ type: mongoose.Schema.Types.Mixed }],
    sectionDistribution: [{ type: mongoose.Schema.Types.Mixed }],
    sectionRecommendations: [{ type: mongoose.Schema.Types.Mixed }],
    densitySummary: { type: String, default: '' },
    totalWordCount: { type: Number, default: 0 },
    analyzedAt: { type: Date, default: Date.now }
  }

}, { timestamps: true });

module.exports = mongoose.model('CareerAnalysis', CareerAnalysisSchema);
