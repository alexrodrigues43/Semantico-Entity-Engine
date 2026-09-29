import React, { useState } from "react";
import { 
  Settings2, 
  X, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Code, 
  Sliders, 
  Cpu, 
  RotateCcw,
  Lightbulb,
  FileText
} from "lucide-react";
import { GenerationSettings, PromptPreset, GenerationModel } from "../types";

interface PromptManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  onSaveSettings: (settings: GenerationSettings) => void;
  presets: PromptPreset[];
}

export const PromptManagerModal: React.FC<PromptManagerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  presets,
}) => {
  const [model, setModel] = useState<GenerationModel>(settings.model);
  const [tone, setTone] = useState(settings.tone);
  const [length, setLength] = useState(settings.length);
  const [language, setLanguage] = useState(settings.language);
  const [enableGrounding, setEnableGrounding] = useState(settings.enableGrounding);
  const [customPrompt, setCustomPrompt] = useState(settings.customPromptTemplate);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationImprovements, setOptimizationImprovements] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PromptPreset) => {
    setSelectedPresetId(preset.id);
    setCustomPrompt(preset.template);
  };

  const handleInsertVariable = (varName: string) => {
    setCustomPrompt((prev) => `${prev} ${varName}`);
  };

  const handleOptimizePrompt = async () => {
    if (!customPrompt.trim()) return;
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/seo-definitions/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrompt: customPrompt,
          objective: "Maximizar densidade de entidades, autoridade E-E-A-T, clareza ontológica e citação de fontes primárias",
        }),
      });
      const data = await response.json();
      if (data.optimizedPrompt) {
        setCustomPrompt(data.optimizedPrompt);
        setOptimizationImprovements(data.improvements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      model,
      tone,
      length,
      language,
      enableGrounding,
      customPromptTemplate: customPrompt,
    });
    setSuccessMessage("Configurações salvas com sucesso!");
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Engenharia de Prompt & Parâmetros do Gemini
              </h2>
              <p className="text-xs text-slate-500">
                Personalize o modelo, tom de voz, regras ontológicas e templates de prompt
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

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Model and Core Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Modelo Gemini</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as GenerationModel)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="gemini-3.7-flash">
                  Gemini 3.7 Flash (Recomendado - Ultra rápido & Alta inteligência)
                </option>
                
                <option value="gemini-3.1-flash-lite">
                  Gemini 3.1 Flash Lite (Leve & Econômico)
                </option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Troque o modelo sem precisar editar código em Apps Script!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tom de Voz / E-E-A-T</span>
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ex: enciclopédico e autoritativo, didático, técnico W3C"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Carregar Template de Prompt Pré-Configurado
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    selectedPresetId === preset.id
                      ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <span className="block truncate">{preset.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{preset.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Template do Prompt Personalizado
              </label>
              
              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !customPrompt.trim()}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors cursor-pointer"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Otimizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Otimizar Prompt com IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Variable Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <span className="text-[11px] text-slate-400 font-medium">Inserir variáveis:</span>
              {["{entity}", "{category}", "{context}", "{tone}", "{language}"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleInsertVariable(v)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 border border-slate-200 rounded text-[11px] font-mono text-slate-700 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Digite suas instruções personalizadas para o Gemini..."
              className="w-full p-3.5 text-xs bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* AI Optimization Log */}
          {optimizationImprovements.length > 0 && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-1 text-indigo-800">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                <span>Melhorias semânticas aplicadas pela IA:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-900">
                {optimizationImprovements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            id="btn-save-prompt-settings"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Configurações</span>
          </button>
        </div>

      </div>
    </div>
  );
};
