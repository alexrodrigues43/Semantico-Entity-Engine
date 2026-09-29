import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "../lib/firebase";
import { SemanticoLogo } from "./SemanticoLogo";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login"
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithGoogle();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("A janela de autenticação do Google foi fechada.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setErrorMessage("Requisição cancelada.");
      } else {
        setErrorMessage(err.message || "Erro ao conectar via Google. Tente novamente.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let profile: UserProfile;
      if (mode === "login") {
        profile = await loginWithEmail(email, password);
      } else {
        profile = await registerWithEmail(email, password, displayName);
      }
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setErrorMessage("E-mail ou senha incorretos. Verifique suas credenciais.");
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMessage("Este e-mail já está cadastrado. Tente fazer login.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("Formato de e-mail inválido.");
      } else {
        setErrorMessage(err.message || "Ocorreu um erro na autenticação.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#0f1117] border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-800/80">
          <div className="flex justify-center mb-3">
            <SemanticoLogo variant="dark" size="md" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            {mode === "login" ? "Entrar no Semântico" : "Criar sua Conta"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === "login" 
              ? "Acesse sua rede semântica e ferramentas de IA ontológica" 
              : "Cadastre-se para solicitar liberação do seu acesso à plataforma"}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mt-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#fdd910] text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#fdd910] text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google 1-Click Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 border border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Entrar com 1 clique via Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">ou com e-mail</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Seu Nome ou Empresa
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Alex Rodrigues"
                    className="w-full bg-[#0d0f12] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fdd910]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@empresa.com"
                  required
                  className="w-full bg-[#0d0f12] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fdd910]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-[#0d0f12] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fdd910]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 bg-[#fdd910] hover:bg-[#ffe30e] text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#fdd910]/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "Entrar na Plataforma" : "Cadastrar e Solicitar Acesso"}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Tip */}
          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#fdd910] shrink-0" />
            <span>Super Administrador: o e-mail master é ativado com acesso vitalício ilimitado.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
