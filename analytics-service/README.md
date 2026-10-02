# SkillSync Analytics Microservice (FastAPI + ML)

The `analytics-service` is an optional high-performance Python microservice that augments SkillSync with dense semantic embeddings and unsupervised skill clustering.

## Architecture

- **Framework**: FastAPI (high-speed ASGI server)
- **Dense Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Lexical/Vector Fallback**: `scikit-learn` TF-IDF with L2 normalization
- **Clustering**: `KMeans` vector quantization

> **Note**: SkillSync's Node.js backend operates with full deterministic scoring and lexical normalization out-of-the-box. If this Python service is not running, Node.js uses its built-in rule and evidence engine with zero disruption.

## Setup Instructions

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Verify service health:
   ```bash
   curl http://localhost:8000/health
   ```

## Endpoints

- `GET /health` — Service readiness & loaded model info
- `POST /match-skills` — Batch cosine-similarity matching of candidate resume sentences against target skills
- `POST /semantic-similarity` — Pairwise sentence cosine similarity
- `POST /cluster-skills` — Unsupervised skill clustering using KMeans
