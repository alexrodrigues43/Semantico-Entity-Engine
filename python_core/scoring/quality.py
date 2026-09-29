"""
Módulo de cálculo de densidade informacional e penalização de vagueza (Fluff Penalty).
Desenvolvido para consumo autônomo pelo Antigravity e pipelines semânticos de alta precisão.
"""
from dataclasses import dataclass
from typing import Set, Optional
import re

DEFAULT_BUZZWORDS: Set[str] = {
    "alavancar", "sinergia", "holístico", "disrupção", "ecossistema",
    "mindset", "paradigma", "game-changer", "empoderamento", "valor agregado",
    "excelência", "inovação contínua", "foco no cliente", "best-in-class",
    "transformar paradigmas", "diferenciais competitivos sustentáveis"
}

@dataclass(frozen=True)
class ContentQualityMetrics:
    total_tokens: int
    entity_token_count: int
    buzzword_count: int
    entity_density: float
    vagueness_penalty: float
    quality_multiplier: float

class InformationDensityScorer:
    """Calcula penalidade de fluff e bônus de densidade conceitual."""

    def __init__(
        self,
        buzzwords: Optional[Set[str]] = None,
        lambda_vague: float = 0.45,
        lambda_ent: float = 0.35,
    ):
        self.buzzwords = buzzwords or DEFAULT_BUZZWORDS
        self.lambda_vague = lambda_vague
        self.lambda_ent = lambda_ent

    def evaluate(self, text: str, entity_tokens: int) -> ContentQualityMetrics:
        clean_text = text.lower()
        words = re.findall(r"\b\w+\b", clean_text)
        total_tokens = max(len(words), 1)

        buzzword_matches = sum(1 for bw in self.buzzwords if bw in clean_text)
        vagueness_ratio = min(buzzword_matches / (total_tokens * 0.15 + 1), 1.0)
        entity_density = min(entity_tokens / total_tokens, 1.0)

        penalty_factor = 1.0 - (self.lambda_vague * vagueness_ratio)
        bonus_factor = 1.0 + (self.lambda_ent * entity_density)
        final_multiplier = max(penalty_factor * bonus_factor, 0.05)

        return ContentQualityMetrics(
            total_tokens=total_tokens,
            entity_token_count=entity_tokens,
            buzzword_count=buzzword_matches,
            entity_density=round(entity_density, 4),
            vagueness_penalty=round(vagueness_ratio, 4),
            quality_multiplier=round(final_multiplier, 4),
        )
