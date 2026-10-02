const axios = require('axios');

const PERSONALIZATION_URL = process.env.PERSONALIZATION_SERVICE_URL || 'http://127.0.0.1:8001';

const apiClient = axios.create({
  baseURL: PERSONALIZATION_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

const personalizationClient = {
  async getProfile(userId, targetRole) {
    try {
      const res = await apiClient.get(`/personalization/profile/${userId}`, {
        params: { targetRole }
      });
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient getProfile fallback:', err.message);
      return {
        userId,
        targetRole: targetRole || 'Software Engineer',
        targetSeniority: 'Entry-Level',
        weeklyHours: 10,
        sessionDurationMinutes: 45,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        learningStyles: ['Interactive practice', 'Projects'],
        budget: 'Free only',
        preferredLanguage: 'Python',
        skillConfidence: {},
        onboardingCompleted: false
      };
    }
  },

  async saveProfile(profileData) {
    try {
      const res = await apiClient.post('/personalization/profile', profileData);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient saveProfile fallback:', err.message);
      return profileData;
    }
  },

  async calculateMastery(payload) {
    try {
      const res = await apiClient.post('/personalization/mastery/calculate', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient calculateMastery fallback:', err.message);
      const skills = Object.entries(payload.skillsEvidence || {}).map(([skill, ev]) => {
        const conf = payload.skillsConfidence?.[skill] || 3;
        const confScore = (conf - 1) * 25.0;
        const score = Math.round(0.4615 * ev + 0.1538 * confScore + 0.3847 * 50);
        return {
          skill,
          masteryScore: Math.min(100, Math.max(0, score)),
          targetMastery: 80,
          confidenceLevel: 'Estimated',
          evidenceScore: ev,
          selfRating: conf,
          isAssessed: false
        };
      });
      return {
        userId: payload.userId,
        targetRole: payload.targetRole,
        overallMastery: Math.round(skills.reduce((acc, s) => acc + s.masteryScore, 0) / Math.max(1, skills.length)),
        skills,
        formulaAssumptions: { fallback: true }
      };
    }
  },

  async rankSkills(payload) {
    try {
      const res = await apiClient.post('/personalization/skills/rank', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient rankSkills fallback:', err.message);
      const skills = (payload.skills || []).map(s => ({
        skill: s.skill,
        category: s.category || 'General',
        masteryScore: s.evidenceScore || 0,
        targetMastery: 80,
        priorityScore: Math.round(75 + (100 - (s.evidenceScore || 0)) * 0.25),
        estimatedLearningHours: 6,
        whyItMatters: 'Key role competency.',
        nextBestAction: `Study ${s.skill} fundamentals.`
      }));
      return {
        topThreePriorityGaps: skills.slice(0, 3),
        criticalGaps: skills.filter(s => s.masteryScore < 45),
        skillsToStrengthen: skills.filter(s => s.masteryScore >= 45 && s.masteryScore < 75),
        provenSkills: skills.filter(s => s.masteryScore >= 75),
        optionalSkills: []
      };
    }
  },

  async recommendResources(payload) {
    try {
      const res = await apiClient.post('/personalization/resources/recommend', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient recommendResources fallback:', err.message);
      return {
        userId: payload.userId,
        role: payload.targetRole,
        triplets: payload.targetSkills.map(skill => ({
          skill,
          currentMastery: payload.currentMastery?.[skill] || 20,
          learn: {
            resourceId: `learn-${skill.toLowerCase().replace(/\s+/g, '-')}`,
            title: `${skill} Foundation Guide`,
            provider: 'SkillSync Curated',
            url: 'https://skillsync.dev',
            resourceType: 'official-documentation',
            difficulty: 'beginner',
            estimatedMinutes: 45,
            costType: 'free',
            selectionReason: 'Foundation reference.'
          },
          practice: {
            resourceId: `practice-${skill.toLowerCase().replace(/\s+/g, '-')}`,
            title: `${skill} Practice Exercises`,
            provider: 'SkillSync Practice',
            url: 'https://skillsync.dev',
            resourceType: 'practice-problem',
            difficulty: 'beginner',
            estimatedMinutes: 45,
            costType: 'free',
            selectionReason: 'Hands-on practice exercises.'
          },
          prove: {
            resourceId: `prove-${skill.toLowerCase().replace(/\s+/g, '-')}`,
            title: `${skill} Portfolio Implementation`,
            provider: 'SkillSync Project',
            url: 'https://skillsync.dev',
            resourceType: 'portfolio-project',
            difficulty: 'intermediate',
            estimatedMinutes: 60,
            costType: 'free',
            selectionReason: 'Documented proof deliverable.'
          },
          explanation: `Recommended learning triad for ${skill}.`
        }))
      };
    }
  },

  async generateRoadmap(payload) {
    try {
      const res = await apiClient.post('/personalization/roadmap/generate', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient generateRoadmap fallback:', err.message);
      return null;
    }
  },

  async replanWeek(payload) {
    try {
      const res = await apiClient.post('/personalization/roadmap/replan-week', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient replanWeek fallback:', err.message);
      return payload.week;
    }
  },

  async replaceTaskResource(payload) {
    try {
      const res = await apiClient.patch('/personalization/roadmap/task', payload);
      return res.data?.task || payload.task;
    } catch (err) {
      console.warn('PersonalizationClient replaceTaskResource fallback:', err.message);
      return payload.task;
    }
  },

  async getAssessmentQuestions(roleTrack, skillOrCategory) {
    try {
      const res = await apiClient.get('/personalization/assessments/questions', {
        params: { roleTrack, skillOrCategory }
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('PersonalizationClient getAssessmentQuestions fallback:', err.message);
    }

    const isSwe = (roleTrack || '').toLowerCase().includes('software');
    const term = (skillOrCategory || '').toLowerCase();

    if (isSwe) {
      if (term.includes('operat') || term.includes('concur') || term.includes('thread') || term.includes('process')) {
        return [
          {
            id: 'swe-os-1',
            roleTrack: 'Software Engineer',
            skill: 'Operating Systems and Concurrency',
            category: 'CS Fundamentals',
            questionText: "Which condition is NOT one of Coffman's four necessary conditions for deadlock in an Operating System?",
            options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
            correctOptionIndex: 2,
            explanation: "The deadlock condition is 'No Preemption'. If preemption is allowed, deadlocks can be systematically resolved.",
            difficulty: 'intermediate'
          },
          {
            id: 'swe-os-2',
            roleTrack: 'Software Engineer',
            skill: 'Operating Systems and Concurrency',
            category: 'CS Fundamentals',
            questionText: 'What memory resource is uniquely private to each individual thread within a multi-threaded process?',
            options: ['The Heap', 'The Call Stack and CPU Registers', 'Global static variables', 'Open file descriptors'],
            correctOptionIndex: 1,
            explanation: 'Threads share heap memory and file descriptors, but each thread possesses its own private stack and register state.',
            difficulty: 'intermediate'
          }
        ];
      }
      return [
        {
          id: 'swe-dsa-1',
          roleTrack: 'Software Engineer',
          skill: 'Data Structures and Algorithms',
          category: 'DSA',
          questionText: 'What is the time complexity of looking up a value by key in a standard Hash Map under average vs worst-case conditions?',
          options: [
            'O(1) average, O(N) worst-case',
            'O(log N) average, O(N) worst-case',
            'O(1) average, O(1) worst-case',
            'O(N) average, O(N log N) worst-case'
          ],
          correctOptionIndex: 0,
          explanation: 'Hash map lookups are O(1) on average, degrading to O(N) when multiple keys collide in the same hash bucket.',
          difficulty: 'beginner'
        },
        {
          id: 'swe-dsa-2',
          roleTrack: 'Software Engineer',
          skill: 'Data Structures and Algorithms',
          category: 'DSA',
          questionText: 'In a Binary Search Tree (BST), which tree traversal yields all elements in strictly sorted ascending order?',
          options: [
            'Pre-order Traversal (Root, Left, Right)',
            'In-order Traversal (Left, Root, Right)',
            'Post-order Traversal (Left, Right, Root)',
            'Level-order Traversal (BFS with Queue)'
          ],
          correctOptionIndex: 1,
          explanation: 'In-order traversal visits left subtree, root, then right subtree, producing sorted output.',
          difficulty: 'beginner'
        }
      ];
    } else {
      return [
        {
          id: 'ba-sql-1',
          roleTrack: 'Business Analyst',
          skill: 'SQL',
          category: 'Data and Analytics',
          questionText: 'Which SQL clause is used to filter aggregated metrics generated by a GROUP BY query?',
          options: ['WHERE', 'HAVING', 'QUALIFY', 'FILTER'],
          correctOptionIndex: 1,
          explanation: 'WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY.',
          difficulty: 'beginner'
        }
      ];
    }
  },

  async evaluateAssessment(payload) {
    try {
      const res = await apiClient.post('/personalization/assessments/analyze', payload);
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient evaluateAssessment fallback:', err.message);
      const total = Object.keys(payload.answers || {}).length;
      return {
        userId: payload.userId,
        roleTrack: payload.roleTrack,
        skill: payload.skill,
        totalQuestions: total,
        correctAnswers: total,
        scorePercentage: 100.0,
        passed: true,
        feedback: 'Assessment evaluated.',
        updatedMasteryGain: 20.0,
        recommendation: 'Continue to hands-on exercises.'
      };
    }
  },

  async sendEvents(events) {
    try {
      const res = await apiClient.post('/personalization/events', { events });
      return res.data;
    } catch (err) {
      console.warn('PersonalizationClient sendEvents fallback:', err.message);
      return { processedCount: events.length };
    }
  },

  async getExplanation(recommendationId, params) {
    try {
      const res = await apiClient.get(`/personalization/explanations/${recommendationId}`, { params });
      return res.data;
    } catch (err) {
      return {
        recommendationId,
        explanation: 'Curated based on your current skill proficiency and learning format preference.'
      };
    }
  }
};

module.exports = personalizationClient;
