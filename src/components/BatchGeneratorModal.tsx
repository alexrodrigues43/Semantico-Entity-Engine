import React, { useState, useRef } from "react";
import { 
  TestTube,
  ShieldCheck,
  Target,
  Layers, 
  X, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause,
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  CheckSquare,
  Square,
  HelpCircle,
  BookOpen,
  Cpu,
  Zap
} from "lucide-react";
import { SeoEntityDefinition, GenerationSettings, PromptPreset, GenerationModel } from "../types";

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (definitions: SeoEntityDefinition[]) => void;
  settings: GenerationSettings;
  presets: PromptPreset[];
}

interface ExtractedEntityItem {
  entity: string;
  category: string;
  relevance?: string;
  salienceScore?: number;
  salienceLevel?: "central" | "supporting" | "peripheral";
  shortDefinition?: string;
  canonicalName?: string;
  disambiguationContext?: string;
  selected: boolean;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddBatch,
  settings,
  presets,
}) => {
  const [tab, setTab] = useState<"article" | "list">("article");
  const [activeModel, setActiveModel] = useState<string>(settings.model || "gemini-3.7-flash");
  
  // List Mode State
  const [rawInput, setRawInput] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("");

  // Article Mode State
  const [articleText, setArticleText] = useState("");
  const [maxEntitiesToExtract, setMaxEntitiesToExtract] = useState<number>(15);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntityItem[]>([]);
  const [extractedTriplets, setExtractedTriplets] = useState<Array<{ subject: string; predicate: string; object: string }>>([]);
  const [isJointExtraction, setIsJointExtraction] = useState<boolean>(true);
  const [articleSummary, setArticleSummary] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [usedLocalFallback, setUsedLocalFallback] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // File drag & drop
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentItem?: string }>({
    current: 0,
    total: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<SeoEntityDefinition[]>([]);

  if (!isOpen) return null;

  const sampleArticle = `O SEO Semântico (Semantic Search Engine Optimization) revolucionou a forma como os mecanismos de busca compreendem a intenção do usuário e a autoridade de um domínio. Diferente do SEO tradicional focado em repetição mecânica de palavras-chave (keyword density), a abordagem semântica baseia-se em Entidades Nomeadas, Linked Data e Ontologias Estruturadas.

No centro dessa transformação está o Google Knowledge Graph, uma vasta base de conhecimento que mapeia conceitos do mundo real e as relações entre eles (Tripletos RDF: Sujeito, Predicado e Objeto). Para comunicar essas relações aos rastreadores, os profissionais de marketing utilizam o vocabulário Schema.org via marcações JSON-LD (como DefinedTerm, Article, FAQPage e Organization).

A Topical Authority (Autoridade Tópica) é construída quando um site cobre exaustivamente um domínio temático por meio de Topic Clusters (Clusters de Tópicos) e Páginas Pilares (Pillar Pages), interligando termos semanticamente relacionados e respondendo a consultas baseadas em Processamento de Linguagem Natural (NLP) e algoritmos como MUM, RankBrain e Gemini Search.`;

  // Test Scenarios for Semantic Stress Testing
  const STRESS_TEST_SCENARIOS = [
    {
      id: "ambiguity",
      label: "Ambiguidade Homonímica (Amazon, Java, Apple)",
      badge: "Homonímia & Polissemia",
      description: "Testa se o modelo diferencia marcas corporativas de alimentos, estados geográficos e bebidas com base no contexto.",
      text: `A Amazon fechou uma nova parceria com o governo do estado do Amazonas em Manaus para mitigar o impacto do desmatamento. Enquanto isso, o engenheiro de software da Oracle tomava um café Java quente enquanto compilava e depurava um microsserviço de alta escalabilidade em Java 21, avaliando se a compra de ações da Apple na Nasdaq compensaria a quebra de safra na colheita da maçã Fuji no sul do país.`
    },
    {
      id: "acronyms",
      label: "Variação Morfológica & Siglas (BCB, Copom, Selic)",
      badge: "Anáfora & Normalização",
      description: "Testa correferência anafórica (ex: 'autoridade monetária' = 'BCB') e siglas econômicas estruturadas.",
      text: `O Banco Central do Brasil (BCB), por meio de ata recente do Comitê de Política Monetária (Copom), decidiu manter a taxa básica de juros, a Selic, em 10,50% a.a. A autoridade monetária sinalizou forte preocupação com a inflação medida pelo IPCA e pela volatilidade cambial. O ministro da Fazenda em Brasília criticou a postura do Copom, alegando que o arrocho de liquidez penaliza a arrecadação da União e encarece o crédito para empresas produtivas.`
    },
    {
      id: "fluff",
      label: "Jargão Corporativo Vago (Fluff / Penalização)",
      badge: "Teste de Vagueza",
      description: "Texto saturado de buzzwords vazias. O modelo deve penalizar a salência de termos vagos em favor de conceitos objetivos.",
      text: `Nossa estratégia visa potencializar e alavancar sinergias corporativas holísticas, promovendo disrupção no ecossistema por meio de uma governança centrada no valor do cliente e em frameworks ágeis de excelência operacional. Através do empoderamento das squads e do alinhamento de mindsets orientados a resultados, buscamos transformar paradigmas e construir diferenciais competitivos sustentáveis.`
    }
  ];


  // Load sample article
  const handleLoadSampleArticle = () => {
    setArticleText(sampleArticle);
    setActiveScenarioId(null);
    setExtractError(null);
  };

  // Load stress test scenario
  const handleLoadStressScenario = (scenario: typeof STRESS_TEST_SCENARIOS[0]) => {
    setArticleText(scenario.text);
    setActiveScenarioId(scenario.id);
    setExtractError(null);
    setExtractedEntities([]);
    setExtractedTriplets([]);
    setArticleSummary("");
  };

  // Handle file upload (.txt, .md, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (tab === "article") {
          setArticleText(content);
        } else {
          setRawInput(content);
        }
        setExtractError(null);
      }
    };
    reader.readAsText(file);
  };

  // Extract entities from article using Gemini with local NLP fallback guarantee
  const handleExtractFromArticle = async () => {
    if (!articleText.trim()) {
      setExtractError("Por favor, cole o texto de um artigo ou post antes de extrair.");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setArticleSummary("");
    setUsedLocalFallback(false);
    setExtractedTriplets([]);

    try {
      const endpoint = isJointExtraction
        ? "/api/seo-definitions/joint-extraction"
        : "/api/seo-definitions/extract-entities";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: articleText,
          maxEntities: maxEntitiesToExtract,
          model: activeModel,
        }),
      });

      const data = await response.json();

      if (data.isLocalFallback) {
        setUsedLocalFallback(true);
      }

      if (data.entities && Array.isArray(data.entities) && data.entities.length > 0) {
        const items: ExtractedEntityItem[] = data.entities.map((e: any) => ({
          entity: e.entity || "",
          category: e.category || "Geral",
          relevance: e.relevance || "",
          salienceScore: e.salienceScore,
          salienceLevel: e.salienceLevel,
          shortDefinition: e.shortDefinition,
          canonicalName: e.canonicalName || e.entity,
          disambiguationContext: e.disambiguationContext || "",
          selected: true,
        }));

        setExtractedEntities(items);
        if (data.summary) {
          setArticleSummary(data.summary);
        }
        if (data.triplets && Array.isArray(data.triplets)) {
          setExtractedTriplets(data.triplets);
        }

        // Also update raw input for immediate availability
        const lines = items.map((e) => `${e.entity}, ${e.category}`);
        setRawInput(lines.join("\n"));
      } else {
        setExtractError("Nenhuma entidade identificada no texto fornecido. Tente incluir um texto mais detalhado.");
      }
    } catch (err: any) {
      console.error("Erro na extração de entidades:", err);
      setExtractError(err.message || "Falha ao extrair entidades. O extrator local tentará ser ativado.");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleSelectAll = (select: boolean) => {
    setExtractedEntities((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const toggleSelectItem = (index: number) => {
    setExtractedEntities((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleApplySelectedToList = () => {
    const selected = extractedEntities.filter((e) => e.selected);
    if (selected.length === 0) {
      setExtractError("Selecione pelo menos uma entidade para transferir.");
      return;
    }
    const lines = selected.map((e) => `${e.entity}, ${e.category}`);
    setRawInput(lines.join("\n"));
    setTab("list");
  };

  // Start batch processing with automatic retry & rate-limit handling
  const handleStartBatch = async () => {
    const lines = rawInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setIsProcessing(true);
    setShouldStop(false);
    setProgress({ current: 0, total: lines.length });
    setLogs([`🚀 Iniciando geração em lote para ${lines.length} entidades com ${activeModel}...`]);
    
    const results: SeoEntityDefinition[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (shouldStop) {
        setLogs((prev) => [...prev, "🛑 Processamento pausado pelo usuário."]);
        break;
      }

      const line = lines[i];
      let entityName = line;
      let categoryName = defaultCategory;

      if (line.includes(",")) {
        const parts = line.split(",");
        entityName = parts[0].trim();
        categoryName = parts.slice(1).join(",").trim() || defaultCategory;
      } else if (line.includes("|")) {
        const parts = line.split("|");
        entityName = parts[0].trim();
        categoryName = parts[1].trim() || defaultCategory;
      } else if (line.includes("\t")) {
        const parts = line.split("\t");
        entityName = parts[0].trim();
        categoryName = parts[1]?.trim() || defaultCategory;
      }

      setProgress({ current: i + 1, total: lines.length, currentItem: entityName });
      setLogs((prev) => [...prev, `[${i + 1}/${lines.length}] Gerando ontologia para: "${entityName}"...`]);

      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts && !shouldStop) {
        attempts++;
        try {
          const response = await fetch("/api/seo-definitions/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entity: entityName,
              category: categoryName || undefined,
              model: activeModel,
              tone: settings.tone,
              length: settings.length,
              language: settings.language,
              enableGrounding: settings.enableGrounding,
              customPromptTemplate: settings.customPromptTemplate,
            }),
          });

          if (response.status === 429) {
            setLogs((prev) => [
              ...prev,
              `⏳ Limite de taxa (RPM) detectado. Aguardando 4 segundos antes de tentar novamente...`,
            ]);
            await new Promise((r) => setTimeout(r, 4000));
            continue;
          }

          if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
          }

          const data = await response.json();

          // Check if entity has salience data from extraction
          const matchingExtracted = extractedEntities.find(
            (e) => e.entity.toLowerCase() === entityName.toLowerCase()
          );
          const salienceScore = matchingExtracted?.salienceScore || 85;
          const salienceLevel = matchingExtracted?.salienceLevel || (salienceScore >= 65 ? "central" : "supporting");

          // Collect joint triplets for this entity
          const relevantJointTriplets = extractedTriplets.filter(
            (t) => t.subject.toLowerCase() === entityName.toLowerCase()
          );
          const combinedTriplets = [...(data.semanticTriplets || [])];
          for (const jt of relevantJointTriplets) {
            if (!combinedTriplets.some((t) => t.predicate === jt.predicate && t.object === jt.object)) {
              combinedTriplets.push(jt);
            }
          }

          // Optional quick Wikidata + Google Knowledge Graph reconciliation
          let wikidataMatch: any = null;
          try {
            const recRes = await fetch("/api/seo-definitions/reconcile-wikidata", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ entity: entityName, category: categoryName, model: activeModel }),
            });
            if (recRes.ok) {
              const recJson = await recRes.json();
              wikidataMatch = recJson.topMatch || null;
            }
          } catch (e) {
            // Gracefully continue
          }

          const sameAsList = Array.from(
            new Set([
              ...(data.sameAs || []),
              ...(wikidataMatch?.sameAsUrls || []),
              wikidataMatch?.wikidataUrl,
              wikidataMatch?.googleKgUrl,
            ])
          ).filter(Boolean) as string[];

          const defObj: SeoEntityDefinition = {
            id: `def-${Date.now()}-${i}`,
            entity: entityName,
            category: data.category || categoryName || "Geral",
            definition: data.definition || "",
            shortSummary: data.shortSummary || "",
            sources: data.sources || [],
            sourcesString: data.sourcesString || (data.sources || []).join(", "),
            semanticTriplets: combinedTriplets,
            lsiKeywords: data.lsiKeywords || [],
            schemaType: data.schemaType || "DefinedTerm",
            jsonLd: data.jsonLd,
            sameAs: sameAsList,
            wikidataId: wikidataMatch?.wikidataId || data.wikidataId,
            wikidataUrl: wikidataMatch?.wikidataUrl || data.wikidataUrl,
            wikipediaUrl: wikidataMatch?.wikipediaUrl || data.wikipediaUrl,
            wikidataDescription: wikidataMatch?.description || data.wikidataDescription,
            googleMid: wikidataMatch?.googleMid || data.googleMid,
            googleKgUrl: wikidataMatch?.googleKgUrl || data.googleKgUrl,
            salienceScore,
            salienceLevel,
            modelUsed: data.modelUsed || activeModel,
            status: "completed",
            createdAt: new Date().toISOString(),
          };

          results.push(defObj);
          setGeneratedResults([...results]);
          const kgTag = wikidataMatch?.googleMid ? ` [KG: ${wikidataMatch.googleMid}]` : "";
          const wikiTag = wikidataMatch?.wikidataId ? ` [Wiki: ${wikidataMatch.wikidataId}]` : "";
          setLogs((prev) => [
            ...prev,
            `✅ Concluído: "${entityName}" (${data.category || categoryName}) [Salience: ${salienceScore}%]${wikiTag}${kgTag}`,
          ]);
          success = true;
        } catch (err: any) {
          if (attempts >= maxAttempts) {
            console.error(`Erro ao gerar ${entityName}:`, err);
            setLogs((prev) => [...prev, `❌ Falha ao processar "${entityName}": ${err.message}`]);
          } else {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      // Safe pacing between requests
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsProcessing(false);
    if (results.length > 0) {
      onAddBatch(results);
      setLogs((prev) => [...prev, `🎉 Concluído com sucesso! ${results.length} entidades adicionadas ao glossário.`]);
    }
  };

  const selectedExtractedCount = extractedEntities.filter((e) => e.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Gerador de Definições em Lote (Bulk SEO)
                </h2>
                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-bold text-indigo-700">
                  <Cpu className="w-3 h-3 text-indigo-600" />
                  <select
                    value={activeModel}
                    onChange={(e) => setActiveModel(e.target.value)}
                    disabled={isProcessing || isExtracting}
                    className="bg-transparent font-bold text-indigo-700 focus:outline-none cursor-pointer"
                  >
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Minere entidades de textos completos ou cole listas para geração automatizada em massa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 shrink-0 justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("article")}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                tab === "article"
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Extrair de Artigo / Post Completo</span>
              {extractedEntities.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                  {extractedEntities.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTab("list")}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                tab === "list"
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Lista de Entidades / Planilha</span>
              {rawInput.split("\n").filter((l) => l.trim()).length > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px]">
                  {rawInput.split("\n").filter((l) => l.trim()).length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Carregar Arquivo (.txt, .md, .csv)</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {tab === "article" && (
            <div className="space-y-4">
              
              {/* Stress Test Scenarios Bar (Gold Standard & NER Stress Test) */}
              <div className="p-3 bg-gradient-to-r from-amber-50 via-indigo-50 to-purple-50 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500 text-white rounded-lg shadow-2xs">
                      <TestTube className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Suíte de Testes de Estresse Semântico & NER (Gold Standard)
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Selecione um cenário para testar a desambiguação contextual estilo PoolParty e penalização de vagueza:
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                    QA & Validação
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  {STRESS_TEST_SCENARIOS.map((sc) => {
                    const isSelected = activeScenarioId === sc.id;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => handleLoadStressScenario(sc)}
                        className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? "bg-white border-amber-500 shadow-sm ring-1 ring-amber-400"
                            : "bg-white/80 hover:bg-white border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            {sc.badge}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 leading-snug">
                          {sc.label}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                          {sc.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Header inside article extractor */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Texto Completo do Artigo / Guia / Post de Blog
                </label>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleArticle}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Carregar Artigo Padrão</span>
                  </button>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Extrair até:</span>
                    <select
                      value={maxEntitiesToExtract}
                      onChange={(e) => setMaxEntitiesToExtract(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value={8}>8 entidades</option>
                      <option value={12}>12 entidades</option>
                      <option value={16}>16 entidades</option>
                      <option value={20}>20 entidades</option>
                      <option value={30}>30 entidades</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={articleText}
                  onChange={(e) => {
                    setArticleText(e.target.value);
                    if (extractError) setExtractError(null);
                  }}
                  disabled={isExtracting || isProcessing}
                  placeholder="Cole aqui o texto completo do seu artigo, post de blog, documentação ou guia técnico..."
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{articleText.length} caracteres no texto</span>
                  <span>Motor: {activeModel} com fallback de resiliência ativo</span>
                </div>
              </div>

              {/* Local Fallback Banner if triggered */}
              {usedLocalFallback && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs animate-in fade-in">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold">Mineração NLP Heurística Local Ativada: </strong>
                    <span>
                      As entidades foram extraídas com sucesso diretamente pelo motor semântico integrado, contornando momentaneamente o limite de taxa do Gemini.
                    </span>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {extractError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold">Aviso na Extração: </strong>
                    <span>{extractError}</span>
                  </div>
                </div>
              )}

              {/* Joint Extraction Toggle */}
              <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200 rounded-xl p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">
                      Extração Conjunta SOTA (NER + Relações RDF)
                    </span>
                    <span className="text-[11px] text-indigo-800">
                      Modela simultaneamente entidades com pontuação de saliência e seus tripletos semânticos em um único passo
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={isJointExtraction}
                    onChange={(e) => setIsJointExtraction(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Action Trigger Button */}
              <button
                type="button"
                id="btn-extract-article-entities"
                onClick={handleExtractFromArticle}
                disabled={isExtracting || !articleText.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Minerando ontologia e relações com IA ({activeModel})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isJointExtraction ? "Executar Extração Conjunta (Entidades + Tripletos)" : "Extrair Entidades e Conceitos do Artigo"}</span>
                  </>
                )}
              </button>

              {/* Extracted Results Panel */}
              {extractedEntities.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                  
                  {/* Article summary if present */}
                  {articleSummary && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-0.5">
                        Contexto do Artigo:
                      </span>
                      <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                        {articleSummary}
                      </p>
                    </div>
                  )}

                  {/* Top Bar with actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-800">
                        {extractedEntities.length} Entidades Identificadas ({selectedExtractedCount} selecionadas)
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(true)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Marcar Todas
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(false)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Desmarcar Todas
                      </button>
                    </div>
                  </div>

                  {/* Entities list with checkboxes and salience badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {extractedEntities.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleSelectItem(idx)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                          item.selected
                            ? "bg-white border-indigo-300 shadow-2xs text-slate-900"
                            : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-60"
                        }`}
                      >
                        <div className="mt-0.5 text-indigo-600">
                          {item.selected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate">
                              {item.entity}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded shrink-0">
                              {item.category}
                            </span>
                          </div>
                          
                          {/* Canonical & Salience Badge */}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {item.salienceScore !== undefined && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                                  item.salienceLevel === "central" || item.salienceScore >= 65
                                    ? "bg-purple-100 text-purple-700 border-purple-200"
                                    : item.salienceLevel === "supporting" || item.salienceScore >= 40
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{item.salienceScore}% ({item.salienceLevel === "central" ? "Central" : item.salienceLevel === "supporting" ? "Apoio" : "Periférica"})</span>
                              </span>
                            )}
                            {item.canonicalName && item.canonicalName !== item.entity && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                                Canônico: {item.canonicalName}
                              </span>
                            )}
                          </div>

                          {/* Disambiguation Context / PoolParty explanation */}
                          {item.disambiguationContext && (
                            <div className="mt-1.5 p-1.5 bg-amber-50/70 border border-amber-200/60 rounded text-[10px] text-amber-900 leading-tight">
                              <span className="font-bold text-amber-950">Desambiguação: </span>
                              {item.disambiguationContext}
                            </div>
                          )}

                          {item.relevance && (
                            <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-2">
                              {item.relevance}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extracted Triplets (RDF) section */}
                  {extractedTriplets.length > 0 && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          {extractedTriplets.length} Tripletos Semânticos (RDF) Extraídos Conjuntamente
                        </span>
                        <span className="text-[10px] text-purple-700 font-medium">Vinculação automática ao Grafo</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {extractedTriplets.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-purple-200 text-purple-900 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                          >
                            <strong className="font-semibold">{t.subject}</strong>
                            <span className="text-purple-600 font-mono text-[9px]">[{t.predicate}]</span>
                            <span>{t.object}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transfer to list button */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleApplySelectedToList}
                      disabled={selectedExtractedCount === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Transferir ({selectedExtractedCount}) para a Lista de Geração</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {tab === "list" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Lista de Entidades & Categorias
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Formato: <code className="text-indigo-600 font-mono">Entidade, Categoria</code> ou apenas <code className="text-indigo-600 font-mono">Entidade</code>
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  disabled={isProcessing}
                  placeholder={`Exemplo:
SEO Semântico, Marketing Digital
Linked data, Tecnologia da Web
Knowledge Graph, Inteligência Artificial & Busca
Ontologia Web, Ciência da Informação
Topic Clusters, Estratégia de Conteúdo
Entity Recognition, Processamento de Linguagem Natural`}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Suporta colunas copiadas do Excel, Google Sheets ou arquivos .CSV
                  </span>
                  <span className="font-bold text-slate-700">
                    {rawInput.split("\n").filter((l) => l.trim()).length} termos carregados
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria Padrão de Fallback (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: SEO Semântico, Marketing de Conteúdo (aplicada quando a linha não tiver categoria)"
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Real-time Progress Bar */}
          {isProcessing && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  Processando: {progress.currentItem || "Iniciando..."}
                </span>
                <span>
                  {progress.current} de {progress.total} (
                  {Math.round((progress.current / progress.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-indigo-200/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Live Activity Logs */}
          {logs.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Log de Execução em Tempo Real
              </label>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] h-32 overflow-y-auto space-y-1 shadow-inner">
                {logs.map((log, index) => (
                  <div key={index} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {isProcessing ? (
              <button
                type="button"
                onClick={() => setShouldStop(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar Processamento</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-start-bulk-generation"
                onClick={handleStartBatch}
                disabled={!rawInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  Iniciar Geração em Lote ({rawInput.split("\n").filter((l) => l.trim()).length} itens)
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

