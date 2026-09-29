import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  Share2,
  BookOpen,
  Tag,
  Edit3,
  RefreshCw,
  Sparkles,
  Layers,
  FileCheck,
  Globe,
  Link2,
  ShieldCheck,
  Trash2,
  Plus
} from "lucide-react";
import { SeoEntityDefinition } from "../types";

interface EntityDetailModalProps {
  entity: SeoEntityDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entity: SeoEntityDefinition) => void;
  onRegenerate: (id: string) => void;
  onOpenWikidataReconcile?: (entity: SeoEntityDefinition) => void;
  onUpdateEntity?: (updated: SeoEntityDefinition) => void;
  onClearReconciliation?: (entityId: string) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entity,
  isOpen,
  onClose,
  onEdit,
  onRegenerate,
  onOpenWikidataReconcile,
  onUpdateEntity,
  onClearReconciliation,
}) => {
  const [activeTab, setActiveTab] = useState<"definition" | "schema" | "triplets" | "wikidata">("definition");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [newSameAsUrl, setNewSameAsUrl] = useState("");
  const [showAddUrl, setShowAddUrl] = useState(false);

  if (!isOpen || !entity) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const wordCount = entity.definition
    ? entity.definition.split(/\s+/).filter(Boolean).length
    : 0;

  // Build enhanced JSON-LD with sameAs array if present
  const sameAsList = entity.sameAs || [
    ...(entity.wikidataUrl ? [entity.wikidataUrl] : []),
    ...(entity.wikipediaUrl ? [entity.wikipediaUrl] : []),
  ];

  const handleDeleteSameAsUrl = (urlToDelete: string) => {
    if (!onUpdateEntity) return;
    const updatedSameAs = sameAsList.filter((u) => u !== urlToDelete);
    const updatedEntity: SeoEntityDefinition = {
      ...entity,
      sameAs: updatedSameAs,
      wikidataUrl: entity.wikidataUrl === urlToDelete ? undefined : entity.wikidataUrl,
      wikipediaUrl: entity.wikipediaUrl === urlToDelete ? undefined : entity.wikipediaUrl,
    };
    onUpdateEntity(updatedEntity);
  };

  const handleAddSameAsUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newSameAsUrl.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      alert("Por favor insira uma URL válida iniciando com https://");
      return;
    }
    if (!onUpdateEntity) return;
    if (!sameAsList.includes(clean)) {
      const updatedEntity: SeoEntityDefinition = {
        ...entity,
        sameAs: [...sameAsList, clean],
      };
      onUpdateEntity(updatedEntity);
    }
    setNewSameAsUrl("");
    setShowAddUrl(false);
  };

  const handleUnlinkWikidata = () => {
    if (!onClearReconciliation) return;
    if (confirm(`Deseja desvincular o identificador Wikidata e limpar as URLs sameAs de "${entity.entity}"?`)) {
      onClearReconciliation(entity.id);
    }
  };


  const jsonLdData = entity.jsonLd
    ? {
        ...entity.jsonLd,
        ...(sameAsList.length > 0 ? { sameAs: sameAsList } : {}),
      }
    : {
        "@context": "https://schema.org",
        "@type": entity.schemaType || "DefinedTerm",
        name: entity.entity,
        description: entity.shortSummary || entity.definition.slice(0, 160),
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: `Glossário de ${entity.category || "SEO Semântico"}`,
        },
        ...(sameAsList.length > 0 ? { sameAs: sameAsList } : {}),
      };

  const jsonLdString = JSON.stringify(jsonLdData, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fdd910]/20 border border-[#907d24]/30 flex items-center justify-center text-[#302c33] font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{entity.entity}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-800 border border-blue-200">
                  {entity.category}
                </span>
                {entity.salienceScore !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                      entity.salienceLevel === "central" || entity.salienceScore >= 65
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : entity.salienceLevel === "supporting" || entity.salienceScore >= 40
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{entity.salienceScore}% ({entity.salienceLevel === "central" ? "Central" : entity.salienceLevel === "supporting" ? "Apoio" : "Periférica"})</span>
                  </span>
                )}
                {entity.wikidataId && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2576c0]/15 text-[#2576c0] border border-[#2576c0]/30">
                    Wikidata: {entity.wikidataId}
                  </span>
                )}
                {entity.googleMid && (
                  <a
                    href={entity.googleKgUrl || `https://www.google.com/search?kgmid=${encodeURIComponent(entity.googleMid)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:underline flex items-center gap-1"
                  >
                    Google KG: {entity.googleMid}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {wordCount} palavras • {entity.definition?.length || 0} caracteres • Criado em{" "}
                {new Date(entity.createdAt || Date.now()).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEdit(entity);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("definition")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "definition"
                ? "border-[#302c33] text-[#302c33] font-bold bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Definição & Autoridade</span>
          </button>

          <button
            onClick={() => setActiveTab("schema")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "schema"
                ? "border-[#7bc970] text-[#2d7a22] font-bold bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Schema.org JSON-LD</span>
          </button>

          <button
            onClick={() => setActiveTab("triplets")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "triplets"
                ? "border-[#590050] text-[#590050] font-bold bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Tripletos & Termos ({entity.semanticTriplets?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("wikidata")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "wikidata"
                ? "border-[#2576c0] text-[#2576c0] font-bold bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4 text-[#2576c0]" />
            <span>Wikidata & sameAs {entity.wikidataId ? `(${entity.wikidataId})` : ""}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          
          {activeTab === "definition" && (
            <div className="space-y-5">
              
              {/* Short Summary Pill */}
              {entity.shortSummary && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                    Resumo Ontológico Rápido (Featured Snippet)
                  </span>
                  <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
                    "{entity.shortSummary}"
                  </p>
                </div>
              )}

              {/* Main Definition Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Definição Completa
                  </span>
                  <button
                    onClick={() => copyToClipboard(entity.definition, "def")}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {copiedType === "def" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 text-xs sm:text-sm leading-relaxed space-y-3 font-sans whitespace-pre-line">
                  {entity.definition}
                </div>
              </div>

              {/* Wikidata / sameAs mini badge if reconciled */}
              {entity.wikidataId && (
                <div className="p-3 bg-[#2576c0]/10 border border-[#2576c0]/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-4 h-4 text-[#2576c0]" />
                    <span className="font-bold text-[#302c33]">Wikidata Q-ID:</span>
                    <span className="font-mono font-bold text-[#2576c0]">{entity.wikidataId}</span>
                  </div>
                  {entity.wikidataUrl && (
                    <a
                      href={entity.wikidataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#2576c0] hover:underline flex items-center gap-1"
                    >
                      <span>Ver no Wikidata</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Authoritative Sources */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Fontes de Autoridade / Citações
                </span>
                {entity.sources && entity.sources.length > 0 ? (
                  <div className="space-y-1.5">
                    {entity.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-xs text-blue-600 font-medium transition-all group"
                      >
                        <span className="truncate pr-2">{src}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma fonte vinculada.</p>
                )}
              </div>

            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Marcação de Dados Estruturados Schema.org
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Insira este bloco script no cabeçalho <code className="text-emerald-700 font-bold">&lt;head&gt;</code> do seu artigo ou glossário
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(`<script type="application/ld+json">\n${jsonLdString}\n</script>`, "schema")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedType === "schema" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON-LD</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <pre>{`<script type="application/ld+json">\n${jsonLdString}\n</script>`}</pre>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                <span>Validador Oficial de Resultados Ricos do Google:</span>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2576c0] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Abrir Google Rich Results Test</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === "triplets" && (
            <div className="space-y-5">
              {/* Semantic Triplets */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Tripletos Semânticos RDF (Knowledge Graph)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Relações ontológicas extraídas para compor o grafo de conhecimento e mapeamento de entidades do Google.
                </p>

                {entity.semanticTriplets && entity.semanticTriplets.length > 0 ? (
                  <div className="space-y-2">
                    {entity.semanticTriplets.map((t, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {t.subject}
                        </span>
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-[11px]">
                          → {t.predicate} →
                        </span>
                        <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {t.object}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum tripleto cadastrado.</p>
                )}
              </div>

              {/* Semantic Related Keywords */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Termos semanticamente relacionados
                </h4>
                {entity.lsiKeywords && entity.lsiKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {entity.lsiKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg text-xs border border-slate-200/80"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum termo semanticamente relacionado registrado.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "wikidata" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#302c33] uppercase tracking-wider">
                    Mapeamento Wikidata & Wikipedia (sameAs)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Reconcilie esta entidade com a base de conhecimento mundial para maximizar a desambiguação no Google Knowledge Graph.
                  </p>
                </div>

                {onOpenWikidataReconcile && (
                  <button
                    onClick={() => onOpenWikidataReconcile(entity)}
                    className="px-3.5 py-1.5 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Reconciliar com Wikidata</span>
                  </button>
                )}
              </div>

              {entity.wikidataId || sameAsList.length > 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#302c33]">{entity.entity}</span>
                      {entity.wikidataId && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#2576c0]/15 text-[#2576c0]">
                          {entity.wikidataId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entity.wikidataId && (
                        <span className="text-[10px] uppercase font-bold text-[#7bc970] bg-[#7bc970]/15 px-2 py-0.5 rounded-full border border-[#7bc970]/30">
                          Reconciliado
                        </span>
                      )}
                      {onClearReconciliation && (
                        <button
                          type="button"
                          onClick={handleUnlinkWikidata}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Desvincular Wikidata</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {entity.googleMid && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-900 tracking-wider block">
                            Google Knowledge Graph Machine ID (Freebase P646)
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-800">
                            {entity.googleMid}
                          </span>
                        </div>
                      </div>
                      <a
                        href={entity.googleKgUrl || `https://www.google.com/search?kgmid=${encodeURIComponent(entity.googleMid)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                      >
                        <span>Abrir no Google KG</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {entity.wikidataDescription && (
                    <p className="text-xs text-slate-600">{entity.wikidataDescription}</p>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        URLs sameAs vinculadas ({sameAsList.length}):
                      </span>
                      {onUpdateEntity && (
                        <button
                          type="button"
                          onClick={() => setShowAddUrl(!showAddUrl)}
                          className="text-[11px] font-semibold text-[#2576c0] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar URL</span>
                        </button>
                      )}
                    </div>

                    {/* Add URL form */}
                    {showAddUrl && (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 animate-in fade-in">
                        <input
                          type="url"
                          value={newSameAsUrl}
                          onChange={(e) => setNewSameAsUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddSameAsUrl()}
                          placeholder="https://en.wikipedia.org/wiki/Nome_Correto"
                          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#2576c0]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSameAsUrl()}
                          className="px-3 py-1.5 bg-[#2576c0] text-white text-xs font-bold rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddUrl(false);
                            setNewSameAsUrl("");
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* URLs List */}
                    <div className="space-y-1.5">
                      {sameAsList.length > 0 ? (
                        sameAsList.map((url, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs text-[#2576c0] group"
                          >
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 hover:underline truncate max-w-[80%]"
                              title={url}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{url}</span>
                            </a>
                            {onUpdateEntity && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSameAsUrl(url)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                                title="Deletar esta URL canônica"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma URL sameAs cadastrada.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <Globe className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Esta entidade ainda não possui um identificador Wikidata vinculado.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Clique no botão acima para pesquisar e conectar automaticamente o Q-ID canônico e URLs da Wikipedia ao Schema.org sameAs.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onRegenerate(entity.id);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerar com IA</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

