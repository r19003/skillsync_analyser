"""
main.py
FastAPI application entry point for the SkillSync Analytics Service.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import (
    MatchSkillsRequest, MatchSkillsResponse,
    SemanticSimilarityRequest, SemanticSimilarityResponse,
    SkillClusterRequest, SkillClusterResponse
)
from .services.semantic_matcher import match_skills_against_sentences, compute_pairwise_similarity
from .services.skill_clustering import cluster_skills
from .services.embeddings import get_sentence_transformer

app = FastAPI(
    title="SkillSync Python Analytics Microservice",
    version="1.0.0",
    description="Vector embeddings, semantic matching, and clustering microservice for SkillSync."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    model = get_sentence_transformer()
    return {
        "status": "online",
        "service": "SkillSync Analytics Service",
        "model_loaded": "all-MiniLM-L6-v2" if model is not None else "TF-IDF Fallback",
        "version": "1.0.0"
    }

@app.post("/match-skills", response_model=MatchSkillsResponse)
def match_skills(request: MatchSkillsRequest):
    try:
        matches = match_skills_against_sentences(
            resume_sentences=request.resume_sentences,
            target_skills=request.target_skills,
            threshold=request.threshold
        )
        matched_count = sum(1 for m in matches if m["is_match"])
        model_name = "all-MiniLM-L6-v2" if get_sentence_transformer() is not None else "TF-IDF Normalized Vectors"
        return {
            "matches": matches,
            "matched_count": matched_count,
            "total_skills": len(request.target_skills),
            "model_name": model_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/semantic-similarity", response_model=SemanticSimilarityResponse)
def semantic_similarity(request: SemanticSimilarityRequest):
    try:
        sim = compute_pairwise_similarity(request.text_a, request.text_b)
        method = "Cosine Distance (SentenceTransformer)" if get_sentence_transformer() is not None else "Cosine Distance (TF-IDF)"
        return {
            "similarity": sim,
            "method": method
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster-skills", response_model=SkillClusterResponse)
def cluster(request: SkillClusterRequest):
    try:
        result = cluster_skills(request.skills, n_clusters=request.n_clusters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
