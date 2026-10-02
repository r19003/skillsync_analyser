/**
 * keywordMatchingService.js
 *
 * Compares extracted JD/Role keywords against resume text and parsed sections.
 * Strictly classifies matches into:
 * - exact: exact phrase appears in resume
 * - alias: recognized canonical equivalent appears
 * - semantic: related concept/action appears without the exact term
 * - unsupported: listed in skills section only, without experience/project evidence
 * - missing: no evidence in resume (records transferable alternatives if related tools exist)
 */

const { cleanForMatching } = require('../skillNormalizationService');
const { splitSentences } = require('./keywordExtractionService');

// Semantic concept indicators for common methodologies and skills
const SEMANTIC_CONCEPT_PATTERNS = {
  'Requirements Gathering': [
    /(?:interviewed|conducted interviews with|elicited|gathered|documented|captured)\s+(?:users?|stakeholders?|clients?|business needs|requirements)/i,
    /(?:stakeholder interviews|user requirements|client workshops|discovery sessions)/i
  ],
  'Business Requirements Documents': [
    /(?:authored|drafted|produced|delivered|wrote)\s+(?:brd|business requirements?|functional specifications?|requirements documents?)/i
  ],
  'User Stories': [
    /(?:wrote|drafted|defined|groomed|managed)\s+(?:user stories|story points|backlog items|acceptance criteria)/i
  ],
  'Process Improvement': [
    /(?:streamlined|optimized|re-engineered|redesigned)\s+(?:workflows?|processes?|operations?|business procedures?)/i
  ],
  'Gap Analysis': [
    /(?:analyzed|evaluated|identified|compared)\s+(?:gaps?|as-is to-be|current state to future state|discrepancies)/i
  ],
  'Root-Cause Analysis': [
    /(?:diagnosed|troubleshot|investigated|identified)\s+(?:root cause|underlying issues?|bottlenecks?|defects?)/i
  ],
  'Acceptance Criteria': [
    /(?:defined|established|documented)\s+(?:definition of done|acceptance criteria|gherkin|given-when-then)/i
  ],
  'Stakeholder Management': [
    /(?:coordinated with|partnered with|liaised with|interfaced with|presented to|aligned with)\s+(?:leadership|stakeholders?|cross-functional teams?|business partners?|clients?)/i
  ],
  'DSA': [
    /(?:solved|optimized|implemented)\s+(?:algorithmic|algorithm|data structure|time complexity|space complexity|leetcode)/i
  ],
  'System Design': [
    /(?:architected|designed|scaled)\s+(?:distributed system|high-throughput|fault-tolerant|microservice architecture)/i
  ],
  'Caching': [
    /(?:implemented|integrated|leveraged)\s+(?:in-memory|cache|redis|memcached)\s+(?:to reduce latency|layer)/i
  ],
  'Load Balancing': [
    /(?:distributed|balanced|routed)\s+(?:traffic|requests?|load)\s+(?:across servers|reverse proxy)/i
  ]
};

/**
 * Detects which resume section a sentence belongs to
 */
const detectResumeSection = (sentence = '', fullText = '', parsedData = {}) => {
  const lowerS = sentence.toLowerCase();

  // Check structured parsedData arrays first
  const parsedExp = (parsedData.experience || []).map(e => (typeof e === 'string' ? e : JSON.stringify(e)).toLowerCase());
  const parsedProj = (parsedData.projects || []).map(p => (typeof p === 'string' ? p : JSON.stringify(p)).toLowerCase());
  const parsedEdu = (parsedData.education || []).map(ed => (typeof ed === 'string' ? ed : JSON.stringify(ed)).toLowerCase());
  const parsedSkills = (parsedData.skills || []).map(sk => (typeof sk === 'string' ? sk : JSON.stringify(sk)).toLowerCase());

  if (parsedExp.some(e => e.includes(lowerS.slice(0, 25)))) return 'experience';
  if (parsedProj.some(p => p.includes(lowerS.slice(0, 25)))) return 'projects';
  if (parsedEdu.some(ed => ed.includes(lowerS.slice(0, 25)))) return 'education';
  if (parsedSkills.some(sk => sk.includes(lowerS.slice(0, 20)))) return 'skills';

  // Keyword heuristic in surrounding sentence
  if (/(?:experience|employment|work history|worked at|intern|software engineer|business analyst|associate|lead)/i.test(lowerS)) {
    return 'experience';
  }
  if (/(?:project|capstone|portfolio|built|developed|created|architected|implemented)/i.test(lowerS)) {
    return 'projects';
  }
  if (/(?:bachelor|master|university|college|gpa|degree|b\.s\.|b\.e\.|b\.tech)/i.test(lowerS)) {
    return 'education';
  }
  if (/(?:skills|languages|tools|technologies|proficiencies|competencies)/i.test(lowerS)) {
    return 'skills';
  }
  if (/(?:summary|profile|about me|objective|results-driven|motivated)/i.test(lowerS)) {
    return 'summary';
  }

  // Fallback check: check line index within full resume
  const textBefore = fullText.slice(0, Math.max(0, fullText.toLowerCase().indexOf(lowerS.slice(0, 30))));
  if (textBefore.length < 350) return 'summary';

  return 'experience'; // default narrative section
};

/**
 * Compares an array of extracted keywords against candidate resume
 *
 * @param {Array<object>} targetKeywords - Array of extracted keywords from JD or Role Profile
 * @param {string} resumeText - Candidate resume text
 * @param {object} parsedData - Structured parsed resume data
 * @returns {Array<object>} Detailed comparison results
 */
const matchKeywordsAgainstResume = (targetKeywords = [], resumeText = '', parsedData = {}) => {
  const sentences = splitSentences(resumeText);
  const lowerResume = (resumeText || '').toLowerCase();
  const results = [];

  for (const kw of targetKeywords) {
    const canonical = kw.canonicalKeyword;
    const aliases = kw.aliases || [canonical];
    const category = kw.category;
    const importance = kw.importance;
    const requirementType = kw.requirementType;

    let exactMatchFound = false;
    let aliasMatchFound = false;
    let semanticMatchFound = false;
    let resumeFrequency = 0;
    let bestEvidence = '';
    let bestSection = 'none';
    const sectionsFoundSet = new Set();
    const matchingSentences = [];

    // 1. Check exact phrase match
    const cleanCanonical = cleanForMatching(canonical);
    const escapedCanonical = cleanCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactRegex = new RegExp(`(?:^|[^a-z0-9+#])${escapedCanonical}(?:$|[^a-z0-9+#])`, 'gi');
    const exactOccurrences = lowerResume.match(exactRegex);

    if (exactOccurrences) {
      exactMatchFound = true;
      resumeFrequency += exactOccurrences.length;
    }

    // 2. Check alias matches
    for (const alias of aliases) {
      const cleanAlias = cleanForMatching(alias);
      if (cleanAlias === cleanCanonical || cleanAlias.length < 2) continue;

      const escapedAlias = cleanAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const aliasRegex = new RegExp(`(?:^|[^a-z0-9+#])${escapedAlias}(?:$|[^a-z0-9+#])`, 'gi');
      const aliasOccurrences = lowerResume.match(aliasRegex);

      if (aliasOccurrences) {
        aliasMatchFound = true;
        resumeFrequency += aliasOccurrences.length;
      }
    }

    // 3. Locate all matching sentences & their sections
    const allSearchPhrases = [cleanCanonical, ...aliases.map(a => cleanForMatching(a))];
    for (const sentence of sentences) {
      const lowerS = sentence.toLowerCase();
      const hasTerm = allSearchPhrases.some(phrase => {
        if (phrase.length < 2) return false;
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'i').test(lowerS);
      });

      if (hasTerm) {
        const sec = detectResumeSection(sentence, resumeText, parsedData);
        sectionsFoundSet.add(sec);
        matchingSentences.push({ sentence, section: sec });
      }
    }

    // 4. Check semantic match if no exact or alias found
    if (!exactMatchFound && !aliasMatchFound) {
      const patterns = SEMANTIC_CONCEPT_PATTERNS[canonical];
      if (patterns && Array.isArray(patterns)) {
        for (const sentence of sentences) {
          if (patterns.some(p => p.test(sentence))) {
            semanticMatchFound = true;
            resumeFrequency = 1;
            const sec = detectResumeSection(sentence, resumeText, parsedData);
            sectionsFoundSet.add(sec);
            matchingSentences.push({ sentence, section: sec });
            break;
          }
        }
      }
    }

    // 5. Pick best representative evidence sentence
    if (matchingSentences.length > 0) {
      // Prioritize quantified experience > experience > projects > summary > skills
      const scoreSentence = (item) => {
        let s = 10;
        if (item.section === 'experience') s += 40;
        if (item.section === 'projects') s += 30;
        if (item.section === 'summary') s += 20;
        if (/\d+[%kKmM]?|\$\d+/.test(item.sentence)) s += 25; // metrics
        return s;
      };

      matchingSentences.sort((a, b) => scoreSentence(b) - scoreSentence(a));
      bestEvidence = matchingSentences[0].sentence;
      bestSection = matchingSentences[0].section;
    }

    // 6. Check for Transferable / Related Alternatives (e.g., Tableau required, Power BI in resume)
    let transferableAlternative = null;
    if (!exactMatchFound && !aliasMatchFound && !semanticMatchFound) {
      if (kw.relatedKeywords && Array.isArray(kw.relatedKeywords)) {
        for (const rel of kw.relatedKeywords) {
          const cleanRel = cleanForMatching(rel);
          const escapedRel = cleanRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const relRegex = new RegExp(`(?:^|[^a-z0-9+#])${escapedRel}(?:$|[^a-z0-9+#])`, 'i');
          if (relRegex.test(lowerResume)) {
            transferableAlternative = {
              relatedKeyword: rel,
              note: `Candidate demonstrates transferable competency with "${rel}". The requested keyword "${canonical}" is still officially missing.`
            };
            break;
          }
        }
      }
    }

    // 7. Determine Final Match Type
    let matchType = 'missing';
    let recommendation = '';

    if (exactMatchFound || aliasMatchFound) {
      // Check if it's "unsupported" (only appears in skills section, no project or experience bullets)
      const hasExperienceOrProject = sectionsFoundSet.has('experience') || sectionsFoundSet.has('projects');
      const onlyInSkills = (sectionsFoundSet.has('skills') || sectionsFoundSet.size === 0) && !hasExperienceOrProject;

      if (onlyInSkills) {
        matchType = 'unsupported';
        recommendation = `Appears only in skills list without supporting bullet. Add a verified project or work deliverable demonstrating ${canonical}.`;
      } else if (exactMatchFound) {
        matchType = 'exact';
        recommendation = bestEvidence.match(/\d+[%kKmM]?|\$\d+/)
          ? `Strong verified evidence with quantified impact.`
          : `Demonstrated in narrative bullets. Strengthen by adding a measurable performance outcome.`;
      } else {
        matchType = 'alias';
        recommendation = `Recognized canonical equivalent identified (${kw.originalPhrase || canonical}). Mirror exact JD terminology if practical.`;
      }
    } else if (semanticMatchFound) {
      matchType = 'semantic';
      recommendation = `Related conceptual narrative found. Consider explicitly adopting the recognized industry term "${canonical}" within your bullet.`;
    } else {
      matchType = 'missing';
      if (transferableAlternative) {
        recommendation = `Do not claim "${canonical}" without prior hands-on experience. Retain "${transferableAlternative.relatedKeyword}" as transferable capability, or build a dedicated deliverable in "${canonical}".`;
      } else {
        recommendation = requirementType === 'required'
          ? `Critical missing qualification. If experienced, describe real deliverables; otherwise learn through coursework before applying.`
          : `Preferred qualification. Optional boost if learned, but not blocking.`;
      }
    }

    const sectionsFound = Array.from(sectionsFoundSet);
    const placementDisplay = sectionsFound.length > 0
      ? sectionsFound.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
      : 'None';

    results.push({
      canonicalKeyword: canonical,
      originalPhrase: kw.originalPhrase || canonical,
      category,
      importance,
      requirementType,
      frequencyInJD: kw.frequencyInJD || 1,
      sourceSentence: kw.sourceSentence || '',
      matchType,
      resumeFrequency,
      bestEvidence: bestEvidence || 'No direct evidence identified in resume text.',
      placement: sectionsFound,
      placementDisplay,
      bestSection,
      transferableAlternative,
      recommendation,
      isCritical: requirementType === 'required' || importance >= 85
    });
  }

  // Sort: Critical missing first, then critical matched, then supporting
  results.sort((a, b) => {
    if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
    return b.importance - a.importance;
  });

  return results;
};

module.exports = {
  matchKeywordsAgainstResume,
  detectResumeSection,
  SEMANTIC_CONCEPT_PATTERNS
};
