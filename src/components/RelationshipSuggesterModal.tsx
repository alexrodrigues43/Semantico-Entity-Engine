import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Network,
  Check,
  X,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Plus,
  Info,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
} from "lucide-react";
import { SeoEntityDefinition, SuggestedRelationship, RelationshipType, SemanticTriplet } from "../types";

interface RelationshipSuggesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: SeoEntityDefinition[];
  onApplyRelationship: (sourceEntityName: string, triplet: SemanticTriplet, reciprocal?: boolean) => void;
  onBulkApplyRelationships: (relationships: { sourceEntityName: string; triplet: SemanticTriplet }[]) => void;
}

export const RelationshipSuggesterModal: React.FC<RelationshipSuggesterModalProps> = ({
  isOpen,
  onClose,
  definitions,
  onApplyRelationship,
  onBulkApplyRelationships,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedRelationship[]>([]);
  const [strategicInsight, setStrategicInsight] = useState<string>("");
  const [graphHealthScore, setGraphHealthScore] = useState<number>(0);
  const [detectedClusters, setDetectedClusters] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPredicate, setEditedPredicate] = useState<string>("");
  const [includeReciprocal, setIncludeReciprocal] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ai_suggestions" | "manual_linker">("ai_suggestions");

  // Manual Linker state
  const [manualSource, setManualSource] = useState<string>("");
  const [manualPredicate, setManualPredicate] = useState<string>("relacionadoCom");
  const [manualTarget, setManualTarget] = useState<string>("");
  const [manualType, setManualType] = useState<RelationshipType>("associative");

  const categories = Array.from(new Set(definitions.map((d) => d.category).filter(Boolean)));

  // Auto-analyze when opened for the first time if suggestions are empty and we have at least 2 entities
  useEffect(() => {
    if (isOpen && suggestions.length === 0 && definitions.length >= 2 && !isAnalyzing) {
      handleRunAnalysis();
    }
    if (definitions.length >= 2) {
      if (!manualSource) setManualSource(definitions[0].entity);
      if (!manualTarget && definitions.length > 1) setManualTarget(definitions[1].entity);
    }
  }, [isOpen]);

  const handleRunAnalysis = async () => {
    if (definitions.length < 2) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/seo-definitions/suggest-relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: definitions.map((d) => ({
            id: d.id,
            entity: d.entity,
            category: d.category,
            shortSummary: d.shortSummary,
            definition: d.definition,
            semanticTriplets: d.semanticTriplets,
          })),
          focusCategory: selectedCategory,
          maxSuggestions: 14,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na resposta da API de relações");
      }

      const data = await response.json();
      setSuggestions(data.suggestedRelationships || []);
      setStrategicInsight(data.strategicInsight || "");
      setGraphHealthScore(data.graphHealthScore || 80);
      setDetectedClusters(data.detectedClusters || []);
    } catch (err) {
      console.error("Erro ao analisar relações semânticas:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySingle = (sug: SuggestedRelationship) => {
    const triplet: SemanticTriplet = {
      subject: sug.sourceEntity,
      predicate: editingId === sug.id ? editedPredicate : sug.predicate,
      object: sug.targetEntity,
    };

    onApplyRelationship(sug.sourceEntity, triplet, includeReciprocal);

    setSuggestions((prev) =>
      prev.map((s) => (s.id === sug.id ? { ...s, status: "applied" } : s))
    );
    setEditingId(null);
  };

  const handleDismissSingle = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "dismissed" } : s))
    );
  };

  const handleBulkApply = () => {
    const pending = filteredSuggestions.filter((s) => s.status === "pending");
    if (pending.length === 0) return;

    const payload = pending.map((s) => ({
      sourceEntityName: s.sourceEntity,
      triplet: {
        subject: s.sourceEntity,
        predicate: s.predicate,
        object: s.targetEntity,
      },
    }));

    onBulkApplyRelationships(payload);

    setSuggestions((prev) =>
      prev.map((s) =>
        pending.some((p) => p.id === s.id) ? { ...s, status: "applied" } : s
      )
    );
  };

  const handleCreateManualLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSource || !manualTarget || !manualPredicate.trim()) return;
    if (manualSource === manualTarget) {
      alert("Selecione duas entidades diferentes para criar a relação.");
      return;
    }

    const triplet: SemanticTriplet = {
      subject: manualSource,
      predicate: manualPredicate.trim(),
      object: manualTarget,
    };

    onApplyRelationship(manualSource, triplet, includeReciprocal);

    // Add to suggestions list as applied
    const newSug: SuggestedRelationship = {
      id: `manual-${Date.now()}`,
      sourceEntity: manualSource,
      predicate: manualPredicate.trim(),
      targetEntity: manualTarget,
      relationshipType: manualType,
      confidence: 100,
      reasoning: "Relação ontológica criada manualmente pelo usuário.",
      schemaProperty: "isRelatedTo",
      status: "applied",
    };

    setSuggestions((prev) => [newSug, ...prev]);
    setActiveTab("ai_suggestions");
  };

  const filteredSuggestions = suggestions.filter((sug) => {
    const matchesCategory =
      selectedCategory === "all" ||
      definitions.find((d) => d.entity === sug.sourceEntity)?.category === selectedCategory ||
      definitions.find((d) => d.entity === sug.targetEntity)?.category === selectedCategory;

    const matchesType =
      selectedTypeFilter === "all" || sug.relationshipType === selectedTypeFilter;

    const matchesSearch =
      searchQuery === "" ||
      sug.sourceEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.predicate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.reasoning.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const appliedCount = suggestions.filter((s) => s.status === "applied").length;

  const getTypeBadge = (type: RelationshipType) => {
    switch (type) {
      case "hierarchical":
        return {
          label: "Hierárquica (Taxonomia)",
          classes: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "methodological":
        return {
          label: "Metodológica / Técnica",
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "causal":
        return {
          label: "Causal / Otimização",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "equivalence":
        return {
          label: "Equivalência Semântica",
          classes: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "associative":
      default:
        return {
          label: "Associativa / Contextual",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Relationship Suggester (Sugestor de Conexões Semânticas)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                  IA Ontológica
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Analisa entidades do glossário para sugerir tripletos RDF que fortalecem o Knowledge Graph interno
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs & Global Action Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ai_suggestions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ai_suggestions"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sugestões da IA ({suggestions.length})</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("manual_linker")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "manual_linker"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Relação Manual</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || definitions.length < 2}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Analisando Entidades..." : "Recalcular com Gemini"}</span>
            </button>

            {pendingCount > 0 && activeTab === "ai_suggestions" && (
              <button
                onClick={handleBulkApply}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Vincular todas as sugestões pendentes filtradas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Vincular Todas ({filteredSuggestions.filter((s) => s.status === "pending").length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {definitions.length < 2 ? (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-xl">
              <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Poucas entidades cadastradas</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Cadastre pelo menos 2 entidades no glossário para que o Gemini possa sugerir conexões semânticas entre elas.
              </p>
            </div>
          ) : activeTab === "ai_suggestions" ? (
            <>
              {/* Strategic Insights Banner */}
              {strategicInsight && (
                <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Insight Estratégico de Autoridade Tópica
                      </h4>
                    </div>
                    {graphHealthScore > 0 && (
                      <span className="text-[11px] font-bold text-indigo-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                        Densidade do Grafo: {graphHealthScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    {strategicInsight}
                  </p>

                  {detectedClusters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        Clusters Detectados:
                      </span>
                      {detectedClusters.map((cluster, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded-md"
                        >
                          {cluster}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Filtrar por entidade ou predicado..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Relationship Type Filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="all">Todos os Tipos de Relação</option>
                  <option value="hierarchical">Hierárquica (Taxonomia)</option>
                  <option value="methodological">Metodológica / Técnica</option>
                  <option value="causal">Causal / Otimização</option>
                  <option value="associative">Associativa / Contextual</option>
                  <option value="equivalence">Equivalência Semântica</option>
                </select>

                {/* Reciprocal checkbox */}
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeReciprocal}
                    onChange={(e) => setIncludeReciprocal(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Vincular nos dois nós</span>
                </label>

              </div>

              {/* Suggestions List */}
              <div className="space-y-3">
                {isAnalyzing ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      O Gemini está analisando co-ocorrências, ontologias e relações entre suas entidades...
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Calculando densidade de tripletos RDF e Schema.org
                    </p>
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">
                      {suggestions.length === 0
                        ? "Nenhuma sugestão gerada ainda."
                        : "Nenhuma sugestão corresponde aos filtros."}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {suggestions.length === 0
                        ? "Clique no botão 'Recalcular com Gemini' acima para iniciar a varredura semântica."
                        : "Experimente mudar os filtros de categoria ou tipo de relação."}
                    </p>
                  </div>
                ) : (
                  filteredSuggestions.map((sug) => {
                    const badge = getTypeBadge(sug.relationshipType);
                    const isApplied = sug.status === "applied";
                    const isDismissed = sug.status === "dismissed";
                    const isEditing = editingId === sug.id;

                    return (
                      <div
                        key={sug.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isApplied
                            ? "bg-emerald-50/60 border-emerald-200 opacity-90"
                            : isDismissed
                            ? "bg-slate-50 border-slate-200 opacity-50"
                            : "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-xs"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          
                          {/* Triplet Visual Flow */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Subject */}
                            <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-2xs">
                              {sug.sourceEntity}
                            </span>

                            {/* Predicate */}
                            <div className="flex items-center gap-1">
                              <span className="text-indigo-500 font-mono text-xs">──</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedPredicate}
                                  onChange={(e) => setEditedPredicate(e.target.value)}
                                  className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-300 rounded focus:outline-none"
                                />
                              ) : (
                                <span className="px-2.5 py-0.8 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-md">
                                  {sug.predicate}
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                            </div>

                            {/* Object */}
                            <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-2xs">
                              {sug.targetEntity}
                            </span>
                          </div>

                          {/* Confidence & Type Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.classes}`}
                            >
                              {badge.label}
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              {sug.confidence}% Confiança
                            </span>

                            {sug.schemaProperty && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded">
                                schema:{sug.schemaProperty}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reasoning & Actions */}
                        <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            <span className="font-bold text-slate-800">Impacto no Grafo: </span>
                            {sug.reasoning}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {isApplied ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                                <Check className="w-3.5 h-3.5" />
                                <span>Vinculada ao Grafo</span>
                              </span>
                            ) : isDismissed ? (
                              <button
                                onClick={() =>
                                  setSuggestions((prev) =>
                                    prev.map((s) =>
                                      s.id === sug.id ? { ...s, status: "pending" } : s
                                    )
                                  )
                                }
                                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 cursor-pointer"
                              >
                                Restaurar
                              </button>
                            ) : (
                              <>
                                {isEditing ? (
                                  <button
                                    onClick={() => handleApplySingle(sug)}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                                  >
                                    Salvar & Vincular
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingId(sug.id);
                                        setEditedPredicate(sug.predicate);
                                      }}
                                      title="Editar predicado"
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDismissSingle(sug.id)}
                                      title="Ignorar sugestão"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleApplySingle(sug)}
                                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Aceitar & Vincular</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Manual Linker Tab */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Criador Manual de Tripletos RDF Semânticos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estabeleça uma relação ontológica direta entre quaisquer duas entidades existentes
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateManualLink} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Entity Source */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Entidade Sujeito (Origem)
                    </label>
                    <select
                      value={manualSource}
                      onChange={(e) => setManualSource(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {definitions.map((d) => (
                        <option key={d.id} value={d.entity}>
                          {d.entity} ({d.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Predicate */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Predicado Ontológico (Relação)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: utiliza, alimenta, fundamenta, implementa..."
                      value={manualPredicate}
                      onChange={(e) => setManualPredicate(e.target.value)}
                      required
                      className="w-full p-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["utiliza", "fundamenta", "alimenta", "éSubconceitoDe", "estrutura", "aplica"].map(
                        (preset) => (
                          <button
                            type="button"
                            key={preset}
                            onClick={() => setManualPredicate(preset)}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded font-mono transition-colors cursor-pointer"
                          >
                            {preset}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Entity Target */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Entidade Objeto (Destino)
                    </label>
                    <select
                      value={manualTarget}
                      onChange={(e) => setManualTarget(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {definitions.map((d) => (
                        <option key={d.id} value={d.entity}>
                          {d.entity} ({d.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Relationship Type & Reciprocal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Classificação da Relação
                    </label>
                    <select
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value as RelationshipType)}
                      className="w-full p-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="associative">Associativa / Contextual</option>
                      <option value="hierarchical">Hierárquica (Taxonomia / Subclasse)</option>
                      <option value="methodological">Metodológica / Técnica</option>
                      <option value="causal">Causal / Otimização</option>
                      <option value="equivalence">Equivalência Semântica</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeReciprocal}
                        onChange={(e) => setIncludeReciprocal(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Vincular reciprocamente em ambas as entidades</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Tripleto ao Grafo</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Total de Sugestões: <strong className="text-slate-800">{suggestions.length}</strong>
            </span>
            <span>•</span>
            <span>
              Vinculadas: <strong className="text-emerald-700">{appliedCount}</strong>
            </span>
            <span>•</span>
            <span>
              Pendentes: <strong className="text-indigo-700">{pendingCount}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
