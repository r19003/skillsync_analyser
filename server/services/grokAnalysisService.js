/**
 * grokAnalysisService.js
 *
 * Responsible for: deep resume critique, recruiter-style JD comparison,
 * ATS observations, weakness identification, strategic recommendations.
 *
 * Uses: Grok AI (xAI API — OpenAI-compatible endpoint)
 * Fallback: geminiService (lightweight critique) → local rule-based
 */

const axios = require('axios');

// ───────────────────────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────────────────────
const GROK_API_URL  = process.env.GROK_API_URL  || 'https://api.x.ai/v1';
const GROK_API_KEY  = process.env.GROK_API_KEY  || '';
const GROK_MODEL    = process.env.GROK_MODEL    || 'grok-3-mini';

// ───────────────────────────────────────────────────────────────────────
// Build the Grok system + user prompt
// ───────────────────────────────────────────────────────────────────────
const buildGrokPrompt = ({ resumeText = '', parsedData = {}, jobDescription = '', targetRole = '', userGoal = '', atsScore = 0, matchPercentage = 0, scoreBreakdown = {}, matchedSkills = [], missingSkills = [], jobKeywords = [], extractedJobSkills = [] }) => {

  const skillsSection = `
Matched Skills: ${matchedSkills.slice(0, 12).join(', ') || 'None detected'}
Missing Skills: ${missingSkills.slice(0, 12).join(', ') || 'None'}
ATS Score: ${atsScore}/100
JD Match: ${matchPercentage}%
Score Breakdown:
- Keyword Match:        ${scoreBreakdown.keywordMatch?.score ?? 0}/${scoreBreakdown.keywordMatch?.maxScore ?? 40}
- Skills Overlap:       ${scoreBreakdown.skillsOverlap?.score ?? 0}/${scoreBreakdown.skillsOverlap?.maxScore ?? 20}
- Section Completeness: ${scoreBreakdown.sectionCompleteness?.score ?? 0}/${scoreBreakdown.sectionCompleteness?.maxScore ?? 20}
- Formatting:           ${scoreBreakdown.formatting?.score ?? 0}/${scoreBreakdown.formatting?.maxScore ?? 10}
- Experience Relevance: ${scoreBreakdown.experienceRelevance?.score ?? 0}/${scoreBreakdown.experienceRelevance?.maxScore ?? 10}`;

  const systemPrompt = `You are a senior technical recruiter, ATS specialist, and career coach combined into one expert system. You have 15+ years of experience reviewing thousands of resumes for top tech companies. You give deeply specific, non-generic, actionable analysis. You never give shallow advice like "improve your resume". You always cite specific evidence from the resume text. You return ONLY valid, parseable JSON — no markdown, no backticks, no explanatory text outside the JSON object.`;

  const userPrompt = `Analyze the following resume against the job description and produce a structured JSON report.

=== RESUME TEXT ===
${resumeText.slice(0, 4000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 2000)}

=== CONTEXT ===
Target Role: ${targetRole || 'Not specified'}
User Goal: ${userGoal || 'Get shortlisted for this role'}
${skillsSection}

Candidate's parsed sections detected: ${JSON.stringify(parsedData?.sections ? Object.keys(parsedData.sections) : [])}
Candidate's detected skills from resume: ${(parsedData?.skills || []).slice(0, 20).join(', ')}

=== REQUIRED OUTPUT FORMAT ===
Return a single JSON object with EXACTLY these keys. Be specific, cite actual resume content, and give non-generic insights:

{
  "candidateProfile": {
    "professionalSummary": "2-3 sentence profile summary based only on what the resume actually shows",
    "currentLevelAssessment": "Junior/Mid/Senior level with specific justification from the resume",
    "likelyTargetFit": "Realistic assessment of fit for the target role with reasoning"
  },
  "atsReview": {
    "compatibilityScore": <number 0-100 based only on the provided ATS data>,
    "formattingObservations": "Specific formatting strengths and issues observed",
    "keywordCoverage": "Which critical JD keywords are present vs absent, with examples",
    "sectionCompleteness": "Which sections exist, which are missing, which are weak",
    "readabilityObservations": "ATS parser concerns: tables, columns, graphics, fonts"
  },
  "strengths": [
    "Specific strength with evidence from resume — minimum 4 items",
    "..."
  ],
  "weaknesses": [
    "Specific weakness with evidence and impact — minimum 4 items",
    "..."
  ],
  "jdComparison": {
    "overallMatchPercentage": <use the provided match percentage>,
    "matchedSkills": <use the provided matched skills array>,
    "missingSkills": <use the provided missing skills array>,
    "matchedKeywords": ["keywords from JD present in resume"],
    "missingKeywords": ["high-value JD keywords completely absent from resume"],
    "relevantExperienceMatch": "Does experience section match what JD needs? Specific analysis",
    "priorityGaps": ["Top 3-5 most critical gaps that would disqualify the candidate"],
    "fitCategory": "<'weak' | 'moderate' | 'strong'> based on match percentage"
  },
  "recommendations": {
    "improveFirst": ["Most urgent improvements — specific, not generic"],
    "rewrite": ["Bullet points or sections that need complete rewrite with reason"],
    "toAdd": ["Specific content, sections, or keywords to add"],
    "toRemove": ["Content that hurts the application or wastes ATS space"],
    "sectionOptimizations": ["Per-section optimization suggestions"],
    "atsAndReadability": ["Specific changes to improve ATS parsing and recruiter scanning"]
  },
  "actionPlan": {
    "today": ["3 things to do today to improve chances immediately"],
    "thisWeek": ["5 things to accomplish this week"],
    "thisMonth": ["Longer-term improvements for this month"],
    "topThreeHighImpactActions": ["The 3 single highest-ROI actions for this candidate right now"]
  },
  "finalEvaluation": {
    "jobReadinessLevel": "e.g. '55% — Below threshold for direct hire, competitive for junior roles'",
    "confidenceScore": <number 0-100>,
    "estimatedReadinessAfterPlan": "e.g. '80%+ after 4-week study plan completion'",
    "motivationalAdvice": "2-3 sentences: honest, realistic, encouraging — not generic"
  }
}`;

  return { systemPrompt, userPrompt };
};

// ───────────────────────────────────────────────────────────────────────
// Call Grok (xAI OpenAI-compatible API)
// ───────────────────────────────────────────────────────────────────────
const callGrok = async (systemPrompt, userPrompt) => {
  if (!GROK_API_KEY) throw new Error('GROK_API_KEY not configured');

  const response = await axios.post(
    `${GROK_API_URL}/chat/completions`,
    {
      model:       GROK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      temperature:  0.3,    // low temp = deterministic, structured output
      max_tokens:   3000,
      response_format: { type: 'json_object' } // enforce JSON mode if available
    },
    {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type':  'application/json'
      },
      timeout: 45000 // 45s timeout
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty response from Grok');

  // Strip any markdown fences defensively
  const clean = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
};

// ───────────────────────────────────────────────────────────────────────
// Public API: runGrokAnalysis
// ───────────────────────────────────────────────────────────────────────
const runGrokAnalysis = async (analysisData) => {
  const { systemPrompt, userPrompt } = buildGrokPrompt(analysisData);

  // ── Attempt 1: Grok ─────────────────────────────────────────────────
  try {
    console.log('[Grok] Starting deep resume analysis...');
    const result = await callGrok(systemPrompt, userPrompt);
    console.log('[Grok] Analysis complete.');
    return { data: result, source: 'grok', fallbackUsed: false };
  } catch (grokErr) {
    console.warn(`[Grok] Failed (${grokErr.message}), attempting Gemini fallback...`);
  }

  // ── Attempt 2: Gemini fallback (same JSON structure) ────────────────
  try {
    const { generateReportWithGemini } = require('./geminiService');
    const geminiResult = await generateReportWithGemini(analysisData);
    // Remap gemini's simpler structure to the full AIReport structure
    const remapped = remapGeminiToFullStructure(geminiResult, analysisData);
    console.log('[Grok→Gemini fallback] Analysis complete.');
    return { data: remapped, source: 'gemini-fallback', fallbackUsed: true };
  } catch (fallbackErr) {
    console.warn(`[Gemini fallback] Failed (${fallbackErr.message}), using local rule-based...`);
  }

  // ── Attempt 3: Local rule-based static fallback ────────────────────
  const local = buildLocalFallback(analysisData);
  console.log('[Local fallback] Using rule-based analysis.');
  return { data: local, source: 'local', fallbackUsed: true };
};

// ───────────────────────────────────────────────────────────────────────
// Remap Gemini simple output to full AIReport structure
// ───────────────────────────────────────────────────────────────────────
const remapGeminiToFullStructure = (gemini, ad) => ({
  candidateProfile: {
    professionalSummary: gemini.executiveSummary || '',
    currentLevelAssessment: 'Unable to fully assess without Grok — Gemini fallback active',
    likelyTargetFit: gemini.jdAlignmentReview || ''
  },
  atsReview: {
    compatibilityScore: ad.atsScore || 0,
    formattingObservations: gemini.resumeQualityReview || '',
    keywordCoverage: gemini.atsEvaluation || '',
    sectionCompleteness: 'Partial analysis — Grok unavailable',
    readabilityObservations: 'Partial analysis — Grok unavailable'
  },
  strengths: gemini.strengths || [],
  weaknesses: gemini.weaknesses || [],
  jdComparison: {
    overallMatchPercentage: ad.matchPercentage || 0,
    matchedSkills: ad.matchedSkills || [],
    missingSkills: ad.missingSkills || [],
    matchedKeywords: ad.matchedSkills || [],
    missingKeywords: ad.missingSkills || [],
    relevantExperienceMatch: 'Partial analysis — Grok unavailable',
    priorityGaps: ad.missingSkills?.slice(0, 5) || [],
    fitCategory: ad.matchPercentage >= 70 ? 'strong' : ad.matchPercentage >= 45 ? 'moderate' : 'weak'
  },
  recommendations: {
    improveFirst: gemini.recommendedImprovements?.slice(0, 3) || [],
    rewrite: [],
    toAdd: ad.missingSkills?.slice(0, 4).map(s => `Add ${s} to skills and demonstrate in project bullets`) || [],
    toRemove: [],
    sectionOptimizations: [],
    atsAndReadability: gemini.recommendedImprovements || []
  },
  actionPlan: {
    today: gemini.suggestedActionPlan?.slice(0, 2) || [],
    thisWeek: gemini.suggestedActionPlan || [],
    thisMonth: [],
    topThreeHighImpactActions: gemini.suggestedActionPlan?.slice(0, 3) || []
  },
  finalEvaluation: {
    jobReadinessLevel: `${ad.atsScore}% — via ATS score`,
    confidenceScore: ad.atsScore || 0,
    estimatedReadinessAfterPlan: 'Estimate unavailable — Grok fallback active',
    motivationalAdvice: 'Follow the generated study plan to close your skill gaps systematically.'
  }
});

// ───────────────────────────────────────────────────────────────────────
// Pure local fallback (no AI)
// ───────────────────────────────────────────────────────────────────────
const buildLocalFallback = (ad) => ({
  candidateProfile: {
    professionalSummary: `Candidate targeting ${ad.targetRole || 'this role'} with an ATS score of ${ad.atsScore}/100.`,
    currentLevelAssessment: ad.atsScore >= 70 ? 'Likely mid-level match' : 'Likely junior or misaligned match',
    likelyTargetFit: ad.matchPercentage >= 70 ? 'Strong fit' : ad.matchPercentage >= 45 ? 'Moderate fit' : 'Weak fit — significant gaps detected'
  },
  atsReview: {
    compatibilityScore: ad.atsScore,
    formattingObservations: 'Unable to assess without AI — check for tables, columns, headers.',
    keywordCoverage: `${ad.matchedSkills?.length || 0} of ${(ad.matchedSkills?.length || 0) + (ad.missingSkills?.length || 0)} job keywords found in resume.`,
    sectionCompleteness: 'Ensure all sections (Summary, Experience, Education, Skills, Projects) are present.',
    readabilityObservations: 'Use a clean single-column format for best ATS parsing.'
  },
  strengths: ad.strengths?.length > 0 ? ad.strengths : ['Resume was submitted and parseable'],
  weaknesses: ad.weaknesses?.length > 0 ? ad.weaknesses : ad.missingSkills?.slice(0, 4).map(s => `Missing skill: ${s}`) || [],
  jdComparison: {
    overallMatchPercentage: ad.matchPercentage,
    matchedSkills: ad.matchedSkills || [],
    missingSkills: ad.missingSkills || [],
    matchedKeywords: ad.matchedSkills || [],
    missingKeywords: ad.missingSkills || [],
    relevantExperienceMatch: 'Manual review required',
    priorityGaps: ad.missingSkills?.slice(0, 5) || [],
    fitCategory: ad.matchPercentage >= 70 ? 'strong' : ad.matchPercentage >= 45 ? 'moderate' : 'weak'
  },
  recommendations: {
    improveFirst: ad.recommendations?.slice(0, 3) || ['Add missing skills to resume'],
    rewrite: ['Review all bullet points for measurable impact statements'],
    toAdd: ad.missingSkills?.slice(0, 4).map(s => `Add experience or coursework demonstrating ${s}`) || [],
    toRemove: ['Remove irrelevant skills or experience unrelated to target role'],
    sectionOptimizations: ['Add a tailored professional summary', 'Ensure all job-relevant keywords appear in context'],
    atsAndReadability: ['Use standard section headings (Experience, Education, Skills)', 'Avoid tables and columns']
  },
  actionPlan: {
    today: ['Update skills section with missing keywords', 'Rewrite one weak bullet point'],
    thisWeek: ['Complete profile on LinkedIn', 'Add measurable outcomes to top 3 projects'],
    thisMonth: ['Complete one portfolio project for a missing skill', 'Revise full resume and get feedback'],
    topThreeHighImpactActions: [
      `Add ${ad.missingSkills?.[0] || 'most critical missing skill'} to resume with supporting project`,
      'Rewrite job bullets to include measurable metrics (%, $, time saved)',
      'Tailor summary section to exactly mirror the job title and primary skills'
    ]
  },
  finalEvaluation: {
    jobReadinessLevel: `${ad.atsScore || 0}% — ${ad.atsScore >= 70 ? 'Competitive' : ad.atsScore >= 50 ? 'Below average' : 'Significant work needed'}`,
    confidenceScore: ad.atsScore || 0,
    estimatedReadinessAfterPlan: 'Follow the 4-week study plan to reach 70%+ threshold.',
    motivationalAdvice: 'Every gap you close puts you measurably ahead of other applicants. Focus on the top 3 high-impact actions first.'
  }
});

module.exports = { runGrokAnalysis };
