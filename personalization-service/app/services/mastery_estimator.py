from typing import Dict, List, Optional
from ..schemas.mastery import SkillMasteryItem, MasteryCalculateRequest, MasteryResponse

class MasteryEstimatorService:
    """
    Deterministic skill mastery estimation based on transparent multi-signal weighting.
    Formula:
      30% resume evidence
      35% assessment performance (if available)
      20% completed practice quality
      10% user self-confidence rating
       5% consistency/recency
    When assessment data is unavailable, the remaining 65% is renormalized to 100%.
    """

    def calculate_skill_mastery(
        self,
        skill: str,
        category: Optional[str],
        evidence_score: float,
        self_rating_1_to_5: int = 3,
        assessment_score: Optional[float] = None,
        practice_score: float = 0.0,
        consistency_score: float = 50.0
    ) -> SkillMasteryItem:
        # Normalize self rating from 1..5 to 0..100
        confidence_score = max(0.0, min(100.0, (self_rating_1_to_5 - 1) * 25.0))

        has_assessment = assessment_score is not None and assessment_score >= 0.0

        if has_assessment:
            # Full 5-component weighted sum
            mastery = (
                0.30 * evidence_score +
                0.35 * assessment_score +
                0.20 * practice_score +
                0.10 * confidence_score +
                0.05 * consistency_score
            )
            confidence_level = "High" if practice_score > 60 else "Medium"
            reason = f"Combined evidence ({round(evidence_score,1)}%), assessment ({round(assessment_score,1)}%), and practice."
        else:
            # Renormalize weights across evidence (30), practice (20), confidence (10), consistency (5)
            # Total non-assessment weight = 0.65
            w_ev = 0.30 / 0.65      # ~0.4615
            w_pr = 0.20 / 0.65      # ~0.3077
            w_co = 0.10 / 0.65      # ~0.1538
            w_cs = 0.05 / 0.65      # ~0.0769

            mastery = (
                w_ev * evidence_score +
                w_pr * practice_score +
                w_co * confidence_score +
                w_cs * consistency_score
            )
            confidence_level = "Estimated"
            reason = f"Renormalized without assessment (evidence: {round(evidence_score,1)}%, self-confidence: {self_rating_1_to_5}/5)."

        mastery_clamped = round(max(0.0, min(100.0, mastery)), 1)

        sources = []
        if evidence_score > 0:
            sources.append("Resume Scan")
        if has_assessment:
            sources.append("Diagnostic Assessment")
        if practice_score > 0:
            sources.append("Hands-on Practice")
        if self_rating_1_to_5 != 3:
            sources.append("Self Assessment")
        if not sources:
            sources = ["Baseline Projection"]

        return SkillMasteryItem(
            skill=skill,
            category=category,
            masteryScore=mastery_clamped,
            targetMastery=80.0,
            confidenceLevel=confidence_level,
            evidenceScore=round(evidence_score, 1),
            assessmentScore=round(assessment_score, 1) if has_assessment else None,
            practiceScore=round(practice_score, 1),
            selfRating=self_rating_1_to_5,
            consistencyScore=round(consistency_score, 1),
            evidenceSources=sources,
            updateReason=reason,
            isAssessed=has_assessment
        )

    def calculate_all_masteries(self, req: MasteryCalculateRequest) -> MasteryResponse:
        results: List[SkillMasteryItem] = []
        all_skills = set(list(req.skillsEvidence.keys()) + list(req.skillsConfidence.keys()) + list(req.assessmentScores.keys()))

        for skill in all_skills:
            ev = req.skillsEvidence.get(skill, 0.0)
            conf = req.skillsConfidence.get(skill, 3)
            ass = req.assessmentScores.get(skill, None)
            pr = req.practiceScores.get(skill, 0.0)
            cs = req.consistencyScores.get(skill, 50.0)

            item = self.calculate_skill_mastery(
                skill=skill,
                category=None,
                evidence_score=ev,
                self_rating_1_to_5=conf,
                assessment_score=ass,
                practice_score=pr,
                consistency_score=cs
            )
            results.append(item)

        overall = round(sum(i.masteryScore for i in results) / max(1, len(results)), 1) if results else 0.0

        return MasteryResponse(
            userId=req.userId,
            targetRole=req.targetRole,
            overallMastery=overall,
            skills=results,
            formulaAssumptions={
                "assessedWeights": {"evidence": 0.30, "assessment": 0.35, "practice": 0.20, "confidence": 0.10, "consistency": 0.05},
                "unassessedWeights": {"evidence": 0.4615, "practice": 0.3077, "confidence": 0.1538, "consistency": 0.0769},
                "renormalizedWhenUnassessed": True
            }
        )

mastery_estimator = MasteryEstimatorService()
