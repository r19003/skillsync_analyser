/**
 * careerAnalyticsController.js
 *
 * Controller for SkillSync Career Intelligence & Skill-Gap Analytics Platform.
 * Orchestrates deterministic scoring, traceable resume evidence extraction,
 * market analytics, What-If projections, and personalized roadmaps.
 */

const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const CareerAnalysis = require('../models/CareerAnalysis');
const SkillAssessment = require('../models/SkillAssessment');
const JobPosting = require('../models/JobPosting');

const { extractSkillsFromText, normalizeSkillList } = require('../services/skillNormalizationService');
const { extractSkillEvidence } = require('../services/skillEvidenceService');
const { computeATSReadiness } = require('../services/atsReadinessService');
const {
  computeRoleFit,
  evaluateEligibilityGates,
  computeSWEReadinessAnalytics,
  computeOverallCareerReadiness
} = require('../services/roleMatchingService');
const { prioritizeSkills } = require('../services/skillPriorityService');
const { analyzeMarketDemand } = require('../services/marketAnalyticsService');
const { simulateSkillImprovement } = require('../services/projectionService');
const { generateRoadmap } = require('../services/learningRoadmapService');
const { runKeywordIntelligence } = require('../services/keywordIntelligence');

/**
 * Loads the active role profile from disk
 */
const getRoleProfileData = (targetRole) => {
  const isBA = /business\s+analyst/i.test(targetRole);
  const fileName = isBA ? 'businessAnalyst.json' : 'softwareEngineer.json';
  const filePath = path.join(__dirname, '../data/roleProfiles', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 * GET /api/career-analytics/roles
 * Lists available standardized role profiles
 */
exports.getRoleProfiles = async (req, res, next) => {
  try {
    const ba = getRoleProfileData('Business Analyst');
    const swe = getRoleProfileData('Software Engineer');

    res.status(200).json({
      success: true,
      roles: [
        {
          roleId: ba.roleId,
          roleTitle: ba.roleTitle,
          roleTrack: ba.roleTrack,
          level: ba.level,
          description: ba.description,
          categories: ba.categories,
          skillCount: ba.skills.length
        },
        {
          roleId: swe.roleId,
          roleTitle: swe.roleTitle,
          roleTrack: swe.roleTrack,
          level: swe.level,
          description: swe.description,
          categories: swe.categories,
          skillCount: swe.skills.length
        }
      ]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-analytics/analyze
 * Executes full career intelligence analysis
 */
exports.analyzeCareerReadiness = async (req, res, next) => {
  try {
    const { resumeId, targetRole = 'Entry-Level Software Engineer', jobDescription = '', durationWeeks = 4 } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required' });
    }

    // 1. Fetch resume and verify user ownership
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this resume' });
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume contains insufficient text for analytical evaluation. Please upload a text-based PDF.'
      });
    }

    // 2. Resolve Role Profile
    const roleProfile = getRoleProfileData(targetRole);
    const roleTrack = roleProfile.roleTrack;
    const analysisType = (jobDescription && jobDescription.trim().length >= 30) ? 'Job-Description' : 'Role-Profile';

    // 3. Extract and normalize skills with resume evidence
    const detectedSkills = extractSkillEvidence(
      roleProfile.skills,
      resume.extractedText,
      resume.parsedData || {}
    );

    // 4. Calculate deterministic ATS Readiness
    const atsReadiness = computeATSReadiness({
      resumeText: resume.extractedText,
      parsedData: resume.parsedData || {}
    });

    // 5. Evaluate Hard Eligibility Gates
    const eligibilityWarnings = evaluateEligibilityGates({
      resumeText: resume.extractedText,
      parsedData: resume.parsedData || {},
      roleProfile,
      jobDescription
    });

    // 6. Calculate deterministic Role Fit (or JD Match)
    const roleFit = computeRoleFit({
      detectedSkills,
      roleProfile,
      jobDescription,
      resumeText: resume.extractedText,
      parsedData: resume.parsedData || {}
    });

    // 7. Check for interview assessment data (if any exists for this user)
    const assessment = await SkillAssessment.findOne({
      userId: req.user._id,
      roleTrack
    });

    const interviewReadiness = {
      assessed: Boolean(assessment && assessment.assessed),
      score: assessment && assessment.assessed ? assessment.overallScore : null,
      statusMessage: assessment && assessment.assessed
        ? `Assessed score: ${assessment.overallScore}/100`
        : 'Interview readiness has not yet been assessed.',
      topicBreakdown: assessment && assessment.assessed ? assessment.topicScores : {}
    };

    // 8. Calculate Overall Career Readiness
    const overallCareerReadiness = computeOverallCareerReadiness({
      roleFitScore: roleFit.overallScore,
      atsReadinessScore: atsReadiness.overallScore,
      interviewAssessment: assessment && assessment.assessed ? assessment : null
    });

    // 9. Load Market Demand analytics
    const marketAnalytics = await analyzeMarketDemand(roleTrack);

    // 10. Calculate Skill Priorities
    const prioritizedSkills = prioritizeSkills(
      roleProfile.skills,
      detectedSkills,
      marketAnalytics.marketDemandMap
    );

    // 11. Calculate Category Readiness distribution
    const categoryReadiness = roleProfile.categories.map(cat => {
      const catSkills = roleProfile.skills.filter(s => s.category === cat);
      const catDetected = detectedSkills.filter(d => d.category === cat && d.evidenceLevel !== 'none');
      const totalScore = catDetected.reduce((acc, d) => acc + d.evidenceScore, 0);
      const avgScore = catSkills.length > 0 ? Math.round(totalScore / catSkills.length) : 0;
      const coverageRatio = catSkills.length > 0 ? parseFloat((catDetected.length / catSkills.length).toFixed(2)) : 0;

      return {
        category: cat,
        score: avgScore,
        requiredSkillCount: catSkills.length,
        matchedSkillCount: catDetected.length,
        coverageRatio
      };
    });

    // 12. Generate Personalized Learning Roadmap
    const weeklyPlan = generateRoadmap({
      prioritizedSkills,
      roleProfile,
      durationWeeks: parseInt(durationWeeks, 10) || 4
    });

    // 13. Dedicated SWE Analytics
    const sweReadinessAnalytics = computeSWEReadinessAnalytics(detectedSkills, roleProfile);

    // 14. Comprehensive ATS Keyword Intelligence
    const keywordAnalytics = runKeywordIntelligence({
      resumeText: resume.extractedText,
      parsedData: resume.parsedData || {},
      jobDescription,
      roleProfile,
      targetRole: roleProfile.roleTitle
    });

    // 15. Save CareerAnalysis record in MongoDB
    const analysisRecord = await CareerAnalysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      targetRole: roleProfile.roleTitle,
      roleTrack,
      jobDescription,
      analysisType,
      eligibilityWarnings,
      atsReadiness,
      roleFit,
      interviewReadiness,
      overallCareerReadiness,
      detectedSkills,
      prioritizedSkills,
      categoryReadiness,
      weeklyPlan,
      marketContext: {
        marketCorpusSize: marketAnalytics.marketCorpusSize,
        marketDatasetSource: marketAnalytics.marketDatasetSource,
        topDemandedSkills: marketAnalytics.topDemandedSkills,
        skillCoOccurrence: marketAnalytics.skillCoOccurrence,
        sweReadinessAnalytics
      },
      keywordAnalytics
    });

    res.status(201).json({
      success: true,
      message: 'Career intelligence analysis completed successfully',
      analysis: analysisRecord
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/:id
 * Fetches a single career analysis by ID
 */
exports.getCareerAnalysisById = async (req, res, next) => {
  try {
    const analysis = await CareerAnalysis.findById(req.params.id)
      .populate('resumeId', 'originalFileName uploadedAt parsedData');

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Career analysis not found' });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/history
 * Lists all career analyses for the current user
 */
exports.getCareerAnalysisHistory = async (req, res, next) => {
  try {
    const analyses = await CareerAnalysis.find({ userId: req.user._id })
      .populate('resumeId', 'originalFileName uploadedAt')
      .select('targetRole roleTrack analysisType atsReadiness.overallScore roleFit.overallScore overallCareerReadiness.score createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-analytics/:id/simulate
 * Runs What-If simulation with selected skills
 */
exports.runWhatIfSimulation = async (req, res, next) => {
  try {
    const { selectedSkills = [] } = req.body;
    const analysis = await CareerAnalysis.findById(req.params.id)
      .populate('resumeId', 'extractedText parsedData');

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const roleProfile = getRoleProfileData(analysis.targetRole);
    const simulationResult = simulateSkillImprovement({
      baselineAnalysis: analysis,
      selectedSkills,
      roleProfile
    });

    // Append to simulations array in MongoDB
    analysis.simulations.push(simulationResult);
    await analysis.save();

    res.status(200).json({
      success: true,
      simulation: simulationResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/career-analytics/:id/roadmap/task/:taskId
 * Updates task completion status in learning roadmap
 */
exports.updateRoadmapTask = async (req, res, next) => {
  try {
    const { completed } = req.body;
    const analysis = await CareerAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const task = analysis.weeklyPlan.find(t => t.taskId === req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Roadmap task not found' });
    }

    task.completed = typeof completed === 'boolean' ? completed : !task.completed;
    await analysis.save();

    const totalTasks = analysis.weeklyPlan.length;
    const completedTasks = analysis.weeklyPlan.filter(t => t.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      task,
      progress: {
        totalTasks,
        completedTasks,
        completionPercentage
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/:id/progress
 * Fetches progress statistics and history
 */
exports.getProgressAnalytics = async (req, res, next) => {
  try {
    const analysis = await CareerAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalTasks = analysis.weeklyPlan.length;
    const completedTasks = analysis.weeklyPlan.filter(t => t.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const remainingCriticalGaps = analysis.prioritizedSkills.filter(s => s.priorityLabel === 'Critical').length;

    // Fetch user's historical career analyses for time-series readiness trend
    const history = await CareerAnalysis.find({
      userId: req.user._id,
      roleTrack: analysis.roleTrack
    })
      .select('overallCareerReadiness.score roleFit.overallScore atsReadiness.overallScore createdAt')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      progress: {
        totalTasks,
        completedTasks,
        completionPercentage,
        remainingCriticalGaps,
        historicalTimeline: history.map(h => ({
          date: h.createdAt,
          overallReadiness: h.overallCareerReadiness?.score || 0,
          roleFit: h.roleFit?.overallScore || 0,
          atsReadiness: h.atsReadiness?.overallScore || 0
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-analytics/job-data/import
 * Imports custom job posting into the analytics corpus
 */
exports.importJobPosting = async (req, res, next) => {
  try {
    const { title, company, roleTrack, description, requiredSkills = [], preferredSkills = [], location } = req.body;

    if (!title || !company || !roleTrack) {
      return res.status(400).json({ success: false, message: 'title, company, and roleTrack are required' });
    }

    const posting = await JobPosting.create({
      id: `custom_${Date.now()}`,
      title,
      company,
      roleTrack,
      description,
      requiredSkills,
      preferredSkills,
      location,
      datasetSource: 'User-Uploaded Job Description',
      importedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Job posting successfully imported into market analytics corpus',
      posting
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/market/:roleTrack
 * Returns market analysis for a track
 */
exports.getMarketAnalyticsByTrack = async (req, res, next) => {
  try {
    const { roleTrack } = req.params;
    const analytics = await analyzeMarketDemand(roleTrack);
    res.status(200).json({ success: true, market: analytics });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/:id/keywords
 * Retrieves complete ATS Keyword Intelligence for a career analysis record
 */
exports.getKeywordAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = await CareerAnalysis.findById(id).populate('resumeId');
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Career analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // If keyword analytics already exists with matched keywords, return it
    if (analysis.keywordAnalytics && analysis.keywordAnalytics.matchedKeywords && analysis.keywordAnalytics.matchedKeywords.length > 0) {
      return res.status(200).json({
        success: true,
        keywordAnalytics: analysis.keywordAnalytics,
        analysisId: analysis._id,
        targetRole: analysis.targetRole
      });
    }

    // Lazy recalculation for legacy records
    const roleProfile = getRoleProfileData(analysis.targetRole);
    const keywordAnalytics = runKeywordIntelligence({
      resumeText: analysis.resumeId?.extractedText || '',
      parsedData: analysis.resumeId?.parsedData || {},
      jobDescription: analysis.jobDescription || '',
      roleProfile,
      targetRole: analysis.targetRole
    });

    analysis.keywordAnalytics = keywordAnalytics;
    await analysis.save();

    res.status(200).json({
      success: true,
      keywordAnalytics,
      analysisId: analysis._id,
      targetRole: analysis.targetRole
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-analytics/:id/keywords/recalculate
 * Recalculates ATS Keyword Intelligence with optional updated Job Description
 */
exports.recalculateKeywords = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jobDescription = '' } = req.body;

    const analysis = await CareerAnalysis.findById(id).populate('resumeId');
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Career analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const activeJd = (jobDescription !== undefined && jobDescription.trim().length > 0)
      ? jobDescription
      : (analysis.jobDescription || '');

    const roleProfile = getRoleProfileData(analysis.targetRole);
    const keywordAnalytics = runKeywordIntelligence({
      resumeText: analysis.resumeId?.extractedText || '',
      parsedData: analysis.resumeId?.parsedData || {},
      jobDescription: activeJd,
      roleProfile,
      targetRole: analysis.targetRole
    });

    analysis.keywordAnalytics = keywordAnalytics;
    if (jobDescription) {
      analysis.jobDescription = jobDescription;
      analysis.analysisType = 'Job-Description';
    }
    await analysis.save();

    res.status(200).json({
      success: true,
      message: 'Keyword intelligence successfully recalculated',
      keywordAnalytics
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-analytics/:id/keywords/:keyword/evidence
 * Retrieves in-depth evidence and breakdown for a specific keyword
 */
exports.getKeywordEvidence = async (req, res, next) => {
  try {
    const { id, keyword } = req.params;
    const analysis = await CareerAnalysis.findById(id).populate('resumeId');
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Career analysis not found' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const kwAnalytics = analysis.keywordAnalytics;
    if (!kwAnalytics || !kwAnalytics.matchedKeywords) {
      return res.status(404).json({ success: false, message: 'Keyword analytics not yet generated for this analysis' });
    }

    const targetLower = decodeURIComponent(keyword).toLowerCase();
    const item = kwAnalytics.matchedKeywords.find(k =>
      (k.canonicalKeyword || '').toLowerCase() === targetLower ||
      (k.originalPhrase || '').toLowerCase() === targetLower
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Keyword "${keyword}" not found in current analysis keyword set`
      });
    }

    res.status(200).json({
      success: true,
      keyword: item.canonicalKeyword,
      evidenceItem: item,
      optimizationContribution: item.isCritical ? 'Critical (35% coverage weight)' : 'Supporting (15% coverage weight)',
      scoreImpactExplanation: item.matchType === 'exact'
        ? 'Contributes maximum positive score to Critical/Supporting coverage and Importance Alignment.'
        : item.matchType === 'alias'
          ? 'Contributes full credit as recognized equivalent.'
          : item.matchType === 'semantic'
            ? 'Contributes partial credit for related concept; upgrade by using exact recognized term.'
            : item.matchType === 'unsupported'
              ? 'Contributes minimal credit (0.35 context quality) due to lack of narrative project/experience proof.'
              : 'Does not contribute to coverage score; prioritized in missing recommendations.'
    });
  } catch (err) {
    next(err);
  }
};
