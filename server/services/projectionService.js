/**
 * projectionService.js
 *
 * What-If Simulation Engine for SkillSync.
 * Rigorously simulates expected readiness and role-fit improvements
 * when a user plans to acquire or improve specific skills.
 *
 * METHODOLOGICAL ASSUMPTION:
 * Selected skills are elevated from their baseline evidence level
 * (none/mentioned) to a verified 'project' deliverable tier (evidenceScore: 65),
 * or from 'project' to a 'quantified' outcome tier (evidenceScore: 100).
 * Scores are recomputed through the deterministic scoring formulas.
 */

const { computeRoleFit, computeOverallCareerReadiness } = require('./roleMatchingService');

/**
 * Runs What-If Simulation on a CareerAnalysis record
 *
 * @param {object} baselineAnalysis - Existing CareerAnalysis document or object
 * @param {Array<string>} selectedSkills - Canonical names of skills user intends to acquire
 * @param {object} roleProfile - Role profile configuration
 * @returns {object} Simulation projection results
 */
const simulateSkillImprovement = ({
  baselineAnalysis,
  selectedSkills = [],
  roleProfile,
  resumeText = '',
  parsedData = {}
}) => {
  if (!baselineAnalysis) throw new Error('baselineAnalysis is required for projection');
  if (!roleProfile) throw new Error('roleProfile is required for projection');

  const actualResumeText = resumeText || baselineAnalysis.resumeId?.extractedText || '';
  const actualParsedData = (parsedData && Object.keys(parsedData).length > 0)
    ? parsedData
    : (baselineAnalysis.resumeId?.parsedData || {});

  const selectedSet = new Set(selectedSkills.map(s => s.toLowerCase()));
  const rawDetected = baselineAnalysis.detectedSkills || [];
  const baselineDetected = typeof rawDetected.toObject === 'function' ? rawDetected.toObject() : JSON.parse(JSON.stringify(rawDetected));

  // Deep clone detected skills and simulate elevated evidence
  const projectedDetected = baselineDetected.map(ds => {
    const skillName = ds.canonicalSkill || '';
    if (skillName && selectedSet.has(skillName.toLowerCase())) {
      let targetLevel = 'project';
      let targetScore = 65;

      if (ds.evidenceLevel === 'project' || ds.evidenceLevel === 'experience') {
        targetLevel = 'quantified';
        targetScore = 100;
      }

      return {
        ...ds,
        evidenceLevel: targetLevel,
        evidenceScore: targetScore,
        exactSentence: `[Projected Evidence]: Completed hands-on portfolio deliverable demonstrating ${skillName}.`,
        section: 'projects'
      };
    }
    return { ...ds };
  });

  // Also include any selected skills that weren't even in baseline detected array
  for (const skillName of selectedSkills) {
    if (!skillName) continue;
    const exists = projectedDetected.some(d => (d.canonicalSkill || '').toLowerCase() === skillName.toLowerCase());
    if (!exists) {
      const roleSkill = (roleProfile.skills || []).find(
        s => (s.canonicalName || '').toLowerCase() === skillName.toLowerCase()
      );
      projectedDetected.push({
        canonicalSkill: roleSkill ? roleSkill.canonicalName : skillName,
        category: roleSkill ? roleSkill.category : 'General',
        evidenceLevel: 'project',
        evidenceScore: 65,
        exactSentence: `[Projected Evidence]: Hands-on project portfolio artifact demonstrating ${skillName}.`,
        section: 'projects'
      });
    }
  }

  // Recalculate Role Fit with projected skills and preserved resume context
  const projectedRoleFit = computeRoleFit({
    detectedSkills: projectedDetected,
    roleProfile,
    jobDescription: baselineAnalysis.jobDescription || '',
    resumeText: actualResumeText,
    parsedData: actualParsedData
  });

  // Baseline scores
  const baselineFitScore = baselineAnalysis.roleFit?.overallScore || 0;
  const baselineATSScore = baselineAnalysis.atsReadiness?.overallScore || 0;
  const baselineReadiness = baselineAnalysis.overallCareerReadiness?.score || 0;

  // Recalculate Overall Career Readiness with projected Role Fit
  const projectedCareerReadiness = computeOverallCareerReadiness({
    roleFitScore: projectedRoleFit.overallScore,
    atsReadinessScore: baselineATSScore,
    interviewAssessment: baselineAnalysis.interviewReadiness?.assessed ? baselineAnalysis.interviewReadiness : null
  });

  // Calculate coverage changes
  const requiredSkills = (roleProfile.skills || []).filter(s => s.status === 'required');
  const countCoveredBefore = baselineDetected.filter(d => 
    d.evidenceLevel !== 'none' && requiredSkills.some(r => (r.canonicalName || '').toLowerCase() === (d.canonicalSkill || '').toLowerCase())
  ).length;

  const countCoveredAfter = projectedDetected.filter(d => 
    d.evidenceLevel !== 'none' && requiredSkills.some(r => (r.canonicalName || '').toLowerCase() === (d.canonicalSkill || '').toLowerCase())
  ).length;

  const coverageBefore = requiredSkills.length > 0 ? Math.round((countCoveredBefore / requiredSkills.length) * 100) : 0;
  const coverageAfter = requiredSkills.length > 0 ? Math.round((countCoveredAfter / requiredSkills.length) * 100) : 0;

  // Calculate individual marginal ROI for top missing skills
  const marginalROI = (roleProfile.skills || [])
    .filter(s => !selectedSet.has((s.canonicalName || '').toLowerCase()))
    .map(skill => {
      const ev = baselineDetected.find(d => (d.canonicalSkill || '').toLowerCase() === (skill.canonicalName || '').toLowerCase());
      if (ev && ev.evidenceScore >= 85) return null; // already high
      const expectedReturn = parseFloat(((skill.importance / 100) * 4.2).toFixed(1));
      return {
        skill: skill.canonicalName,
        category: skill.category,
        importance: skill.importance,
        estimatedPointsGain: expectedReturn
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.estimatedPointsGain - a.estimatedPointsGain)
    .slice(0, 5);

  return {
    simulationId: `sim_${Date.now()}`,
    selectedSkills,
    baselineRoleFit: baselineFitScore,
    projectedRoleFit: projectedRoleFit.overallScore,
    roleFitDelta: projectedRoleFit.overallScore - baselineFitScore,

    baselineReadiness,
    projectedReadiness: projectedCareerReadiness.score,
    readinessDelta: projectedCareerReadiness.score - baselineReadiness,

    coverageBefore,
    coverageAfter,
    coverageDelta: coverageAfter - coverageBefore,

    projectedRoleFitBreakdown: projectedRoleFit.breakdown,
    topReturnSkills: marginalROI,

    assumptions: [
      'Documented Assumption: Selected skills are upgraded to "project" level evidence (evidenceScore: 65) with demonstrable portfolio artifacts.',
      'ATS structural readability and parseability remain unchanged from baseline.',
      'Deterministic recalculation executed through the standard SkillSync 6-category Role Fit matrix.'
    ],
    timestamp: new Date()
  };
};

module.exports = {
  simulateSkillImprovement
};
