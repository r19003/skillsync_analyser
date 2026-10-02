/**
 * jobTitleService.js
 *
 * Analyzes candidate job titles against target role and JD expectations:
 * - Summary title vs target role
 * - Past / current experience titles
 * - Seniority level compatibility (e.g. Junior vs Senior, Entry-Level vs Lead)
 * - Transferable title relationships (e.g. Data Analyst <-> Business Analyst,
 *   Full-Stack Developer <-> Software Engineer) without unfair penalties.
 */

const TITLE_RELATIONSHIPS = {
  'Business Analyst': {
    directEquivalents: ['Associate Business Analyst', 'Junior Business Analyst', 'Business Systems Analyst', 'BA'],
    transferableTitles: ['Data Analyst', 'Product Analyst', 'Operations Analyst', 'BI Analyst', 'Process Analyst'],
    explanation: 'Titles in Data Analytics or Product Analytics transfer strong analytical problem-solving and SQL/reporting foundations to a Business Analyst track.'
  },
  'Software Engineer': {
    directEquivalents: ['Software Developer', 'Associate Software Engineer', 'Junior Software Developer', 'SDE', 'SWE'],
    transferableTitles: ['Full-Stack Developer', 'Backend Developer', 'Frontend Developer', 'Web Developer', 'Programmer Analyst'],
    explanation: 'Full-stack or specialized backend/frontend titles demonstrate direct software engineering competencies across application lifecycles.'
  }
};

/**
 * Evaluates job title alignment and seniority compatibility
 *
 * @param {string} targetRoleTitle - Target role title (e.g. "Entry-Level Software Engineer")
 * @param {string} resumeText - Full candidate resume text
 * @param {object} parsedData - Structured parsed resume data (experience, education)
 * @returns {object} Title alignment report
 */
const analyzeJobTitleAlignment = (targetRoleTitle = 'Entry-Level Software Engineer', resumeText = '', parsedData = {}) => {
  const isBA = /business\s+analyst/i.test(targetRoleTitle);
  const canonicalTarget = isBA ? 'Business Analyst' : 'Software Engineer';
  const relConfig = TITLE_RELATIONSHIPS[canonicalTarget] || TITLE_RELATIONSHIPS['Software Engineer'];

  const lowerText = (resumeText || '').toLowerCase();
  const expTitles = [];

  // Extract titles from parsedData experience if available
  if (parsedData.experience && Array.isArray(parsedData.experience)) {
    for (const exp of parsedData.experience) {
      if (typeof exp === 'object' && exp.title) expTitles.push(exp.title);
      else if (typeof exp === 'string') {
        const match = exp.match(/([a-zA-Z\s]{4,30}(?:engineer|developer|analyst|intern|lead|associate|specialist))/i);
        if (match) expTitles.push(match[1].trim());
      }
    }
  }

  // Scan text for common title occurrences if none extracted
  if (expTitles.length === 0) {
    const titleRegex = /(?:software engineer|software developer|full[- ]stack developer|backend developer|frontend developer|business analyst|data analyst|systems analyst|engineering intern|analyst intern)/gi;
    const found = lowerText.match(titleRegex);
    if (found) {
      expTitles.push(...Array.from(new Set(found)));
    }
  }

  // Check direct title match
  const hasDirectMatch = expTitles.some(t =>
    relConfig.directEquivalents.some(de => t.toLowerCase().includes(de.toLowerCase())) ||
    t.toLowerCase().includes(canonicalTarget.toLowerCase())
  );

  // Check transferable match
  const matchedTransferable = expTitles.find(t =>
    relConfig.transferableTitles.some(tt => t.toLowerCase().includes(tt.toLowerCase()))
  );

  // Check seniority compatibility
  const hasSeniorityMismatch = /(?:senior|lead|principal|architect|director|staff)\s+(?:engineer|developer|analyst)/i.test(lowerText);

  let alignmentStatus = 'aligned';
  let titleScore = 90;
  let explanation = `Direct title alignment identified with target role: ${canonicalTarget}.`;

  if (hasDirectMatch) {
    alignmentStatus = 'direct_match';
    titleScore = 100;
    explanation = `Candidate resume features direct target title experience ("${canonicalTarget}").`;
  } else if (matchedTransferable) {
    alignmentStatus = 'transferable_aligned';
    titleScore = 85;
    explanation = `Transferable title detected ("${matchedTransferable}"). ${relConfig.explanation}`;
  } else if (expTitles.length > 0) {
    alignmentStatus = 'adjacent';
    titleScore = 70;
    explanation = `Identified adjacent background in "${expTitles[0]}". Ensure technical summary and projects prominently highlight target ${canonicalTarget} tools.`;
  } else {
    alignmentStatus = 'unspecified_entry';
    titleScore = 75;
    explanation = `No formal job titles extracted. Expected for entry-level candidates or new graduates focusing on project portfolios and academic credentials.`;
  }

  if (hasSeniorityMismatch) {
    explanation += ' Note: Senior/Lead phrasing detected in resume context; ensure entry-level alignment if applying for early-career positions.';
  }

  return {
    targetRoleTitle,
    canonicalTarget,
    extractedTitles: expTitles,
    alignmentStatus,
    titleScore,
    explanation,
    isSeniorityCompatible: !hasSeniorityMismatch,
    transferableNote: relConfig.explanation
  };
};

module.exports = {
  analyzeJobTitleAlignment
};
