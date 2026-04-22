const generateReportData = (analysis) => {
  const { 
    atsScore, 
    matchPercentage, 
    strengths, 
    weaknesses, 
    recommendations, 
    missingSkills, 
    scoreBreakdown,
    jobRole 
  } = analysis;

  // Generate Executive Summary
  let summary = `This resume presents a moderate profile.`;
  if (atsScore >= 80) summary = `This resume is highly optimized and exceptionally tailored for the ${jobRole || 'target'} position, demonstrating very strong alignment with industry standards.`;
  else if (atsScore >= 50) summary = `This resume shows good potential for the ${jobRole || 'target'} role but requires strategic refinement to ensure it passes automated tracking systems confidently.`;
  else summary = `This resume requires significant structural and content revisions to be competitive for the ${jobRole || 'target'} position.`;

  // ATS Evaluation
  let atsEval = `The ATS compatibility score is ${atsScore}/100. `;
  if (scoreBreakdown?.formatting?.score < 6) {
    atsEval += `Formatting issues were detected which might confuse parsing bots. `;
  } else {
    atsEval += `The document structure is clean and machine-readable. `;
  }
  if (scoreBreakdown?.keywordMatch?.score < 20) {
    atsEval += `However, low keyword density severely impacts your visibility to recruiters.`;
  } else {
    atsEval += `Strong keyword matching ensures high visibility in recruiter search queries.`;
  }

  // Resume Quality & JD Alignment
  const qualityReview = `Your overall formatting and completeness scored ${scoreBreakdown?.sectionCompleteness?.score + scoreBreakdown?.formatting?.score || 0} out of 30. Ensure all critical sections are populated and appropriately detailed.`;
  const alignmentReview = `You matched ${matchPercentage}% of the core skills required for this job description.`;

  return {
    executiveSummary: summary,
    atsEvaluation: atsEval,
    strengths: strengths || [],
    weaknesses: weaknesses || [],
    resumeQualityReview: qualityReview,
    jdAlignmentReview: alignmentReview,
    recommendedImprovements: recommendations || [],
    suggestedActionPlan: missingSkills.length > 0 
      ? ['Review the generated Study Plan to acquire missing skills.', 'Update resume bullet points to include exact terminology from the JD.']
      : ['Apply immediately; your profile is a strong match.', 'Prepare for technical interviews focusing on your core matched skills.']
  };
};

module.exports = { generateReportData };
