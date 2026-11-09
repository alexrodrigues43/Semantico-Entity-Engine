#!/usr/bin/env python3
"""
Utilitário de Automação para Autorização de Domínios no Firebase Authentication / Google Identity Platform.
Uso:
    python3 authorize_firebase_domain.py <DOMINIO_OU_URL> [FIREBASE_PROJECT_ID]

Exemplos:
    python3 authorize_firebase_domain.py glossario-entidades.semantico.com.br
    python3 authorize_firebase_domain.py https://glossario-entidades-xxxxx.us-central1.run.app
"""

import sys
import subprocess
import json
import re

DEFAULT_FIREBASE_PROJECT = "blogsemantico-1750525854725"

def clean_domain(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r'^https?://', '', cleaned)
    cleaned = cleaned.split('/')[0]
    cleaned = cleaned.split(':')[0]
    return cleaned.lower()

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 authorize_firebase_domain.py <DOMINIO_OU_URL> [FIREBASE_PROJECT_ID]")
        sys.exit(1)

    target_domain = clean_domain(sys.argv[1])
    firebase_project = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_FIREBASE_PROJECT

    if not target_domain:
        print("❌ Erro: Domínio inválido.")
        sys.exit(1)

    print(f"🔍 Consultando domínios autorizados no Firebase ({firebase_project})...")
    
    try:
        token = subprocess.check_output(['gcloud', 'auth', 'print-access-token']).decode().strip()
    except Exception as e:
        print(f"❌ Erro ao obter token do gcloud: {e}")
        print("Certifique-se de que o gcloud está autenticado ('gcloud auth login').")
        sys.exit(1)

    # 1. Obter configuração atual
    get_cmd = [
        'curl', '-s',
        '-H', f'Authorization: Bearer {token}',
        '-H', f'x-goog-user-project: {firebase_project}',
        f'https://identitytoolkit.googleapis.com/admin/v2/projects/{firebase_project}/config'
    ]

    try:
        res = subprocess.check_output(get_cmd)
        config = json.loads(res.decode())
    except Exception as e:
        print(f"❌ Erro ao consultar Identity Toolkit API: {e}")
        sys.exit(1)

    if 'error' in config:
        print(f"❌ Erro retornado pela API: {config['error'].get('message', config['error'])}")
        sys.exit(1)

    domains = config.get('authorizedDomains', [])
    print(f"📋 Total de domínios cadastrados atualmente: {len(domains)}")

    if target_domain in domains:
        print(f"✅ O domínio '{target_domain}' já está na lista de domínios autorizados!")
        return

    domains.append(target_domain)
    payload = json.dumps({'authorizedDomains': domains})

    # 2. Aplicar PATCH
    patch_cmd = [
        'curl', '-s', '-X', 'PATCH',
        '-H', f'Authorization: Bearer {token}',
        '-H', f'x-goog-user-project: {firebase_project}',
        '-H', 'Content-Type: application/json',
        '-d', payload,
        f'https://identitytoolkit.googleapis.com/admin/v2/projects/{firebase_project}/config?updateMask=authorizedDomains'
    ]

    print(f"🚀 Adicionando '{target_domain}' aos domínios autorizados...")
    try:
        patch_res = subprocess.check_output(patch_cmd)
        patch_json = json.loads(patch_res.decode())
    except Exception as e:
        print(f"❌ Falha ao aplicar atualização: {e}")
        sys.exit(1)

    if target_domain in patch_json.get('authorizedDomains', []):
        print(f"🎉 Sucesso! '{target_domain}' foi autorizado com sucesso no Firebase.")
        print("👉 Usuários já podem fazer login via Google Sign-In nesta URL sem o erro auth/unauthorized-domain.")
    else:
        print("⚠️ Não foi possível confirmar a adição do domínio. Resposta da API:")
        print(patch_json)

if __name__ == '__main__':
    main()
