from typing import Dict, Any

class ExplanationService:
    def explain_recommendation(
        self,
        recommendation_id: str,
        skill: str,
        resource_title: str,
        mastery: float,
        preferred_style: str
    ) -> Dict[str, Any]:
        return {
            "recommendationId": recommendation_id,
            "skill": skill,
            "resourceTitle": resource_title,
            "explanation": (
                f"We recommended '{resource_title}' because your current mastery in {skill} "
                f"is {int(mastery)}% and you expressed a preference for {preferred_style}. "
                f"This resource introduces core concepts with active practice, minimizing passive reading."
            ),
            "factors": {
                "masteryAlignment": "Matched to your current proficiency bracket (avoids overly advanced jargon).",
                "formatAlignment": f"Respects your preference for {preferred_style}.",
                "prerequisitesSatisfied": "All core dependencies have been satisfied."
            },
            "verifiableProofDeliverable": f"A completed coding challenge or mini-dashboard demonstrating {skill}."
        }

explanation_service = ExplanationService()
