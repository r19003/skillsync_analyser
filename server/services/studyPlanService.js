const buildStudyPlan = (analysis) => {
  const { missingSkills, jobRole } = analysis;
  
  // Categorize missing skills randomly for MVP (In future, base this on skill category dictionary)
  const prioritySkills = { high: [], medium: [], low: [] };
  
  missingSkills.forEach((skill, index) => {
    if (index % 3 === 0) prioritySkills.high.push(skill);
    else if (index % 3 === 1) prioritySkills.medium.push(skill);
    else prioritySkills.low.push(skill);
  });

  const durationWeeks = 4;
  const tasks = [];
  const milestones = [];

  // If no missing skills, provide interview prep plan
  if (missingSkills.length === 0) {
    return {
      targetRole: jobRole || 'Target Role',
      skillGaps: [],
      prioritySkills,
      durationWeeks: 2,
      tasks: [
        { title: 'Update Resume', description: 'Ensure all recent projects are added', duration: '2 hours', weekNumber: 1 },
        { title: 'Mock Interview', description: 'Schedule a mock interview focusing on technical skills', duration: '1 day', weekNumber: 2 }
      ],
      milestones: [
        { title: 'Resume Finalized', description: 'Ready to submit', targetWeek: 1 }
      ]
    };
  }

  // Week 1: High Priority
  prioritySkills.high.forEach(skill => {
    tasks.push({ title: `Learn fundamentals of ${skill}`, description: `Find an introductory course or documentation for ${skill}`, duration: '3 days', weekNumber: 1 });
  });
  milestones.push({ title: 'Master Core Gaps', description: `Understand basics of ${prioritySkills.high.join(', ')}`, targetWeek: 1 });

  // Week 2/3: Medium / Low
  prioritySkills.medium.forEach(skill => {
    tasks.push({ title: `Explore intermediate concepts in ${skill}`, description: `Build a minimal project using ${skill}`, duration: '4 days', weekNumber: 2 });
  });
  prioritySkills.low.forEach(skill => {
    tasks.push({ title: `Familiarize with ${skill}`, description: `Read articles or watch summaries on ${skill}`, duration: '2 days', weekNumber: 3 });
  });
  
  milestones.push({ title: 'Practical Application', description: 'Build a small portfolio project combining newly learned skills', targetWeek: 3 });

  // Week 4: Interview & Revision
  tasks.push({ title: `Update Resume`, description: 'Add your new skills to the resume and re-run ATS scan', duration: '1 day', weekNumber: 4 });
  tasks.push({ title: `Interview Prep`, description: `Practice common interview questions for ${jobRole || 'the role'}`, duration: '3 days', weekNumber: 4 });
  milestones.push({ title: 'Interview Ready', description: 'Ready to apply with new skills', targetWeek: 4 });

  return {
    targetRole: jobRole || 'Target Role',
    skillGaps: missingSkills,
    prioritySkills,
    durationWeeks,
    tasks,
    milestones
  };
};

module.exports = { buildStudyPlan };
