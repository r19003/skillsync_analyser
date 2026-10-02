from typing import List, Dict, Any, Optional
from ..schemas.assessment import AssessmentQuestion, AssessmentSubmission, AssessmentResult

DIAGNOSTIC_BANK: List[Dict[str, Any]] = [
    # =========================================================================
    # 1. SOFTWARE ENGINEER: DATA STRUCTURES & ALGORITHMS (swe-dsa)
    # =========================================================================
    {
        "id": "swe-dsa-1",
        "roleTrack": "Software Engineer",
        "skill": "Data Structures and Algorithms",
        "category": "DSA",
        "questionText": "What is the time complexity of looking up a value by key in a standard Hash Map under average vs worst-case conditions?",
        "options": [
            "O(1) average, O(N) worst-case",
            "O(log N) average, O(N) worst-case",
            "O(1) average, O(1) worst-case",
            "O(N) average, O(N log N) worst-case"
        ],
        "correctOptionIndex": 0,
        "explanation": "Hash map lookups are O(1) on average. When multiple keys hash to identical buckets (separate chaining), lookups degrade to O(N) in the worst case.",
        "difficulty": "beginner"
    },
    {
        "id": "swe-dsa-2",
        "roleTrack": "Software Engineer",
        "skill": "Data Structures and Algorithms",
        "category": "DSA",
        "questionText": "In a Binary Search Tree (BST), which tree traversal yields all elements in strictly sorted ascending order?",
        "options": [
            "Pre-order Traversal (Root, Left, Right)",
            "In-order Traversal (Left, Root, Right)",
            "Post-order Traversal (Left, Right, Root)",
            "Level-order Traversal (BFS with Queue)"
        ],
        "correctOptionIndex": 1,
        "explanation": "An In-order traversal visits the left subtree (lesser keys), the current node, and then the right subtree (greater keys), naturally returning nodes in ascending order.",
        "difficulty": "beginner"
    },
    {
        "id": "swe-dsa-3",
        "roleTrack": "Software Engineer",
        "skill": "Data Structures and Algorithms",
        "category": "DSA",
        "questionText": "Which algorithmic technique is most optimal for finding a pair of numbers in a sorted array that sum to a specific target in O(N) time and O(1) extra space?",
        "options": [
            "Two Pointers (Left pointer at start, Right pointer at end)",
            "Nested loops comparing each pair (Brute Force)",
            "Binary Search on every element",
            "Hash Set storing visited complements"
        ],
        "correctOptionIndex": 0,
        "explanation": "With a sorted array, the Two Pointers pattern checks sum = arr[left] + arr[right], advancing left if sum < target or decrementing right if sum > target in O(N) time and O(1) auxiliary space.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-dsa-4",
        "roleTrack": "Software Engineer",
        "skill": "Data Structures and Algorithms",
        "category": "DSA",
        "questionText": "What distinguishes Dynamic Programming from standard Divide and Conquer algorithms?",
        "options": [
            "Dynamic Programming requires trees, whereas Divide and Conquer uses arrays.",
            "Dynamic Programming optimizes overlapping subproblems by caching (memoization/tabulation), whereas Divide and Conquer solves independent subproblems.",
            "Dynamic Programming runs exclusively in O(1) space.",
            "Divide and Conquer is strictly iterative, while Dynamic Programming is strictly recursive."
        ],
        "correctOptionIndex": 1,
        "explanation": "Dynamic Programming is specifically applied when a problem has optimal substructure AND overlapping subproblems, saving redundant recomputations through memoization or a table.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-dsa-5",
        "roleTrack": "Software Engineer",
        "skill": "Data Structures and Algorithms",
        "category": "DSA",
        "questionText": "In Floyd's Cycle Detection Algorithm (Tortoise and Hare) for linked lists, what is the space complexity?",
        "options": [
            "O(N) auxiliary space",
            "O(log N) auxiliary space",
            "O(1) auxiliary space",
            "O(N^2) auxiliary space"
        ],
        "correctOptionIndex": 2,
        "explanation": "Floyd's algorithm uses two pointers moving at different speeds (slow moves 1 step, fast moves 2 steps), detecting a cycle in O(N) time using O(1) constant memory without modifying the list.",
        "difficulty": "beginner"
    },

    # =========================================================================
    # 2. SOFTWARE ENGINEER: OPERATING SYSTEMS & CONCURRENCY (swe-os)
    # =========================================================================
    {
        "id": "swe-os-1",
        "roleTrack": "Software Engineer",
        "skill": "Operating Systems and Concurrency",
        "category": "CS Fundamentals",
        "questionText": "Which condition is NOT one of Coffman's four necessary conditions for deadlock in an Operating System?",
        "options": [
            "Mutual Exclusion",
            "Hold and Wait",
            "Preemption Allowed",
            "Circular Wait"
        ],
        "correctOptionIndex": 2,
        "explanation": "The deadlock condition is 'No Preemption' (resources cannot be forcibly taken). If preemption is allowed, deadlocks can be systematically prevented or broken.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-os-2",
        "roleTrack": "Software Engineer",
        "skill": "Operating Systems and Concurrency",
        "category": "CS Fundamentals",
        "questionText": "What memory resource is uniquely private to each individual thread within a multi-threaded process?",
        "options": [
            "The Heap",
            "The Call Stack and CPU Registers",
            "Global static variables",
            "Open file descriptors"
        ],
        "correctOptionIndex": 1,
        "explanation": "Threads in the same process share the heap, data segments, code, and file descriptors, but each thread maintains its own private execution stack, program counter, and CPU register set.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-os-3",
        "roleTrack": "Software Engineer",
        "skill": "Operating Systems and Concurrency",
        "category": "CS Fundamentals",
        "questionText": "What is the primary difference between a Mutex and a Counting Semaphore in concurrent programming?",
        "options": [
            "A Mutex can be unlocked by any process, whereas a Semaphore can only be unlocked by the thread that locked it.",
            "A Mutex is a binary lock with ownership (only the lock holder can release it); a Semaphore is a signaling mechanism maintaining a counter for resource units.",
            "A Mutex runs in user space, while a Semaphore requires hardware support.",
            "A Semaphore does not protect against race conditions."
        ],
        "correctOptionIndex": 1,
        "explanation": "A Mutex enforces mutual exclusion with strict thread ownership semantics. A Semaphore is an integer counter signaling resource availability, which any thread can increment (post) or decrement (wait).",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-os-4",
        "roleTrack": "Software Engineer",
        "skill": "Operating Systems and Concurrency",
        "category": "CS Fundamentals",
        "questionText": "What event occurs when a process attempts to access a virtual memory address whose page table entry is marked as not present in physical RAM?",
        "options": [
            "Segmentation Fault terminating the process immediately",
            "Page Fault interrupt triggering the OS to fetch the page from swap disk",
            "Deadlock lockup requiring a system reboot",
            "Cache Invalidation error"
        ],
        "correctOptionIndex": 1,
        "explanation": "A Page Fault is a hardware trap raised by the MMU when a requested virtual page is not currently in RAM. The OS loads the page from secondary storage, updates the page table, and resumes execution.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-os-5",
        "roleTrack": "Software Engineer",
        "skill": "Operating Systems and Concurrency",
        "category": "CS Fundamentals",
        "questionText": "Why is excessive context switching between processes detrimental to system throughput?",
        "options": [
            "It clears all RAM contents automatically.",
            "It incurs CPU overhead saving/restoring register states and causes CPU L1/L2 cache and TLB invalidations.",
            "It permanently corrupts thread stack frames.",
            "It forces disk defragmentation."
        ],
        "correctOptionIndex": 1,
        "explanation": "Context switching requires saving process registers and PCB state, switching page tables, and invalidates the Translation Lookaside Buffer (TLB) and CPU caches, consuming CPU cycles without progressing user code.",
        "difficulty": "advanced"
    },

    # =========================================================================
    # 3. SOFTWARE ENGINEER: DBMS & QUERY OPTIMIZATION (swe-dbms)
    # =========================================================================
    {
        "id": "swe-dbms-1",
        "roleTrack": "Software Engineer",
        "skill": "Database Management Systems",
        "category": "DBMS",
        "questionText": "Which database transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads under the ANSI SQL standard?",
        "options": [
            "Read Uncommitted",
            "Read Committed",
            "Repeatable Read",
            "Serializable"
        ],
        "correctOptionIndex": 2,
        "explanation": "Repeatable Read locks existing rows read during a transaction to prevent non-repeatable updates, but new rows inserted by concurrent transactions matching a search range can still cause Phantom Reads (unless next-key locking is used).",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-dbms-2",
        "roleTrack": "Software Engineer",
        "skill": "Database Management Systems",
        "category": "DBMS",
        "questionText": "Why do relational databases predominantly use B+ Trees rather than standard Binary Search Trees or Hash Indexes for column indexing?",
        "options": [
            "B+ Trees use less memory than hash tables.",
            "B+ Trees maintain high fanout minimizing disk I/O, and linked leaf nodes enable highly efficient range queries (e.g. BETWEEN, >, <).",
            "B+ Trees guarantee O(1) worst-case point lookups.",
            "B+ Trees do not require write locks during inserts."
        ],
        "correctOptionIndex": 1,
        "explanation": "B+ Trees have wide fanout (hundreds of keys per block), keeping the tree shallow (3-4 disk accesses). Since all data resides in sorted leaves connected by pointers, range scans are extremely fast.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-dbms-3",
        "roleTrack": "Software Engineer",
        "skill": "Database Management Systems",
        "category": "DBMS",
        "questionText": "What requirement must a relational table satisfy to be classified in Third Normal Form (3NF)?",
        "options": [
            "It must be in 2NF and have no transitive dependencies of non-key attributes on the primary key.",
            "It must have no foreign keys referencing other tables.",
            "It must contain JSON document columns.",
            "All columns must have unique indexes."
        ],
        "correctOptionIndex": 0,
        "explanation": "3NF requires the table to be in 2NF (no partial key dependencies) AND ensure that non-prime attributes depend ONLY on the candidate key, eliminating transitive functional dependencies (X -> Y -> Z).",
        "difficulty": "beginner"
    },
    {
        "id": "swe-dbms-4",
        "roleTrack": "Software Engineer",
        "skill": "Database Management Systems",
        "category": "DBMS",
        "questionText": "What does an 'Index Scan' vs 'Sequential Scan' (Seq Scan) in an SQL query execution plan indicate?",
        "options": [
            "Sequential Scan is always faster because it reads data sequentially in hardware.",
            "An Index Scan traverses an index structure to locate matching rows, whereas a Sequential Scan reads every single block of the table from start to finish.",
            "Sequential Scan uses a distributed cluster.",
            "Index Scan writes data, while Sequential Scan only reads."
        ],
        "correctOptionIndex": 1,
        "explanation": "Index Scan uses an index to locate qualifying rows selectively. Sequential Scan iterates across the entire table blocks, which is slow for large datasets unless a high percentage of rows match.",
        "difficulty": "intermediate"
    },

    # =========================================================================
    # 4. SOFTWARE ENGINEER: SYSTEM DESIGN & REST APIS (swe-sd)
    # =========================================================================
    {
        "id": "swe-sd-1",
        "roleTrack": "Software Engineer",
        "skill": "System Design & REST APIs",
        "category": "System Design",
        "questionText": "In distributed caching, which strategy involves writing data synchronously to both the cache and database simultaneously before acknowledging success to the client?",
        "options": [
            "Write-Through Cache",
            "Write-Around Cache",
            "Write-Back (Write-Behind) Cache",
            "Cache-Aside (Lazy Loading)"
        ],
        "correctOptionIndex": 0,
        "explanation": "Write-through caching writes synchronously to both the cache and persistent storage before returning success, ensuring strong cache consistency at the expense of higher write latency.",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-sd-2",
        "roleTrack": "Software Engineer",
        "skill": "System Design & REST APIs",
        "category": "System Design",
        "questionText": "Which HTTP method is required by the REST specification to be idempotent?",
        "options": [
            "POST",
            "PUT",
            "PATCH (non-conditional)",
            "CONNECT"
        ],
        "correctOptionIndex": 1,
        "explanation": "PUT is idempotent: executing it multiple times with the same payload results in the exact same server resource state as executing it once.",
        "difficulty": "beginner"
    },
    {
        "id": "swe-sd-3",
        "roleTrack": "Software Engineer",
        "skill": "System Design & REST APIs",
        "category": "System Design",
        "questionText": "According to the CAP Theorem, in the inevitable event of a network partition (P) between distributed data nodes, what trade-off must a system architect make?",
        "options": [
            "Choose between Performance (P) and Durability (D)",
            "Choose between Consistency (C) (returning error rather than stale data) or Availability (A) (returning non-error responses with potentially stale data)",
            "Choose between SQL and NoSQL databases",
            "Choose between Encryption and Compression"
        ],
        "correctOptionIndex": 1,
        "explanation": "Since network partitions are inevitable in real-world distributed networks, a system must decide whether to forfeit Availability (wait/error until partition heals) or forfeit Consistency (serve stale data locally).",
        "difficulty": "intermediate"
    },
    {
        "id": "swe-sd-4",
        "roleTrack": "Software Engineer",
        "skill": "System Design & REST APIs",
        "category": "System Design",
        "questionText": "Which rate-limiting algorithm allows for temporary bursts of traffic up to a predefined limit while refilling access capacity at a constant steady rate?",
        "options": [
            "Token Bucket Algorithm",
            "Fixed Window Counter",
            "Single-threaded FIFO Queue",
            "Consistent Hashing"
        ],
        "correctOptionIndex": 0,
        "explanation": "The Token Bucket algorithm adds tokens to a bucket at a constant rate up to bucket capacity. Incoming requests consume a token, allowing bursts up to bucket capacity while enforcing long-term average rate limits.",
        "difficulty": "intermediate"
    },

    # =========================================================================
    # 5. BUSINESS ANALYST: SQL QUERYING & JOINS (ba-sql)
    # =========================================================================
    {
        "id": "ba-sql-1",
        "roleTrack": "Business Analyst",
        "skill": "SQL",
        "category": "Data and Analytics",
        "questionText": "Which SQL clause is used to filter aggregated metrics generated by a GROUP BY query?",
        "options": [
            "WHERE",
            "HAVING",
            "QUALIFY",
            "FILTER"
        ],
        "correctOptionIndex": 1,
        "explanation": "WHERE filters raw individual records before grouping occurs. HAVING filters aggregated metrics (e.g. HAVING COUNT(*) > 5 or HAVING SUM(revenue) >= 10000) after grouping.",
        "difficulty": "beginner"
    },
    {
        "id": "ba-sql-2",
        "roleTrack": "Business Analyst",
        "skill": "SQL",
        "category": "Data and Analytics",
        "questionText": "In a LEFT JOIN between a Customers table (left) and an Orders table (right), what appears for customers who have never placed an order?",
        "options": [
            "Those customer rows are excluded completely.",
            "Customer columns appear with NULL values populated for all Orders table columns.",
            "An SQL runtime error is thrown.",
            "Order columns are automatically filled with numeric 0."
        ],
        "correctOptionIndex": 1,
        "explanation": "A LEFT JOIN preserves every row from the left table. When no matching record exists in the right table, all columns from the right table evaluate to NULL.",
        "difficulty": "beginner"
    },
    {
        "id": "ba-sql-3",
        "roleTrack": "Business Analyst",
        "skill": "SQL",
        "category": "Data and Analytics",
        "questionText": "What is the key functional difference between RANK() and DENSE_RANK() window functions when ranking sales reps with tied revenue?",
        "options": [
            "RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() does not skip rank numbers (e.g. 1, 2, 2, 3).",
            "DENSE_RANK() only works on integer values.",
            "RANK() assigns ties alphabetical ordering.",
            "DENSE_RANK() requires a WHERE clause."
        ],
        "correctOptionIndex": 0,
        "explanation": "RANK() leaves gaps in the sequence following ties (1, 2, 2, 4), whereas DENSE_RANK() produces consecutive rankings without gaps (1, 2, 2, 3).",
        "difficulty": "intermediate"
    },
    {
        "id": "ba-sql-4",
        "roleTrack": "Business Analyst",
        "skill": "SQL",
        "category": "Data and Analytics",
        "questionText": "What is the difference between COUNT(*) and COUNT(column_name) in an SQL aggregation query?",
        "options": [
            "COUNT(*) counts all rows including NULLs; COUNT(column_name) counts only rows where column_name is NOT NULL.",
            "COUNT(*) only counts primary keys.",
            "COUNT(column_name) counts distinct values automatically.",
            "They are 100% identical in all SQL engines."
        ],
        "correctOptionIndex": 0,
        "explanation": "COUNT(*) counts the total row count of the group regardless of contents. COUNT(column_name) ignores NULL entries in that specific column.",
        "difficulty": "beginner"
    },

    # =========================================================================
    # 6. BUSINESS ANALYST: REQUIREMENTS GATHERING & BPMN (ba-req)
    # =========================================================================
    {
        "id": "ba-req-1",
        "roleTrack": "Business Analyst",
        "skill": "Requirements Gathering",
        "category": "Business Analysis",
        "questionText": "What is the industry-standard structure for writing an effective Agile User Story?",
        "options": [
            "As a [Persona/Role], I want [Feature/Action], so that [Business Benefit/Value].",
            "Given [Precondition], When [Trigger], Then [Expected Result].",
            "Define [System], Build [Component], Ship [Release].",
            "Identify [Problem], Calculate [Cost], Deliver [Solution]."
        ],
        "correctOptionIndex": 0,
        "explanation": "'As a [user role], I want [action], so that [business value]' clearly aligns user motivation with measurable business justification.",
        "difficulty": "beginner"
    },
    {
        "id": "ba-req-2",
        "roleTrack": "Business Analyst",
        "skill": "Requirements Gathering",
        "category": "Business Analysis",
        "questionText": "In Business Process Model and Notation (BPMN 2.0), what does an Exclusive Gateway (diamond marked with an 'X') signify?",
        "options": [
            "All outbound process paths must be executed simultaneously in parallel.",
            "Exactly one outbound path is chosen based on evaluating conditional decision logic.",
            "The workflow halts and triggers an exception event.",
            "A human approval task is required."
        ],
        "correctOptionIndex": 1,
        "explanation": "An Exclusive (XOR) Gateway routes flow to exactly one mutually exclusive branch based on data conditions evaluated at that point.",
        "difficulty": "intermediate"
    },
    {
        "id": "ba-req-3",
        "roleTrack": "Business Analyst",
        "skill": "Requirements Gathering",
        "category": "Business Analysis",
        "questionText": "Which statement describes a Non-Functional Requirement (NFR) rather than a Functional Requirement?",
        "options": [
            "The system must allow customers to reset passwords via email verification.",
            "The checkout payment API must respond within 500ms under 10,000 concurrent user requests.",
            "The user should be able to filter search results by price.",
            "The dashboard must display a bar chart of quarterly revenue."
        ],
        "correctOptionIndex": 1,
        "explanation": "Functional requirements define what features the software does. Non-functional requirements (NFRs) specify performance, security, scalability, and quality constraints.",
        "difficulty": "beginner"
    },

    # =========================================================================
    # 7. BUSINESS ANALYST: KPI REPORTING & DASHBOARDS (ba-kpi)
    # =========================================================================
    {
        "id": "ba-kpi-1",
        "roleTrack": "Business Analyst",
        "skill": "KPI Reporting & Dashboards",
        "category": "Reporting",
        "questionText": "In Power BI and data warehouse modeling, why is a Star Schema strongly favored over a normalized Snowflake schema for analytical reporting?",
        "options": [
            "Star schemas require zero primary keys.",
            "Star schemas feature simple relationships with fewer JOINs, enabling faster columnar aggregation and intuitive DAX calculations.",
            "Star schemas eliminate fact tables.",
            "Snowflake schemas are only supported by Oracle."
        ],
        "correctOptionIndex": 1,
        "explanation": "Star schemas surround a central fact table with denormalized dimension tables. BI columnar engines (like Power BI VertiPaq) optimize queries on star schemas with superior speed and simpler DAX logic.",
        "difficulty": "intermediate"
    },
    {
        "id": "ba-kpi-2",
        "roleTrack": "Business Analyst",
        "skill": "KPI Reporting & Dashboards",
        "category": "Reporting",
        "questionText": "Why is the modern XLOOKUP function preferred over legacy VLOOKUP in business analysis spreadsheets?",
        "options": [
            "XLOOKUP only looks up numbers, avoiding text mismatches.",
            "XLOOKUP defaults to exact match and can search left of the return column without column indexing errors.",
            "XLOOKUP automatically calculates linear regressions.",
            "XLOOKUP does not require formula syntax."
        ],
        "correctOptionIndex": 1,
        "explanation": "XLOOKUP defaults to exact matching (unlike VLOOKUP's TRUE default) and decouples lookup and return arrays, permitting leftward lookups without fragile column index counts.",
        "difficulty": "beginner"
    },
    {
        "id": "ba-kpi-3",
        "roleTrack": "Business Analyst",
        "skill": "KPI Reporting & Dashboards",
        "category": "Reporting",
        "questionText": "In business analytics, what distinguishes a 'Leading Indicator' from a 'Lagging Indicator'?",
        "options": [
            "Leading indicators are strictly financial; lagging indicators are non-financial.",
            "Leading indicators measure predictive activities that forecast future outcomes (e.g. trial signups); lagging indicators measure past results (e.g. quarterly churn).",
            "Lagging indicators are tracked daily, while leading indicators are tracked yearly.",
            "Leading indicators cannot be quantified."
        ],
        "correctOptionIndex": 1,
        "explanation": "Leading indicators track inputs and user behaviors that predict future performance, enabling proactive intervention. Lagging indicators confirm historical outcomes after events have concluded.",
        "difficulty": "beginner"
    },

    # =========================================================================
    # 8. BUSINESS ANALYST: AGILE & SCRUM (ba-agile)
    # =========================================================================
    {
        "id": "ba-agile-1",
        "roleTrack": "Business Analyst",
        "skill": "Agile and Scrum",
        "category": "Agile Delivery",
        "questionText": "What is the primary difference between a Sprint Review and a Sprint Retrospective in Scrum?",
        "options": [
            "Sprint Review inspects the product increment with stakeholders; Sprint Retrospective inspects team processes, tools, and relationships to improve how the team works.",
            "Sprint Review is for developers only; Sprint Retrospective is for executives.",
            "Sprint Retrospective happens at the start of a sprint; Sprint Review happens at the end.",
            "There is no difference; they are interchangeable terms."
        ],
        "correctOptionIndex": 0,
        "explanation": "The Sprint Review inspects the working product increment and adapts the Product Backlog with stakeholders. The Retrospective focuses internally on team dynamics, processes, and continuous improvement.",
        "difficulty": "beginner"
    },
    {
        "id": "ba-agile-2",
        "roleTrack": "Business Analyst",
        "skill": "Agile and Scrum",
        "category": "Agile Delivery",
        "questionText": "What is the distinction between 'Acceptance Criteria' and the 'Definition of Done' (DoD)?",
        "options": [
            "Acceptance Criteria apply uniquely to an individual user story; Definition of Done is a universal quality standard applying across all backlog items in the sprint.",
            "Definition of Done is written by the QA tester; Acceptance Criteria are written by the CEO.",
            "Acceptance Criteria are only checked in waterfall methodology.",
            "Definition of Done only applies to UI styling."
        ],
        "correctOptionIndex": 0,
        "explanation": "Acceptance Criteria define the specific functional conditions for a single user story to pass. The Definition of Done (DoD) is the shared quality checklist (testing, code review, docs) that every item must meet before release.",
        "difficulty": "intermediate"
    }
]


class AssessmentAnalyzerService:
    def get_questions_for_role(self, role_track: str, skill_or_category: Optional[str] = None) -> List[AssessmentQuestion]:
        is_swe = "software" in role_track.lower()
        target_role = "Software Engineer" if is_swe else "Business Analyst"

        role_questions = [q for q in DIAGNOSTIC_BANK if q["roleTrack"] == target_role]

        if not skill_or_category:
            return [AssessmentQuestion(**q) for q in role_questions[:5]]

        term = skill_or_category.lower().strip()

        # Map query term to target prefix/skills
        target_prefix = None
        if is_swe:
            if any(k in term for k in ["data structure", "algorithm", "dsa", "array", "tree", "pointer"]):
                target_prefix = "swe-dsa-"
            elif any(k in term for k in ["operating system", "concurrency", "thread", "process", "memory", "deadlock"]):
                target_prefix = "swe-os-"
            elif any(k in term for k in ["database", "dbms", "query", "index", "sql", "acid", "normalization"]):
                target_prefix = "swe-dbms-"
            elif any(k in term for k in ["system design", "rest", "api", "microservice", "cache", "scaling"]):
                target_prefix = "swe-sd-"
        else:
            if "sql" in term or "query" in term or "join" in term:
                target_prefix = "ba-sql-"
            elif any(k in term for k in ["requirement", "bpmn", "story", "specification", "elicitation"]):
                target_prefix = "ba-req-"
            elif any(k in term for k in ["kpi", "dashboard", "bi", "report", "power bi", "excel", "analytics"]):
                target_prefix = "ba-kpi-"
            elif any(k in term for k in ["agile", "scrum", "sprint", "retrospective", "ceremony"]):
                target_prefix = "ba-agile-"

        if target_prefix:
            filtered = [q for q in role_questions if q["id"].startswith(target_prefix)]
            if filtered:
                return [AssessmentQuestion(**q) for q in filtered]

        # General fallback filter by skill or category name
        fallback_filtered = [
            q for q in role_questions
            if term in q["skill"].lower() or term in q["category"].lower() or q["skill"].lower() in term
        ]
        if fallback_filtered:
            return [AssessmentQuestion(**q) for q in fallback_filtered]

        # Return initial slice if no specific filter match
        return [AssessmentQuestion(**q) for q in role_questions[:5]]

    def evaluate_submission(self, submission: AssessmentSubmission) -> AssessmentResult:
        questions = self.get_questions_for_role(submission.roleTrack, submission.skill)
        q_map = {q.id: q for q in questions}

        total = len(submission.answers)
        correct = 0

        for q_id, selected_idx in submission.answers.items():
            q = q_map.get(q_id)
            if not q:
                # Search entire diagnostic bank if not in current subset
                q_bank_item = next((item for item in DIAGNOSTIC_BANK if item["id"] == q_id), None)
                if q_bank_item and q_bank_item["correctOptionIndex"] == selected_idx:
                    correct += 1
            elif q.correctOptionIndex == selected_idx:
                correct += 1

        score_pct = round((correct / max(1, total)) * 100.0, 1)
        passed = score_pct >= 70.0

        if passed:
            feedback = f"Great performance! You demonstrated solid competency in {submission.skill} ({correct}/{total} correct)."
            mastery_gain = 25.0
            rec = "Progress to intermediate problem-solving and portfolio implementation."
        else:
            feedback = f"Identified foundational gaps in {submission.skill} ({correct}/{total} correct). Recommended targeted conceptual review."
            mastery_gain = 10.0
            rec = "Review foundational syntax and worked examples before re-attempting."

        return AssessmentResult(
            userId=submission.userId,
            roleTrack=submission.roleTrack,
            skill=submission.skill,
            totalQuestions=total,
            correctAnswers=correct,
            scorePercentage=score_pct,
            passed=passed,
            feedback=feedback,
            updatedMasteryGain=mastery_gain,
            recommendation=rec
        )


assessment_analyzer = AssessmentAnalyzerService()
