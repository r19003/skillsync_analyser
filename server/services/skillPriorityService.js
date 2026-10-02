/**
 * skillPriorityService.js
 *
 * Deterministic Skill-Priority Analytics Engine for SkillSync.
 * Calculates transparent priority scores for all missing or weak skills:
 *
 * Priority Score = 0.35(Role Importance)
 *                + 0.25(Market Demand)
 *                + 0.20(Gap Severity)
 *                + 0.10(Transferability)
 *                + 0.10(Learning Feasibility)
 */

/**
 * Calculates gap severity from candidate evidence level:
 * - none (completely absent):        100
 * - mentioned (listed in skills only): 65
 * - project (built a project):        30
 * - experience (work history):        10
 * - quantified (proven with metric):   0
 */
const calculateGapSeverity = (evidenceLevel) => {
  switch (evidenceLevel) {
    case 'none':       return 100;
    case 'mentioned':  return 65;
    case 'project':    return 30;
    case 'experience': return 10;
    case 'quantified': return 0;
    default:           return 100;
  }
};

/**
 * Maps priority score to qualitative categorical label
 */
const getPriorityLabel = (score) => {
  if (score >= 80) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

/**
 * Prioritizes all skills from a role profile against detected candidate evidence
 *
 * @param {Array} roleSkills - All canonical skills from role profile
 * @param {Array} detectedSkills - Candidate detected skills with evidence scores
 * @param {Map|Object} marketDemandMap - Dynamic market demand frequencies (0-100)
 * @returns {Array} Sorted list of prioritized skills
 */
const prioritizeSkills = (roleSkills = [], detectedSkills = [], marketDemandMap = {}) => {
  const evidenceLookup = new Map();
  for (const ds of detectedSkills) {
    evidenceLookup.set(ds.canonicalSkill.toLowerCase(), ds);
  }

  const results = [];

  for (const skill of roleSkills) {
    const canonical = skill.canonicalName;
    const ev = evidenceLookup.get(canonical.toLowerCase()) || {
      evidenceLevel: 'none',
      evidenceScore: 0
    };

    // If candidate already has verified or quantified experience, gap is zero unless importance is high
    const gapSeverity = calculateGapSeverity(ev.evidenceLevel);

    // Skip skills with zero gap severity (already mastered & quantified)
    if (gapSeverity === 0) continue;

    const roleImportance = skill.importance || 75;
    const marketDemand = (marketDemandMap[canonical] !== undefined)
      ? marketDemandMap[canonical]
      : (skill.marketDemand || 75);
    const transferability = skill.transferability || 80;
    const learningFeasibility = skill.learningFeasibility || 80;

    // Formula calculation
    const rawPriorityScore =
      (0.35 * roleImportance) +
      (0.25 * marketDemand) +
      (0.20 * gapSeverity) +
      (0.10 * transferability) +
      (0.10 * learningFeasibility);

    const priorityScore = Math.min(100, Math.max(0, Math.round(rawPriorityScore)));
    const priorityLabel = getPriorityLabel(priorityScore);

    // Estimated effort based on learning difficulty
    let estimatedEffort = '1-2 weeks';
    if (skill.learningDifficulty === 'advanced') estimatedEffort = '3-4 weeks';
    else if (skill.learningDifficulty === 'beginner') estimatedEffort = '3-5 days';

    // Expected readiness contribution (points this skill can boost role fit)
    const expectedContribution = parseFloat(
      ((roleImportance / 100) * (gapSeverity / 100) * 4.5).toFixed(1)
    );

    // Generate clear, honest explanation
    let explanation = '';
    if (ev.evidenceLevel === 'none') {
      explanation = `Missing core requirement. High market demand (${marketDemand}%) and role importance (${roleImportance}/100) make this a blocking gap.`;
    } else if (ev.evidenceLevel === 'mentioned') {
      explanation = `Mentioned only in skills list without supporting project or work bullets. Weak evidence reduces credibility during recruiter review.`;
    } else {
      explanation = `Present in project portfolio; adding quantified performance metrics will elevate this skill to mastery tier.`;
    }

    const suggestedAction = ev.evidenceLevel === 'none'
      ? `Learn fundamentals and build a dedicated deliverable: ${skill.suggestedPortfolioEvidence || 'end-to-end portfolio project'}.`
      : `Strengthen bullet point with measurable business or latency outcomes and link GitHub/artifact proof.`;

    results.push({
      skill: canonical,
      skillName: canonical,
      category: skill.category,
      roleImportance,
      marketDemand,
      gapSeverity,
      transferability,
      learningFeasibility,
      priorityScore,
      priorityLabel,
      currentEvidenceLevel: ev.evidenceLevel,
      currentEvidenceScore: ev.evidenceScore,
      explanation,
      suggestedAction,
      estimatedEffort,
      evidenceToProduce: skill.suggestedPortfolioEvidence || 'Documented code or business case study on portfolio repository',
      expectedContribution
    });
  }

  // Sort by priorityScore descending
  results.sort((a, b) => b.priorityScore - a.priorityScore);

  return results;
};

module.exports = {
  prioritizeSkills,
  calculateGapSeverity,
  getPriorityLabel
};
