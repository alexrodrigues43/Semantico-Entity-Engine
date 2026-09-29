import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Download, 
  Settings2, 
  Network, 
  Database,
  Link2,
  Globe,
  Layers,
  Sparkles,
  ChevronDown,
  Wand2,
  Share2,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  Zap,
  User,
  Clock,
  LogIn,
  ExternalLink,
  BookOpen,
  Info,
  Target
} from "lucide-react";
import { GenerationModel, AuthSession, UserProfile } from "../types";
import { SemanticoLogo } from "./SemanticoLogo";

interface NavbarProps {
  totalEntities: number;
  totalCategories: number;
  activeView: "table" | "graph" | "linking" | "analysis" | "overview";
  setActiveView: (view: "table" | "graph" | "linking" | "analysis" | "overview") => void;
  selectedModel: GenerationModel;
  setSelectedModel: (model: GenerationModel) => void;
  onOpenSingleModal: () => void;
  onOpenBatchModal: () => void;
  onOpenPromptModal: () => void;
  onOpenExportModal: () => void;
  onOpenRelationshipSuggester: () => void;
  onOpenWikidataModal: () => void;
  onOpenTopicalAudit?: () => void;
  authSession?: AuthSession | null;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenAuthModal?: () => void;
  pendingCount?: number;
  onScrollToSection?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalEntities,
  totalCategories,
  activeView,
  setActiveView,
  selectedModel,
  setSelectedModel,
  onOpenSingleModal,
  onOpenBatchModal,
  onOpenPromptModal,
  onOpenExportModal,
  onOpenRelationshipSuggester,
  onOpenWikidataModal,
  onOpenTopicalAudit,
  authSession,
  userProfile,
  onLogout,
  onOpenAdminPanel,
  onOpenAuthModal,
  pendingCount = 0,
  onScrollToSection,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = userProfile?.role === "admin";
  const isPending = userProfile?.status === "pending";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (activeView !== "overview") {
      setActiveView("overview");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      
      {/* TIER 1: TOP BAR (Brand Logo + Public Navigation + CTA + Auth) */}
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            
            {/* 1. BRAND LOGO */}
            <div 
              onClick={() => setActiveView("overview")}
              className="cursor-pointer shrink-0"
              title="Ir para o início do Graph Studio"
            >
              <SemanticoLogo variant="dark" size="md" />
            </div>

            {/* 2. CENTER LINKS (Matching user site navigation) */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-700">
              <button
                onClick={() => handleNavClick("section-solucao")}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Serviços
              </button>
              <button
                onClick={() => setActiveView("table")}
                className="hover:text-slate-950 text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Ferramentas</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a5d38]" />
              </button>
              <a
                href="https://semantico.com.br/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Blog</span>
              </a>
              <a
                href="https://semantico.com.br/podcasts"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Podcasts</span>
              </a>
              <button
                onClick={() => setContactModalOpen(true)}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Contato
              </button>
            </nav>

            {/* 3. RIGHT CONTROLS (Language Flag + Warm Gold CTA + User Profile) */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Language Selector */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer select-none">
                <span className="text-sm">🇧🇷</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Solicitar Orçamento / Quero Assinar (Golden Button from design system) */}
              <button
                onClick={() => {
                  if (isAdmin) {
                    onOpenAdminPanel?.();
                  } else if (!userProfile) {
                    onOpenAuthModal?.();
                  } else {
                    setContactModalOpen(true);
                  }
                }}
                className="px-4 py-1.5 rounded-full bg-[#f5be38] hover:bg-[#eab308] text-slate-950 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{isAdmin ? "Super Admin" : userProfile ? "Plano Ativo" : "Solicitar Orçamento"}</span>
              </button>

              {/* User Session Dropdown */}
              {userProfile ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {userProfile.photoURL ? (
                      <img 
                        src={userProfile.photoURL} 
                        alt="" 
                        className="w-4 h-4 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#1a5d38]" />
                    )}
                    <span className="max-w-[85px] truncate text-[11px] font-bold">
                      {isAdmin ? "Admin" : (userProfile.displayName?.split(" ")[0] || userProfile.email?.split("@")[0])}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isAdmin ? "bg-amber-100 text-amber-900 font-bold" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isAdmin ? "Super Administrador" : `Status: ${userProfile.status}`}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {userProfile.plan || "free"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate mt-1">
                          {userProfile.displayName || "Usuário"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {userProfile.email}
                        </p>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAdminPanel?.();
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#f5be38]" />
                          <span>Painel Administrativo</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-xs font-semibold border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Entrar</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </div>


      {/* TIER 2: SECONDARY SUB-NAVBAR (Design System Sections + Studio Views + Primary Actions) */}
      <div className="bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-3 overflow-x-auto py-1">
            
            {/* Group 1: Design System Section Anchors (O Problema, Graph Studio, Benefícios, Como Funciona) */}
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => handleNavClick("section-problema")}
                className="px-2.5 py-1 rounded-md hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                O Problema
              </button>

              <button
                onClick={() => setActiveView("table")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  activeView !== "overview"
                    ? "text-[#1a5d38] bg-emerald-50 border border-emerald-200/80"
                    : "hover:text-slate-950 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span>Graph Studio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a5d38]" />
              </button>

              <button
                onClick={() => handleNavClick("section-beneficios")}
                className="px-2.5 py-1 rounded-md hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Benefícios
              </button>

              <button
                onClick={() => handleNavClick("section-como-funciona")}
                className="px-2.5 py-1 rounded-md hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Como Funciona
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Group 2: Interactive Workbench View Tabs */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveView("table")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeView === "table"
                    ? "bg-[#0a0f1d] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Glossário</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeView === "table" ? "bg-[#f5be38] text-slate-950" : "bg-slate-200 text-slate-700"
                }`}>
                  {totalEntities}
                </span>
              </button>

              <button
                onClick={() => setActiveView("graph")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeView === "graph"
                    ? "bg-[#0a0f1d] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Network className="w-3 h-3" />
                <span>Grafo</span>
              </button>

              <button
                onClick={() => setActiveView("linking")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeView === "linking"
                    ? "bg-[#0a0f1d] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Link2 className="w-3 h-3" />
                <span>Links</span>
              </button>

              <button
                onClick={() => setActiveView("overview")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeView === "overview"
                    ? "bg-[#0a0f1d] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Apresentação</span>
              </button>
            </div>

            {/* Group 3: Functional Actions Cluster */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {/* Exportar */}
              <button
                onClick={onOpenExportModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Exportar dados estruturados (JSON-LD, CSV, Graph)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar</span>
              </button>

              {/* Nova Entidade (+ Warm Gold Accent Button) */}
              <button
                onClick={onOpenSingleModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-[#f5be38] hover:bg-[#eab308] rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Nova Entidade</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Contato Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-2xl text-slate-900">Solicitar Orçamento & Contato</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Entre em contato direto com a equipe do <strong>Semântico SEO</strong> para consultoria ontológica personalizada, licenças empresariais ou desenvolvimento sob medida.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800">Alex Rodrigues — Semântico SEO</div>
              <div className="text-slate-600">E-mail: alexrodrigues43@gmail.com</div>
              <div className="text-slate-600">Site Oficial: https://semantico.com.br</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <a
                href="mailto:alexrodrigues43@gmail.com?subject=Solicitação de Orçamento - Semântico Graph Studio"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#f5be38] hover:bg-[#eab308] rounded-lg transition-colors shadow-xs"
              >
                Enviar Mensagem
              </a>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
