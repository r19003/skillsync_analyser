import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..schemas.roadmap import DailyTaskSchema, WeekSchema, PhaseSchema, RoadmapResponse, RoadmapGenerateRequest
from ..models.prerequisites import get_topological_skill_order, get_unmet_prerequisites
from .resource_ranker import resource_ranker

PHASE_DEFINITIONS = [
    {
        "phaseIndex": 0,
        "name": "Foundation",
        "description": "Master core syntax, fundamental data structures, and foundational principles.",
        "stage": "learn"
    },
    {
        "phaseIndex": 1,
        "name": "Practice",
        "description": "Build fluency and problem-solving speed through structured algorithmic patterns.",
        "stage": "practice"
    },
    {
        "phaseIndex": 2,
        "name": "Application",
        "description": "Synthesize multiple concepts into tangible portfolio deliverables and mini-projects.",
        "stage": "prove"
    },
    {
        "phaseIndex": 3,
        "name": "Interview Preparation",
        "description": "Timed coding challenges, complexity defense, and diagnostic mock interviews.",
        "stage": "practice"
    },
    {
        "phaseIndex": 4,
        "name": "Validation",
        "description": "Final end-to-end technical assessment, resume bullet polish, and portfolio verification.",
        "stage": "prove"
    }
]

class RoadmapSchedulerService:
    def generate_adaptive_roadmap(self, req: RoadmapGenerateRequest) -> RoadmapResponse:
        role_track = req.targetRole
        is_swe = "software" in role_track.lower()
        
        # 1. Determine topological skill priority
        all_ordered_skills = get_topological_skill_order(role_track)
        skipped = set(s.lower() for s in req.skippedSkills)

        # Filter out skills already mastered (>= 80) or skipped by user
        skills_to_learn = []
        for s in all_ordered_skills:
            if s.lower() in skipped:
                continue
            mastery = req.skillMastery.get(s, 0.0)
            if mastery < 80.0:
                skills_to_learn.append(s)

        if not skills_to_learn:
            # Fallback to key competencies
            skills_to_learn = (
                ["Arrays and Strings", "Trees", "Dynamic Programming", "SQL", "System Design"]
                if is_swe else
                ["Microsoft Excel", "SQL", "Power BI", "Requirements Gathering", "User Stories"]
            )

        # 2. Plan weeks based on targetWeeks (default 6, min 4, max 12)
        total_weeks = max(4, min(12, req.targetWeeks))
        weekly_hours = req.weeklyHours
        session_mins = req.sessionDurationMinutes
        days_per_week = len(req.availableDays) or 5
        tasks_per_week = max(3, min(7, int((weekly_hours * 60) / max(30, session_mins))))

        # Distribute weeks across 5 phases
        phase_count = 5
        weeks_per_phase = max(1, total_weeks // phase_count)
        
        phases: List[PhaseSchema] = []
        weeks: List[WeekSchema] = []

        current_skill_idx = 0
        now = datetime.now()

        for p_idx, p_def in enumerate(PHASE_DEFINITIONS):
            phase_week_nums = []
            
            # Allocate week numbers for this phase
            if p_idx == phase_count - 1:
                # Last phase takes remainder weeks
                assigned_weeks = list(range(len(weeks) + 1, total_weeks + 1))
            else:
                assigned_weeks = list(range(len(weeks) + 1, len(weeks) + 1 + weeks_per_phase))

            for w_num in assigned_weeks:
                phase_week_nums.append(w_num)
                is_current = (w_num == 1)
                
                # Pick 1 or 2 focus skills for this week
                focus_skill = skills_to_learn[current_skill_idx % len(skills_to_learn)]
                secondary_skill = skills_to_learn[(current_skill_idx + 1) % len(skills_to_learn)]
                
                # Advance skill pointer every week or two
                if w_num % 2 == 0:
                    current_skill_idx += 1

                # Generate daily tasks for this week
                week_tasks: List[DailyTaskSchema] = []
                planned_mins = 0

                triplet = resource_ranker.recommend_for_skill(
                    skill=focus_skill,
                    target_role=role_track,
                    current_mastery=req.skillMastery.get(focus_skill, 20.0),
                    preferred_styles=req.preferredStyles,
                    budget=req.budget,
                    preferred_lang=req.preferredLanguage
                )

                stage_res = triplet.learn if p_def["stage"] == "learn" else (triplet.practice if p_def["stage"] == "practice" else triplet.prove)
                if not stage_res:
                    stage_res = triplet.learn or triplet.practice or triplet.prove

                for day_i in range(1, tasks_per_week + 1):
                    task_date = now + timedelta(weeks=w_num - 1, days=day_i - 1)
                    t_type = "learn" if day_i == 1 else ("practice" if day_i < tasks_per_week else "prove")
                    
                    if t_type == "learn":
                        title = f"{focus_skill}: Core Foundations"
                        purpose = f"Frequently tested in {role_track} interviews and a current priority gap."
                        instruction = f"Review the fundamental concepts of {focus_skill} and note down key patterns."
                        res = triplet.learn or stage_res
                    elif t_type == "practice":
                        title = f"{focus_skill}: Guided Exercises (Day {day_i})"
                        purpose = "Build execution speed and pattern recognition under typical constraints."
                        instruction = f"Solve 1 to 2 targeted problems focusing on clean code and edge cases."
                        res = triplet.practice or stage_res
                    else:
                        title = f"{focus_skill}: Milestone Verification"
                        purpose = "Produce verifiable proof of competence for your portfolio and resume."
                        instruction = f"Document your implementation approach or mini-case study for {focus_skill}."
                        res = triplet.prove or stage_res

                    d_task = DailyTaskSchema(
                        taskId=f"w{w_num}_d{day_i}_{focus_skill[:4].lower()}",
                        weekNumber=w_num,
                        dayNumber=day_i,
                        skill=focus_skill,
                        title=title,
                        whyThisMatters=purpose,
                        taskInstruction=instruction,
                        durationMinutes=session_mins,
                        type=t_type,
                        difficulty="beginner" if p_idx == 0 else ("intermediate" if p_idx <= 2 else "advanced"),
                        resourceId=res.resourceId if res else None,
                        resourceDetails={
                            "title": res.title if res else f"{focus_skill} Standard Guide",
                            "url": res.url if res else "https://skillsync.dev",
                            "provider": res.provider if res else "SkillSync",
                            "resourceType": res.resourceType if res else "guide",
                            "selectionReason": res.selectionReason if res else "Curated for current mastery."
                        } if res else None,
                        status="pending"
                    )
                    week_tasks.append(d_task)
                    planned_mins += session_mins

                week_hours = round(planned_mins / 60.0, 1)

                week_obj = WeekSchema(
                    weekNumber=w_num,
                    phase=p_def["name"],
                    title=f"{focus_skill} {'& ' + secondary_skill if focus_skill != secondary_skill and w_num % 2 == 0 else 'Mastery'}",
                    mainObjective=f"Build fluency in {focus_skill} through structured daily practice and review.",
                    expectedOutcome=f"Confidently solve {focus_skill} questions and demonstrate clean implementation.",
                    plannedHours=week_hours,
                    completedHours=0.0,
                    taskCount=len(week_tasks),
                    completedTaskCount=0,
                    isExpanded=is_current,  # Only week 1 is expanded initially!
                    status="current" if is_current else "upcoming",
                    tasks=week_tasks
                )
                weeks.append(week_obj)

            phase_schema = PhaseSchema(
                phaseIndex=p_idx,
                name=p_def["name"],
                description=p_def["description"],
                weekNumbers=phase_week_nums,
                status="in_progress" if 1 in phase_week_nums else "upcoming"
            )
            phases.append(phase_schema)

        return RoadmapResponse(
            userId=req.userId,
            targetRole=role_track,
            totalWeeks=total_weeks,
            weeklyHours=weekly_hours,
            phases=phases,
            weeks=weeks,
            assumptions={
                "sessionDurationMinutes": session_mins,
                "weeklyPlannedHours": weekly_hours,
                "intensity": req.timelineIntensity,
                "availableDaysCount": days_per_week,
                "tasksPerWeek": tasks_per_week,
                "prerequisiteEnforced": True
            }
        )

roadmap_scheduler = RoadmapSchedulerService()
