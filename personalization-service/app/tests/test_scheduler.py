import pytest
from app.services.roadmap_scheduler import roadmap_scheduler
from app.services.adaptive_replanner import adaptive_replanner
from app.schemas.roadmap import RoadmapGenerateRequest

def test_roadmap_structure():
    """Verify that generated roadmap has 5 phases, week summaries, and daily tasks with only Week 1 expanded."""
    req = RoadmapGenerateRequest(
        userId="user-test-456",
        targetRole="Software Engineer",
        weeklyHours=10,
        sessionDurationMinutes=45,
        targetWeeks=6
    )
    res = roadmap_scheduler.generate_adaptive_roadmap(req)
    assert res.totalWeeks == 6
    assert len(res.phases) == 5
    assert len(res.weeks) == 6

    # Verify only Week 1 is expanded
    assert res.weeks[0].isExpanded is True
    assert res.weeks[1].isExpanded is False
    assert res.weeks[0].status == "current"
    assert res.weeks[1].status == "upcoming"

    # Verify tasks inside week 1
    assert len(res.weeks[0].tasks) > 0
    task1 = res.weeks[0].tasks[0]
    assert task1.durationMinutes == 45
    assert task1.status == "pending"

def test_single_week_replanning():
    """Verify that adaptive replanning carries forward overdue tasks without blowing away the week."""
    sample_week = {
        "weekNumber": 1,
        "tasks": [
            {"taskId": "t1", "title": "Arrays intro", "durationMinutes": 45, "status": "pending", "locked": False},
            {"taskId": "t2", "title": "Arrays practice", "durationMinutes": 45, "status": "pending", "locked": False},
            {"taskId": "t3", "title": "Arrays milestone", "durationMinutes": 45, "status": "pending", "locked": False}
        ]
    }
    # User completed t1, missed t2 (overdue)
    replanned = adaptive_replanner.replan_single_week(
        week=sample_week,
        completed_task_ids=["t1"],
        skipped_task_ids=[],
        overdue_task_ids=["t2"]
    )
    assert replanned["isReplanned"] is True
    assert replanned["completedTaskCount"] == 1
    assert replanned["tasks"][0]["taskId"] == "t1"
    assert replanned["tasks"][0]["status"] == "completed"
