import React, { useState } from "react";
import { 
  Download, 
  X, 
  Copy, 
  Check, 
  Code, 
  FileText, 
  Globe,
  FileCode2,
  Server,
  Sparkles,
  Bot,
  Layers,
  Network,
  ExternalLink,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { SeoEntityDefinition } from "../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: SeoEntityDefinition[];
}

type ExportFormat = "sitemap" | "schema" | "turtle" | "llms" | "markdown" | "html";

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  definitions,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("sitemap");
  const [baseUrl, setBaseUrl] = useState("https://seusite.com.br/glossario");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean base URL to remove trailing slash
  const cleanBase = baseUrl.trim().replace(/\/+$/, "") || "https://seusite.com.br/glossario";

  // Slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  // 1. Generate Sitemap XML (sitemap-glossario.xml)
  const generateSitemap = () => {
    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!-- Sitemap Semântico para Googlebot & Motores de Busca -->\n`;
    xml += `<!-- Adicione esta URL ao seu robots.txt e Google Search Console -->\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
    
    // Root glossary index
    xml += `  <url>\n`;
    xml += `    <loc>${cleanBase}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Each entity URL
    definitions.forEach((d) => {
      const slug = slugify(d.entity);
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/${slug}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  // 2. Generate Linked Data schema.jsonld (@graph DefinedTermSet)
  const generateSchema = () => {
    const today = new Date().toISOString();
    const definedTerms = definitions.map((d) => {
      const slug = slugify(d.entity);
      const sameAsList = d.sameAs || [
        ...(d.wikidataUrl ? [d.wikidataUrl] : []),
        ...(d.wikipediaUrl ? [d.wikipediaUrl] : []),
        ...(d.sources && d.sources.length > 0 ? [d.sources[0]] : [])
      ];

      return {
        "@type": d.schemaType || "DefinedTerm",
        "@id": `${cleanBase}/${slug}#term`,
        name: d.entity,
        termCode: slug,
        description: d.shortSummary || d.definition.slice(0, 200),
        url: `${cleanBase}/${slug}`,
        inDefinedTermSet: `${cleanBase}#vocab`,
        ...(sameAsList.length > 0 ? { sameAs: sameAsList.length === 1 ? sameAsList[0] : sameAsList } : {}),
        ...(d.semanticTriplets && d.semanticTriplets.length > 0
          ? {
              disambiguatingDescription: `Relações semânticas: ${d.semanticTriplets
                .map((t) => `${t.subject} ${t.predicate} ${t.object}`)
                .join("; ")}`,
            }
          : {}),
      };
    });

    const schemaObj = {
      "@context": {
        "@vocab": "https://schema.org/",
        "schema": "https://schema.org/",
        "skos": "http://www.w3.org/2004/02/skos/core#",
        "owl": "http://www.w3.org/2002/07/owl#"
      },
      "@graph": [
        {
          "@type": "DefinedTermSet",
          "@id": `${cleanBase}#vocab`,
          name: "Glossário e Ontologia de SEO Semântico",
          description: "Vocabulário canônico de entidades e conceitos fundamentais para motores de busca e Web Semântica.",
          url: cleanBase,
          dateModified: today,
          hasDefinedTerm: definedTerms,
        },
      ],
    };

    return JSON.stringify(schemaObj, null, 2);
  };

  // 3. Generate W3C RDF Turtle (ontology.ttl)
  const generateTurtle = () => {
    let ttl = `# ===================================================================\n`;
    ttl += `# Ontologia & Grafo de Conhecimento Semântico (W3C RDF Turtle)\n`;
    ttl += `# Canônico para Endpoints Semânticos, SPARQL e Agentes de IA\n`;
    ttl += `# ===================================================================\n\n`;
    ttl += `@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n`;
    ttl += `@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .\n`;
    ttl += `@prefix owl:    <http://www.w3.org/2002/07/owl#> .\n`;
    ttl += `@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .\n`;
    ttl += `@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .\n`;
    ttl += `@prefix schema: <https://schema.org/> .\n`;
    ttl += `@prefix vocab:  <${cleanBase}#> .\n`;
    ttl += `@prefix entity: <${cleanBase}/> .\n\n`;

    ttl += `vocab:Ontology a owl:Ontology ;\n`;
    ttl += `    rdfs:label "Ontologia e Glossário de SEO Semântico"@pt ;\n`;
    ttl += `    rdfs:comment "Ontologia de entidades para desambiguação em motores de busca e grafos de conhecimento."@pt ;\n`;
    ttl += `    owl:versionInfo "1.0" .\n\n`;

    definitions.forEach((d) => {
      const slug = slugify(d.entity);
      const safeDef = d.definition.replace(/"/g, '\\"').replace(/\n/g, " ");
      
      ttl += `entity:${slug} a schema:DefinedTerm, skos:Concept ;\n`;
      ttl += `    rdfs:label "${d.entity}"@pt ;\n`;
      ttl += `    schema:name "${d.entity}"@pt ;\n`;
      ttl += `    schema:category "${d.category}"@pt ;\n`;
      ttl += `    skos:definition "${safeDef}"@pt ;\n`;
      ttl += `    schema:url <${cleanBase}/${slug}> ;\n`;
      ttl += `    skos:inScheme vocab:Ontology `;

      // Add Wikidata / Wikipedia sameAs
      if (d.wikidataUrl) {
        ttl += `;\n    owl:sameAs <${d.wikidataUrl}> `;
      }
      if (d.wikipediaUrl) {
        ttl += `;\n    schema:sameAs <${d.wikipediaUrl}> `;
      }

      // Add triplets as semantic relations
      if (d.semanticTriplets && d.semanticTriplets.length > 0) {
        d.semanticTriplets.forEach((t) => {
          const predSlug = slugify(t.predicate);
          const objSlug = slugify(t.object);
          ttl += `;\n    rdfs:seeAlso entity:${objSlug} `;
        });
      }

      ttl += `.\n\n`;
    });

    return ttl;
  };

  // 4. Generate llms.txt (LLM Standard format for generative search)
  const generateLlmsTxt = () => {
    let txt = `# Glossário de SEO Semântico e Ontologia de Entidades\n\n`;
    txt += `> Este arquivo (/llms.txt) foi estruturado como documento canônico de contexto para modelos de linguagem (LLMs), agentes de IA e motores de busca generativa (Perplexity, ChatGPT Search, Gemini, Claude).\n\n`;
    txt += `## Metadados e Informações Gerais\n`;
    txt += `- **URL Canônica**: ${cleanBase}\n`;
    txt += `- **Total de Entidades Documentadas**: ${definitions.length}\n`;
    txt += `- **Padrão Semântico**: Schema.org DefinedTermSet & Wikidata Knowledge Graph\n\n`;

    txt += `## Diretório de Entidades e Definições Semânticas\n\n`;

    const sorted = [...definitions].sort((a, b) => a.entity.localeCompare(b.entity));

    sorted.forEach((d) => {
      const slug = slugify(d.entity);
      txt += `### [${d.entity}](${cleanBase}/${slug})\n`;
      txt += `- **Categoria**: ${d.category}\n`;
      if (d.wikidataId) {
        txt += `- **Wikidata Q-ID**: ${d.wikidataId} (${d.wikidataUrl || ""})\n`;
      }
      txt += `- **Definição Canônica**: ${d.definition}\n`;
      if (d.semanticTriplets && d.semanticTriplets.length > 0) {
        txt += `- **Relações no Grafo**: ${d.semanticTriplets.map((t) => `(${t.subject} -> ${t.predicate} -> ${t.object})`).join(", ")}\n`;
      }
      if (d.sources && d.sources.length > 0) {
        txt += `- **Fontes e Autoridade**: ${d.sources.join(", ")}\n`;
      }
      txt += `\n`;
    });

    return txt;
  };

  // 5. Generate Markdown Glossary
  const generateMarkdown = () => {
    let md = `# Glossário de SEO Semântico & Entidades\n\n`;
    md += `> Índice com ${definitions.length} termos e definições ontológicas para autoridade tópica.\n\n`;
    md += `## Índice Alfabético\n\n`;
    
    const sorted = [...definitions].sort((a, b) => a.entity.localeCompare(b.entity));
    sorted.forEach((d) => {
      const anchor = slugify(d.entity);
      md += `- [${d.entity}](#${anchor}) *(${d.category})*\n`;
    });

    md += `\n---\n\n`;

    sorted.forEach((d) => {
      md += `### ${d.entity}\n\n`;
      md += `**Categoria:** ${d.category}\n\n`;
      md += `${d.definition}\n\n`;
      if (d.wikidataId) {
        md += `**Wikidata:** [${d.wikidataId}](${d.wikidataUrl || `https://www.wikidata.org/wiki/${d.wikidataId}`})\n\n`;
      }
      if (d.sources && d.sources.length > 0) {
        md += `**Fontes de Autoridade:**\n`;
        d.sources.forEach((src) => {
          md += `- [${src}](${src})\n`;
        });
        md += `\n`;
      }
      if (d.semanticTriplets && d.semanticTriplets.length > 0) {
        md += `**Relações Semânticas (Triplets):**\n`;
        d.semanticTriplets.forEach((t) => {
          md += `- \`${t.subject}\` *${t.predicate}* \`${t.object}\`\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    return md;
  };

  // 6. Generate HTML definition list
  const generateHtml = () => {
    let html = `<div class="semantic-glossary" itemscope itemtype="https://schema.org/DefinedTermSet">\n`;
    html += `  <h2 itemprop="name">Glossário Semântico</h2>\n`;
    html += `  <dl>\n`;
    definitions.forEach((d) => {
      const slug = slugify(d.entity);
      const sameAsAttr = d.wikidataUrl ? ` data-sameas="${d.wikidataUrl}"` : "";
      html += `    <dt class="entity-term" id="${slug}" itemscope itemtype="https://schema.org/DefinedTerm">\n`;
      html += `      <strong itemprop="name">${d.entity}</strong> <span class="category-badge">(${d.category})</span>\n`;
      if (d.wikidataId) {
        html += `      <a href="${d.wikidataUrl || '#'}" class="wikidata-badge" target="_blank" rel="noopener">${d.wikidataId}</a>\n`;
      }
      html += `    </dt>\n`;
      html += `    <dd class="entity-def"${sameAsAttr}>\n`;
      html += `      <p itemprop="description">${d.definition.replace(/\n\n/g, "</p>\n      <p itemprop=\"description\">")}</p>\n`;
      if (d.sources && d.sources.length > 0) {
        html += `      <div class="entity-sources"><small>Fontes: ${d.sources.map((s) => `<a href="${s}" target="_blank" rel="noopener">${s}</a>`).join(", ")}</small></div>\n`;
      }
      html += `    </dd>\n`;
    });
    html += `  </dl>\n</div>`;
    return html;
  };

  const getActiveContent = () => {
    switch (exportFormat) {
      case "sitemap":
        return generateSitemap();
      case "schema":
        return generateSchema();
      case "turtle":
        return generateTurtle();
      case "llms":
        return generateLlmsTxt();
      case "markdown":
        return generateMarkdown();
      case "html":
        return generateHtml();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    let filename = "glossario";
    let mimeType = "text/plain;charset=utf-8";

    if (exportFormat === "sitemap") {
      filename = "sitemap-glossario.xml";
      mimeType = "application/xml;charset=utf-8;";
    } else if (exportFormat === "schema") {
      filename = "schema.jsonld";
      mimeType = "application/ld+json;charset=utf-8;";
    } else if (exportFormat === "turtle") {
      filename = "ontology.ttl";
      mimeType = "text/turtle;charset=utf-8;";
    } else if (exportFormat === "llms") {
      filename = "llms.txt";
      mimeType = "text/plain;charset=utf-8;";
    } else if (exportFormat === "markdown") {
      filename = "glossario.md";
      mimeType = "text/markdown;charset=utf-8;";
    } else if (exportFormat === "html") {
      filename = "glossario.html";
      mimeType = "text/html;charset=utf-8;";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper metadata per format
  const formatInfo: Record<ExportFormat, { title: string; serverDest: string; benefit: string; badge: string }> = {
    sitemap: {
      title: "Sitemap XML Semântico (sitemap-glossario.xml)",
      serverDest: "https://seusite.com.br/sitemap-glossario.xml",
      benefit: "Googlebot varre e indexa todas as páginas do glossário com prioridade e data de modificação.",
      badge: "Google Search Console"
    },
    schema: {
      title: "Grafo Linked Data JSON-LD (schema.jsonld)",
      serverDest: "https://seusite.com.br/glossario/schema.jsonld ou no <head>",
      benefit: "Conecta seu vocabulário ao Knowledge Graph e Schema.org com identificadores @id e sameAs.",
      badge: "Google Knowledge Graph"
    },
    turtle: {
      title: "Ontologia W3C RDF Turtle (ontology.ttl)",
      serverDest: "https://seusite.com.br/.well-known/ontology.ttl ou /ontology.ttl",
      benefit: "Padrão oficial do W3C para Web Semântica, grafos ontológicos e motores semânticos.",
      badge: "Padrão W3C"
    },
    llms: {
      title: "Documento Canônico de IA (llms.txt)",
      serverDest: "https://seusite.com.br/llms.txt ou /glossario/llms.txt",
      benefit: "Padrão emergente consumido diretamente por Perplexity, ChatGPT Search, Gemini e Claude.",
      badge: "Busca Generativa & LLMs"
    },
    markdown: {
      title: "Documentação Markdown (glossario.md)",
      serverDest: "Repositório Git / CMS / Obsidian / Astro",
      benefit: "Ideal para publicar páginas em sites estáticos (Next.js, Hugo, Astro, Ghost).",
      badge: "CMS & Docs"
    },
    html: {
      title: "HTML Semântico W3C <dl> (glossario.html)",
      serverDest: "Corpo do template HTML / WordPress / Blog",
      benefit: "Marcação nativa da web acessível com microdata Schema.org integrado.",
      badge: "HTML5 Nativo"
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#302c33] flex items-center justify-center text-[#fdd910] shadow-xs">
              <Server className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#302c33]">
                  Exportação de Ontologia para Servidor & Motores de Busca
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#7bc970]/15 text-[#2d7a22] border border-[#7bc970]/30">
                  Pronto para Servidor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Formatos canônicos de Web Semântica para o Googlebot, Search Console, W3C e Motores de IA varrerem na raiz do seu site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Domain Config Bar */}
        <div className="px-6 py-2.5 bg-[#fdd910]/10 border-b border-[#907d24]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#302c33] font-bold">
            <Globe className="w-4 h-4 text-[#907d24]" />
            <span>URL Canônica Base do seu Glossário:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://seusite.com.br/glossario"
              className="px-3 py-1 bg-white border border-[#907d24]/30 rounded-lg text-xs font-mono text-[#302c33] focus:outline-hidden focus:ring-1 focus:ring-[#302c33] w-64 sm:w-80"
            />
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-6 overflow-x-auto">
          
          {/* 1. Sitemap */}
          <button
            onClick={() => setExportFormat("sitemap")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "sitemap"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Server className="w-4 h-4 text-[#2576c0]" />
            <span>sitemap.xml</span>
          </button>

          {/* 2. Schema JSON-LD */}
          <button
            onClick={() => setExportFormat("schema")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "schema"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-4 h-4 text-[#7bc970]" />
            <span>schema.jsonld</span>
          </button>

          {/* 3. W3C Turtle */}
          <button
            onClick={() => setExportFormat("turtle")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "turtle"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Network className="w-4 h-4 text-[#590050]" />
            <span>ontology.ttl (RDF)</span>
          </button>

          {/* 4. llms.txt */}
          <button
            onClick={() => setExportFormat("llms")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "llms"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4 text-[#f038a4]" />
            <span>llms.txt (IA)</span>
          </button>

          {/* 5. Markdown */}
          <button
            onClick={() => setExportFormat("markdown")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "markdown"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-[#907d24]" />
            <span>Markdown</span>
          </button>

          {/* 6. HTML */}
          <button
            onClick={() => setExportFormat("html")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              exportFormat === "html"
                ? "border-[#302c33] text-[#302c33] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4 text-slate-600" />
            <span>HTML &lt;dl&gt;</span>
          </button>

        </div>

        {/* Server Destination Guide Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#302c33]">{formatInfo[exportFormat].title}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-[#302c33]/10 text-[#302c33]">
                {formatInfo[exportFormat].badge}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {formatInfo[exportFormat].benefit}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Caminho no Servidor:</span>
            <code className="text-xs font-mono font-bold text-[#2576c0]">
              {formatInfo[exportFormat].serverDest}
            </code>
          </div>
        </div>

        {/* Preview Code Box */}
        <div className="p-6 space-y-2 max-h-[55vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-slate-500">
              Visualização prévia do arquivo gerado:
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {getActiveContent().length} caracteres • {definitions.length} entidades mapeadas
            </span>
          </div>

          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-72 leading-relaxed">
            <pre>{getActiveContent()}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-export-content"
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-download-export-file"
              onClick={handleDownload}
              className="px-5 py-2 bg-[#302c33] hover:bg-[#000000] text-[#fdd910] text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo para Servidor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
