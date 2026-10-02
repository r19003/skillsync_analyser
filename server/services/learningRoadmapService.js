/**
 * learningRoadmapService.js
 *
 * Personalized Learning Roadmap Generator for SkillSync.
 * Synthesizes top prioritized skill gaps into an actionable,
 * week-by-week developmental curriculum with explicit deliverables.
 */

/**
 * Builds a structured weekly roadmap from prioritized skill gaps
 *
 * @param {Array} prioritizedSkills - Sorted output from skillPriorityService
 * @param {object} roleProfile - Canonical role profile with suggested evidence
 * @param {number} durationWeeks - Desired curriculum length (4 to 8 weeks)
 * @returns {Array} Weekly plan items with deliverables and readiness contribution
 */
const generateRoadmap = ({
  prioritizedSkills = [],
  roleProfile = {},
  durationWeeks = 4
}) => {
  // Filter gaps (priority Critical or High, or gapSeverity > 0)
  const actionableGaps = prioritizedSkills.filter(s => s.gapSeverity > 0);

  // If candidate has few gaps, pick top skills for advanced portfolio polish
  const skillsToSchedule = actionableGaps.length > 0
    ? actionableGaps.slice(0, Math.min(actionableGaps.length, durationWeeks * 2))
    : (roleProfile.skills || []).slice(0, durationWeeks);

  const weeklyPlan = [];

  for (let week = 1; week <= durationWeeks; week++) {
    const skillIndex = week - 1;
    const currentGap = skillsToSchedule[skillIndex] || skillsToSchedule[0] || {
      skill: 'Core Role Competencies',
      category: 'General',
      expectedContribution: 2.0
    };

    const canonicalName = currentGap.skill;
    const roleSkillMeta = (roleProfile.skills || []).find(
      s => s.canonicalName.toLowerCase() === canonicalName.toLowerCase()
    ) || {};

    let theme = '';
    let objective = '';
    let task = '';
    let deliverable = '';
    let evidenceToProduce = '';

    // Specialized tailoring based on track and skill
    if (roleProfile.roleTrack === 'Business Analyst') {
      if (canonicalName === 'SQL') {
        theme = 'Data Extraction & Relational Querying';
        objective = 'Master complex joins, aggregations, window functions, and CTEs.';
        task = 'Solve 30 real-world business queries on LeetCode SQL 50 or Mode Analytics.';
        deliverable = 'Complete an end-to-end SQL case study analyzing monthly revenue retention.';
        evidenceToProduce = 'SQL script repository on GitHub with documented ERD and query optimization notes.';
      } else if (canonicalName === 'Power BI' || canonicalName === 'Tableau' || canonicalName === 'Data visualization') {
        theme = 'Executive Dashboards & Visual Analytics';
        objective = 'Design interactive KPI dashboards with dynamic filters and drill-downs.';
        task = 'Build a multi-page operational dashboard using DAX measures and clean visual hierarchy.';
        deliverable = 'Published Power BI or Tableau Public report tracking business conversion KPIs.';
        evidenceToProduce = 'Live dashboard link and PDF executive summary added to portfolio.';
      } else if (canonicalName.includes('Requirements') || canonicalName === 'User stories' || canonicalName === 'Acceptance criteria') {
        theme = 'Product Requirements & Agile Delivery';
        objective = 'Translate stakeholder business objectives into INVEST-compliant user stories.';
        task = 'Draft 10 user stories with Given-When-Then acceptance criteria for an e-commerce checkout flow.';
        deliverable = 'Complete Business Requirements Document (BRD) and Jira backlog sprint plan.';
        evidenceToProduce = '8-page BRD artifact hosted on portfolio website or public Google Drive.';
      } else if (canonicalName.includes('process') || canonicalName === 'BPMN') {
        theme = 'Business Process Modeling & Optimization';
        objective = 'Map As-Is operational bottlenecks and design streamlined To-Be workflows.';
        task = 'Model end-to-end customer onboarding workflows using standard BPMN 2.0 swimlanes.';
        deliverable = 'Process optimization proposal demonstrating a 40% reduction in manual handoffs.';
        evidenceToProduce = 'BPMN 2.0 diagram set in Draw.io/Lucidchart with time-motion analysis.';
      } else {
        theme = `Strategic Competency: ${canonicalName}`;
        objective = `Build working proficiency and practical artifacts in ${canonicalName}.`;
        task = (roleSkillMeta.suggestedLearningActivities && roleSkillMeta.suggestedLearningActivities[0])
          || `Conduct structured practice and synthesize key findings in ${canonicalName}.`;
        deliverable = `One-page business analysis case study showcasing practical mastery of ${canonicalName}.`;
        evidenceToProduce = roleSkillMeta.suggestedPortfolioEvidence || `Portfolio case study detailing ${canonicalName}.`;
      }
    } else {
      // Software Engineer Track
      if (canonicalName === 'DSA' || canonicalName === 'Arrays and strings' || canonicalName === 'Trees and BST' || canonicalName === 'Dynamic programming') {
        theme = `Algorithmic Problem Solving: ${canonicalName}`;
        objective = `Master pattern recognition, asymptotic complexity analysis, and edge case handling in ${canonicalName}.`;
        task = `Solve 20 curated LeetCode/NeetCode problems focusing on ${canonicalName} patterns.`;
        deliverable = `Comprehensive GitHub repository documenting time/space complexity trade-offs for each pattern.`;
        evidenceToProduce = `GitHub algorithm repo with passing unit tests and asymptotic complexity notes.`;
      } else if (canonicalName === 'REST APIs' || canonicalName === 'Backend development' || canonicalName === 'Authentication') {
        theme = 'Backend Service Architecture & API Design';
        objective = 'Construct production-ready RESTful services with authentication and database persistence.';
        task = 'Build a modular service with JWT token rotation, bcrypt password hashing, and OpenAPI documentation.';
        deliverable = 'Containerized REST API backend deployed on cloud or running in Docker.';
        evidenceToProduce = 'Public GitHub repository with Swagger UI, Postman collection, and >80% test coverage.';
      } else if (canonicalName.includes('system design') || canonicalName === 'Caching' || canonicalName === 'Scalability') {
        theme = 'High-Level System Design & Distributed Systems';
        objective = 'Architect scalable, fault-tolerant distributed web architectures.';
        task = 'Design a URL shortener or rate limiter with Redis caching, load balancing, and database sharding.';
        deliverable = 'Formal System Design Document (SDD) with architecture diagram and trade-off justification.';
        evidenceToProduce = 'Architecture diagram and markdown design document published on GitHub.';
      } else if (canonicalName === 'Docker' || canonicalName === 'CI/CD' || canonicalName === 'Cloud fundamentals') {
        theme = 'Deployment Automation & Containerization';
        objective = 'Automate build, testing, and container deployment lifecycles.';
        task = 'Write a multi-stage Dockerfile and configure a GitHub Actions CI/CD workflow.';
        deliverable = 'Fully automated pipeline that lints, tests, and builds images on every commit.';
        evidenceToProduce = 'Passing CI badge and docker-compose.yml configuration in project root.';
      } else {
        theme = `Technical Focus: ${canonicalName}`;
        objective = `Deepen implementation skills and build demonstrable code proof in ${canonicalName}.`;
        task = (roleSkillMeta.suggestedLearningActivities && roleSkillMeta.suggestedLearningActivities[0])
          || `Build a hands-on project demonstrating ${canonicalName}.`;
        deliverable = `Working codebase and README showcase demonstrating ${canonicalName}.`;
        evidenceToProduce = roleSkillMeta.suggestedPortfolioEvidence || `Working GitHub repository featuring ${canonicalName}.`;
      }
    }

    weeklyPlan.push({
      taskId: `task_wk_${week}_${Date.now()}`,
      weekNumber: week,
      theme,
      focusSkill: canonicalName,
      category: currentGap.category || 'Core',
      learningObjective: objective,
      task,
      estimatedTime: '5-8 hours',
      deliverable,
      evidenceToProduce,
      completed: false,
      expectedReadinessContribution: currentGap.expectedContribution || 2.5
    });
  }

  return weeklyPlan;
};

module.exports = {
  generateRoadmap
};
