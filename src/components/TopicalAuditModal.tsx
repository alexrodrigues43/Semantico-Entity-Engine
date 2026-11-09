import React, { useState } from "react";
import {
  X,
  Target,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Network,
  BookOpen,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu
} from "lucide-react";
import {
  SeoEntityDefinition,
  TopicalAuditReport,
  MissingEntityGap,
  MissingEdgeGap,
  SemanticTriplet,
  GenerationModel
} from "../types";
import { SupportedLang, getTranslations } from "../lib/i18n";

interface TopicalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: SeoEntityDefinition[];
  selectedModel: GenerationModel;
  onAddEntity: (entity: SeoEntityDefinition) => void;
  onAddTriplet: (sourceId: string, triplet: SemanticTriplet) => void;
  onOpenBatchWithTerms?: (terms: string[]) => void;
  uiLang?: SupportedLang;
}

export const TopicalAuditModal: React.FC<TopicalAuditModalProps> = ({
  isOpen,
  onClose,
  definitions,
  selectedModel,
  onAddEntity,
  onAddTriplet,
  onOpenBatchWithTerms,
  uiLang = "pt",
}) => {
  const t = getTranslations(uiLang);
  const [contentLang, setContentLang] = useState<SupportedLang>(uiLang);
  const [topicScope, setTopicScope] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<TopicalAuditReport | null>(null);
  const [activeTab, setActiveTab] = useState<"gaps" | "edges" | "strategy">("gaps");
  const [generatingEntityId, setGeneratingEntityId] = useState<string | null>(null);
  const [addedEntityNames, setAddedEntityNames] = useState<Set<string>>(new Set());
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showLocalToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seo-definitions/audit-topical-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicScope.trim() || (definitions[0]?.category ? `Especialidade em ${definitions[0].category}` : "SEO Semântico e Knowledge Graphs"),
          content: articleContent.trim(),
          existingEntities: definitions.map((d) => ({
            id: d.id,
            entity: d.entity,
            category: d.category,
            semanticTriplets: d.semanticTriplets || [],
          })),
          model: selectedModel,
          language: contentLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao auditar lacunas tópicas");
      }

      const report: TopicalAuditReport = await response.json();
      setAuditReport(report);
      showLocalToast("Auditoria de autoridade tópica concluída!");
    } catch (err: any) {
      console.error("Erro na auditoria:", err);
      showLocalToast("Falha na auditoria. O auditor local foi ativado.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a missing entity directly and add to definitions
  const handleGenerateAndAddEntity = async (gap: MissingEntityGap) => {
    setGeneratingEntityId(gap.id);
    try {
      const response = await fetch("/api/seo-definitions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: gap.entity,
          category: gap.category,
          model: selectedModel,
          tone: "enciclopédico e autoritativo",
          length: "standard",
          language: contentLang,
          enableGrounding: true,
          salienceScore: gap.importance === "crítica" ? 95 : gap.importance === "alta" ? 82 : 68,
          salienceLevel: gap.importance === "crítica" ? "central" : "supporting",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar definição da entidade faltante");
      }

      const data = await response.json();
      const newEntity: SeoEntityDefinition = {
        id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        entity: gap.entity,
        category: gap.category,
        definition: data.definition || "",
        shortSummary: data.shortSummary || "",
        sources: data.sources || [],
        sourcesString: data.sourcesString || "",
        semanticTriplets: data.semanticTriplets || [],
        lsiKeywords: data.lsiKeywords || [],
        schemaType: data.schemaType || "DefinedTerm",
        jsonLd: data.jsonLd,
        sameAs: data.sameAs || [],
        wikidataId: data.wikidataId,
        wikidataUrl: data.wikidataUrl,
        googleMid: data.googleMid,
        googleKgUrl: data.googleKgUrl,
        salienceScore: data.salienceScore || 90,
        salienceLevel: data.salienceLevel || "central",
        modelUsed: data.modelUsed,
        createdAt: new Date().toISOString(),
        status: "completed",
      };

      onAddEntity(newEntity);
      setAddedEntityNames((prev) => new Set(prev).add(gap.entity.toLowerCase()));
      showLocalToast(
        uiLang === "en"
          ? `Entity "${gap.entity}" added to glossary successfully!`
          : uiLang === "es"
          ? `¡Entidad "${gap.entity}" añadida al glosario con éxito!`
          : `Entidade "${gap.entity}" adicionada ao glossário com sucesso!`
      );
    } catch (err: any) {
      console.error(err);
      showLocalToast(
        uiLang === "en"
          ? `Error generating "${gap.entity}". Please try again.`
          : uiLang === "es"
          ? `Error al generar "${gap.entity}". Inténtalo de nuevo.`
          : `Erro ao gerar "${gap.entity}". Tente novamente.`
      );
    } finally {
      setGeneratingEntityId(null);
    }
  };

  // Connect a missing edge directly into definitions
  const handleConnectMissingEdge = (edge: MissingEdgeGap) => {
    // Find matching source entity
    const sourceEnt = definitions.find(
      (d) => d.entity.toLowerCase() === edge.sourceEntity.toLowerCase()
    );

    if (sourceEnt) {
      const triplet: SemanticTriplet = {
        subject: sourceEnt.entity,
        predicate: edge.suggestedPredicate,
        object: edge.targetEntity,
      };
      onAddTriplet(sourceEnt.id, triplet);
      setConnectedEdgeIds((prev) => new Set(prev).add(edge.id));
      showLocalToast(
        uiLang === "en"
          ? `Edge "${edge.sourceEntity} → ${edge.targetEntity}" connected in Graph!`
          : uiLang === "es"
          ? `¡Arista "${edge.sourceEntity} → ${edge.targetEntity}" conectada en el Grafo!`
          : `Aresta "${edge.sourceEntity} → ${edge.targetEntity}" conectada no Grafo!`
      );
    } else {
      showLocalToast(
        uiLang === "en"
          ? `Source entity "${edge.sourceEntity}" is not yet in the glossary.`
          : uiLang === "es"
          ? `La entidad de origen "${edge.sourceEntity}" aún no está en el glosario.`
          : `Entidade de origem "${edge.sourceEntity}" ainda não está no glossário.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {t.topicalAuditModal.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 uppercase tracking-wide">
                  Topical Authority SOTA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.topicalAuditModal.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Audit Inputs Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.topicalAuditModal.scopeLabel}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={topicScope}
                    onChange={(e) => setTopicScope(e.target.value)}
                    placeholder={t.topicalAuditModal.scopePlaceholder}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-auto pt-5">
                <button
                  onClick={handleRunAudit}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.topicalAuditModal.btnRunning}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.topicalAuditModal.btnRun}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <details className="text-xs text-slate-600 pt-1 cursor-pointer">
              <summary className="font-medium text-purple-700 hover:underline">
                {t.topicalAuditModal.optionalArticle}
              </summary>
              <textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder={t.topicalAuditModal.articlePlaceholder}
                rows={3}
                className="w-full mt-2 p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </details>
          </div>

          {/* Audit Results Dashboard */}
          {auditReport ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Metric Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Topical Authority Gauge */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                      {t.topicalAuditModal.authorityGauge}
                    </span>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-purple-700">
                      {auditReport.topicalAuthorityScore}%
                    </span>
                    <span className="text-xs font-medium text-purple-600">
                      {auditReport.topicalAuthorityScore >= 80 ? "Elevada" : auditReport.topicalAuthorityScore >= 60 ? "Consolidando" : "Inicial"}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${auditReport.topicalAuthorityScore}%` }}
                    />
                  </div>
                </div>

                {/* Graph Density Score */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                      {t.topicalAuditModal.graphDensity}
                    </span>
                    <Network className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-700">
                      {auditReport.graphDensityScore}%
                    </span>
                    <span className="text-xs font-medium text-emerald-600">
                      {auditReport.totalConnectionsCount} arestas ativas
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${auditReport.graphDensityScore}%` }}
                    />
                  </div>
                </div>

                {/* Missing Entities Count */}
                <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">
                      {t.topicalAuditModal.missingNodes}
                    </span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-rose-700">
                      {auditReport.missingEntities.length}
                    </span>
                    <span className="text-xs font-medium text-rose-600">
                      entidades prioritárias
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Oportunidades de cobertura semântica E-E-A-T
                  </p>
                </div>

                {/* Missing Edges Count */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                      {t.topicalAuditModal.missingEdges}
                    </span>
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-700">
                      {auditReport.missingEdges.length}
                    </span>
                    <span className="text-xs font-medium text-amber-600">
                      arestas sugeridas
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Evitam "ilhas semânticas" isoladas no site
                  </p>
                </div>

              </div>

              {/* Python Core Engine Mathematical Metrics (if content was provided) */}
              {auditReport.qualityMetrics && (
                <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-white mr-1.5">Motor Semântico Rigoroso (FastAPI/PoolParty):</span>
                      <span className="text-slate-300">
                        {auditReport.qualityMetrics.isPythonEngineLive ? "Python Core Online" : "Cálculo Matemático Simbólico"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Densidade: <strong className="text-emerald-400">{(auditReport.qualityMetrics.entity_density * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Fluff Penalty: <strong className="text-amber-400">{(auditReport.qualityMetrics.vagueness_penalty * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Multiplicador: <strong className="text-cyan-400">{auditReport.qualityMetrics.quality_multiplier}x</strong>
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Buzzwords: <strong className="text-rose-400">{auditReport.qualityMetrics.buzzword_count}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs Switcher */}
              <div className="border-b border-slate-200 flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("gaps")}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === "gaps"
                        ? "border-purple-600 text-purple-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.topicalAuditModal.tabGaps} ({auditReport.missingEntities.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("edges")}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === "edges"
                        ? "border-purple-600 text-purple-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Network className="w-4 h-4" />
                    <span>{t.topicalAuditModal.tabEdges} ({auditReport.missingEdges.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("strategy")}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === "strategy"
                        ? "border-purple-600 text-purple-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.topicalAuditModal.tabStrategy}</span>
                  </button>
                </div>

                {auditReport.isLocalFallback && (
                  <span className="text-[11px] text-amber-600 font-medium px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                    {uiLang === "en" ? "Local Resilient Mode" : uiLang === "es" ? "Modo Resiliente Local" : "Modo Resiliente Local"}
                  </span>
                )}
              </div>

              {/* Tab 1: Missing Entities (Gaps) */}
              {activeTab === "gaps" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {uiLang === "en"
                        ? "Fundamental entities that search engines expect to find in your topical niche:"
                        : uiLang === "es"
                        ? "Entidades fundamentales que los buscadores esperan encontrar en su nicho temático:"
                        : "Entidades fundamentais que os buscadores esperam encontrar no seu nicho temático:"}
                    </span>
                    {onOpenBatchWithTerms && auditReport.missingEntities.length > 0 && (
                      <button
                        onClick={() => {
                          const missingTerms = auditReport.missingEntities
                            .filter((m) => !addedEntityNames.has(m.entity.toLowerCase()))
                            .map((m) => `${m.entity}, ${m.category}`);
                          onOpenBatchWithTerms(missingTerms);
                          onClose();
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{uiLang === "en" ? "Generate all in Batch" : uiLang === "es" ? "Generar todas por Lotes" : "Gerar todas em Lote"}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auditReport.missingEntities.map((gap) => {
                      const isAdded = addedEntityNames.has(gap.entity.toLowerCase()) ||
                        definitions.some((d) => d.entity.toLowerCase() === gap.entity.toLowerCase());
                      const isGenerating = generatingEntityId === gap.id;

                      const badgeColor =
                        gap.importance === "crítica"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : gap.importance === "alta"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-blue-100 text-blue-700 border-blue-200";

                      return (
                        <div
                          key={gap.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{gap.entity}</h3>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {gap.category} • Cluster: {gap.suggestedParentCluster}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeColor}`}>
                                {gap.importance}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                              {gap.reason}
                            </p>

                            <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 mb-3">
                              <span className="font-semibold text-slate-700">{uiLang === "en" ? "Intent: " : uiLang === "es" ? "Intención: " : "Intenção: "}</span>
                              {gap.estimatedSearchIntent}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            {isAdded ? (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{uiLang === "en" ? "Added to Glossary" : uiLang === "es" ? "Registrada en el Glosario" : "Cadastrada no Glossário"}</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleGenerateAndAddEntity(gap)}
                                disabled={isGenerating}
                                className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                              >
                                {isGenerating ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>{uiLang === "en" ? "Generating with AI..." : uiLang === "es" ? "Generando con IA..." : "Gerando com IA..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{uiLang === "en" ? "Generate & Add to Glossary" : uiLang === "es" ? "Generar y Añadir al Glosario" : "Gerar e Adicionar ao Glossário"}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Missing Edges (Relational Bridges) */}
              {activeTab === "edges" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    {uiLang === "en"
                      ? "Ontological bridges recommended to connect isolated nodes and enrich structured data:"
                      : uiLang === "es"
                      ? "Puentes ontológicos recomendados para conectar nodos aislados y enriquecer los datos estructurados:"
                      : "Pontes ontológicas recomendadas para conectar nós isolados e enriquecer os dados estruturados:"}
                  </p>

                  <div className="space-y-2.5">
                    {auditReport.missingEdges.map((edge) => {
                      const isConnected = connectedEdgeIds.has(edge.id);
                      return (
                        <div
                          key={edge.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-300 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {edge.sourceEntity}
                              </span>
                              <span className="text-xs font-semibold text-purple-600 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                {edge.suggestedPredicate}
                              </span>
                              <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {edge.targetEntity}
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-slate-500 ml-2">
                                {uiLang === "en" ? "Priority: " : uiLang === "es" ? "Prioridad: " : "Prioridade: "}{edge.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {edge.reasoning}
                            </p>
                          </div>

                          <div className="w-full sm:w-auto">
                            {isConnected ? (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{uiLang === "en" ? "Connected" : uiLang === "es" ? "Conectada" : "Conectada"}</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConnectMissingEdge(edge)}
                                className="w-full sm:w-auto py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                              >
                                <Network className="w-3.5 h-3.5" />
                                <span>{uiLang === "en" ? "Connect in Graph" : uiLang === "es" ? "Conectar en el Grafo" : "Conectar no Grafo"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Strategic Recommendations & Pillar Pages */}
              {activeTab === "strategy" && (
                <div className="space-y-4">
                  
                  {/* Pillar Pages Block */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      {uiLang === "en"
                        ? "Recommended Pillar Pages (Cornerstone Content)"
                        : uiLang === "es"
                        ? "Páginas Pilar Recomendadas (Cornerstone Content)"
                        : "Páginas Pilares Recomendadas (Cornerstone Content)"}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">
                      {uiLang === "en"
                        ? "These entities concentrate the highest semantic centrality and should contain in-depth articles with radial interlinking:"
                        : uiLang === "es"
                        ? "Estas entidades concentran la mayor centralidad semántica y deben contener artículos profundos con enlazado radial:"
                        : "Estas entidades concentram a maior centralidade semântica e devem conter artigos aprofundados com interlinking radial:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {auditReport.pillarEntities.map((pillar, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-900 shadow-sm flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                          <span>{pillar}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actionable Strategy Recommendations */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {uiLang === "en"
                        ? "Strategic Action Plan for Topical Authority"
                        : uiLang === "es"
                        ? "Plan de Acción Estratégico para Autoridad Tópica"
                        : "Plano de Ação Estratégico para Autoridade Tópica"}
                    </h3>
                    <ul className="space-y-2.5">
                      {auditReport.strategicRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">
                {uiLang === "en"
                  ? "Ready to audit your collection's topical authority"
                  : uiLang === "es"
                  ? "Listo para auditar la autoridad tópica de su colección"
                  : "Pronto para auditar a autoridade tópica do seu acervo"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                {uiLang === "en"
                  ? `Click the "Run Topical Audit" button above to analyze ${definitions.length} registered entities, discover content gaps, and identify missing edges in the Knowledge Graph.`
                  : uiLang === "es"
                  ? `Haga clic en el botón "Ejecutar Auditoría Tópica" arriba para analizar las ${definitions.length} entidades registradas, descubrir brechas de contenido e identificar aristas faltantes en el Knowledge Graph.`
                  : `Clique no botão "Executar Auditoria Tópica" acima para analisar as ${definitions.length} entidades cadastradas, descobrir lacunas de conteúdo e identificar arestas faltantes no Knowledge Graph.`}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>{uiLang === "en" ? "Model: " : uiLang === "es" ? "Modelo: " : "Modelo: "}{selectedModel}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            {t.topicalAuditModal.btnClose}
          </button>
        </div>

        {/* Local Toast Feedback */}
        {toast && (
          <div className="absolute bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

      </div>
    </div>
  );
};
