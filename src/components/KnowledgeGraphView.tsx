import React, { useState, useMemo } from "react";
import { 
  Network, 
  Search, 
  Sparkles, 
  Eye, 
  Layers, 
  Tag, 
  ExternalLink,
  BookOpen,
  Share2
} from "lucide-react";
import { SeoEntityDefinition } from "../types";

interface KnowledgeGraphViewProps {
  definitions: SeoEntityDefinition[];
  onSelectEntity: (entity: SeoEntityDefinition) => void;
  onOpenRelationshipSuggester: () => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  definitions,
  onSelectEntity,
  onOpenRelationshipSuggester,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    definitions.length > 0 ? definitions[0].id : null
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    definitions.forEach((d) => {
      const cat = d.category || "Geral";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [definitions]);

  const activeEntity = useMemo(() => {
    return definitions.find((d) => d.id === selectedEntityId) || definitions[0] || null;
  }, [definitions, selectedEntityId]);

  const totalTripletsCount = useMemo(() => {
    return definitions.reduce((acc, curr) => acc + (curr.semanticTriplets?.length || 0), 0);
  }, [definitions]);

  const filteredEntities = useMemo(() => {
    return definitions.filter((d) => {
      const matchesCat = filterCategory === "all" || d.category === filterCategory;
      const matchesSearch =
        search === "" ||
        d.entity.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [definitions, filterCategory, search]);

  return (
    <div className="space-y-5">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1a5d38] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1a5d38]" />
            <span>Canvas Visual · Topologia de Grafo</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight">
            Grafo de Conhecimento & Relações Semânticas
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Mapeamento visual de entidades, clusters conceituais e tripletos ontológicos para GraphRAG.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRelationshipSuggester}
            className="px-4 py-2 rounded-xl bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            title="Descobrir novas conexões ontológicas entre as entidades com o Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f5be38]" />
            <span>Sugerir Relações (IA)</span>
          </button>
        </div>
      </div>

      {/* Filter and Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a0f1d] flex items-center justify-center text-[#f5be38] shadow-2xs">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 mr-2">
                Conexões Mapeadas
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-[#1a5d38] border border-emerald-200 rounded-md">
                {totalTripletsCount} Tripletos RDF
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar no grafo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a5d38]/20 focus:border-[#1a5d38]"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50/80 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a5d38]/20 focus:border-[#1a5d38]"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(([cat, count]) => (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Visual Canvas / Clusters */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs min-h-[500px] flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Category Cluster Hubs */}
            {categories
              .filter(([cat]) => filterCategory === "all" || cat === filterCategory)
              .map(([cat, count]) => {
                const categoryEntities = filteredEntities.filter((d) => d.category === cat);
                if (categoryEntities.length === 0) return null;

                return (
                  <div
                    key={cat}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3"
                  >
                    {/* Category Hub Header */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                          Hub Temático: <span className="text-indigo-700">{cat}</span>
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-white border border-slate-200 rounded-full">
                        {categoryEntities.length} entidades conectadas
                      </span>
                    </div>

                    {/* Nodes within Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {categoryEntities.map((item) => {
                        const isSelected = activeEntity?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedEntityId(item.id)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative group ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-[1.02]"
                                : "bg-white hover:bg-indigo-50/50 border-slate-200 text-slate-800 hover:border-indigo-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900 group-hover:text-indigo-600"}`}>
                                {item.entity}
                              </span>
                              <Share2 className={`w-3 h-3 shrink-0 ${isSelected ? "text-indigo-200" : "text-slate-400"}`} />
                            </div>

                            <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                              {item.shortSummary || item.definition.slice(0, 75)}...
                            </p>

                            {/* Triplets count badge */}
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className={`px-1.5 py-0.2 rounded font-mono ${isSelected ? "bg-indigo-700/80 text-white" : "bg-slate-100 text-slate-600"}`}>
                                {item.semanticTriplets?.length || 1} relações
                              </span>
                              {item.schemaType && (
                                <span className={isSelected ? "text-indigo-200" : "text-emerald-600 font-medium"}>
                                  Schema: {item.schemaType}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {filteredEntities.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-xs">
                Nenhuma entidade corresponde aos critérios selecionados.
              </div>
            )}

          </div>

          {/* Graph Legend */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Cluster de Categoria (Hub Ontológico)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-md bg-white border border-slate-300" />
                Nó de Entidade Nomeada
              </span>
            </div>
            <span>Baseado no padrão de Tripletos RDF da Web Semântica</span>
          </div>
        </div>

        {/* Right Column: Selected Entity Inspector */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          {activeEntity ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activeEntity.category}
                  </span>
                  {activeEntity.schemaType && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {activeEntity.schemaType}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{activeEntity.entity}</h3>
              </div>

              {/* Short summary */}
              {activeEntity.shortSummary && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-950 font-medium">
                  "{activeEntity.shortSummary}"
                </div>
              )}

              {/* Full definition excerpt */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Definição Semântica
                </span>
                <p className="text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {activeEntity.definition}
                </p>
              </div>

              {/* Triplets list */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Relações no Grafo (RDF Triplets)
                  </span>
                  <button
                    onClick={onOpenRelationshipSuggester}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sugerir IA</span>
                  </button>
                </div>
                {activeEntity.semanticTriplets && activeEntity.semanticTriplets.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeEntity.semanticTriplets.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">{t.subject}</span>
                        <span className="text-indigo-600 font-semibold px-1.5 bg-indigo-50 rounded text-[10px]">
                          {t.predicate}
                        </span>
                        <span className="font-bold text-slate-800">{t.object}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center space-y-1">
                    <p className="text-xs text-slate-400 italic">Sem tripletos vinculados.</p>
                    <button
                      onClick={onOpenRelationshipSuggester}
                      className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Descobrir conexões com IA →
                    </button>
                  </div>
                )}
              </div>

              {/* Sources */}
              {activeEntity.sources && activeEntity.sources.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Fontes Conectadas
                  </span>
                  <div className="space-y-1">
                    {activeEntity.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{src}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Selecione uma entidade no grafo para inspecionar.
            </div>
          )}

          {activeEntity && (
            <button
              onClick={() => onSelectEntity(activeEntity)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Detalhes Completos & Schema JSON-LD</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
