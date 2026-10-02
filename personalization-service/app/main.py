from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .config import settings
from .schemas.profile import UserProfileSchema, ProfileUpdateRequest
from .schemas.mastery import MasteryCalculateRequest, MasteryResponse
from .schemas.resource import ResourceRecommendRequest, ResourceRecommendResponse, ResourceFeedbackRequest
from .schemas.roadmap import RoadmapGenerateRequest, RoadmapResponse, ReplanWeekRequest
from .schemas.assessment import AssessmentQuizRequest, AssessmentSubmission, AssessmentResult, AssessmentQuestion
from .schemas.events import EventBatchRequest, EventProcessingResult

from .services import (
    user_profile_service,
    mastery_estimator,
    skill_gap_ranker,
    resource_ranker,
    roadmap_scheduler,
    adaptive_replanner,
    assessment_analyzer,
    feedback_processor,
    llm_planner,
    explanation_service
)

app = FastAPI(
    title=settings.service_name,
    version=settings.version,
    description="Adaptive learning, deterministic mastery estimation, and personalized roadmap scheduling for SkillSync."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.version,
        "totalResources": len(resource_ranker.get_all_resources())
    }

# 1. User Profile Endpoints
@app.post("/personalization/profile", response_model=UserProfileSchema)
def save_or_update_profile(profile: UserProfileSchema):
    user_profile_service.set_cached_profile(profile)
    return profile

@app.get("/personalization/profile/{userId}", response_model=UserProfileSchema)
def get_user_profile(userId: str, targetRole: Optional[str] = "Software Engineer"):
    return user_profile_service.get_or_create_profile(userId, targetRole)

# 2. Mastery Estimation Endpoints
@app.post("/personalization/mastery/calculate", response_model=MasteryResponse)
def calculate_mastery(req: MasteryCalculateRequest):
    return mastery_estimator.calculate_all_masteries(req)

@app.get("/personalization/mastery/{userId}")
def get_user_mastery_overview(userId: str, targetRole: Optional[str] = "Software Engineer"):
    profile = user_profile_service.get_or_create_profile(userId, targetRole)
    # Default baseline estimation
    dummy_req = MasteryCalculateRequest(
        userId=userId,
        targetRole=targetRole,
        skillsConfidence=profile.skillConfidence or {}
    )
    return mastery_estimator.calculate_all_masteries(dummy_req)

# 3. Skill Gap Ranking Endpoint
@app.post("/personalization/skills/rank")
def rank_skills(payload: Dict[str, Any]):
    role_track = payload.get("targetRole", "Software Engineer")
    skills_data = payload.get("skills", [])
    skipped = payload.get("skippedSkills", [])

    # Convert list of dicts to SkillMasteryItems
    mastery_items = []
    for s in skills_data:
        ev = s.get("evidenceScore", 0.0)
        ass = s.get("assessmentScore", None)
        conf = s.get("selfRating", 3)
        item = mastery_estimator.calculate_skill_mastery(
            skill=s.get("skill", ""),
            category=s.get("category", None),
            evidence_score=ev,
            self_rating_1_to_5=conf,
            assessment_score=ass
        )
        mastery_items.append(item)

    return skill_gap_ranker.rank_skill_gaps(role_track, mastery_items, skipped)

# 4. Resource Recommendation Endpoints
@app.post("/personalization/resources/recommend", response_model=ResourceRecommendResponse)
def recommend_resources(req: ResourceRecommendRequest):
    return resource_ranker.recommend_all(req)

@app.post("/personalization/resources/feedback")
def log_resource_feedback(feedback: ResourceFeedbackRequest):
    return {
        "status": "success",
        "message": f"Feedback received for resource {feedback.resourceId}",
        "feedback": feedback.model_dump()
    }

# 5. Roadmap Scheduling & Replanning Endpoints
@app.post("/personalization/roadmap/generate", response_model=RoadmapResponse)
def generate_roadmap(req: RoadmapGenerateRequest):
    return roadmap_scheduler.generate_adaptive_roadmap(req)

@app.post("/personalization/roadmap/replan-week")
def replan_week(payload: Dict[str, Any]):
    week_data = payload.get("week", {})
    completed_ids = payload.get("completedTaskIds", [])
    skipped_ids = payload.get("skippedTaskIds", [])
    overdue_ids = payload.get("overdueTaskIds", [])
    revised_hours = payload.get("revisedWeeklyHours")
    duration = payload.get("sessionDurationMinutes", 45)

    return adaptive_replanner.replan_single_week(
        week=week_data,
        completed_task_ids=completed_ids,
        skipped_task_ids=skipped_ids,
        overdue_task_ids=overdue_ids,
        revised_weekly_hours=revised_hours,
        session_duration=duration
    )

@app.patch("/personalization/roadmap/task")
def update_task_properties(payload: Dict[str, Any]):
    task = payload.get("task", {})
    action = payload.get("action", "update")
    role_track = payload.get("targetRole", "Software Engineer")
    mastery = payload.get("currentMastery", 30.0)
    styles = payload.get("preferredStyles", ["Interactive practice"])

    if action == "replace_resource":
        task = adaptive_replanner.replace_task_resource(
            task=task,
            target_role=role_track,
            current_mastery=mastery,
            preferred_styles=styles
        )

    return {"status": "success", "task": task}

# 6. Diagnostic Assessment Endpoints
@app.get("/personalization/assessments/questions", response_model=List[AssessmentQuestion])
def get_assessment_questions(roleTrack: str = "Software Engineer", skillOrCategory: Optional[str] = None):
    return assessment_analyzer.get_questions_for_role(roleTrack, skillOrCategory)

@app.post("/personalization/assessments/analyze", response_model=AssessmentResult)
def evaluate_assessment(submission: AssessmentSubmission):
    return assessment_analyzer.evaluate_submission(submission)

# 7. Interaction Events & Feedback Loop
@app.post("/personalization/events", response_model=EventProcessingResult)
def ingest_event_batch(batch: EventBatchRequest):
    user_id = batch.events[0].userId if batch.events else "anonymous"
    return feedback_processor.process_event_batch(user_id, batch.events)

# 8. Explanations Endpoint
@app.get("/personalization/explanations/{recommendationId}")
def get_recommendation_explanation(
    recommendationId: str,
    skill: str = "Algorithms",
    resourceTitle: str = "Introduction to Algorithms",
    mastery: float = 30.0,
    preferredStyle: str = "Interactive practice"
):
    return explanation_service.explain_recommendation(
        recommendation_id=recommendationId,
        skill=skill,
        resource_title=resourceTitle,
        mastery=mastery,
        preferred_style=preferredStyle
    )
