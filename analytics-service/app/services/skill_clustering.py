"""
skill_clustering.py
Unsupervised skill clustering using KMeans and PCA vector projections.
"""

from typing import List, Dict
import numpy as np
from sklearn.cluster import KMeans
from .embeddings import compute_embeddings

def cluster_skills(skills: List[str], n_clusters: int = 4) -> Dict[str, Any]:
    if len(skills) < n_clusters:
        n_clusters = max(1, len(skills))

    embeddings = compute_embeddings(skills)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    labels = kmeans.fit_predict(embeddings)

    clusters: Dict[int, List[str]] = {i: [] for i in range(n_clusters)}
    for skill, label in zip(skills, labels):
        clusters[int(label)].append(skill)

    cluster_labels = {}
    for c_id, c_skills in clusters.items():
        cluster_labels[c_id] = f"Cluster {c_id + 1} ({len(c_skills)} skills)"

    return {
        "clusters": clusters,
        "cluster_labels": cluster_labels,
        "n_clusters": n_clusters
    }
