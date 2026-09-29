import React from "react";
import { Linkedin } from "lucide-react";

interface FooterProps {
  onOpenSingleModal?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSingleModal, onScrollToSection }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-[#f6f4ee] text-slate-700 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-5">
        
        {/* LinkedIn Icon */}
        <a
          href="https://www.linkedin.com/in/alex-rodrigues-seo"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded bg-[#dcd6c8] hover:bg-[#cfc7b5] text-slate-800 flex items-center justify-center transition-colors shadow-2xs"
          title="LinkedIn Semântico SEO"
        >
          <Linkedin className="w-4 h-4 fill-current stroke-none" />
        </a>

        {/* Navigation Links */}
        <nav className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
          <button 
            onClick={() => onScrollToSection ? onScrollToSection("section-solucao") : null}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Missão
          </button>
          <button 
            onClick={() => onScrollToSection ? onScrollToSection("section-beneficios") : null}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Serviços
          </button>
          <a 
            href="mailto:contato@semantico.com.br"
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Contato
          </a>
          <span className="text-slate-800 font-semibold">
            Alex Rodrigues
          </span>
        </nav>

        {/* Copyright */}
        <p className="text-[11px] text-slate-500 font-normal">
          © 2026 Semântico SEO. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
};
