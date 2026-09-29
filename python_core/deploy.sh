#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE DEPLOY AUTÔNOMO (GOOGLE ANTIGRAVITY AGENT)
# ==============================================================================
set -euo pipefail

echo "==> [Antigravity] 1. Configurando ambiente Python..."
python3 -m venv .venv
source .venv/bin/activate

echo "==> [Antigravity] 2. Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> [Antigravity] 3. Executando bateria de testes do Gold Standard..."
PYTHONPATH=. python3 -m unittest discover -s tests -t .

echo "==> [Antigravity] 4. Testes aprovados com sucesso!"
echo "==> [Antigravity] 5. Inicializando servidor web em http://0.0.0.0:8000"
exec uvicorn api.server:app --host 0.0.0.0 --port 8000
