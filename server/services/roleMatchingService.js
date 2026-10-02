/**
 * roleMatchingService.js
 *
 * Deterministic Role Fit & Overall Career Readiness Engine for SkillSync.
 * Evaluates skill coverage, experience alignment, education qualifications,
 * and tracks interview readiness and hard eligibility gates separately.
 */

const { extractSkillsFromText, normalizeSkillList } = require('./skillNormalizationService');
const { extractSkillEvidence } = require('./skillEvidenceService');

/**
 * Checks hard eligibility constraints (experience, degree, auth)
 * Does NOT affect the 0-100 weighted fit score, keeping gates transparent.
 */
const evaluateEligibilityGates = ({ resumeText = '', parsedData = {}, roleProfile = {}, jobDescription = '' }) => {
  const warnings = [];
  const textLower = resumeText.toLowerCase();

  // 1. Minimum Experience
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?(?:\s+of)?\s+experience/i);
  const detectedYears = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
  const minRequiredYears = roleProfile.hardEligibilityCriteria?.minExperienceYears || 0;

  if (detectedYears < minRequiredYears) {
    warnings.push({
      criteria: 'Minimum Experience',
      status: 'warning',
      detail: `Target role specifies ${minRequiredYears} year(s) minimum experience. Detected approximate experience is ${detectedYears} year(s).`
    });
  } else {
    warnings.push({
      criteria: 'Minimum Experience',
      status: 'pass',
      detail: `Meets entry-level experience requirements (${detectedYears} year(s) detected).`
    });
  }

  // 2. Degree Alignment
  const targetDegrees = roleProfile.hardEligibilityCriteria?.targetDegrees || [];
  let degreeMatched = false;
  let matchedDegreeName = '';

  for (const deg of targetDegrees) {
    if (textLower.includes(deg.toLowerCase())) {
      degreeMatched = true;
      matchedDegreeName = deg;
      break;
    }
  }

  // Common engineering acronyms
  if (!degreeMatched && /(?:b\.e\.|b\.tech|bachelor of engineering|bachelor of technology|b\.s\.|b\.a\.)/i.test(textLower)) {
    degreeMatched = true;
    matchedDegreeName = 'Engineering / Technical Bachelor Degree';
  }

  if (degreeMatched) {
    warnings.push({
      criteria: 'Degree Qualification',
      status: 'pass',
      detail: `Academic background matches target field: "${matchedDegreeName}".`
    });
  } else {
    warnings.push({
      criteria: 'Degree Qualification',
      status: 'warning',
      detail: `Target degree in ${targetDegrees.slice(0, 3).join(', ')} not explicitly identified in resume education section.`
    });
  }

  // 3. Work Authorization (if JD mentions visa sponsorship)
  if (/requires work authorization|no sponsorship|us citizen or permanent resident|security clearance/i.test(jobDescription.toLowerCase())) {
    warnings.push({
      criteria: 'Work Authorization Notice',
      status: 'warning',
      detail: 'Job description indicates specific citizenship, clearance, or work authorization criteria without visa sponsorship.'
    });
  } else {
    warnings.push({
      criteria: 'Work Authorization',
      status: 'pass',
      detail: 'Standard candidate eligibility applies. No restrictive clearance detected.'
    });
  }

  return warnings;
};

/**
 * Computes Role Fit or JD Match score deterministically
 *
 * Weights:
 * - Mandatory skill coverage:                    30% (30 pts)
 * - Responsibility-to-experience alignment:      25% (25 pts)
 * - Experience, level, and recency:              20% (20 pts)
 * - Education and certification:                 10% (10 pts)
 * - Preferred skill coverage:                    10% (10 pts)
 * - Role title and domain alignment:              5% (5 pts)
 * Total:                                        100% (100 pts)
 */
const computeRoleFit = ({
  detectedSkills = [],
  roleProfile = {},
  jobDescription = '',
  resumeText = '',
  parsedData = {}
}) => {
  const isJDAnalysis = Boolean(jobDescription && jobDescription.trim().length >= 30);
  const label = isJDAnalysis ? 'JD Match' : 'Role Fit';

  const allSkills = roleProfile.skills || [];
  const requiredSkills = allSkills.filter(s => s.status === 'required');
  const preferredSkills = allSkills.filter(s => s.status === 'preferred');

  // Create lookup for candidate detected evidence
  const evidenceMap = new Map();
  for (const ds of detectedSkills) {
    evidenceMap.set(ds.canonicalSkill.toLowerCase(), ds);
  }

  // 1. Mandatory Skill Coverage (30 pts)
  let mandatoryMatchedCount = 0;
  let mandatoryEvidenceWeightSum = 0;

  for (const req of requiredSkills) {
    const ev = evidenceMap.get(req.canonicalName.toLowerCase());
    if (ev && ev.evidenceLevel !== 'none') {
      mandatoryMatchedCount++;
      // Weight by evidence level (quantified/experience count full; mentioned counts 50%)
      const multiplier = ev.evidenceScore >= 65 ? 1.0 : ev.evidenceScore >= 30 ? 0.6 : 0.3;
      mandatoryEvidenceWeightSum += multiplier;
    }
  }

  const mandatoryRatio = requiredSkills.length > 0
    ? mandatoryEvidenceWeightSum / requiredSkills.length
    : 1.0;
  const mandatoryScore = Math.round(mandatoryRatio * 30);

  // 2. Responsibility Semantic Alignment (25 pts)
  // Scans candidate projects/experience against core action verbs & responsibilities
  const expBullets = (parsedData.experience || []).concat(parsedData.projects || []);
  const expText = expBullets.join(' ').toLowerCase();

  let responsibilityHitCount = 0;
  const targetTopics = roleProfile.categories || [];
  for (const topic of targetTopics) {
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (topicWords.some(w => expText.includes(w) || resumeText.toLowerCase().includes(w))) {
      responsibilityHitCount++;
    }
  }
  const respRatio = targetTopics.length > 0 ? responsibilityHitCount / targetTopics.length : 1.0;
  const responsibilityScore = Math.round(respRatio * 25);

  // 3. Experience, Level, and Recency Alignment (20 pts)
  // Entry-level roles reward having at least 1-2 active projects or internships
  let expScore = 10; // Baseline entry level
  if (parsedData.experience && parsedData.experience.length >= 1) expScore += 5;
  if (parsedData.projects && parsedData.projects.length >= 2) expScore += 5;
  expScore = Math.min(20, expScore);

  // 4. Education and Certification Alignment (10 pts)
  let eduScore = 5;
  const lowerText = resumeText.toLowerCase();
  const targetDegrees = roleProfile.hardEligibilityCriteria?.targetDegrees || [];
  if (targetDegrees.some(d => lowerText.includes(d.toLowerCase())) || /computer science|business analytics|information systems|engineering/i.test(lowerText)) {
    eduScore += 4;
  }
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    eduScore += 1;
  }
  eduScore = Math.min(10, eduScore);

  // 5. Preferred Skill Coverage (10 pts)
  let preferredMatchedCount = 0;
  for (const pref of preferredSkills) {
    const ev = evidenceMap.get(pref.canonicalName.toLowerCase());
    if (ev && ev.evidenceLevel !== 'none') {
      preferredMatchedCount++;
    }
  }
  const prefRatio = preferredSkills.length > 0 ? preferredMatchedCount / preferredSkills.length : 0.5;
  const preferredScore = Math.round(prefRatio * 10);

  // 6. Role Title and Domain Alignment (5 pts)
  let titleScore = 2;
  const roleKeywords = roleProfile.roleTitle.toLowerCase().split(/\s+/);
  if (roleKeywords.some(kw => kw.length > 3 && lowerText.includes(kw))) {
    titleScore = 5;
  }

  const overallScore = Math.min(100, mandatoryScore + responsibilityScore + expScore + eduScore + preferredScore + titleScore);

  return {
    overallScore,
    label,
    breakdown: {
      mandatorySkillCoverage: {
        score: mandatoryScore,
        maxScore: 30,
        coverageRatio: parseFloat(mandatoryRatio.toFixed(2)),
        detail: `Candidate demonstrates evidence for ${mandatoryMatchedCount} of ${requiredSkills.length} mandatory ${roleProfile.roleTitle} skills.`
      },
      responsibilitySemanticAlignment: {
        score: responsibilityScore,
        maxScore: 25,
        detail: `Demonstrated alignment across ${responsibilityHitCount} of ${targetTopics.length} functional role domain categories.`
      },
      experienceRecencyAlignment: {
        score: expScore,
        maxScore: 20,
        detail: `Evaluated ${parsedData.experience?.length || 0} work history record(s) and ${parsedData.projects?.length || 0} active project portfolio items.`
      },
      educationCertificationAlignment: {
        score: eduScore,
        maxScore: 10,
        detail: 'Academic discipline and relevant credentials aligned with target role baseline.'
      },
      preferredSkillCoverage: {
        score: preferredScore,
        maxScore: 10,
        detail: `Demonstrated ${preferredMatchedCount} of ${preferredSkills.length} differentiating preferred skills.`
      },
      titleDomainAlignment: {
        score: titleScore,
        maxScore: 5,
        detail: 'Keyword and domain title alignment within resume headers and summaries.'
      }
    }
  };
};

/**
 * Computes Dedicated Software Engineer Domain Analytics
 * (DSA, CS Fundamentals, System Design)
 */
const computeSWEReadinessAnalytics = (detectedSkills = [], roleProfile = {}) => {
  if (roleProfile.roleTrack !== 'Software Engineer') return null;

  const getCategoryAvg = (categoryName) => {
    const catSkills = detectedSkills.filter(s => s.category === categoryName);
    if (catSkills.length === 0) return 0;
    const sum = catSkills.reduce((acc, s) => acc + (s.evidenceScore || 0), 0);
    return Math.round(sum / catSkills.length);
  };

  const dsaScore = getCategoryAvg('DSA');
  const csFundamentalsScore = getCategoryAvg('CS fundamentals');
  const systemDesignScore = getCategoryAvg('System design');

  return {
    dsaScore,
    csFundamentalsScore,
    systemDesignScore,
    details: `DSA Readiness: ${dsaScore}/100 | CS Fundamentals: ${csFundamentalsScore}/100 | System Design: ${systemDesignScore}/100`
  };
};

/**
 * Computes Overall Career Readiness Score
 *
 * With Interview Data:
 * - Role/Job Fit:      60%
 * - ATS Readiness:     25%
 * - Interview Readiness: 15%
 *
 * Without Interview Data (Default):
 * - Role/Job Fit:      60 / 85 ≈ 70.59%
 * - ATS Readiness:     25 / 85 ≈ 29.41%
 */
const computeOverallCareerReadiness = ({
  roleFitScore = 0,
  atsReadinessScore = 0,
  interviewAssessment = null
}) => {
  const hasInterview = Boolean(interviewAssessment && interviewAssessment.assessed && typeof interviewAssessment.overallScore === 'number');

  if (hasInterview) {
    const interviewScore = interviewAssessment.overallScore;
    const score = Math.round(
      (roleFitScore * 0.60) +
      (atsReadinessScore * 0.25) +
      (interviewScore * 0.15)
    );

    return {
      score,
      componentsIncluded: [
        { name: 'Role / Job Fit', weight: 0.60, score: roleFitScore },
        { name: 'General ATS Readiness', weight: 0.25, score: atsReadinessScore },
        { name: 'Interview Readiness', weight: 0.15, score: interviewScore }
      ],
      formulaExplanation: 'Overall Readiness = 0.60(Role Fit) + 0.25(ATS Readiness) + 0.15(Assessed Interview Readiness)'
    };
  }

  // Renormalize with Role Fit (60/85) and ATS Readiness (25/85)
  const weightRoleFit = 60 / 85;
  const weightATS = 25 / 85;
  const score = Math.round((roleFitScore * weightRoleFit) + (atsReadinessScore * weightATS));

  return {
    score,
    componentsIncluded: [
      { name: 'Role / Job Fit', weight: parseFloat(weightRoleFit.toFixed(3)), score: roleFitScore },
      { name: 'General ATS Readiness', weight: parseFloat(weightATS.toFixed(3)), score: atsReadinessScore },
      { name: 'Interview Readiness (Unassessed)', weight: 0, score: null }
    ],
    formulaExplanation: 'Overall Readiness = 0.706(Role Fit) + 0.294(ATS Readiness) [Interview readiness unassessed]'
  };
};

module.exports = {
  computeRoleFit,
  evaluateEligibilityGates,
  computeSWEReadinessAnalytics,
  computeOverallCareerReadiness
};
