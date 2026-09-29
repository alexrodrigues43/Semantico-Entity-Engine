import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Check, 
  BookOpen, 
  Tag, 
  Layers, 
  Sliders, 
  Globe,
  ExternalLink,
  Code
} from "lucide-react";
import { SeoEntityDefinition, GenerationSettings, PromptPreset } from "../types";

interface SingleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (definition: SeoEntityDefinition) => void;
  editingEntity?: SeoEntityDefinition | null;
  settings: GenerationSettings;
  presets: PromptPreset[];
}

export const SingleGeneratorModal: React.FC<SingleGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntity,
  settings,
  presets,
}) => {
  const [entity, setEntity] = useState("");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [definition, setDefinition] = useState("");
  const [sourcesString, setSourcesString] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-ontological");
  const [length, setLength] = useState<"concise" | "standard" | "detailed">("standard");
  const [tone, setTone] = useState("enciclopédico e autoritativo");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEntity) {
      setEntity(editingEntity.entity);
      setCategory(editingEntity.category);
      setDefinition(editingEntity.definition);
      setSourcesString(editingEntity.sources?.join(", ") || editingEntity.sourcesString || "");
    } else {
      setEntity("");
      setCategory("");
      setContext("");
      setDefinition("");
      setSourcesString("");
      setError(null);
    }
  }, [editingEntity, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!entity.trim()) {
      setError("Por favor, digite o nome da Entidade ou Conceito.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const preset = presets.find((p) => p.id === selectedPresetId);

    try {
      const response = await fetch("/api/seo-definitions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: entity.trim(),
          category: category.trim() || undefined,
          context: context.trim() || undefined,
          customPromptTemplate: preset?.template || settings.customPromptTemplate,
          model: settings.model,
          tone: tone,
          length: length,
          language: settings.language,
          enableGrounding: settings.enableGrounding,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha na geração da definição.");
      }

      const data = await response.json();
      setCategory(data.category || category);
      setDefinition(data.definition || "");
      setSourcesString(data.sourcesString || (data.sources || []).join(", "));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao conectar com a API do Gemini.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!entity.trim()) {
      setError("O nome da entidade é obrigatório.");
      return;
    }

    const sources = sourcesString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newDef: SeoEntityDefinition = {
      id: editingEntity ? editingEntity.id : `def-${Date.now()}`,
      entity: entity.trim(),
      category: category.trim() || "Geral",
      definition: definition.trim(),
      sources: sources,
      sourcesString: sources.join(", "),
      semanticTriplets: editingEntity?.semanticTriplets || [
        { subject: entity.trim(), predicate: "relacionado a", object: category.trim() || "SEO Semântico" }
      ],
      lsiKeywords: editingEntity?.lsiKeywords || [entity.trim()],
      schemaType: editingEntity?.schemaType || "DefinedTerm",
      jsonLd: editingEntity?.jsonLd || {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: entity.trim(),
        description: definition.slice(0, 160),
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: `Glossário de ${category.trim() || "SEO Semântico"}`
        }
      },
      status: "completed",
      createdAt: editingEntity?.createdAt || new Date().toISOString(),
    };

    onSave(newDef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingEntity ? "Editar Entidade Semântica" : "Gerar Nova Definição Semântica"}
              </h2>
              <p className="text-xs text-slate-500">
                Crie definições otimizadas para SEO com IA ontológica e fontes de autoridade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preset de Otimização Semântica
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                    selectedPresetId === preset.id
                      ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-slate-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{preset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Entidade / Termo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Linked Data, Topic Clusters, Schema Markup"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria Temática (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Tecnologia da Web, Marketing Digital (ou deixe para IA detectar)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Additional Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Extensão & Profundidade
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                <option value="concise">Concisa (1-2 parágrafos - Snippets rápidos)</option>
                <option value="standard">Padrão Ontológica (2-4 parágrafos - Recomendado)</option>
                <option value="detailed">Aprofundada (3-5 parágrafos - Alta Autoridade E-E-A-T)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contexto do Nicho / Projeto
              </label>
              <input
                type="text"
                placeholder="Ex: Foco em e-commerce, saúde, SaaS B2B..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Generate Button Trigger */}
          <div className="pt-1">
            <button
              type="button"
              id="btn-trigger-single-ai"
              onClick={handleGenerate}
              disabled={isGenerating || !entity.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Definição Semântica com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{definition ? "Regenerar Definição com IA" : "Gerar Definição com IA"}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated / Editable Content */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Definição Semântica Gerada
                </label>
                {definition && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {definition.split(/\s+/).filter(Boolean).length} palavras | {definition.length} caracteres
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="O texto gerado da definição semântica aparecerá aqui e pode ser editado livremente..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fontes de Autoridade / URLs (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: https://rockcontent.com/br/..., https://www.w3.org/..."
                value={sourcesString}
                onChange={(e) => setSourcesString(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            id="btn-save-single-entity"
            onClick={handleSave}
            disabled={!entity.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Entidade</span>
          </button>
        </div>

      </div>
    </div>
  );
};
