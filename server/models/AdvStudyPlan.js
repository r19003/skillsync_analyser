const mongoose = require('mongoose');

// ── Weekly task inside a week block ────────────────────────────────────────
const DailyTaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['learning', 'project', 'practice', 'revision', 'interview-prep'], default: 'learning' },
  duration:    { type: String, default: '1-2 hours' },
  resources:   [{ type: String }], // URLs, book names, course names
  status:      { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
}, { timestamps: true });

// ── One week's plan ────────────────────────────────────────────────────────
const WeekPlanSchema = new mongoose.Schema({
  weekNumber:    { type: Number, required: true },
  theme:         { type: String, default: '' }, // e.g. "SQL & Data Manipulation"
  focusSkills:   [{ type: String }],
  tasks:         [DailyTaskSchema],
  weeklyGoal:    { type: String, default: '' },
  deliverable:   { type: String, default: '' }  // e.g. "Complete SQL50 on LeetCode"
}, { _id: false });

// ── Milestone ──────────────────────────────────────────────────────────────
const MilestoneSchema = new mongoose.Schema({
  title:             { type: String, required: true },
  description:       { type: String, default: '' },
  targetWeek:        { type: Number, required: true },
  completionCriteria:{ type: String, default: '' },
  status:            { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

// ── Project recommendation ─────────────────────────────────────────────────
const ProjectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  skills:      [{ type: String }],
  difficulty:  { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  estimatedTime: { type: String, default: '1-2 weeks' }
}, { _id: false });

// ── Interview prep topic ────────────────────────────────────────────────────
const InterviewPrepSchema = new mongoose.Schema({
  topic:       { type: String, required: true },
  description: { type: String, default: '' },
  sampleQuestions: [{ type: String }]
}, { _id: false });

// ── Main AdvStudyPlan schema ───────────────────────────────────────────────
const AdvStudyPlanSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis',  required: true },
  reportId:   { type: mongoose.Schema.Types.ObjectId, ref: 'AIReport',  default: null },

  targetRole:     { type: String, default: '' },
  userGoal:       { type: String, default: '' },
  durationWeeks:  { type: Number, default: 4 },

  // Priority skill buckets (from Gemini)
  highPrioritySkills:   [{ type: String }],
  mediumPrioritySkills: [{ type: String }],
  lowPrioritySkills:    [{ type: String }],
  currentGapSummary:    { type: String, default: '' },

  // The core learning roadmap
  weeklyPlan:    [WeekPlanSchema],

  // Supporting content
  projects:      [ProjectSchema],
  interviewPrep: [InterviewPrepSchema],
  milestones:    [MilestoneSchema],

  // Progress tracking
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },

  // Source flag
  geminiGenerated: { type: Boolean, default: false },
  fallbackUsed:    { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('AdvStudyPlan', AdvStudyPlanSchema);
