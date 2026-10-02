# SkillSync Personalization Service

FastAPI-powered microservice for deterministic skill mastery estimation, content-based resource ranking, and adaptive 3-tier roadmap scheduling.

## Architectural Layers

1. **Layer 1: Deterministic User State** (`services/user_profile.py`):
   Maintains user learning profile, available days, weekly study hours, budget, and confidence ratings.
2. **Layer 2: Mastery Estimation** (`services/mastery_estimator.py`):
   Computes transparent multi-signal skill mastery:
   $$30\% \text{ evidence} + 35\% \text{ assessment} + 20\% \text{ practice} + 10\% \text{ confidence} + 5\% \text{ consistency}$$
   Gracefully renormalizes across non-assessment weights when unassessed.
3. **Layer 3: Resource Ranking** (`services/resource_ranker.py`):
   Matches against 157+ curated learning resources. Recommends structured Learn/Practice/Prove triads per priority skill.
4. **Layer 4: Adaptive Roadmap Scheduling** (`services/roadmap_scheduler.py` & `services/adaptive_replanner.py`):
   Enforces NetworkX prerequisite DAG ordering across 5 phases (Foundation $\to$ Practice $\to$ Application $\to$ Interview Prep $\to$ Validation). Single-week surgical replanning without mutating the whole roadmap.
5. **Layer 5: LLM Guidance & Explanations** (`services/llm_planner.py` & `services/explanations.py`):
   Strict JSON output for friendly explanations and motivation. Zero numeric score or credential hallucinations.

## Running the Service

```bash
uvicorn app.main:app --port 8001 --reload
```

## Running Tests

```bash
pytest app/tests
```
