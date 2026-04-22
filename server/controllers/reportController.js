const Report = require('../models/Report');
const Analysis = require('../models/Analysis');
const { generateReportWithGemini } = require('../services/geminiService');

exports.generateReport = async (req, res) => {
  try {
    const { analysisId } = req.body;
    
    // Check if report already exists
    const existingReport = await Report.findOne({ analysisId });
    if (existingReport) return res.status(200).json(existingReport);

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    const reportData = await generateReportWithGemini(analysis);

    const newReport = new Report({
      userId: req.user._id,
      analysisId: analysis._id,
      ...reportData
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ analysisId: req.params.analysisId });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Server error fetching report' });
  }
};
