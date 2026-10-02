from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class SkillMasteryItem(BaseModel):
    skill: str
    category: Optional[str] = None
    masteryScore: float = Field(ge=0.0, le=100.0)
    targetMastery: float = 80.0
    confidenceLevel: str = "Estimated"
    evidenceScore: float = 0.0
    assessmentScore: Optional[float] = None
    practiceScore: float = 0.0
    selfRating: int = 3
    consistencyScore: float = 50.0
    evidenceSources: List[str] = ["Resume Scan"]
    updateReason: str = "Initial calculation"
    isAssessed: bool = False

class MasteryCalculateRequest(BaseModel):
    userId: str
    targetRole: str
    skillsEvidence: Dict[str, float] = {}       # skill -> evidenceScore (0-100)
    skillsConfidence: Dict[str, int] = {}       # skill -> selfRating (1-5)
    assessmentScores: Dict[str, float] = {}     # skill -> assessmentScore (0-100)
    practiceScores: Dict[str, float] = {}       # skill -> practiceScore (0-100)
    consistencyScores: Dict[str, float] = {}    # skill -> consistencyScore (0-100)

class MasteryResponse(BaseModel):
    userId: str
    targetRole: str
    overallMastery: float
    skills: List[SkillMasteryItem]
    formulaAssumptions: Dict
