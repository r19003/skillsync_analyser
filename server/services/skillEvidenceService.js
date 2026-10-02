/**
 * skillEvidenceService.js
 *
 * Deterministic evidence extraction engine for SkillSync.
 * Scans the actual text extracted from the resume and identifies
 * exact supporting sentences, section context, and evidence levels.
 *
 * CRITICAL INTEGRITY RULE:
 * Never invent evidence. Every piece of evidence MUST map directly
 * to a sentence extracted from the candidate's resume text.
 */

const { cleanForMatching } = require('./skillNormalizationService');

// Regular expressions to detect quantifiable impact
const QUANTIFIED_REGEX = /(?:\b\d+(?:\.\d+)?%|\$\s*\d+|\b\d+\s*\+|\b\d+\s*x\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+|\b\d+\s*(?:ms|seconds|minutes|hours|days|weeks|months|users|clients|records|transactions|events)\b)/i;

/**
 * Splits resume text into distinct sentence / bullet fragments
 */
const splitIntoSentences = (text) => {
  if (!text) return [];
  return text
    .split(/(?:\r?\n|•|–|—|\.\s+|\;\s+)/)
    .map(s => s.trim())
    .filter(s => s.length >= 8); // Skip tiny noise fragments
};

/**
 * Categorizes which section of the resume a sentence likely belongs to
 */
const detectSection = (sentence, resumeSections, contextWindow = '') => {
  const lowerSentence = sentence.toLowerCase();
  const lowerContext = contextWindow.toLowerCase();

  // Explicit check against parsed section arrays if available (supporting strings or objects)
  const toStr = (item) => (typeof item === 'string' ? item : (item ? JSON.stringify(item) : ''));

  if (resumeSections?.projects && resumeSections.projects.some(p => toStr(p).toLowerCase().includes(lowerSentence))) {
    return 'projects';
  }
  if (resumeSections?.experience && resumeSections.experience.some(e => toStr(e).toLowerCase().includes(lowerSentence))) {
    return 'experience';
  }
  if (resumeSections?.education && resumeSections.education.some(ed => toStr(ed).toLowerCase().includes(lowerSentence))) {
    return 'education';
  }

  // Header keyword detection in surrounding context
  if (/(?:project|projects|hackathon|portfolio|capstone)/i.test(lowerContext) ||
      /(?:built|developed|created|deployed|architected|designed)\s+(?:a|an|the)?\s+(?:system|app|application|platform|model|tool|pipeline|dashboard)/i.test(lowerSentence)) {
    return 'projects';
  }

  if (/(?:experience|employment|work history|professional experience|internship|intern)/i.test(lowerContext) ||
      /(?:company|inc\.|ltd\.|corp\.|executive|lead|analyst|engineer|developer|specialist|present|202\d|201\d)\b/i.test(lowerSentence)) {
    return 'experience';
  }

  if (/(?:skills|technical skills|competencies|tools & technologies|technologies|proficiencies)/i.test(lowerContext)) {
    return 'skills';
  }

  if (/(?:education|university|college|degree|bachelor|master|b\.e\.|b\.tech|cgpa|gpa)/i.test(lowerSentence)) {
    return 'education';
  }

  return 'body';
};

/**
 * Evaluates the evidence level for a given sentence
 */
const classifyEvidenceLevel = (sentence, section) => {
  const isQuantified = QUANTIFIED_REGEX.test(sentence);

  if (isQuantified && (section === 'experience' || section === 'projects')) {
    return {
      evidenceLevel: 'quantified',
      evidenceScore: 100,
      description: 'Demonstrated with measurable outcome or quantitative impact'
    };
  }

  if (section === 'experience') {
    return {
      evidenceLevel: 'experience',
      evidenceScore: 85,
      description: 'Demonstrated in professional or internship work experience'
    };
  }

  if (section === 'projects') {
    return {
      evidenceLevel: 'project',
      evidenceScore: 65,
      description: 'Demonstrated in a practical software, data, or business project'
    };
  }

  if (section === 'skills' || section === 'body') {
    return {
      evidenceLevel: 'mentioned',
      evidenceScore: 30,
      description: 'Listed in skills section without narrative evidence or impact metrics'
    };
  }

  return {
    evidenceLevel: 'mentioned',
    evidenceScore: 25,
    description: 'Mentioned in resume context'
  };
};

/**
 * Extracts supporting resume evidence for all candidate skills
 *
 * @param {Array} skillsToFind - Array of canonical skill objects (with aliases)
 * @param {string} resumeText - Full extracted resume text
 * @param {object} parsedData - Structured parsedData from Resume model
 * @returns {Array} Array of DetectedSkill objects with exact sentences and scores
 */
const extractSkillEvidence = (skillsToFind, resumeText = '', parsedData = {}) => {
  if (!skillsToFind || !Array.isArray(skillsToFind) || skillsToFind.length === 0) {
    return [];
  }

  const sentences = splitIntoSentences(resumeText);
  const parsedSections = {
    experience: parsedData.experience || [],
    projects: parsedData.projects || [],
    education: parsedData.education || [],
    skills: parsedData.skills || []
  };

  const detectedResults = [];

  for (const skill of skillsToFind) {
    const canonicalName = skill.canonicalName || skill;
    const aliases = skill.aliases || [canonicalName];
    const category = skill.category || 'General';

    // Compile regexes for canonical name and all aliases
    const searchTerms = [canonicalName, ...aliases];
    
    let bestMatch = null;
    let highestEvidenceScore = -1;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const cleanedSentence = ` ${cleanForMatching(sentence)} `;

      // Check context window (previous sentence for headings like "Projects" or "Work Experience")
      const contextWindow = i > 0 ? `${sentences[i - 1]} ${sentence}` : sentence;

      for (const term of searchTerms) {
        if (!term || term.length < 2) continue;

        let regex;
        if (term.toLowerCase() === 'c++') {
          regex = /(?:^|\s)c\+\+(?:$|\s|[,.;:!?])/i;
        } else if (term.toLowerCase() === 'c#') {
          regex = /(?:^|\s)c#(?:$|\s|[,.;:!?])/i;
        } else if (term.toLowerCase() === 'c') {
          regex = /(?:^|\s)c(?:$|\s|[,.;:!?])/i;
        } else {
          const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
        }

        if (regex.test(cleanedSentence)) {
          const section = detectSection(sentence, parsedSections, contextWindow);
          const classification = classifyEvidenceLevel(sentence, section);

          // Track best (highest evidence score) evidence for this skill
          if (classification.evidenceScore > highestEvidenceScore) {
            highestEvidenceScore = classification.evidenceScore;
            bestMatch = {
              canonicalSkill: canonicalName,
              originalPhrase: term,
              category,
              section,
              exactSentence: sentence,
              evidenceLevel: classification.evidenceLevel,
              evidenceScore: classification.evidenceScore,
              extractionConfidence: term.toLowerCase() === canonicalName.toLowerCase() ? 1.0 : 0.95,
              matchType: term.toLowerCase() === canonicalName.toLowerCase() ? 'exact' : 'alias'
            };
          }
        }
      }
    }

    if (bestMatch) {
      detectedResults.push(bestMatch);
    } else {
      // Skill was not found anywhere in resume text
      detectedResults.push({
        canonicalSkill: canonicalName,
        originalPhrase: canonicalName,
        category,
        section: 'not_found',
        exactSentence: '',
        evidenceLevel: 'none',
        evidenceScore: 0,
        extractionConfidence: 1.0,
        matchType: 'exact'
      });
    }
  }

  return detectedResults;
};

module.exports = {
  extractSkillEvidence,
  classifyEvidenceLevel,
  splitIntoSentences,
  detectSection
};
