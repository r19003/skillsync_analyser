from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class DailyTaskSchema(BaseModel):
    taskId: Optional[str] = None
    weekNumber: int
    dayNumber: int
    skill: str
    category: Optional[str] = None
    title: str
    whyThisMatters: str
    taskInstruction: str
    durationMinutes: int = 45
    type: str = "learn"             # "learn", "practice", "prove", "assess"
    difficulty: str = "beginner"     # "beginner", "intermediate", "advanced"
    resourceId: Optional[str] = None
    resourceDetails: Optional[Dict] = None
    status: str = "pending"          # "pending", "in_progress", "completed", "skipped"
    actualMinutesSpent: Optional[int] = None
    confidenceBefore: Optional[int] = None
    confidenceAfter: Optional[int] = None
    locked: bool = False
    notes: Optional[str] = ""

class WeekSchema(BaseModel):
    weekNumber: int
    phase: str
    title: str
    mainObjective: str
    expectedOutcome: str
    plannedHours: float
    completedHours: float = 0.0
    taskCount: int
    completedTaskCount: int = 0
    isExpanded: bool = False
    status: str = "upcoming"  # "completed", "current", "upcoming"
    tasks: List[DailyTaskSchema] = []

class PhaseSchema(BaseModel):
    phaseIndex: int
    name: str  # "Foundation", "Practice", "Application", "Interview Preparation", "Validation"
    description: str
    weekNumbers: List[int]
    status: str = "upcoming"

class RoadmapGenerateRequest(BaseModel):
    userId: str
    targetRole: str
    weeklyHours: int = 10
    sessionDurationMinutes: int = 45
    availableDays: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    timelineIntensity: str = "Balanced"
    targetWeeks: int = 6
    skillMastery: Dict[str, float] = {}   # skill -> masteryScore (0-100)
    skippedSkills: List[str] = []
    preferredStyles: List[str] = ["Interactive practice", "Projects"]
    preferredLanguage: str = "Python"
    budget: str = "Free only"

class RoadmapResponse(BaseModel):
    userId: str
    targetRole: str
    totalWeeks: int
    weeklyHours: int
    phases: List[PhaseSchema]
    weeks: List[WeekSchema]
    assumptions: Dict

class ReplanWeekRequest(BaseModel):
    userId: str
    planId: str
    targetWeekNumber: int
    completedTaskIds: List[str] = []
    skippedTaskIds: List[str] = []
    overdueTaskIds: List[str] = []
    revisedWeeklyHours: Optional[int] = None
    reason: Optional[str] = "Adjustment after missed tasks"
