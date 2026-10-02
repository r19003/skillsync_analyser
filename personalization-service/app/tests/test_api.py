import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["totalResources"] > 0

def test_profile_endpoints():
    profile_payload = {
        "userId": "user-test-789",
        "targetRole": "Business Analyst",
        "weeklyHours": 12,
        "learningStyles": ["Projects", "Videos"],
        "budget": "Free only"
    }
    post_res = client.post("/personalization/profile", json=profile_payload)
    assert post_res.status_code == 200
    assert post_res.json()["userId"] == "user-test-789"
    assert post_res.json()["weeklyHours"] == 12

    get_res = client.get("/personalization/profile/user-test-789?targetRole=Business%20Analyst")
    assert get_res.status_code == 200
    assert get_res.json()["targetRole"] == "Business Analyst"

def test_assessment_endpoints():
    # Fetch questions
    q_res = client.get("/personalization/assessments/questions?roleTrack=Software%20Engineer")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0
    assert questions[0]["roleTrack"] == "Software Engineer"

    # Evaluate submission
    sub_payload = {
        "userId": "user-test-789",
        "roleTrack": "Software Engineer",
        "skill": "Arrays and Strings",
        "answers": {questions[0]["id"]: questions[0]["correctOptionIndex"]}
    }
    sub_res = client.post("/personalization/assessments/analyze", json=sub_payload)
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert res_data["correctAnswers"] == 1
    assert res_data["passed"] is True
