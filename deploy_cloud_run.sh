#!/usr/bin/env bash
# ==============================================================================
# Script de Deploy Automatizado para o Google Cloud Run (Gerador de Glossário de Entidades)
# Baseado no playbook oficial do ecossistema Semântico: cloud-run-domain-and-rbac
# ==============================================================================

set -e

PROJECT_ID=${1:-"blogsemantico-1750525854725"}
REGION=${2:-"us-central1"}
SERVICE_NAME="semantico-glossario-entidades"
CUSTOM_DOMAIN="glossario-entidades.semantico.com.br"

echo "🚀 Iniciando rotina de deploy no Google Cloud Run..."
echo "👉 Serviço:          $SERVICE_NAME"
echo "👉 Projeto GCP:      $PROJECT_ID"
echo "👉 Região:           $REGION"
echo "👉 Subdomínio CNAME: $CUSTOM_DOMAIN"
echo ""

# 1. Carregar variáveis com segurança a partir de .env
API_KEY_FROM_ENV=""
ADMIN_PASS_FROM_ENV=""
BETA_PASS_FROM_ENV=""

if [ -f .env ]; then
  API_KEY_FROM_ENV=$(grep "^GEMINI_API_KEY=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  ADMIN_PASS_FROM_ENV=$(grep "^ADMIN_PASSWORD=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  BETA_PASS_FROM_ENV=$(grep "^BETA_PASSCODES=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
fi

API_KEY=${GEMINI_API_KEY:-$API_KEY_FROM_ENV}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-$ADMIN_PASS_FROM_ENV}
BETA_PASSCODES=${BETA_PASSCODES:-$BETA_PASS_FROM_ENV}

# Gerar arquivo de variáveis YAML seguro para o gcloud run deploy
trap 'rm -f env.yaml' EXIT

cat <<EOF > env.yaml
NODE_ENV: "production"
DEFAULT_MODEL: "gemini-3.8-flash"
APP_URL: "https://${CUSTOM_DOMAIN}"
EOF

if [ -n "$API_KEY" ]; then
  echo "🔑 GEMINI_API_KEY configurada."
  echo "GEMINI_API_KEY: \"$API_KEY\"" >> env.yaml
fi

if [ -n "$ADMIN_PASSWORD" ]; then
  echo "🛡️ ADMIN_PASSWORD configurada."
  echo "ADMIN_PASSWORD: \"$ADMIN_PASSWORD\"" >> env.yaml
fi

if [ -n "$BETA_PASSCODES" ]; then
  echo "🎫 BETA_PASSCODES configuradas."
  echo "BETA_PASSCODES: \"$BETA_PASSCODES\"" >> env.yaml
fi

# 2. Deploy do container via Cloud Build
echo ""
echo "🔨 Compilando container com Cloud Build e provisionando no Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300 \
  --quiet \
  --env-vars-file=env.yaml

echo ""
echo "✅ Serviço provisionado com sucesso no Cloud Run!"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format="value(status.url)")
echo "🌐 URL Direta Cloud Run: $SERVICE_URL"

# 3. Autorização automática de domínios no Firebase Authentication
echo ""
echo "🔐 Autorizando domínios no Firebase Authentication (eliminando auth/unauthorized-domain)..."
python3 ./authorize_firebase_domain.py "$SERVICE_URL" "$PROJECT_ID" || true
python3 ./authorize_firebase_domain.py "$CUSTOM_DOMAIN" "$PROJECT_ID" || true

echo ""
echo "=============================================================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=============================================================================="
echo "👉 URL Direta:       $SERVICE_URL"
echo "👉 Subdomínio Final: https://$CUSTOM_DOMAIN"
echo ""
echo "📌 PRÓXIMOS PASSOS PARA ATIVAÇÃO DO SUBDOMÍNIO NA HOSPEDAGEM (DNS):"
echo "1. No painel da sua hospedagem (cPanel / Névoa / Cloudflare), certifique-se de que:"
echo "   - Tipo:  CNAME"
echo "   - Nome:  glossario-entidades"
echo "   - Valor: ghs.googlehosted.com."
echo ""
echo "2. Para criar o mapeamento no Cloud Run Console:"
echo "   Acesse: https://console.cloud.google.com/run/domains?project=$PROJECT_ID"
echo "   Clique em 'Adicionar mapeamento' e associe '$CUSTOM_DOMAIN' ao serviço '$SERVICE_NAME'."
echo "=============================================================================="
