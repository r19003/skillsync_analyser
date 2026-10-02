import pytest
from app.services.resource_ranker import resource_ranker

def test_resource_loader():
    """Verify that learning resources load from disk successfully."""
    resources = resource_ranker.get_all_resources()
    assert len(resources) >= 50

def test_learn_practice_prove_triplet():
    """Verify that recommendation for a skill generates a triplet with learn/practice/prove."""
    triplet = resource_ranker.recommend_for_skill(
        skill="Data Structures and Algorithms",
        target_role="Software Engineer",
        current_mastery=25.0,
        preferred_styles=["Interactive practice"]
    )
    assert triplet.skill == "Data Structures and Algorithms"
    assert triplet.learn is not None
    assert triplet.practice is not None
    assert triplet.learn.stageType in ["learn", "practice", "prove"]
    assert triplet.explanation is not None

def test_budget_free_filtering():
    """Verify that users requesting Free only are not recommended strictly paid resources."""
    triplet = resource_ranker.recommend_for_skill(
        skill="Power BI",
        target_role="Business Analyst",
        current_mastery=15.0,
        preferred_styles=["Projects"],
        budget="Free only"
    )
    if triplet.learn:
        assert "paid" not in triplet.learn.costType.lower() or "free" in triplet.learn.costType.lower()
