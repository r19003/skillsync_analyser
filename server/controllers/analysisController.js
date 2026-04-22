const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const { analyzeJobDescription } = require('../services/jobDescriptionService');
const { computeATSScore } = require('../services/scoringService');

// ─────────────────────────────────────────────
// @desc    Create a new analysis for a resume + job description
// @route   POST /api/analysis/
// @access  Protected
// ─────────────────────────────────────────────
const createAnalysis = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { resumeId, jobDescription } = req.body;

    // 1. Fetch the resume — must belong to this user
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // 2. Ensure the resume has extracted text
    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short to analyze. Please re-upload a text-based PDF.',
      });
    }

    // 3. Analyze job description
    const { jobRole, requiredSkills, preferredSkills, keywords } = analyzeJobDescription(jobDescription);

    // 4. Run ATS scoring
    const {
      atsScore,
      matchPercentage,
      scoreBreakdown,
      matchedSkills,
      missingSkills,
      extraSkills,
      strengths,
      weaknesses,
      recommendations,
    } = computeATSScore({
      resumeText: resume.extractedText,
      resumeSkills: resume.parsedData.skills || [],
      parsedSections: resume.parsedData.sections || {},
      jobKeywords: keywords,
      requiredJobSkills: requiredSkills,
    });

    // 5. Save analysis to DB
    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription,
      jobRole,
      extractedJobSkills: requiredSkills,
      preferredSkills,
      jobKeywords: keywords,
      extractedResumeSkills: resume.parsedData.skills || [],
      matchedSkills,
      missingSkills,
      extraSkills,
      atsScore,
      matchPercentage,
      scoreBreakdown,
      strengths,
      weaknesses,
      recommendations,
    });

    res.status(201).json({
      success: true,
      message: 'Analysis completed!',
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all analyses for logged-in user
// @route   GET /api/analysis/
// @access  Protected
// ─────────────────────────────────────────────
const getMyAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate('resumeId', 'originalFileName uploadedAt')  // pull resume filename
      .select('-jobDescription -jobKeywords')                // slim down list view
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single analysis by ID
// @route   GET /api/analysis/:id
// @access  Protected
// ─────────────────────────────────────────────
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId', 'originalFileName uploadedAt parsedData');

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a single analysis
// @route   DELETE /api/analysis/:id
// @access  Protected
// ─────────────────────────────────────────────
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await analysis.deleteOne();
    res.status(200).json({ success: true, message: 'Analysis deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAnalysis, getMyAnalyses, getAnalysisById, deleteAnalysis };
