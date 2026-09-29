import React from "react";
import { 
  Lightbulb, 
  Sparkles, 
  Layers, 
  Share2, 
  Search, 
  Globe, 
  ShieldCheck, 
  Database,
  Zap,
  BookmarkCheck,
  TrendingUp,
  Workflow,
  Network,
  Cpu,
  FileCode2,
  CheckCircle2
} from "lucide-react";

export const IdeasAndPossibilitiesView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner with Semântico SEO Brand Theme */}
      <div className="bg-[#302c33] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-black/30">
        {/* Background Subtle Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#590050]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#fdd910]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdd910]/15 border border-[#fdd910]/30 text-[#fdd910] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#fdd910]" />
            <span>Ecossistema de SEO Semântico</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Funcionalidades de Alto Impacto para SEO Semântico
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Ferramentas avançadas para enriquecimento de ontologias, extração de entidades nomeadas, estruturação de Knowledge Graphs e geração de marcação Schema.org em escala.
          </p>
        </div>
      </div>

      {/* Novel Features & High-Impact Ideas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fdd910] flex items-center justify-center text-black font-black">
              <Lightbulb className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-base font-bold text-[#302c33]">
              Funcionalidades de Alto Impacto para SEO Semântico
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            6 Módulos Estratégicos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#2576c0] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2576c0] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#2576c0]/10 border border-[#2576c0]/20 flex items-center justify-center text-xs font-black">1</span>
                <span>Mineração de Entidades a Partir de Artigos e URLs</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Modal
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cole o conteúdo integral de um artigo do seu blog. A IA analisa o texto, detecta as principais entidades nomeadas ausentes no seu glossário e gera definições estruturadas instantaneamente para criar páginas de suporte e contextualização.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#590050] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#590050] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#590050]/10 border border-[#590050]/20 flex items-center justify-center text-xs font-black">2</span>
                <span>Grafo de Conhecimento & Tripletos Ontológicos (RDF)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Menu
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mapeamento visual de conexões semânticas em formato Sujeito → Predicado → Objeto. Visualize a arquitetura de entidades do seu nicho e encontre lacunas tópicas (Topic Gaps) para dominar a autoridade temática.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#907d24] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#907d24] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#907d24]/10 border border-[#907d24]/20 flex items-center justify-center text-xs font-black">3</span>
                <span>Gerador de Arquitetura de Links Internos (Internal Linking)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Menu
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mapeamento automático de textos-âncora contextuais e injeção de links com controle de densidade e sinônimos. Analise artigos ou cruze todo o glossário para fortalecer a distribuição de autoridade tópica.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#7bc970] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2d7a22] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#7bc970]/15 border border-[#7bc970]/30 flex items-center justify-center text-xs font-black">4</span>
                <span>Mapeamento para Wikidata & Wikipedia (SameAs Reconciliation)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Sistema
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integração da propriedade <code className="text-[#2d7a22] font-mono font-bold">sameAs</code> nos dados estruturados apontando diretamente para os identificadores Wikidata da entidade (ex: Q11053), conectando seu site explicitamente ao Knowledge Graph do Google.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#f038a4] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#c2187f] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#f038a4]/10 border border-[#f038a4]/20 flex items-center justify-center text-xs font-black">5</span>
                <span>Auditoria de Prontidão para Featured Snippets (Posição Zero)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Avaliador em tempo real da fórmula da definição: confere se a primeira frase tem a extensão ideal, se usa a estrutura canônica "[Termo] é um [Classe] que [Função]" e se responde com máxima objetividade.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-2xs hover:border-[#46cbcb] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#158080] font-bold text-sm">
                <span className="w-6 h-6 rounded-md bg-[#46cbcb]/15 border border-[#46cbcb]/30 flex items-center justify-center text-xs font-black">6</span>
                <span>Exportação para Servidor, Googlebot & llms.txt</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7bc970]/15 text-[#302c33] border border-[#7bc970]/30">
                Ativo no Exportador
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exporte arquivos canônicos prontos para a raiz do servidor: Sitemap XML semântico para o Google Search Console, Linked Data JSON-LD (@graph), Ontologia W3C RDF Turtle (.ttl) e o padrão emergente llms.txt para motores de busca generativa.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
