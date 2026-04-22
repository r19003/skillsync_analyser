/**
 * geminiStudyPlanService.js
 *
 * Responsible for: structured study plan generation, learning sequence design,
 * roadmap, weekly planning, task breakdown, interview prep, projects, milestones.
 *
 * Uses: Google Gemini (gemini-1.5-flash via @google/generative-ai SDK)
 * Fallback: local rule-based plan builder
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL   = process.env.GEMINI_MODEL   || 'gemini-1.5-flash';

// ───────────────────────────────────────────────────────────────────────
// Build the Gemini prompt for study plan
// ───────────────────────────────────────────────────────────────────────
const buildGeminiStudyPlanPrompt = ({
  targetRole = '',
  missingSkills = [],
  matchedSkills = [],
  userGoal = '',
  atsScore = 0,
  matchPercentage = 0,
  durationWeeks = 4
}) => {

  const high   = missingSkills.slice(0, 4);
  const medium = missingSkills.slice(4, 8);
  const low    = missingSkills.slice(8, 12);

  return `You are an expert learning roadmap designer and career development specialist with deep knowledge of the tech industry. You create practical, realistic, and immediately actionable study plans for job seekers.

=== CANDIDATE CONTEXT ===
Target Role: ${targetRole || 'Software/Data role'}
User Goal: ${userGoal || 'Get shortlisted in the next 1-3 months'}
Current ATS Score: ${atsScore}/100
Current Job Match: ${matchPercentage}%
Current Skills: ${matchedSkills.slice(0, 10).join(', ') || 'Not specified'}
Duration: ${durationWeeks} weeks

=== SKILL GAPS TO ADDRESS ===
High Priority (blocking skills — must have for this role): ${high.join(', ') || 'None critical'}
Medium Priority (strong differentiators): ${medium.join(', ') || 'None'}
Low Priority (nice-to-have): ${low.join(', ') || 'None'}

=== INSTRUCTIONS ===
Generate a detailed, practical ${durationWeeks}-week study plan. Each week must have a clear theme and outcome.
Tasks must be specific: name exact resources (e.g. "LeetCode SQL 50", "fast.ai Practical DL", "Google Analytics Demo Account").
Project suggestions must be end-to-end and resume-worthy.
Interview prep must be specific to the target role, not generic.

Return ONLY a valid JSON object with EXACTLY this structure:

{
  "currentGapSummary": "2-3 sentence summary of what gaps exist and why they matter for this role",
  "highPrioritySkills": ${JSON.stringify(high)},
  "mediumPrioritySkills": ${JSON.stringify(medium)},
  "lowPrioritySkills": ${JSON.stringify(low)},
  "weeklyPlan": [
    {
      "weekNumber": 1,
      "theme": "e.g. SQL & Data Manipulation",
      "focusSkills": ["skill1", "skill2"],
      "weeklyGoal": "What the candidate should be able to do by end of week",
      "deliverable": "Specific, measurable output e.g. 'Complete SQL50 on LeetCode (50 problems)'",
      "tasks": [
        {
          "title": "Specific task name",
          "description": "What exactly to do, with which resource",
          "type": "learning | project | practice | revision | interview-prep",
          "duration": "e.g. 3 hours",
          "resources": ["Specific URL or resource name"]
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "End-to-end project description that demonstrates missing skills",
      "skills": ["skill1", "skill2"],
      "difficulty": "beginner | intermediate | advanced",
      "estimatedTime": "e.g. 1 week"
    }
  ],
  "interviewPrep": [
    {
      "topic": "Topic name",
      "description": "Why this matters for the role",
      "sampleQuestions": ["Q1?", "Q2?", "Q3?"]
    }
  ],
  "milestones": [
    {
      "title": "Milestone name",
      "description": "What achieving this means",
      "targetWeek": <week number>,
      "completionCriteria": "How to know this milestone is achieved"
    }
  ]
}

Generate exactly ${durationWeeks} weeks in weeklyPlan. Be specific, practical, and realistic.`;
};

// ───────────────────────────────────────────────────────────────────────
// Call Gemini
// ───────────────────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model  = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const result = await model.generateContent(prompt);
  const text   = result.response.text().trim();

  // Strip markdown fences
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
};

// ───────────────────────────────────────────────────────────────────────
// Public API: runGeminiStudyPlan
// ───────────────────────────────────────────────────────────────────────
const runGeminiStudyPlan = async (planData) => {
  const prompt = buildGeminiStudyPlanPrompt(planData);

  // ── Attempt 1: Gemini ────────────────────────────────────────────────
  try {
    console.log('[Gemini] Generating advanced study plan...');
    const result = await callGemini(prompt);
    console.log('[Gemini] Study plan complete.');
    return { data: result, source: 'gemini', fallbackUsed: false };
  } catch (err) {
    console.warn(`[Gemini] Failed (${err.message}), using local fallback...`);
  }

  // ── Attempt 2: local rule-based fallback ────────────────────────────
  const fallback = buildLocalStudyPlan(planData);
  console.log('[Gemini→Local fallback] Using rule-based study plan.');
  return { data: fallback, source: 'local', fallbackUsed: true };
};

// ───────────────────────────────────────────────────────────────────────
// Local rule-based study plan fallback
// ───────────────────────────────────────────────────────────────────────
const buildLocalStudyPlan = ({ targetRole = '', missingSkills = [], matchedSkills = [], durationWeeks = 4, userGoal = '' }) => {
  const high   = missingSkills.slice(0, 3);
  const medium = missingSkills.slice(3, 6);
  const low    = missingSkills.slice(6, 9);

  const weeklyPlan = Array.from({ length: durationWeeks }, (_, i) => {
    const weekNum   = i + 1;
    const weekSkill = missingSkills[i] || `Core ${targetRole} skill`;
    return {
      weekNumber: weekNum,
      theme: weekNum === 1 ? 'Foundation & Priority Skills' : weekNum === 2 ? 'Depth & Practice' : weekNum === 3 ? 'Portfolio Projects' : 'Interview Prep & Polish',
      focusSkills: [weekSkill, ...(missingSkills[i + 1] ? [missingSkills[i + 1]] : [])],
      weeklyGoal: `Achieve working proficiency in ${weekSkill} and apply to a practical exercise.`,
      deliverable: `Complete 1 mini-project demonstrating ${weekSkill}`,
      tasks: [
        {
          title: `Learn ${weekSkill} fundamentals`,
          description: `Study core concepts of ${weekSkill} using structured online resources.`,
          type: 'learning',
          duration: '4-5 hours',
          resources: [`Search: "${weekSkill} tutorial for ${targetRole}"`]
        },
        {
          title: `Practice ${weekSkill} with exercises`,
          description: `Complete hands-on problems or exercises related to ${weekSkill}.`,
          type: 'practice',
          duration: '3 hours',
          resources: ['LeetCode', 'HackerRank', 'Kaggle']
        }
      ]
    };
  });

  return {
    currentGapSummary: `You are missing ${missingSkills.length} key skills for the ${targetRole} role. Focus on ${high.join(', ') || 'core skills'} first — these are the most likely to disqualify your application if absent.`,
    highPrioritySkills: high,
    mediumPrioritySkills: medium,
    lowPrioritySkills: low,
    weeklyPlan,
    projects: missingSkills.slice(0, 2).map((skill, i) => ({
      name: `${skill} Portfolio Project ${i + 1}`,
      description: `Build an end-to-end project demonstrating ${skill} that can be added to your GitHub and resume.`,
      skills: [skill, matchedSkills[0] || 'related skill'],
      difficulty: 'intermediate',
      estimatedTime: '1 week'
    })),
    interviewPrep: [
      { topic: `${targetRole} Technical Questions`, description: 'Common technical interview questions for this role', sampleQuestions: [`Explain how you would approach ${missingSkills[0] || 'a core challenge'}?`, 'Walk me through your most complex project.', 'How do you stay current with industry trends?'] },
      { topic: 'Behavioral STAR Questions', description: 'Structured behavioral questions using Situation-Task-Action-Result', sampleQuestions: ['Tell me about a time you failed and what you did.', 'Describe your biggest technical achievement.', 'How do you handle tight deadlines?'] }
    ],
    milestones: [
      { title: 'Foundation Complete', description: 'Core skill gap addressed with practice', targetWeek: 1, completionCriteria: 'Can explain and demonstrate top priority skill' },
      { title: 'First Project Done', description: 'Portfolio project built and on GitHub', targetWeek: 2, completionCriteria: 'GitHub repo with README deployed or published' },
      { title: 'Resume Updated', description: 'Resume reflects new skills and project', targetWeek: 3, completionCriteria: 'ATS score improves by 10+ points' },
      { title: 'Interview Ready', description: 'Practiced common questions and technical scenarios', targetWeek: 4, completionCriteria: 'Completed 3+ mock interview sessions' }
    ]
  };
};

module.exports = { runGeminiStudyPlan };
