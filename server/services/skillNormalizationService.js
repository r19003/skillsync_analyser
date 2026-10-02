/**
 * skillNormalizationService.js
 *
 * Canonical skill normalization engine for SkillSync Career Intelligence.
 * Replaces exact-string-only matching with deterministic, alias-aware,
 * case-insensitive, punctuation-insensitive, and phrase-first matching.
 */

const fs = require('fs');
const path = require('path');

// Load role profiles into memory for rapid alias lookups
let cachedProfiles = null;

const loadProfiles = () => {
  if (cachedProfiles) return cachedProfiles;
  try {
    const baPath = path.join(__dirname, '../data/roleProfiles/businessAnalyst.json');
    const swePath = path.join(__dirname, '../data/roleProfiles/softwareEngineer.json');
    const ba = JSON.parse(fs.readFileSync(baPath, 'utf8'));
    const swe = JSON.parse(fs.readFileSync(swePath, 'utf8'));
    cachedProfiles = { [ba.roleId]: ba, [swe.roleId]: swe, ba, swe };
  } catch (err) {
    console.error('Failed to load role profile JSONs in skillNormalizationService:', err.message);
    cachedProfiles = {};
  }
  return cachedProfiles;
};

/**
 * Clean and normalize text for alias matching
 * e.g., "Node.js!" -> "node js", "C++" -> "c++", "React/Redux" -> "react redux"
 */
const cleanForMatching = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[,\t\r\n]/g, ' ')
    .replace(/\s+/g, ' ');
};

const GLOBAL_CORE_SKILLS = [
  { canonicalName: 'Node.js', category: 'Software development', aliases: ['nodejs', 'node.js', 'node', 'node js'] },
  { canonicalName: 'AWS', category: 'Tools and deployment', aliases: ['aws', 'amazon web services'] },
  { canonicalName: 'Power BI', category: 'Tools', aliases: ['power bi', 'powerbi', 'microsoft power bi'] },
  { canonicalName: 'REST APIs', category: 'Software development', aliases: ['rest apis', 'rest api', 'restful services', 'restful api'] },
  { canonicalName: 'DSA', category: 'DSA', aliases: ['dsa', 'data structures and algorithms', 'algorithms and data structures'] },
  { canonicalName: 'Requirements Gathering', category: 'Business analysis', aliases: ['requirements gathering', 'requirement elicitation', 'requirements elicitation'] }
];

/**
 * Builds an alias dictionary for a given role profile or all profiles
 * Maps normalized alias -> canonical skill info
 */
const buildAliasDictionary = (roleProfile) => {
  const dict = new Map();

  // Register global core skills first
  for (const skill of GLOBAL_CORE_SKILLS) {
    dict.set(cleanForMatching(skill.canonicalName), {
      canonicalName: skill.canonicalName,
      category: skill.category,
      importance: 90,
      status: 'required',
      matchType: 'exact',
      confidence: 1.0
    });
    for (const alias of skill.aliases) {
      dict.set(cleanForMatching(alias), {
        canonicalName: skill.canonicalName,
        category: skill.category,
        importance: 90,
        status: 'required',
        matchType: 'alias',
        confidence: 0.95
      });
    }
  }

  const profiles = roleProfile ? [roleProfile] : Object.values(loadProfiles()).filter(p => p.skills);

  for (const profile of profiles) {
    if (!profile.skills) continue;
    for (const skill of profile.skills) {
      const canonical = skill.canonicalName;
      // Exact canonical
      dict.set(cleanForMatching(canonical), {
        canonicalName: canonical,
        category: skill.category,
        importance: skill.importance,
        status: skill.status,
        matchType: 'exact',
        confidence: 1.0,
      });

      // All aliases
      if (skill.aliases && Array.isArray(skill.aliases)) {
        for (const alias of skill.aliases) {
          const cleanedAlias = cleanForMatching(alias);
          if (!dict.has(cleanedAlias)) {
            dict.set(cleanedAlias, {
              canonicalName: canonical,
              category: skill.category,
              importance: skill.importance,
              status: skill.status,
              matchType: 'alias',
              confidence: 0.95,
            });
          }
        }
      }
    }
  }

  return dict;
};

/**
 * Normalizes a single raw skill name (e.g., "NodeJS", "PowerBI", "Amazon Web Services")
 */
const normalizeSkill = (rawSkill, roleProfile = null) => {
  if (!rawSkill || typeof rawSkill !== 'string') return null;
  const cleaned = cleanForMatching(rawSkill);
  const dict = buildAliasDictionary(roleProfile);

  // Direct lookup
  if (dict.has(cleaned)) {
    const match = dict.get(cleaned);
    return {
      canonicalName: match.canonicalName,
      category: match.category,
      originalPhrase: rawSkill.trim(),
      confidence: match.confidence,
      matchType: match.matchType,
    };
  }

  // Common symbol normalization (e.g. node.js vs nodejs, c++ vs cpp)
  const stripped = cleaned.replace(/[^a-z0-9+#]/g, '');
  for (const [alias, match] of dict.entries()) {
    if (alias.replace(/[^a-z0-9+#]/g, '') === stripped) {
      return {
        canonicalName: match.canonicalName,
        category: match.category,
        originalPhrase: rawSkill.trim(),
        confidence: 0.90,
        matchType: 'alias',
      };
    }
  }

  // Return unmapped skill with default category if not in canonical dictionary
  return {
    canonicalName: rawSkill.trim(),
    category: 'Other Skills',
    originalPhrase: rawSkill.trim(),
    confidence: 0.70,
    matchType: 'unmapped',
  };
};

/**
 * Scans text and extracts canonical skills using longest-phrase-first matching.
 * Guarantees that "business process modelling" matches before "process"
 * and "data structures and algorithms" matches before "data".
 */
const extractSkillsFromText = (text, roleProfile = null) => {
  if (!text || typeof text !== 'string') return [];
  const cleanedText = ` ${cleanForMatching(text)} `;
  const dict = buildAliasDictionary(roleProfile);

  // Sort aliases by length descending (longest phrase matching first)
  const sortedAliases = Array.from(dict.keys()).sort((a, b) => b.length - a.length);

  const matched = new Map(); // canonicalName -> result object

  for (const alias of sortedAliases) {
    if (alias.length < 2) continue; // skip single letters except handled explicitly

    // Word boundary check
    // Special handling for C, C++, C#
    let regex;
    if (alias === 'c++') {
      regex = /(?:^|\s)c\+\+(?:$|\s|[,.;:!?])/g;
    } else if (alias === 'c#') {
      regex = /(?:^|\s)c#(?:$|\s|[,.;:!?])/g;
    } else if (alias === 'c') {
      regex = /(?:^|\s)c(?:$|\s|[,.;:!?])/g;
    } else {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'g');
    }

    if (regex.test(cleanedText)) {
      const info = dict.get(alias);
      if (!matched.has(info.canonicalName)) {
        matched.set(info.canonicalName, {
          canonicalName: info.canonicalName,
          category: info.category,
          originalPhrase: alias,
          confidence: info.confidence,
          matchType: info.matchType,
        });
      }
    }
  }

  return Array.from(matched.values());
};

/**
 * Deduplicates and normalizes an array of skill strings
 */
const normalizeSkillList = (skillArray, roleProfile = null) => {
  if (!Array.isArray(skillArray)) return [];
  const map = new Map();

  for (const s of skillArray) {
    const norm = normalizeSkill(s, roleProfile);
    if (norm && !map.has(norm.canonicalName)) {
      map.set(norm.canonicalName, norm);
    }
  }

  return Array.from(map.values());
};

module.exports = {
  loadProfiles,
  normalizeSkill,
  extractSkillsFromText,
  normalizeSkillList,
  buildAliasDictionary,
  cleanForMatching,
};
