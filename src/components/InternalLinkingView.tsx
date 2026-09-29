import React, { useState } from "react";
import { 
  Link2, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Network, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Sliders,
  Code2,
  Eye,
  Info,
  BookOpen
} from "lucide-react";
import { SeoEntityDefinition, InternalLinkSuggestion, InternalLinkingReport } from "../types";

interface InternalLinkingViewProps {
  definitions: SeoEntityDefinition[];
  onOpenSingleModalWithTerm?: (term: string, category?: string) => void;
  onSelectEntity?: (entity: SeoEntityDefinition) => void;
}

const SAMPLE_ARTICLE = `O SEO Semântico representa a evolução natural da otimização para mecanismos de busca. Em vez de focar apenas em repetição de palavras-chave, o Google utiliza o Knowledge Graph e processamento de linguagem natural para compreender entidades e relações ontológicas.

Para construir uma estratégia sólida de Topical Authority, é essencial mapear um Topic Cluster abrangente. Cada cluster deve conter uma página pilar robusta e conteúdos satélites estruturados com dados Schema.org e DefinedTerm.

Além disso, a implementação de Linked Data e marcações RDF permite que os algoritmos de busca assimilem os conceitos e suas fontes de autoridade de forma determinística. Uma boa arquitetura de links internos distribui o PageRank semântico e fortalece a relevância contextual de todo o domínio.`;

export const InternalLinkingView: React.FC<InternalLinkingViewProps> = ({
  definitions,
  onOpenSingleModalWithTerm,
  onSelectEntity,
}) => {
  const [activeTab, setActiveTab] = useState<"analyzer" | "matrix">("analyzer");
  
  // Analyzer states
  const [contentInput, setContentInput] = useState(SAMPLE_ARTICLE);
  const [baseUrl, setBaseUrl] = useState("/glossario/");
  const [linkDensity, setLinkDensity] = useState<"conservative" | "balanced" | "aggressive">("balanced");
  const [maxLinks, setMaxLinks] = useState(15);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<InternalLinkingReport | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<"html" | "markdown" | null>(null);
  const [outputTab, setOutputTab] = useState<"preview" | "html" | "markdown" | "table" | "gaps">("preview");

  // Matrix states
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<any[] | null>(null);

  const handleAnalyze = async () => {
    if (!contentInput.trim() || definitions.length === 0) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/seo-definitions/generate-internal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentInput,
          entities: definitions,
          baseUrl,
          linkDensity,
          maxTotalLinks: maxLinks,
        }),
      });

      if (!response.ok) throw new Error("Erro na análise de links");
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadMatrix = async () => {
    if (definitions.length === 0) return;
    setMatrixLoading(true);

    try {
      const response = await fetch("/api/seo-definitions/glossary-interlinking-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: definitions,
          baseUrl,
        }),
      });

      if (!response.ok) throw new Error("Erro na matriz");
      const data = await response.json();
      setMatrixData(data.matrix || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMatrixLoading(false);
    }
  };

  const copyToClipboard = (text: string, format: "html" | "markdown") => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Run initial analysis on first load if sample is present
  React.useEffect(() => {
    if (definitions.length > 0 && !report) {
      handleAnalyze();
    }
  }, [definitions.length]);

  return (
    <div className="space-y-6">
      
      {/* Header Editorial Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1a5d38] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1a5d38]" />
            <span>Otimizador Editorial · Arquitetura de Links</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight">
            Links Internos & Menções Semânticas
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Identifique menções contextuais às entidades e construa pontes de autoridade tópica.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/90 shrink-0">
          <button
            onClick={() => setActiveTab("analyzer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "analyzer"
                ? "bg-[#0a0f1d] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#f5be38]" />
            <span>Analisador de Artigos</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("matrix");
              if (!matrixData) handleLoadMatrix();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "matrix"
                ? "bg-[#0a0f1d] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#1a5d38]" />
            <span>Matriz do Glossário</span>
          </button>
        </div>
      </div>

      {activeTab === "analyzer" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input and Parameters */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#302c33] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2576c0]" />
                  Conteúdo para Injeção de Links
                </span>
                <button
                  onClick={() => setContentInput(SAMPLE_ARTICLE)}
                  className="text-[11px] font-semibold text-[#2576c0] hover:underline cursor-pointer"
                >
                  Carregar Exemplo
                </button>
              </div>

              <textarea
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                rows={10}
                placeholder="Cole o texto do seu artigo, post de blog ou página aqui..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fdd910] transition-all resize-none leading-relaxed"
              />

              {/* Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#302c33] mb-1">
                      URL Base do Glossário
                    </label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="/glossario/"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#302c33] focus:bg-white focus:ring-2 focus:ring-[#fdd910]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#302c33] mb-1">
                      Densidade de Links
                    </label>
                    <select
                      value={linkDensity}
                      onChange={(e) => setLinkDensity(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#302c33] focus:bg-white cursor-pointer"
                    >
                      <option value="conservative">Conservador (1 por §)</option>
                      <option value="balanced">Equilibrado (Até 2 por §)</option>
                      <option value="aggressive">Agressivo (Até 4 por §)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Total de Entidades no Glossário: <strong>{definitions.length}</strong></span>
                  <span>Limite Máximo: <strong>{maxLinks} links</strong></span>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !contentInput.trim()}
                  className="w-full py-2.5 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#fdd910]" />
                      <span>Processando NLP Semântico...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#fdd910]" />
                      <span>Gerar Arquitetura de Links Internos</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats if report */}
            {report && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-2xl font-black text-[#2576c0]">
                    {report.totalLinksInserted}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Links Inseridos
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-2xl font-black text-[#7bc970]">
                    {new Set(report.suggestions.map((s) => s.targetEntity)).size}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Entidades Únicas
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-2xl font-black text-[#590050]">
                    {report.topicGaps.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Topic Gaps
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
              
              {/* Output Sub-Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
                <div className="flex gap-1 overflow-x-auto">
                  <button
                    onClick={() => setOutputTab("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      outputTab === "preview"
                        ? "bg-white text-[#302c33] shadow-2xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#2576c0]" />
                    <span>Visualização Formatada</span>
                  </button>

                  <button
                    onClick={() => setOutputTab("html")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      outputTab === "html"
                        ? "bg-white text-[#302c33] shadow-2xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-[#590050]" />
                    <span>Código HTML</span>
                  </button>

                  <button
                    onClick={() => setOutputTab("markdown")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      outputTab === "markdown"
                        ? "bg-white text-[#302c33] shadow-2xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#907d24]" />
                    <span>Markdown</span>
                  </button>

                  <button
                    onClick={() => setOutputTab("table")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      outputTab === "table"
                        ? "bg-white text-[#302c33] shadow-2xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#302c33]" />
                    <span>Tabela de Links ({report?.suggestions.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setOutputTab("gaps")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      outputTab === "gaps"
                        ? "bg-white text-[#302c33] shadow-2xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#fdd910]" />
                    <span>Topic Gaps ({report?.topicGaps.length || 0})</span>
                  </button>
                </div>

                {/* Copy Actions */}
                {report && (
                  <div className="flex items-center gap-1.5">
                    {outputTab === "html" && (
                      <button
                        onClick={() => copyToClipboard(report.htmlWithLinks, "html")}
                        className="px-2.5 py-1 bg-[#302c33] text-white hover:bg-black text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedFormat === "html" ? <Check className="w-3 h-3 text-[#7bc970]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedFormat === "html" ? "Copiado!" : "Copiar HTML"}</span>
                      </button>
                    )}
                    {outputTab === "markdown" && (
                      <button
                        onClick={() => copyToClipboard(report.markdownWithLinks, "markdown")}
                        className="px-2.5 py-1 bg-[#302c33] text-white hover:bg-black text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedFormat === "markdown" ? <Check className="w-3 h-3 text-[#7bc970]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedFormat === "markdown" ? "Copiado!" : "Copiar MD"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Output Content */}
              <div className="p-5 min-h-[420px] max-h-[520px] overflow-y-auto">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#590050]" />
                    <p className="text-xs font-semibold">Cruzando entidades e aplicando regras de ancoragem...</p>
                  </div>
                ) : !report ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 space-y-2 text-center">
                    <Info className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">Cole um conteúdo ao lado e clique em "Gerar Arquitetura de Links Internos".</p>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: Preview */}
                    {outputTab === "preview" && (
                      <div className="space-y-4">
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 text-sm text-slate-800 leading-relaxed font-sans space-y-4">
                          {report.htmlWithLinks.split(/\n\s*\n/).map((para, idx) => (
                            <p
                              key={idx}
                              dangerouslySetInnerHTML={{ __html: para }}
                              className="leading-relaxed"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7bc970]" />
                          <span>Links estilizados com atributos title e classes semânticas.</span>
                        </p>
                      </div>
                    )}

                    {/* TAB 2: HTML Code */}
                    {outputTab === "html" && (
                      <div className="space-y-2">
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {report.htmlWithLinks}
                        </pre>
                      </div>
                    )}

                    {/* TAB 3: Markdown Code */}
                    {outputTab === "markdown" && (
                      <div className="space-y-2">
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {report.markdownWithLinks}
                        </pre>
                      </div>
                    )}

                    {/* TAB 4: Table of Links */}
                    {outputTab === "table" && (
                      <div className="space-y-3">
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                          {report.suggestions.map((s, idx) => (
                            <div key={idx} className="p-3.5 bg-white hover:bg-slate-50 flex items-start justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-[#302c33]">{s.targetEntity}</span>
                                  <span className="px-2 py-0.5 bg-[#2576c0]/15 text-[#2576c0] font-mono text-[10px] font-bold rounded">
                                    Texto Âncora: "{s.anchorText}"
                                  </span>
                                  <span className="text-[10px] text-[#7bc970] font-bold">
                                    {s.relevanceScore}% relevância
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 italic">
                                  Contexto: "{s.contextSentence}"
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">
                                  Destino: {s.targetUrl}
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {s.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 5: Topic Gaps */}
                    {outputTab === "gaps" && (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p>
                            Estes termos conceituais aparecem no seu texto mas <strong>não possuem uma página correspondente no glossário</strong>. Crie estas entidades para fechar os gaps de Topical Authority.
                          </p>
                        </div>

                        <div className="space-y-2">
                          {report.topicGaps.map((gap, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-[#fdd910] transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#302c33]">{gap.term}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#590050]/10 text-[#590050]">
                                    {gap.occurrences}x no texto
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{gap.potentialReason}</p>
                              </div>

                              {onOpenSingleModalWithTerm && (
                                <button
                                  onClick={() => onOpenSingleModalWithTerm(gap.term, "Conceitos Semânticos")}
                                  className="px-3 py-1.5 bg-[#fdd910] hover:bg-[#ffe30e] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Criar Entidade</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* MATRIX VIEW: Interlinking between glossary definitions */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-[#302c33]">
                Matriz de Interlinking Cruzado do Glossário
              </h2>
              <p className="text-xs text-slate-500">
                Mapeia automaticamente como as definições das suas {definitions.length} entidades se citam e se conectam mutuamente.
              </p>
            </div>
            <button
              onClick={handleLoadMatrix}
              disabled={matrixLoading}
              className="px-4 py-2 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              {matrixLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#fdd910]" />
              ) : (
                <Network className="w-4 h-4" />
              )}
              <span>Recalcular Matriz</span>
            </button>
          </div>

          {matrixLoading && (
            <div className="p-12 text-center space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-[#590050] mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Analisando co-ocorrências e links cruzados em todas as definições...
              </p>
            </div>
          )}

          {!matrixLoading && matrixData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matrixData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:border-[#2576c0] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#302c33]">{item.sourceEntity}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.totalOutboundLinks > 0
                          ? "bg-[#7bc970]/20 text-[#2d7a22] border border-[#7bc970]/30"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {item.totalOutboundLinks} links de saída
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium">
                      Categoria: {item.sourceCategory || "SEO Semântico"}
                    </p>

                    {item.linksTo.length > 0 ? (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400">Links para:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.linksTo.map((target: any, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#2576c0] border border-slate-200"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                              <span>{target.targetEntity}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic pt-1">
                        Sem referências explícitas a outros termos na definição.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
