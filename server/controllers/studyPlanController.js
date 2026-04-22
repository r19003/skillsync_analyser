const StudyPlan = require('../models/StudyPlan');
const Analysis = require('../models/Analysis');
const { buildStudyPlan } = require('../services/studyPlanService');

exports.generateStudyPlan = async (req, res) => {
  try {
    const { analysisId } = req.body;
    
    // Check if already exists
    const existingPlan = await StudyPlan.findOne({ analysisId });
    if (existingPlan) return res.status(200).json(existingPlan);

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    const planData = buildStudyPlan(analysis);

    const newPlan = new StudyPlan({
      userId: req.user._id,
      analysisId: analysis._id,
      ...planData
    });

    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    console.error('Error generating study plan:', err);
    res.status(500).json({ message: 'Server error generating study plan' });
  }
};

exports.getStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ analysisId: req.params.analysisId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    res.status(200).json(plan);
  } catch (err) {
    console.error('Error fetching study plan:', err);
    res.status(500).json({ message: 'Server error fetching study plan' });
  }
};
