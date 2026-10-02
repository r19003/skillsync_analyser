import json
import os
from typing import List, Dict, Optional, Any
from ..schemas.resource import ResourceItem, SkillResourceTriplet, ResourceRecommendRequest, ResourceRecommendResponse
from ..config import settings
from ..models.prerequisites import get_unmet_prerequisites

STAGE_TYPE_MAPPING = {
    "documentation": "learn",
    "official-documentation": "learn",
    "interactive-tutorial": "learn",
    "course": "learn",
    "interactive-course": "learn",
    "university-course": "learn",
    "roadmap": "learn",
    "professional-standard": "learn",
    "article-collection": "learn",
    "practice-problem": "practice",
    "practice-set": "practice",
    "official-guide": "practice",
    "official-learning-path": "practice",
    "portfolio-project": "prove",
    "dataset": "prove",
    "dataset-catalog": "prove",
    "community-gallery": "prove",
    "open-source-guide": "prove",
    "pattern-catalog": "prove",
    "official-book": "prove"
}

class ResourceRankerService:
    def __init__(self):
        self._resources: List[Dict[str, Any]] = []
        self._load_resources()

    def _load_resources(self):
        filePath = settings.learning_resources_file
        if not os.path.exists(filePath):
            # Try alternate fallback paths
            altPaths = [
                os.path.join(os.getcwd(), "skillsync_learning_resources.json"),
                os.path.join(os.getcwd(), "server", "data", "skillsync_learning_resources.json"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "skillsync_learning_resources.json")
            ]
            for p in altPaths:
                if os.path.exists(p):
                    filePath = p
                    break

        if os.path.exists(filePath):
            with open(filePath, "r", encoding="utf-8") as f:
                self._resources = json.load(f)
        else:
            self._resources = []

    def get_all_resources(self) -> List[Dict[str, Any]]:
        return self._resources

    def score_resource(
        self,
        res: Dict[str, Any],
        target_role: str,
        target_skill: str,
        current_mastery: float,
        preferred_styles: List[str],
        budget: str,
        preferred_lang: Optional[str],
        disliked_ids: List[str]
    ) -> float:
        if res.get("resourceId") in disliked_ids:
            return -100.0

        score = float(res.get("qualityScore", 80))

        # 1. Skill Exact Match vs Substring Match
        res_skill = res.get("skill", "").lower()
        t_skill = target_skill.lower()
        if res_skill == t_skill:
            score += 40.0
        elif t_skill in res_skill or res_skill in t_skill:
            score += 25.0
        elif any(t_skill in tag.lower() for tag in res.get("tags", [])):
            score += 15.0
        else:
            return 0.0  # Not relevant to this skill

        # 2. Role Track match
        role_slug = "software-engineer" if "software" in target_role.lower() else "business-analyst"
        if role_slug in res.get("roleTracks", []):
            score += 15.0

        # 3. Budget Filter
        cost = res.get("costType", "free").lower()
        if budget == "Free only" and "paid" in cost and "free" not in cost:
            return -50.0  # Exclude strictly paid when user wants free

        # 4. Difficulty Alignment with current mastery
        diff = res.get("difficulty", "beginner").lower()
        if current_mastery < 40:
            if diff == "beginner":
                score += 20.0
            elif diff == "intermediate":
                score += 5.0
            else:
                score -= 25.0  # Never recommend advanced when beginner
        elif current_mastery < 75:
            if diff == "intermediate":
                score += 20.0
            elif diff == "beginner":
                score += 10.0
            else:
                score += 5.0
        else:
            if diff in ["intermediate", "advanced"]:
                score += 20.0

        # 5. Preferred Learning Style Boost
        r_type = res.get("resourceType", "").lower()
        styles_str = " ".join(preferred_styles).lower()
        if "interactive" in styles_str and ("interactive" in r_type or "practice" in r_type):
            score += 15.0
        if "video" in styles_str and ("video" in r_type or "course" in r_type):
            score += 12.0
        if "written" in styles_str and ("documentation" in r_type or "guide" in r_type):
            score += 12.0
        if "project" in styles_str and ("project" in r_type or "dataset" in r_type or "case" in r_type):
            score += 15.0

        # 6. Preferred programming language (e.g. Python vs Java)
        if preferred_lang:
            tags = [t.lower() for t in res.get("tags", [])]
            if preferred_lang.lower() in tags or preferred_lang.lower() in res.get("title", "").lower():
                score += 10.0

        return score

    def recommend_for_skill(
        self,
        skill: str,
        target_role: str,
        current_mastery: float,
        preferred_styles: List[str],
        budget: str = "Free only",
        preferred_lang: Optional[str] = "Python",
        disliked_ids: List[str] = None
    ) -> SkillResourceTriplet:
        disliked = disliked_ids or []
        candidates = []

        for r in self._resources:
            s = self.score_resource(
                res=r,
                target_role=target_role,
                target_skill=skill,
                current_mastery=current_mastery,
                preferred_styles=preferred_styles,
                budget=budget,
                preferred_lang=preferred_lang,
                disliked_ids=disliked
            )
            if s > 30.0:
                stage = STAGE_TYPE_MAPPING.get(r.get("resourceType"), "learn")
                candidates.append((s, stage, r))

        candidates.sort(key=lambda x: x[0], reverse=True)

        best_learn = None
        best_practice = None
        best_prove = None

        for score, stage, r in candidates:
            item = ResourceItem(
                resourceId=r["resourceId"],
                title=r["title"],
                provider=r["provider"],
                url=r["url"],
                roleTracks=r.get("roleTracks", []),
                skill=r.get("skill", skill),
                category=r.get("category", "General"),
                resourceType=r.get("resourceType", "guide"),
                difficulty=r.get("difficulty", "beginner"),
                estimatedMinutes=r.get("estimatedMinutes", 45),
                costType=r.get("costType", "free"),
                handsOn=r.get("handsOn", True),
                qualityScore=r.get("qualityScore", 90),
                description=r.get("description", ""),
                prerequisites=r.get("prerequisites", []),
                tags=r.get("tags", []),
                relevanceScore=round(score, 1),
                selectionReason=f"Selected for your {r.get('difficulty','beginner')} level in {skill} with high hands-on relevance.",
                stageType=stage
            )

            if stage == "learn" and not best_learn:
                best_learn = item
            elif stage == "practice" and not best_practice:
                best_practice = item
            elif stage == "prove" and not best_prove:
                best_prove = item

        # If any slot is empty, fill with top remaining candidate
        for score, stage, r in candidates:
            if not best_learn:
                best_learn = ResourceItem(**r, relevanceScore=round(score, 1), stageType="learn", selectionReason="Recommended foundation reference.")
            elif not best_practice and r["resourceId"] != (best_learn.resourceId if best_learn else ""):
                best_practice = ResourceItem(**r, relevanceScore=round(score, 1), stageType="practice", selectionReason="Recommended practical exercise.")
            elif not best_prove and r["resourceId"] not in [best_learn.resourceId if best_learn else "", best_practice.resourceId if best_practice else ""]:
                best_prove = ResourceItem(**r, relevanceScore=round(score, 1), stageType="prove", selectionReason="Recommended deliverable artifact.")

        explanation = f"Curated personalized triad for {skill}: Learn the core mental model, practice targeted problems, and build proof of competency."

        return SkillResourceTriplet(
            skill=skill,
            currentMastery=round(current_mastery, 1),
            learn=best_learn,
            practice=best_practice,
            prove=best_prove,
            explanation=explanation
        )

    def recommend_all(self, req: ResourceRecommendRequest) -> ResourceRecommendResponse:
        triplets: List[SkillResourceTriplet] = []
        for skill in req.targetSkills:
            mastery = req.currentMastery.get(skill, 20.0)
            triplet = self.recommend_for_skill(
                skill=skill,
                target_role=req.targetRole,
                current_mastery=mastery,
                preferred_styles=req.preferredStyles,
                budget=req.budget,
                preferred_lang=req.preferredLanguage,
                disliked_ids=req.dislikedResourceIds
            )
            triplets.append(triplet)

        return ResourceRecommendResponse(
            userId=req.userId,
            role=req.targetRole,
            triplets=triplets,
            totalResourcesConsidered=len(self._resources)
        )

resource_ranker = ResourceRankerService()
