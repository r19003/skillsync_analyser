"""
schemas.py
Pydantic schemas for the SkillSync Python Analytics Microservice.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MatchSkillsRequest(BaseModel):
    resume_sentences: List[str] = Field(..., description="Extracted sentence fragments from candidate resume")
    target_skills: List[str] = Field(..., description="Canonical skills or JD requirement strings")
    threshold: Optional[float] = Field(0.65, ge=0.0, le=1.0, description="Minimum cosine similarity threshold")

class MatchResult(BaseModel):
    skill: str
    matched_sentence: Optional[str] = None
    similarity_score: float
    confidence: float
    is_match: bool

class MatchSkillsResponse(BaseModel):
    matches: List[MatchResult]
    matched_count: int
    total_skills: int
    model_name: str

class SemanticSimilarityRequest(BaseModel):
    text_a: str
    text_b: str

class SemanticSimilarityResponse(BaseModel):
    similarity: float
    method: str

class SkillClusterRequest(BaseModel):
    skills: List[str]
    n_clusters: Optional[int] = Field(4, ge=2, le=10)

class SkillClusterResponse(BaseModel):
    clusters: Dict[int, List[str]]
    cluster_labels: Dict[int, str]
    n_clusters: int
