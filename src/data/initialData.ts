import { SeoEntityDefinition, PromptPreset } from "../types";

export const initialDefinitions: SeoEntityDefinition[] = [
  {
    id: "def-1",
    entity: "SEO Semântico",
    category: "Marketing Digital",
    definition: `SEO Semântico é uma abordagem de otimização para mecanismos de busca que se concentra na compreensão da intenção do usuário e no contexto por trás de suas consultas, em vez de apenas palavras-chave. Ele busca entender o significado e a relação entre os termos utilizados na busca, visando entregar resultados mais relevantes e precisos.

Essa estratégia envolve a criação de conteúdo que responda às perguntas dos usuários de forma completa e abrangente, utilizando uma linguagem natural e relevante. O SEO Semântico considera a semântica das palavras e frases, explorando sinônimos, termos relacionados e variações linguísticas para aumentar a relevância do conteúdo.

A implementação do SEO Semântico também inclui a otimização da estrutura do site, utilizando marcações de dados estruturados (Schema.org) para fornecer informações claras aos mecanismos de busca sobre o conteúdo da página. Isso auxilia os buscadores a entenderem o contexto e a finalidade do conteúdo, melhorando o ranqueamento.

Em resumo, o SEO Semântico representa uma evolução do SEO tradicional, focando na compreensão do significado e da intenção por trás das buscas dos usuários. Ao adotar essa abordagem, os sites podem melhorar sua visibilidade nos resultados de busca e atrair um público mais qualificado e engajado.`,
    shortSummary: "Abordagem de otimização de busca focada no significado, intenção do usuário e relações conceituais em vez de apenas repetição de palavras-chave.",
    sources: ["https://rockcontent.com/br/blog/seo-semantico/"],
    sourcesString: "https://rockcontent.com/br/blog/seo-semantico/",
    semanticTriplets: [
      { subject: "SEO Semântico", predicate: "utiliza", object: "Schema.org" },
      { subject: "SEO Semântico", predicate: "prioriza", object: "Intenção de Busca" },
      { subject: "SEO Semântico", predicate: "alimenta", object: "Knowledge Graph" }
    ],
    lsiKeywords: ["Entidades Nomeadas", "Topic Clusters", "Schema Markup", "E-E-A-T", "NLP", "Vetorização"],
    schemaType: "DefinedTerm",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": "SEO Semântico",
      "description": "Abordagem de otimização de busca focada na compreensão contextual e nas relações entre entidades e intenções de pesquisa.",
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Glossário de SEO Semântico"
      }
    },
    status: "completed",
    createdAt: new Date().toISOString()
  },
  {
    id: "def-2",
    entity: "Linked data",
    category: "Tecnologia da Web",
    definition: `Linked Data é uma metodologia de publicação de dados estruturados na Web de forma que eles possam ser interligados e se tornar mais úteis. Ao invés de simplesmente publicar dados como páginas da web para leitura humana, o Linked Data usa URIs para identificar coisas, usa HTTP para permitir que as pessoas procurem essas URIs e obtenham informações úteis, e usa RDF para modelar e interconectar os dados. O objetivo é criar uma Web de dados, onde informações de diferentes fontes podem ser combinadas e exploradas de forma mais eficiente.`,
    shortSummary: "Conjunto de boas práticas e padrões para publicação e interconexão de dados legíveis por máquinas na Web.",
    sources: ["https://www.w3.org/standards/semanticweb/data"],
    sourcesString: "https://www.w3.org/standards/semanticweb/data",
    semanticTriplets: [
      { subject: "Linked Data", predicate: "padronizado por", object: "W3C" },
      { subject: "Linked Data", predicate: "utiliza formato", object: "RDF" },
      { subject: "Linked Data", predicate: "identifica através de", object: "URIs / IRIs" }
    ],
    lsiKeywords: ["Web Semântica", "RDF", "SPARQL", "Ontologias", "Knowledge Graph", "Wikidata"],
    schemaType: "DefinedTerm",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": "Linked Data",
      "description": "Metodologia de publicação de dados estruturados na Web interconectados via URIs e formato RDF.",
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Glossário de SEO Semântico"
      }
    },
    status: "completed",
    createdAt: new Date().toISOString()
  },
  {
    id: "def-3",
    entity: "Knowledge Graph",
    category: "Inteligência Artificial & Busca",
    definition: `Knowledge Graph (Grafo de Conhecimento) é uma base de conhecimento estruturada que representa entidades do mundo real (como pessoas, lugares, conceitos e organizações) e as relações lógicas e semânticas entre elas. No contexto dos mecanismos de busca, como o Google Knowledge Graph, ele permite ao buscador responder a perguntas com fatos concretos em vez de apenas uma lista de links azuis, compreendendo "coisas, não strings".`,
    shortSummary: "Rede de conhecimento vetorial e ontológica que conecta entidades e suas propriedades para raciocínio computacional.",
    sources: ["https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"],
    sourcesString: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    semanticTriplets: [
      { subject: "Knowledge Graph", predicate: "armazena", object: "Entidades Nomeadas" },
      { subject: "Knowledge Graph", predicate: "alimenta", object: "Google Search" }
    ],
    lsiKeywords: ["Entidades", "Ontologia", "Mapeamento Semântico", "Google RankBrain"],
    schemaType: "DefinedTerm",
    status: "completed",
    createdAt: new Date().toISOString()
  }
];

export const promptPresets: PromptPreset[] = [
  {
    id: "preset-ontological",
    name: "Autoridade Ontológica (Padrão)",
    description: "Fórmula clássica de definição com categoria superior, diferenciais técnicos, valor para busca e fontes de alta reputação.",
    badge: "Recomendado",
    template: `Você é um arquiteto ontológico e especialista sênior em SEO Semântico.
Gere uma definição completa e autoritativa para a entidade: "{entity}"
Categoria informada: "{category}"
Tom: {tone}
Idioma: {language}

Estrutura da definição:
1. Parágrafo 1: Definição ontológica exata ([Entidade] é uma [categoria] que...).
2. Parágrafo 2: Metodologia, princípios de funcionamento e interconexões.
3. Parágrafo 3: Relevância prática para o ecossistema de SEO Semântico, Web Semântica e motores de busca.
4. Fontes canônicas de referência.`
  },
  {
    id: "preset-concise-snippet",
    name: "Featured Snippet & Resposta Direta",
    description: "Definição sintetizada em 1 a 2 parágrafos altamente objetivos, focados em capturar a posição zero do Google.",
    badge: "Snippets",
    template: `Você é um redator técnico de SEO focado em Featured Snippets.
Crie uma definição objetiva, cirúrgica e de fácil leitura para a entidade "{entity}" ({category}).
Foque em clareza máxima nos primeiros 40-60 caracteres para responder diretamente "O que é {entity}?".
Inclua 1 fonte confiável.`
  },
  {
    id: "preset-technical-deep",
    name: "Dicionário Técnico & E-E-A-T Avançado",
    description: "Análise aprofundada com padrões W3C, vocabulários Schema.org, ontologia e relações com Machine Learning.",
    badge: "Técnico",
    template: `Você é um pesquisador em Ciência da Computação e Web Semântica.
Desenvolva uma definição técnica detalhada sobre a entidade "{entity}" dentro de "{category}".
Aborde especificações técnicas, padrões de dados (RDF, OWL, JSON-LD), casos de uso de engenharia de busca e 2 fontes de autoridade máxima.`
  },
  {
    id: "preset-pillar-cluster",
    name: "Pilar de Conteúdo / Topic Cluster",
    description: "Definição contextualizada para páginas-pilar, com termos de co-ocorrência e ganchos para links internos.",
    badge: "Topic Cluster",
    template: `Crie uma definição semântica para "{entity}" pensada para uma página pilar de SEO.
Destaque a aplicação prática, principais benefícios, sinônimos semânticos e como essa entidade se conecta a tópicos adjacentes.`
  }
];
