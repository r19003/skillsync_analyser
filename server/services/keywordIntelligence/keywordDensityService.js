/**
 * keywordDensityService.js
 *
 * Analyzes keyword density, repetition, and suspicious stuffing patterns:
 * - Total resume word count
 * - Keyword occurrence count
 * - Occurrences per 1,000 words
 * - Repetition concentration
 * - Stuffing warnings (excessive repetition in short sections, keyword lists copied from JD, etc.)
 */

/**
 * Evaluates keyword density and checks for unnatural repetition or stuffing
 *
 * @param {string} resumeText - Full extracted resume text
 * @param {Array<object>} matchedKeywords - Matched keyword objects from matchingService
 * @returns {object} Density analytics and overuse warnings
 */
const analyzeKeywordDensity = (resumeText = '', matchedKeywords = []) => {
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const totalWordCount = words.length;

  const keywordCounts = [];
  const overuseWarnings = [];

  let totalKeywordOccurrences = 0;

  for (const item of matchedKeywords) {
    const count = item.resumeFrequency || 0;
    if (count > 0) {
      totalKeywordOccurrences += count;
      const densityPerThousand = totalWordCount > 0
        ? parseFloat(((count / totalWordCount) * 1000).toFixed(1))
        : 0;

      const densityData = {
        keyword: item.canonicalKeyword,
        category: item.category,
        occurrences: count,
        occurrencesPer1000Words: densityPerThousand,
        sectionsCount: (item.placement || []).length,
        sections: item.placement || [],
        isOverused: false,
        warningDetail: null
      };

      // Identify suspicious repetition patterns
      // 1. Frequency > 6 in a single document under 800 words
      if (count >= 6 && totalWordCount < 800) {
        densityData.isOverused = true;
        densityData.warningDetail = `High repetition: "${item.canonicalKeyword}" appears ${count} times (${densityPerThousand}/1,000 words). Ensure each mention describes a distinct achievement.`;
        overuseWarnings.push({
          keyword: item.canonicalKeyword,
          type: 'high_frequency',
          severity: 'warning',
          count,
          detail: densityData.warningDetail
        });
      }
      // 2. High repetition concentrated only in 1 section (e.g., keyword stuffing block)
      else if (count >= 4 && (item.placement || []).length === 1 && item.placement[0] === 'skills') {
        densityData.isOverused = true;
        densityData.warningDetail = `Repetition concentration: "${item.canonicalKeyword}" is repeated ${count} times inside skills list without project or experience context.`;
        overuseWarnings.push({
          keyword: item.canonicalKeyword,
          type: 'skills_stuffing',
          severity: 'warning',
          count,
          detail: densityData.warningDetail
        });
      }

      keywordCounts.push(densityData);
    }
  }

  // Check for raw keyword dumping / copy-paste blocks
  // Check if consecutive words match comma-separated keyword list
  const lowerText = resumeText.toLowerCase();
  const commaSeparatedLists = lowerText.match(/(?:[a-z0-9+#]+,\s*){6,}[a-z0-9+#]+/g);
  if (commaSeparatedLists && commaSeparatedLists.length > 2) {
    overuseWarnings.push({
      keyword: 'Multiple Technical Keywords',
      type: 'dense_keyword_block',
      severity: 'notice',
      count: commaSeparatedLists.length,
      detail: 'Detected dense comma-separated keyword blocks. Ensure technical competencies are integrated into narrative project achievements.'
    });
  }

  // Natural usage score (0-100)
  // Starts at 100, drops slightly for each verified overuse warning
  let naturalUsageScore = 100;
  for (const w of overuseWarnings) {
    if (w.severity === 'warning') naturalUsageScore -= 12;
    if (w.severity === 'notice') naturalUsageScore -= 5;
  }
  naturalUsageScore = Math.max(40, naturalUsageScore);

  return {
    totalWordCount,
    totalKeywordOccurrences,
    naturalUsageScore,
    keywordCounts: keywordCounts.sort((a, b) => b.occurrences - a.occurrences),
    overuseWarnings,
    summary: overuseWarnings.length === 0
      ? 'Natural keyword distribution with balanced repetition across resume sections.'
      : `Identified ${overuseWarnings.length} potential keyword repetition pattern(s) to review.`
  };
};

module.exports = {
  analyzeKeywordDensity
};
