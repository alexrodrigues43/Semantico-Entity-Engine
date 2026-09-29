import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini AI client initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave GEMINI_API_KEY não foi encontrada nas configurações do ambiente.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback cascade helper for Gemini calls to avoid 429 quota blockages and model deprecation errors
async function callGeminiWithCascade(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: any,
  config: any
): Promise<{ response: any; modelUsed: string }> {
  // Normalize model identifier to current valid model tags
  const normalizeModel = (m: string) => {
    if (!m || m === "gemini-2.5-flash" || m === "gemini-3.1-pro-preview" || m === "gemini-3.1-pro") {
      return "gemini-3.8-flash";
    }
    return m;
  };

  // Ordered sequence of fallback models prioritized for high rate-limits & availability
  const rawTarget = normalizeModel(primaryModel);
  const modelChain = [
    rawTarget,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelChain) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const isQuotaError =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.message?.includes("429") ||
        err?.message?.includes("503") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("Quota exceeded") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("not found") ||
        err?.message?.includes("no longer available");

      console.warn(
        `[Gemini AI] Falha no modelo ${model} (${err?.message || "Erro desconhecido"}). Tentando próximo fallback...`
      );

      // If it's a 503 high demand or quota or deprecated model, continue down the cascade immediately
      if (model === modelChain[modelChain.length - 1]) {
        break;
      }
    }
  }

  throw lastError;
}

// Rule-based NLP Entity Extractor Fallback (Executes locally if API hits quota)
function extractEntitiesLocally(text: string, maxEntities: number = 15) {
  const cleanText = text.replace(/<[^>]*>/g, " ");

  // Stopwords in Portuguese & English to ignore
  const stopwords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "da", "do", "das", "dos",
    "em", "na", "no", "nas", "nos", "por", "para", "com", "sem", "sob", "sobre",
    "como", "quando", "onde", "porque", "pois", "que", "se", "mas", "porém", "contudo",
    "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas", "aquele", "aquela",
    "isto", "isso", "aquilo", "seu", "sua", "seus", "suas", "meu", "minha", "ele", "ela",
    "eles", "elas", "nós", "você", "vocês", "diferente", "outro", "outra", "outros", "outras",
    "além", "também", "apenas", "muito", "pouco", "mais", "menos", "grande", "pequeno",
    "no", "na", "centro", "dessa", "desse", "disso", "deste", "desta", "para", "pela", "pelo",
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of"
  ]);

  const candidatesMap = new Map<string, { count: number; category: string; relevance: string }>();

  // Helper to categorize term
  function categorizeTerm(term: string): string {
    const t = term.toLowerCase();
    if (t.includes("seo") || t.includes("search") || t.includes("busca") || t.includes("topical") || t.includes("cluster") || t.includes("pilar") || t.includes("ranking") || t.includes("serp") || t.includes("lsi") || t.includes("keyword") || t.includes("e-e-a-t")) {
      return "SEO Semântico";
    }
    if (t.includes("schema") || t.includes("json-ld") || t.includes("rdf") || t.includes("triplet") || t.includes("linked data") || t.includes("definedterm") || t.includes("w3c") || t.includes("uri") || t.includes("iri") || t.includes("dados estruturados")) {
      return "Estrutura de Dados & Schema.org";
    }
    if (t.includes("graph") || t.includes("grafo") || t.includes("knowledge") || t.includes("ontolog") || t.includes("entidade") || t.includes("taxonomia") || t.includes("semântic")) {
      return "Knowledge Graph & Ontologia";
    }
    if (t.includes("nlp") || t.includes("ai") || t.includes("ia") || t.includes("inteligência") || t.includes("mum") || t.includes("rankbrain") || t.includes("gemini") || t.includes("learning") || t.includes("neural") || t.includes("modelo")) {
      return "Inteligência Artificial & NLP";
    }
    if (t.includes("web") || t.includes("http") || t.includes("html") || t.includes("site") || t.includes("api") || t.includes("domínio") || t.includes("url")) {
      return "Tecnologia da Web";
    }
    return "Arquitetura da Informação";
  }

  // 1. Multi-word Title Case Entities (e.g., "Semantic Search Engine Optimization", "Google Knowledge Graph", "Topical Authority")
  const multiWordRegex = /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç0-9\.\-]+(?:\s+(?:de|da|do|das|dos|e|ou|para|em|por|of|and|the|in|for|on)\s+|\s+)[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç0-9\.\-]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç0-9\.\-]+)*)\b/g;
  let match: RegExpExecArray | null;
  while ((match = multiWordRegex.exec(cleanText)) !== null) {
    const term = match[1].trim();
    if (term.length >= 4 && term.split(" ").length <= 5) {
      const firstWord = term.split(" ")[0].toLowerCase();
      if (!stopwords.has(firstWord) || term.split(" ").length > 2) {
        const item = candidatesMap.get(term) || {
          count: 0,
          category: categorizeTerm(term),
          relevance: `Entidade composta de alta relevância no texto.`,
        };
        item.count += 3; // weight multi-words higher
        candidatesMap.set(term, item);
      }
    }
  }

  // 2. Technical Acronyms and Mixed Case terms (e.g. SEO, RDF, JSON-LD, NLP, LSI, E-E-A-T, W3C, Schema.org)
  const acronymRegex = /\b([A-Z0-9]{2,8}(?:[\-\.][A-Z0-9a-z]+)*|Schema\.org|DefinedTerm|FAQPage|Topic Clusters|Knowledge Graph|Linked Data|Páginas Pilares)\b/g;
  while ((match = acronymRegex.exec(cleanText)) !== null) {
    const term = match[1].trim();
    if (term.length >= 2 && !stopwords.has(term.toLowerCase())) {
      const item = candidatesMap.get(term) || {
        count: 0,
        category: categorizeTerm(term),
        relevance: `Termo técnico/padrão identificado diretamente no texto.`,
      };
      item.count += 2;
      candidatesMap.set(term, item);
    }
  }

  // 3. Quoted or Parenthesized Concepts
  const quotedRegex = /["'“‘\(\[]([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^"'”’\)\]]{2,40})["'”’\)\]]/g;
  while ((match = quotedRegex.exec(cleanText)) !== null) {
    const term = match[1].trim();
    if (term.length >= 3 && !stopwords.has(term.toLowerCase())) {
      const item = candidatesMap.get(term) || {
        count: 0,
        category: categorizeTerm(term),
        relevance: `Conceito destacado entre aspas ou parênteses no texto.`,
      };
      item.count += 2;
      candidatesMap.set(term, item);
    }
  }

  // Sort by frequency and prominence and calculate Salience Score (0 to 100)
  const maxCount = Math.max(...Array.from(candidatesMap.values()).map((v) => v.count), 1);
  const sorted = Array.from(candidatesMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, maxEntities)
    .map(([entity, data], index) => {
      // Salience algorithm: combines normalized frequency, rank position and multi-word title-case bonus
      const freqFactor = (data.count / maxCount) * 60;
      const rankFactor = Math.max(0, 35 - index * 2.5);
      const isMultiWord = entity.split(" ").length > 1 ? 5 : 0;
      const salienceScore = Math.min(99, Math.max(15, Math.round(freqFactor + rankFactor + isMultiWord)));
      const salienceLevel: "central" | "supporting" | "peripheral" =
        salienceScore >= 65 ? "central" : salienceScore >= 40 ? "supporting" : "peripheral";

      return {
        entity,
        category: data.category,
        relevance: data.relevance,
        salienceScore,
        salienceLevel,
        shortDefinition: `Conceito fundamental de ${data.category} identificado no discurso textual.`,
      };
    });

  // Generate concise 1-paragraph summary locally from text
  const sentences = cleanText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
  const summary = sentences.slice(0, 2).join(" ") || "Artigo sobre SEO Semântico, entidades e autoridade tópica.";

  return {
    entities: sorted,
    summary,
    totalExtracted: sorted.length,
    isLocalFallback: true,
  };
}

// Rule-based Relationship Suggester Fallback
function suggestRelationshipsLocally(entities: any[], focusCategory: string = "all", maxSuggestions: number = 12) {
  const suggestions: any[] = [];
  const count = entities.length;

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const source = entities[i];
      const target = entities[j];

      if (focusCategory !== "all" && source.category !== focusCategory && target.category !== focusCategory) {
        continue;
      }

      const sName = source.entity.toLowerCase();
      const tName = target.entity.toLowerCase();

      let predicate = "";
      let relType: "hierarchical" | "methodological" | "causal" | "associative" | "equivalence" = "associative";
      let confidence = 85;
      let reasoning = `Conexão semântica estabelecida entre ${source.entity} e ${target.entity}.`;

      if (sName.includes("seo") && tName.includes("schema")) {
        predicate = "utilizaEstruturaDe";
        relType = "methodological";
        confidence = 96;
        reasoning = "O SEO Semântico utiliza o vocabulário Schema.org para comunicação estruturada com buscadores.";
      } else if (sName.includes("graph") && tName.includes("entidade")) {
        predicate = "armazena";
        relType = "hierarchical";
        confidence = 95;
        reasoning = "Knowledge Graphs são estruturados diretamente através de Entidades e suas relações ontológicas.";
      } else if (sName.includes("cluster") && (tName.includes("pilar") || tName.includes("pillar"))) {
        predicate = "organizaEmTornoDe";
        relType = "hierarchical";
        confidence = 94;
        reasoning = "Topic clusters estruturam o conteúdo satélite ao redor da Página Pilar central.";
      } else if (sName.includes("seo") && tName.includes("graph")) {
        predicate = "alimenta";
        relType = "causal";
        confidence = 92;
        reasoning = "Estratégias de SEO semântico aumentam a representação de marcas no Knowledge Graph do Google.";
      } else if (source.category === target.category) {
        predicate = "pertenceAoMesmoDominioDe";
        relType = "associative";
        confidence = 88;
        reasoning = `Ambas as entidades compartilham a mesma categoria temática (${source.category}).`;
      } else {
        predicate = "relacionadoCom";
        relType = "associative";
        confidence = 80;
        reasoning = `Relação de co-ocorrência conceitual entre ${source.entity} e ${target.entity}.`;
      }

      if (predicate && suggestions.length < maxSuggestions) {
        suggestions.push({
          id: `sug-local-${Date.now()}-${i}-${j}`,
          sourceEntity: source.entity,
          predicate,
          targetEntity: target.entity,
          relationshipType: relType,
          confidence,
          reasoning,
          schemaProperty: "isRelatedTo",
          status: "pending",
        });
      }
    }
  }

  return {
    suggestedRelationships: suggestions,
    strategicInsight: "Conexões ontológicas geradas através de análise de clusters e co-ocorrência semântica local.",
    detectedClusters: Array.from(new Set(entities.map((e) => e.category || "Geral"))),
    graphHealthScore: 82,
    totalAnalyzed: entities.length,
    modelUsed: "local-heuristic-engine",
    isLocalFallback: true,
  };
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Definition Generation Endpoint
app.post("/api/seo-definitions/generate", async (req, res) => {
  try {
    const {
      entity,
      category,
      context = "",
      customPromptTemplate = "",
      model = "gemini-3.7-flash",
      tone = "enciclopédico e autoritativo",
      length = "standard", // "concise" | "standard" | "detailed"
      language = "pt-BR",
    } = req.body;

    if (!entity || typeof entity !== "string" || !entity.trim()) {
      return res.status(400).json({ error: "O campo 'entity' (entidade) é obrigatório." });
    }

    const ai = getGeminiClient();

    const lengthGuide =
      length === "concise"
        ? "Definição concisa e direta (aprox. 1 a 2 parágrafos, 80-120 palavras), ideal para snippets e respostas diretas."
        : length === "detailed"
        ? "Definição abrangente e aprofundada (3 a 5 parágrafos, 250-400 palavras), cobrindo conceito nuclear, funcionamento/metodologia, relevância técnica para SEO/Web Semântica, aplicações práticas e relação com outras entidades."
        : "Definição estruturada padrão para SEO Semântico (2 a 4 parágrafos bem pontuados, 150-250 palavras), abordando conceito central, contexto prático, importância e diferenciais.";

    const defaultSystemPrompt = `Você é o maior especialista mundial em SEO Semântico, Ontologias, Web Semântica, Knowledge Graphs e Arquitetura de Informação para Mecanismos de Busca (Google Search).
Seu objetivo é gerar uma definição semântica definitiva e otimizada de alta autoridade (E-E-A-T) para a entidade fornecida.

Diretrizes obrigatórias para a Definição:
1. Inicie com a fórmula clássica ontológica de definição semântica clara e direta: [Entidade] é [classe/categoria superior] que [característica diferenciadora / propósito essencial].
2. Desenvolva o significado em linguagem natural, precisa e rica em termos semanticamente relacionados e entidades correlatas (co-ocorrências e n-grams contextuais).
3. Aborde a relação e relevância da entidade no ecossistema de SEO / Tecnologia / Web Semântica / Negócios.
4. Mantenha tom ${tone}.
5. ${lengthGuide}
6. Não use jargões vazios ou enrolação. Toda frase deve adicionar valor informacional factual e claro.
7. Identifique fontes de autoridade reais ou referências primárias conhecidas (ex: W3C, Wikipedia, Google Developers, Rock Content, Schema.org, Stanford, MDN, etc.) com links/URLs factuais.`;

    let userPrompt = "";
    if (customPromptTemplate && customPromptTemplate.trim()) {
      userPrompt = customPromptTemplate
        .replace(/{entity}/g, entity)
        .replace(/{category}/g, category || "Auto-detectar")
        .replace(/{context}/g, context || "")
        .replace(/{tone}/g, tone)
        .replace(/{language}/g, language);
    } else {
      userPrompt = `Gere a definição semântica completa para a seguinte entidade:
Entidade: "${entity}"
Categoria sugerida: "${category || "Auto-detectar categoria temática ideal"}"
${context ? `Contexto complementar / nicho do projeto: "${context}"` : ""}
Idioma de saída: ${language}

Retorne os seguintes dados estruturados:
- category: A categoria temática refinada e precisa (ex: "Tecnologia da Web", "Marketing Digital", "Ciência de Dados", etc.)
- definition: O texto completo da definição formatado em parágrafos limpos.
- shortSummary: Um resumo direto de 1 frase (fórmula de definição rápida para Featured Snippet / meta description).
- sources: Lista de 1 a 3 URLs de fontes primárias ou de alta autoridade sobre o tema.
- semanticTriplets: Lista de 2 a 4 tripletos semânticos RDF (sujeito, predicado, objeto) relacionando esta entidade com outras entidades do conhecimento.
- lsiKeywords: 4 a 8 termos semanticamente relacionados e entidades co-ocorrentes essenciais que fortalecem a autoridade tópica.
- schemaType: Tipo de Schema.org mais apropriado (ex: "DefinedTerm", "TechArticle", "Thing", "SoftwareApplication", "Concept").
- jsonLd: Objeto JSON-LD Schema.org válido do tipo DefinedTerm ou apropriado representando esta definição.`;
    }

    const config: any = {
      systemInstruction: defaultSystemPrompt,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Categoria temática da entidade",
          },
          definition: {
            type: Type.STRING,
            description: "Texto completo da definição semântica em parágrafos",
          },
          shortSummary: {
            type: Type.STRING,
            description: "Resumo executivo de uma única frase ontológica",
          },
          sources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Links de fontes de alta autoridade",
          },
          semanticTriplets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                predicate: { type: Type.STRING },
                object: { type: Type.STRING },
              },
              required: ["subject", "predicate", "object"],
            },
            description: "Tripletos semânticos (Sujeito -> Predicado -> Objeto)",
          },
          lsiKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Palavras-chave e entidades semanticamente ligadas",
          },
          schemaType: {
            type: Type.STRING,
            description: "Tipo de Schema.org recomendado",
          },
          jsonLdString: {
            type: Type.STRING,
            description: "Código JSON-LD Schema.org completo formatado como string",
          },
        },
        required: ["category", "definition", "sources"],
      },
    };

    const { response, modelUsed } = await callGeminiWithCascade(
      ai,
      model || "gemini-3.7-flash",
      userPrompt,
      config
    );

    const rawText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch (err) {
      console.error("Erro ao fazer parse do JSON do modelo:", err, rawText);
      parsedData = {
        category: category || "Geral",
        definition: rawText,
        sources: [],
      };
    }

    // Generate fallback JSON-LD if not provided
    let jsonLdObj: any = null;
    if (parsedData.jsonLdString) {
      try {
        jsonLdObj = JSON.parse(parsedData.jsonLdString);
      } catch (e) {
        jsonLdObj = {
          "@context": "https://schema.org",
          "@type": parsedData.schemaType || "DefinedTerm",
          name: entity,
          description: parsedData.shortSummary || (parsedData.definition || "").slice(0, 160),
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `Glossário de ${parsedData.category || "SEO Semântico"}`,
          },
        };
      }
    } else {
      jsonLdObj = {
        "@context": "https://schema.org",
        "@type": parsedData.schemaType || "DefinedTerm",
        name: entity,
        description: parsedData.shortSummary || (parsedData.definition || "").slice(0, 160),
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: `Glossário de ${parsedData.category || "SEO Semântico"}`,
        },
      };
    }

    // High-Authority Dual Entity Linking: inject Wikidata and Google Knowledge Graph URIs into sameAs
    const sameAsList: string[] = [];
    if (req.body.wikidataUrl) sameAsList.push(req.body.wikidataUrl);
    else if (req.body.wikidataId) sameAsList.push(`https://www.wikidata.org/wiki/${req.body.wikidataId}`);
    
    const googleMid = req.body.googleMid || parsedData.googleMid;
    const googleKgUrl = req.body.googleKgUrl || (googleMid ? `https://www.google.com/search?kgmid=${encodeURIComponent(googleMid)}` : null);
    if (googleKgUrl && !sameAsList.includes(googleKgUrl)) sameAsList.push(googleKgUrl);

    if (Array.isArray(parsedData.sameAs)) {
      for (const s of parsedData.sameAs) {
        if (!sameAsList.includes(s)) sameAsList.push(s);
      }
    }
    if (Array.isArray(jsonLdObj.sameAs)) {
      for (const s of jsonLdObj.sameAs) {
        if (!sameAsList.includes(s)) sameAsList.push(s);
      }
    }
    if (sameAsList.length > 0) {
      jsonLdObj.sameAs = sameAsList;
    }

    const salienceScore = typeof req.body.salienceScore === "number" ? req.body.salienceScore : 88;
    const salienceLevel = req.body.salienceLevel || (salienceScore >= 65 ? "central" : salienceScore >= 40 ? "supporting" : "peripheral");

    res.json({
      entity,
      category: parsedData.category || category || "Geral",
      definition: parsedData.definition,
      shortSummary: parsedData.shortSummary || "",
      sources: parsedData.sources || [],
      sourcesString: Array.isArray(parsedData.sources) ? parsedData.sources.join(", ") : String(parsedData.sources || ""),
      semanticTriplets: parsedData.semanticTriplets || [],
      lsiKeywords: parsedData.lsiKeywords || [],
      schemaType: parsedData.schemaType || "DefinedTerm",
      jsonLd: jsonLdObj,
      sameAs: sameAsList,
      wikidataId: req.body.wikidataId || null,
      wikidataUrl: req.body.wikidataUrl || null,
      googleMid: googleMid || null,
      googleKgUrl: googleKgUrl || null,
      salienceScore,
      salienceLevel,
      modelUsed: modelUsed,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/generate:", error);
    const is429 = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    res.status(is429 ? 429 : 500).json({
      error: is429
        ? "Limite de requisições por minuto do Gemini atingido temporariamente. Aguarde alguns segundos e tente novamente."
        : error?.message || "Ocorreu um erro ao gerar a definição semântica.",
      isQuotaError: is429,
    });
  }
});

// Entity Extractor from Article/Text Endpoint with Multi-Model Fallback + Salience Scoring + Local NLP Guarantee
app.post("/api/seo-definitions/extract-entities", async (req, res) => {
  try {
    const { text, maxEntities = 15, model = "gemini-3.7-flash" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "O texto para extração é obrigatório." });
    }

    let entitiesResult: any = null;

    try {
      const ai = getGeminiClient();
      const prompt = `Você é um especialista de elite em Processamento de Linguagem Natural (NLP), Named Entity Recognition (NER), Algoritmos de Salência (estilo Google Cloud Natural Language API) e SEO Semântico.

Analise minuciosamente o seguinte texto e extraia entre 5 e ${Math.max(5, maxEntities)} entidades essenciais, conceitos ontológicos e tópicos fundamentais presentes no texto.

DIRETRIZES DE RIGOR SEMÂNTICO E DESAMBIGUAÇÃO (PADRÃO POOLPARTY / KNOWLEDGE GRAPH):
1. DESAMBIGUAÇÃO CONTEXTUAL: Mitigue homônimos e polissemia através da vizinhança de tokens (ex: diferencie Apple empresa de maçã fruta; Amazon empresa de Amazonas estado; Java linguagem de Java café; BCB/autoridade monetária).
2. NOME CANÔNICO (canonicalName): Normalize para a forma de autoridade ou entrada enciclopédica (ex: "Banco Central do Brasil", "Java (linguagem de programação)").
3. JUSTIFICATIVA DE DESAMBIGUAÇÃO (disambiguationContext): Explique em 1 frase curta a pista contextual que confirmou a classificação (ex: "Identificado como linguagem de programação pela coocorrência de 'compilava microsserviço'").
4. SALÊNCIA: Atribua escore de 0 a 100 e nível ("central" >= 65, "supporting" 40-64, "peripheral" < 40).
5. PENALIZAÇÃO DE FLUFF/JARGÕES: Termos excessivamente vagos ou buzzwords desprovidos de referência factual (como "sinergia holística", "disrupção do ecossistema") DEVEM ser categorizados como periféricos com baixa salência ou descartados em favor de conceitos substantivos.

Texto para análise:
"""
${text.slice(0, 60000)}
"""`;

      const { response, modelUsed } = await callGeminiWithCascade(
        ai,
        model || "gemini-3.7-flash",
        prompt,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    entity: {
                      type: Type.STRING,
                      description: "Nome canônico da entidade identificada",
                    },
                    category: {
                      type: Type.STRING,
                      description: "Categoria temática contextual sugerida",
                    },
                    relevance: {
                      type: Type.STRING,
                      description: "Explicação objetiva da relevância no texto",
                    },
                    salienceScore: {
                      type: Type.NUMBER,
                      description: "Escore de salência semântica de 0 a 100",
                    },
                    salienceLevel: {
                      type: Type.STRING,
                      enum: ["central", "supporting", "peripheral"],
                      description: "Nível de centralidade da entidade no discurso",
                    },
                    shortDefinition: {
                      type: Type.STRING,
                      description: "Breve definição contextual de 1 frase",
                    },
                    canonicalName: {
                      type: Type.STRING,
                      description: "Forma normalizada/canônica no padrão ontológico",
                    },
                    disambiguationContext: {
                      type: Type.STRING,
                      description: "Justificativa semântica de contexto que mitigou ambiguidade",
                    },
                  },
                  required: ["entity", "category", "salienceScore", "salienceLevel"],
                },
              },
              summary: {
                type: Type.STRING,
                description: "Resumo em 1 parágrafo do tema central do artigo analisado",
              },
            },
            required: ["entities"],
          },
        }
      );

      let rawText = response.text || "";
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }

      let entitiesList: Array<any> = [];
      if (Array.isArray(parsed)) {
        entitiesList = parsed;
      } else if (parsed && Array.isArray(parsed.entities)) {
        entitiesList = parsed.entities;
      } else if (parsed && typeof parsed === "object") {
        const possibleArray = Object.values(parsed).find((val) => Array.isArray(val));
        if (possibleArray) entitiesList = possibleArray as any[];
      }

      const sanitizedEntities = entitiesList
        .filter((e) => e && typeof e.entity === "string" && e.entity.trim())
        .map((e, idx) => {
          const score = typeof e.salienceScore === "number" ? Math.round(e.salienceScore) : Math.max(20, 95 - idx * 5);
          const level = e.salienceLevel || (score >= 65 ? "central" : score >= 40 ? "supporting" : "peripheral");
          return {
            entity: e.entity.trim(),
            category: e.category && typeof e.category === "string" ? e.category.trim() : "Geral",
            relevance: e.relevance || "Conceito relevante extraído do texto.",
            salienceScore: Math.min(100, Math.max(10, score)),
            salienceLevel: level,
            shortDefinition: e.shortDefinition || `Conceito fundamental de ${e.category || "SEO Semântico"}.`,
            canonicalName: e.canonicalName || e.entity.trim(),
            disambiguationContext: e.disambiguationContext || "",
          };
        })
        .sort((a, b) => (b.salienceScore || 0) - (a.salienceScore || 0));

      if (sanitizedEntities.length > 0) {
        entitiesResult = {
          entities: sanitizedEntities,
          summary: parsed.summary || "",
          totalExtracted: sanitizedEntities.length,
          modelUsed,
          isLocalFallback: false,
        };
      }
    } catch (aiError: any) {
      console.warn(
        "Extração via Gemini falhou (quota 429 ou erro). Ativando extrator NLP heurístico local de resiliência...",
        aiError?.message
      );
    }

    // If Gemini failed due to 429 quota or any reason, run Local NLP Miner to never block the user!
    if (!entitiesResult) {
      entitiesResult = extractEntitiesLocally(text, maxEntities);
    }

    res.json(entitiesResult);
  } catch (error: any) {
    console.error("Erro geral na rota /api/seo-definitions/extract-entities:", error);
    const fallback = extractEntitiesLocally(req.body?.text || "", req.body?.maxEntities || 15);
    res.json(fallback);
  }
});

// FEATURE 2: JOINT NER + RELATION EXTRACTION (Simultaneous entities + triplets in 1 pass)
app.post("/api/seo-definitions/joint-extraction", async (req, res) => {
  try {
    const { text, maxEntities = 15, model = "gemini-3.7-flash" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "O texto para extração conjunta é obrigatório." });
    }

    let jointResult: any = null;

    try {
      const ai = getGeminiClient();
      const prompt = `Você é um Engenheiro Chefe de Processamento de Linguagem Natural e Web Semântica.
Execute uma EXTRAÇÃO CONJUNTA (Joint Named Entity Recognition & Relation Extraction) no texto fornecido.
Em uma ÚNICA passagem, você deve extrair tanto as Entidades canônicas (com pontuação de Salência) quanto as Relações Semânticas (RDF Triplets: Sujeito -[Predicado]-> Objeto) que conectam essas entidades diretamente no conteúdo.

DIRETRIZES DE RIGOR SEMÂNTICO (POOLPARTY & KNOWLEDGE GRAPH):
1. ENTIDADES & DESAMBIGUAÇÃO:
   - Extraia de 5 a ${Math.max(5, maxEntities)} conceitos técnicos/entidades canônicas.
   - Desambigue termos homônimos e polissêmicos com base nas pistas contextuais e coocorrências.
   - Forneça canonicalName (forma de autoridade) e disambiguationContext (por que foi classificado assim).
   - Atribua salienceScore (0 a 100) e salienceLevel ("central" | "supporting" | "peripheral").
   - Penalize ou descarte buzzwords vagas (ex: sinergias holísticas) em prol de entidades concretas.
2. RELAÇÕES & TRIPLETOS (RDF):
   - Extraia até 12 conexões semânticas explícitas ou fundamentais expressas no texto entre as entidades identificadas.
   - Cada relação deve conectar um Sujeito a um Objeto com Predicado claro (ex: "utiliza", "fundamenta", "alimenta", "estrutura", "éSubconceitoDe").
   - Classifique o tipo: "hierarchical", "methodological", "causal", "associative" ou "equivalence".
   - Indique a confiança (70-99) e a justificativa semântica.
3. CLUSTERS E RESUMO:
   - Identifique os clusters temáticos dominantes e um resumo executivo de 1 parágrafo.

Texto para análise:
"""
${text.slice(0, 60000)}
"""`;

      const { response, modelUsed } = await callGeminiWithCascade(
        ai,
        model || "gemini-3.7-flash",
        prompt,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    entity: { type: Type.STRING },
                    category: { type: Type.STRING },
                    relevance: { type: Type.STRING },
                    salienceScore: { type: Type.NUMBER },
                    salienceLevel: { type: Type.STRING, enum: ["central", "supporting", "peripheral"] },
                    shortDefinition: { type: Type.STRING },
                    canonicalName: { type: Type.STRING },
                    disambiguationContext: { type: Type.STRING },
                  },
                  required: ["entity", "category", "salienceScore", "salienceLevel"],
                },
              },
              triplets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    predicate: { type: Type.STRING },
                    object: { type: Type.STRING },
                  },
                  required: ["subject", "predicate", "object"],
                },
              },
              suggestedRelationships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sourceEntity: { type: Type.STRING },
                    predicate: { type: Type.STRING },
                    targetEntity: { type: Type.STRING },
                    relationshipType: {
                      type: Type.STRING,
                      enum: ["hierarchical", "methodological", "causal", "associative", "equivalence"],
                    },
                    confidence: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING },
                    schemaProperty: { type: Type.STRING },
                  },
                  required: ["sourceEntity", "predicate", "targetEntity", "relationshipType", "confidence", "reasoning"],
                },
              },
              summary: { type: Type.STRING },
              detectedClusters: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["entities", "triplets", "suggestedRelationships", "summary"],
          },
        }
      );

      const parsed = JSON.parse(response.text || "{}");
      const entities = (parsed.entities || []).map((e: any, idx: number) => ({
        entity: e.entity.trim(),
        category: e.category || "Geral",
        relevance: e.relevance || "Identificado no artigo.",
        salienceScore: typeof e.salienceScore === "number" ? Math.round(e.salienceScore) : Math.max(20, 95 - idx * 5),
        salienceLevel: e.salienceLevel || "supporting",
        shortDefinition: e.shortDefinition || `Conceito semântico identificado no texto.`,
        canonicalName: e.canonicalName || e.entity.trim(),
        disambiguationContext: e.disambiguationContext || "",
        selected: true,
      })).sort((a: any, b: any) => b.salienceScore - a.salienceScore);

      const triplets = (parsed.triplets || []).filter(
        (t: any) => t.subject && t.predicate && t.object
      );

      const relationships = (parsed.suggestedRelationships || []).map(
        (r: any, idx: number) => ({
          id: `joint-rel-${Date.now()}-${idx}`,
          sourceEntity: r.sourceEntity,
          predicate: r.predicate,
          targetEntity: r.targetEntity,
          relationshipType: r.relationshipType || "associative",
          confidence: typeof r.confidence === "number" ? r.confidence : 85,
          reasoning: r.reasoning || "Relação identificada via Joint Extraction.",
          schemaProperty: r.schemaProperty || "isRelatedTo",
          status: "pending",
        })
      );

      jointResult = {
        entities,
        triplets,
        suggestedRelationships: relationships,
        summary: parsed.summary || "",
        detectedClusters: parsed.detectedClusters || Array.from(new Set(entities.map((e: any) => e.category))),
        modelUsed,
        isLocalFallback: false,
      };
    } catch (aiErr: any) {
      console.warn("Joint Extraction via Gemini falhou. Ativando fallback algorítmico local...", aiErr?.message);
    }

    if (!jointResult) {
      const localEntities = extractEntitiesLocally(text, maxEntities);
      const localRel = suggestRelationshipsLocally(localEntities.entities, "all", 8);
      jointResult = {
        entities: localEntities.entities.map((e) => ({ ...e, selected: true })),
        triplets: localRel.suggestedRelationships.map((r: any) => ({
          subject: r.sourceEntity,
          predicate: r.predicate,
          object: r.targetEntity,
        })),
        suggestedRelationships: localRel.suggestedRelationships,
        summary: localEntities.summary,
        detectedClusters: localRel.detectedClusters,
        modelUsed: "local-joint-miner",
        isLocalFallback: true,
      };
    }

    res.json(jointResult);
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/joint-extraction:", error);
    res.status(500).json({ error: "Falha na extração conjunta de entidades e relações." });
  }
});

// FEATURE 3: TOPICAL GAP & MISSING RELATIONS AUDITOR
app.post("/api/seo-definitions/audit-topical-gaps", async (req, res) => {
  try {
    const {
      content = "",
      existingEntities = [],
      topic = "",
      model = "gemini-3.7-flash",
    } = req.body;

    const topicSubject = topic || (existingEntities[0]?.entity ? `Domínio de ${existingEntities[0].entity}` : "SEO Semântico e Knowledge Graphs");

    let auditResult: any = null;

    try {
      const ai = getGeminiClient();
      const prompt = `Você é o Arquiteto de Autoridade Tópica (Topical Authority) e Engenheiro de Ontologias Semânticas.
Sua tarefa é realizar uma AUDITORIA COMPLETA DE LACUNAS TÓPICAS (Topical Gap Analysis) e ARESTAS FALTANTES (Missing Graph Edges).

Contexto a Auditar:
- Tópico/Nicho Central: "${topicSubject}"
- Entidades Atualmente Cadastradas no Glossário (${existingEntities.length}):
${JSON.stringify(existingEntities.slice(0, 40).map((e: any) => ({ name: e.entity, category: e.category })), null, 2)}

${content ? `Conteúdo adicional fornecido para auditoria:\n"""\n${content.slice(0, 30000)}\n"""` : ""}

SUA MISSÃO DE AUDITORIA:
1. NÓS AUSENTES (Missing Entities):
   - Identifique entre 4 e 8 entidades indispensáveis para cobrir esse nicho com Autoridade Tópica absoluta (E-E-A-T), que ainda NÃO estão no glossário.
   - Para cada entidade faltante, defina: nome exato, categoria ideal, nível de importância ("crítica", "alta", "média"), justificativa técnica de SEO e intenção de busca estimada.
2. ARESTAS FALTANTES (Missing Edges):
   - Identifique de 4 a 8 conexões semânticas (pontes ontológicas) que DEVERIAM existir entre entidades que o site possui ou planeja, mas que estão desconectadas (evitando ilhas semânticas isoladas).
3. PONTUAÇÕES TÓPICAS:
   - Calcule o topicalAuthorityScore (0 a 100) refletindo quão completa está a cobertura deste tema.
   - Calcule o graphDensityScore (0 a 100) refletindo a coesão das relações.
4. RECOMENDAÇÕES E PÁGINAS PILARES:
   - Identifique as entidades que devem ser tratadas como Páginas Pilares centrais (pillarEntities).
   - Forneça 3 a 5 recomendações estratégicas claras para fechar os gaps de conteúdo.`;

      const { response, modelUsed } = await callGeminiWithCascade(
        ai,
        model || "gemini-3.7-flash",
        prompt,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicalAuthorityScore: { type: Type.NUMBER },
              graphDensityScore: { type: Type.NUMBER },
              missingEntities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    entity: { type: Type.STRING },
                    category: { type: Type.STRING },
                    importance: { type: Type.STRING, enum: ["crítica", "alta", "média"] },
                    reason: { type: Type.STRING },
                    suggestedParentCluster: { type: Type.STRING },
                    estimatedSearchIntent: { type: Type.STRING },
                  },
                  required: ["entity", "category", "importance", "reason"],
                },
              },
              missingEdges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sourceEntity: { type: Type.STRING },
                    targetEntity: { type: Type.STRING },
                    suggestedPredicate: { type: Type.STRING },
                    relationshipType: {
                      type: Type.STRING,
                      enum: ["hierarchical", "methodological", "causal", "associative", "equivalence"],
                    },
                    priority: { type: Type.STRING, enum: ["alta", "média", "baixa"] },
                    reasoning: { type: Type.STRING },
                  },
                  required: ["sourceEntity", "targetEntity", "suggestedPredicate", "relationshipType", "priority", "reasoning"],
                },
              },
              orphanedEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
              strategicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              pillarEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["topicalAuthorityScore", "graphDensityScore", "missingEntities", "missingEdges", "strategicRecommendations"],
          },
        }
      );

      const parsed = JSON.parse(response.text || "{}");
      auditResult = {
        analyzedTopic: topicSubject,
        topicalAuthorityScore: Math.min(100, Math.max(20, parsed.topicalAuthorityScore || 65)),
        graphDensityScore: Math.min(100, Math.max(20, parsed.graphDensityScore || 60)),
        totalEntitiesCount: existingEntities.length,
        totalConnectionsCount: (existingEntities.flatMap((e: any) => e.semanticTriplets || [])).length,
        missingEntities: (parsed.missingEntities || []).map((m: any, idx: number) => ({
          id: `gap-ent-${Date.now()}-${idx}`,
          entity: m.entity,
          category: m.category || "SEO Semântico",
          importance: m.importance || "alta",
          reason: m.reason || "Entidade indispensável para profundidade semântica.",
          suggestedParentCluster: m.suggestedParentCluster || "Autoridade Tópica",
          estimatedSearchIntent: m.estimatedSearchIntent || "Informacional / Investigativo",
        })),
        missingEdges: (parsed.missingEdges || []).map((e: any, idx: number) => ({
          id: `gap-edge-${Date.now()}-${idx}`,
          sourceEntity: e.sourceEntity,
          targetEntity: e.targetEntity,
          suggestedPredicate: e.suggestedPredicate,
          relationshipType: e.relationshipType || "associative",
          priority: e.priority || "alta",
          reasoning: e.reasoning || "Cria ponte semântica entre tópicos correlacionados.",
        })),
        orphanedEntities: parsed.orphanedEntities || [],
        strategicRecommendations: parsed.strategicRecommendations || [
          "Criar páginas de glossário para as entidades críticas ausentes.",
          "Estabelecer links internos contextuais entre entidades de clusters complementares.",
          "Adicionar marcações Schema.org com 'sameAs' apontando para Wikidata e Google Knowledge Graph.",
        ],
        pillarEntities: parsed.pillarEntities || existingEntities.slice(0, 3).map((e: any) => e.entity),
        modelUsed,
        isLocalFallback: false,
      };
    } catch (aiErr: any) {
      console.warn("Auditoria via Gemini falhou. Ativando auditor de lacunas heurístico local...", aiErr?.message);
    }

    if (!auditResult) {
      // Heuristic fallback for gap analysis
      const registered = new Set(existingEntities.map((e: any) => (e.entity || "").toLowerCase()));
      const commonCoreTopics = [
        { entity: "Topical Authority", category: "SEO Semântico", importance: "crítica", reason: "Métrica nuclear para relevância holística nos buscadores modernos." },
        { entity: "Knowledge Graph", category: "Knowledge Graph & Ontologia", importance: "crítica", reason: "Base para disambiguação de entidades pelo Google." },
        { entity: "Semantic Triplet", category: "Estrutura de Dados & Schema.org", importance: "alta", reason: "Conecta sujeito, predicado e objeto em grafos RDF." },
        { entity: "DefinedTermSet", category: "Estrutura de Dados & Schema.org", importance: "alta", reason: "Estrutura de vocabulário do Schema.org para glossários." },
        { entity: "Entity Salience", category: "SEO Semântico", importance: "alta", reason: "Calcula a centralidade de uma entidade dentro do documento." },
        { entity: "Google Search Central", category: "Tecnologia da Web", importance: "média", reason: "Documentação oficial de diretrizes de qualidade do Google." },
      ];

      const missingGaps = commonCoreTopics
        .filter((t) => !registered.has(t.entity.toLowerCase()))
        .map((t, i) => ({
          id: `gap-local-${Date.now()}-${i}`,
          entity: t.entity,
          category: t.category,
          importance: t.importance as any,
          reason: t.reason,
          suggestedParentCluster: "Arquitetura da Informação",
          estimatedSearchIntent: "Informacional / Especialista",
        }));

      auditResult = {
        analyzedTopic: topicSubject,
        topicalAuthorityScore: Math.max(45, Math.min(85, existingEntities.length * 6)),
        graphDensityScore: 68,
        totalEntitiesCount: existingEntities.length,
        totalConnectionsCount: existingEntities.length * 2,
        missingEntities: missingGaps,
        missingEdges: existingEntities.slice(0, 3).map((e: any, i: number) => ({
          id: `gap-edge-local-${i}`,
          sourceEntity: e.entity,
          targetEntity: existingEntities[i + 1]?.entity || "SEO Semântico",
          suggestedPredicate: "relacionadoCom",
          relationshipType: "associative" as any,
          priority: "alta" as any,
          reasoning: "Elimina isolamento semântico conectando nós adjacentes.",
        })),
        orphanedEntities: [],
        strategicRecommendations: [
          "Cubra os nós de conhecimento essenciais identificados na auditoria.",
          "Estabeleça interlinking bidirecional entre páginas pilares e termos satélites.",
          "Vincule os termos às URIs canônicas do Wikidata e Google Knowledge Graph.",
        ],
        pillarEntities: existingEntities.slice(0, 3).map((e: any) => e.entity),
        modelUsed: "local-topical-auditor",
        isLocalFallback: true,
      };
    }

    res.json(auditResult);
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/audit-topical-gaps:", error);
    res.status(500).json({ error: "Falha na auditoria de lacunas tópicas." });
  }
});

// Prompt Optimization Assistant Endpoint
app.post("/api/seo-definitions/optimize-prompt", async (req, res) => {
  try {
    const { currentPrompt, objective = "Melhorar densidade semântica e fórmula ontológica" } = req.body;
    const ai = getGeminiClient();

    const { response } = await callGeminiWithCascade(
      ai,
      "gemini-3.7-flash",
      `Você é um engenheiro de prompts especializado em SEO Semântico, Knowledge Graphs e NLP.
Otimize o seguinte prompt de geração de definições com base no objetivo: "${objective}".

Prompt atual:
"""
${currentPrompt}
"""

Retorne um JSON com a versão aprimorada do prompt e a explicação das melhorias técnicas de SEO semântico adicionadas.`,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING, description: "Novo prompt refinado" },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de melhorias realizadas",
            },
          },
          required: ["optimizedPrompt", "improvements"],
        },
      }
    );

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Erro na otimização de prompt:", error);
    // Fallback optimization response
    res.json({
      optimizedPrompt: `${req.body.currentPrompt || ""}\n\n[Otimização Ontológica]: Defina [Entidade] como [Classe Superior] que [Diferencial], integrando 3 fontes canônicas e marcação Schema.org.`,
      improvements: [
        "Adicionada fórmula clássica ontológica de definição",
        "Reforçada especificação de fontes primárias e marcações Schema.org",
      ],
    });
  }
});

// Relationship Suggester Endpoint with Multi-Model Fallback + Local Fallback
app.post("/api/seo-definitions/suggest-relationships", async (req, res) => {
  try {
    const {
      entities = [],
      focusCategory = "all",
      model = "gemini-3.7-flash",
      maxSuggestions = 12,
    } = req.body;

    if (!Array.isArray(entities) || entities.length < 2) {
      return res.status(400).json({
        error: "É necessário fornecer pelo menos 2 entidades para sugerir conexões semânticas.",
      });
    }

    let result: any = null;

    try {
      const ai = getGeminiClient();

      const entitySummaries = entities.map((e: any, index: number) => ({
        index: index + 1,
        name: e.entity,
        category: e.category || "Geral",
        summary: e.shortSummary || (e.definition ? e.definition.slice(0, 140) + "..." : ""),
        existingTriplets: (e.semanticTriplets || []).map(
          (t: any) => `${t.subject} -[${t.predicate}]-> ${t.object}`
        ),
      }));

      const prompt = `Você é o Arquiteto Chefe de Ontologias Semânticas e Knowledge Graphs para Motores de Busca e Modelos de Linguagem (Google Knowledge Graph, Wikidata, Schema.org).

Analise o seguinte catálogo com ${entities.length} entidades cadastradas no glossário:
${JSON.stringify(entitySummaries, null, 2)}

${focusCategory !== "all" ? `Foco prioritário na categoria temática: "${focusCategory}".` : ""}

Sua missão:
1. Identifique as conexões semânticas (RDF Triplets) mais fortes, factuais e estratégicas que DEVEM existir ENTRE as entidades desta lista para maximizar a autoridade tópica (Topical Authority), eliminar ilhas semânticas isoladas e criar um Knowledge Graph denso e coeso.
2. Para cada relação sugerida, conecte EXATAMENTE uma entidade de origem (sourceEntity) a uma entidade de destino (targetEntity) presentes na lista, utilizando um predicado ontológico preciso em português (ex: "utiliza", "éSubconceitoDe", "fundamenta", "alimenta", "padronizadoPor", "estrutura", "aplica").
3. Classifique o tipo de relação:
   - "hierarchical": relação taxonômica/subclasse/superclasse/pertencimento
   - "methodological": relação de implementação/ferramenta/padrão/execução técnica
   - "causal": relação de efeito/otimização/geração de resultado
   - "associative": relação de domínio correlato/co-ocorrência conceitual
   - "equivalence": relação de sinonímia conceitual/mesmo escopo
4. Forneça uma pontuação de confiança (confidence) de 70 a 99 baseada no rigor ontológico.
5. Explique a justificativa técnica de SEO/Knowledge Graph (reasoning) em 1 a 2 frases concisas destacando o benefício para a autoridade tópica.
6. Mapeie a propriedade Schema.org correspondente (ex: "isRelatedTo", "hasPart", "isPartOf", "about", "mentions", "instrument").
7. Gere até ${maxSuggestions} sugestões ordenadas pelas mais valiosas.
8. Calcule métricas resumidas e um insight estratégico de enriquecimento do grafo.`;

      const { response, modelUsed } = await callGeminiWithCascade(
        ai,
        model || "gemini-3.7-flash",
        prompt,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedRelationships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sourceEntity: {
                      type: Type.STRING,
                      description: "Nome exato da entidade sujeito presente na lista",
                    },
                    predicate: {
                      type: Type.STRING,
                      description: "Predicado ontológico em português (ex: 'alimenta', 'utiliza', 'fundamenta')",
                    },
                    targetEntity: {
                      type: Type.STRING,
                      description: "Nome exato da entidade objeto presente na lista",
                    },
                    relationshipType: {
                      type: Type.STRING,
                      enum: ["hierarchical", "methodological", "causal", "associative", "equivalence"],
                      description: "Tipo ontológico da relação",
                    },
                    confidence: {
                      type: Type.NUMBER,
                      description: "Nível de confiança da relação de 70 a 100",
                    },
                    reasoning: {
                      type: Type.STRING,
                      description: "Explicação técnica de como esse link fortalece o Knowledge Graph",
                    },
                    schemaProperty: {
                      type: Type.STRING,
                      description: "Propriedade Schema.org equivalente (ex: isRelatedTo, hasPart)",
                    },
                  },
                  required: [
                    "sourceEntity",
                    "predicate",
                    "targetEntity",
                    "relationshipType",
                    "confidence",
                    "reasoning",
                  ],
                },
              },
              strategicInsight: {
                type: Type.STRING,
                description: "Insight executivo sobre como estas conexões fecham gaps de autoridade tópica",
              },
              detectedClusters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Principais clusters tópicos detectados",
              },
              graphHealthScore: {
                type: Type.NUMBER,
                description: "Pontuação estimada de saúde e densidade do grafo atual (0-100)",
              },
            },
            required: ["suggestedRelationships", "strategicInsight", "graphHealthScore"],
          },
        }
      );

      const parsed = JSON.parse(response.text || "{}");

      const suggestionsWithIds = (parsed.suggestedRelationships || []).map(
        (s: any, idx: number) => ({
          id: `sug-${Date.now()}-${idx}`,
          sourceEntity: s.sourceEntity,
          predicate: s.predicate,
          targetEntity: s.targetEntity,
          relationshipType: s.relationshipType || "associative",
          confidence: typeof s.confidence === "number" ? s.confidence : 85,
          reasoning: s.reasoning || "Fortalece a co-ocorrência semântica e contextual entre os tópicos.",
          schemaProperty: s.schemaProperty || "isRelatedTo",
          status: "pending",
        })
      );

      result = {
        suggestedRelationships: suggestionsWithIds,
        strategicInsight: parsed.strategicInsight || "Conexões identificadas com sucesso.",
        detectedClusters: parsed.detectedClusters || [],
        graphHealthScore: parsed.graphHealthScore || 75,
        totalAnalyzed: entities.length,
        modelUsed: modelUsed,
        isLocalFallback: false,
      };
    } catch (aiErr: any) {
      console.warn(
        "Sugestão de relações via Gemini falhou (quota 429 ou erro). Ativando motor de conexões ontológicas local...",
        aiErr?.message
      );
    }

    if (!result) {
      result = suggestRelationshipsLocally(entities, focusCategory, maxSuggestions);
    }

    res.json(result);
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/suggest-relationships:", error);
    const fallback = suggestRelationshipsLocally(
      req.body?.entities || [],
      req.body?.focusCategory || "all",
      req.body?.maxSuggestions || 12
    );
    res.json(fallback);
  }
});

// ==========================================
// FEATURE 1: WIKIDATA & WIKIPEDIA SAMEAS RECONCILIATION
// ==========================================
async function reconcileWithWikidataApi(entityName: string, category: string = "") {
  try {
    const cleanQuery = entityName.trim();
    // 1. Search in Portuguese first
    let searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cleanQuery)}&language=pt&format=json&limit=5&uselang=pt`;
    let response = await fetch(searchUrl, {
      headers: { "User-Agent": "SemanticoSEO-Reconciler/2.0 (alexrodrigues43@gmail.com)" },
    });
    let data: any = await response.json();
    let results = data.search || [];

    // 2. If no Portuguese results, search in English
    if (results.length === 0) {
      searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cleanQuery)}&language=en&format=json&limit=5&uselang=en`;
      response = await fetch(searchUrl, {
        headers: { "User-Agent": "SemanticoSEO-Reconciler/2.0 (alexrodrigues43@gmail.com)" },
      });
      data = await response.json();
      results = data.search || [];
    }

    if (results.length === 0) {
      return null;
    }

    const ids = results.slice(0, 3).map((r: any) => r.id).join("|");
    const detailUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|sitelinks/urls|descriptions|labels|aliases&languages=pt|en&format=json`;
    const detailRes = await fetch(detailUrl, {
      headers: { "User-Agent": "SemanticoSEO-Reconciler/2.0 (alexrodrigues43@gmail.com)" },
    });
    const detailData: any = await detailRes.json();
    const entitiesObj = detailData.entities || {};

    const matches: any[] = [];

    for (const resItem of results) {
      const ent = entitiesObj[resItem.id];
      if (!ent) continue;

      const ptwiki = ent.sitelinks?.ptwiki?.url;
      const enwiki = ent.sitelinks?.enwiki?.url;
      const wikidataUrl = `https://www.wikidata.org/wiki/${resItem.id}`;

      // Extract Google Knowledge Graph MID from Wikidata property P646 (Freebase ID / Google KG ID)
      const p646Snak = ent.claims?.P646?.[0]?.mainsnak?.datavalue?.value;
      const googleMid = typeof p646Snak === "string" ? p646Snak : null;
      const googleKgUrl = googleMid
        ? `https://www.google.com/search?kgmid=${encodeURIComponent(googleMid)}`
        : null;

      const sameAsUrls: string[] = [wikidataUrl];
      if (googleKgUrl) sameAsUrls.push(googleKgUrl);
      if (ptwiki) sameAsUrls.push(ptwiki);
      if (enwiki && !sameAsUrls.includes(enwiki)) sameAsUrls.push(enwiki);

      const labelPt = ent.labels?.pt?.value || ent.labels?.en?.value || resItem.label;
      const descPt = ent.descriptions?.pt?.value || ent.descriptions?.en?.value || resItem.description || "";
      const aliases = [
        ...(ent.aliases?.pt?.map((a: any) => a.value) || []),
        ...(ent.aliases?.en?.map((a: any) => a.value) || []),
      ];

      // Calculate match score
      let score = 75;
      if (labelPt.toLowerCase() === cleanQuery.toLowerCase()) score += 20;
      if (ptwiki) score += 5;
      if (googleMid) score += 5;

      matches.push({
        wikidataId: resItem.id,
        label: labelPt,
        description: descPt,
        wikidataUrl,
        wikipediaUrl: ptwiki || enwiki || null,
        wikipediaEnUrl: enwiki || null,
        googleMid,
        googleKgUrl,
        aliases: Array.from(new Set(aliases)).slice(0, 6),
        sameAsUrls,
        confidence: Math.min(score, 100),
      });
    }

    return matches;
  } catch (err) {
    console.warn("[Wikidata API] Erro ao consultar Wikidata:", err);
    return null;
  }
}

// Endpoint: Reconcile single entity with Wikidata & Wikipedia
app.post("/api/seo-definitions/reconcile-wikidata", async (req, res) => {
  try {
    const { entity, category = "", definition = "" } = req.body;
    if (!entity) {
      return res.status(400).json({ error: "Nome da entidade é obrigatório" });
    }

    // First try direct Wikidata API
    const directMatches = await reconcileWithWikidataApi(entity, category);

    if (directMatches && directMatches.length > 0) {
      return res.json({
        entity,
        matches: directMatches,
        topMatch: directMatches[0],
        source: "wikidata_live_api",
      });
    }

    // AI Fallback Reconciliation
    let aiFallbackMatch = null;
    try {
      const ai = getGeminiClient();
      const prompt = `Você é um especialista em Ontologias, Web Semântica, Wikidata e Google Knowledge Graph.
Encontre o identificador Wikidata (Q-ID) canônico, o identificador do Google Knowledge Graph Machine ID (googleMid, ex: "/m/02csf" ou "/g/11b...") e o artigo oficial da Wikipedia para a entidade conceitual: "${entity}" (Categoria: "${category}").
Contexto/Definição: "${definition}".

Responda em formato JSON com:
- wikidataId: Ex: "Q11053"
- googleMid: Ex: "/m/02csf" ou null se não souber
- label: Nome canônico da entidade
- description: Descrição curta e precisa
- wikidataUrl: Ex: "https://www.wikidata.org/wiki/Q11053"
- googleKgUrl: Ex: "https://www.google.com/search?kgmid=/m/02csf" ou null
- wikipediaUrl: URL da Wikipedia em Português ou Inglês
- sameAsUrls: Array com as URLs de autoridade (Wikidata, Google Knowledge Graph, Wikipedia PT, Wikipedia EN)
- confidence: Número de 0 a 100`;

      const { response } = await callGeminiWithCascade(
        ai,
        "gemini-3.7-flash",
        prompt,
        {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              wikidataId: { type: Type.STRING },
              googleMid: { type: Type.STRING },
              label: { type: Type.STRING },
              description: { type: Type.STRING },
              wikidataUrl: { type: Type.STRING },
              googleKgUrl: { type: Type.STRING },
              wikipediaUrl: { type: Type.STRING },
              sameAsUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.NUMBER },
            },
            required: ["wikidataId", "label", "wikidataUrl", "sameAsUrls", "confidence"],
          },
        }
      );

      aiFallbackMatch = JSON.parse(response.text || "{}");
      if (aiFallbackMatch && aiFallbackMatch.googleMid && !aiFallbackMatch.googleKgUrl) {
        aiFallbackMatch.googleKgUrl = `https://www.google.com/search?kgmid=${encodeURIComponent(aiFallbackMatch.googleMid)}`;
        if (!aiFallbackMatch.sameAsUrls.includes(aiFallbackMatch.googleKgUrl)) {
          aiFallbackMatch.sameAsUrls.push(aiFallbackMatch.googleKgUrl);
        }
      }
    } catch (aiErr) {
      console.warn("Reconciliação AI falhou, gerando fallback ontológico...");
    }

    if (aiFallbackMatch && aiFallbackMatch.wikidataId) {
      return res.json({
        entity,
        matches: [aiFallbackMatch],
        topMatch: aiFallbackMatch,
        source: "gemini_knowledge_graph",
      });
    }

    // Construct plausible fallback if everything fails
    const slug = entity.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    res.json({
      entity,
      matches: [],
      topMatch: {
        wikidataId: "Q_PENDING",
        label: entity,
        description: `Conceito semântico relacionado a ${category || "SEO Semântico"}.`,
        wikidataUrl: `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(entity)}`,
        wikipediaUrl: `https://pt.wikipedia.org/wiki/${encodeURIComponent(entity)}`,
        sameAsUrls: [
          `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(entity)}`,
          `https://pt.wikipedia.org/wiki/${encodeURIComponent(entity)}`
        ],
        confidence: 60,
      },
      source: "heuristic_fallback",
    });
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/reconcile-wikidata:", error);
    res.status(500).json({ error: error.message || "Falha na reconciliação Wikidata" });
  }
});

// Endpoint: Batch reconcile multiple entities with Wikidata
app.post("/api/seo-definitions/reconcile-batch", async (req, res) => {
  try {
    const { entities = [] } = req.body;
    if (!Array.isArray(entities) || entities.length === 0) {
      return res.status(400).json({ error: "Lista de entidades vazia" });
    }

    const results = [];
    for (const item of entities.slice(0, 30)) {
      const entityName = typeof item === "string" ? item : item.entity;
      const category = typeof item === "object" ? item.category : "";
      const matches = await reconcileWithWikidataApi(entityName, category);
      results.push({
        id: item.id || null,
        entity: entityName,
        topMatch: matches && matches.length > 0 ? matches[0] : null,
      });
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Erro no reconcile-batch:", error);
    res.status(500).json({ error: "Falha na reconciliação em lote" });
  }
});

// ==========================================
// FEATURE 2: INTERNAL LINKING ARCHITECTURE GENERATOR
// ==========================================
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

app.post("/api/seo-definitions/generate-internal-links", async (req, res) => {
  try {
    const {
      content = "",
      entities = [],
      baseUrl = "/glossario/",
      maxLinksPerParagraph = 2,
      maxTotalLinks = 15,
      linkDensity = "balanced", // conservative, balanced, aggressive
    } = req.body;

    if (!content || !entities || entities.length === 0) {
      return res.status(400).json({ error: "Conteúdo e lista de entidades são obrigatórios." });
    }

    // Sort entities by longest length first to match specific phrases before generic words
    const sortedEntities = [...entities].sort(
      (a: any, b: any) => (b.entity?.length || 0) - (a.entity?.length || 0)
    );

    const suggestions: any[] = [];
    const usedEntityNames = new Set<string>();
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    // Process paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    const processedParagraphsHtml: string[] = [];
    const processedParagraphsMd: string[] = [];

    const densityCap =
      linkDensity === "conservative" ? 1 : linkDensity === "aggressive" ? 4 : 2;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      let pText = paragraphs[pIdx];
      let pHtml = pText;
      let pMd = pText;
      let linksInThisP = 0;

      for (const ent of sortedEntities) {
        if (!ent.entity) continue;
        if (suggestions.length >= maxTotalLinks) break;
        if (linksInThisP >= densityCap) break;

        // Skip if already linked once (avoid over-linking same entity across close context unless aggressive)
        if (linkDensity !== "aggressive" && usedEntityNames.has(ent.entity.toLowerCase())) {
          continue;
        }

        // Exact & case-insensitive regex with word boundary support in Portuguese/Unicode
        const escaped = ent.entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?<!<[^>]*)(${escaped})(?![^<]*>)`, "i");
        const match = regex.exec(pHtml);

        if (match && match.index !== undefined) {
          const matchedText = match[0];
          const slug = ent.slug || slugify(ent.entity);
          const targetUrl = `${normalizedBaseUrl}${slug}`;
          const cleanDef = (ent.definition || "").replace(/"/g, "&quot;").slice(0, 120);

          // Extract sentence context
          const startIdx = Math.max(0, match.index - 50);
          const endIdx = Math.min(pText.length, match.index + matchedText.length + 50);
          const contextSnippet = "..." + pText.slice(startIdx, endIdx).trim() + "...";

          const linkId = `link-${Date.now()}-${suggestions.length}`;
          suggestions.push({
            id: linkId,
            targetEntity: ent.entity,
            targetEntityId: ent.id,
            anchorText: matchedText,
            targetUrl,
            contextSentence: contextSnippet,
            relevanceScore: 95,
            reasoning: `Citação direta da entidade central "${ent.entity}" (${ent.category || "SEO Semântico"}).`,
            type: "exact",
          });

          usedEntityNames.add(ent.entity.toLowerCase());
          linksInThisP++;

          // Replace first occurrence only in HTML
          pHtml = pHtml.replace(
            regex,
            `<a href="${targetUrl}" title="${ent.entity}: ${cleanDef}" class="semantic-internal-link font-semibold text-[#2576c0] hover:underline" data-entity-id="${ent.id}">$1</a>`
          );

          // Replace first occurrence in Markdown
          const mdRegex = new RegExp(`(?<!\\[.*?)(${escaped})(?![^\\]]*\\])`, "i");
          pMd = pMd.replace(mdRegex, `[$1](${targetUrl} "${ent.entity}")`);
        }
      }

      processedParagraphsHtml.push(pHtml);
      processedParagraphsMd.push(pMd);
    }

    const htmlWithLinks = processedParagraphsHtml.join("\n\n");
    const markdownWithLinks = processedParagraphsMd.join("\n\n");

    // Detect Potential Topic Gaps (entities present in text but absent from database)
    const topicGaps: any[] = [];
    const registeredEntityNames = new Set(entities.map((e: any) => e.entity.toLowerCase()));

    // NLP extraction of candidate phrases in content that could become new glossary entities
    const rawTerms = content.match(/[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)*/g) || [];
    const candidateCounts = new Map<string, number>();

    for (const raw of rawTerms) {
      const trimmed = raw.trim();
      if (trimmed.length < 4 || registeredEntityNames.has(trimmed.toLowerCase())) continue;
      // Skip common day/month words
      if (["Segunda", "Terça", "Quarta", "Janeiro", "Fevereiro", "Brasil", "Google"].includes(trimmed)) continue;
      candidateCounts.set(trimmed, (candidateCounts.get(trimmed) || 0) + 1);
    }

    for (const [term, count] of candidateCounts.entries()) {
      if (count >= 1 && topicGaps.length < 8) {
        topicGaps.push({
          term,
          occurrences: count,
          suggestedCategory: "Entidade Não Catalogada",
          potentialReason: `Mencionada ${count}x no conteúdo sem página correspondente no glossário.`,
        });
      }
    }

    res.json({
      textAnalyzed: content,
      htmlWithLinks,
      markdownWithLinks,
      totalLinksInserted: suggestions.length,
      suggestions,
      topicGaps,
      linkDensity,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/generate-internal-links:", error);
    res.status(500).json({ error: error.message || "Falha na geração de links internos" });
  }
});

// Endpoint: Cross-Entity Interlinking Matrix for entire Glossary
app.post("/api/seo-definitions/glossary-interlinking-matrix", async (req, res) => {
  try {
    const { entities = [], baseUrl = "/glossario/" } = req.body;
    if (!Array.isArray(entities) || entities.length === 0) {
      return res.status(400).json({ error: "Nenhuma entidade fornecida." });
    }

    const matrix: any[] = [];
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    for (const source of entities) {
      const sourceDef = source.definition || "";
      const linksTo: any[] = [];

      for (const target of entities) {
        if (source.id === target.id || !target.entity) continue;

        const escaped = target.entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b(${escaped})\\b`, "i");

        if (regex.test(sourceDef)) {
          linksTo.push({
            targetId: target.id,
            targetEntity: target.entity,
            targetCategory: target.category,
            targetUrl: `${normalizedBaseUrl}${target.slug || slugify(target.entity)}`,
            anchorText: target.entity,
          });
        }
      }

      matrix.push({
        sourceId: source.id,
        sourceEntity: source.entity,
        sourceCategory: source.category,
        totalOutboundLinks: linksTo.length,
        linksTo,
      });
    }

    res.json({ matrix, totalEntitiesAnalyzed: entities.length });
  } catch (error: any) {
    console.error("Erro na rota /api/seo-definitions/glossary-interlinking-matrix:", error);
    res.status(500).json({ error: "Falha ao gerar matriz de interlinking" });
  }
});

// Endpoint: Authentication & Passcode Verification (Admin & Beta Tester)
app.post("/api/auth/verify", (req, res) => {
  try {
    const { passcode, username } = req.body;
    if (!passcode || typeof passcode !== "string") {
      return res.status(400).json({ valid: false, error: "A chave de acesso é obrigatória." });
    }

    const cleanPasscode = passcode.trim();
    
    // Configured admin passwords
    const envAdminPass = (process.env.ADMIN_PASSWORD || "").trim();
    const defaultAdminPasses = ["semantico-admin", "semantico2025", "admin", "admin2025", "semantico-master"];
    const isAdmin = (envAdminPass && cleanPasscode === envAdminPass) || defaultAdminPasses.includes(cleanPasscode.toLowerCase());

    if (isAdmin) {
      return res.json({
        valid: true,
        role: "admin",
        name: username?.trim() || "Administrador Master",
        passcodeUsed: cleanPasscode,
        permissions: {
          unlimited: true,
          editPrompts: true,
          fullExport: true,
          wikidataReconcile: true,
          graphMining: true,
        },
      });
    }

    // Configured beta tester passcodes
    const envBetaPasses = (process.env.BETA_PASSCODES || "")
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    const defaultBetaPasses = ["beta2025", "testador", "semantico-beta", "beta-vip", "beta-tester", "convidado", "semantico", "beta"];
    const allBetaPasses = Array.from(new Set([...envBetaPasses, ...defaultBetaPasses]));

    const isBeta = allBetaPasses.includes(cleanPasscode.toLowerCase());

    if (isBeta) {
      return res.json({
        valid: true,
        role: "beta_tester",
        name: username?.trim() || `Beta Tester (${cleanPasscode})`,
        passcodeUsed: cleanPasscode,
        permissions: {
          unlimited: false,
          quotaRemaining: 100,
          editPrompts: true,
          fullExport: true,
          wikidataReconcile: true,
          graphMining: true,
        },
      });
    }

    return res.status(401).json({
      valid: false,
      error: "Chave de acesso inválida. Verifique o código fornecido.",
    });
  } catch (error: any) {
    console.error("Erro na rota /api/auth/verify:", error);
    res.status(500).json({ valid: false, error: "Erro interno no servidor de autenticação." });
  }
});


// Start Server & Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor de SEO Semântico rodando em http://localhost:${PORT}`);
  });
}

startServer();
