import React from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  Network, 
  Clock, 
  SlidersHorizontal, 
  Code2, 
  Layers, 
  ArrowRight,
  FileText,
  Cpu,
  Share2,
  ExternalLink
} from "lucide-react";

interface GraphStudioHeroProps {
  onStartTesting: () => void;
  onOpenBatchModal: () => void;
  onOpenSingleModal: () => void;
}

export const GraphStudioHero: React.FC<GraphStudioHeroProps> = ({
  onStartTesting,
  onOpenBatchModal,
  onOpenSingleModal,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 py-6">
      
      {/* 1. HERO SECTION (Identical to reference design) */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-4 sm:pt-8">
        
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-300/80 shadow-2xs mb-6 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-[#1a5d38] animate-pulse" />
          <span className="tracking-wide">Graph Studio Release</span>
        </div>

        {/* Editorial Serif Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#0a0f1d] tracking-tight leading-[1.15] mb-6">
          Transforme seus textos em{" "}
          <span className="text-[#1a5d38] font-normal">ativos de conhecimento</span>{" "}
          conectados.
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Não apenas escreva conteúdo. Construa autoridade com SEO Semântico que funciona de verdade,
          garantindo que suas ideias sejam compreendidas por humanos e buscadores (com ou sem IA).
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <button
            onClick={onStartTesting}
            className="px-6 py-3 rounded-xl bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <span>Quero testar a ferramenta agora</span>
            <ArrowRight className="w-4 h-4 text-[#f5be38]" />
          </button>

          <button
            onClick={onOpenBatchModal}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#1a5d38]" />
            <span>Quero ser beta tester</span>
          </button>
        </div>

        {/* Minimalist Node Graph Mockup Canvas */}
        <div className="relative max-w-2xl mx-auto h-52 sm:h-64 rounded-2xl bg-white/70 border border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden">
          
          {/* Subtle connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300" strokeWidth="1.5">
            <line x1="50%" y1="50%" x2="38%" y2="28%" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="65%" y2="68%" />
            <line x1="50%" y1="50%" x2="25%" y2="55%" />
          </svg>

          {/* Left Link Node */}
          <div className="absolute left-[20%] top-[50%] -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-500 shadow-2xs text-xs font-mono">
            🔗
          </div>

          {/* Entidade A (Green Ring) */}
          <div className="absolute left-[34%] top-[20%] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#1a5d38] bg-white flex items-center justify-center text-[10px] font-bold text-[#1a5d38] shadow-xs text-center px-1">
              Entidade A
            </div>
          </div>

          {/* Central Hub Node (Artigo - Dark) */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-[#0a0f1d] text-white flex items-center justify-center text-xs font-bold shadow-md tracking-wide">
            Artigo
          </div>

          {/* Conceito B (Yellow Ring) */}
          <div className="absolute right-[28%] bottom-[18%] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#f5be38] bg-white flex items-center justify-center text-[10px] font-bold text-slate-800 shadow-xs text-center px-1">
              Conceito B
            </div>
          </div>

          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
            Graph Studio Canvas v2
          </div>
        </div>

      </section>


      {/* 2. SECTION: O PROBLEMA */}
      <section id="section-problema" className="max-w-5xl mx-auto px-4 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Description & Checkmarks */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight">
              O Problema
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Você já sentiu que seu conteúdo, apesar de bem escrito, não gera o impacto ou a autoridade que deveria? 
              Se você é Redator Técnico, Criador de Conteúdo ou Arquiteto de Conhecimento, sabe que palavras soltas não são suficientes.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#1a5d38] shrink-0 mt-0.5" />
                <span>Garantir que seu conteúdo seja semanticamente coeso</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#1a5d38] shrink-0 mt-0.5" />
                <span>Conectar ideias complexas de forma lógica e estruturada</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#1a5d38] shrink-0 mt-0.5" />
                <span>Preparar seu conteúdo para o futuro da busca (GraphRAG e IA)</span>
              </li>
            </ul>
          </div>

          {/* Right Blueprint Graphic Container */}
          <div className="md:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white p-5 bg-graph-grid">
              <div className="border border-slate-200 rounded-xl p-5 bg-white/95 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a5d38]" />
                    <span className="text-xs font-bold text-slate-800">Topologia de Grafo Semântico</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">NER + Schema.org</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Palavras Soltas</span>
                    <span className="text-slate-600 line-through">"SEO, Links, Google, Texto"</span>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-[#1a5d38] block mb-1">Conhecimento Conectado</span>
                    <span className="text-[#1a5d38] font-medium font-mono text-[11px]">(Entidade) → [relação] → (Wikidata)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Estrutura de dados formal reconhecida por mecanismos de busca e modelos de linguagem generativa.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 3. SECTION: A SOLUÇÃO / O QUE É O GRAPH STUDIO? */}
      <section id="section-solucao" className="max-w-4xl mx-auto px-4 text-center scroll-mt-24">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1a5d38] block mb-2">
          A SOLUÇÃO
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl text-[#0a0f1d] font-normal tracking-tight mb-4">
          O que é o Graph Studio?
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10">
          O Graph Studio é a sua interface inteligente para transformar textos não estruturados em uma rede
          poderosa de conhecimento. Através do mapeamento visual de entidades e relações, elevamos o nível do seu SEO Semântico.
        </p>

        {/* 2 White Cards from Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          {/* Card 1: SEO Semântico */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-5 h-5 text-slate-800" />
              <h3 className="text-base font-bold text-slate-900">SEO Semântico</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Estruture os dados por trás das palavras. Facilite a extração de sentido por máquinas e humanos,
              dominando as SERPs modernas.
            </p>
          </div>

          {/* Card 2: Mapeamento Visual */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-5 h-5 text-slate-800" />
              <h3 className="text-base font-bold text-slate-900">Mapeamento Visual</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Visualize seu conteúdo como uma rede. Identifique lacunas conceituais e crie clusters de tópicos
              inquebráveis de forma intuitiva.
            </p>
          </div>

        </div>
      </section>


      {/* 4. SECTION: PRINCIPAIS BENEFÍCIOS */}
      <section id="section-beneficios" className="max-w-5xl mx-auto px-4 scroll-mt-24">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal text-center tracking-tight mb-8">
          Principais Benefícios
        </h2>

        {/* 4 Cards with signature top border and pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Card 1: Diagnóstico de Clareza (Top Dark Accent Border) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 border-t-3 border-t-[#0a0f1d] shadow-2xs hover:shadow-xs transition-all space-y-3">
            <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Diagnóstico de Clareza</h3>
              <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Otimizador Editorial
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Avalie instantaneamente se seu texto transmite as entidades corretas com o peso certo. Ajuste a intenção antes de publicar.
            </p>
          </div>

          {/* Card 2: Visão do Conhecimento */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 border-t-3 border-t-[#0a0f1d] shadow-2xs hover:shadow-xs transition-all space-y-3">
            <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Visão do Conhecimento</h3>
              <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Canvas Visual
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Enxergue o invisível. Transforme parágrafos densos em mapas mentais rigorosos que revelam a verdadeira estrutura do seu argumento.
            </p>
          </div>

          {/* Card 3: Futuro Garantido */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3">
            <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Futuro Garantido</h3>
              <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                GraphRAG
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Deixe seu conteúdo pronto para ser consumido por LLMs corporativos e sistemas de IA avançados.
            </p>
          </div>

          {/* Card 4: Controle Total */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center mb-3">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              
              <div className="space-y-1 mb-2">
                <h3 className="text-base font-bold text-slate-900">Controle Total</h3>
                <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Human Curation
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                A IA auxilia, mas você decide. Refine relações e adicione contexto que só a inteligência humana possui.
              </p>
            </div>

            {/* Mini visual dots */}
            <div className="pt-3 flex items-center justify-end gap-3 opacity-60">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f5be38]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a5d38]" />
            </div>
          </div>

        </div>
      </section>


      {/* 5. SECTION: COMO FUNCIONA */}
      <section id="section-como-funciona" className="max-w-5xl mx-auto px-4 text-center scroll-mt-24">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#0a0f1d] font-normal tracking-tight mb-10">
          Como Funciona
        </h2>

        {/* 4 Numbered Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          {/* Step 1 */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shadow-xs">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Envie</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              Cole seu texto ou faça upload (txt, md) para a plataforma.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full border border-slate-800 text-slate-900 bg-white font-bold flex items-center justify-center text-sm shadow-xs">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Analise</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              O motor processa entidades (NER) e estabelece as conexões lógicas.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full border border-slate-800 text-slate-900 bg-white font-bold flex items-center justify-center text-sm shadow-xs">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Refine</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              Use o Diagnóstico de Clareza para ajustar pesos e relacionamentos.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full border border-slate-800 text-slate-900 bg-white font-bold flex items-center justify-center text-sm shadow-xs">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-900">Integre</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              Exporte os dados estruturados em múltiplos formatos para seu ecossistema.
            </p>
          </div>

        </div>
      </section>


      {/* 6. DARK CTA BANNER (From reference design) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-[#0a0f1d] text-white p-8 sm:p-12 text-center shadow-lg bg-dot-matrix-dark space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
            Pronto para elevar o nível do seu conteúdo?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Pare de apenas escrever e comece a construir autoridade semântica sólida no mundo digital.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartTesting}
              className="px-7 py-3.5 rounded-xl bg-[#f5be38] hover:bg-[#eab308] text-slate-950 font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
            >
              Clique aqui para testar a ferramenta
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
