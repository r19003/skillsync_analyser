from pydantic import BaseModel
from typing import List, Optional, Dict

class ResourceItem(BaseModel):
    resourceId: str
    title: str
    provider: str
    url: str
    roleTracks: List[str]
    skill: str
    category: str
    resourceType: str
    difficulty: str
    estimatedMinutes: int
    costType: str
    handsOn: bool
    qualityScore: int
    description: str
    prerequisites: List[str] = []
    tags: List[str] = []
    relevanceScore: Optional[float] = None
    selectionReason: Optional[str] = None
    stageType: Optional[str] = None  # "learn", "practice", "prove"

class SkillResourceTriplet(BaseModel):
    skill: str
    category: Optional[str] = None
    currentMastery: float
    learn: Optional[ResourceItem] = None
    practice: Optional[ResourceItem] = None
    prove: Optional[ResourceItem] = None
    explanation: Optional[str] = None

class ResourceRecommendRequest(BaseModel):
    userId: str
    targetRole: str
    targetSkills: List[str]
    currentMastery: Dict[str, float] = {}
    preferredStyles: List[str] = ["Interactive practice", "Projects"]
    budget: str = "Free only"
    preferredLanguage: Optional[str] = "Python"
    dislikedResourceIds: List[str] = []
    preferredResourceIds: List[str] = []

class ResourceRecommendResponse(BaseModel):
    userId: str
    role: str
    triplets: List[SkillResourceTriplet]
    totalResourcesConsidered: int

class ResourceFeedbackRequest(BaseModel):
    userId: str
    resourceId: str
    rating: Optional[int] = None
    difficultyFeedback: Optional[str] = None  # "too_easy", "just_right", "too_difficult"
    formatFeedback: Optional[str] = None      # "too_long", "not_my_format", "broken_link", "outdated"
    helpful: bool = True
    comment: Optional[str] = ""
