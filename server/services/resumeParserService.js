/**
 * Resume Parser Service
 *
 * Takes raw text extracted from a PDF and returns structured data:
 * name, email, phone, skills, education, experience, projects, certifications.
 *
 * Approach: regex + section-boundary detection. No black-box AI — fully transparent.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Master tech skills dictionary (used for skill extraction)
// ─────────────────────────────────────────────────────────────────────────────
const KNOWN_SKILLS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'ruby', 'go',
  'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'perl', 'bash', 'shell',

  // Web Frontend
  'html', 'css', 'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue',
  'vuejs', 'vue.js', 'next.js', 'nextjs', 'nuxt', 'svelte', 'jquery', 'bootstrap',
  'tailwind', 'tailwindcss', 'sass', 'less', 'webpack', 'vite', 'redux',
  'zustand', 'graphql', 'rest api', 'restful',

  // Backend
  'node.js', 'nodejs', 'express', 'expressjs', 'django', 'flask', 'fastapi',
  'spring', 'spring boot', 'rails', 'laravel', 'nestjs', 'fastify',

  // Databases
  'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'redis',
  'cassandra', 'firebase', 'dynamodb', 'elasticsearch', 'mongoose',

  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins',
  'ci/cd', 'terraform', 'ansible', 'nginx', 'linux', 'unix', 'git', 'github',
  'gitlab', 'bitbucket', 'vercel', 'netlify', 'heroku',

  // Data & AI
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision',
  'data science', 'data analysis', 'power bi', 'tableau', 'excel', 'sql',

  // Mobile
  'react native', 'flutter', 'android', 'ios', 'xcode', 'android studio',

  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'junit', 'pytest',

  // Other
  'agile', 'scrum', 'jira', 'figma', 'photoshop', 'postman', 'swagger',
  'oauth', 'jwt', 'socket.io', 'websockets', 'microservices', 'api',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract email
// ─────────────────────────────────────────────────────────────────────────────
const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract phone number (international/Indian/US formats)
// ─────────────────────────────────────────────────────────────────────────────
const extractPhone = (text) => {
  const match = text.match(
    /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\d{10})/
  );
  return match ? match[0].trim() : '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Guess candidate name from first non-empty line
// (Most resumes start with the candidate's name)
// ─────────────────────────────────────────────────────────────────────────────
const extractName = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // First line that's not an email, URL, or phone number
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes('@') &&
      !line.match(/^\+?\d/) &&
      !line.startsWith('http') &&
      line.length > 2 &&
      line.length < 60
    ) {
      // Remove any trailing special characters
      return line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
    }
  }
  return '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract skills by matching against known skill dictionary
// ─────────────────────────────────────────────────────────────────────────────
const extractSkills = (text) => {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => {
    // Match whole words only (e.g., 'c' shouldn't match 'react')
    const regex = new RegExp(`\\b${skill.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract a section's text given a heading label
// ─────────────────────────────────────────────────────────────────────────────
const extractSection = (text, headings) => {
  const lines = text.split('\n');
  const results = [];
  let capturing = false;

  // Section heading patterns to detect
  const allSectionHeadings = [
    'education', 'experience', 'work experience', 'employment', 'projects',
    'skills', 'technical skills', 'certifications', 'achievements',
    'awards', 'publications', 'interests', 'summary', 'objective',
    'profile', 'contact', 'references', 'languages', 'volunteer',
  ];

  const headingRegexes = headings.map(
    (h) => new RegExp(`^\\s*${h}\\s*[:\\-]?\\s*$`, 'i')
  );

  const stopRegexes = allSectionHeadings
    .filter((h) => !headings.map((x) => x.toLowerCase()).includes(h))
    .map((h) => new RegExp(`^\\s*${h}\\s*[:\\-]?\\s*$`, 'i'));

  for (const line of lines) {
    if (headingRegexes.some((r) => r.test(line))) {
      capturing = true;
      continue;
    }
    if (capturing && stopRegexes.some((r) => r.test(line))) break;
    if (capturing && line.trim()) results.push(line.trim());
  }

  return results;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Detect which sections exist in the resume
// ─────────────────────────────────────────────────────────────────────────────
const detectSections = (text) => {
  const lower = text.toLowerCase();
  return {
    hasObjective: /\b(objective|career goal)\b/.test(lower),
    hasSummary: /\b(summary|profile|about me)\b/.test(lower),
    hasExperience: /\b(experience|employment|work history|internship)\b/.test(lower),
    hasEducation: /\b(education|qualification|degree|university|college)\b/.test(lower),
    hasSkills: /\b(skills|technologies|tech stack|competencies)\b/.test(lower),
    hasProjects: /\b(project|portfolio|built|developed)\b/.test(lower),
    hasCertifications: /\b(certification|certificate|certified|course|training)\b/.test(lower),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export: parseResume
// ─────────────────────────────────────────────────────────────────────────────
const parseResume = (extractedText) => {
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      name: '', email: '', phone: '', skills: [],
      education: [], experience: [], projects: [], certifications: [],
      sections: {},
    };
  }

  const name = extractName(extractedText);
  const email = extractEmail(extractedText);
  const phone = extractPhone(extractedText);
  const skills = extractSkills(extractedText);
  const education = extractSection(extractedText, ['education', 'qualification', 'academic']);
  const experience = extractSection(extractedText, ['experience', 'work experience', 'employment', 'internship']);
  const projects = extractSection(extractedText, ['projects', 'project', 'portfolio']);
  const certifications = extractSection(extractedText, ['certifications', 'certification', 'certificates', 'courses']);
  const sections = detectSections(extractedText);

  return { name, email, phone, skills, education, experience, projects, certifications, sections };
};

module.exports = { parseResume, extractSkills, KNOWN_SKILLS };
