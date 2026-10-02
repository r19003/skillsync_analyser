from pydantic import BaseModel
from typing import List, Optional, Dict

class AssessmentQuestion(BaseModel):
    id: str
    roleTrack: str
    skill: str
    category: str
    questionText: str
    scenario: Optional[str] = None
    codeSnippet: Optional[str] = None
    options: List[str]
    correctOptionIndex: int
    explanation: str
    difficulty: str = "beginner"

class AssessmentQuizRequest(BaseModel):
    userId: str
    roleTrack: str
    skillOrCategory: Optional[str] = None
    questionCount: int = 5

class AssessmentSubmission(BaseModel):
    userId: str
    roleTrack: str
    skill: str
    answers: Dict[str, int]  # questionId -> selectedOptionIndex

class AssessmentResult(BaseModel):
    userId: str
    roleTrack: str
    skill: str
    totalQuestions: int
    correctAnswers: int
    scorePercentage: float
    passed: bool
    feedback: str
    updatedMasteryGain: float
    recommendation: str
