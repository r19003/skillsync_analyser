from typing import List, Dict, Any
from ..schemas.mastery import SkillMasteryItem

# Role importance lookups (0-100)
SWE_IMPORTANCE: Dict[str, int] = {
    "DSA": 98, "Data Structures and Algorithms": 98, "Arrays and Strings": 95, "Dynamic Programming": 92,
    "Trees": 90, "Graphs": 90, "Binary Search": 88, "Stacks": 85, "Linked Lists": 85, "Two Pointers": 88,
    "Python": 90, "Java": 90, "JavaScript": 88, "OOP": 85, "Object-Oriented Programming": 85,
    "SQL": 86, "DBMS": 88, "Operating Systems": 84, "Computer Networks": 84, "Git": 86,
    "REST APIs": 88, "Backend Development": 88, "System Design": 85, "Docker": 80, "Testing": 80
}

BA_IMPORTANCE: Dict[str, int] = {
    "SQL": 96, "Microsoft Excel": 95, "Power BI": 92, "Tableau": 88, "Requirements Gathering": 94,
    "User Stories": 90, "Agile": 88, "Scrum": 86, "Stakeholder Management": 90, "Data Analysis": 92,
    "BPMN": 82, "Process Modeling": 84, "KPI Development": 85, "UAT": 84, "Statistics": 80
}

class SkillGapRankerService:
    def rank_skill_gaps(
        self,
        role_track: str,
        masteries: List[SkillMasteryItem],
        skipped_skills: List[str] = None
    ) -> Dict[str, Any]:
        skipped = set(s.lower() for s in (skipped_skills or []))
        importance_map = SWE_IMPORTANCE if "software" in role_track.lower() else BA_IMPORTANCE

        critical_gaps = []
        to_strengthen = []
        proven_skills = []
        optional_skills = []

        for m in masteries:
            skill_name = m.skill
            if skill_name.lower() in skipped:
                continue

            importance = importance_map.get(skill_name, 70)
            mastery = m.masteryScore

            # Priority formula: (Importance * 0.5) + ((100 - Mastery) * 0.5)
            gap_size = max(0.0, 100.0 - mastery)
            priority_score = round(0.55 * importance + 0.45 * gap_size, 1)

            gap_item = {
                "skill": skill_name,
                "category": m.category or ("Technical" if "software" in role_track.lower() else "Business Analysis"),
                "masteryScore": mastery,
                "targetMastery": m.targetMastery,
                "importance": importance,
                "priorityScore": priority_score,
                "evidenceScore": m.evidenceScore,
                "assessmentScore": m.assessmentScore,
                "confidenceLevel": m.confidenceLevel,
                "selfRating": m.selfRating,
                "estimatedLearningHours": max(4, int((80.0 - min(80.0, mastery)) * 0.25)),
                "whyItMatters": f"Core competency with an importance rating of {importance}/100 in the {role_track} track.",
                "nextBestAction": f"Complete targeted practice in {skill_name} to lift mastery from {int(mastery)}% to 80%."
            }

            if mastery >= 75:
                proven_skills.append(gap_item)
            elif importance >= 85 and mastery < 45:
                critical_gaps.append(gap_item)
            elif mastery < 70 and importance >= 75:
                to_strengthen.append(gap_item)
            else:
                optional_skills.append(gap_item)

        # Sort each group descending by priorityScore
        critical_gaps.sort(key=lambda x: x["priorityScore"], reverse=True)
        to_strengthen.sort(key=lambda x: x["priorityScore"], reverse=True)
        proven_skills.sort(key=lambda x: x["masteryScore"], reverse=True)
        optional_skills.sort(key=lambda x: x["priorityScore"], reverse=True)

        top_three = (critical_gaps + to_strengthen)[:3]

        return {
            "topThreePriorityGaps": top_three,
            "criticalGaps": critical_gaps,
            "skillsToStrengthen": to_strengthen,
            "provenSkills": proven_skills,
            "optionalSkills": optional_skills,
            "totalCount": len(masteries)
        }

skill_gap_ranker = SkillGapRankerService()
