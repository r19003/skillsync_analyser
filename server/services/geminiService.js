const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const generateReportWithGemini = async (analysis) => {
  const {
    atsScore, matchPercentage, matchedSkills = [], missingSkills = [],
    extraSkills = [], strengths = [], weaknesses = [], recommendations = [],
    scoreBreakdown = {}, jobRole
  } = analysis;

  // Fallback if no API key
  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackReport(analysis);
  }

  const prompt = `
You are an expert career coach and ATS specialist. Generate a detailed, professional resume analysis report in JSON format.

Resume Analysis Data:
- Target Role: ${jobRole || 'Not specified'}
- ATS Score: ${atsScore}/100
- Job Match: ${matchPercentage}%
- Matched Skills: ${matchedSkills.slice(0, 10).join(', ') || 'None'}
- Missing Skills: ${missingSkills.slice(0, 10).join(', ') || 'None'}
- Extra Skills: ${extraSkills.slice(0, 5).join(', ') || 'None'}

Score Breakdown:
- Keyword Match: ${scoreBreakdown.keywordMatch?.score || 0}/40
- Skills Overlap: ${scoreBreakdown.skillsOverlap?.score || 0}/20
- Section Completeness: ${scoreBreakdown.sectionCompleteness?.score || 0}/20
- Formatting: ${scoreBreakdown.formatting?.score || 0}/10
- Experience Relevance: ${scoreBreakdown.experienceRelevance?.score || 0}/10

Generate a JSON object with these exact fields:
{
  "executiveSummary": "3-4 sentence professional summary of the resume's strengths and positioning for this role",
  "atsEvaluation": "2-3 sentences specifically about ATS compatibility and what affects the score",
  "resumeQualityReview": "2-3 sentences about resume structure and quality",
  "jdAlignmentReview": "2-3 sentences about how well the candidate aligns with the job requirements",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendedImprovements": ["specific improvement 1", "specific improvement 2", "specific improvement 3", "specific improvement 4"],
  "suggestedActionPlan": ["actionable step 1", "actionable step 2", "actionable step 3"]
}

Be specific, insightful, and actionable. Reference the actual skills and scores. Return ONLY valid JSON.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Gemini API error, falling back to rule-based report:', err.message);
    return buildFallbackReport(analysis);
  }
};

const buildFallbackReport = (analysis) => {
  const { atsScore, matchPercentage, missingSkills = [], matchedSkills = [], strengths = [], weaknesses = [], recommendations = [], jobRole } = analysis;

  let summary = `This resume shows moderate potential for the ${jobRole || 'target'} role.`;
  if (atsScore >= 80) summary = `This is a strong, well-optimized resume for the ${jobRole || 'target'} role. It demonstrates excellent keyword alignment, a complete structure, and highly relevant skills.`;
  else if (atsScore >= 55) summary = `This resume shows good potential for the ${jobRole || 'target'} role but requires strategic refinement. The skill alignment is reasonable, but targeted improvements to keyword density and section completeness will significantly boost your ATS ranking.`;
  else summary = `This resume needs significant work before it's competitive for the ${jobRole || 'target'} role. The ATS score of ${atsScore}/100 indicates key gaps in keyword coverage, missing skills, and structural improvements are needed.`;

  return {
    executiveSummary: summary,
    atsEvaluation: `Your ATS compatibility score is ${atsScore}/100. ${atsScore >= 70 ? 'This is a solid score that should pass most automated filters.' : 'This score may cause your resume to be filtered before reaching a human recruiter.'} ${missingSkills.length > 0 ? `Adding ${missingSkills.slice(0, 3).join(', ')} would significantly improve your score.` : ''}`,
    resumeQualityReview: `Your resume matches ${matchPercentage}% of the core job requirements. ${matchedSkills.length > 0 ? `Matched skills include ${matchedSkills.slice(0, 4).join(', ')}.` : ''} Focus on enriching the experience and projects sections.`,
    jdAlignmentReview: `You currently match ${matchPercentage}% of the job description. ${missingSkills.length > 0 ? `The key gaps are: ${missingSkills.slice(0, 5).join(', ')}.` : 'You are a strong match for this role.'}`,
    strengths: strengths.length > 0 ? strengths : ['Resume structure is present', 'Contact information included'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Keyword density could be improved'],
    recommendedImprovements: recommendations.length > 0 ? recommendations : ['Tailor your resume to this specific job description'],
    suggestedActionPlan: missingSkills.length > 0
      ? ['Follow the generated Study Plan to acquire missing skills', 'Mirror the exact terminology from the job description', 'Request a reference from someone in a similar role']
      : ['Apply immediately — you are a strong match', 'Prepare for technical interview questions on your core skills'],
  };
};

module.exports = { generateReportWithGemini };
