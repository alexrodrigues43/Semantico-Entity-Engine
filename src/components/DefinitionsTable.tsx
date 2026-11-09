import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  Edit3,
  Sparkles,
  Layers,
  Code,
  Tag,
  Share2,
  FileText,
  AlertCircle,
  Target,
  Globe,
  Settings2
} from "lucide-react";
import { SeoEntityDefinition } from "../types";
import { SupportedLang, getTranslations } from "../lib/i18n";

interface DefinitionsTableProps {
  definitions: SeoEntityDefinition[];
  onSelectEntity: (entity: SeoEntityDefinition) => void;
  onEditEntity: (entity: SeoEntityDefinition) => void;
  onDeleteEntity: (id: string) => void;
  onRegenerateEntity: (id: string) => void;
  onOpenBatchModal: () => void;
  onOpenSingleModal: () => void;
  onOpenTopicalAudit?: () => void;
  onOpenWikidataModal?: () => void;
  onOpenPromptModal?: () => void;
  uiLang?: SupportedLang;
}

export const DefinitionsTable: React.FC<DefinitionsTableProps> = ({
  definitions,
  onSelectEntity,
  onEditEntity,
  onDeleteEntity,
  onRegenerateEntity,
  onOpenBatchModal,
  onOpenSingleModal,
  onOpenTopicalAudit,
  onOpenWikidataModal,
  onOpenPromptModal,
  uiLang = "pt",
}) => {
  const t = getTranslations(uiLang);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    definitions.forEach((d) => {
      if (d.category && d.category.trim()) {
        set.add(d.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [definitions]);

  // Filter definitions
  const filteredDefinitions = useMemo(() => {
    return definitions.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.lsiKeywords && item.lsiKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [definitions, searchQuery, selectedCategory]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredDefinitions.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`${t.table.deleteConfirm} (${selectedIds.size})`)) {
      selectedIds.forEach((id) => onDeleteEntity(id));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1a5d38] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1a5d38] animate-pulse" aria-hidden="true" />
            <span>{t.table.badge}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight">
            {t.table.title}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {t.table.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenTopicalAudit && (
            <button
              onClick={onOpenTopicalAudit}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Target className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
              <span>{t.subnav.topicalAudit}</span>
            </button>
          )}

          {onOpenWikidataModal && (
            <button
              onClick={onOpenWikidataModal}
              className="hidden lg:flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98"
              title={t.wikidataModal.title}
              aria-label={t.wikidataModal.title}
            >
              <Globe className="w-3.5 h-3.5 text-[#1a5d38]" aria-hidden="true" />
              <span>{t.subnav.wikidata}</span>
            </button>
          )}

          <button
            onClick={onOpenBatchModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Layers className="w-3.5 h-3.5 text-[#1a5d38]" aria-hidden="true" />
            <span>{t.subnav.batch}</span>
          </button>

          <button
            onClick={onOpenSingleModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f5be38] hover:bg-[#eab308] text-slate-950 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" aria-hidden="true" />
            <span>{t.subnav.newEntity}</span>
          </button>

          {onOpenPromptModal && (
            <button
              onClick={onOpenPromptModal}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer active:scale-98 flex items-center justify-center"
              title={uiLang === "en" ? "AI Model & Prompt Settings" : uiLang === "es" ? "Configuración de Prompts y Modelos de IA" : "Configurações de Prompts & Modelos de IA"}
              aria-label={uiLang === "en" ? "AI Model & Prompt Settings" : uiLang === "es" ? "Configuración de Prompts y Modelos de IA" : "Configurações de Prompts & Modelos de IA"}
            >
              <Settings2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-88">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="search-input"
              type="text"
              placeholder={t.table.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-base sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5d38]/20 focus:border-[#1a5d38] text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label={uiLang === "en" ? "Clear search" : uiLang === "es" ? "Limpiar búsqueda" : "Limpar busca"}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter & Stats */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{t.table.categoryFilter}</span>
            </div>
            
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-base sm:text-xs font-semibold bg-slate-50/80 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d38]/20 focus:border-[#1a5d38] cursor-pointer min-h-[44px]"
            >
              <option value="all">{t.table.allCategories} ({definitions.length})</option>
              {categories.map((cat) => {
                const count = definitions.filter((d) => d.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>

            {selectedIds.size > 0 && (
              <button
                id="btn-delete-bulk-selected"
                onClick={handleDeleteSelected}
                className="min-h-[44px] flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-3 py-2 transition-colors ml-auto sm:ml-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.table.deleteSelected} ({selectedIds.size})</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredDefinitions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <AlertCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {t.table.emptyTitle}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
              {searchQuery || selectedCategory !== "all"
                ? t.table.emptyFiltered
                : t.table.emptySubtitle}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onOpenSingleModal}
                className="min-h-[44px] px-5 py-2.5 bg-[#f5be38] hover:bg-[#eab308] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{t.subnav.newEntity}</span>
              </button>
              <button
                onClick={onOpenBatchModal}
                className="min-h-[44px] px-5 py-2.5 bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Layers className="w-4 h-4 text-[#f5be38]" aria-hidden="true" />
                <span>{t.subnav.batch}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto" role="region" tabIndex={0} aria-label={t.table.title}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      id="select-all-checkbox"
                      checked={
                        selectedIds.size === filteredDefinitions.length &&
                        filteredDefinitions.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-slate-900 focus:ring-[#1a5d38] h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 w-48 font-bold">{t.table.thEntity}</th>
                  <th className="py-3 px-4 w-36 font-bold">{t.table.thCategory}</th>
                  <th className="py-3 px-4 font-bold">{t.table.thDefinition}</th>
                  <th className="py-3 px-4 w-48 font-bold">{t.table.thSources}</th>
                  <th className="py-3 px-4 w-28 text-right font-bold">{t.table.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDefinitions.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isGenerating = item.status === "generating";
                  const wordsCount = item.definition ? item.definition.split(/\s+/).filter(Boolean).length : 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#fdd910]/5 transition-colors group ${
                        isSelected ? "bg-[#fdd910]/15" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-[#000000] focus:ring-[#fdd910] h-4 w-4 cursor-pointer mt-1"
                        />
                      </td>

                      {/* Entidade Column */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <button
                            onClick={() => onSelectEntity(item)}
                            className="font-bold text-slate-900 hover:text-[#590050] text-sm text-left transition-colors flex items-center gap-1.5 group-hover:underline cursor-pointer"
                          >
                            <span>{item.entity}</span>
                            {isGenerating && (
                              <RefreshCw className="w-3.5 h-3.5 text-[#590050] animate-spin" />
                            )}
                          </button>

                          {/* Badges / Meta tags */}
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {item.salienceScore !== undefined && (
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  item.salienceLevel === "central" || item.salienceScore >= 65
                                    ? "bg-purple-100 text-purple-700 border-purple-200"
                                    : item.salienceLevel === "supporting" || item.salienceScore >= 40
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                                title={`Saliência Temática: ${item.salienceScore}% (${item.salienceLevel || "central"})`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{item.salienceScore}%</span>
                              </span>
                            )}
                            {item.wikidataId && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2576c0]/15 text-[#2576c0] border border-[#2576c0]/30" title={`Wikidata ID: ${item.wikidataId}`}>
                                {item.wikidataId}
                              </span>
                            )}
                            {item.googleMid && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Google Knowledge Graph MID: ${item.googleMid}`}>
                                KG: {item.googleMid}
                              </span>
                            )}
                            {item.schemaType && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2576c0]/10 text-[#2576c0] border border-[#2576c0]/20" title="Schema.org Markup disponível">
                                <Code className="w-2.5 h-2.5" />
                                {item.schemaType}
                              </span>
                            )}
                            {item.semanticTriplets && item.semanticTriplets.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#590050]/10 text-[#590050] border border-[#590050]/20" title={`${item.semanticTriplets.length} tripletos ontológicos`}>
                                <Share2 className="w-2.5 h-2.5" />
                                {item.semanticTriplets.length} Triplets
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria Column */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-[#302c33] border border-slate-200">
                          {item.category || "Geral"}
                        </span>
                      </td>

                      {/* Definição Column */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                            {item.definition || (
                              <span className="text-slate-400 italic">
                                {isGenerating ? t.table.generatingDef : t.table.noDef}
                              </span>
                            )}
                          </p>

                          {/* Quick semantic related keywords pill tags */}
                          {item.lsiKeywords && item.lsiKeywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1" title={t.table.relatedTermsTitle}>
                              {item.lsiKeywords.slice(0, 4).map((kw, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#302c33] border border-slate-200 shadow-2xs font-semibold"
                                >
                                  {kw}
                                </span>
                              ))}
                              {item.lsiKeywords.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  +{item.lsiKeywords.length - 4}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                {wordsCount} {t.table.words}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Fontes Column */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          {item.sources && item.sources.length > 0 ? (
                            item.sources.map((src, i) => {
                              let domain = src;
                              try {
                                domain = new URL(src).hostname.replace("www.", "");
                              } catch {
                                domain = src.slice(0, 24);
                              }
                              return (
                                <a
                                  key={i}
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-semibold text-[#2576c0] hover:text-[#000000] hover:underline truncate max-w-[200px]"
                                  title={src}
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{domain}</span>
                                </a>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {t.table.noSources}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações Column */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Copy Definition */}
                          <button
                            id={`btn-copy-def-${item.id}`}
                            onClick={() => copyToClipboard(item.definition, `def-${item.id}`)}
                            title="Copiar texto da definição"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            {copiedId === `def-${item.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#7bc970]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* View Detail / Modal */}
                          <button
                            id={`btn-view-${item.id}`}
                            onClick={() => onSelectEntity(item)}
                            title="Visualizar detalhes e Schema"
                            className="p-1.5 text-slate-400 hover:text-[#590050] hover:bg-[#590050]/10 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            id={`btn-edit-${item.id}`}
                            onClick={() => onEditEntity(item)}
                            title="Editar manualmente"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Regenerate AI */}
                          <button
                            id={`btn-regenerate-${item.id}`}
                            onClick={() => onRegenerateEntity(item.id)}
                            title="Regenerar com IA"
                            className="p-1.5 text-slate-400 hover:text-[#590050] hover:bg-[#590050]/10 rounded-md transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-[#590050]" : ""}`} />
                          </button>

                          {/* Delete */}
                          <button
                            id={`btn-delete-${item.id}`}
                            onClick={() => onDeleteEntity(item.id)}
                            title="Excluir"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Stats */}
        <div className="bg-slate-50/90 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            {t.table.footerShowing} <span className="font-bold text-[#302c33]">{filteredDefinitions.length}</span> {t.table.footerOf}{" "}
            <span className="font-bold text-[#302c33]">{definitions.length}</span> {t.table.footerEntities}
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>
              {t.table.footerOptimized}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Drag & Drop Action Banner */}
      <div 
        onClick={onOpenBatchModal}
        className="p-5 border-2 border-dashed border-[#302c33]/20 hover:border-[#fdd910] rounded-xl bg-white hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#fdd910]/20 border border-[#fdd910]/40 flex items-center justify-center text-[#302c33] group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#302c33] group-hover:text-[#590050] transition-colors">
              {t.table.bulkBannerTitle}
            </p>
            <p className="text-xs text-slate-500">
              {t.table.bulkBannerDesc}
            </p>
          </div>
        </div>
        <button className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] hover:bg-[#302c33] text-[#fdd910] text-xs font-bold rounded-lg shadow-sm transition-all">
          <span>{t.table.bulkBannerBtn}</span>
        </button>
      </div>
    </div>
  );
};
