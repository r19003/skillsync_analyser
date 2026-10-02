const Resume = require('../models/Resume');
const MultiComparison = require('../models/MultiComparison');
const { analyzeJobDescription } = require('../services/jobDescriptionService');
const { computeATSScore } = require('../services/scoringService');

exports.runMultiComparison = async (req, res) => {
  try {
    const { resumeIds, jobDescription } = req.body; // Expect array of 2-3 ids

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length < 2) {
      return res.status(400).json({ message: 'Please provide at least 2 resumes to compare' });
    }

    // Parse JD once
    const jdData = analyzeJobDescription(jobDescription);

    const results = [];
    
    // Evaluate each resume against same JD
    for (const rid of resumeIds) {
      const resume = await Resume.findById(rid);
      if (!resume || resume.userId.toString() !== req.user._id.toString()) continue;

      const scoringResult = await computeATSScore({
        resumeText: resume.extractedText || '',
        resumeSkills: resume.parsedData?.skills || [],
        parsedSections: resume.parsedData?.sections || {},
        jobKeywords: jdData.keywords || [],
        requiredJobSkills: jdData.requiredSkills || []
      });

      results.push({
        resumeId: resume._id,
        resumeName: resume.originalFileName,
        atsScore: scoringResult.atsScore,
        matchPercentage: scoringResult.matchPercentage,
        matchedSkills: scoringResult.matchedSkills,
        missingSkills: scoringResult.missingSkills,
        strengths: scoringResult.strengths,
        scoreBreakdown: scoringResult.scoreBreakdown
      });
    }

    if (results.length === 0) return res.status(400).json({ message: 'No valid resumes found' });

    // Rank results by ATS score (highest first)
    results.sort((a, b) => b.atsScore - a.atsScore);

    // Assign ranking and verdicts
    results.forEach((r, idx) => {
      r.rank = idx + 1;
      if (idx === 0) r.verdict = "Winner - Best Alignment";
      else if (idx === 1 && r.atsScore >= results[0].atsScore - 10) r.verdict = "Runner Up - Very Close Match";
      else r.verdict = "Needs More Tailoring";
    });

    const winnerId = results[0].resumeId;

    // Save comparison History
    const mComp = new MultiComparison({
      userId: req.user._id,
      jobDescription,
      jobRole: jdData.jobRole,
      results,
      winnerId
    });

    await mComp.save();

    res.status(201).json(mComp);

  } catch (err) {
    console.error('Multi comparison error:', err);
    res.status(500).json({ message: 'Failed to run comparison' });
  }
};

exports.getComparisons = async (req, res) => {
    try {
      const history = await MultiComparison.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(history);
    } catch(err) {
      res.status(500).json({ message: 'Failed to fetch history' });
    }
};

exports.getComparisonById = async (req, res) => {
    try {
      const comp = await MultiComparison.findById(req.params.id);
      if(!comp || comp.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: "Not found" });
      res.json(comp);
    } catch(err) {
       res.status(500).json({ message: 'Failed to fetch' });
    }
}
