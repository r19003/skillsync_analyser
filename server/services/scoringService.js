/**
 * Scoring Service
 *
 * Transparent ATS scoring formula (no black box):
 *
 *  Category                  | Weight
 *  ──────────────────────────|────────
 *  Keyword match (JD vs res) | 40%
 *  Skills overlap            | 20%
 *  Section completeness      | 20%
 *  Formatting / structure    | 10%
 *  Experience / project rel. | 10%
 *  ──────────────────────────|────────
 *  Total                     | 100
 *
 * Returns: atsScore, matchPercentage, scoreBreakdown, matchedSkills,
 *          missingSkills, extraSkills, strengths, weaknesses, recommendations
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Keyword Match Score (40 points)
//    How many JD keywords appear in the resume text?
// ─────────────────────────────────────────────────────────────────────────────
const scoreKeywordMatch = (resumeText, jobKeywords) => {
  const MAX = 40;
  if (!jobKeywords || jobKeywords.length === 0) return { score: MAX * 0.5, maxScore: MAX, matched: [], missing: [], detail: 'No keywords extracted from JD.' };

  const lower = resumeText.toLowerCase();
  const matched = jobKeywords.filter((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
  const missing = jobKeywords.filter((kw) => !matched.includes(kw));

  const ratio = matched.length / jobKeywords.length;
  const score = Math.round(ratio * MAX);

  return {
    score,
    maxScore: MAX,
    matched,
    missing,
    detail: `${matched.length} of ${jobKeywords.length} JD keywords found in resume (${Math.round(ratio * 100)}%).`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Skills Overlap Score (20 points)
//    How many required JD skills appear in resume skills?
// ─────────────────────────────────────────────────────────────────────────────
const scoreSkillsOverlap = (resumeSkills, requiredJobSkills) => {
  const MAX = 20;
  if (!requiredJobSkills || requiredJobSkills.length === 0) return { score: MAX * 0.5, maxScore: MAX, matchedSkills: [], missingSkills: [], extraSkills: [], detail: 'No required skills detected in JD.' };

  const normalizedResume = resumeSkills.map((s) => s.toLowerCase());
  const normalizedJD = requiredJobSkills.map((s) => s.toLowerCase());

  const matchedSkills = normalizedJD.filter((s) => normalizedResume.includes(s));
  const missingSkills = normalizedJD.filter((s) => !normalizedResume.includes(s));
  const extraSkills = normalizedResume.filter((s) => !normalizedJD.includes(s));

  const ratio = matchedSkills.length / normalizedJD.length;
  const score = Math.round(ratio * MAX);

  return {
    score,
    maxScore: MAX,
    matchedSkills,
    missingSkills,
    extraSkills,
    detail: `${matchedSkills.length} of ${normalizedJD.length} required skills matched (${Math.round(ratio * 100)}%).`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Section Completeness Score (20 points)
//    Does the resume have the critical sections?
// ─────────────────────────────────────────────────────────────────────────────
const scoreSectionCompleteness = (sections) => {
  const MAX = 20;
  const weights = {
    hasExperience: 5,     // Very important
    hasEducation: 5,      // Very important
    hasSkills: 4,         // Important
    hasProjects: 3,       // Nice to have
    hasSummary: 2,        // Optional
    hasCertifications: 1, // Bonus
  };

  let earned = 0;
  const present = [];
  const absent = [];

  for (const [key, pts] of Object.entries(weights)) {
    if (sections && sections[key]) {
      earned += pts;
      present.push(key.replace('has', ''));
    } else {
      absent.push(key.replace('has', ''));
    }
  }

  return {
    score: earned,
    maxScore: MAX,
    presentSections: present,
    missingSections: absent,
    detail: `Sections found: ${present.join(', ') || 'None'}. Missing: ${absent.join(', ') || 'None'}.`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Formatting / Structure Score (10 points)
//    Basic signal checks on the raw text
// ─────────────────────────────────────────────────────────────────────────────
const scoreFormatting = (resumeText) => {
  const MAX = 10;
  let score = 0;
  const signals = [];

  // Has email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText)) {
    score += 2; signals.push('Email present');
  }
  // Has phone
  if (/(\+?\d[\d\s.\-()]{8,}\d)/.test(resumeText)) {
    score += 2; signals.push('Phone present');
  }
  // Has reasonable length (at least 200 chars — not a completely empty doc)
  if (resumeText.length > 200) {
    score += 2; signals.push('Adequate content length');
  }
  // Has bullet points or dashes (structured formatting)
  if (/^[\s]*[-•·▪*]/m.test(resumeText)) {
    score += 2; signals.push('Bullet points detected');
  }
  // Has dates (suggests experience/education entries)
  if (/\b(20\d{2}|19\d{2})\b/.test(resumeText)) {
    score += 2; signals.push('Dates detected (experience/education)');
  }

  return {
    score,
    maxScore: MAX,
    signals,
    detail: `Structural signals: ${signals.join(', ') || 'None detected'}.`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Experience / Project Relevance Score (10 points)
//    Does the resume mention job-relevant terms in experience/project sections?
// ─────────────────────────────────────────────────────────────────────────────
const scoreExperienceRelevance = (resumeText, jobKeywords) => {
  const MAX = 10;
  if (!jobKeywords || jobKeywords.length === 0) return { score: 5, maxScore: MAX, detail: 'No JD context to measure relevance.' };

  // Look at a broader slice rather than strict sections
  const lowerText = resumeText.toLowerCase();
  const relevantHits = jobKeywords.filter((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  }).length;

  const ratio = Math.min(relevantHits / (jobKeywords.length * 0.5), 1); // Threshold: 50% is full score
  const score = Math.round(ratio * MAX);

  return {
    score,
    maxScore: MAX,
    detail: `${relevantHits} JD-relevant terms found in resume body.`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate feedback (strengths, weaknesses, recommendations)
// ─────────────────────────────────────────────────────────────────────────────
const generateFeedback = ({ matchedSkills, missingSkills, extraSkills, sections, atsScore, scoreBreakdown }) => {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // Strengths
  if (matchedSkills.length > 0) {
    strengths.push(`Strong skill alignment: ${matchedSkills.slice(0, 5).join(', ')} match the job requirements.`);
  }
  if (sections?.hasExperience) strengths.push('Work experience section is present.');
  if (sections?.hasProjects) strengths.push('Projects section demonstrates practical application.');
  if (sections?.hasSummary) strengths.push('Professional summary helps recruiters quickly understand your profile.');
  if (sections?.hasCertifications) strengths.push('Certifications add credibility to your technical skills.');
  if (scoreBreakdown?.formatting?.score >= 7) strengths.push('Resume has good structural formatting (contact info, dates, bullets).');

  // Weaknesses
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing ${missingSkills.length} required skills: ${missingSkills.slice(0, 5).join(', ')}.`);
  }
  if (!sections?.hasExperience) weaknesses.push('No work experience section detected — critical for most roles.');
  if (!sections?.hasSkills) weaknesses.push('No skills section found — ATS scanners rely on this heavily.');
  if (!sections?.hasEducation) weaknesses.push('Education section is missing.');
  if (scoreBreakdown?.keywordMatch?.score < 20) weaknesses.push('Low keyword match — resume doesn\'t reflect JD language well.');

  // Recommendations
  if (missingSkills.length > 0) {
    recommendations.push(`Add these missing skills to your resume (if you have them): ${missingSkills.slice(0, 5).join(', ')}.`);
  }
  if (!sections?.hasSummary) {
    recommendations.push('Add a professional summary at the top of your resume tailored to this role.');
  }
  if (!sections?.hasProjects) {
    recommendations.push('Add a projects section to demonstrate hands-on experience.');
  }
  if (atsScore < 50) {
    recommendations.push('Tailor your resume specifically to this job description — use the same terminology as the JD.');
  }
  if (scoreBreakdown?.formatting?.score < 6) {
    recommendations.push('Add your phone number, email, bullet points, and year ranges to improve structure score.');
  }
  if (extraSkills.length > 3) {
    recommendations.push(`You have extra skills not in the JD (${extraSkills.slice(0, 3).join(', ')}) — these can still impress but don't boost ATS score for this role.`);
  }

  return { strengths, weaknesses, recommendations };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export: computeATSScore
// ─────────────────────────────────────────────────────────────────────────────
const computeATSScore = ({ resumeText, resumeSkills, parsedSections, jobKeywords, requiredJobSkills }) => {

  // Run each scoring component
  const keywordResult = scoreKeywordMatch(resumeText, jobKeywords);
  const skillsResult = scoreSkillsOverlap(resumeSkills, requiredJobSkills);
  const sectionResult = scoreSectionCompleteness(parsedSections);
  const formattingResult = scoreFormatting(resumeText);
  const experienceResult = scoreExperienceRelevance(resumeText, jobKeywords);

  // Total ATS score (out of 100)
  const atsScore = Math.min(
    keywordResult.score +
    skillsResult.score +
    sectionResult.score +
    formattingResult.score +
    experienceResult.score,
    100
  );

  // Match percentage — based purely on skill overlap (more focused)
  const matchPercentage = requiredJobSkills.length > 0
    ? Math.round((skillsResult.matchedSkills.length / requiredJobSkills.length) * 100)
    : Math.round((keywordResult.matched.length / Math.max(jobKeywords.length, 1)) * 100);

  const scoreBreakdown = {
    keywordMatch: { score: keywordResult.score, maxScore: 40, detail: keywordResult.detail },
    skillsOverlap: { score: skillsResult.score, maxScore: 20, detail: skillsResult.detail },
    sectionCompleteness: { score: sectionResult.score, maxScore: 20, detail: sectionResult.detail },
    formatting: { score: formattingResult.score, maxScore: 10, detail: formattingResult.detail },
    experienceRelevance: { score: experienceResult.score, maxScore: 10, detail: experienceResult.detail },
  };

  const feedback = generateFeedback({
    matchedSkills: skillsResult.matchedSkills,
    missingSkills: skillsResult.missingSkills,
    extraSkills: skillsResult.extraSkills,
    sections: parsedSections,
    atsScore,
    scoreBreakdown,
  });

  return {
    atsScore,
    matchPercentage,
    scoreBreakdown,
    matchedSkills: skillsResult.matchedSkills,
    missingSkills: skillsResult.missingSkills,
    extraSkills: skillsResult.extraSkills,
    ...feedback,
  };
};

module.exports = { computeATSScore };
