const { extractSkills, KNOWN_SKILLS } = require('./resumeParserService');

/**
 * Job Description Analyzer Service
 *
 * Extracts: role title, required skills, preferred skills, keywords.
 * No AI — uses regex and a curated keyword dictionary.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Common job title keywords to detect the role
// ─────────────────────────────────────────────────────────────────────────────
const JOB_ROLES = [
  'frontend developer', 'frontend engineer', 'front-end developer', 'front end developer',
  'backend developer', 'backend engineer', 'back-end developer', 'back end developer',
  'full stack developer', 'fullstack developer', 'full-stack developer',
  'software engineer', 'software developer', 'web developer',
  'react developer', 'node developer', 'nodejs developer',
  'python developer', 'java developer', 'data scientist',
  'data analyst', 'machine learning engineer', 'ml engineer', 'ai engineer',
  'devops engineer', 'cloud engineer', 'site reliability engineer', 'sre',
  'mobile developer', 'android developer', 'ios developer', 'flutter developer',
  'product manager', 'project manager', 'scrum master', 'qa engineer',
  'test engineer', 'ui/ux designer', 'ux designer', 'ui designer',
  'database administrator', 'dba', 'system administrator', 'sysadmin',
  'cybersecurity analyst', 'security engineer', 'blockchain developer',
];

// ─────────────────────────────────────────────────────────────────────────────
// Soft skill keywords (won't count in hard skill match but worth noting)
// ─────────────────────────────────────────────────────────────────────────────
const SOFT_SKILLS = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'time management', 'adaptability', 'creativity', 'collaboration', 'analytical',
  'attention to detail', 'self-motivated', 'organized', 'multitasking',
];

// ─────────────────────────────────────────────────────────────────────────────
// Extract role title from JD
// ─────────────────────────────────────────────────────────────────────────────
const extractJobRole = (text) => {
  const lower = text.toLowerCase();
  for (const role of JOB_ROLES) {
    if (lower.includes(role)) return role;
  }
  // Fallback: look for "Role:", "Position:", "Title:" patterns
  const match = text.match(/(?:role|position|title|hiring for)[:\s]+([^\n,]{3,50})/i);
  return match ? match[1].trim() : 'Not specified';
};

// ─────────────────────────────────────────────────────────────────────────────
// Extract all unique keywords from JD text
// (useful single/multi words that appear in JD — for keyword match scoring)
// ─────────────────────────────────────────────────────────────────────────────
const extractKeywords = (text) => {
  const lower = text.toLowerCase();

  // Extract skill-like words from KNOWN_SKILLS that appear in the JD
  const skillKeywords = KNOWN_SKILLS.filter((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });

  // Additionally extract capitalized words (likely proper nouns = tech names)
  const properNouns = [...text.matchAll(/\b[A-Z][a-zA-Z]{2,}\b/g)]
    .map((m) => m[0].toLowerCase())
    .filter((w) => !['the', 'and', 'for', 'with', 'that', 'this', 'they', 'are', 'our', 'you', 'your', 'will', 'have', 'from', 'must', 'able', 'years', 'experience'].includes(w));

  return [...new Set([...skillKeywords, ...properNouns])];
};

// ─────────────────────────────────────────────────────────────────────────────
// Detect if a skill is listed as "preferred" vs "required"
// ─────────────────────────────────────────────────────────────────────────────
const splitRequiredAndPreferred = (text) => {
  const lines = text.split('\n');
  const required = [];
  const preferred = [];
  let mode = 'required'; // default

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/preferred|nice.to.have|bonus|plus|advantage|good to have/.test(lower)) {
      mode = 'preferred';
    }
    if (/required|must.have|mandatory|essential|qualifications|responsibilities/.test(lower)) {
      mode = 'required';
    }

    // Extract skill tokens from this line
    const lineSkills = extractSkills(line);
    if (mode === 'preferred') {
      preferred.push(...lineSkills);
    } else {
      required.push(...lineSkills);
    }
  }

  // Remove preferred skills that also appear in required
  const uniquePreferred = preferred.filter((s) => !required.includes(s));

  return {
    requiredSkills: [...new Set(required)],
    preferredSkills: [...new Set(uniquePreferred)],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export: analyzeJobDescription
// ─────────────────────────────────────────────────────────────────────────────
const analyzeJobDescription = (jobDescriptionText) => {
  if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
    return {
      jobRole: '',
      requiredSkills: [],
      preferredSkills: [],
      keywords: [],
    };
  }

  const jobRole = extractJobRole(jobDescriptionText);
  const { requiredSkills, preferredSkills } = splitRequiredAndPreferred(jobDescriptionText);
  const keywords = extractKeywords(jobDescriptionText);

  return { jobRole, requiredSkills, preferredSkills, keywords };
};

module.exports = { analyzeJobDescription };
