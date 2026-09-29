"""
Suíte de testes de estresse (Gold Standard) compatível com unittest e pytest.
Executável de forma autônoma pelo agente Antigravity.
"""
import unittest
from scoring.quality import InformationDensityScorer

class TestSemanticQuality(unittest.TestCase):
    def setUp(self):
        self.scorer = InformationDensityScorer()

    def test_vagueness_penalty_on_fluff_text(self):
        fluff_text = (
            "Nossa estratégia visa potencializar e alavancar sinergias corporativas holísticas, "
            "promovendo disrupção no ecossistema por meio de uma governança centrada no valor do cliente "
            "e em frameworks ágeis de excelência operacional."
        )
        # Poucas ou nenhuma entidade concreta
        metrics = self.scorer.evaluate(fluff_text, entity_tokens=0)
        
        self.assertGreaterEqual(metrics.buzzword_count, 3)
        self.assertGreater(metrics.vagueness_penalty, 0.4)
        self.assertLess(metrics.quality_multiplier, 0.85, "Texto vago deve sofrer penalidade sensível no multiplicador")

    def test_concrete_technical_text_reward(self):
        tech_text = (
            "O Banco Central do Brasil manteve a taxa Selic em 10,50% a.a. através do Copom, "
            "analisando a projeção de inflação do IPCA em Brasília."
        )
        # Várias entidades concretas (Banco Central do Brasil, Selic, Copom, IPCA, Brasília)
        metrics = self.scorer.evaluate(tech_text, entity_tokens=12)
        
        self.assertEqual(metrics.buzzword_count, 0)
        self.assertEqual(metrics.vagueness_penalty, 0.0)
        self.assertGreater(metrics.entity_density, 0.35)
        self.assertGreater(metrics.quality_multiplier, 1.10, "Texto denso em entidades concretas deve receber bônus")

if __name__ == "__main__":
    unittest.main()
