# 🧠 Motor Semântico & NER Rigoroso (Antigravity Ready)

Módulo em Python desacoplado para ranqueamento de alta precisão semântica com penalização de vagueza e extração ontológica estilo PoolParty.

## 📁 Estrutura de Diretórios

```text
python_core/
├── config/
│   └── prompts.yaml          # Diretrizes ontológicas e few-shots
├── scoring/
│   └── quality.py            # InformationDensityScorer (Fluff Penalty & Bônus de Entidades)
├── extractor/
│   └── semantic_ner.py       # SemanticEntityExtractor (Zero-Shot GLiNER)
├── pipeline/
│   └── hybrid_ranker.py      # HybridSemanticRanker (Vetor + NER + Qualidade)
├── tests/
│   └── test_gold_standard.py # Suíte de validação automatizada (Gold Standard)
└── requirements.txt          # Dependências limpas para ambiente Linux
```

## 🚀 Como Executar pelo Antigravity

1. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Rodar a Suíte de Testes Automatizada:**
   ```bash
   python -m unittest discover -s tests -t .
   ```

3. **Executar o Ranqueador Híbrido:**
   ```python
   from pipeline.hybrid_ranker import HybridSemanticRanker, CandidateChunk

   ranker = HybridSemanticRanker()
   chunks = [
       CandidateChunk(id="1", text="Texto com alta densidade de entidades..."),
       CandidateChunk(id="2", text="Texto vago com jargões corporativos holísticos...")
   ]
   results = ranker.rank("minha intenção de busca", chunks)
   print(results)
   ```
