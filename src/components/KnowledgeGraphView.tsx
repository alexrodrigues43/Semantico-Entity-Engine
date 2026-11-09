import React, { useState, useMemo, useRef, useCallback } from "react";
import { 
  Network, 
  Search, 
  Sparkles, 
  Eye, 
  Layers, 
  ExternalLink,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Info,
  ArrowRight
} from "lucide-react";
import { SeoEntityDefinition } from "../types";

interface KnowledgeGraphViewProps {
  definitions: SeoEntityDefinition[];
  onSelectEntity: (entity: SeoEntityDefinition) => void;
  onOpenRelationshipSuggester: () => void;
}

// Color palette mapping per category
const CATEGORY_COLORS: { [key: string]: { stroke: string; fill: string; text: string; bgBadge: string; borderBadge: string } } = {
  "SEO Semântico": { stroke: "#1a5d38", fill: "#e8f5ee", text: "#13462a", bgBadge: "bg-emerald-50 text-[#1a5d38]", borderBadge: "border-emerald-200" },
  "Knowledge Graph & Ontologia": { stroke: "#4f46e5", fill: "#eef2ff", text: "#3730a3", bgBadge: "bg-indigo-50 text-indigo-700", borderBadge: "border-indigo-200" },
  "Estrutura de Dados & Schema.org": { stroke: "#d97706", fill: "#fffbeb", text: "#92400e", bgBadge: "bg-amber-50 text-amber-800", borderBadge: "border-amber-200" },
  "Arquitetura da Informação": { stroke: "#0891b2", fill: "#ecfeff", text: "#155e75", bgBadge: "bg-cyan-50 text-cyan-800", borderBadge: "border-cyan-200" },
  "Tecnologia da Web": { stroke: "#7c3aed", fill: "#f5f3ff", text: "#5b21b6", bgBadge: "bg-purple-50 text-purple-800", borderBadge: "border-purple-200" },
  "IA & Modelos de Linguagem": { stroke: "#e11d48", fill: "#fff1f2", text: "#9f1239", bgBadge: "bg-rose-50 text-rose-800", borderBadge: "border-rose-200" },
  "Geral": { stroke: "#475569", fill: "#f8fafc", text: "#1e293b", bgBadge: "bg-slate-100 text-slate-700", borderBadge: "border-slate-200" },
};

const DEFAULT_COLOR = { stroke: "#1a5d38", fill: "#e8f5ee", text: "#13462a", bgBadge: "bg-emerald-50 text-[#1a5d38]", borderBadge: "border-emerald-200" };

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
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
  const [viewMode, setViewMode] = useState<"topology" | "clusters">("topology");
  
  // Interactive SVG Canvas State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

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

  // Topology node positioning calculations
  const { nodes, edges } = useMemo(() => {
    const svgWidth = 900;
    const svgHeight = 620;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    // Group filtered entities by category for orbital cluster positioning
    const categoryGroups = new Map<string, SeoEntityDefinition[]>();
    filteredEntities.forEach((ent) => {
      const cat = ent.category || "Geral";
      if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
      categoryGroups.get(cat)!.push(ent);
    });

    const groupKeys = Array.from(categoryGroups.keys());
    const numGroups = groupKeys.length;
    const clusterOrbitRadius = numGroups > 1 ? 230 : 0;

    const computedNodes: {
      id: string;
      entity: string;
      category: string;
      schemaType?: string;
      tripletsCount: number;
      x: number;
      y: number;
      degree: number;
      color: typeof DEFAULT_COLOR;
    }[] = [];

    const entityNameToNode = new Map<string, any>();

    groupKeys.forEach((catKey, groupIdx) => {
      const ents = categoryGroups.get(catKey)!;
      const angle = numGroups > 1 ? (2 * Math.PI * groupIdx) / numGroups - Math.PI / 2 : 0;
      const clusterX = centerX + Math.cos(angle) * clusterOrbitRadius;
      const clusterY = centerY + Math.sin(angle) * clusterOrbitRadius;

      ents.forEach((ent, entIdx) => {
        let nodeX = clusterX;
        let nodeY = clusterY;

        if (ents.length > 1) {
          const subAngle = (2 * Math.PI * entIdx) / ents.length;
          const subRadius = Math.min(130, 45 + ents.length * 10);
          nodeX = clusterX + Math.cos(subAngle) * subRadius;
          nodeY = clusterY + Math.sin(subAngle) * subRadius;
        }

        const nodeData = {
          id: ent.id,
          entity: ent.entity,
          category: ent.category || "Geral",
          schemaType: ent.schemaType,
          tripletsCount: ent.semanticTriplets?.length || 0,
          x: Math.round(nodeX),
          y: Math.round(nodeY),
          degree: ent.semanticTriplets?.length || 0,
          color: getCategoryColor(ent.category || "Geral"),
        };

        computedNodes.push(nodeData);
        entityNameToNode.set(ent.entity.toLowerCase().trim(), nodeData);
      });
    });

    // Compute directed edges connecting entities via semanticTriplets
    const computedEdges: {
      id: string;
      sourceId: string;
      targetId: string;
      sourceX: number;
      sourceY: number;
      targetX: number;
      targetY: number;
      predicate: string;
      sourceName: string;
      targetName: string;
    }[] = [];

    const edgeSeen = new Set<string>();

    filteredEntities.forEach((ent) => {
      const sourceNode = entityNameToNode.get(ent.entity.toLowerCase().trim());
      if (!sourceNode) return;

      (ent.semanticTriplets || []).forEach((t, tIdx) => {
        const targetClean = (t.object || "").toLowerCase().trim();
        const targetNode = entityNameToNode.get(targetClean);

        if (targetNode && targetNode.id !== sourceNode.id) {
          const edgeKey = `${sourceNode.id}->${targetNode.id}:${t.predicate}`;
          if (!edgeSeen.has(edgeKey)) {
            edgeSeen.add(edgeKey);
            computedEdges.push({
              id: `edge-${sourceNode.id}-${targetNode.id}-${tIdx}`,
              sourceId: sourceNode.id,
              targetId: targetNode.id,
              sourceX: sourceNode.x,
              sourceY: sourceNode.y,
              targetX: targetNode.x,
              targetY: targetNode.y,
              predicate: t.predicate,
              sourceName: sourceNode.entity,
              targetName: targetNode.entity,
            });
            sourceNode.degree += 1;
            targetNode.degree += 1;
          }
        }
      });
    });

    return { nodes: computedNodes, edges: computedEdges };
  }, [filteredEntities]);

  // Neighbor nodes of hovered node
  const neighborNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const neighbors = new Set<string>([hoveredNodeId]);
    edges.forEach((e) => {
      if (e.sourceId === hoveredNodeId) neighbors.add(e.targetId);
      if (e.targetId === hoveredNodeId) neighbors.add(e.sourceId);
    });
    return neighbors;
  }, [hoveredNodeId, edges]);

  // Pan and drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1a5d38] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1a5d38] animate-pulse" />
            <span>Motor Ontológico Visual · Topologia de Grafo</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight">
            Grafo de Conhecimento & Relações Semânticas
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Visualização topological de entidades e tripletos RDF para estratégias de GraphRAG e Autoridade Tópica.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRelationshipSuggester}
            className="px-4 py-2.5 rounded-xl bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            title="Descobrir novas conexões ontológicas entre as entidades com o Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f5be38]" />
            <span>Sugerir Relações (IA)</span>
          </button>
        </div>
      </div>

      {/* Filter and Mode Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-[#0a0f1d] flex items-center justify-center text-[#f5be38] shadow-2xs shrink-0">
              <Network className="w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {nodes.length} Nós
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-[#1a5d38] border border-emerald-200 rounded-md">
                {edges.length} Arestas Conectadas
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-md hidden sm:inline-block">
                {totalTripletsCount} Tripletos RDF
              </span>
            </div>
          </div>

          {/* View Mode Toggle & Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* View Mode Segmented Switch */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("topology")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "topology"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Network className="w-3.5 h-3.5 text-[#1a5d38]" />
                <span>Topologia (Rede)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("clusters")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "clusters"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hubs (Grade)</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar no grafo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a5d38]/20 focus:border-[#1a5d38]"
              />
            </div>

            {/* Category Select */}
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
        
        {/* Left Column: Interactive Visual Canvas (Topology or Clusters) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between relative min-h-[560px]">
          
          {viewMode === "topology" ? (
            <div className="relative w-full h-full flex-1 flex flex-col min-h-[560px] bg-[#fafbfc]">
              
              {/* Canvas Overlay Floating Controls */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-700">
                <span className="text-slate-400">Zoom:</span>
                <span>{Math.round(zoom * 100)}%</span>
                <div className="h-3.5 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-700 transition cursor-pointer"
                  title="Aproximar (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-700 transition cursor-pointer"
                  title="Afastar (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-700 transition cursor-pointer"
                  title="Centralizar e resetar visão"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-3 h-3 text-[#1a5d38]" />
                <span>Arraste para navegar · Clique em um nó para inspecionar</span>
              </div>

              {/* Interactive SVG Canvas */}
              <div 
                className="w-full flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  ref={svgRef}
                  className="w-full h-full min-h-[560px]"
                  viewBox="0 0 900 620"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Arrow markers for directed relationships */}
                    <marker
                      id="arrow-default"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#1a5d38" />
                    </marker>
                    {/* Subtle grid pattern */}
                    <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1" fill="#e2e8f0" />
                    </pattern>
                  </defs>

                  {/* Background grid */}
                  <rect width="100%" height="100%" fill="url(#graph-grid)" />

                  {/* Transformed Group for Zoom and Pan */}
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    
                    {/* Directed Edges (Lines & Curves) */}
                    {edges.map((edge) => {
                      const isHovered = hoveredNodeId && (edge.sourceId === hoveredNodeId || edge.targetId === hoveredNodeId);
                      const isDimmed = hoveredNodeId && !isHovered;
                      const isSelected = selectedEntityId && (edge.sourceId === selectedEntityId || edge.targetId === selectedEntityId);

                      // Calculate midpoint for predicate badge
                      const midX = (edge.sourceX + edge.targetX) / 2;
                      const midY = (edge.sourceY + edge.targetY) / 2;

                      return (
                        <g key={edge.id} className="transition-opacity duration-200" opacity={isDimmed ? 0.15 : 1}>
                          <line
                            x1={edge.sourceX}
                            y1={edge.sourceY}
                            x2={edge.targetX}
                            y2={edge.targetY}
                            stroke={isHovered || isSelected ? "#1a5d38" : "#cbd5e1"}
                            strokeWidth={isHovered || isSelected ? 2.2 : 1.2}
                            strokeDasharray={isHovered ? "none" : undefined}
                            markerEnd={isHovered || isSelected ? "url(#arrow-active)" : "url(#arrow-default)"}
                          />
                          {/* Predicate label pill */}
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x={-(edge.predicate.length * 3.2 + 8)}
                              y="-9"
                              width={edge.predicate.length * 6.4 + 16}
                              height="18"
                              rx="9"
                              fill={isHovered ? "#1a5d38" : "#ffffff"}
                              stroke={isHovered ? "#13462a" : "#e2e8f0"}
                              strokeWidth="1"
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              fontSize="9"
                              fontWeight="600"
                              fill={isHovered ? "#ffffff" : "#64748b"}
                              className="font-mono pointer-events-none select-none"
                            >
                              {edge.predicate}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => {
                      const isSelected = selectedEntityId === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const isNeighbor = hoveredNodeId && neighborNodeIds.has(node.id);
                      const isDimmed = hoveredNodeId && !isNeighbor;
                      const radius = Math.min(28, Math.max(18, 16 + node.degree * 2.5));

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          className="cursor-pointer transition-all duration-200"
                          opacity={isDimmed ? 0.2 : 1}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntityId(node.id);
                          }}
                        >
                          {/* Selection Glowing Ring */}
                          {isSelected && (
                            <circle
                              r={radius + 8}
                              fill="none"
                              stroke="#f5be38"
                              strokeWidth="3.5"
                              strokeDasharray="4 2"
                              className="animate-spin-slow"
                            />
                          )}

                          {/* Outer pulse when hovered */}
                          {isHovered && (
                            <circle
                              r={radius + 6}
                              fill="none"
                              stroke={node.color.stroke}
                              strokeWidth="2"
                              opacity="0.5"
                            />
                          )}

                          {/* Main Node Circle */}
                          <circle
                            r={radius}
                            fill={isSelected ? "#0a0f1d" : isHovered ? node.color.fill : "#ffffff"}
                            stroke={isSelected ? "#1a5d38" : node.color.stroke}
                            strokeWidth={isSelected ? 3.5 : 2}
                            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.06))"
                          />

                          {/* Degree Badge Pill inside node */}
                          <text
                            textAnchor="middle"
                            y="4"
                            fontSize="11"
                            fontWeight="bold"
                            fill={isSelected ? "#f5be38" : node.color.stroke}
                            className="pointer-events-none select-none font-mono"
                          >
                            {node.tripletsCount}
                          </text>

                          {/* Entity Label underneath node */}
                          <g transform={`translate(0, ${radius + 14})`}>
                            <rect
                              x={-(node.entity.length * 3.5 + 8)}
                              y="-8"
                              width={node.entity.length * 7 + 16}
                              height="18"
                              rx="6"
                              fill={isSelected ? "#0a0f1d" : "#ffffff"}
                              stroke={isSelected ? "#0a0f1d" : "#e2e8f0"}
                              strokeWidth="1"
                              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.04))"
                            />
                            <text
                              textAnchor="middle"
                              y="4"
                              fontSize="10"
                              fontWeight="bold"
                              fill={isSelected ? "#ffffff" : "#0f172a"}
                              className="pointer-events-none select-none tracking-tight"
                            >
                              {node.entity}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                  </g>
                </svg>
              </div>

              {/* Bottom Canvas Status Bar & Legend */}
              <div className="p-3 bg-white border-t border-slate-200/90 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a5d38]" />
                    Hub / Entidade Conectada
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f5be38]" />
                    Entidade Selecionada
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    Predicado Semântico (RDF)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Canvas SVG vetorial nativo de alto rendimento · Zero overhead externo
                </div>
              </div>

            </div>
          ) : (
            /* Clusters Grid Mode (Classic view) */
            <div className="p-5 space-y-6 flex-1 overflow-y-auto max-h-[700px]">
              {categories
                .filter(([cat]) => filterCategory === "all" || cat === filterCategory)
                .map(([cat, count]) => {
                  const categoryEntities = filteredEntities.filter((d) => d.category === cat);
                  if (categoryEntities.length === 0) return null;
                  const catColor = getCategoryColor(cat);

                  return (
                    <div
                      key={cat}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: catColor.stroke }}
                          />
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                            Hub Temático: <span style={{ color: catColor.stroke }}>{cat}</span>
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-white border border-slate-200 rounded-full">
                          {categoryEntities.length} entidades conectadas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {categoryEntities.map((item) => {
                          const isSelected = activeEntity?.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedEntityId(item.id)}
                              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative group ${
                                isSelected
                                  ? "bg-[#0a0f1d] text-white border-[#0a0f1d] shadow-md shadow-slate-200 scale-[1.02]"
                                  : "bg-white hover:bg-slate-50/80 border-slate-200 text-slate-800 hover:border-[#1a5d38]/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900 group-hover:text-[#1a5d38]"}`}>
                                  {item.entity}
                                </span>
                                <Share2 className={`w-3 h-3 shrink-0 ${isSelected ? "text-[#f5be38]" : "text-slate-400"}`} />
                              </div>

                              <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {item.shortSummary || item.definition.slice(0, 75)}...
                              </p>

                              <div className="mt-2 flex items-center justify-between text-[10px]">
                                <span className={`px-1.5 py-0.5 rounded font-mono ${isSelected ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"}`}>
                                  {item.semanticTriplets?.length || 0} relações
                                </span>
                                {item.schemaType && (
                                  <span className={isSelected ? "text-[#f5be38]" : "text-[#1a5d38] font-medium"}>
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
                <div className="text-center py-20 text-slate-400 text-xs">
                  Nenhuma entidade corresponde aos critérios selecionados.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Selected Entity Inspector */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          {activeEntity ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryColor(activeEntity.category || "").bgBadge} ${getCategoryColor(activeEntity.category || "").borderBadge}`}>
                    {activeEntity.category || "Geral"}
                  </span>
                  {activeEntity.schemaType && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#1a5d38] border border-emerald-200">
                      {activeEntity.schemaType}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">{activeEntity.entity}</h3>
              </div>

              {/* Short summary */}
              {activeEntity.shortSummary && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                  "{activeEntity.shortSummary}"
                </div>
              )}

              {/* Full definition excerpt */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Definição Semântica
                </span>
                <p className="text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line bg-slate-50/70 p-3 rounded-xl border border-slate-200">
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
                    className="text-[10px] text-[#1a5d38] hover:text-[#13462a] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#f5be38]" />
                    <span>Sugerir IA</span>
                  </button>
                </div>
                {activeEntity.semanticTriplets && activeEntity.semanticTriplets.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeEntity.semanticTriplets.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] flex items-center justify-between gap-1"
                      >
                        <span className="font-bold text-slate-800 truncate">{t.subject}</span>
                        <span className="text-[#1a5d38] font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] shrink-0 font-mono">
                          {t.predicate}
                        </span>
                        <span className="font-bold text-slate-800 truncate">{t.object}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                    <p className="text-xs text-slate-400 italic">Sem tripletos vinculados.</p>
                    <button
                      onClick={onOpenRelationshipSuggester}
                      className="text-[11px] text-[#1a5d38] font-bold hover:underline cursor-pointer"
                    >
                      Descobrir conexões ontológicas com IA →
                    </button>
                  </div>
                )}
              </div>

              {/* Connected Sources */}
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
            <div className="text-center py-24 text-slate-400 text-xs">
              Selecione uma entidade no grafo para inspecionar conexões.
            </div>
          )}

          {activeEntity && (
            <button
              onClick={() => onSelectEntity(activeEntity)}
              className="w-full py-2.5 bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-semibold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              <Eye className="w-3.5 h-3.5 text-[#f5be38]" />
              <span>Ver Detalhes Completos & Schema JSON-LD</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
