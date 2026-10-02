from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..schemas.roadmap import WeekSchema, DailyTaskSchema, ReplanWeekRequest
from .resource_ranker import resource_ranker

class AdaptiveReplannerService:
    """
    Surgically replans single weeks or adjusts specific tasks without
    wiping out or mutating the entire multi-week roadmap.
    """

    def replan_single_week(
        self,
        week: Dict[str, Any],
        completed_task_ids: List[str],
        skipped_task_ids: List[str],
        overdue_task_ids: List[str],
        revised_weekly_hours: Optional[int] = None,
        session_duration: int = 45
    ) -> Dict[str, Any]:
        tasks = week.get("tasks", [])
        completed_set = set(completed_task_ids)
        skipped_set = set(skipped_task_ids)
        overdue_set = set(overdue_task_ids)

        replanned_tasks = []
        carried_over = []

        for t in tasks:
            t_id = t.get("taskId")
            if t.get("locked", False):
                # Never alter locked tasks
                replanned_tasks.append(t)
                continue

            if t_id in completed_set:
                t["status"] = "completed"
                replanned_tasks.append(t)
            elif t_id in skipped_set:
                t["status"] = "skipped"
                # Does not take time
            elif t_id in overdue_set:
                # Mark as high priority to carry forward
                t["status"] = "pending"
                t["whyThisMatters"] = "Carried forward from previous missed session to maintain sequence."
                carried_over.append(t)
            else:
                replanned_tasks.append(t)

        # Place carried over tasks at the start of pending days
        final_tasks = []
        for t in replanned_tasks:
            if t.get("status") == "completed":
                final_tasks.append(t)

        final_tasks.extend(carried_over)
        for t in replanned_tasks:
            if t not in final_tasks:
                final_tasks.append(t)

        # Re-index day numbers sequentially
        day_counter = 1
        total_mins = 0
        completed_hours = 0.0

        for t in final_tasks:
            t["dayNumber"] = day_counter
            day_counter += 1
            if t.get("status") == "completed":
                completed_hours += round(t.get("durationMinutes", session_duration) / 60.0, 1)
            total_mins += t.get("durationMinutes", session_duration)

        week["tasks"] = final_tasks
        week["taskCount"] = len(final_tasks)
        week["completedTaskCount"] = len([t for t in final_tasks if t.get("status") == "completed"])
        week["plannedHours"] = round(total_mins / 60.0, 1)
        week["completedHours"] = round(completed_hours, 1)
        week["isReplanned"] = True
        week["lastReplannedAt"] = datetime.now().isoformat()

        return week

    def replace_task_resource(
        self,
        task: Dict[str, Any],
        target_role: str,
        current_mastery: float,
        preferred_styles: List[str],
        budget: str = "Free only",
        disliked_ids: List[str] = None
    ) -> Dict[str, Any]:
        skill = task.get("skill", "")
        current_res_id = task.get("resourceId")
        disliked = list(disliked_ids or [])
        if current_res_id:
            disliked.append(current_res_id)

        triplet = resource_ranker.recommend_for_skill(
            skill=skill,
            target_role=target_role,
            current_mastery=current_mastery,
            preferred_styles=preferred_styles,
            budget=budget,
            disliked_ids=disliked
        )

        t_type = task.get("type", "learn")
        new_res = triplet.practice if t_type == "practice" else (triplet.prove if t_type == "prove" else triplet.learn)

        if new_res:
            task["resourceId"] = new_res.resourceId
            task["resourceDetails"] = {
                "title": new_res.title,
                "url": new_res.url,
                "provider": new_res.provider,
                "resourceType": new_res.resourceType,
                "selectionReason": "Replaced based on your format and difficulty preference."
            }

        return task

adaptive_replanner = AdaptiveReplannerService()
