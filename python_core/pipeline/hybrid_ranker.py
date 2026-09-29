"""
Pipeline principal de ranqueamento semântico orientado a agentes (Antigravity-ready).
Une sentence-transformers com GLiNER e penalização de vagueza informacional.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import numpy as np

from scoring.quality import InformationDensityScorer
from extractor.semantic_ner import SemanticEntityExtractor, ExtractedEntity

class CandidateChunk(BaseModel):
    id: str
    text: str
    metadata: Optional[Dict[str, Any]] = None

class RankedResult(BaseModel):
    id: str
    text: str
    vector_similarity: float
    quality_multiplier: float
    final_score: float
    entities: List[ExtractedEntity]

class HybridSemanticRanker:
    """Orquestrador do ranqueamento híbrido: Vetorial + Entidades + Penalidade de Vagueza."""

    def __init__(
        self,
        embedder_model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
        gliner_model_name: str = "urchade/gliner_base-v2.1",
        target_entity_labels: Optional[List[str]] = None,
    ):
        self.embedder_name = embedder_model_name
        self.target_labels = target_entity_labels or [
            "Organização", "Pessoa", "Localização", "Tecnologia", "Conceito Técnico", "Métrica Financeira"
        ]
        self._embedder = None
        self.ner = SemanticEntityExtractor(model_name=gliner_model_name)
        self.scorer = InformationDensityScorer()

    def _get_embedder(self):
        if self._embedder is None:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer(self.embedder_name)
        return self._embedder

    def rank(self, query: str, chunks: List[CandidateChunk]) -> List[RankedResult]:
        if not chunks:
            return []

        embedder = self._get_embedder()
        
        # 1. Embeddings de cosseno normalizados
        query_vec = embedder.encode(query, normalize_embeddings=True)
        chunk_texts = [c.text for c in chunks]
        chunk_vecs = embedder.encode(chunk_texts, normalize_embeddings=True)
        cos_similarities = np.dot(chunk_vecs, query_vec)

        results: List[RankedResult] = []

        # 2. Processamento de Entidades e Ajuste de Densidade
        for idx, chunk in enumerate(chunks):
            cos_sim = float(cos_similarities[idx])
            entities = self.ner.extract(chunk.text, self.target_labels)
            
            # Conta tokens cobertos por entidades substantivas
            entity_tokens_count = sum(len(e.text.split()) for e in entities)
            quality_metrics = self.scorer.evaluate(chunk.text, entity_tokens_count)

            # Cálculo ponderado final
            final_score = cos_sim * quality_metrics.quality_multiplier

            results.append(
                RankedResult(
                    id=chunk.id,
                    text=chunk.text,
                    vector_similarity=round(cos_sim, 4),
                    quality_multiplier=quality_metrics.quality_multiplier,
                    final_score=round(final_score, 4),
                    entities=entities,
                )
            )

        # Ordenação decrescente pelo score calibrado
        return sorted(results, key=lambda r: r.final_score, reverse=True)
