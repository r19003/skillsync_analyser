/**
 * unifiedReportService.js
 *
 * Orchestrates Grok + Gemini in parallel, merges their outputs
 * into a single unified AIReport + AdvStudyPlan document pair.
 *
 * Flow:
 *   1. Fetch analysis + resume from DB
 *   2. Run Grok analysis  (critique, strengths, weaknesses, action plan)
 *   3. Run Gemini plan    (study plan, projects, milestones)  — in parallel with step 2
 *   4. Merge into AIReport schema
 *   5. Save both AIReport and AdvStudyPlan to MongoDB
 *   6. Return the unified report object
 */

const Analysis    = require('../models/Analysis');
const Resume      = require('../models/Resume');
const AIReport    = require('../models/AIReport');
const AdvStudyPlan= require('../models/AdvStudyPlan');

const { runGrokAnalysis }      = require('./grokAnalysisService');
const { runGeminiStudyPlan }   = require('./geminiStudyPlanService');

// ───────────────────────────────────────────────────────────────────────
// Main orchestrator
// ───────────────────────────────────────────────────────────────────────
const generateUnifiedReport = async ({ analysisId, userId, targetRole, userGoal, durationWeeks = 4 }) => {

  // ── 1. Fetch existing analysis and resume ────────────────────────────
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) throw new Error('Analysis not found');
  if (analysis.userId.toString() !== userId) throw new Error('Access denied');

  const resume = await Resume.findById(analysis.resumeId);
  if (!resume) throw new Error('Resume not found');

  // ── 2. Check for existing report (prevent duplicate generation) ──────
  const existing = await AIReport.findOne({ analysisId, userId });
  if (existing) {
    const existingPlan = await AdvStudyPlan.findOne({ analysisId, userId });
    return { report: existing, studyPlan: existingPlan };
  }

  // ── 3. Prepare shared context object ────────────────────────────────
  const sharedContext = {
    resumeText:         resume.extractedText || '',
    parsedData:         resume.parsedData    || {},
    jobDescription:     analysis.jobDescription || '',
    targetRole:         targetRole || analysis.jobRole || '',
    userGoal:           userGoal   || '',
    atsScore:           analysis.atsScore           || 0,
    matchPercentage:    analysis.matchPercentage     || 0,
    scoreBreakdown:     analysis.scoreBreakdown      || {},
    matchedSkills:      analysis.matchedSkills       || [],
    missingSkills:      analysis.missingSkills       || [],
    extraSkills:        analysis.extraSkills         || [],
    extractedJobSkills: analysis.extractedJobSkills  || [],
    jobKeywords:        analysis.jobKeywords         || [],
    durationWeeks
  };

  // ── 4. Run Grok + Gemini in parallel ────────────────────────────────
  console.log('[UnifiedReport] Launching Grok + Gemini in parallel...');
  const [grokResult, geminiResult] = await Promise.allSettled([
    runGrokAnalysis(sharedContext),
    runGeminiStudyPlan(sharedContext)
  ]);

  const grokData   = grokResult.status   === 'fulfilled' ? grokResult.value   : null;
  const geminiData = geminiResult.status === 'fulfilled' ? geminiResult.value : null;

  if (!grokData && !geminiData) {
    throw new Error('Both Grok and Gemini failed — cannot generate report');
  }

  const grokReport  = grokData?.data   || null;
  const geminiPlan  = geminiData?.data || null;

  // ── 5. Save AdvStudyPlan ─────────────────────────────────────────────
  let savedStudyPlan = null;
  if (geminiPlan) {
    savedStudyPlan = new AdvStudyPlan({
      userId,
      analysisId,
      targetRole: sharedContext.targetRole,
      userGoal:   sharedContext.userGoal,
      durationWeeks,

      currentGapSummary:    geminiPlan.currentGapSummary    || '',
      highPrioritySkills:   geminiPlan.highPrioritySkills   || [],
      mediumPrioritySkills: geminiPlan.mediumPrioritySkills || [],
      lowPrioritySkills:    geminiPlan.lowPrioritySkills    || [],

      weeklyPlan:    normalizeWeeklyPlan(geminiPlan.weeklyPlan || []),
      projects:      geminiPlan.projects      || [],
      interviewPrep: geminiPlan.interviewPrep || [],
      milestones:    geminiPlan.milestones    || [],

      geminiGenerated: geminiData?.source === 'gemini',
      fallbackUsed:    geminiData?.fallbackUsed || false
    });
    await savedStudyPlan.save();
  }

  // ── 6. Build and save AIReport ───────────────────────────────────────
  const fallbackGrokShape = buildFallbackGrokShape(sharedContext);
  const grok = grokReport || fallbackGrokShape;

  const savedReport = new AIReport({
    userId,
    resumeId:   resume._id,
    analysisId,
    targetRole: sharedContext.targetRole,
    userGoal:   sharedContext.userGoal,
    jobDescription: analysis.jobDescription,

    grokUsed:     grokData?.source === 'grok',
    geminiUsed:   geminiData?.source === 'gemini',
    fallbackUsed: grokData?.fallbackUsed || geminiData?.fallbackUsed || false,

    grokRawOutput:   grokReport,
    geminiRawOutput: geminiPlan,

    candidateProfile: grok.candidateProfile || {},
    atsReview:        grok.atsReview        || {},
    scoreBreakdown:   analysis.scoreBreakdown || {},

    strengths:  grok.strengths  || [],
    weaknesses: grok.weaknesses || [],

    jdComparison: {
      ...grok.jdComparison,
      overallMatchPercentage: analysis.matchPercentage,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
    },

    recommendations: grok.recommendations || {},
    actionPlan:      grok.actionPlan      || {},
    finalEvaluation: grok.finalEvaluation || {},

    studyPlanId: savedStudyPlan?._id || null
  });

  await savedReport.save();

  // ── 7. Link report ID back to study plan ────────────────────────────
  if (savedStudyPlan) {
    savedStudyPlan.reportId = savedReport._id;
    await savedStudyPlan.save();
  }

  return { report: savedReport, studyPlan: savedStudyPlan };
};

// ───────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────

// Ensure weeklyPlan tasks have all required fields before saving
const normalizeWeeklyPlan = (weeks) => weeks.map(week => ({
  weekNumber:  week.weekNumber,
  theme:       week.theme       || '',
  focusSkills: week.focusSkills || [],
  weeklyGoal:  week.weeklyGoal  || '',
  deliverable: week.deliverable || '',
  tasks: (week.tasks || []).map(t => ({
    title:       t.title       || 'Task',
    description: t.description || '',
    type:        ['learning','project','practice','revision','interview-prep'].includes(t.type) ? t.type : 'learning',
    duration:    t.duration    || '1-2 hours',
    resources:   Array.isArray(t.resources) ? t.resources : [],
    status:      'pending'
  }))
}));

// Minimal local shape if both AI calls fail
const buildFallbackGrokShape = (ad) => ({
  candidateProfile: { professionalSummary: `Candidate for ${ad.targetRole}`, currentLevelAssessment: 'Manual review required', likelyTargetFit: ad.matchPercentage >= 70 ? 'Strong' : 'Needs improvement' },
  atsReview: { compatibilityScore: ad.atsScore, formattingObservations: '', keywordCoverage: '', sectionCompleteness: '', readabilityObservations: '' },
  strengths: ad.matchedSkills?.slice(0, 3).map(s => `Demonstrated ${s}`) || [],
  weaknesses: ad.missingSkills?.slice(0, 3).map(s => `Missing ${s}`) || [],
  jdComparison: {
    overallMatchPercentage: ad.matchPercentage,
    matchedSkills: ad.matchedSkills,
    missingSkills: ad.missingSkills,
    matchedKeywords: ad.matchedSkills,
    missingKeywords: ad.missingSkills,
    relevantExperienceMatch: '',
    priorityGaps: ad.missingSkills?.slice(0, 5) || [],
    fitCategory: ad.matchPercentage >= 70 ? 'strong' : ad.matchPercentage >= 45 ? 'moderate' : 'weak'
  },
  recommendations: { improveFirst: [], rewrite: [], toAdd: [], toRemove: [], sectionOptimizations: [], atsAndReadability: [] },
  actionPlan: { today: [], thisWeek: [], thisMonth: [], topThreeHighImpactActions: [] },
  finalEvaluation: { jobReadinessLevel: `${ad.atsScore}/100`, confidenceScore: ad.atsScore, estimatedReadinessAfterPlan: '', motivationalAdvice: '' }
});

module.exports = { generateUnifiedReport };
