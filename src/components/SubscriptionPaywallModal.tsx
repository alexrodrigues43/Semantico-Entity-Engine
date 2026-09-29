import React from "react";
import { 
  X, 
  Lock, 
  Sparkles, 
  MessageCircle, 
  Mail, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  UserCheck, 
  AlertTriangle 
} from "lucide-react";
import { UserProfile } from "../types";
import { SemanticoLogo } from "./SemanticoLogo";

interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  actionAttempted?: string;
  onOpenAuth: (mode?: "login" | "register") => void;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({
  isOpen,
  onClose,
  user,
  actionAttempted,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const isPending = user && user.status === "pending";
  const isBlockedOrExpired = user && (user.status === "blocked" || user.status === "expired");
  const isUnauthenticated = !user;

  // Pre-configured whatsapp link
  const whatsappNumber = "5511999999999"; // fallback or admin WhatsApp
  const whatsappText = encodeURIComponent(
    `Olá! Criei minha conta no Semântico Entity Engine (${user?.email || "novo usuário"}) e gostaria de solicitar a liberação da minha assinatura.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
  const mailtoUrl = `mailto:alexrodrigues43@gmail.com?subject=Liberação de Acesso - Semântico Entity Engine&body=Olá Alex,%0D%0A%0D%0AGostaria de solicitar a liberação do acesso para a conta: ${user?.email || ""}%0D%0ANome: ${user?.displayName || ""}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Decorator */}
        <div className="bg-gradient-to-br from-[#101318] to-[#1e2430] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#fdd910]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-center mb-3">
            <SemanticoLogo variant="dark" size="sm" />
          </div>

          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-2 border border-white/15 text-[#fdd910]">
            {isPending ? (
              <Clock className="w-6 h-6 animate-pulse" />
            ) : isBlockedOrExpired ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <Lock className="w-6 h-6 text-[#fdd910]" />
            )}
          </div>

          <h2 className="text-xl font-black tracking-tight">
            {isPending 
              ? "Acesso em Fase de Liberação" 
              : isBlockedOrExpired 
                ? "Assinatura Suspensa ou Expirada" 
                : "Recurso Exclusivo para Assinantes"}
          </h2>

          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            {actionAttempted 
              ? `A ação "${actionAttempted}" requer uma assinatura ativa com acesso habilitado.`
              : "A navegação é livre para visualização. As ferramentas de IA e ontologia exigem plano ativo."}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-700">
          
          {/* Case 1: Unauthenticated */}
          {isUnauthenticated && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#fdd910]" />
                  <span>O que está incluso na assinatura?</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 pl-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Geração semântica com Gemini IA e busca autoritativa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Reconciliação e desambiguação automática com Wikidata</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Sugestão de tripletos e grafo de conhecimento interativo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Exportações canônicas em JSON-LD, RDF Turtle e llms.txt</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth("login");
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Fazer Login</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth("register");
                  }}
                  className="w-full py-2.5 px-4 bg-[#fdd910] hover:bg-[#ffe30e] text-black text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Cadastrar Conta</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Case 2: Pending Account */}
          {isPending && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Conta em Análise ({user.email})</span>
                </div>
                <p className="leading-relaxed">
                  Seu cadastro foi registrado com sucesso! O acesso às ferramentas de extração ontológica e IA é liberado após a confirmação da sua assinatura ou aprovação do administrador.
                </p>
                <div className="pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Escuta ativa: assim que liberado, seu painel destrava automaticamente!</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Solicitar liberação imediata:
                </span>
                
                <a
                  href={mailtoUrl}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Mail className="w-4 h-4 text-[#fdd910]" />
                  <span>Enviar E-mail para alexrodrigues43@gmail.com</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar no WhatsApp para Liberação Rápida</span>
                </a>
              </div>
            </div>
          )}

          {/* Case 3: Blocked or Expired Account */}
          {isBlockedOrExpired && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-900">
                <div className="flex items-center gap-2 font-bold text-red-950">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Status: {user.status === "blocked" ? "Bloqueado" : "Plano Expirado"}</span>
                </div>
                <p className="leading-relaxed">
                  Seu período de acesso encerrou ou está temporariamente suspenso. Para reativar seu plano ou tirar dúvidas sobre sua assinatura, fale diretamente conosco.
                </p>
              </div>

              <a
                href={mailtoUrl}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Mail className="w-4 h-4 text-[#fdd910]" />
                <span>Solicitar Renovação com o Administrador</span>
              </a>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-400">
            <span>Você pode continuar visualizando as entidades existentes no glossário.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
