/**
 * keywordExtractionService.js
 *
 * Extracts and classifies keywords from a job description or falls back to
 * a standardized role profile (Business Analyst / Software Engineer).
 */

const { KEYWORD_TAXONOMY, KEYWORD_CATEGORIES } = require('./keywordTaxonomy');
const { cleanForMatching } = require('../skillNormalizationService');

/**
 * Splits text into clean sentences or line-delimited bullets
 */
const splitSentences = (text = '') => {
  if (!text) return [];
  return text
    .split(/(?:[\r\n]+|(?<=[.!?])\s+)/)
    .map(s => s.trim())
    .filter(s => s.length >= 4);
};

/**
 * Detects section context for a sentence within a Job Description
 */
const detectJdSectionContext = (sentence = '', jdText = '') => {
  const lowerSentence = sentence.toLowerCase();

  // Explicit sentence indicators
  if (/(?:preferred|nice to have|bonus|plus|desired|optional)/i.test(lowerSentence)) {
    return 'preferred';
  }
  if (/(?:must have|required|essential|minimum qualification|basic qualification)/i.test(lowerSentence)) {
    return 'required';
  }

  // Find active heading above this sentence in jdText
  if (jdText) {
    const idx = jdText.toLowerCase().indexOf(lowerSentence.slice(0, 25));
    if (idx !== -1) {
      const textBefore = jdText.slice(0, idx).toLowerCase();
      const lastPreferred = Math.max(textBefore.lastIndexOf('preferred'), textBefore.lastIndexOf('nice to have'), textBefore.lastIndexOf('bonus'));
      const lastRequired = Math.max(textBefore.lastIndexOf('required'), textBefore.lastIndexOf('requirements'), textBefore.lastIndexOf('qualifications'));
      const lastResp = Math.max(textBefore.lastIndexOf('responsibilit'), textBefore.lastIndexOf('duties'), textBefore.lastIndexOf('what you'));

      if (lastPreferred > lastRequired && lastPreferred > lastResp) {
        return 'preferred';
      }
      if (lastRequired > lastPreferred && lastRequired > lastResp) {
        return 'required';
      }
      if (lastResp > lastRequired && lastResp > lastPreferred) {
        return 'responsibility';
      }
    }
  }

  return 'general';
};

/**
 * Extracts keywords from Job Description or Role Profile
 *
 * @param {string} jdText - Optional job description text
 * @param {object} roleProfile - Standardized role profile (BA or SWE)
 * @returns {Array<object>} Extracted keyword objects with importance, requirementType, and source sentences
 */
const extractKeywords = (jdText = '', roleProfile = null) => {
  const hasJd = Boolean(jdText && jdText.trim().length >= 30);

  // If no JD is supplied, fall back to standardized Role Profile mode
  if (!hasJd) {
    return extractFromRoleProfile(roleProfile);
  }

  return extractFromJobDescription(jdText, roleProfile);
};

/**
 * Role-Profile fallback mode
 */
const extractFromRoleProfile = (roleProfile) => {
  if (!roleProfile || !roleProfile.skills) {
    // Default fallback to taxonomy core entries
    return KEYWORD_TAXONOMY.slice(0, 30).map(item => ({
      canonicalKeyword: item.canonical,
      originalPhrase: item.canonical,
      category: item.category,
      importance: item.defaultImportance || 80,
      requirementType: item.defaultImportance >= 85 ? 'required' : 'preferred',
      frequencyInJD: 1,
      sourceSentence: `Standardized competency requirement for ${roleProfile?.roleTitle || 'target career track'}.`,
      aliases: item.aliases || [item.canonical],
      relatedKeywords: item.relatedKeywords || [],
      confidence: 1.0
    }));
  }

  const results = [];
  const registeredCanonicals = new Set();

  // 1. Process roleProfile skills
  for (const skill of roleProfile.skills) {
    const canonical = skill.canonicalName;
    registeredCanonicals.add(canonical.toLowerCase());

    const isMandatory = skill.status === 'required' || (skill.importance >= 85);
    const taxonomyMatch = KEYWORD_TAXONOMY.find(t => t.canonical.toLowerCase() === canonical.toLowerCase());

    results.push({
      canonicalKeyword: canonical,
      originalPhrase: canonical,
      category: mapRoleCategoryToKeywordCategory(skill.category, taxonomyMatch?.category),
      importance: skill.importance || taxonomyMatch?.defaultImportance || 80,
      requirementType: isMandatory ? 'required' : 'preferred',
      frequencyInJD: 1,
      sourceSentence: `Standardized core baseline qualification for ${roleProfile.roleTitle}.`,
      aliases: skill.aliases || taxonomyMatch?.aliases || [canonical],
      relatedKeywords: taxonomyMatch?.relatedKeywords || [],
      confidence: 1.0
    });
  }

  // 2. Add key role title keyword
  const titleTaxonomy = KEYWORD_TAXONOMY.find(t => t.canonical.toLowerCase() === (roleProfile.roleTitle || '').toLowerCase()) ||
    KEYWORD_TAXONOMY.find(t => roleProfile.roleTitle && roleProfile.roleTitle.toLowerCase().includes(t.canonical.toLowerCase()));
  if (titleTaxonomy && !registeredCanonicals.has(titleTaxonomy.canonical.toLowerCase())) {
    results.unshift({
      canonicalKeyword: titleTaxonomy.canonical,
      originalPhrase: titleTaxonomy.canonical,
      category: KEYWORD_CATEGORIES.JOB_TITLE,
      importance: 98,
      requirementType: 'required',
      frequencyInJD: 1,
      sourceSentence: `Target career track objective: ${roleProfile.roleTitle}.`,
      aliases: titleTaxonomy.aliases,
      relatedKeywords: titleTaxonomy.relatedKeywords || [],
      confidence: 1.0
    });
  }

  return results;
};

/**
 * Extracts and scores keywords directly from user-provided Job Description text
 */
const extractFromJobDescription = (jdText, roleProfile) => {
  const sentences = splitSentences(jdText);
  const lowerJd = jdText.toLowerCase();

  // Sort taxonomy candidates: longest alias first to guarantee phrase-matching precedence
  const searchCandidates = [];
  for (const item of KEYWORD_TAXONOMY) {
    const allPhrases = [item.canonical, ...(item.aliases || [])];
    for (const phrase of allPhrases) {
      searchCandidates.push({
        phrase,
        phraseClean: cleanForMatching(phrase),
        canonical: item.canonical,
        category: item.category,
        defaultImportance: item.defaultImportance,
        aliases: item.aliases,
        relatedKeywords: item.relatedKeywords || []
      });
    }
  }

  // Add any skills from roleProfile not in taxonomy
  if (roleProfile && roleProfile.skills) {
    for (const skill of roleProfile.skills) {
      const allPhrases = [skill.canonicalName, ...(skill.aliases || [])];
      for (const phrase of allPhrases) {
        if (!searchCandidates.some(c => c.phraseClean === cleanForMatching(phrase))) {
          searchCandidates.push({
            phrase,
            phraseClean: cleanForMatching(phrase),
            canonical: skill.canonicalName,
            category: mapRoleCategoryToKeywordCategory(skill.category),
            defaultImportance: skill.importance,
            aliases: skill.aliases || [skill.canonicalName],
            relatedKeywords: []
          });
        }
      }
    }
  }

  // Sort longest phrases first
  searchCandidates.sort((a, b) => b.phraseClean.length - a.phraseClean.length);

  const matchedKeywordsMap = new Map();

  for (const candidate of searchCandidates) {
    const phrase = candidate.phraseClean;
    if (phrase.length < 2) continue;

    // Use boundary-aware regex matching
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'gi');

    const matches = lowerJd.match(regex);
    if (!matches) continue;

    const frequencyInJD = matches.length;

    // If we haven't registered this canonical keyword yet, or if this match provides higher frequency
    if (!matchedKeywordsMap.has(candidate.canonical)) {
      // Find best representative source sentence
      let bestSentence = '';
      let bestContext = 'general';

      for (const s of sentences) {
        if (s.toLowerCase().includes(phrase)) {
          bestSentence = s;
          bestContext = detectJdSectionContext(s, jdText);
          if (bestContext === 'required' || bestContext === 'responsibility') {
            break; // Stop at first strong context match
          }
        }
      }

      // Determine requirementType: required vs preferred
      const isExplicitPreferred = bestContext === 'preferred' ||
        /(?:nice to have|bonus|plus|desired|optional)/i.test(bestSentence);
      const isExplicitRequired = bestContext === 'required' ||
        bestContext === 'title' ||
        /(?:must have|required|essential|minimum|proven experience|strong proficiency)/i.test(bestSentence);

      let requirementType = 'required';
      if (isExplicitPreferred && !isExplicitRequired) {
        requirementType = 'preferred';
      } else if (!isExplicitRequired && candidate.defaultImportance < 80) {
        requirementType = 'preferred';
      }

      // Calculate Importance (0-100) based on all holistic signals (not just repetition)
      let importance = candidate.defaultImportance || 80;

      // Section modifiers
      if (isExplicitRequired) importance += 8;
      if (isExplicitPreferred) importance -= 10;
      if (bestContext === 'responsibility') importance += 4;
      if (bestContext === 'title') importance += 10;

      // Frequency modifier (capped to avoid repetition skewing)
      if (frequencyInJD >= 3) importance += 4;
      else if (frequencyInJD === 1 && requirementType === 'preferred') importance -= 3;

      // Ensure within bounds [50, 100]
      importance = Math.min(100, Math.max(50, Math.round(importance)));

      matchedKeywordsMap.set(candidate.canonical, {
        canonicalKeyword: candidate.canonical,
        originalPhrase: candidate.phrase,
        category: candidate.category,
        importance,
        requirementType,
        frequencyInJD,
        sourceSentence: bestSentence || `Identified ${frequencyInJD} time(s) across job posting requirements.`,
        aliases: candidate.aliases || [candidate.canonical],
        relatedKeywords: candidate.relatedKeywords || [],
        confidence: candidate.phraseClean === cleanForMatching(candidate.canonical) ? 1.0 : 0.94
      });
    }
  }

  const results = Array.from(matchedKeywordsMap.values());
  // Sort by importance descending
  results.sort((a, b) => b.importance - a.importance);

  return results;
};

/**
 * Maps standard role profile categories to official keyword categories
 */
const mapRoleCategoryToKeywordCategory = (roleCat = '', fallback = null) => {
  if (fallback) return fallback;
  const lower = (roleCat || '').toLowerCase();
  if (lower.includes('programming')) return KEYWORD_CATEGORIES.PROGRAMMING_LANG;
  if (lower.includes('dsa')) return KEYWORD_CATEGORIES.DSA_TOPIC;
  if (lower.includes('cs fundamentals')) return KEYWORD_CATEGORIES.CS_FUNDAMENTAL;
  if (lower.includes('system design')) return KEYWORD_CATEGORIES.SYSTEM_DESIGN;
  if (lower.includes('tool') || lower.includes('deployment')) return KEYWORD_CATEGORIES.TOOL;
  if (lower.includes('data')) return KEYWORD_CATEGORIES.HARD_SKILL;
  if (lower.includes('business analysis') || lower.includes('process')) return KEYWORD_CATEGORIES.BIZ_METHODOLOGY;
  if (lower.includes('communication') || lower.includes('stakeholder')) return KEYWORD_CATEGORIES.SOFT_SKILL;
  return KEYWORD_CATEGORIES.HARD_SKILL;
};

module.exports = {
  extractKeywords,
  extractFromRoleProfile,
  extractFromJobDescription,
  splitSentences,
  detectJdSectionContext
};
