/**
 * actionVerbService.js
 *
 * Evaluates action-verb variety and detects weak or passive phrasing across resume bullets:
 * - Detects weak phrases ("worked on", "responsible for", "helped with", etc.)
 * - Recommends strong contextual verbs ("Engineered", "Designed", "Implemented", "Automated", etc.)
 * - Tracks verb variety, repetition counts, and bullets lacking action verbs.
 * - Kept strictly separate from JD keyword coverage.
 */

const { WEAK_ACTION_VERBS } = require('./keywordTaxonomy');
const { splitSentences } = require('./keywordExtractionService');

const STRONG_ACTION_VERBS = [
  'engineered', 'architected', 'developed', 'implemented', 'optimized',
  'automated', 'formulated', 'streamlined', 'analyzed', 'designed',
  'spearheaded', 'orchestrated', 'delivered', 'facilitated', 'conducted',
  'integrated', 'constructed', 'deployed', 'revamped', 'refactored',
  'established', 'accelerated', 'authored', 'administered', 'quantified'
];

/**
 * Analyzes action verbs across resume sentences
 *
 * @param {string} resumeText - Full candidate resume text
 * @returns {object} Action-verb analytics report
 */
const analyzeActionVerbs = (resumeText = '') => {
  const sentences = splitSentences(resumeText);
  const lowerText = resumeText.toLowerCase();

  const weakPhraseDetections = [];
  const strongVerbsFound = new Map();
  const bulletsWithoutActionVerb = [];

  // 1. Detect weak and passive phrasing
  for (const weak of WEAK_ACTION_VERBS) {
    const escaped = weak.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'gi');
    const matches = lowerText.match(regex);

    if (matches && matches.length > 0) {
      // Find the specific sentence containing this weak phrase
      const matchedSentence = sentences.find(s => s.toLowerCase().includes(weak.phrase)) || '';

      weakPhraseDetections.push({
        phrase: weak.phrase,
        count: matches.length,
        replacementSuggestion: weak.replacement,
        exampleSentence: matchedSentence,
        remedy: `Replace "${weak.phrase}" with an active ownership verb such as ${weak.replacement}.`
      });
    }
  }

  // 2. Identify strong action verbs used and check variety
  for (const verb of STRONG_ACTION_VERBS) {
    const escaped = verb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerText.match(regex);

    if (matches) {
      strongVerbsFound.set(verb, matches.length);
    }
  }

  // 3. Check for repetitive action verbs (same verb used 4+ times)
  const repetitiveVerbs = [];
  for (const [verb, count] of strongVerbsFound.entries()) {
    if (count >= 4) {
      repetitiveVerbs.push({
        verb,
        count,
        warning: `The action verb "${verb}" is repeated ${count} times. Diversify with synonyms to demonstrate wider capability.`
      });
    }
  }

  // 4. Action Verb Score (0-100)
  // Evaluates variety, presence of strong verbs, and minimal passive phrases
  const strongCount = Array.from(strongVerbsFound.values()).reduce((acc, c) => acc + c, 0);
  const uniqueStrongCount = strongVerbsFound.size;
  const weakCount = weakPhraseDetections.reduce((acc, w) => acc + w.count, 0);

  let verbScore = 50;
  verbScore += Math.min(35, uniqueStrongCount * 4); // up to 35 pts for variety
  verbScore -= (weakCount * 8); // penalty for passive phrases
  verbScore = Math.min(100, Math.max(30, Math.round(verbScore)));

  return {
    actionVerbScore: verbScore,
    uniqueStrongVerbsUsed: uniqueStrongCount,
    totalStrongVerbsUsed: strongCount,
    strongVerbsList: Array.from(strongVerbsFound.entries()).map(([verb, count]) => ({ verb, count })),
    weakPhrasesDetected: weakPhraseDetections,
    repetitiveVerbs,
    varietyAssessment: uniqueStrongCount >= 8
      ? 'Excellent dynamic action-verb variety across experience narratives.'
      : uniqueStrongCount >= 4
        ? 'Moderate action-verb variety; consider replacing repeated phrasing with distinct verbs.'
        : 'Low action-verb variety; experience bullets rely heavily on passive or repeated verbs.'
  };
};

module.exports = {
  analyzeActionVerbs
};
