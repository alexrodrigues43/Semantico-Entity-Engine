import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Info,
  Link2,
  Trash2,
  Plus
} from "lucide-react";
import { SeoEntityDefinition, WikidataMatch } from "../types";

interface WikidataReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: SeoEntityDefinition | null;
  allEntities?: SeoEntityDefinition[];
  onApplyReconciliation: (entityId: string, match: WikidataMatch) => void;
  onBulkApplyReconciliation?: (updates: { id: string; match: WikidataMatch }[]) => void;
  onClearReconciliation?: (entityId: string) => void;
}

export const WikidataReconcileModal: React.FC<WikidataReconcileModalProps> = ({
  isOpen,
  onClose,
  entity,
  allEntities = [],
  onApplyReconciliation,
  onBulkApplyReconciliation,
  onClearReconciliation,
}) => {
  const [searchTerm, setSearchTerm] = useState(entity?.entity || "");
  const [category, setCategory] = useState(entity?.category || "");
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<WikidataMatch[]>([]);
  const [topMatch, setTopMatch] = useState<WikidataMatch | null>(null);
  const [customSameAsUrls, setCustomSameAsUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [sourceUsed, setSourceUsed] = useState<string>("");
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Bulk mode states
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<Array<{ id: string; entity: string; topMatch: WikidataMatch | null }>>([]);

  // When topMatch changes, update editable sameAs URLs
  useEffect(() => {
    if (topMatch) {
      const urls = Array.from(new Set([
        topMatch.wikidataUrl,
        topMatch.wikipediaUrl,
        ...(topMatch.sameAsUrls || [])
      ])).filter(Boolean) as string[];
      setCustomSameAsUrls(urls);
    } else {
      setCustomSameAsUrls([]);
    }
  }, [topMatch]);

  const handleSearch = async (queryToUse?: string, catToUse?: string) => {
    const q = (queryToUse || searchTerm).trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/seo-definitions/reconcile-wikidata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: q,
          category: catToUse || category,
          definition: entity?.definition || "",
        }),
      });

      if (!response.ok) throw new Error("Erro na busca");

      const data = await response.json();
      setMatches(data.matches || []);
      setTopMatch(data.topMatch || null);
      setSourceUsed(data.source || "wikidata_api");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entity) {
      setSearchTerm(entity.entity);
      setCategory(entity.category);
      handleSearch(entity.entity, entity.category);
    }
  }, [entity]);

  if (!isOpen) return null;

  const handleRemoveUrl = (urlToRemove: string) => {
    setCustomSameAsUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newUrlInput.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      alert("Por favor insira uma URL válida iniciando com https://");
      return;
    }
    if (!customSameAsUrls.includes(clean)) {
      setCustomSameAsUrls((prev) => [...prev, clean]);
    }
    setNewUrlInput("");
    setShowAddUrl(false);
  };

  const handleApply = (matchToApply: WikidataMatch) => {
    if (!entity) return;
    
    // Construct match with user-curated canonical URLs
    const wikidataUrlInList = customSameAsUrls.find(u => u.includes("wikidata.org"));
    const wikipediaUrlInList = customSameAsUrls.find(u => u.includes("wikipedia.org"));

    const curatedMatch: WikidataMatch = {
      ...matchToApply,
      wikidataUrl: wikidataUrlInList || "",
      wikipediaUrl: wikipediaUrlInList || "",
      sameAsUrls: customSameAsUrls,
    };

    onApplyReconciliation(entity.id, curatedMatch);
    setAppliedId(matchToApply.wikidataId);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSelectOtherMatch = (otherMatch: WikidataMatch) => {
    setTopMatch(otherMatch);
    const urls = Array.from(new Set([
      otherMatch.wikidataUrl,
      otherMatch.wikipediaUrl,
      ...(otherMatch.sameAsUrls || [])
    ])).filter(Boolean) as string[];
    setCustomSameAsUrls(urls);
  };

  const handleClearCurrent = () => {
    if (!entity || !onClearReconciliation) return;
    if (confirm(`Deseja desvincular o identificador Wikidata e limpar as URLs sameAs de "${entity.entity}"?`)) {
      onClearReconciliation(entity.id);
      onClose();
    }
  };

  const handleRunBulk = async () => {
    if (!allEntities.length) return;
    setIsBulkLoading(true);
    try {
      const response = await fetch("/api/seo-definitions/reconcile-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: allEntities.map((e) => ({ id: e.id, entity: e.entity, category: e.category })),
        }),
      });

      if (!response.ok) throw new Error("Erro no lote");
      const data = await response.json();
      setBulkResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleApplyAllBulk = () => {
    if (!onBulkApplyReconciliation) return;
    const updates = bulkResults
      .filter((r) => r.topMatch !== null)
      .map((r) => ({ id: r.id, match: r.topMatch! }));

    onBulkApplyReconciliation(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#302c33] text-white flex items-center justify-between border-b border-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fdd910] text-[#000000] flex items-center justify-center font-black shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Reconciliação com Wikidata & Wikipedia (sameAs)
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#7bc970]/20 text-[#7bc970] border border-[#7bc970]/30">
                  Knowledge Graph
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Vincule identificadores únicos mundiais (Q-ID) e URLs canônicas ao seu Schema.org
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setMode("single")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "single"
                ? "border-[#fdd910] text-[#302c33] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Reconciliar Entidade Atual {entity ? `(${entity.entity})` : ""}</span>
          </button>

          {allEntities.length > 0 && (
            <button
              onClick={() => setMode("bulk")}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === "bulk"
                  ? "border-[#fdd910] text-[#302c33] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#590050]" />
              <span>Reconciliar Glossário em Lote ({allEntities.length} termos)</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5">
          {mode === "single" ? (
            <>
              {/* If entity already has Wikidata linked, show banner with unlink option */}
              {entity && (entity.wikidataId || (entity.sameAs && entity.sameAs.length > 0)) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-blue-900">
                      Entidade vinculada atualmente: <strong className="font-mono font-bold">{entity.wikidataId || "Sem Q-ID"}</strong> ({entity.sameAs?.length || 0} URLs sameAs)
                    </span>
                  </div>
                  {onClearReconciliation && (
                    <button
                      onClick={handleClearCurrent}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Desvincular / Limpar</span>
                    </button>
                  )}
                </div>
              )}

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Digite o nome da entidade para consultar Wikidata..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#302c33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fdd910]"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-[#302c33] hover:bg-[#000000] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#fdd910]" />
                  ) : (
                    <Globe className="w-4 h-4 text-[#fdd910]" />
                  )}
                  <span>Buscar no Wikidata</span>
                </button>
              </div>

              {/* Status or results */}
              {isLoading && (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#590050] mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    Consultando API oficial do Wikidata e bases enciclopédicas...
                  </p>
                </div>
              )}

              {!isLoading && topMatch && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Melhor Correspondência Ontológica
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2d7a22] bg-[#7bc970]/15 px-2.5 py-0.5 rounded-full border border-[#7bc970]/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confiança {topMatch.confidence}%
                    </span>
                  </div>

                  {/* Top Match Card */}
                  <div className="bg-slate-50 border-2 border-[#2576c0]/30 rounded-xl p-5 space-y-3 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#302c33]">
                            {topMatch.label}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-[#2576c0]/15 text-[#2576c0] font-mono text-xs font-bold border border-[#2576c0]/20">
                            {topMatch.wikidataId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {topMatch.description || "Entidade conceitual registrada no Wikidata."}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApply(topMatch)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          appliedId === topMatch.wikidataId
                            ? "bg-[#7bc970] text-black"
                            : "bg-[#fdd910] hover:bg-[#ffe30e] text-black shadow-sm"
                        }`}
                      >
                        {appliedId === topMatch.wikidataId ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Vinculado!</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" />
                            <span>Vincular ao Schema sameAs</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* URLs included in sameAs with delete/manage capabilities */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          URLs canônicas que serão adicionadas ao seu campo sameAs:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddUrl(!showAddUrl)}
                          className="text-[11px] font-semibold text-[#2576c0] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar URL manual</span>
                        </button>
                      </div>

                      {/* Add Custom URL Input */}
                      {showAddUrl && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 animate-in fade-in">
                          <input
                            type="url"
                            value={newUrlInput}
                            onChange={(e) => setNewUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                            placeholder="https://en.wikipedia.org/wiki/Nome_Correto"
                            className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#2576c0]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAddUrl()}
                            className="px-3 py-1.5 bg-[#2576c0] text-white text-xs font-bold rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddUrl(false);
                              setNewUrlInput("");
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* URL Pills with Delete Action */}
                      <div className="flex flex-wrap gap-2">
                        {customSameAsUrls.length > 0 ? (
                          customSameAsUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2576c0] bg-white pl-2.5 pr-1.5 py-1 rounded-md border border-slate-200 shadow-2xs group"
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline truncate max-w-[240px] sm:max-w-[320px]"
                                title={url}
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{url}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveUrl(url)}
                                className="p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Deletar esta URL canônica"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            Nenhuma URL canônica selecionada. Você pode adicionar manualmente ou selecionar outra correspondência abaixo.
                          </div>
                        )}
                      </div>
                    </div>

                    {topMatch.aliases && topMatch.aliases.length > 0 && (
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Sinônimos no Wikidata:</span>
                        <span>{topMatch.aliases.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Other Matches */}
                  {matches.length > 1 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-500">Outros resultados no Wikidata:</span>
                      <div className="space-y-2">
                        {matches.slice(1).map((m) => (
                          <div
                            key={m.wikidataId}
                            className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 hover:border-slate-300"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">{m.label}</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {m.wikidataId}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
                            </div>
                            <button
                              onClick={() => handleSelectOtherMatch(m)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#302c33] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                            >
                              Selecionar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !topMatch && (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">Nenhuma correspondência encontrada no Wikidata.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tente refinar a busca digitando o termo em português ou inglês.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Bulk Reconcile Mode */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#302c33]">
                      Reconciliação Automática do Glossário Completo
                    </h3>
                    <p className="text-xs text-slate-500">
                      O sistema consultará o Wikidata para todas as {allEntities.length} entidades cadastradas e vinculará os Q-IDs automaticamente.
                    </p>
                  </div>
                  <button
                    onClick={handleRunBulk}
                    disabled={isBulkLoading}
                    className="px-4 py-2 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isBulkLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#fdd910]" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Iniciar Varredura em Lote</span>
                  </button>
                </div>
              </div>

              {/* Bulk Results Table */}
              {bulkResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#302c33]">
                      Resultados ({bulkResults.filter((r) => r.topMatch).length} de {bulkResults.length} encontrados)
                    </span>
                    <button
                      onClick={handleApplyAllBulk}
                      className="px-3.5 py-1.5 bg-[#7bc970] text-black text-xs font-bold rounded-lg shadow-sm hover:bg-[#6ab860] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar Todos ao Glossário</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[40vh] overflow-y-auto">
                    {bulkResults.map((r, i) => (
                      <div key={i} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#302c33]">{r.entity}</span>
                            {r.topMatch ? (
                              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-[#2576c0]/15 text-[#2576c0]">
                                {r.topMatch.wikidataId}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-400">
                                Não encontrado
                              </span>
                            )}
                          </div>
                          {r.topMatch?.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {r.topMatch.description}
                            </p>
                          )}
                        </div>

                        {r.topMatch && (
                          <div className="flex items-center gap-2">
                            <a
                              href={r.topMatch.wikidataUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-[#2576c0]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                onApplyReconciliation(r.id, r.topMatch!);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#fdd910] text-[#302c33] font-bold text-[11px] rounded transition-colors cursor-pointer"
                            >
                              Vincular
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7bc970]" />
            <span>Compatível com Google Knowledge Graph & Schema.org DefinedTerm</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

