/**
 * marketAnalyticsService.js
 *
 * Deterministic Job-Market Analytics Engine for SkillSync.
 * Computes skill demand distributions, required vs preferred frequencies,
 * and skill co-occurrence from the curated market corpus.
 *
 * DISCLOSURE: Sample seed data is strictly labeled as curated sample data.
 */

const fs = require('fs');
const path = require('path');
const JobPosting = require('../models/JobPosting');

let memoryCorpus = null;

/**
 * Loads baseline seed datasets into memory
 */
const loadSeedCorpus = () => {
  if (memoryCorpus) return memoryCorpus;
  try {
    const baSeedPath = path.join(__dirname, '../data/jobPostings/baMarketSeed.json');
    const sweSeedPath = path.join(__dirname, '../data/jobPostings/sweMarketSeed.json');

    const baPostings = JSON.parse(fs.readFileSync(baSeedPath, 'utf8'));
    const swePostings = JSON.parse(fs.readFileSync(sweSeedPath, 'utf8'));

    memoryCorpus = {
      'Business Analyst': baPostings,
      'Software Engineer': swePostings,
      all: [...baPostings, ...swePostings]
    };
  } catch (err) {
    console.error('Error loading job posting seed files:', err.message);
    memoryCorpus = { 'Business Analyst': [], 'Software Engineer': [], all: [] };
  }
  return memoryCorpus;
};

/**
 * Fetches job postings for a given role track (combines seed data + DB imported postings)
 */
const getPostingsForTrack = async (roleTrack) => {
  const seeds = loadSeedCorpus();
  const seedList = seeds[roleTrack] || [];

  try {
    const dbPostings = await JobPosting.find({ roleTrack }).lean();
    if (dbPostings && dbPostings.length > 0) {
      // Merge unique postings
      const map = new Map();
      for (const p of seedList) map.set(p.id, p);
      for (const p of dbPostings) map.set(p.id, p);
      return Array.from(map.values());
    }
  } catch (err) {
    // If DB is offline, fall back directly to in-memory seeds
  }

  return seedList;
};

/**
 * Analyzes market demand metrics for a specific role track
 */
const analyzeMarketDemand = async (roleTrack = 'Business Analyst') => {
  const postings = await getPostingsForTrack(roleTrack);
  const totalPostings = postings.length || 1;

  const reqFrequency = new Map();
  const prefFrequency = new Map();
  const totalFrequency = new Map();
  const coOccurrenceMap = new Map();

  for (const p of postings) {
    const req = p.requiredSkills || [];
    const pref = p.preferredSkills || [];
    const all = [...new Set([...req, ...pref])];

    // Frequency
    for (const r of req) {
      reqFrequency.set(r, (reqFrequency.get(r) || 0) + 1);
      totalFrequency.set(r, (totalFrequency.get(r) || 0) + 1);
    }
    for (const pf of pref) {
      prefFrequency.set(pf, (prefFrequency.get(pf) || 0) + 1);
      totalFrequency.set(pf, (totalFrequency.get(pf) || 0) + 1);
    }

    // Co-occurrence pairs (sorted alphabetically to avoid duplicate combinations)
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const pairKey = all[i] < all[j] ? `${all[i]}|||${all[j]}` : `${all[j]}|||${all[i]}`;
        coOccurrenceMap.set(pairKey, (coOccurrenceMap.get(pairKey) || 0) + 1);
      }
    }
  }

  // Build top demanded skills list
  const topDemandedSkills = [];
  const marketDemandMap = {}; // canonicalName -> 0-100 score

  for (const [skill, totalCount] of totalFrequency.entries()) {
    const reqCount = reqFrequency.get(skill) || 0;
    const prefCount = prefFrequency.get(skill) || 0;

    const reqPct = Math.round((reqCount / totalPostings) * 100);
    const prefPct = Math.round((prefCount / totalPostings) * 100);
    const totalPct = Math.round((totalCount / totalPostings) * 100);

    topDemandedSkills.push({
      skill,
      frequency: totalCount,
      percentage: totalPct,
      requiredPercent: reqPct,
      preferredPercent: prefPct
    });

    marketDemandMap[skill] = totalPct;
  }

  topDemandedSkills.sort((a, b) => b.frequency - a.frequency);

  // Build top co-occurring skill pairs
  const skillCoOccurrence = [];
  for (const [pairKey, count] of coOccurrenceMap.entries()) {
    const [skillA, skillB] = pairKey.split('|||');
    skillCoOccurrence.push({ skillA, skillB, count });
  }
  skillCoOccurrence.sort((a, b) => b.count - a.count);

  return {
    roleTrack,
    marketCorpusSize: postings.length,
    marketDatasetSource: 'SkillSync Curated Market Corpus (Sample Dataset - Disclosed)',
    topDemandedSkills: topDemandedSkills.slice(0, 15),
    skillCoOccurrence: skillCoOccurrence.slice(0, 10),
    marketDemandMap
  };
};

/**
 * Computes comparative demand differences between BA and SWE
 */
const compareMarketTracks = async () => {
  const baDemand = await analyzeMarketDemand('Business Analyst');
  const sweDemand = await analyzeMarketDemand('Software Engineer');

  return {
    baSize: baDemand.marketCorpusSize,
    sweSize: sweDemand.marketCorpusSize,
    datasetSource: 'SkillSync Curated Market Corpus (Sample Dataset - Disclosed)',
    baTopSkills: baDemand.topDemandedSkills.slice(0, 8),
    sweTopSkills: sweDemand.topDemandedSkills.slice(0, 8),
  };
};

module.exports = {
  analyzeMarketDemand,
  compareMarketTracks,
  getPostingsForTrack,
  loadSeedCorpus
};
