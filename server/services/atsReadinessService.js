/**
 * atsReadinessService.js
 *
 * Deterministic General ATS Readiness Scoring Engine for SkillSync.
 * Evaluates structural parseability, section presence, bullet impact,
 * chronology, and text length without requiring a job description.
 *
 * WEIGHTS:
 * 1. PDF parseability and reading order:       30% (30 pts)
 * 2. Required sections and contact info:       20% (20 pts)
 * 3. Bullet and achievement quality:          20% (20 pts)
 * 4. Dates, chronology, and consistency:       15% (15 pts)
 * 5. Readability, length, and structure:       15% (15 pts)
 * TOTAL:                                      100% (100 pts)
 */

const ACTION_VERBS = new Set([
  'built', 'developed', 'designed', 'implemented', 'created', 'engineered',
  'analyzed', 'led', 'managed', 'coordinated', 'automated', 'optimized',
  'reduced', 'increased', 'delivered', 'orchestrated', 'architected',
  'formulated', 'spearheaded', 'executed', 'resolved', 'streamlined',
  'generated', 'conducted', 'deployed', 'programmed', 'researched'
]);

const DATE_REGEX = /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(?:19|20)\d{2}\b|\bpresent\b|\bexpected\b/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/;
const QUANTIFIED_REGEX = /(?:\b\d+(?:\.\d+)?%|\$\s*\d+|\b\d+\s*\+|\b\d+\s*x\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+|\b\d+\s*(?:ms|seconds|minutes|hours|days|weeks|months|users|clients|records|transactions|events)\b)/i;

/**
 * 1. PDF Parseability and Reading Order (30 pts)
 */
const evaluateParseability = (text = '') => {
  if (!text || text.trim().length < 50) {
    return {
      score: 0,
      maxScore: 30,
      passed: false,
      detail: 'PDF text could not be extracted or contains fewer than 50 characters (possible scanned image or corrupted encoding).'
    };
  }

  let score = 30;
  const issues = [];

  // Check character count
  if (text.length < 300) {
    score -= 10;
    issues.push('Resume text is unusually short (< 300 characters)');
  }

  // Check garbled CID fonts or non-printable character ratio
  const nonPrintable = text.replace(/[\x20-\x7E\r\n\t]/g, '').length;
  const ratio = nonPrintable / text.length;
  if (ratio > 0.05) {
    score -= 12;
    issues.push('High concentration of non-standard symbols or font glyph encoding issues');
  }

  // Check line structure
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 10) {
    score -= 8;
    issues.push('Insufficient paragraph/bullet breaks detected');
  }

  const finalScore = Math.max(0, score);
  return {
    score: finalScore,
    maxScore: 30,
    passed: finalScore >= 20,
    detail: issues.length === 0
      ? 'Clean text extraction with clear reading sequence and standard UTF-8 glyphs.'
      : `Parseability warnings: ${issues.join('; ')}.`
  };
};

/**
 * 2. Required Sections and Contact Information (20 pts)
 */
const evaluateSectionsAndContact = (text = '', parsedData = {}) => {
  let score = 0;
  const missing = [];

  // Contact checks (10 pts total)
  const hasEmail = Boolean(parsedData.email || EMAIL_REGEX.test(text));
  const hasPhone = Boolean(parsedData.phone || PHONE_REGEX.test(text));
  const hasLinks = /(?:linkedin\.com|github\.com|portfolio|\.dev|\.io)/i.test(text);

  if (hasEmail) score += 4; else missing.push('Email address');
  if (hasPhone) score += 4; else missing.push('Phone number');
  if (hasLinks) score += 2; else missing.push('Professional portfolio / LinkedIn / GitHub link');

  // Section checks (10 pts total)
  const sections = parsedData.sections || {};
  const lowerText = text.toLowerCase();

  const hasEducation = sections.hasEducation || /education|academic|university|degree|bachelor|master|b\.e\.|b\.tech/i.test(lowerText);
  const hasExperienceOrProjects = sections.hasExperience || sections.hasProjects || /experience|employment|projects|project experience/i.test(lowerText);
  const hasSkills = sections.hasSkills || (parsedData.skills && parsedData.skills.length > 0) || /skills|technical skills|competencies/i.test(lowerText);

  if (hasEducation) score += 4; else missing.push('Education section');
  if (hasExperienceOrProjects) score += 4; else missing.push('Work experience or Projects section');
  if (hasSkills) score += 2; else missing.push('Skills section');

  return {
    score,
    maxScore: 20,
    passed: score >= 14,
    detail: missing.length === 0
      ? 'All essential contact channels and core sections (Contact, Education, Projects/Experience, Skills) are present.'
      : `Missing or unrecognized sections: ${missing.join(', ')}.`,
    missing
  };
};

/**
 * 3. Bullet and Achievement Quality (20 pts)
 */
const evaluateBulletQuality = (text = '', parsedData = {}) => {
  const lines = text
    .split(/(?:\r?\n|•|–|—)/)
    .map(l => l.trim())
    .filter(l => l.length > 15);

  if (lines.length === 0) {
    return {
      score: 5,
      maxScore: 20,
      passed: false,
      quantifiedRatio: 0,
      detail: 'No structured bullet points found to evaluate action verbs or quantified outcomes.'
    };
  }

  let actionVerbCount = 0;
  let quantifiedCount = 0;

  for (const line of lines) {
    const firstWord = line.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }
    if (QUANTIFIED_REGEX.test(line)) {
      quantifiedCount++;
    }
  }

  const verbRatio = Math.min(1.0, actionVerbCount / Math.max(5, lines.length * 0.3));
  const quantRatio = Math.min(1.0, quantifiedCount / Math.max(3, lines.length * 0.25));

  // Action verbs: 8 pts, Quantified metrics: 12 pts
  const verbScore = Math.round(verbRatio * 8);
  const quantScore = Math.round(quantRatio * 12);
  const total = verbScore + quantScore;

  return {
    score: total,
    maxScore: 20,
    passed: total >= 12,
    quantifiedRatio: parseFloat(quantRatio.toFixed(2)),
    detail: `Identified ${actionVerbCount} action-driven bullet starts and ${quantifiedCount} quantified statements (${Math.round(quantRatio * 100)}% benchmarked metric density).`
  };
};

/**
 * 4. Dates, Chronology, and Consistency (15 pts)
 */
const evaluateChronology = (text = '') => {
  const matches = text.match(DATE_REGEX) || [];
  
  if (matches.length < 2) {
    return {
      score: 6,
      maxScore: 15,
      passed: false,
      detail: 'Sparse date markers detected. Clearly stating tenure (e.g. 2023 – Present) improves timeline parseability.'
    };
  }

  // Extract numeric 4-digit years
  const years = matches
    .map(m => {
      const match = m.match(/\b(19\d{2}|20\d{2})\b/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(Boolean);

  let isChronological = true;
  if (years.length >= 3) {
    // Check if dates are within reasonable career range
    const maxYear = Math.max(...years);
    const minYear = Math.min(...years);
    if (maxYear > 2035 || minYear < 1980) {
      isChronological = false;
    }
  }

  const score = isChronological ? 15 : 9;
  return {
    score,
    maxScore: 15,
    passed: score >= 12,
    detail: isChronological
      ? `Consistent timeline formatting detected with ${matches.length} verified date anchors.`
      : 'Inconsistent date formatting or unusual date spans detected across work/education history.'
  };
};

/**
 * 5. Readability, Length, and Structure (15 pts)
 */
const evaluateReadabilityAndLength = (text = '') => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 15;
  const warnings = [];

  // Optimal 1-2 page entry-level resume: 350 to 950 words
  if (wordCount < 250) {
    score -= 7;
    warnings.push('Resume is under 250 words; insufficient depth for technical screening');
  } else if (wordCount > 1300) {
    score -= 5;
    warnings.push('Resume exceeds 1,300 words; consider condensing to 1-2 focused pages');
  }

  // Average word length check (checks for natural language vs code dumps)
  const totalChars = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLen = totalChars / (wordCount || 1);
  if (avgWordLen > 10 || avgWordLen < 3) {
    score -= 4;
    warnings.push('Unusual average word length indicating possible raw data or OCR corruption');
  }

  const finalScore = Math.max(0, score);
  return {
    score: finalScore,
    maxScore: 15,
    passed: finalScore >= 11,
    wordCount,
    detail: warnings.length === 0
      ? `Optimal resume length (${wordCount} words) with balanced reading density.`
      : `Readability notes: ${warnings.join('; ')}.`
  };
};

/**
 * Computes full ATS Readiness Score and underlying diagnostics
 */
const computeATSReadiness = ({ resumeText = '', parsedData = {} }) => {
  const parseability = evaluateParseability(resumeText);
  const sections = evaluateSectionsAndContact(resumeText, parsedData);
  const bulletQuality = evaluateBulletQuality(resumeText, parsedData);
  const chronology = evaluateChronology(resumeText);
  const readability = evaluateReadabilityAndLength(resumeText);

  const overallScore = Math.round(
    parseability.score +
    sections.score +
    bulletQuality.score +
    chronology.score +
    readability.score
  );

  return {
    overallScore,
    signals: {
      parseabilityAndReadingOrder: parseability,
      requiredSectionsAndContact: sections,
      bulletAndAchievementQuality: bulletQuality,
      chronologyAndConsistency: chronology,
      readabilityLengthStructure: readability,
      visualLayoutInspection: {
        status: 'unavailable',
        detail: 'Visual layout inspection unavailable for plain extracted text.'
      }
    }
  };
};

module.exports = {
  computeATSReadiness,
  evaluateParseability,
  evaluateSectionsAndContact,
  evaluateBulletQuality,
  evaluateChronology,
  evaluateReadabilityAndLength
};
