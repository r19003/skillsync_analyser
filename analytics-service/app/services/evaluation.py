"""
evaluation.py
Metrics evaluation module: precision, recall, and F1-score for skill matching.
"""

from typing import List, Set, Dict

def evaluate_skill_extraction(
    predicted_skills: List[str],
    ground_truth_skills: List[str]
) -> Dict[str, float]:
    pred_set: Set[str] = {s.lower().strip() for s in predicted_skills}
    true_set: Set[str] = {s.lower().strip() for s in ground_truth_skills}

    if not pred_set and not true_set:
        return {"precision": 1.0, "recall": 1.0, "f1": 1.0}

    true_positives = len(pred_set.intersection(true_set))
    precision = true_positives / len(pred_set) if pred_set else 0.0
    recall = true_positives / len(true_set) if true_set else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "true_positives": true_positives,
        "predicted_count": len(pred_set),
        "ground_truth_count": len(true_set)
    }
