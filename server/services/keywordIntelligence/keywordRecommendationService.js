/**
 * keywordRecommendationService.js
 *
 * Generates ethical, highly actionable recommendations for ATS keyword optimization:
 * - Prioritizes missing keywords into Critical, High-Value, Optional, and Transferable
 * - Provides realistic "evidenceToCreate" suggestions without ever advising fake claims
 * - Evaluates contextual bullet quality (Action + Skill + Task + Outcome + Metric)
 * - Proposes bullet improvements using placeholders for candidate-supplied facts
 */

const { KEYWORD_TAXONOMY } = require('./keywordTaxonomy');

/**
 * Prioritizes missing keywords and formulates truthful learning guidance
 *
 * @param {Array<object>} matchedKeywords - Matched keyword objects from matchingService
 * @param {object} roleProfile - Role profile baseline
 * @returns {Array<object>} Prioritized missing keyword recommendations
 */
const prioritizeMissingKeywords = (matchedKeywords = [], roleProfile = null) => {
  const missingList = matchedKeywords.filter(k => k.matchType === 'missing');
  const results = [];

  for (const item of missingList) {
    const canonical = item.canonicalKeyword;
    const taxonomyMatch = KEYWORD_TAXONOMY.find(t => t.canonical.toLowerCase() === canonical.toLowerCase());

    // Priority classification
    let priority = 'optional';
    if (item.isCritical || item.importance >= 88) priority = 'critical';
    else if (item.importance >= 75) priority = 'high';

    let reason = '';
    if (item.isCritical) {
      reason = `Mandatory qualification identified in ${item.frequencyInJD > 1 ? `${item.frequencyInJD} requirements` : 'core requirements'} for this target position.`;
    } else {
      reason = `Preferred tool or methodology (${item.importance}/100 role weight) enhancing candidate competitiveness.`;
    }

    // Transferable alternative check
    let candidateAlternative = null;
    let recommendation = '';
    let evidenceToCreate = '';

    if (item.transferableAlternative) {
      candidateAlternative = item.transferableAlternative.relatedKeyword;
      recommendation = `Do not claim "${canonical}" without prior hands-on experience. Retain "${candidateAlternative}" as evidence of transferable capability, or complete a dedicated portfolio project in "${canonical}" before adding it.`;
      evidenceToCreate = `Develop a portfolio deliverable demonstrating ${canonical} workflows alongside your existing ${candidateAlternative} experience.`;
    } else if (item.category === 'Software and tools' || item.category === 'Programming languages') {
      recommendation = `Do not add "${canonical}" directly to your skills section until you have built a tangible codebase or project demonstrating it.`;
      evidenceToCreate = `Build and publish a GitHub repository or end-to-end demo using ${canonical} with clear documentation.`;
    } else if (item.category === 'Business methodologies' || item.category === 'Technical methodologies') {
      recommendation = `Integrate ${canonical} into your project narratives by describing how you applied the methodology during project lifecycles.`;
      evidenceToCreate = `Draft a structured project case study documenting your end-to-end application of ${canonical}.`;
    } else {
      recommendation = `Evaluate if your academic coursework or past projects involved ${canonical}. If verified, document the specific task outcome.`;
      evidenceToCreate = `Write one concise bullet point linking ${canonical} to a measurable project task.`;
    }

    results.push({
      keyword: canonical,
      category: item.category,
      importance: item.importance,
      priority,
      reason,
      candidateAlternative,
      recommendation,
      evidenceToCreate,
      doNotAddWithoutExperience: true
    });
  }

  // Sort by critical first, then importance descending
  const priorityOrder = { critical: 1, high: 2, optional: 3 };
  results.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.importance - a.importance;
  });

  return results;
};

/**
 * Analyzes bullet context for top keywords and suggests template improvements
 * (Action + Skill/Tool + Task + Outcome + Metrics)
 *
 * @param {Array<object>} matchedKeywords - Matched keywords
 * @returns {Array<object>} Bullet improvements
 */
const analyzeContextualBullets = (matchedKeywords = []) => {
  const candidatesForImprovement = matchedKeywords
    .filter(k => k.matchType !== 'missing' && k.bestEvidence && k.bestEvidence.length > 10)
    .slice(0, 5);

  const improvements = [];

  for (const item of candidatesForImprovement) {
    const sentence = item.bestEvidence;
    const hasMetric = /\d+[%kKmM]?|\$\d+/.test(sentence);
    const hasActiveVerb = /(?:engineered|developed|built|created|analyzed|designed|implemented|automated|spearheaded|streamlined)/i.test(sentence);

    const isWeak = !hasMetric || !hasActiveVerb;

    if (isWeak) {
      // Suggest improved bullet structure using placeholders without inventing fake metrics
      const suggestedTemplate = `Utilized ${item.canonicalKeyword} to [specific technical/business task], resulting in [quantified outcome or % efficiency gain, e.g. reduced processing time / improved delivery].`;

      improvements.push({
        keyword: item.canonicalKeyword,
        currentBullet: sentence,
        assessment: !hasMetric
          ? 'Descriptive bullet lacking measurable business or performance metrics.'
          : 'Sentence structure could be strengthened with a more decisive action verb.',
        suggestedTemplate,
        instruction: 'Replace bracketed placeholders with your genuine project metrics or team outcomes. Never fabricate numbers.'
      });
    }
  }

  return improvements;
};

module.exports = {
  prioritizeMissingKeywords,
  analyzeContextualBullets
};
