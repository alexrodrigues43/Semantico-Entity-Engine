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
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  QrCode
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
  const isOutOfCredits = user && user.status === "active" && (user.creditsBalance ?? 0) <= 0;
  const hasCredits = user && user.status === "active" && (user.creditsBalance ?? 0) > 0;

  const cobradorUrl = "https://semantico-cobrador-316925929262.us-central1.run.app";
  const whatsappUrl = `https://wa.me/5551989011709?text=${encodeURIComponent(
    `Olá Alex! Sou usuário da Suíte Semântico (${user?.email || "novo usuário"}) e gostaria de recarregar créditos / assinar o Plano Especialista.`
  )}`;
  const mailtoUrl = `mailto:alexrodrigues43@gmail.com?subject=Assinatura Suíte Semântico&body=Olá Alex,%0D%0A%0D%0AGostaria de assinar/recarregar a conta: ${user?.email || ""}%0D%0ANome: ${user?.displayName || ""}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
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
        <div className="bg-gradient-to-br from-[#101318] to-[#1e2430] p-6 text-white text-center relative overflow-hidden shrink-0">
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
            ) : isOutOfCredits ? (
              <Zap className="w-6 h-6 text-[#fdd910] animate-bounce" />
            ) : (
              <Lock className="w-6 h-6 text-[#fdd910]" />
            )}
          </div>

          <h2 className="text-xl font-black tracking-tight">
            {isPending 
              ? "Acesso em Análise" 
              : isBlockedOrExpired 
                ? "Assinatura Suspensa ou Expirada" 
                : isOutOfCredits
                  ? "Seus Créditos de Degustação Esgotaram"
                  : hasCredits
                    ? "Carteira de Créditos Unificada"
                    : "Recurso da Suíte Semântico"}
          </h2>

          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            {actionAttempted 
              ? `A ação "${actionAttempted}" consome créditos da carteira unificada da Suíte Semântico.`
              : "Créditos compartilhados e válidos para todas as 6 ferramentas de SEO Semântico."}
          </p>

          {user && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300">
              <span>Saldo Atual:</span>
              <span className="font-extrabold text-white">{user.creditsBalance ?? 0} créditos</span>
            </div>
          )}
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 space-y-4 text-slate-700 overflow-y-auto">
          
          {/* Case 1: Unauthenticated */}
          {isUnauthenticated && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#fdd910]" />
                  <span>Cadastre-se e ganhe 10 créditos grátis de degustação!</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 pl-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Geração de entidades e ontologias com Gemini IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fdd910]" />
                    <span>Reconciliação e desambiguação automática com Wikidata</span>
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
                  className="w-full py-2.5 px-4 bg-[#fdd910] hover:bg-[#ffe30e] text-black text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Cadastrar e Ganhar 10 Créditos</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Case 2: Out of credits or Voluntarily Managing Plan */}
          {(isOutOfCredits || hasCredits) && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Escolha seu plano ou recarga (Liberação instantânea via PIX):
              </span>

              {/* Plan 1: Specialist */}
              <div className="p-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50/50 space-y-1 relative">
                <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                  Mais Popular
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">Plano Especialista</h4>
                  <span className="text-sm font-black text-slate-950">R$ 247/mês</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>150 créditos unificados mensais</strong> para consultores de SEO. Válido em todas as 6 ferramentas.
                </p>
              </div>

              {/* Plan 2: Recharge 100 */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">Recarga Avulsa (100 Créditos)</h4>
                  <span className="text-xs font-black text-slate-950">R$ 97 avulso</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Créditos imediatos adicionais sem data de validade.
                </p>
              </div>

              {/* Plan 3: Agency */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">Plano Agência</h4>
                  <span className="text-xs font-black text-slate-950">R$ 697/mês</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  <strong>600 créditos unificados</strong> para times de conteúdo e alto volume de geração.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={cobradorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#f5be38] hover:bg-[#eab308] text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>Pagar com PIX Dinâmico (Cobrador Semântico)</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chamar no WhatsApp para Liberação Rápida</span>
                </a>
              </div>
            </div>
          )}

          {/* Case 3: Pending Account */}
          {isPending && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Conta em Análise ({user.email})</span>
                </div>
                <p className="leading-relaxed">
                  Seu cadastro foi registrado com sucesso! Assim que sua assinatura for confirmada pelo PIX ou aprovada pelo administrador, seu acesso é liberado instantaneamente.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Solicitar Liberação no WhatsApp</span>
              </a>
            </div>
          )}

          {/* Case 4: Blocked or Expired Account */}
          {isBlockedOrExpired && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-900">
                <div className="flex items-center gap-2 font-bold text-red-950">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Status: {user.status === "blocked" ? "Bloqueado" : "Plano Expirado"}</span>
                </div>
                <p className="leading-relaxed">
                  Seu período de acesso encerrou ou está temporariamente suspenso. Para reativar seu plano com PIX, fale diretamente conosco.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reativar Acesso no WhatsApp</span>
              </a>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-400">
            <span>Seus créditos são sincronizados em tempo real em todas as 6 ferramentas da Suíte Semântico.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
