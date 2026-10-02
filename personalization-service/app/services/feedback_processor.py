from typing import List, Dict, Any
from ..schemas.events import InteractionEventSchema, EventProcessingResult

class FeedbackProcessorService:
    def process_event_batch(self, user_id: str, events: List[InteractionEventSchema]) -> EventProcessingResult:
        adjustments: Dict[str, Any] = {
            "preferredFormats": [],
            "deprioritizedFormats": [],
            "suggestedWeeklyHourDelta": 0,
            "difficultyAdjustment": "maintain",
            "skillsForRevision": [],
            "skillsForAcceleration": []
        }
        mastery_updates: Dict[str, float] = {}

        too_long_count = 0
        interactive_completed_count = 0
        overdue_count = 0
        completed_count = 0

        for ev in events:
            event_type = ev.eventType
            meta = ev.metadata or {}
            skill = ev.skill

            if event_type == "resource_too_easy" and skill:
                adjustments["skillsForAcceleration"].append(skill)
                mastery_updates[skill] = mastery_updates.get(skill, 0.0) + 10.0

            elif event_type == "resource_too_difficult" and skill:
                adjustments["skillsForRevision"].append(skill)
                mastery_updates[skill] = max(0.0, mastery_updates.get(skill, 0.0) - 5.0)

            elif event_type == "resource_completed":
                completed_count += 1
                r_type = str(meta.get("resourceType", "")).lower()
                if "interactive" in r_type or "practice" in r_type:
                    interactive_completed_count += 1

            elif event_type == "task_overdue":
                overdue_count += 1

            elif meta.get("formatFeedback") == "too_long":
                too_long_count += 1

            elif event_type == "assessment_attempted" and skill:
                score = meta.get("scorePercentage", 0.0)
                if score >= 80:
                    adjustments["skillsForAcceleration"].append(skill)
                    mastery_updates[skill] = max(mastery_updates.get(skill, 0.0), score)
                elif score < 50:
                    adjustments["skillsForRevision"].append(skill)

        # Behavioral heuristics
        if too_long_count >= 2:
            adjustments["deprioritizedFormats"].append("Long video / textbook")
            adjustments["preferredFormats"].append("Concise interactive tutorial")

        if interactive_completed_count >= 3:
            adjustments["preferredFormats"].append("Interactive practice")

        if overdue_count >= 3:
            # Recommend lightening schedule
            adjustments["suggestedWeeklyHourDelta"] = -2
            adjustments["workloadAdvice"] = "Tasks are frequently taking longer than planned. Recommend reducing weekly commitment by 2 hours."

        return EventProcessingResult(
            userId=user_id,
            processedCount=len(events),
            profileAdjustments=adjustments,
            masteryUpdates=mastery_updates
        )

feedback_processor = FeedbackProcessorService()
