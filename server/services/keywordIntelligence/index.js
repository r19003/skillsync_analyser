/**
 * index.js (keywordIntelligence)
 *
 * Master orchestrator for the ATS Keyword Intelligence engine.
 * Computes end-to-end keyword extraction, matching, density, placement,
 * scoring, action-verb analytics, job title alignment, and recommendations.
 */

const { extractKeywords } = require('./keywordExtractionService');
const { matchKeywordsAgainstResume } = require('./keywordMatchingService');
const { analyzeKeywordDensity } = require('./keywordDensityService');
const { evaluateKeywordPlacement } = require('./keywordPlacementService');
const { computeKeywordOptimizationScore } = require('./keywordScoringService');
const { prioritizeMissingKeywords, analyzeContextualBullets } = require('./keywordRecommendationService');
const { analyzeActionVerbs } = require('./actionVerbService');
const { analyzeJobTitleAlignment } = require('./jobTitleService');

/**
 * Runs complete ATS Keyword Intelligence pipeline
 *
 * @param {object} params
 * @param {string} params.resumeText - Full text of candidate resume
 * @param {object} params.parsedData - Structured parsed resume data (experience, education, projects, skills)
 * @param {string} params.jobDescription - Optional job description text
 * @param {object} params.roleProfile - Standardized role profile (BA or SWE)
 * @param {string} params.targetRole - Target role string
 * @returns {object} Complete keyword analytics payload
 */
const runKeywordIntelligence = ({
  resumeText = '',
  parsedData = {},
  jobDescription = '',
  roleProfile = null,
  targetRole = 'Entry-Level Software Engineer'
}) => {
  const mode = (jobDescription && jobDescription.trim().length >= 30)
    ? 'JD Keyword Analysis'
    : 'Role Keyword Analysis';

  // 1. Extract and score target keywords from JD or Role Profile
  const targetKeywords = extractKeywords(jobDescription, roleProfile);

  // 2. Match target keywords against candidate resume
  const matchedKeywords = matchKeywordsAgainstResume(targetKeywords, resumeText, parsedData);

  // 3. Keyword density and repetition check
  const densityAnalytics = analyzeKeywordDensity(resumeText, matchedKeywords);

  // 4. Keyword placement across sections
  const placementAnalytics = evaluateKeywordPlacement(matchedKeywords, roleProfile);

  // 5. Deterministic Keyword Optimization Score calculation
  const scoring = computeKeywordOptimizationScore(
    matchedKeywords,
    placementAnalytics,
    densityAnalytics
  );

  // 6. Action verb variety & weak phrase detection
  const actionVerbAnalytics = analyzeActionVerbs(resumeText);

  // 7. Job title alignment & seniority compatibility
  const jobTitleAlignment = analyzeJobTitleAlignment(
    targetRole || roleProfile?.roleTitle || 'Entry-Level Software Engineer',
    resumeText,
    parsedData
  );

  // 8. Missing keyword prioritization and contextual bullet improvements
  const missingPriorities = prioritizeMissingKeywords(matchedKeywords, roleProfile);
  const contextualBullets = analyzeContextualBullets(matchedKeywords);

  // 9. Compute Category Breakdown for charts
  const categoryMap = new Map();
  for (const item of matchedKeywords) {
    const cat = item.category || 'Other';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        total: 0,
        matched: 0,
        missing: 0,
        critical: 0
      });
    }
    const record = categoryMap.get(cat);
    record.total++;
    if (item.matchType !== 'missing') record.matched++;
    else record.missing++;
    if (item.isCritical) record.critical++;
  }
  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);

  // 10. Summary lists
  const matchedList = matchedKeywords.filter(k => k.matchType !== 'missing');
  const missingList = matchedKeywords.filter(k => k.matchType === 'missing');
  const relatedList = matchedKeywords.filter(k => Boolean(k.transferableAlternative));
  const unsupportedList = matchedKeywords.filter(k => k.matchType === 'unsupported');
  const overusedList = densityAnalytics.keywordCounts.filter(k => k.isOverused);

  return {
    mode,
    optimizationScore: scoring.optimizationScore,
    breakdown: scoring.breakdown,
    formulaSummary: scoring.formulaSummary,
    summaryKPIs: {
      totalKeywordsExtracted: targetKeywords.length,
      matchedCount: matchedList.length,
      missingCount: missingList.length,
      criticalMatchedCount: scoring.breakdown.criticalCoverage.matched,
      criticalTotalCount: scoring.breakdown.criticalCoverage.total,
      criticalMissingCount: scoring.breakdown.criticalCoverage.total - scoring.breakdown.criticalCoverage.matched,
      supportingMatchedCount: scoring.breakdown.supportingCoverage.matched,
      supportingTotalCount: scoring.breakdown.supportingCoverage.total,
      unsupportedCount: unsupportedList.length,
      overuseWarningsCount: densityAnalytics.overuseWarnings.length,
      actionVerbScore: actionVerbAnalytics.actionVerbScore,
      placementScore: placementAnalytics.placementScore,
      naturalUsageScore: densityAnalytics.naturalUsageScore
    },
    matchedKeywords,
    missingKeywords: missingList,
    relatedKeywords: relatedList,
    unsupportedKeywords: unsupportedList,
    overuseWarnings: densityAnalytics.overuseWarnings,
    missingPriorities,
    contextualBulletImprovements: contextualBullets,
    actionVerbAnalytics,
    jobTitleAlignment,
    categoryBreakdown,
    sectionDistribution: placementAnalytics.sectionDistribution,
    sectionRecommendations: placementAnalytics.sectionRecommendations,
    densitySummary: densityAnalytics.summary,
    totalWordCount: densityAnalytics.totalWordCount,
    analyzedAt: new Date()
  };
};

module.exports = {
  runKeywordIntelligence
};
