from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class UserProfileSchema(BaseModel):
    userId: str
    targetRole: str = "Software Engineer"
    targetSeniority: str = "Entry-Level"
    targetDate: Optional[str] = None
    currentStatus: str = "Recent Graduate"
    weeklyHours: int = Field(default=10, ge=2, le=50)
    availableDays: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    sessionDurationMinutes: int = Field(default=45, ge=20, le=180)
    preferredStudyTime: str = "Evening"
    learningStyles: List[str] = ["Interactive practice", "Projects"]
    budget: str = "Free only"
    preferredLanguage: str = "Python"
    skillConfidence: Dict[str, int] = {}
    confirmedResumeSkills: List[str] = []
    skippedTopics: List[str] = []
    primaryGoals: List[str] = ["Prepare for placements", "Build portfolio"]
    timelineIntensity: str = "Balanced"
    remindersEnabled: bool = True
    onboardingCompleted: bool = False

class ProfileUpdateRequest(BaseModel):
    userId: str
    updates: Dict
