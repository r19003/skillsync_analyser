const mongoose = require('mongoose');

const userCareerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  careerAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerAnalysis',
    index: true
  },
  targetRole: {
    type: String,
    required: true,
    enum: ['Business Analyst', 'Software Engineer'],
    default: 'Software Engineer'
  },
  targetSeniority: {
    type: String,
    enum: ['Internship', 'Entry-Level', 'Junior (1-2 yrs)', 'Mid-Level'],
    default: 'Entry-Level'
  },
  targetDate: {
    type: Date
  },
  currentStatus: {
    type: String,
    enum: ['Final Year Student', 'Recent Graduate', 'Career Switcher', 'Employed Job Seeker'],
    default: 'Recent Graduate'
  },
  weeklyHours: {
    type: Number,
    min: 2,
    max: 50,
    default: 10
  },
  availableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  sessionDurationMinutes: {
    type: Number,
    min: 20,
    max: 180,
    default: 45
  },
  preferredStudyTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'],
    default: 'Evening'
  },
  learningStyles: {
    type: [String],
    enum: ['Videos', 'Written documentation', 'Interactive practice', 'Projects', 'Mixed'],
    default: ['Interactive practice', 'Projects']
  },
  budget: {
    type: String,
    enum: ['Free only', 'Free and paid'],
    default: 'Free only'
  },
  preferredLanguage: {
    type: String,
    default: 'Python'
  },
  skillConfidence: {
    type: Map,
    of: Number, // 1 to 5
    default: {}
  },
  confirmedResumeSkills: {
    type: [String],
    default: []
  },
  skippedTopics: {
    type: [String],
    default: []
  },
  primaryGoals: {
    type: [String],
    default: ['Prepare for placements', 'Build portfolio']
  },
  timelineIntensity: {
    type: String,
    enum: ['Relaxed', 'Balanced', 'Intensive'],
    default: 'Balanced'
  },
  remindersEnabled: {
    type: Boolean,
    default: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'usercareerprofiles'
});

userCareerProfileSchema.index({ userId: 1, targetRole: 1 });

module.exports = mongoose.model('UserCareerProfile', userCareerProfileSchema);
