import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { SupportedLang } from "../lib/i18n";

interface LanguageSelectorProps {
  currentLang: SupportedLang;
  onLanguageChange: (lang: SupportedLang) => void;
  ariaLabel?: string;
}

const LANGUAGES = [
  { id: "pt" as const, label: "Português", flag: "🇧🇷", short: "PT" },
  { id: "en" as const, label: "English", flag: "🇺🇸", short: "EN" },
  { id: "es" as const, label: "Español", flag: "🇪🇸", short: "ES" },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
  ariaLabel = "Selecionar idioma da interface",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const currentItem = LANGUAGES.find((l) => l.id === currentLang) || LANGUAGES[0];

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 hover:border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold shadow-2xs active:scale-98"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Globe className="w-4 h-4 text-[#1a5d38]" aria-hidden="true" />
        <span className="uppercase text-[11px] font-bold tracking-wider">{currentItem.short}</span>
        <span aria-hidden="true" className="text-xs">{currentItem.flag}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
        >
          {LANGUAGES.map((item) => {
            const isSelected = currentLang === item.id;
            return (
              <button
                key={item.id}
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onLanguageChange(item.id);
                  setOpen(false);
                }}
                className={`w-full min-h-[44px] px-3.5 py-2 text-left flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-900 font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-sm">{item.flag}</span>
                  <span>{item.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
