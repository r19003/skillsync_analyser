const CareerAnalysis = require('../models/CareerAnalysis');
const UserCareerProfile = require('../models/UserCareerProfile');
const SkillMastery = require('../models/SkillMastery');
const LearningPlan = require('../models/LearningPlan');
const LearningTask = require('../models/LearningTask');
const InteractionEvent = require('../models/InteractionEvent');
const ResourceFeedback = require('../models/ResourceFeedback');
const personalizationClient = require('../services/personalizationClient');

/**
 * 1. Overview Page Data
 */
exports.getWorkspaceOverview = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findOne({ _id: analysisId, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Career Analysis record not found.' });
    }

    const roleTrack = analysis.targetRole?.title || 'Software Engineer';
    const isSwe = roleTrack.toLowerCase().includes('software');

    // 1. Fetch or create User Profile
    let profile = await UserCareerProfile.findOne({ userId: req.user.id, targetRole: isSwe ? 'Software Engineer' : 'Business Analyst' });
    if (!profile) {
      profile = await UserCareerProfile.create({
        userId: req.user.id,
        careerAnalysisId: analysis._id,
        targetRole: isSwe ? 'Software Engineer' : 'Business Analyst',
        targetSeniority: 'Entry-Level',
        weeklyHours: 10,
        learningStyles: isSwe ? ['Interactive practice', 'Projects'] : ['Projects', 'Written documentation']
      });
    }

    // 2. Fetch Masteries
    let masteries = await SkillMastery.find({ userId: req.user.id });
    if (masteries.length === 0) {
      // Initialize masteries from analysis skill evidence
      const initialSkills = analysis.skills || [];
      const masteryDocs = [];

      for (const s of initialSkills) {
        const evScore = s.evidenceScore || (s.evidenceLevel === 'quantified' ? 100 : s.evidenceLevel === 'experience' ? 85 : s.evidenceLevel === 'project' ? 65 : s.evidenceLevel === 'mentioned' ? 30 : 0);
        const item = await personalizationClient.calculateMastery({
          userId: req.user.id.toString(),
          targetRole: roleTrack,
          skillsEvidence: { [s.canonicalName]: evScore },
          skillsConfidence: profile.skillConfidence ? Object.fromEntries(profile.skillConfidence) : {}
        });

        const calculated = item.skills?.[0] || {
          masteryScore: Math.round(evScore * 0.75),
          targetMastery: 80,
          confidenceLevel: 'Estimated'
        };

        masteryDocs.push({
          userId: req.user.id,
          careerAnalysisId: analysis._id,
          skill: s.canonicalName,
          category: s.category,
          masteryScore: calculated.masteryScore,
          targetMastery: 80,
          confidenceLevel: calculated.confidenceLevel,
          evidenceScore: evScore,
          assessmentScore: null,
          practiceScore: 0,
          selfRating: 3,
          isAssessed: false
        });
      }

      if (masteryDocs.length > 0) {
        masteries = await SkillMastery.insertMany(masteryDocs);
      }
    }

    // 3. Ranked Gaps & Top 3
    const rankedData = await personalizationClient.rankSkills({
      targetRole: roleTrack,
      skills: masteries.map(m => ({
        skill: m.skill,
        category: m.category,
        evidenceScore: m.evidenceScore,
        masteryScore: m.masteryScore,
        selfRating: m.selfRating,
        assessmentScore: m.assessmentScore
      })),
      skippedSkills: profile.skippedTopics || []
    });

    const topThreeGaps = rankedData.topThreePriorityGaps || [];

    // 4. Fetch or generate Learning Plan
    let plan = await LearningPlan.findOne({ userId: req.user.id, careerAnalysisId: analysis._id });
    if (!plan) {
      // Automatically generate first plan
      const genRes = await personalizationClient.generateRoadmap({
        userId: req.user.id.toString(),
        targetRole: roleTrack,
        weeklyHours: profile.weeklyHours || 10,
        sessionDurationMinutes: profile.sessionDurationMinutes || 45,
        availableDays: profile.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timelineIntensity: profile.timelineIntensity || 'Balanced',
        targetWeeks: 6,
        skillMastery: Object.fromEntries(masteries.map(m => [m.skill, m.masteryScore])),
        skippedSkills: profile.skippedTopics || [],
        preferredStyles: profile.learningStyles || ['Interactive practice'],
        preferredLanguage: profile.preferredLanguage || (isSwe ? 'Python' : 'SQL'),
        budget: profile.budget || 'Free only'
      });

      if (genRes) {
        plan = await LearningPlan.create({
          userId: req.user.id,
          careerAnalysisId: analysis._id,
          targetRole: roleTrack,
          totalWeeks: genRes.totalWeeks,
          weeklyHours: genRes.weeklyHours,
          phases: genRes.phases,
          weeks: genRes.weeks,
          assumptions: genRes.assumptions,
          currentWeekNumber: 1
        });

        // Insert tasks
        const tasksToInsert = [];
        for (const w of genRes.weeks) {
          for (const t of w.tasks || []) {
            tasksToInsert.push({
              planId: plan._id,
              userId: req.user.id,
              weekNumber: w.weekNumber,
              dayNumber: t.dayNumber,
              skill: t.skill,
              title: t.title,
              whyThisMatters: t.whyThisMatters,
              taskInstruction: t.taskInstruction,
              durationMinutes: t.durationMinutes,
              type: t.type,
              difficulty: t.difficulty,
              resourceId: t.resourceId,
              resourceDetails: t.resourceDetails,
              status: t.status
            });
          }
        }
        if (tasksToInsert.length > 0) {
          await LearningTask.insertMany(tasksToInsert);
        }
      }
    }

    // 5. Calculate 4 Primary KPIs
    const roleFitScore = analysis.roleMatching?.matchScore ?? 65;
    const atsScore = analysis.atsReadiness?.overallAtsScore ?? 75;
    const avgMastery = masteries.length > 0
      ? Math.round(masteries.reduce((sum, m) => sum + m.masteryScore, 0) / masteries.length)
      : 30;

    // Check if user has taken any diagnostic assessments
    const assessedCount = masteries.filter(m => m.isAssessed).length;
    const interviewReadiness = assessedCount > 0
      ? Math.round(masteries.filter(m => m.isAssessed).reduce((sum, m) => sum + (m.assessmentScore || 0), 0) / assessedCount)
      : null;

    // 6. Next Best Action card
    const topGap = topThreeGaps[0] || {
      skill: isSwe ? 'Data Structures and Algorithms' : 'SQL',
      whyItMatters: 'Essential qualification requested in 85%+ of entry-level job descriptions.',
      nextBestAction: 'Complete a 15-minute diagnostic assessment to calibrate your learning path.'
    };

    const nextBestAction = {
      action: assessedCount === 0 ? 'Take Diagnostic Assessment' : `Practice ${topGap.skill}`,
      skill: topGap.skill,
      reason: topGap.whyItMatters,
      estimatedTime: '30-45 mins',
      targetUrl: assessedCount === 0 ? `/career/${analysisId}/assessments` : `/career/${analysisId}/roadmap`
    };

    // 7. Current Learning Week Summary
    const currentWeekData = plan?.weeks?.find(w => w.weekNumber === (plan.currentWeekNumber || 1)) || {
      weekNumber: 1,
      phase: 'Foundation',
      plannedHours: profile.weeklyHours || 10,
      completedHours: plan?.totalHoursCompleted || 0,
      taskCount: 5,
      completedTaskCount: 0,
      mainObjective: isSwe ? 'Master foundational arrays, string traversals, and complexity.' : 'Master fundamental SQL queries, joins, and aggregations.'
    };

    res.json({
      success: true,
      analysisId,
      candidateName: analysis.resumeSnapshot?.candidateName || 'Candidate',
      targetRole: roleTrack,
      targetSeniority: profile.targetSeniority,
      isSwe,
      onboardingCompleted: profile.onboardingCompleted,
      kpis: {
        roleFit: { score: roleFitScore, label: analysis.roleMatching?.isCustomJd ? 'JD Match' : 'Role Fit', status: roleFitScore >= 75 ? 'Target Aligned' : 'Needs Optimization' },
        atsReadiness: { score: atsScore, label: 'ATS Readiness', status: atsScore >= 80 ? 'Optimized' : 'Formatting Gaps' },
        skillMastery: { score: avgMastery, label: 'Skill Mastery', status: avgMastery >= 70 ? 'Proficient' : 'Developing' },
        interviewReadiness: {
          score: interviewReadiness,
          isAssessed: interviewReadiness !== null,
          label: 'Interview Readiness',
          callToAction: interviewReadiness === null ? 'Take your first diagnostic assessment' : null
        }
      },
      nextBestAction,
      topThreePriorityGaps: topThreeGaps,
      currentWeek: currentWeekData,
      recentImprovements: plan?.totalHoursCompleted > 0 ? [
        { description: `Completed ${plan.totalHoursCompleted} hours of structured practice.`, date: 'Recent' }
      ] : []
    });
  } catch (error) {
    console.error('getWorkspaceOverview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get / Save User Profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    const targetRole = analysis?.targetRole?.title || 'Software Engineer';
    const isSwe = targetRole.toLowerCase().includes('software');

    let profile = await UserCareerProfile.findOne({ userId: req.user.id, targetRole: isSwe ? 'Software Engineer' : 'Business Analyst' });
    if (!profile) {
      profile = await UserCareerProfile.create({
        userId: req.user.id,
        careerAnalysisId: analysisId,
        targetRole: isSwe ? 'Software Engineer' : 'Business Analyst',
        weeklyHours: 10,
        learningStyles: isSwe ? ['Interactive practice', 'Projects'] : ['Projects', 'Written documentation']
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveUserProfile = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const updates = req.body;

    const analysis = await CareerAnalysis.findById(analysisId);
    const targetRole = updates.targetRole || analysis?.targetRole?.title || 'Software Engineer';
    const isSwe = targetRole.toLowerCase().includes('software');

    let profile = await UserCareerProfile.findOneAndUpdate(
      { userId: req.user.id, targetRole: isSwe ? 'Software Engineer' : 'Business Analyst' },
      { ...updates, onboardingCompleted: true, careerAnalysisId: analysisId },
      { upsert: true, new: true }
    );

    // Sync to Python microservice
    await personalizationClient.saveProfile(profile.toObject());

    // Generate or refresh Learning Plan
    const masteries = await SkillMastery.find({ userId: req.user.id });
    const genRes = await personalizationClient.generateRoadmap({
      userId: req.user.id.toString(),
      targetRole: profile.targetRole,
      weeklyHours: profile.weeklyHours || 10,
      sessionDurationMinutes: profile.sessionDurationMinutes || 45,
      availableDays: profile.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timelineIntensity: profile.timelineIntensity || 'Balanced',
      targetWeeks: 6,
      skillMastery: Object.fromEntries(masteries.map(m => [m.skill, m.masteryScore])),
      skippedSkills: profile.skippedTopics || [],
      preferredStyles: profile.learningStyles || ['Interactive practice'],
      preferredLanguage: profile.preferredLanguage || (isSwe ? 'Python' : 'SQL'),
      budget: profile.budget || 'Free only'
    });

    if (genRes) {
      await LearningPlan.deleteMany({ userId: req.user.id, careerAnalysisId: analysisId });
      await LearningTask.deleteMany({ userId: req.user.id });

      const newPlan = await LearningPlan.create({
        userId: req.user.id,
        careerAnalysisId: analysisId,
        targetRole: profile.targetRole,
        totalWeeks: genRes.totalWeeks,
        weeklyHours: genRes.weeklyHours,
        phases: genRes.phases,
        weeks: genRes.weeks,
        assumptions: genRes.assumptions,
        currentWeekNumber: 1
      });

      const tasksToInsert = [];
      for (const w of genRes.weeks) {
        for (const t of w.tasks || []) {
          tasksToInsert.push({
            planId: newPlan._id,
            userId: req.user.id,
            weekNumber: w.weekNumber,
            dayNumber: t.dayNumber,
            skill: t.skill,
            title: t.title,
            whyThisMatters: t.whyThisMatters,
            taskInstruction: t.taskInstruction,
            durationMinutes: t.durationMinutes,
            type: t.type,
            difficulty: t.difficulty,
            resourceId: t.resourceId,
            resourceDetails: t.resourceDetails,
            status: t.status
          });
        }
      }
      if (tasksToInsert.length > 0) {
        await LearningTask.insertMany(tasksToInsert);
      }
    }

    res.json({ success: true, profile, message: 'Career profile and adaptive plan created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Skill Gaps Page Data
 */
exports.getSkillGaps = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });

    const roleTrack = analysis.targetRole?.title || 'Software Engineer';
    const masteries = await SkillMastery.find({ userId: req.user.id });
    const profile = await UserCareerProfile.findOne({ userId: req.user.id, targetRole: roleTrack.includes('Software') ? 'Software Engineer' : 'Business Analyst' });

    const ranked = await personalizationClient.rankSkills({
      targetRole: roleTrack,
      skills: masteries.map(m => ({
        skill: m.skill,
        category: m.category,
        evidenceScore: m.evidenceScore,
        masteryScore: m.masteryScore,
        selfRating: m.selfRating,
        assessmentScore: m.assessmentScore
      })),
      skippedSkills: profile?.skippedTopics || []
    });

    res.json({
      success: true,
      roleTrack,
      criticalGaps: ranked.criticalGaps || [],
      skillsToStrengthen: ranked.skillsToStrengthen || [],
      provenSkills: ranked.provenSkills || [],
      optionalSkills: ranked.optionalSkills || [],
      topSixPriorityCards: (ranked.criticalGaps.concat(ranked.skillsToStrengthen)).slice(0, 6),
      allSkills: masteries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Resume Evidence Page Data
 */
exports.getResumeEvidence = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });

    const skills = analysis.skills || [];

    const strongEvidence = [];
    const partialEvidence = [];
    const mentionedOnly = [];
    const noEvidence = [];

    for (const s of skills) {
      const item = {
        skill: s.canonicalName,
        category: s.category,
        evidenceLevel: s.evidenceLevel,
        evidenceScore: s.evidenceScore,
        sourceSection: s.evidenceDetails?.section || 'Skills List',
        fullSentence: s.evidenceDetails?.sentence || s.evidenceDetails?.context || 'Mentioned in skills summary.',
        metricsDetected: s.evidenceDetails?.metricsDetected || false,
        confidence: s.evidenceLevel === 'quantified' ? 'Very High (100%)' : s.evidenceLevel === 'experience' ? 'High (85%)' : s.evidenceLevel === 'project' ? 'Medium (65%)' : 'Low (30%)',
        strengtheningAdvice: s.evidenceLevel === 'none'
          ? 'Add a capstone project or internship bullet demonstrating practical usage.'
          : s.evidenceLevel === 'mentioned'
            ? 'Move this skill into a project or work experience bullet with context.'
            : 'Quantify impact with measurable performance numbers (%, scale, throughput).'
      };

      if (s.evidenceLevel === 'quantified' || s.evidenceLevel === 'experience') {
        strongEvidence.push(item);
      } else if (s.evidenceLevel === 'project') {
        partialEvidence.push(item);
      } else if (s.evidenceLevel === 'mentioned') {
        mentionedOnly.push(item);
      } else {
        noEvidence.push({ skill: s.canonicalName, category: s.category, reason: 'No evidence detected in uploaded resume.' });
      }
    }

    res.json({
      success: true,
      strongEvidence,
      partialEvidence,
      mentionedOnly,
      noEvidence
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitEvidenceFeedback = async (req, res) => {
  try {
    const { skill, feedbackType, comment } = req.body;
    await InteractionEvent.create({
      userId: req.user.id,
      eventType: 'evidence_feedback_submitted',
      skill,
      metadata: { feedbackType, comment }
    });
    res.json({ success: true, message: 'Feedback recorded and saved for future profile updates.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Market Insights Page Data
 */
exports.getMarketInsights = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });

    const marketData = analysis.marketAnalytics || {};
    res.json({
      success: true,
      targetRole: analysis.targetRole?.title,
      datasetDisclosure: {
        corpusSize: marketData.corpusSize || 50,
        source: 'Curated 2026 Entry-Level Corpus (25 BA, 25 SWE verified postings)',
        scrapingEthics: 'Strictly non-scraping, curated seed corpus with periodic manual audit'
      },
      demandedSkills: marketData.topDemandedSkills || [],
      skillCoOccurrences: marketData.skillCoOccurrences || [],
      requiredVsPreferred: marketData.requiredVsPreferredDistribution || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Adaptive Roadmap Page Data & Task Management
 */
exports.getRoadmap = async (req, res) => {
  try {
    const { analysisId } = req.params;
    let plan = await LearningPlan.findOne({ userId: req.user.id, careerAnalysisId: analysisId });
    if (!plan) {
      const analysis = await CareerAnalysis.findById(analysisId);
      if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
      const roleTrack = analysis.targetRole?.title || 'Software Engineer';
      const isSwe = roleTrack.toLowerCase().includes('software');
      const profile = await UserCareerProfile.findOne({ userId: req.user.id, targetRole: isSwe ? 'Software Engineer' : 'Business Analyst' });
      const masteries = await SkillMastery.find({ userId: req.user.id });

      const genRes = await personalizationClient.generateRoadmap({
        userId: req.user.id.toString(),
        targetRole: roleTrack,
        weeklyHours: profile?.weeklyHours || 10,
        sessionDurationMinutes: profile?.maxSessionDurationMinutes || 45,
        availableDays: profile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timelineIntensity: profile?.timelineIntensity || 'Balanced',
        targetWeeks: 6,
        skillMastery: Object.fromEntries(masteries.map(m => [m.skill, m.masteryScore])),
        skippedSkills: profile?.skippedTopics || [],
        preferredStyles: profile?.learningStyles || ['Interactive practice'],
        preferredLanguage: profile?.preferredLanguage || (isSwe ? 'Python' : 'SQL'),
        budget: profile?.budget || 'Free only'
      });

      if (genRes) {
        plan = await LearningPlan.create({
          userId: req.user.id,
          careerAnalysisId: analysis._id,
          targetRole: roleTrack,
          totalWeeks: genRes.totalWeeks,
          weeklyHours: genRes.weeklyHours,
          phases: genRes.phases,
          weeks: genRes.weeks,
          assumptions: genRes.assumptions,
          currentWeekNumber: 1
        });

        const tasksToInsert = [];
        for (const w of genRes.weeks) {
          for (const t of w.tasks || []) {
            tasksToInsert.push({
              planId: plan._id,
              userId: req.user.id,
              weekNumber: w.weekNumber,
              dayNumber: t.dayNumber,
              skill: t.skill,
              title: t.title,
              whyThisMatters: t.whyThisMatters,
              taskInstruction: t.taskInstruction,
              durationMinutes: t.durationMinutes,
              type: t.type,
              difficulty: t.difficulty,
              resourceId: t.resourceId,
              resourceDetails: t.resourceDetails,
              status: t.status
            });
          }
        }
        if (tasksToInsert.length > 0) {
          await LearningTask.insertMany(tasksToInsert);
        }
      }
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Failed to generate learning plan.' });
    }

    const tasks = await LearningTask.find({ planId: plan._id }).sort({ weekNumber: 1, dayNumber: 1 });

    // Group tasks into weeks
    const weeksWithTasks = plan.weeks.map(w => {
      const weekTasks = tasks.filter(t => t.weekNumber === w.weekNumber);
      return {
        ...w.toObject(),
        tasks: weekTasks
      };
    });

    res.json({
      success: true,
      plan: {
        ...plan.toObject(),
        weeks: weeksWithTasks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, actualMinutesSpent, confidenceAfter, notes, locked } = req.body;

    const task = await LearningTask.findOneAndUpdate(
      { _id: taskId, userId: req.user.id },
      {
        ...(status && { status }),
        ...(actualMinutesSpent !== undefined && { actualMinutesSpent }),
        ...(confidenceAfter !== undefined && { confidenceAfter }),
        ...(notes !== undefined && { notes }),
        ...(locked !== undefined && { locked }),
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Recalculate plan completion hours
    const completedTasks = await LearningTask.find({ planId: task.planId, status: 'completed' });
    const completedHours = roundTo1(completedTasks.reduce((sum, t) => sum + (t.actualMinutesSpent || t.durationMinutes), 0) / 60.0);

    await LearningPlan.findByIdAndUpdate(task.planId, {
      totalHoursCompleted: completedHours
    });

    // Record interaction event
    if (status === 'completed') {
      await InteractionEvent.create({
        userId: req.user.id,
        eventType: 'task_completed',
        taskId: task._id,
        skill: task.skill,
        metadata: { duration: task.actualMinutesSpent || task.durationMinutes, confidenceAfter }
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replaceTaskResource = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await LearningTask.findOne({ _id: taskId, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const plan = await LearningPlan.findById(task.planId);
    const profile = await UserCareerProfile.findOne({ userId: req.user.id });

    const updatedTask = await personalizationClient.replaceTaskResource({
      task: task.toObject(),
      action: 'replace_resource',
      targetRole: plan.targetRole,
      currentMastery: 35.0,
      preferredStyles: profile?.learningStyles || ['Interactive practice']
    });

    task.resourceId = updatedTask.resourceId;
    task.resourceDetails = updatedTask.resourceDetails;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replanSingleWeek = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { weekNumber, overdueTaskIds, skippedTaskIds } = req.body;

    const plan = await LearningPlan.findOne({ userId: req.user.id, careerAnalysisId: analysisId });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return res.status(404).json({ success: false, message: 'Week not found' });

    const weekTasks = await LearningTask.find({ planId: plan._id, weekNumber });

    const replanned = await personalizationClient.replanWeek({
      week: { ...week.toObject(), tasks: weekTasks.map(t => t.toObject()) },
      completedTaskIds: weekTasks.filter(t => t.status === 'completed').map(t => t._id.toString()),
      skippedTaskIds: skippedTaskIds || [],
      overdueTaskIds: overdueTaskIds || []
    });

    // Save updated task statuses and days
    for (const t of replanned.tasks || []) {
      if (t._id) {
        await LearningTask.findByIdAndUpdate(t._id, {
          dayNumber: t.dayNumber,
          status: t.status,
          whyThisMatters: t.whyThisMatters
        });
      }
    }

    res.json({ success: true, message: `Week ${weekNumber} replanned successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Personalized Resources
 */
exports.getPersonalizedResources = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    const roleTrack = analysis?.targetRole?.title || 'Software Engineer';
    const profile = await UserCareerProfile.findOne({ userId: req.user.id });
    const masteries = await SkillMastery.find({ userId: req.user.id });

    // Pick top 4 prioritized skills
    const topSkills = masteries
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 4)
      .map(m => m.skill);

    const tripletsRes = await personalizationClient.recommendResources({
      userId: req.user.id.toString(),
      targetRole: roleTrack,
      targetSkills: topSkills.length > 0 ? topSkills : (roleTrack.includes('Software') ? ['Arrays and Strings', 'Trees', 'System Design'] : ['SQL', 'Power BI', 'Requirements Gathering']),
      currentMastery: Object.fromEntries(masteries.map(m => [m.skill, m.masteryScore])),
      preferredStyles: profile?.learningStyles || ['Interactive practice'],
      budget: profile?.budget || 'Free only',
      preferredLanguage: profile?.preferredLanguage || 'Python'
    });

    res.json({
      success: true,
      role: roleTrack,
      triplets: tripletsRes.triplets || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitResourceFeedback = async (req, res) => {
  try {
    const { resourceId, rating, difficultyFeedback, formatFeedback, helpful, comment } = req.body;

    const feedback = await ResourceFeedback.create({
      userId: req.user.id,
      resourceId,
      rating,
      difficultyFeedback,
      formatFeedback,
      helpful,
      comment
    });

    // Log interaction event
    const eventType = difficultyFeedback === 'too_easy'
      ? 'resource_too_easy'
      : difficultyFeedback === 'too_difficult'
        ? 'resource_too_difficult'
        : 'resource_helpful';

    await InteractionEvent.create({
      userId: req.user.id,
      eventType,
      resourceId,
      metadata: { rating, formatFeedback, comment }
    });

    res.json({ success: true, message: 'Thank you for your feedback! Recommendations adjusted.', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. Diagnostic Assessments
 */
exports.getAssessmentQuestions = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await CareerAnalysis.findById(analysisId);
    const roleTrack = analysis?.targetRole?.title || 'Software Engineer';
    const { skill } = req.query;

    const questions = await personalizationClient.getAssessmentQuestions(roleTrack, skill);
    res.json({ success: true, roleTrack, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { skill, answers } = req.body;
    const analysis = await CareerAnalysis.findById(analysisId);
    const roleTrack = analysis?.targetRole?.title || 'Software Engineer';

    const result = await personalizationClient.evaluateAssessment({
      userId: req.user.id.toString(),
      roleTrack,
      skill,
      answers
    });

    // Update SkillMastery in database
    await SkillMastery.findOneAndUpdate(
      { userId: req.user.id, skill },
      {
        assessmentScore: result.scorePercentage,
        isAssessed: true,
        $inc: { masteryScore: result.updatedMasteryGain },
        lastUpdated: new Date(),
        updateReason: `Diagnostic assessment score: ${result.scorePercentage}%`
      },
      { upsert: true }
    );

    // Record interaction event
    await InteractionEvent.create({
      userId: req.user.id,
      eventType: 'assessment_attempted',
      skill,
      metadata: { scorePercentage: result.scorePercentage, passed: result.passed }
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. Progress Analytics
 */
exports.getProgressAnalytics = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const plan = await LearningPlan.findOne({ userId: req.user.id, careerAnalysisId: analysisId });
    const masteries = await SkillMastery.find({ userId: req.user.id });
    const events = await InteractionEvent.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(10);

    const completedTasksCount = await LearningTask.countDocuments({ planId: plan?._id, status: 'completed' });
    const pendingTasksCount = await LearningTask.countDocuments({ planId: plan?._id, status: 'pending' });

    res.json({
      success: true,
      plannedHours: plan?.weeklyHours ? plan.weeklyHours * (plan.totalWeeks || 6) : 60,
      completedHours: plan?.totalHoursCompleted || 0,
      completedTasksCount,
      pendingTasksCount,
      masteryProgress: masteries.map(m => ({
        skill: m.skill,
        masteryScore: m.masteryScore,
        targetMastery: m.targetMastery,
        isAssessed: m.isAssessed
      })),
      recentActivity: events.map(e => ({
        eventType: e.eventType,
        skill: e.skill,
        timestamp: e.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function roundTo1(num) {
  return Math.round(num * 10) / 10;
}
