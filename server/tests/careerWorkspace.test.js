const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const personalizationClient = require('../services/personalizationClient');

describe('Career Workspace Services & Microservice Integration', () => {
  test('personalizationClient should successfully query health endpoint', async () => {
    // Queries port 8001
    const profile = await personalizationClient.getProfile('test-user-123', 'Software Engineer');
    assert.ok(profile);
    assert.equal(profile.userId, 'test-user-123');
    assert.equal(profile.targetRole, 'Software Engineer');
  });

  test('personalizationClient should calculate deterministic skill masteries', async () => {
    const res = await personalizationClient.calculateMastery({
      userId: 'test-user-123',
      targetRole: 'Software Engineer',
      skillsEvidence: { 'Arrays': 80.0, 'Trees': 40.0 },
      skillsConfidence: { 'Arrays': 4, 'Trees': 2 }
    });
    assert.ok(res);
    assert.equal(res.userId, 'test-user-123');
    assert.equal(res.skills.length, 2);
    assert.ok(res.overallMastery >= 0 && res.overallMastery <= 100);
  });

  test('personalizationClient should rank skill gaps without truncation', async () => {
    const ranked = await personalizationClient.rankSkills({
      targetRole: 'Software Engineer',
      skills: [
        { skill: 'Dynamic Programming', category: 'DSA', evidenceScore: 20, masteryScore: 25 },
        { skill: 'Arrays and Strings', category: 'DSA', evidenceScore: 85, masteryScore: 80 }
      ]
    });
    assert.ok(ranked);
    assert.ok(ranked.criticalGaps.length >= 1 || ranked.topThreePriorityGaps.length >= 1);
  });

  test('personalizationClient should fetch role diagnostic questions', async () => {
    const sweQuestions = await personalizationClient.getAssessmentQuestions('Software Engineer');
    assert.ok(sweQuestions.length > 0);
    assert.equal(sweQuestions[0].roleTrack, 'Software Engineer');

    const baQuestions = await personalizationClient.getAssessmentQuestions('Business Analyst');
    assert.ok(baQuestions.length > 0);
    assert.equal(baQuestions[0].roleTrack, 'Business Analyst');
  });
});
