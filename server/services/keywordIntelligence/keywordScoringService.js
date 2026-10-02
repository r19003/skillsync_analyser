/**
 * keywordScoringService.js
 *
 * Computes the deterministic Keyword Optimization Score (0–100):
 *
 * Keyword Optimization Score =
 *   0.35 * (Critical Keyword Coverage) +
 *   0.15 * (Supporting Keyword Coverage) +
 *   0.15 * (Keyword Importance Alignment) +
 *   0.15 * (Context and Evidence Quality) +
 *   0.10 * (Keyword Placement Score) +
 *   0.10 * (Natural Usage & Repetition Quality)
 *
 * Avoids double counting by existing as a standalone analytical indicator.
 */

/**
 * Computes full Keyword Optimization Score and detailed component breakdowns
 *
 * @param {Array<object>} matchedKeywords - Array of compared keyword objects
 * @param {object} placementData - Data from keywordPlacementService
 * @param {object} densityData - Data from keywordDensityService
 * @returns {object} Optimization score and breakdown
 */
const computeKeywordOptimizationScore = (matchedKeywords = [], placementData = {}, densityData = {}) => {
  if (!matchedKeywords || matchedKeywords.length === 0) {
    return {
      optimizationScore: 0,
      breakdown: {
        criticalCoverage: { score: 0, maxScore: 35, matched: 0, total: 0 },
        supportingCoverage: { score: 0, maxScore: 15, matched: 0, total: 0 },
        importanceAlignment: { score: 0, maxScore: 15, matchedImportance: 0, totalImportance: 0 },
        contextQuality: { score: 0, maxScore: 15, averageEvidenceQuality: 0 },
        placement: { score: 0, maxScore: 10 },
        naturalUsage: { score: 0, maxScore: 10 }
      },
      explanation: 'No target keywords extracted for scoring.'
    };
  }

  // Separate critical vs supporting
  const criticalList = matchedKeywords.filter(k => k.isCritical || k.requirementType === 'required');
  const supportingList = matchedKeywords.filter(k => !k.isCritical && k.requirementType !== 'required');

  // Matched counts (exact, alias, semantic, unsupported)
  const isMatched = (k) => k.matchType !== 'missing';

  const criticalMatched = criticalList.filter(isMatched);
  const supportingMatched = supportingList.filter(isMatched);

  // 1. Critical keyword coverage (35 pts)
  const criticalRatio = criticalList.length > 0 ? (criticalMatched.length / criticalList.length) : 1;
  const criticalScore = parseFloat((criticalRatio * 35).toFixed(1));

  // 2. Supporting keyword coverage (15 pts)
  const supportingRatio = supportingList.length > 0 ? (supportingMatched.length / supportingList.length) : 1;
  const supportingScore = parseFloat((supportingRatio * 15).toFixed(1));

  // 3. Keyword importance alignment (15 pts)
  const totalImportance = matchedKeywords.reduce((acc, k) => acc + (k.importance || 80), 0);
  const matchedImportance = matchedKeywords
    .filter(isMatched)
    .reduce((acc, k) => acc + (k.importance || 80), 0);
  const importanceRatio = totalImportance > 0 ? (matchedImportance / totalImportance) : 0;
  const importanceScore = parseFloat((importanceRatio * 15).toFixed(1));

  // 4. Context and evidence quality (15 pts)
  // Evaluates where and how the keywords were evidenced
  let qualitySum = 0;
  const allMatched = matchedKeywords.filter(isMatched);

  for (const k of allMatched) {
    let q = 0.5; // base
    if (k.matchType === 'exact') q += 0.3;
    if (k.matchType === 'alias') q += 0.25;
    if (k.matchType === 'semantic') q += 0.15;
    if (k.matchType === 'unsupported') q = 0.35; // penalized for only being in skills

    // Bonus for quantified evidence or professional experience
    if (k.bestSection === 'experience') q += 0.15;
    if (k.bestSection === 'projects') q += 0.10;
    if (/\d+[%kKmM]?|\$\d+/.test(k.bestEvidence || '')) q += 0.05;

    qualitySum += Math.min(1.0, q);
  }

  const avgQuality = allMatched.length > 0 ? (qualitySum / allMatched.length) : 0;
  const contextScore = parseFloat((avgQuality * 15).toFixed(1));

  // 5. Keyword placement (10 pts)
  const placementRaw = placementData.placementScore || 70;
  const placementScore = parseFloat(((placementRaw / 100) * 10).toFixed(1));

  // 6. Natural usage and repetition quality (10 pts)
  const usageRaw = densityData.naturalUsageScore || 90;
  const naturalUsageScore = parseFloat(((usageRaw / 100) * 10).toFixed(1));

  // Total Optimization Score (0-100)
  const totalRaw = criticalScore + supportingScore + importanceScore + contextScore + placementScore + naturalUsageScore;
  const optimizationScore = Math.min(100, Math.max(0, Math.round(totalRaw)));

  return {
    optimizationScore,
    breakdown: {
      criticalCoverage: {
        score: criticalScore,
        maxScore: 35,
        matched: criticalMatched.length,
        total: criticalList.length,
        ratio: parseFloat(criticalRatio.toFixed(2)),
        detail: `Demonstrated ${criticalMatched.length} of ${criticalList.length} mandatory critical keywords.`
      },
      supportingCoverage: {
        score: supportingScore,
        maxScore: 15,
        matched: supportingMatched.length,
        total: supportingList.length,
        ratio: parseFloat(supportingRatio.toFixed(2)),
        detail: `Covered ${supportingMatched.length} of ${supportingList.length} preferred/supporting keywords.`
      },
      importanceAlignment: {
        score: importanceScore,
        maxScore: 15,
        matchedImportance,
        totalImportance,
        ratio: parseFloat(importanceRatio.toFixed(2)),
        detail: `Secured ${matchedImportance} of ${totalImportance} total importance-weighted points.`
      },
      contextQuality: {
        score: contextScore,
        maxScore: 15,
        averageQuality: parseFloat(avgQuality.toFixed(2)),
        detail: `Average evidence strength: ${(avgQuality * 100).toFixed(0)}% across verified work & project bullets.`
      },
      placement: {
        score: placementScore,
        maxScore: 10,
        rawPlacementScore: placementRaw,
        detail: `Keyword placement index across Summary, Skills, Experience, and Projects.`
      },
      naturalUsage: {
        score: naturalUsageScore,
        maxScore: 10,
        rawUsageScore: usageRaw,
        detail: densityData.summary || 'Balanced keyword density without artificial stuffing.'
      }
    },
    formulaSummary: 'Score = 0.35(Critical Coverage) + 0.15(Supporting Coverage) + 0.15(Importance Alignment) + 0.15(Context Quality) + 0.10(Placement) + 0.10(Natural Usage)'
  };
};

module.exports = {
  computeKeywordOptimizationScore
};
