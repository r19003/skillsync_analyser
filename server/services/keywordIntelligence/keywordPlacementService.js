/**
 * keywordPlacementService.js
 *
 * Evaluates the structural placement of high-value keywords across resume sections:
 * - Summary
 * - Skills
 * - Experience
 * - Projects
 * - Education & Certifications
 *
 * Enforces natural distribution without recommending placing every keyword in every section.
 */

const evaluateKeywordPlacement = (matchedKeywords = [], roleProfile = null) => {
  const sectionCounts = {
    summary: 0,
    skills: 0,
    experience: 0,
    projects: 0,
    education: 0
  };

  const highImportanceKeywords = matchedKeywords.filter(k => k.importance >= 80);
  const matchedHighImp = highImportanceKeywords.filter(k => k.matchType !== 'missing');

  let points = 0;
  const maxPossible = 100;
  const sectionRecommendations = [];

  for (const item of matchedKeywords) {
    if (item.placement && Array.isArray(item.placement)) {
      for (const sec of item.placement) {
        if (sectionCounts[sec] !== undefined) {
          sectionCounts[sec]++;
        }
      }
    }
  }

  // 1. Technical tools & hard skills in Skills section (up to 25 pts)
  const toolsInSkills = matchedKeywords.filter(k =>
    (k.category === 'Software and tools' || k.category === 'Programming languages' || k.category === 'Hard skills') &&
    k.placement?.includes('skills')
  ).length;
  points += Math.min(25, toolsInSkills * 10);

  // 2. High importance competencies demonstrated in Experience or Projects (up to 35 pts)
  const inActionBullets = matchedHighImp.filter(k =>
    k.placement?.includes('experience') || k.placement?.includes('projects')
  ).length;
  points += Math.min(35, inActionBullets * 12);

  // 3. Primary role title or target domain anchor in Summary (up to 20 pts)
  const inSummary = matchedKeywords.some(k =>
    (k.category === 'Job title keywords' || k.importance >= 90) &&
    k.placement?.includes('summary')
  );
  if (inSummary) points += 20;

  // 4. Balanced section breadth across entire resume (up to 20 pts)
  const activeSections = Object.values(sectionCounts).filter(c => c > 0).length;
  points += Math.min(20, activeSections * 5);

  const placementScore = Math.min(100, Math.round(points));

  // Generate actionable, section-specific placement recommendations
  if (!inSummary) {
    sectionRecommendations.push({
      section: 'Professional Summary',
      recommendation: `Incorporate target role title ("${roleProfile?.roleTitle || 'Target Role'}") into the summary header to immediately anchor recruiter relevance.`
    });
  }

  const unsupportedHighImp = highImportanceKeywords.filter(k => k.matchType === 'unsupported');
  if (unsupportedHighImp.length > 0) {
    const names = unsupportedHighImp.slice(0, 3).map(k => k.canonicalKeyword).join(', ');
    sectionRecommendations.push({
      section: 'Experience / Projects',
      recommendation: `Move or expand ${names} from bare skill list into work experience or project bullets with tangible deliverables.`
    });
  }

  const missingTools = matchedKeywords.filter(k => k.category === 'Software and tools' && k.matchType === 'missing');
  if (missingTools.length > 0 && toolsInSkills < 4) {
    sectionRecommendations.push({
      section: 'Technical Skills',
      recommendation: 'Ensure all primary tool proficiencies are organized cleanly into categorical subsections (e.g. Languages, Tools, Methodologies).'
    });
  }

  return {
    placementScore,
    sectionCounts,
    sectionDistribution: [
      { section: 'Summary', count: sectionCounts.summary, idealShare: '10%' },
      { section: 'Skills', count: sectionCounts.skills, idealShare: '30%' },
      { section: 'Experience', count: sectionCounts.experience, idealShare: '40%' },
      { section: 'Projects', count: sectionCounts.projects, idealShare: '20%' },
      { section: 'Education', count: sectionCounts.education, idealShare: '10%' }
    ],
    sectionRecommendations
  };
};

module.exports = {
  evaluateKeywordPlacement
};
