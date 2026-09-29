"""
Servidor de Produção FastAPI desacoplado para deploy autônomo (Google Antigravity).
Expõe endpoints REST para ranqueamento semântico ponderado e extração de entidades.
"""
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from scoring.quality import InformationDensityScorer, ContentQualityMetrics
from extractor.semantic_ner import SemanticEntityExtractor, ExtractedEntity
from pipeline.hybrid_ranker import HybridSemanticRanker, CandidateChunk, RankedResult

app = FastAPI(
    title="Motor Semântico & NER Rigoroso (PoolParty-like)",
    version="1.0.0",
    description="API de alta precisão semântica para ranqueamento híbrido e extração ontológica com penalização de vagueza."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização tardia do pipeline para healthchecks rápidos
_ranker: Optional[HybridSemanticRanker] = None

def get_ranker() -> HybridSemanticRanker:
    global _ranker
    if _ranker is None:
        _ranker = HybridSemanticRanker()
    return _ranker

# DTOs
class RankRequest(BaseModel):
    query: str = Field(..., example="governança e arquitetura de software")
    chunks: List[CandidateChunk]

class RankResponse(BaseModel):
    query: str
    total_ranked: int
    results: List[RankedResult]

class ExtractRequest(BaseModel):
    text: str
    labels: Optional[List[str]] = None

class QualityCheckRequest(BaseModel):
    text: str
    entity_tokens: Optional[int] = 0

@app.get("/health")
def health_check():
    """Health check endpoint para validação do Antigravity."""
    return {"status": "ok", "service": "semantic-engine", "version": "1.0.0"}

@app.post("/api/rank", response_model=RankResponse)
def rank_candidates(payload: RankRequest):
    """Ranqueia trechos de texto combinando similaridade vetorial com densidade de entidades e penalização de vagueza."""
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="A query de busca não pode ser vazia.")
    
    ranker = get_ranker()
    ranked = ranker.rank(payload.query, payload.chunks)
    return RankResponse(
        query=payload.query,
        total_ranked=len(ranked),
        results=ranked
    )

@app.post("/api/quality-metrics", response_model=ContentQualityMetrics)
def check_quality(payload: QualityCheckRequest):
    """Analisa a densidade informacional e penalidade de jargões/fluff de um texto."""
    scorer = InformationDensityScorer()
    return scorer.evaluate(payload.text, payload.entity_tokens or 0)
