"""
semantic_matcher.py
Cosine-similarity matching between resume sentence fragments and target skills.
"""

import numpy as np
from typing import List, Dict, Any
from .embeddings import compute_embeddings, get_sentence_transformer

def match_skills_against_sentences(
    resume_sentences: List[str],
    target_skills: List[str],
    threshold: float = 0.65
) -> List[Dict[str, Any]]:
    """
    Computes semantic similarity matrix between all resume sentences
    and target skills, returning the best matching evidence for each skill.
    """
    if not resume_sentences or not target_skills:
        return [
            {
                "skill": s,
                "matched_sentence": None,
                "similarity_score": 0.0,
                "confidence": 0.0,
                "is_match": False
            }
            for s in target_skills
        ]

    # Combine to compute embeddings in single batch
    all_texts = target_skills + resume_sentences
    all_embeddings = compute_embeddings(all_texts)

    n_skills = len(target_skills)
    skill_embeddings = all_embeddings[:n_skills]
    sentence_embeddings = all_embeddings[n_skills:]

    # Cosine similarity matrix (since vectors are L2 normalized, dot product = cosine similarity)
    sim_matrix = np.dot(skill_embeddings, sentence_embeddings.T)

    results = []
    for i, skill in enumerate(target_skills):
        best_sentence_idx = int(np.argmax(sim_matrix[i]))
        best_sim = float(sim_matrix[i, best_sentence_idx])
        is_match = best_sim >= threshold

        results.append({
            "skill": skill,
            "matched_sentence": resume_sentences[best_sentence_idx] if is_match else None,
            "similarity_score": round(best_sim, 4),
            "confidence": round(min(1.0, max(0.0, best_sim)), 2),
            "is_match": is_match
        })

    return results

def compute_pairwise_similarity(text_a: str, text_b: str) -> float:
    embeddings = compute_embeddings([text_a, text_b])
    sim = float(np.dot(embeddings[0], embeddings[1]))
    return max(0.0, min(1.0, round(sim, 4)))
