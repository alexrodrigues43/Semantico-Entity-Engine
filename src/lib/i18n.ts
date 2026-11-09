export type SupportedLang = "pt" | "en" | "es";

export interface Translations {
  skipLink: string;
  nav: {
    services: string;
    suite: string;
    blog: string;
    podcasts: string;
    contact: string;
    unlimitedCredits: string;
    credits: string;
    buyCredits: string;
    createAccount: string;
    subscription: string;
    superAdmin: string;
    login: string;
    logout: string;
    adminPanel: string;
    reloadSub: string;
    languageSelectAria: string;
  };
  navLinks: {
    services: string;
    suite: string;
    blog: string;
    podcasts: string;
    contact: string;
    mission: string;
    author: string;
  };
  subnav: {
    problem: string;
    generator: string;
    benefits: string;
    howItWorks: string;
    glossary: string;
    knowledgeGraph: string;
    internalLinking: string;
    ideas: string;
    topicalAudit: string;
    wikidata: string;
    batch: string;
    newEntity: string;
    export: string;
  };
  hero: {
    pill: string;
    titlePart1: string;
    titlePart2: string;
    subtitle: string;
    ctaUseNow: string;
    ctaBeta: string;
    mockupHub: string;
    mockupEntityA: string;
    mockupConceptB: string;
  };
  landing: {
    problem: {
      title: string;
      description: string;
      check1: string;
      check2: string;
      check3: string;
      graphTitle: string;
      graphSubtitle: string;
      looseWords: string;
      looseExample: string;
      connectedKnowledge: string;
      connectedExample: string;
      graphFooter: string;
    };
    solution: {
      eyebrow: string;
      title: string;
      description: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
    };
    benefits: {
      title: string;
      card1Title: string;
      card1Tag: string;
      card1Desc: string;
      card2Title: string;
      card2Tag: string;
      card2Desc: string;
      card3Title: string;
      card3Tag: string;
      card3Desc: string;
      card4Title: string;
      card4Tag: string;
      card4Desc: string;
    };
    howItWorks: {
      title: string;
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
      step4Title: string;
      step4Desc: string;
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  footer: {
    mission: string;
    services: string;
    contact: string;
    author: string;
    copyright: string;
  };
  projectLanguage: {
    label: string;
    pt: string;
    en: string;
    es: string;
    hint: string;
  };
  table: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categoryFilter: string;
    allCategories: string;
    deleteSelected: string;
    thEntity: string;
    thCategory: string;
    thDefinition: string;
    thTriplets: string;
    thSources: string;
    thActions: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyFiltered: string;
    deleteConfirm: string;
    regenerateTitle: string;
    generatingDef: string;
    noDef: string;
    noSources: string;
    relatedTermsTitle: string;
    words: string;
    bulkBannerTitle: string;
    bulkBannerDesc: string;
    bulkBannerBtn: string;
    footerShowing: string;
    footerOf: string;
    footerEntities: string;
    footerOptimized: string;
  };
  singleModal: {
    titleNew: string;
    titleEdit: string;
    subtitle: string;
    presetLabel: string;
    entityLabel: string;
    entityPlaceholder: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    lengthLabel: string;
    lengthConcise: string;
    lengthStandard: string;
    lengthDetailed: string;
    contextLabel: string;
    contextPlaceholder: string;
    btnGenerate: string;
    btnRegenerate: string;
    btnGenerating: string;
    generatedTitle: string;
    generatedPlaceholder: string;
    sourcesLabel: string;
    sourcesPlaceholder: string;
    btnCancel: string;
    btnSave: string;
    errorRequired: string;
  };
  batchModal: {
    title: string;
    subtitle: string;
    tabArticle: string;
    tabList: string;
    uploadFile: string;
    stressTestTitle: string;
    stressTestSubtitle: string;
    articlePlaceholder: string;
    btnExtractEntities: string;
    btnExtracting: string;
    listPlaceholder: string;
    defaultCategoryLabel: string;
    defaultCategoryPlaceholder: string;
    btnStartBatch: string;
    btnProcessing: string;
    btnCancel: string;
    btnStop: string;
    entitiesFound: string;
    selectAll: string;
    tripletsTitle: string;
  };
  topicalAuditModal: {
    title: string;
    subtitle: string;
    scopeLabel: string;
    scopePlaceholder: string;
    btnRun: string;
    btnRunning: string;
    optionalArticle: string;
    articlePlaceholder: string;
    authorityGauge: string;
    graphDensity: string;
    missingNodes: string;
    missingEdges: string;
    tabGaps: string;
    tabEdges: string;
    tabStrategy: string;
    btnClose: string;
  };
  wikidataModal: {
    title: string;
    subtitle: string;
    tabSingle: string;
    tabBulk: string;
    searchPlaceholder: string;
    btnSearch: string;
    searching: string;
    topMatch: string;
    confidence: string;
    linkedCurrent: string;
    unlink: string;
    btnApply: string;
    applySuccess: string;
    applySchema: string;
    canonicalUrlsHeading: string;
    addManualUrl: string;
    addBtn: string;
    otherMatchesHeading: string;
    selectMatch: string;
    noMatches: string;
    bulkHeading: string;
    bulkStartBtn: string;
    bulkApplyAll: string;
    knowledgeGraphBadge: string;
    btnClose: string;
  };
  modals: {
    singleTitleNew: string;
    singleTitleEdit: string;
    entityLabel: string;
    entityPlaceholder: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    contextLabel: string;
    contextPlaceholder: string;
    lengthLabel: string;
    toneLabel: string;
    btnGenerate: string;
    btnGenerating: string;
    btnSave: string;
    btnCancel: string;
    batchTitle: string;
    tabPaste: string;
    tabList: string;
    pastePlaceholder: string;
    btnExtract: string;
    btnExtracting: string;
    btnProcessBatch: string;
    wikidataTitle: string;
    btnReconcileAll: string;
  };
  common: {
    loading: string;
    success: string;
    error: string;
    close: string;
    copy: string;
    copied: string;
  };
}

export const TRANSLATIONS: Record<SupportedLang, Translations> = {
  pt: {
    skipLink: "Pular para o conteúdo principal",
    nav: {
      services: "Serviços",
      suite: "Suíte",
      blog: "Blog",
      podcasts: "Podcasts",
      contact: "Contato",
      unlimitedCredits: "Créditos Ilimitados",
      credits: "créditos",
      buyCredits: "Comprar Créditos",
      createAccount: "Criar Conta",
      subscription: "Assinatura",
      superAdmin: "Super Admin",
      login: "Entrar",
      logout: "Encerrar Sessão",
      adminPanel: "Painel Administrativo",
      reloadSub: "Recarregar / Assinar",
      languageSelectAria: "Selecionar idioma da interface",
    },
    navLinks: {
      services: "https://semantico.com.br/servicos.html",
      suite: "https://semantico.com.br/suite-semantica.html",
      blog: "https://semantico.com.br/blog",
      podcasts: "https://semantico.com.br/podcast-semantico.html",
      contact: "https://semantico.com.br/contato.html",
      mission: "https://semantico.com.br/semantico-seo.html",
      author: "https://semantico.com.br/alexander-rodrigues-silva.html",
    },
    subnav: {
      problem: "O Problema",
      generator: "Gerador",
      benefits: "Benefícios",
      howItWorks: "Como Funciona",
      glossary: "Glossário",
      knowledgeGraph: "Grafo",
      internalLinking: "Linkagem",
      ideas: "Ideias",
      topicalAudit: "Auditoria Tópica",
      wikidata: "Wikidata",
      batch: "Em Lote",
      newEntity: "Nova Entidade",
      export: "Exportar",
    },
    hero: {
      pill: "Semântico SEO · Engenharia de Conhecimento",
      titlePart1: "Gerador de Glossário de ",
      titlePart2: "Entidades",
      subtitle:
        "Construa autoridade com SEO Semântico que funciona de verdade, garantindo que suas ideias sejam compreendidas por humanos, buscadores e modelos de IA.",
      ctaUseNow: "Use a ferramenta agora",
      ctaBeta: "Quero ser beta tester",
      mockupHub: "Artigo",
      mockupEntityA: "Entidade A",
      mockupConceptB: "Conceito B",
    },
    landing: {
      problem: {
        title: "O Problema",
        description:
          "Você já sentiu que seu conteúdo, apesar de bem escrito, não gera o impacto ou a autoridade que deveria? Se você é Redator Técnico, Criador de Conteúdo ou Arquiteto de Conhecimento, sabe que palavras soltas não são suficientes.",
        check1: "Garantir que seu conteúdo seja semanticamente coeso",
        check2: "Conectar ideias complexas de forma lógica e estruturada",
        check3: "Preparar seu conteúdo para o futuro da busca (GraphRAG e IA)",
        graphTitle: "Topologia de Grafo Semântico",
        graphSubtitle: "NER + Schema.org",
        looseWords: "Palavras Soltas",
        looseExample: '"SEO, Links, Google, Texto"',
        connectedKnowledge: "Conhecimento Conectado",
        connectedExample: "(Entidade) → [relação] → (Wikidata)",
        graphFooter:
          "Estrutura de dados formal reconhecida por mecanismos de busca e modelos de linguagem generativa.",
      },
      solution: {
        eyebrow: "A SOLUÇÃO",
        title: "O que é o Gerador de Entidades?",
        description:
          "O Gerador é a sua interface inteligente para transformar textos não estruturados em uma rede poderosa de conhecimento. Através do mapeamento visual de entidades e relações, elevamos o nível do seu SEO Semântico.",
        card1Title: "SEO Semântico",
        card1Desc:
          "Estruture os dados por trás das palavras. Facilite a extração de sentido por máquinas e humanos, dominando as SERPs modernas.",
        card2Title: "Mapeamento Visual",
        card2Desc:
          "Visualize seu conteúdo como uma rede. Identifique lacunas conceituais e crie clusters de tópicos inquebráveis de forma intuitiva.",
      },
      benefits: {
        title: "Principais Benefícios",
        card1Title: "Diagnóstico de Clareza",
        card1Tag: "Otimizador Editorial",
        card1Desc:
          "Avalie instantaneamente se seu texto transmite as entidades corretas com o peso certo. Ajuste a intenção antes de publicar.",
        card2Title: "Visão do Conhecimento",
        card2Tag: "Canvas Visual",
        card2Desc:
          "Enxergue o invisível. Transforme parágrafos densos em mapas mentais rigorosos que revelam a verdadeira estrutura do seu argumento.",
        card3Title: "Futuro Garantido",
        card3Tag: "GraphRAG",
        card3Desc:
          "Deixe seu conteúdo pronto para ser consumido por LLMs corporativos e sistemas de IA avançados.",
        card4Title: "Controle Total",
        card4Tag: "Curadoria Humana",
        card4Desc:
          "A IA auxilia, mas você decide. Refine relações e adicione contexto que só a inteligência humana possui.",
      },
      howItWorks: {
        title: "Como Funciona",
        step1Title: "Envie",
        step1Desc: "Cole seu texto ou faça upload (txt, md) para a plataforma.",
        step2Title: "Analise",
        step2Desc: "O motor processa entidades (NER) e estabelece as conexões lógicas.",
        step3Title: "Refine",
        step3Desc: "Use o Diagnóstico de Clareza para ajustar pesos e relacionamentos.",
        step4Title: "Integre",
        step4Desc: "Exporte os dados estruturados em múltiplos formatos para seu ecossistema.",
      },
      cta: {
        title: "Pronto para elevar o nível do seu conteúdo?",
        subtitle:
          "Pare de apenas escrever e comece a construir autoridade semântica sólida no mundo digital.",
        button: "Use a ferramenta agora",
      },
    },
    footer: {
      mission: "Missão",
      services: "Serviços",
      contact: "Contato",
      author: "Alex Rodrigues",
      copyright: "© 2026 Semântico SEO. Todos os direitos reservados.",
    },
    projectLanguage: {
      label: "Idioma do Conteúdo / Mercado-Alvo",
      pt: "Português",
      en: "English",
      es: "Español",
      hint: "Define o idioma das definições ontológicas da IA e reconciliação Wikipedia/Wikidata.",
    },
    table: {
      badge: "Gerador de Entidades · Base Ontológica",
      title: "Gerador de Glossário de Entidades",
      subtitle:
        "Definições estruturadas para autoridade tópica, Schema.org, SameAs (Wikidata) e GraphRAG.",
      searchPlaceholder: "Buscar por entidade, definição, categoria ou termo correlato...",
      categoryFilter: "Categoria:",
      allCategories: "Todas as Categorias",
      deleteSelected: "Excluir",
      thEntity: "Entidade / Conceito",
      thCategory: "Categoria",
      thDefinition: "Definição Semântica",
      thTriplets: "Triplas & Conexões",
      thSources: "Fontes & SameAs",
      thActions: "Ações",
      emptyTitle: "Nenhuma entidade encontrada",
      emptySubtitle: "Crie uma nova entidade ou utilize a extração em lote para começar.",
      emptyFiltered: "Tente ajustar os filtros de busca ou categoria para encontrar os termos cadastrados.",
      deleteConfirm: "Deseja remover as entidades selecionadas?",
      regenerateTitle: "Regenerar definição ontológica",
      generatingDef: "Gerando definição com Gemini AI...",
      noDef: "Nenhuma definição gerada.",
      noSources: "Sem fontes",
      relatedTermsTitle: "Termos semanticamente relacionados",
      words: "palavras",
      bulkBannerTitle: "Processamento em Lote & Mineração de Artigos",
      bulkBannerDesc: "Cole artigos completos ou listas de termos para gerar dezenas de definições semânticas instantaneamente",
      bulkBannerBtn: "Abrir Gerador em Lote",
      footerShowing: "Exibindo",
      footerOf: "de",
      footerEntities: "entidades cadastradas",
      footerOptimized: "Otimizado para Schema.org DefinedTerm, Knowledge Graph e Google Rich Results",
    },
    singleModal: {
      titleNew: "Gerar Nova Definição Semântica",
      titleEdit: "Editar Entidade Semântica",
      subtitle: "Crie definições otimizadas para SEO com IA ontológica e fontes de autoridade",
      presetLabel: "Preset de Otimização Semântica",
      entityLabel: "Nome da Entidade / Conceito",
      entityPlaceholder: "Ex: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Categoria Sugerida",
      categoryPlaceholder: "Ex: SEO Semântico, Arquitetura de Informação...",
      lengthLabel: "Extensão & Profundidade",
      lengthConcise: "Concisa (1-2 parágrafos - Snippets rápidos)",
      lengthStandard: "Padrão Ontológica (2-4 parágrafos - Recomendado)",
      lengthDetailed: "Aprofundada (3-5 parágrafos - Alta Autoridade E-E-A-T)",
      contextLabel: "Contexto do Nicho / Projeto",
      contextPlaceholder: "Ex: Foco em e-commerce, saúde, SaaS B2B...",
      btnGenerate: "Gerar Definição com IA",
      btnRegenerate: "Regenerar Definição com IA",
      btnGenerating: "Gerando Definição Semântica com Gemini...",
      generatedTitle: "Definição Semântica Gerada",
      generatedPlaceholder: "O texto gerado da definição semântica aparecerá aqui e pode ser editado livremente...",
      sourcesLabel: "Fontes de Autoridade / URLs (separadas por vírgula)",
      sourcesPlaceholder: "Ex: https://rockcontent.com/br/..., https://www.w3.org/...",
      btnCancel: "Cancelar",
      btnSave: "Salvar Entidade",
      errorRequired: "O nome da entidade é obrigatório.",
    },
    batchModal: {
      title: "Gerador de Definições em Lote (Bulk SEO)",
      subtitle: "Minere entidades de textos completos ou cole listas para geração automatizada em massa",
      tabArticle: "Extrair de Artigo / Post Completo",
      tabList: "Lista de Entidades / Planilha",
      uploadFile: "Carregar Arquivo (.txt, .md, .csv)",
      stressTestTitle: "Suíte de Testes de Estresse Semântico & NER (Gold Standard)",
      stressTestSubtitle: "Selecione um cenário para testar a desambiguação contextual estilo PoolParty e penalização de vagueza:",
      articlePlaceholder: "Cole o texto completo do seu artigo ou pauta aqui...",
      btnExtractEntities: "Minere Entidades do Artigo",
      btnExtracting: "Minerando Entidades com Gemini...",
      listPlaceholder: "Digite uma entidade por linha (ex:\nSEO Semântico\nTopic Clusters\nGoogle Knowledge Graph)",
      defaultCategoryLabel: "Categoria Padrão para a Lista",
      defaultCategoryPlaceholder: "Ex: Conceitos Centrais",
      btnStartBatch: "Processar Entidades em Lote",
      btnProcessing: "Processando em Lote...",
      btnCancel: "Fechar",
      btnStop: "Pausar Processamento",
      entitiesFound: "Entidades Mineradas",
      selectAll: "Selecionar Todas",
      tripletsTitle: "Relações & Triplas Semânticas Detectadas",
    },
    topicalAuditModal: {
      title: "Auditoria de Autoridade Tópica",
      subtitle: "Descubra lacunas conceituais e arestas ontológicas faltantes no seu grafo de conhecimento",
      scopeLabel: "Domínio / Nicho da Auditoria:",
      scopePlaceholder: "Ex: SEO Semântico, Knowledge Graphs, Inteligência Artificial...",
      btnRun: "Executar Auditoria Tópica",
      btnRunning: "Auditando com IA...",
      optionalArticle: "+ Opcional: Adicionar texto de artigo ou pilar para auditar lacunas de um conteúdo específico",
      articlePlaceholder: "Cole o artigo aqui se quiser que a IA audite quais conceitos e arestas essenciais estão faltando neste texto...",
      authorityGauge: "Autoridade Tópica",
      graphDensity: "Densidade do Grafo",
      missingNodes: "Nós Ausentes (Gaps)",
      missingEdges: "Pontes Faltantes",
      tabGaps: "Entidades Faltantes",
      tabEdges: "Conexões e Pontes",
      tabStrategy: "Estratégia Editorial",
      btnClose: "Fechar",
    },
    wikidataModal: {
      title: "Reconciliação com Wikidata & Wikipedia (sameAs)",
      subtitle: "Vincule identificadores únicos mundiais (Q-ID) e URLs canônicas ao seu Schema.org",
      tabSingle: "Reconciliar Entidade Atual",
      tabBulk: "Reconciliar Glossário em Lote",
      searchPlaceholder: "Digite o nome da entidade para consultar Wikidata...",
      btnSearch: "Buscar no Wikidata",
      searching: "Consultando API oficial do Wikidata e bases enciclopédicas...",
      topMatch: "Melhor Correspondência Ontológica",
      confidence: "Confiança",
      linkedCurrent: "Entidade vinculada atualmente:",
      unlink: "Desvincular / Limpar",
      btnApply: "Aplicar Reconciliação",
      applySuccess: "Vinculado!",
      applySchema: "Vincular ao Schema sameAs",
      canonicalUrlsHeading: "URLs canônicas que serão adicionadas ao seu campo sameAs:",
      addManualUrl: "Adicionar URL manual",
      addBtn: "Adicionar",
      otherMatchesHeading: "Outros resultados no Wikidata:",
      selectMatch: "Selecionar",
      noMatches: "Nenhuma correspondência encontrada no Wikidata.",
      bulkHeading: "Reconciliação Automática do Glossário Completo",
      bulkStartBtn: "Iniciar Varredura em Lote",
      bulkApplyAll: "Aplicar Todos ao Glossário",
      knowledgeGraphBadge: "Compatível com Google Knowledge Graph & Schema.org DefinedTerm",
      btnClose: "Fechar",
    },
    modals: {
      singleTitleNew: "Gerar Nova Entidade Semântica",
      singleTitleEdit: "Editar Entidade Semântica",
      entityLabel: "Nome da Entidade / Conceito",
      entityPlaceholder: "Ex: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Categoria Sugerida",
      categoryPlaceholder: "Ex: SEO Semântico, Arquitetura de Informação...",
      contextLabel: "Contexto Específico (Opcional)",
      contextPlaceholder: "Adicione contexto sobre seu nicho ou negócio...",
      lengthLabel: "Extensão da Definição",
      toneLabel: "Tom de Voz",
      btnGenerate: "Gerar com IA",
      btnGenerating: "Gerando Definição...",
      btnSave: "Salvar Entidade",
      btnCancel: "Cancelar",
      batchTitle: "Extração & Geração em Lote",
      tabPaste: "Colar Texto / Artigo",
      tabList: "Lista de Entidades",
      pastePlaceholder: "Cole o texto completo do seu artigo ou pauta aqui...",
      btnExtract: "Extrair Entidades com IA",
      btnExtracting: "Extraindo Entidades...",
      btnProcessBatch: "Processar Glossário Completo",
      wikidataTitle: "Reconciliação com Wikidata & Wikipedia",
      btnReconcileAll: "Reconciliar Todas",
    },
    common: {
      loading: "Carregando...",
      success: "Sucesso",
      error: "Erro",
      close: "Fechar",
      copy: "Copiar",
      copied: "Copiado!",
    },
  },
  en: {
    skipLink: "Skip to main content",
    nav: {
      services: "Services",
      suite: "Suite",
      blog: "Blog",
      podcasts: "Podcasts",
      contact: "Contact",
      unlimitedCredits: "Unlimited Credits",
      credits: "credits",
      buyCredits: "Buy Credits",
      createAccount: "Create Account",
      subscription: "Subscription",
      superAdmin: "Super Admin",
      login: "Sign In",
      logout: "Sign Out",
      adminPanel: "Admin Panel",
      reloadSub: "Recharge / Subscribe",
      languageSelectAria: "Select interface language",
    },
    navLinks: {
      services: "https://semantico.com.br/en/services.html",
      suite: "https://semantico.com.br/en/semantic-suite.html",
      blog: "https://semantico.com.br/blog/en/",
      podcasts: "https://semantico.com.br/en/podcasts.html",
      contact: "https://semantico.com.br/en/contact.html",
      mission: "https://semantico.com.br/en/semantic-seo.html",
      author: "https://semantico.com.br/en/alexander-rodrigues-silva.html",
    },
    subnav: {
      problem: "The Problem",
      generator: "Generator",
      benefits: "Benefits",
      howItWorks: "How It Works",
      glossary: "Glossary",
      knowledgeGraph: "Graph",
      internalLinking: "Linking",
      ideas: "Ideas",
      topicalAudit: "Topical Audit",
      wikidata: "Wikidata",
      batch: "Batch",
      newEntity: "New Entity",
      export: "Export",
    },
    hero: {
      pill: "Semantic SEO · Knowledge Engineering",
      titlePart1: "Entity Glossary ",
      titlePart2: "Generator",
      subtitle:
        "Build genuine topical authority with Semantic SEO, ensuring your concepts and entities are thoroughly understood by humans, search engines, and AI models.",
      ctaUseNow: "Use tool now",
      ctaBeta: "Become a beta tester",
      mockupHub: "Article",
      mockupEntityA: "Entity A",
      mockupConceptB: "Concept B",
    },
    landing: {
      problem: {
        title: "The Problem",
        description:
          "Have you ever felt that your content, despite being well-written, doesn't generate the impact or authority it should? If you are a Technical Writer, Content Creator, or Knowledge Architect, you know that loose words are not enough.",
        check1: "Ensure your content is semantically cohesive",
        check2: "Connect complex ideas logically and in a structured way",
        check3: "Prepare your content for the future of search (GraphRAG and AI)",
        graphTitle: "Semantic Graph Topology",
        graphSubtitle: "NER + Schema.org",
        looseWords: "Loose Words",
        looseExample: '"SEO, Links, Google, Text"',
        connectedKnowledge: "Connected Knowledge",
        connectedExample: "(Entity) → [relation] → (Wikidata)",
        graphFooter:
          "Formal data structure recognized by search engines and generative language models.",
      },
      solution: {
        eyebrow: "THE SOLUTION",
        title: "What is the Entity Generator?",
        description:
          "The Generator is your intelligent interface to transform unstructured text into a powerful knowledge network. Through visual mapping of entities and relations, we elevate your Semantic SEO.",
        card1Title: "Semantic SEO",
        card1Desc:
          "Structure the data behind words. Facilitate meaning extraction by machines and humans, dominating modern SERPs.",
        card2Title: "Visual Mapping",
        card2Desc:
          "Visualize your content as a network. Identify conceptual gaps and create unbreakable topic clusters intuitively.",
      },
      benefits: {
        title: "Key Benefits",
        card1Title: "Clarity Diagnosis",
        card1Tag: "Editorial Optimizer",
        card1Desc:
          "Instantly assess whether your text conveys the right entities with the right weight. Adjust intent before publishing.",
        card2Title: "Knowledge Vision",
        card2Tag: "Visual Canvas",
        card2Desc:
          "See the invisible. Transform dense paragraphs into rigorous mind maps that reveal the true structure of your argument.",
        card3Title: "Future-Proof",
        card3Tag: "GraphRAG",
        card3Desc:
          "Get your content ready to be consumed by enterprise LLMs and advanced AI systems.",
        card4Title: "Total Control",
        card4Tag: "Human Curation",
        card4Desc:
          "AI assists, but you decide. Refine relations and add context that only human intelligence possesses.",
      },
      howItWorks: {
        title: "How It Works",
        step1Title: "Submit",
        step1Desc: "Paste your text or upload files (txt, md) to the platform.",
        step2Title: "Analyze",
        step2Desc: "The engine processes entities (NER) and establishes logical connections.",
        step3Title: "Refine",
        step3Desc: "Use Clarity Diagnosis to adjust weights and relationships.",
        step4Title: "Integrate",
        step4Desc: "Export structured data in multiple formats for your ecosystem.",
      },
      cta: {
        title: "Ready to elevate your content?",
        subtitle:
          "Stop just writing and start building solid semantic authority in the digital world.",
        button: "Use the tool now",
      },
    },
    footer: {
      mission: "Mission",
      services: "Services",
      contact: "Contact",
      author: "Alex Rodrigues",
      copyright: "© 2026 Semântico SEO. All rights reserved.",
    },
    projectLanguage: {
      label: "Content Language / Target Market",
      pt: "Português",
      en: "English",
      es: "Español",
      hint: "Sets language for AI ontological definitions and Wikipedia/Wikidata reconciliation.",
    },
    table: {
      badge: "Entity Generator · Ontological Core",
      title: "Entity Glossary Generator",
      subtitle:
        "Structured definitions for topical authority, Schema.org, SameAs (Wikidata), and GraphRAG.",
      searchPlaceholder: "Search by entity, definition, category or related concept...",
      categoryFilter: "Category:",
      allCategories: "All Categories",
      deleteSelected: "Delete",
      thEntity: "Entity / Concept",
      thCategory: "Category",
      thDefinition: "Semantic Definition",
      thTriplets: "Triplets & Connections",
      thSources: "Sources & SameAs",
      thActions: "Actions",
      emptyTitle: "No entities found",
      emptySubtitle: "Create a new entity or use batch extraction to get started.",
      emptyFiltered: "Try adjusting the search or category filters to find registered terms.",
      deleteConfirm: "Do you want to delete the selected entities?",
      regenerateTitle: "Regenerate ontological definition",
      generatingDef: "Generating definition with Gemini AI...",
      noDef: "No definition generated.",
      noSources: "No sources",
      relatedTermsTitle: "Semantically related terms",
      words: "words",
      bulkBannerTitle: "Batch Processing & Article Mining",
      bulkBannerDesc: "Paste full articles or term lists to generate dozens of semantic definitions instantly",
      bulkBannerBtn: "Open Batch Generator",
      footerShowing: "Showing",
      footerOf: "of",
      footerEntities: "registered entities",
      footerOptimized: "Optimized for Schema.org DefinedTerm, Knowledge Graph, and Google Rich Results",
    },
    singleModal: {
      titleNew: "Generate New Semantic Definition",
      titleEdit: "Edit Semantic Entity",
      subtitle: "Create SEO-optimized definitions with ontological AI and authoritative sources",
      presetLabel: "Semantic Optimization Preset",
      entityLabel: "Entity / Concept Name",
      entityPlaceholder: "E.g.: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Suggested Category",
      categoryPlaceholder: "E.g.: Semantic SEO, Information Architecture...",
      lengthLabel: "Length & Depth",
      lengthConcise: "Concise (1-2 paragraphs - Quick snippets)",
      lengthStandard: "Standard Ontological (2-4 paragraphs - Recommended)",
      lengthDetailed: "In-depth (3-5 paragraphs - High E-E-A-T Authority)",
      contextLabel: "Niche / Project Context",
      contextPlaceholder: "E.g.: Focus on e-commerce, healthcare, B2B SaaS...",
      btnGenerate: "Generate Definition with AI",
      btnRegenerate: "Regenerate Definition with AI",
      btnGenerating: "Generating Semantic Definition with Gemini...",
      generatedTitle: "Generated Semantic Definition",
      generatedPlaceholder: "Generated semantic definition text will appear here and can be freely edited...",
      sourcesLabel: "Authoritative Sources / URLs (comma separated)",
      sourcesPlaceholder: "E.g.: https://en.wikipedia.org/..., https://www.w3.org/...",
      btnCancel: "Cancel",
      btnSave: "Save Entity",
      errorRequired: "The entity name is required.",
    },
    batchModal: {
      title: "Batch Definition Generator (Bulk SEO)",
      subtitle: "Mine entities from full texts or paste lists for automated bulk generation",
      tabArticle: "Extract from Article / Full Post",
      tabList: "Entity List / Spreadsheet",
      uploadFile: "Upload File (.txt, .md, .csv)",
      stressTestTitle: "Semantic Stress Testing & NER Suite (Gold Standard)",
      stressTestSubtitle: "Select a scenario to test PoolParty-style contextual disambiguation and vagueness penalization:",
      articlePlaceholder: "Paste the full text of your article or topical content here...",
      btnExtractEntities: "Mine Entities from Article",
      btnExtracting: "Mining Entities with Gemini...",
      listPlaceholder: "Enter one entity per line (e.g.:\nSemantic SEO\nTopic Clusters\nGoogle Knowledge Graph)",
      defaultCategoryLabel: "Default Category for the List",
      defaultCategoryPlaceholder: "E.g.: Core Concepts",
      btnStartBatch: "Process Entities in Batch",
      btnProcessing: "Processing in Batch...",
      btnCancel: "Close",
      btnStop: "Pause Processing",
      entitiesFound: "Mined Entities",
      selectAll: "Select All",
      tripletsTitle: "Detected Relationships & Semantic Triplets",
    },
    topicalAuditModal: {
      title: "Topical Authority Audit",
      subtitle: "Discover conceptual gaps and missing ontological edges in your knowledge graph",
      scopeLabel: "Audit Domain / Niche:",
      scopePlaceholder: "E.g.: Semantic SEO, Knowledge Graphs, Artificial Intelligence...",
      btnRun: "Run Topical Audit",
      btnRunning: "Auditing with AI...",
      optionalArticle: "+ Optional: Add article or pillar text to audit gaps in specific content",
      articlePlaceholder: "Paste the article here if you want AI to audit which essential concepts and edges are missing in this text...",
      authorityGauge: "Topical Authority",
      graphDensity: "Graph Density",
      missingNodes: "Missing Nodes (Gaps)",
      missingEdges: "Missing Edges",
      tabGaps: "Missing Entities",
      tabEdges: "Connections & Bridges",
      tabStrategy: "Editorial Strategy",
      btnClose: "Close",
    },
    wikidataModal: {
      title: "Wikidata & Wikipedia Reconciliation (sameAs)",
      subtitle: "Link global unique identifiers (Q-ID) and canonical URLs to your Schema.org",
      tabSingle: "Reconcile Current Entity",
      tabBulk: "Reconcile Glossary in Batch",
      searchPlaceholder: "Type entity name to search Wikidata...",
      btnSearch: "Search Wikidata",
      searching: "Querying official Wikidata API and encyclopedia bases...",
      topMatch: "Best Ontological Match",
      confidence: "Confidence",
      linkedCurrent: "Currently linked entity:",
      unlink: "Unlink / Clear",
      btnApply: "Apply Reconciliation",
      applySuccess: "Linked!",
      applySchema: "Link to sameAs Schema",
      canonicalUrlsHeading: "Canonical URLs to be added to sameAs field:",
      addManualUrl: "Add manual URL",
      addBtn: "Add",
      otherMatchesHeading: "Other Wikidata results:",
      selectMatch: "Select",
      noMatches: "No matches found on Wikidata.",
      bulkHeading: "Automatic Full Glossary Reconciliation",
      bulkStartBtn: "Start Batch Scan",
      bulkApplyAll: "Apply All to Glossary",
      knowledgeGraphBadge: "Compatible with Google Knowledge Graph & Schema.org DefinedTerm",
      btnClose: "Close",
    },
    modals: {
      singleTitleNew: "Generate New Semantic Entity",
      singleTitleEdit: "Edit Semantic Entity",
      entityLabel: "Entity / Concept Name",
      entityPlaceholder: "E.g.: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Suggested Category",
      categoryPlaceholder: "E.g.: Semantic SEO, Information Architecture...",
      contextLabel: "Specific Context (Optional)",
      contextPlaceholder: "Add context about your niche, brand or project...",
      lengthLabel: "Definition Length",
      toneLabel: "Tone of Voice",
      btnGenerate: "Generate with AI",
      btnGenerating: "Generating Definition...",
      btnSave: "Save Entity",
      btnCancel: "Cancel",
      batchTitle: "Batch Extraction & Generation",
      tabPaste: "Paste Text / Article",
      tabList: "Entity List",
      pastePlaceholder: "Paste the full text of your article or topical content here...",
      btnExtract: "Extract Entities with AI",
      btnExtracting: "Extracting Entities...",
      btnProcessBatch: "Process Full Glossary",
      wikidataTitle: "Wikidata & Wikipedia Reconciliation",
      btnReconcileAll: "Reconcile All",
    },
    common: {
      loading: "Loading...",
      success: "Success",
      error: "Error",
      close: "Close",
      copy: "Copy",
      copied: "Copied!",
    },
  },
  es: {
    skipLink: "Saltar al contenido principal",
    nav: {
      services: "Servicios",
      suite: "Suite",
      blog: "Blog",
      podcasts: "Podcasts",
      contact: "Contacto",
      unlimitedCredits: "Créditos Ilimitados",
      credits: "créditos",
      buyCredits: "Comprar Créditos",
      createAccount: "Crear Cuenta",
      subscription: "Suscripción",
      superAdmin: "Super Admin",
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      adminPanel: "Panel Administrativo",
      reloadSub: "Recargar / Suscribirse",
      languageSelectAria: "Seleccionar idioma de la interfaz",
    },
    navLinks: {
      services: "https://semantico.com.br/es/servicios.html",
      suite: "https://semantico.com.br/es/herramientas-semanticas.html",
      blog: "https://semantico.com.br/blog/es/",
      podcasts: "https://semantico.com.br/es/podcast-semantico.html",
      contact: "https://semantico.com.br/es/contacto.html",
      mission: "https://semantico.com.br/es/semantico-seo.html",
      author: "https://semantico.com.br/es/alexander-rodrigues-silva.html",
    },
    subnav: {
      problem: "El Problema",
      generator: "Generador",
      benefits: "Beneficios",
      howItWorks: "Cómo Funciona",
      glossary: "Glosario",
      knowledgeGraph: "Grafo",
      internalLinking: "Enlazado",
      ideas: "Ideas",
      topicalAudit: "Auditoría Tópica",
      wikidata: "Wikidata",
      batch: "En Lote",
      newEntity: "Nueva Entidad",
      export: "Exportar",
    },
    hero: {
      pill: "SEO Semántico · Ingeniería de Conocimiento",
      titlePart1: "Generador de Glosario de ",
      titlePart2: "Entidades",
      subtitle:
        "Construya autoridad tópica con SEO Semántico real, asegurando que sus conceptos y entidades sean comprendidos por humanos, buscadores y modelos de IA.",
      ctaUseNow: "Usar la herramienta ahora",
      ctaBeta: "Quero ser beta tester",
      mockupHub: "Artículo",
      mockupEntityA: "Entidad A",
      mockupConceptB: "Concepto B",
    },
    landing: {
      problem: {
        title: "El Problema",
        description:
          "¿Alguna vez has sentido que tu contenido, a pesar de estar bien escrito, no genera el impacto o la autoridad que debería? Si eres Redactor Técnico, Creador de Contenido o Arquitecto de Conocimiento, sabes que las palabras sueltas no son suficientes.",
        check1: "Garantizar que tu contenido sea semánticamente cohesivo",
        check2: "Conectar ideas complejas de forma lógica y estructurada",
        check3: "Preparar tu contenido para el futuro de la búsqueda (GraphRAG e IA)",
        graphTitle: "Topología de Grafo Semántico",
        graphSubtitle: "NER + Schema.org",
        looseWords: "Palabras Sueltas",
        looseExample: '"SEO, Enlaces, Google, Texto"',
        connectedKnowledge: "Conocimiento Conectado",
        connectedExample: "(Entidad) → [relación] → (Wikidata)",
        graphFooter:
          "Estructura de datos formal reconocida por motores de búsqueda y modelos de lenguaje generativo.",
      },
      solution: {
        eyebrow: "LA SOLUCIÓN",
        title: "¿Qué es el Generador de Entidades?",
        description:
          "El Generador es tu interfaz inteligente para transformar textos no estructurados en una poderosa red de conocimiento. A través del mapeo visual de entidades y relaciones, elevamos el nivel de tu SEO Semántico.",
        card1Title: "SEO Semántico",
        card1Desc:
          "Estructura los datos detrás de las palabras. Facilita la extracción de sentido por máquinas y humanos, dominando las SERPs modernas.",
        card2Title: "Mapeo Visual",
        card2Desc:
          "Visualiza tu contenido como una red. Identifica brechas conceptuales y crea clústeres de temas inquebrantables de forma intuitiva.",
      },
      benefits: {
        title: "Principales Beneficios",
        card1Title: "Diagnóstico de Claridad",
        card1Tag: "Optimizador Editorial",
        card1Desc:
          "Evalúa al instante si tu texto transmite las entidades correctas con el peso adecuado. Ajusta la intención antes de publicar.",
        card2Title: "Visión del Conocimiento",
        card2Tag: "Lienzo Visual",
        card2Desc:
          "Mira lo invisible. Transforma párrafos densos en mapas mentales rigurosos que revelan la verdadera estructura de tu argumento.",
        card3Title: "Futuro Garantizado",
        card3Tag: "GraphRAG",
        card3Desc:
          "Deja tu contenido listo para ser consumido por LLMs corporativos y sistemas de IA avanzados.",
        card4Title: "Control Total",
        card4Tag: "Curaduría Humana",
        card4Desc:
          "La IA asiste, pero tú decides. Refina relaciones y agrega contexto que solo la inteligencia humana posee.",
      },
      howItWorks: {
        title: "Cómo Funciona",
        step1Title: "Envía",
        step1Desc: "Pega tu texto o sube archivos (txt, md) a la plataforma.",
        step2Title: "Analiza",
        step2Desc: "El motor procesa entidades (NER) y establece las conexiones lógicas.",
        step3Title: "Refina",
        step3Desc: "Usa el Diagnóstico de Claridad para ajustar pesos y relaciones.",
        step4Title: "Integra",
        step4Desc: "Exporta los datos estructurados en múltiples formatos para tu ecosistema.",
      },
      cta: {
        title: "¿Listo para elevar el nivel de tu contenido?",
        subtitle:
          "Deja de solo escribir y comienza a construir una autoridad semántica sólida en el mundo digital.",
        button: "Usar la herramienta ahora",
      },
    },
    footer: {
      mission: "Misión",
      services: "Servicios",
      contact: "Contacto",
      author: "Alex Rodrigues",
      copyright: "© 2026 Semântico SEO. Todos los derechos reservados.",
    },
    projectLanguage: {
      label: "Idioma del Contenido / Mercado Objetivo",
      pt: "Português",
      en: "English",
      es: "Español",
      hint: "Define el idioma de las definiciones ontológicas de la IA y reconciliación Wikipedia/Wikidata.",
    },
    table: {
      badge: "Generador de Entidades · Base Ontológica",
      title: "Generador de Glosario de Entidades",
      subtitle:
        "Definiciones estructuradas para autoridad tópica, Schema.org, SameAs (Wikidata) y GraphRAG.",
      searchPlaceholder: "Buscar por entidad, definición, categoría o concepto relacionado...",
      categoryFilter: "Categoría:",
      allCategories: "Todas las Categorías",
      deleteSelected: "Eliminar",
      thEntity: "Entidad / Concepto",
      thCategory: "Categoría",
      thDefinition: "Definición Semántica",
      thTriplets: "Tripletas & Conexiones",
      thSources: "Fuentes & SameAs",
      thActions: "Acciones",
      emptyTitle: "No se encontraron entidades",
      emptySubtitle: "Cree una nueva entidad o use la extracción por lotes para comenzar.",
      emptyFiltered: "Intenta ajustar los filtros de búsqueda o categoría para encontrar los términos registrados.",
      deleteConfirm: "¿Desea eliminar las entidades seleccionadas?",
      regenerateTitle: "Regenerar definición ontológica",
      generatingDef: "Generando definición con Gemini AI...",
      noDef: "Ninguna definición generada.",
      noSources: "Sin fuentes",
      relatedTermsTitle: "Términos semánticamente relacionados",
      words: "palabras",
      bulkBannerTitle: "Procesamiento por Lotes y Minería de Artículos",
      bulkBannerDesc: "Pega artículos completos o listas de términos para generar decenas de definiciones semánticas al instante",
      bulkBannerBtn: "Abrir Generador por Lotes",
      footerShowing: "Mostrando",
      footerOf: "de",
      footerEntities: "entidades registradas",
      footerOptimized: "Optimizado para Schema.org DefinedTerm, Knowledge Graph y Google Rich Results",
    },
    singleModal: {
      titleNew: "Generar Nueva Definición Semántica",
      titleEdit: "Editar Entidad Semántica",
      subtitle: "Crea definiciones optimizadas para SEO con IA ontológica y fuentes de autoridad",
      presetLabel: "Preset de Optimización Semántica",
      entityLabel: "Nombre de la Entidad / Concepto",
      entityPlaceholder: "Ej: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Categoría Sugerida",
      categoryPlaceholder: "Ej: SEO Semántico, Arquitectura de Información...",
      lengthLabel: "Extensión & Profundidad",
      lengthConcise: "Concisa (1-2 párrafos - Snippets rápidos)",
      lengthStandard: "Estándar Ontológica (2-4 párrafos - Recomendado)",
      lengthDetailed: "En profundidad (3-5 párrafos - Alta Autoridad E-E-A-T)",
      contextLabel: "Contexto del Nicho / Proyecto",
      contextPlaceholder: "Ej: Enfoque en comercio electrónico, salud, SaaS B2B...",
      btnGenerate: "Generar Definición con IA",
      btnRegenerate: "Regenerar Definición con IA",
      btnGenerating: "Generando Definición Semántica con Gemini...",
      generatedTitle: "Definición Semántica Generada",
      generatedPlaceholder: "El texto generado de la definición semántica aparecerá aquí y se puede editar libremente...",
      sourcesLabel: "Fuentes de Autoridad / URLs (separadas por coma)",
      sourcesPlaceholder: "Ej: https://es.wikipedia.org/..., https://www.w3.org/...",
      btnCancel: "Cancelar",
      btnSave: "Guardar Entidad",
      errorRequired: "El nombre de la entidad es obligatorio.",
    },
    batchModal: {
      title: "Generador de Definiciones por Lotes (Bulk SEO)",
      subtitle: "Mina entidades de textos completos o pega listas para generación automatizada masiva",
      tabArticle: "Extraer de Artículo / Publicación Completa",
      tabList: "Lista de Entidades / Planilla",
      uploadFile: "Cargar Archivo (.txt, .md, .csv)",
      stressTestTitle: "Suite de Pruebas de Estrés Semántico y NER (Gold Standard)",
      stressTestSubtitle: "Selecciona un escenario para probar la desambiguación contextual estilo PoolParty y la penalización de vaguedad:",
      articlePlaceholder: "Pega el texto completo de tu artículo o contenido aquí...",
      btnExtractEntities: "Minar Entidades del Artículo",
      btnExtracting: "Minando Entidades con Gemini...",
      listPlaceholder: "Escribe una entidad por línea (ej:\nSEO Semántico\nTopic Clusters\nGoogle Knowledge Graph)",
      defaultCategoryLabel: "Categoría Predeterminada para la Lista",
      defaultCategoryPlaceholder: "Ej: Conceptos Centrales",
      btnStartBatch: "Procesar Entidades por Lotes",
      btnProcessing: "Procesando por Lotes...",
      btnCancel: "Cerrar",
      btnStop: "Pausar Procesamiento",
      entitiesFound: "Entidades Minadas",
      selectAll: "Seleccionar Todas",
      tripletsTitle: "Relaciones y Tripletas Semánticas Detectadas",
    },
    topicalAuditModal: {
      title: "Auditoría de Autoridad Tópica",
      subtitle: "Descubre brechas conceptuales y aristas ontológicas faltantes en tu grafo de conocimiento",
      scopeLabel: "Dominio / Nicho de la Auditoría:",
      scopePlaceholder: "Ej: SEO Semántico, Knowledge Graphs, Inteligencia Artificial...",
      btnRun: "Ejecutar Auditoría Tópica",
      btnRunning: "Auditando con IA...",
      optionalArticle: "+ Opcional: Agregar texto de artículo o pilar para auditar brechas de un contenido específico",
      articlePlaceholder: "Pega el artículo aquí si deseas que la IA audite qué conceptos y aristas esenciales faltan en este texto...",
      authorityGauge: "Autoridad Tópica",
      graphDensity: "Densidad del Grafo",
      missingNodes: "Nodos Ausentes (Brechas)",
      missingEdges: "Puentes Faltantes",
      tabGaps: "Entidades Faltantes",
      tabEdges: "Conexiones y Puentes",
      tabStrategy: "Estratégia Editorial",
      btnClose: "Cerrar",
    },
    wikidataModal: {
      title: "Reconciliación con Wikidata & Wikipedia (sameAs)",
      subtitle: "Vincula identificadores únicos mundiales (Q-ID) y URLs canónicas a tu Schema.org",
      tabSingle: "Reconciliar Entidad Actual",
      tabBulk: "Reconciliar Glosario por Lotes",
      searchPlaceholder: "Escribe el nombre de la entidad para consultar Wikidata...",
      btnSearch: "Buscar en Wikidata",
      searching: "Consultando la API oficial de Wikidata y bases enciclopédicas...",
      topMatch: "Mejor Correspondencia Ontológica",
      confidence: "Confianza",
      linkedCurrent: "Entidad vinculada actualmente:",
      unlink: "Desvincular / Limpiar",
      btnApply: "Aplicar Reconciliación",
      applySuccess: "¡Vinculado!",
      applySchema: "Vincular al Schema sameAs",
      canonicalUrlsHeading: "URLs canónicas que se añadirán al campo sameAs:",
      addManualUrl: "Añadir URL manual",
      addBtn: "Añadir",
      otherMatchesHeading: "Otros resultados en Wikidata:",
      selectMatch: "Seleccionar",
      noMatches: "No se encontraron coincidencias en Wikidata.",
      bulkHeading: "Reconciliación Automática del Glosario Completo",
      bulkStartBtn: "Iniciar Exploración por Lotes",
      bulkApplyAll: "Aplicar Todos al Glosario",
      knowledgeGraphBadge: "Compatible con Google Knowledge Graph & Schema.org DefinedTerm",
      btnClose: "Cerrar",
    },
    modals: {
      singleTitleNew: "Generar Nueva Entidad Semántica",
      singleTitleEdit: "Editar Entidad Semántica",
      entityLabel: "Nombre de la Entidad / Concepto",
      entityPlaceholder: "Ej: Topic Cluster, Entity Salience, Knowledge Graph...",
      categoryLabel: "Categoría Sugerida",
      categoryPlaceholder: "Ej: SEO Semántico, Arquitectura de Información...",
      contextLabel: "Contexto Específico (Opcional)",
      contextPlaceholder: "Añada contexto sobre su nicho o negocio...",
      lengthLabel: "Extensión de la Definición",
      toneLabel: "Tono de Voz",
      btnGenerate: "Generar con IA",
      btnGenerating: "Generando Definición...",
      btnSave: "Guardar Entidad",
      btnCancel: "Cancelar",
      batchTitle: "Extracción & Generación por Lotes",
      tabPaste: "Pegar Texto / Artículo",
      tabList: "Lista de Entidades",
      pastePlaceholder: "Pegue el texto completo de su artículo o contenido aquí...",
      btnExtract: "Extraer Entidades con IA",
      btnExtracting: "Extrayendo Entidades...",
      btnProcessBatch: "Procesar Glosario Completo",
      wikidataTitle: "Reconciliación con Wikidata & Wikipedia",
      btnReconcileAll: "Reconciliar Todas",
    },
    common: {
      loading: "Cargando...",
      success: "Éxito",
      error: "Error",
      close: "Cerrar",
      copy: "Copiar",
      copied: "¡Copiado!",
    },
  },
};

const STORAGE_UI_LANG_KEY = "semantico_ui_lang";

export function getInitialUiLang(): SupportedLang {
  try {
    const saved = localStorage.getItem(STORAGE_UI_LANG_KEY);
    if (saved === "pt" || saved === "en" || saved === "es") {
      return saved;
    }
    const navLang = navigator.language?.toLowerCase() || "";
    if (navLang.startsWith("es")) return "es";
    if (navLang.startsWith("en")) return "en";
  } catch (e) {
    console.error("Erro ao obter uiLang inicial:", e);
  }
  return "pt";
}

export function saveStoredUiLang(lang: SupportedLang): void {
  try {
    localStorage.setItem(STORAGE_UI_LANG_KEY, lang);
  } catch (e) {
    console.error("Erro ao salvar uiLang:", e);
  }
}

export function getTranslations(lang?: SupportedLang | string): Translations {
  if (lang === "en") return TRANSLATIONS.en;
  if (lang === "es") return TRANSLATIONS.es;
  return TRANSLATIONS.pt;
}
