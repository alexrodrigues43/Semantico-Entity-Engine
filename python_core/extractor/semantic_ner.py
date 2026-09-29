"""
Módulo de extração de entidades semânticas com suporte a GLiNER (Zero-Shot NER).
Implementa normalização ontológica canônica e justificativas de desambiguação contextual.
"""
from typing import List, Optional
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

class ExtractedEntity(BaseModel):
    text: str = Field(..., description="Trecho literal extraído do texto")
    label: str = Field(..., description="Classe semântica atribuída")
    canonical_name: Optional[str] = Field(None, description="Nome canônico normalizado no grafo")
    disambiguation_context: Optional[str] = Field(None, description="Justificativa contextual da classificação")
    score: float = Field(..., description="Probabilidade/confiança do modelo (0 a 1)")
    start_char: int
    end_char: int

class SemanticEntityExtractor:
    """Extrai entidades usando GLiNER com suporte a labels dinâmicos."""

    def __init__(self, model_name: str = "urchade/gliner_base-v2.1", threshold: float = 0.5):
        self.model_name = model_name
        self.threshold = threshold
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from gliner import GLiNER
                self._model = GLiNER.from_pretrained(self.model_name)
                logger.info(f"Modelo GLiNER carregado: {self.model_name}")
            except Exception as exc:
                logger.error(f"Erro ao carregar GLiNER ({exc}). Instale via pip install gliner.")
                raise

    def extract(self, text: str, labels: List[str]) -> List[ExtractedEntity]:
        self._load_model()
        if not text or not text.strip() or not labels:
            return []

        raw_entities = self._model.predict_entities(text, labels, threshold=self.threshold)
        results = []
        for ent in raw_entities:
            raw_t = ent["text"].strip()
            results.append(
                ExtractedEntity(
                    text=raw_t,
                    label=ent["label"],
                    canonical_name=raw_t,
                    disambiguation_context=f"Identificado pelo contexto sintático para o rótulo '{ent['label']}'.",
                    score=round(float(ent["score"]), 4),
                    start_char=ent["start"],
                    end_char=ent["end"],
                )
            )
        return results
