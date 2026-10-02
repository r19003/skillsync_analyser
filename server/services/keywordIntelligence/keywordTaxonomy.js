/**
 * keywordTaxonomy.js
 *
 * Comprehensive taxonomy of keywords, categories, aliases, and transferable relationships
 * across Business Analyst and Software Engineer domains.
 */

// Categorical classifications requested
const KEYWORD_CATEGORIES = {
  JOB_TITLE: 'Job title keywords',
  HARD_SKILL: 'Hard skills',
  TOOL: 'Software and tools',
  PROGRAMMING_LANG: 'Programming languages',
  FRAMEWORK: 'Frameworks and libraries',
  BIZ_METHODOLOGY: 'Business methodologies',
  TECH_METHODOLOGY: 'Technical methodologies',
  DOMAIN_TERMINOLOGY: 'Domain terminology',
  RESPONSIBILITY: 'Responsibilities',
  QUALIFICATION: 'Qualifications',
  CERTIFICATION: 'Certifications',
  EDUCATION: 'Education requirements',
  EXPERIENCE_LEVEL: 'Experience-level terms',
  SOFT_SKILL: 'Soft skills',
  ACTION_VERB: 'Action verbs',
  IMPACT_TERM: 'Business-impact terms',
  DSA_TOPIC: 'DSA topics',
  CS_FUNDAMENTAL: 'CS fundamentals',
  SYSTEM_DESIGN: 'System-design concepts'
};

// Canonical Dictionary of known technical and business keywords with category, aliases, and transferability
const KEYWORD_TAXONOMY = [
  // --- PROGRAMMING LANGUAGES ---
  {
    canonical: 'Python',
    category: KEYWORD_CATEGORIES.PROGRAMMING_LANG,
    defaultImportance: 92,
    aliases: ['python', 'python3', 'py'],
    relatedKeywords: ['Java', 'C++', 'Go'],
    isTechnical: true
  },
  {
    canonical: 'Java',
    category: KEYWORD_CATEGORIES.PROGRAMMING_LANG,
    defaultImportance: 90,
    aliases: ['java', 'core java', 'java 11', 'java 17', 'java 21', 'jvm'],
    relatedKeywords: ['Python', 'C++', 'C#', 'Kotlin'],
    isTechnical: true
  },
  {
    canonical: 'JavaScript',
    category: KEYWORD_CATEGORIES.PROGRAMMING_LANG,
    defaultImportance: 94,
    aliases: ['javascript', 'js', 'es6', 'es6+', 'ecmascript'],
    relatedKeywords: ['TypeScript', 'Node.js', 'React'],
    isTechnical: true
  },
  {
    canonical: 'TypeScript',
    category: KEYWORD_CATEGORIES.PROGRAMMING_LANG,
    defaultImportance: 90,
    aliases: ['typescript', 'ts'],
    relatedKeywords: ['JavaScript', 'React', 'Node.js'],
    isTechnical: true
  },
  {
    canonical: 'C++',
    category: KEYWORD_CATEGORIES.PROGRAMMING_LANG,
    defaultImportance: 78,
    aliases: ['c++', 'cpp', 'c/c++', 'modern c++'],
    relatedKeywords: ['C', 'Java', 'Rust'],
    isTechnical: true
  },
  {
    canonical: 'SQL',
    category: KEYWORD_CATEGORIES.HARD_SKILL,
    defaultImportance: 96,
    aliases: ['sql', 'structured query language', 't-sql', 'pl/sql', 'ansi sql'],
    relatedKeywords: ['PostgreSQL', 'MySQL', 'Database design', 'Data analysis'],
    isTechnical: true
  },

  // --- SOFTWARE AND TOOLS ---
  {
    canonical: 'Power BI',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 88,
    aliases: ['power bi', 'powerbi', 'microsoft power bi', 'power query', 'dax'],
    relatedKeywords: ['Tableau', 'Looker', 'Data visualization', 'Excel'],
    transferableTo: ['Tableau', 'Looker']
  },
  {
    canonical: 'Tableau',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 86,
    aliases: ['tableau', 'tableau desktop', 'tableau public', 'tableau server'],
    relatedKeywords: ['Power BI', 'Looker', 'Data visualization'],
    transferableTo: ['Power BI', 'Looker']
  },
  {
    canonical: 'Excel',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 90,
    aliases: ['excel', 'microsoft excel', 'ms excel', 'vlookup', 'xlookup', 'pivot tables', 'advanced excel'],
    relatedKeywords: ['Google Sheets', 'Data analysis', 'Power BI'],
    transferableTo: ['Google Sheets']
  },
  {
    canonical: 'Jira',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 82,
    aliases: ['jira', 'atlassian jira', 'jira software'],
    relatedKeywords: ['Confluence', 'Asana', 'Trello', 'Agile', 'Scrum'],
    transferableTo: ['Asana', 'Azure DevOps']
  },
  {
    canonical: 'Docker',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 84,
    aliases: ['docker', 'containerization', 'containers', 'dockerfile', 'docker compose'],
    relatedKeywords: ['Kubernetes', 'Cloud fundamentals', 'CI/CD'],
    isTechnical: true
  },
  {
    canonical: 'Git',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 95,
    aliases: ['git', 'github', 'gitlab', 'version control', 'bitbucket'],
    relatedKeywords: ['CI/CD', 'Software development'],
    isTechnical: true
  },
  {
    canonical: 'Postman',
    category: KEYWORD_CATEGORIES.TOOL,
    defaultImportance: 75,
    aliases: ['postman', 'api testing', 'api collections'],
    relatedKeywords: ['REST APIs', 'Swagger', 'OpenAPI'],
    isTechnical: true
  },

  // --- FRAMEWORKS AND LIBRARIES ---
  {
    canonical: 'React',
    category: KEYWORD_CATEGORIES.FRAMEWORK,
    defaultImportance: 92,
    aliases: ['react', 'react.js', 'reactjs'],
    relatedKeywords: ['Frontend development', 'JavaScript', 'TypeScript', 'Next.js', 'Vue.js'],
    transferableTo: ['Vue.js', 'Angular'],
    isTechnical: true
  },
  {
    canonical: 'Node.js',
    category: KEYWORD_CATEGORIES.FRAMEWORK,
    defaultImportance: 92,
    aliases: ['node.js', 'nodejs', 'node js', 'node'],
    relatedKeywords: ['Express', 'Backend development', 'REST APIs', 'JavaScript'],
    isTechnical: true
  },
  {
    canonical: 'Spring Boot',
    category: KEYWORD_CATEGORIES.FRAMEWORK,
    defaultImportance: 88,
    aliases: ['spring boot', 'spring framework', 'spring mvc'],
    relatedKeywords: ['Java', 'Backend development', 'REST APIs', 'Microservices'],
    isTechnical: true
  },
  {
    canonical: 'Express',
    category: KEYWORD_CATEGORIES.FRAMEWORK,
    defaultImportance: 85,
    aliases: ['express', 'express.js', 'expressjs'],
    relatedKeywords: ['Node.js', 'REST APIs', 'Backend development'],
    isTechnical: true
  },
  {
    canonical: 'FastAPI',
    category: KEYWORD_CATEGORIES.FRAMEWORK,
    defaultImportance: 82,
    aliases: ['fastapi', 'fast api'],
    relatedKeywords: ['Python', 'REST APIs', 'Backend development'],
    isTechnical: true
  },

  // --- BUSINESS ANALYSIS COMPETENCIES & METHODOLOGIES ---
  {
    canonical: 'Requirements Gathering',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 96,
    aliases: [
      'requirements gathering', 'requirement gathering', 'requirements elicitation',
      'requirement elicitation', 'eliciting requirements', 'gathering requirements',
      'user requirements', 'requirements engineering'
    ],
    relatedKeywords: ['User stories', 'Stakeholder management', 'BRD', 'FRD']
  },
  {
    canonical: 'Business Requirements Documents',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 90,
    aliases: ['business requirements documents', 'brd', 'business requirement document', 'business requirements documentation'],
    relatedKeywords: ['Functional Requirements Documents', 'FRD', 'Documentation']
  },
  {
    canonical: 'Functional Requirements Documents',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 88,
    aliases: ['functional requirements documents', 'frd', 'functional specifications', 'functional specification document', 'fsd'],
    relatedKeywords: ['Business Requirements Documents', 'BRD', 'User stories']
  },
  {
    canonical: 'User Stories',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 92,
    aliases: ['user stories', 'user story', 'user-story mapping', 'epics'],
    relatedKeywords: ['Acceptance criteria', 'Agile', 'Scrum', 'Jira']
  },
  {
    canonical: 'Acceptance Criteria',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 90,
    aliases: ['acceptance criteria', 'definition of done', 'given-when-then', 'gherkin'],
    relatedKeywords: ['User stories', 'UAT', 'Quality assurance']
  },
  {
    canonical: 'Business Process Modelling',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 88,
    aliases: ['business process modelling', 'business process modeling', 'process mapping', 'workflow diagrams', 'flowcharts', 'swimlane diagrams'],
    relatedKeywords: ['BPMN', 'Process improvement', 'Gap analysis']
  },
  {
    canonical: 'BPMN',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 80,
    aliases: ['bpmn', 'bpmn 2.0', 'business process model and notation'],
    relatedKeywords: ['Business process modelling', 'Process improvement']
  },
  {
    canonical: 'Process Improvement',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 84,
    aliases: ['process improvement', 'process optimization', 'workflow optimization', 'efficiency improvement', 'kaizen'],
    relatedKeywords: ['Root-cause analysis', 'Gap analysis', 'KPI reporting']
  },
  {
    canonical: 'Agile',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 92,
    aliases: ['agile', 'agile methodology', 'agile environment', 'agile sprint', 'agile delivery'],
    relatedKeywords: ['Scrum', 'Jira', 'Sprint planning', 'Daily standup']
  },
  {
    canonical: 'Scrum',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 90,
    aliases: ['scrum', 'scrum framework', 'sprint retrospectives', 'daily standups', 'sprint planning'],
    relatedKeywords: ['Agile', 'Jira', 'User stories']
  },
  {
    canonical: 'Stakeholder Management',
    category: KEYWORD_CATEGORIES.SOFT_SKILL,
    defaultImportance: 94,
    aliases: ['stakeholder management', 'managing stakeholders', 'client communication', 'stakeholder engagement', 'cross-functional collaboration'],
    relatedKeywords: ['Communication', 'Presentation', 'Requirements gathering']
  },
  {
    canonical: 'UAT',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 86,
    aliases: ['uat', 'user acceptance testing', 'acceptance testing', 'user testing', 'test cases'],
    relatedKeywords: ['Acceptance criteria', 'Quality assurance', 'Requirements gathering']
  },
  {
    canonical: 'Gap Analysis',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 84,
    aliases: ['gap analysis', 'as-is to-be', 'current state future state', 'as-is process', 'to-be process'],
    relatedKeywords: ['Root-cause analysis', 'Business process modelling']
  },
  {
    canonical: 'Root-Cause Analysis',
    category: KEYWORD_CATEGORIES.BIZ_METHODOLOGY,
    defaultImportance: 82,
    aliases: ['root-cause analysis', 'root cause analysis', 'rca', '5 whys', 'fishbone diagram', 'ishikawa'],
    relatedKeywords: ['Problem solving', 'Gap analysis', 'Process improvement']
  },
  {
    canonical: 'KPI Reporting',
    category: KEYWORD_CATEGORIES.DOMAIN_TERMINOLOGY,
    defaultImportance: 86,
    aliases: ['kpi reporting', 'kpi development', 'metrics definition', 'key performance indicators', 'executive reporting', 'dashboard reporting'],
    relatedKeywords: ['Data visualization', 'Power BI', 'Tableau', 'Reporting']
  },
  {
    canonical: 'Data Visualization',
    category: KEYWORD_CATEGORIES.HARD_SKILL,
    defaultImportance: 88,
    aliases: ['data visualization', 'data viz', 'visual reporting', 'dashboards', 'executive dashboards'],
    relatedKeywords: ['Power BI', 'Tableau', 'Excel']
  },

  // --- TECHNICAL METHODOLOGIES & SOFTWARE DEVELOPMENT ---
  {
    canonical: 'REST APIs',
    category: KEYWORD_CATEGORIES.TECH_METHODOLOGY,
    defaultImportance: 95,
    aliases: ['rest apis', 'rest api', 'restful api', 'restful apis', 'restful services', 'api development', 'rest architecture'],
    relatedKeywords: ['Backend development', 'Postman', 'Microservices', 'HTTP endpoints'],
    isTechnical: true
  },
  {
    canonical: 'Backend Development',
    category: KEYWORD_CATEGORIES.HARD_SKILL,
    defaultImportance: 94,
    aliases: ['backend development', 'backend', 'server-side development', 'server-side architecture', 'api design'],
    relatedKeywords: ['REST APIs', 'Node.js', 'Java', 'Python', 'SQL'],
    isTechnical: true
  },
  {
    canonical: 'Frontend Development',
    category: KEYWORD_CATEGORIES.HARD_SKILL,
    defaultImportance: 88,
    aliases: ['frontend development', 'frontend', 'client-side', 'single page application', 'spa'],
    relatedKeywords: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
    isTechnical: true
  },
  {
    canonical: 'Microservices',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 85,
    aliases: ['microservices', 'microservice architecture', 'distributed services'],
    relatedKeywords: ['REST APIs', 'Docker', 'System design', 'Scalability'],
    isTechnical: true
  },
  {
    canonical: 'Authentication',
    category: KEYWORD_CATEGORIES.TECH_METHODOLOGY,
    defaultImportance: 88,
    aliases: ['authentication', 'authorization', 'jwt', 'oauth', 'oauth2', 'sso', 'json web tokens', 'auth'],
    relatedKeywords: ['Security', 'REST APIs', 'Backend development'],
    isTechnical: true
  },
  {
    canonical: 'Testing',
    category: KEYWORD_CATEGORIES.TECH_METHODOLOGY,
    defaultImportance: 88,
    aliases: ['testing', 'unit testing', 'integration testing', 'jest', 'junit', 'pytest', 'tdd', 'test driven development'],
    relatedKeywords: ['Debugging', 'Quality assurance', 'Software development'],
    isTechnical: true
  },
  {
    canonical: 'CI/CD',
    category: KEYWORD_CATEGORIES.TECH_METHODOLOGY,
    defaultImportance: 85,
    aliases: ['ci/cd', 'continuous integration', 'continuous delivery', 'continuous deployment', 'github actions', 'jenkins'],
    relatedKeywords: ['Git', 'Docker', 'Tools and deployment'],
    isTechnical: true
  },

  // --- DSA TOPICS ---
  {
    canonical: 'DSA',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 98,
    aliases: ['dsa', 'data structures and algorithms', 'data structures & algorithms', 'algorithms and data structures'],
    relatedKeywords: ['Arrays and strings', 'Trees and BST', 'Dynamic programming', 'Complexity analysis'],
    isTechnical: true
  },
  {
    canonical: 'Dynamic Programming',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 90,
    aliases: ['dynamic programming', 'dp', 'memoization', 'tabulation'],
    relatedKeywords: ['DSA', 'Recursion', 'Optimization'],
    isTechnical: true
  },
  {
    canonical: 'Graphs',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 88,
    aliases: ['graphs', 'graph algorithms', 'bfs', 'dfs', 'breadth first search', 'depth first search', 'dijkstra'],
    relatedKeywords: ['DSA', 'Trees and BST'],
    isTechnical: true
  },
  {
    canonical: 'Trees and BST',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 88,
    aliases: ['trees and bst', 'binary search tree', 'binary tree', 'trie', 'avl tree', 'tree traversal'],
    relatedKeywords: ['DSA', 'Graphs'],
    isTechnical: true
  },
  {
    canonical: 'Arrays and Strings',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 92,
    aliases: ['arrays and strings', 'arrays', 'strings', 'two pointers', 'sliding window'],
    relatedKeywords: ['DSA', 'Sorting and searching'],
    isTechnical: true
  },
  {
    canonical: 'Sorting and Searching',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 88,
    aliases: ['sorting and searching', 'binary search', 'quicksort', 'mergesort'],
    relatedKeywords: ['DSA', 'Time and space complexity'],
    isTechnical: true
  },
  {
    canonical: 'Time and Space Complexity',
    category: KEYWORD_CATEGORIES.DSA_TOPIC,
    defaultImportance: 92,
    aliases: ['time and space complexity', 'big o', 'big-o notation', 'complexity analysis', 'asymptotic analysis'],
    relatedKeywords: ['DSA', 'Optimization'],
    isTechnical: true
  },

  // --- CS FUNDAMENTALS ---
  {
    canonical: 'DBMS',
    category: KEYWORD_CATEGORIES.CS_FUNDAMENTAL,
    defaultImportance: 90,
    aliases: ['dbms', 'database management systems', 'rdbms', 'relational databases', 'acid properties', 'indexing', 'normalization'],
    relatedKeywords: ['SQL', 'PostgreSQL', 'Database design'],
    isTechnical: true
  },
  {
    canonical: 'Operating Systems',
    category: KEYWORD_CATEGORIES.CS_FUNDAMENTAL,
    defaultImportance: 86,
    aliases: ['operating systems', 'os', 'threads', 'processes', 'multithreading', 'concurrency', 'deadlocks', 'memory management'],
    relatedKeywords: ['Computer networks', 'CS fundamentals'],
    isTechnical: true
  },
  {
    canonical: 'Computer Networks',
    category: KEYWORD_CATEGORIES.CS_FUNDAMENTAL,
    defaultImportance: 85,
    aliases: ['computer networks', 'networking', 'tcp/ip', 'http', 'https', 'dns', 'websockets', 'osi model'],
    relatedKeywords: ['Operating systems', 'REST APIs'],
    isTechnical: true
  },

  // --- SYSTEM DESIGN CONCEPTS ---
  {
    canonical: 'System Design',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 85,
    aliases: ['system design', 'high level design', 'hld', 'low level design', 'lld', 'software architecture'],
    relatedKeywords: ['Caching', 'Load balancing', 'Scalability', 'Microservices'],
    isTechnical: true
  },
  {
    canonical: 'Caching',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 84,
    aliases: ['caching', 'redis', 'memcached', 'cache invalidation', 'distributed cache'],
    relatedKeywords: ['System design', 'Scalability', 'Backend development'],
    isTechnical: true
  },
  {
    canonical: 'Load Balancing',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 82,
    aliases: ['load balancing', 'load balancer', 'reverse proxy', 'nginx', 'horizontal scaling'],
    relatedKeywords: ['System design', 'Scalability', 'Reliability'],
    isTechnical: true
  },
  {
    canonical: 'Scalability',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 88,
    aliases: ['scalability', 'horizontal scaling', 'vertical scaling', 'high throughput', 'scalable systems'],
    relatedKeywords: ['System design', 'Caching', 'Load balancing', 'Reliability'],
    isTechnical: true
  },
  {
    canonical: 'Reliability',
    category: KEYWORD_CATEGORIES.SYSTEM_DESIGN,
    defaultImportance: 80,
    aliases: ['reliability', 'high availability', 'fault tolerance', 'redundancy', 'disaster recovery'],
    relatedKeywords: ['System design', 'Scalability'],
    isTechnical: true
  },

  // --- QUALIFICATIONS & CERTIFICATIONS ---
  {
    canonical: 'Bachelor Degree in Computer Science',
    category: KEYWORD_CATEGORIES.EDUCATION,
    defaultImportance: 90,
    aliases: ["bachelor's in computer science", 'bs in cs', 'b.tech in cs', 'b.e. in computer science', 'computer science degree'],
    relatedKeywords: ['Education requirements']
  },
  {
    canonical: 'Bachelor Degree in Business / Economics',
    category: KEYWORD_CATEGORIES.EDUCATION,
    defaultImportance: 88,
    aliases: ["bachelor's in business", 'bba', 'bachelor of commerce', 'economics degree', 'b.s. in business administration'],
    relatedKeywords: ['Education requirements']
  },
  {
    canonical: 'AWS Certified Cloud Practitioner',
    category: KEYWORD_CATEGORIES.CERTIFICATION,
    defaultImportance: 75,
    aliases: ['aws certified', 'cloud practitioner', 'aws certification', 'aws solutions architect'],
    relatedKeywords: ['Cloud fundamentals', 'AWS']
  },
  {
    canonical: 'ECBA',
    category: KEYWORD_CATEGORIES.CERTIFICATION,
    defaultImportance: 70,
    aliases: ['ecba', 'entry certificate in business analysis', 'iiba ecba'],
    relatedKeywords: ['CBAP', 'Business analysis']
  },

  // --- JOB TITLES ---
  {
    canonical: 'Business Analyst',
    category: KEYWORD_CATEGORIES.JOB_TITLE,
    defaultImportance: 95,
    aliases: ['business analyst', 'associate business analyst', 'junior business analyst', 'ba', 'business systems analyst'],
    relatedKeywords: ['Data Analyst', 'Product Analyst', 'Systems Analyst']
  },
  {
    canonical: 'Software Engineer',
    category: KEYWORD_CATEGORIES.JOB_TITLE,
    defaultImportance: 95,
    aliases: ['software engineer', 'software developer', 'associate software engineer', 'junior software engineer', 'swe', 'sde'],
    relatedKeywords: ['Full Stack Developer', 'Backend Developer', 'Frontend Developer']
  },
  {
    canonical: 'Data Analyst',
    category: KEYWORD_CATEGORIES.JOB_TITLE,
    defaultImportance: 90,
    aliases: ['data analyst', 'junior data analyst', 'business data analyst'],
    relatedKeywords: ['Business Analyst', 'BI Analyst']
  },

  // --- ACTION VERBS ---
  {
    canonical: 'Engineered',
    category: KEYWORD_CATEGORIES.ACTION_VERB,
    defaultImportance: 80,
    aliases: ['engineered', 'architected', 'constructed'],
    isStrongVerb: true
  },
  {
    canonical: 'Optimized',
    category: KEYWORD_CATEGORIES.ACTION_VERB,
    defaultImportance: 85,
    aliases: ['optimized', 'streamlined', 'enhanced', 'accelerated'],
    isStrongVerb: true
  },
  {
    canonical: 'Implemented',
    category: KEYWORD_CATEGORIES.ACTION_VERB,
    defaultImportance: 85,
    aliases: ['implemented', 'deployed', 'executed'],
    isStrongVerb: true
  },
  {
    canonical: 'Formulated',
    category: KEYWORD_CATEGORIES.ACTION_VERB,
    defaultImportance: 80,
    aliases: ['formulated', 'devised', 'established'],
    isStrongVerb: true
  },
  {
    canonical: 'Spearheaded',
    category: KEYWORD_CATEGORIES.ACTION_VERB,
    defaultImportance: 82,
    aliases: ['spearheaded', 'orchestrated', 'led', 'directed'],
    isStrongVerb: true
  }
];

// Weak / passive verbs that recruiters discourage
const WEAK_ACTION_VERBS = [
  { phrase: 'worked on', replacement: 'Engineered / Developed / Executed' },
  { phrase: 'responsible for', replacement: 'Spearheaded / Managed / Directed' },
  { phrase: 'helped with', replacement: 'Collaborated on / Facilitated / Supported' },
  { phrase: 'participated in', replacement: 'Contributed to / Coordinated / Co-engineered' },
  { phrase: 'assisted in', replacement: 'Facilitated / Accelerated / Co-authored' },
  { phrase: 'involved in', replacement: 'Executed / Implemented / Formulated' }
];

module.exports = {
  KEYWORD_CATEGORIES,
  KEYWORD_TAXONOMY,
  WEAK_ACTION_VERBS
};
