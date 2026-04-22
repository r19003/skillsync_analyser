const Analysis = require('../models/Analysis');
const { computeATSScore } = require('../services/scoringService');
const { analyzeJobDescription } = require('../services/jobDescriptionService');
const { parseResume } = require('../services/resumeParserService');
const Resume = require('../models/Resume');

// Note: Re-utilizes the existing Analysis logic but exposes it directly for deep comparison.
exports.runComparison = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // 1. Fetch Resume
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // 2. Parse JD
    const jdData = analyzeJobDescription(jobDescription);
    
    // 3. Re-parse Resume (or use existing extracted fields if saved in Resume model)
    // To ensure accuracy against this specific JD, we run computeATSScore
    // For MVP, we presume `resume.parsedData.text` contains raw text
    const extractedResumeSkills = resume.parsedData?.skills || [];
    
    // 4. Run Scoring
    const scoringResult = computeATSScore({
      resumeText: resume.parsedData?.text || resume.originalText || '',
      resumeSkills: extractedResumeSkills,
      parsedSections: resume.parsedData?.sections || {},
      jobKeywords: jdData.keywords || [],
      requiredJobSkills: jdData.requiredSkills || []
    });

    // 5. Save Analysis Result
    const newAnalysis = new Analysis({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription,
      jobRole: jdData.jobRole,
      extractedJobSkills: jdData.requiredSkills,
      preferredSkills: jdData.preferredSkills,
      jobKeywords: jdData.keywords,
      extractedResumeSkills,
      ...scoringResult
    });

    await newAnalysis.save();

    res.status(201).json(newAnalysis);
  } catch (err) {
    console.error('Error running comparison:', err);
    res.status(500).json({ message: 'Server error during comparison' });
  }
};
