import pytest
from app.services.mastery_estimator import mastery_estimator
from app.schemas.mastery import MasteryCalculateRequest

def test_unassessed_mastery_renormalization():
    """Verify that when assessment score is unavailable, remaining weights sum to 1.0 (renormalized)."""
    # evidence: 80, confidence: 4/5 (75%), practice: 50, consistency: 60
    item = mastery_estimator.calculate_skill_mastery(
        skill="SQL",
        category="Databases",
        evidence_score=80.0,
        self_rating_1_to_5=4,
        assessment_score=None,
        practice_score=50.0,
        consistency_score=60.0
    )
    assert item.isAssessed is False
    assert item.confidenceLevel == "Estimated"
    assert item.assessmentScore is None
    # Check bounds
    assert 0.0 <= item.masteryScore <= 100.0

def test_assessed_mastery_calculation():
    """Verify that when assessment is completed, the full 5-component 30/35/20/10/5 weighting applies."""
    item = mastery_estimator.calculate_skill_mastery(
        skill="Dynamic Programming",
        category="DSA",
        evidence_score=60.0,
        self_rating_1_to_5=3, # 50%
        assessment_score=80.0,
        practice_score=70.0,
        consistency_score=50.0
    )
    # Expected: 0.30*60 + 0.35*80 + 0.20*70 + 0.10*50 + 0.05*50 = 18 + 28 + 14 + 5 + 2.5 = 67.5
    assert item.isAssessed is True
    assert item.assessmentScore == 80.0
    assert abs(item.masteryScore - 67.5) < 0.2

def test_calculate_all_masteries():
    req = MasteryCalculateRequest(
        userId="user-test-123",
        targetRole="Software Engineer",
        skillsEvidence={"Arrays": 70.0, "Trees": 30.0},
        skillsConfidence={"Arrays": 4, "Trees": 2},
        assessmentScores={"Arrays": 85.0}
    )
    res = mastery_estimator.calculate_all_masteries(req)
    assert res.userId == "user-test-123"
    assert len(res.skills) == 2
    assert res.overallMastery > 0.0
