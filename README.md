# 🌐 Semântico Entity Engine

> **A plataforma definitiva de inteligência ontológica, grafos de conhecimento e SEO semântico da Semântico SEO.**  
> Projetada para ajudar marcas, agências e profissionais a conceber, modelar, validar e exportar redes semânticas robustas preparadas para a era do **Google Search Generative Experience (SGE / AI Overviews)**, **Gemini**, **Perplexity** e LLMs.

---

## 🚀 Visão Geral

O **Semântico Entity Engine** une rigor ontológico (padrão SKOS/OWL e PoolParty) à agilidade de geração de conteúdo por Inteligência Artificial. A plataforma permite catalogar entidades, auditar autoridade tópica, reconciliar conceitos com a **Wikidata**, gerar grafos de conhecimento interativos e exportar marcações avançadas em **JSON-LD (Schema.org)**, **RDF Turtle**, **N-Triples**, **CSV** e **Markdown**.

### 🌟 Principais Recursos

- **🧠 Modelagem de Entidades & Geração por IA (Google Gemini 3.8/3.7 Flash):**
  - Criação individual ou em lote (batch) de entidades canônicas.
  - Geração de definições unívocas, tipos ontológicos Schema.org (ex: `DefinedTerm`, `TechArticle`, `Corporation`), sinônimos (`skos:altLabel`), termos mais amplos (`skos:broader`) e termos estreitos (`skos:narrower`).
  - Cálculo de saliência tópica (*Central*, *Suporte*, *Periférico*).
- **🌐 Grafo de Conhecimento Interativo (Knowledge Graph 2D/3D):**
  - Visualização em rede conectada das entidades e seus relacionamentos ontológicos (`sameAs`, `isRelatedTo`, `partOf`, `broader/narrower`).
  - Navegação dinâmica por nós, clusters semânticos e busca instantânea.
- **🔍 Reconciliação Automática com Wikidata & Wikipedia:**
  - Consulta à API oficial da Wikidata para mapeamento direto de QIDs (`sameAs`).
  - Extração de descrições canônicas, instâncias (`instance of`) e verificação de autoridade enciclopédica.
- **🔗 Motor de Interlinking Semântico & Detecção de Topic Gaps:**
  - Análise em tempo real de textos e artigos para inserção de links internos estratégicos para o glossário.
  - Algoritmo NLP de identificação de lacunas tópicas (*Topic Gaps*): termos citados no conteúdo que ainda não possuem página ou entidade catalogada.
- **📊 Auditoria de Autoridade Tópica (Topical Authority Audit):**
  - Diagnóstico completo do ecossistema: cálculo de Topical Authority Score (0 a 100), profundidade conceitual, maturidade de interlinking e checklist de conformidade ontológica.
- **📤 Exportações Multi-Formato Prontas para Produção:**
  - **Schema.org JSON-LD:** Formato otimizado com `@type: DefinedTermSet` e `@id` canônicos.
  - **Web Semântica:** RDF Turtle (`.ttl`) e RDF N-Triples (`.nt`).
  - **Planilhas & Documentação:** CSV e Markdown completo com metadados estruturados.
- **🔐 Autenticação Robusta & Gestão RBAC (Firebase Auth + Firestore):**
  - Login com 1 clique via Google (`signInWithPopup`) ou E-mail e Senha.
  - Super Administrador automático para `alexrodrigues43@gmail.com` com plano vitalício e privilégios totais.
  - Sistema de aprovação de novos usuários com listener reativo em tempo real (`onSnapshot`) e tela de paywall integrada.
- **🐍 Motor Python Desacoplado (`python_core/`):**
  - Suíte desacoplada pronta para execução no **Google Antigravity**, Docker ou Cloud Run.
  - Ranqueador semântico híbrido (*HybridSemanticRanker* com bi-encoders e penalização de fluff/jargões corporativos genéricos).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool e dev server ultra-rápido)
- **Tailwind CSS** (Design system limpo, responsivo e com dark theme)
- **Lucide Icons** (Ícones modernos e acessíveis)
- **Firebase Web SDK v11** (Authentication & Cloud Firestore)

### Backend (Node.js & Express)
- **Node.js** + **Express** (com middleware integrado do Vite)
- **@google/genai** (Integração oficial com Google Gemini 3.8 Flash e 3.7 Flash)
- **Cascata de Resiliência de IA** (Fallback automático para evitar 429 de quota ou descontinuação de modelos)

### Motor de IA / NLP (Python Core)
- **FastAPI** + **Uvicorn**
- **GLiNER / Zero-Shot NER**
- **Sentence-Transformers**
- **Pydantic v2**

---

## 📁 Estrutura do Repositório

```text
├── src/                          # Código-fonte da aplicação React
│   ├── components/               # Componentes modulares de UI
│   │   ├── AuthModal.tsx         # Modal de autenticação (Google 1-click & E-mail)
│   │   ├── BatchGeneratorModal.tsx # Gerador em lote com IA
│   │   ├── DefinitionsTable.tsx  # Tabela com busca, filtros e ações por entidade
│   │   ├── EntityDetailModal.tsx # Detalhamento, Schema.org e RDF por nó
│   │   ├── ExportModal.tsx       # Exportador (JSON-LD, Turtle, CSV, Markdown)
│   │   ├── InternalLinkingView.tsx # Motor de interlinking e detecção de topic gaps
│   │   ├── KnowledgeGraphView.tsx# Visualizador interativo do Grafo de Conhecimento
│   │   ├── Navbar.tsx            # Barra de navegação e status do usuário
│   │   ├── SubscriptionPaywallModal.tsx # Paywall com aprovação de planos
│   │   ├── TopicalAuditModal.tsx # Auditoria e métricas de Topical Authority
│   │   └── WikidataReconcileModal.tsx # Reconciliação direta com Wikidata
│   ├── data/
│   │   └── defaultDefinitions.ts # Base ontológica pré-carregada (Topical Authority SOTA)
│   ├── lib/
│   │   └── firebase.ts           # Configuração de Auth, Firestore e sync de perfis
│   ├── types.ts                  # Contratos TypeScript completos
│   ├── App.tsx                   # Componente raiz e sincronização de estados
│   └── main.tsx                  # Ponto de entrada do React
├── python_core/                  # Motor Python desacoplado (Google Antigravity)
│   ├── api/                      # Servidor FastAPI
│   ├── config/                   # Diretrizes semânticas (prompts.yaml)
│   ├── extractor/                # Zero-shot Named Entity Recognition
│   ├── pipeline/                 # Ranqueador híbrido vetorial + ontológico
│   ├── scoring/                  # Métrica matemática de densidade informacional
│   ├── tests/                    # Testes automatizados do Gold Standard
│   ├── Dockerfile                # Container para Cloud Run / Servidor
│   └── deploy.sh                 # Script autônomo de execução
├── server.ts                     # Servidor Express com rotas de API e proxy Gemini
├── firestore.rules               # Regras de segurança RBAC do banco de dados
├── firebase-blueprint.json       # Esquema oficial de coleções do Firebase
├── REPLICACAO_AUTENTICACAO_FIREBASE.md # Guia técnico de replicação para outros apps
└── package.json                  # Dependências e scripts do projeto
```

---

## ⚡ Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- Chave de API do **Google Gemini** (`GEMINI_API_KEY`) no arquivo `.env`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/semantico-entity-engine.git
   cd semantico-entity-engine
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Preencha sua chave da API do Gemini:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   PORT=3000
   ```

4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

5. **Build de Produção:**
   ```bash
   npm run build
   npm start
   ```

---

## 🤖 Executando o Motor Python (Opcional / Google Antigravity)

Caso deseje executar os módulos avançados de ranqueamento ontológico em Python:

```bash
cd python_core
./deploy.sh
```
Ou via Docker:
```bash
docker build -t semantic-engine python_core/
docker run -p 8000:8000 semantic-engine
```

Os testes automatizados podem ser executados com:
```bash
PYTHONPATH=. python3 -m unittest discover -s python_core/tests -t python_core
```

---

## 🛡️ Segurança & Perfis de Usuário (RBAC)

A plataforma possui um sistema de governança de dados estruturado em **Firestore Rules**:
- **Super Admin (`alexrodrigues43@gmail.com`):** Acesso vitalício automático com permissões para editar diretrizes, deletar entidades e gerenciar aprovações de clientes.
- **Novos Usuários:** Registram-se com status `pending` e têm acesso liberado em tempo real assim que validados pelo administrador.

---

## 📄 Licença & Créditos

Desenvolvido pela equipe da **Semântico SEO**.  
Todos os direitos reservados.
