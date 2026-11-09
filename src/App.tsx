/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { 
  auth, 
  db, 
  syncUserProfile, 
  logoutUser, 
  incrementUserToolUsage,
  saveUserEntity,
  batchSaveUserDefinitions,
  deleteUserEntity,
  subscribeUserDefinitions
} from "./lib/firebase";
import { Navbar } from "./components/Navbar";
import { DefinitionsTable } from "./components/DefinitionsTable";
import { GraphStudioHero } from "./components/GraphStudioHero";
import { Footer } from "./components/Footer";

// Lazy-loaded secondary views (code-split)
const KnowledgeGraphView = lazy(() =>
  import("./components/KnowledgeGraphView").then((m) => ({ default: m.KnowledgeGraphView }))
);
const InternalLinkingView = lazy(() =>
  import("./components/InternalLinkingView").then((m) => ({ default: m.InternalLinkingView }))
);
const IdeasAndPossibilitiesView = lazy(() =>
  import("./components/IdeasAndPossibilitiesView").then((m) => ({ default: m.IdeasAndPossibilitiesView }))
);

// Lazy-loaded on-demand modals (code-split)
const SingleGeneratorModal = lazy(() =>
  import("./components/SingleGeneratorModal").then((m) => ({ default: m.SingleGeneratorModal }))
);
const BatchGeneratorModal = lazy(() =>
  import("./components/BatchGeneratorModal").then((m) => ({ default: m.BatchGeneratorModal }))
);
const EntityDetailModal = lazy(() =>
  import("./components/EntityDetailModal").then((m) => ({ default: m.EntityDetailModal }))
);
const PromptManagerModal = lazy(() =>
  import("./components/PromptManagerModal").then((m) => ({ default: m.PromptManagerModal }))
);
const ExportModal = lazy(() =>
  import("./components/ExportModal").then((m) => ({ default: m.ExportModal }))
);
const RelationshipSuggesterModal = lazy(() =>
  import("./components/RelationshipSuggesterModal").then((m) => ({ default: m.RelationshipSuggesterModal }))
);
const WikidataReconcileModal = lazy(() =>
  import("./components/WikidataReconcileModal").then((m) => ({ default: m.WikidataReconcileModal }))
);
const TopicalAuditModal = lazy(() =>
  import("./components/TopicalAuditModal").then((m) => ({ default: m.TopicalAuditModal }))
);
const AuthModal = lazy(() =>
  import("./components/AuthModal").then((m) => ({ default: m.AuthModal }))
);
const SubscriptionPaywallModal = lazy(() =>
  import("./components/SubscriptionPaywallModal").then((m) => ({ default: m.SubscriptionPaywallModal }))
);
const AdminSubscriptionsModal = lazy(() =>
  import("./components/AdminSubscriptionsModal").then((m) => ({ default: m.AdminSubscriptionsModal }))
);
import { initialDefinitions, promptPresets } from "./data/initialData";
import { 
  SeoEntityDefinition, 
  GenerationSettings, 
  PromptPreset, 
  GenerationModel, 
  SemanticTriplet, 
  WikidataMatch,
  AuthSession,
  UserProfile 
} from "./types";
import { CheckCircle2, ShieldCheck, Zap, LogOut } from "lucide-react";

const STORAGE_KEY = "seo_semantic_definitions_v1";
const SETTINGS_KEY = "seo_semantic_settings_v1";
const AUTH_KEY = "semantico_auth_session";

export default function App() {
  // Firebase Auth & User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallAction, setPaywallAction] = useState<string>("esta ferramenta");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Legacy fallback session
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const local = localStorage.getItem(AUTH_KEY);
      if (local) return JSON.parse(local);
      const sess = sessionStorage.getItem(AUTH_KEY);
      if (sess) return JSON.parse(sess);
    } catch (e) {
      console.error("Erro ao carregar sessão:", e);
    }
    return null;
  });

  // Load initial definitions from localStorage or fallback to defaults
  const [definitions, setDefinitions] = useState<SeoEntityDefinition[]>(() => {

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar do localStorage:", e);
    }
    return initialDefinitions;
  });

  // Settings
  const [settings, setSettings] = useState<GenerationSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar settings:", e);
    }
    return {
      model: "gemini-3.7-flash",
      tone: "enciclopédico e autoritativo",
      length: "standard",
      language: "pt-BR",
      enableGrounding: true,
      customPromptTemplate: promptPresets[0].template,
    };
  });

  const [presets] = useState<PromptPreset[]>(promptPresets);
  const [activeView, setActiveView] = useState<"table" | "graph" | "linking" | "analysis" | "overview">("overview");

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSuggesterModalOpen, setIsSuggesterModalOpen] = useState(false);
  const [isWikidataModalOpen, setIsWikidataModalOpen] = useState(false);
  const [isTopicalAuditModalOpen, setIsTopicalAuditModalOpen] = useState(false);
  const [selectedEntityForDetail, setSelectedEntityForDetail] = useState<SeoEntityDefinition | null>(null);
  const [editingEntity, setEditingEntity] = useState<SeoEntityDefinition | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firebase Authentication & User Profile Listener
  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeUsersList: (() => void) | null = null;
    let unsubscribeDefs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      if (unsubscribeUsersList) {
        unsubscribeUsersList();
        unsubscribeUsersList = null;
      }
      if (unsubscribeDefs) {
        unsubscribeDefs();
        unsubscribeDefs = null;
      }

      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUserProfile(profile);

          // Escuta em tempo real (onSnapshot) no perfil do usuário no Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const updated = snap.data() as UserProfile;
              setUserProfile((prev) => {
                // Se estava pendente e o admin aprovou, notifica e fecha o paywall instantaneamente
                if (prev?.status === "pending" && updated.status === "active") {
                  showToast("🎉 Seu acesso foi liberado pelo Administrador! Ferramentas desbloqueadas.");
                  setIsPaywallOpen(false);
                }
                return updated;
              });

              // Se for admin, rastreia contagem de solicitações pendentes para exibir badge
              if (updated.role === "admin" && !unsubscribeUsersList) {
                const usersCol = collection(db, "users");
                unsubscribeUsersList = onSnapshot(usersCol, (usersSnap) => {
                  let count = 0;
                  usersSnap.forEach((uDoc) => {
                    const u = uDoc.data() as UserProfile;
                    if (u.status === "pending") count++;
                  });
                  setPendingCount(count);
                });
              }
            }
          });

          // Sincronização em tempo real das entidades do glossário do usuário com Cloud Firestore
          unsubscribeDefs = subscribeUserDefinitions(
            firebaseUser.uid,
            (cloudDefs) => {
              if (cloudDefs && cloudDefs.length > 0) {
                setDefinitions(cloudDefs);
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudDefs));
                } catch (e) {
                  console.warn("Falha ao salvar cache no localStorage:", e);
                }
              } else {
                // Se a nuvem estiver vazia para o usuário, migra o repositório local para o Firestore
                const localDefs = (() => {
                  try {
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) return JSON.parse(saved);
                  } catch {}
                  return initialDefinitions;
                })();
                if (localDefs && localDefs.length > 0) {
                  batchSaveUserDefinitions(firebaseUser.uid, localDefs).catch(console.error);
                }
              }
            },
            (err) => {
              console.warn("Usando repositório offline (localStorage):", err.message);
            }
          );
        } catch (err) {
          console.error("Erro ao sincronizar perfil com Firebase:", err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeUsersList) unsubscribeUsersList();
      if (unsubscribeDefs) unsubscribeDefs();
    };
  }, []);

  // Graceful Access Control (Paywall check)
  const checkSubscription = (actionName: string): boolean => {
    // Administradores e clientes com status 'active' possuem acesso pleno
    if (userProfile && (userProfile.role === "admin" || userProfile.status === "active")) {
      // Incrementa contador de uso de forma não-bloqueante
      incrementUserToolUsage(userProfile.uid).catch(console.error);
      return true;
    }

    // Se não estiver logado ou estiver pendente/bloqueado/expirado, abre o paywall com a ação informada
    setPaywallAction(actionName);
    setIsPaywallOpen(true);
    return false;
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(definitions));
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  }, [definitions]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Erro ao salvar settings:", e);
    }
  }, [settings]);

  const handleSaveSingleEntity = (entity: SeoEntityDefinition) => {
    setDefinitions((prev) => {
      const existsIndex = prev.findIndex((item) => item.id === entity.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = entity;
        return updated;
      }
      return [entity, ...prev];
    });
    if (userProfile?.uid) {
      saveUserEntity(userProfile.uid, entity).catch(console.error);
    }
    showToast(`Entidade "${entity.entity}" salva com sucesso!`);
  };

  const handleAddBatch = (newEntities: SeoEntityDefinition[]) => {
    setDefinitions((prev) => [...newEntities, ...prev]);
    if (userProfile?.uid) {
      batchSaveUserDefinitions(userProfile.uid, newEntities).catch(console.error);
    }
    showToast(`${newEntities.length} entidades geradas e adicionadas ao glossário!`);
  };

  const handleDeleteEntity = (id: string) => {
    setDefinitions((prev) => prev.filter((d) => d.id !== id));
    if (userProfile?.uid) {
      deleteUserEntity(userProfile.uid, id).catch(console.error);
    }
    showToast("Entidade excluída do repositório.", "info");
  };

  const handleApplyRelationship = (sourceId: string, triplet: SemanticTriplet) => {
    setDefinitions((prev) =>
      prev.map((item) => {
        if (item.id === sourceId) {
          const currentTriplets = item.semanticTriplets || [];
          const exists = currentTriplets.some(
            (t) => t.predicate === triplet.predicate && t.object === triplet.object
          );
          if (exists) return item;
          const updated = {
            ...item,
            semanticTriplets: [...currentTriplets, triplet],
          };
          if (userProfile?.uid) {
            saveUserEntity(userProfile.uid, updated).catch(console.error);
          }
          return updated;
        }
        return item;
      })
    );
    showToast("Conexão semântica adicionada ao Grafo!");
  };

  const handleBulkApplyRelationships = (relationships: { sourceId: string; triplet: SemanticTriplet }[]) => {
    setDefinitions((prev) => {
      const updated = [...prev];
      relationships.forEach(({ sourceId, triplet }) => {
        const index = updated.findIndex((d) => d.id === sourceId);
        if (index >= 0) {
          const current = updated[index].semanticTriplets || [];
          const exists = current.some(
            (t) => t.predicate === triplet.predicate && t.object === triplet.object
          );
          if (!exists) {
            updated[index] = {
              ...updated[index],
              semanticTriplets: [...current, triplet],
            };
          }
        }
      });
      if (userProfile?.uid) {
        batchSaveUserDefinitions(userProfile.uid, updated).catch(console.error);
      }
      return updated;
    });

    showToast(`${relationships.length} conexões semânticas aplicadas ao Knowledge Graph!`);
  };

  const handleApplyWikidataReconciliation = (entityId: string, match: WikidataMatch) => {
    setDefinitions((prev) =>
      prev.map((item) => {
        if (item.id === entityId) {
          const existingSameAs = item.sameAs || [];
          const newLinks = [match.wikidataUrl, match.wikipediaUrl, ...(match.sameAsUrls || [])].filter(Boolean) as string[];
          const combinedSameAs = Array.from(new Set([...existingSameAs, ...newLinks]));

          const updated = {
            ...item,
            wikidataId: match.wikidataId,
            wikidataUrl: match.wikidataUrl,
            wikipediaUrl: match.wikipediaUrl,
            wikidataDescription: match.description,
            sameAs: combinedSameAs,
          };
          if (userProfile?.uid) {
            saveUserEntity(userProfile.uid, updated).catch(console.error);
          }
          return updated;
        }
        return item;
      })
    );
    showToast("Entidade reconciliada com Wikidata e sameAs atualizados!");
  };

  const handleBulkApplyWikidata = (updates: { id: string; match: WikidataMatch }[]) => {
    setDefinitions((prev) => {
      const updated = [...prev];
      updates.forEach(({ id, match }) => {
        const index = updated.findIndex((d) => d.id === id);
        if (index >= 0) {
          const existing = updated[index];
          const existingSameAs = existing.sameAs || [];
          const newLinks = [match.wikidataUrl, match.wikipediaUrl, ...(match.sameAsUrls || [])].filter(Boolean) as string[];
          const combinedSameAs = Array.from(new Set([...existingSameAs, ...newLinks]));

          updated[index] = {
            ...existing,
            wikidataId: match.wikidataId,
            wikidataUrl: match.wikidataUrl,
            wikipediaUrl: match.wikipediaUrl,
            wikidataDescription: match.description,
            sameAs: combinedSameAs,
          };
        }
      });
      if (userProfile?.uid) {
        batchSaveUserDefinitions(userProfile.uid, updated).catch(console.error);
      }
      return updated;
    });
    showToast(`${updates.length} entidades reconciliadas com Wikidata em lote!`);
  };

  const handleUpdateEntity = (updatedEntity: SeoEntityDefinition) => {
    setDefinitions((prev) =>
      prev.map((item) => (item.id === updatedEntity.id ? updatedEntity : item))
    );
    if (selectedEntityForDetail && selectedEntityForDetail.id === updatedEntity.id) {
      setSelectedEntityForDetail(updatedEntity);
    }
    if (userProfile?.uid) {
      saveUserEntity(userProfile.uid, updatedEntity).catch(console.error);
    }
    showToast("Entidade atualizada com sucesso!");
  };

  const handleClearWikidataReconciliation = (entityId: string) => {
    setDefinitions((prev) =>
      prev.map((item) => {
        if (item.id === entityId) {
          const updated = {
            ...item,
            wikidataId: undefined,
            wikidataUrl: undefined,
            wikipediaUrl: undefined,
            wikidataDescription: undefined,
            sameAs: [],
          };
          if (userProfile?.uid) {
            saveUserEntity(userProfile.uid, updated).catch(console.error);
          }
          return updated;
        }
        return item;
      })
    );
    if (selectedEntityForDetail && selectedEntityForDetail.id === entityId) {
      setSelectedEntityForDetail((prev) =>
        prev
          ? {
              ...prev,
              wikidataId: undefined,
              wikidataUrl: undefined,
              wikipediaUrl: undefined,
              wikidataDescription: undefined,
              sameAs: [],
            }
          : null
      );
    }
    showToast("Vínculo Wikidata e URLs sameAs removidos.");
  };

  const handleRegenerateEntity = async (id: string) => {
    if (!checkSubscription("Regenerar Entidade")) return;

    const item = definitions.find((d) => d.id === id);
    if (!item) return;

    setDefinitions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "generating" } : d))
    );

    try {
      const response = await fetch("/api/seo-definitions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: item.entity,
          category: item.category,
          model: settings.model,
          tone: settings.tone,
          length: settings.length,
          language: settings.language,
          enableGrounding: settings.enableGrounding,
          customPromptTemplate: settings.customPromptTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na regeneração");
      }

      const data = await response.json();

      const updatedEntity: SeoEntityDefinition = {
        ...item,
        definition: data.definition || data.expandedDefinition || data.shortDefinition || item.definition,
        shortSummary: data.shortSummary || data.shortDefinition || item.shortSummary,
        sources: data.sources || item.sources || [],
        sourcesString: data.sourcesString || item.sourcesString,
        lsiKeywords: data.lsiKeywords || data.synonyms || item.lsiKeywords || [],
        schemaType: data.schemaType || item.schemaType,
        sameAs: data.sameAs || data.sameAsLinks || item.sameAs || [],
        semanticTriplets: data.semanticTriplets || item.semanticTriplets || [],
        wikidataId: data.wikidataId || item.wikidataId,
        wikidataUrl: data.wikidataUrl || item.wikidataUrl,
        wikipediaUrl: data.wikipediaUrl || item.wikipediaUrl,
        wikidataDescription: data.wikidataDescription || item.wikidataDescription,
        status: "completed",
      };

      setDefinitions((prev) =>
        prev.map((d) => (d.id === id ? updatedEntity : d))
      );

      if (userProfile?.uid) {
        saveUserEntity(userProfile.uid, updatedEntity).catch(console.error);
      }

      showToast(`Entidade "${item.entity}" regenerada com sucesso!`);
    } catch (e) {
      console.error(e);
      setDefinitions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "completed" } : d))
      );
      showToast("Falha na regeneração da entidade", "info");
    }
  };

  const handleOpenSingleNew = () => {
    if (!checkSubscription("Criar Nova Entidade")) return;
    setEditingEntity(null);
    setIsSingleModalOpen(true);
  };

  const handleOpenBatch = () => {
    if (!checkSubscription("Geração em Lote com IA")) return;
    setIsBatchModalOpen(true);
  };

  const handleOpenPrompt = () => {
    if (!checkSubscription("Ajustes de Prompts e IA")) return;
    setIsPromptModalOpen(true);
  };

  const handleOpenExport = () => {
    if (!checkSubscription("Exportação de Arquivos")) return;
    setIsExportModalOpen(true);
  };

  const handleOpenRelationshipSuggester = () => {
    if (!checkSubscription("Sugerir Conexões no Grafo")) return;
    setIsSuggesterModalOpen(true);
  };

  const handleOpenWikidata = () => {
    if (!checkSubscription("Reconciliação com Wikidata")) return;
    setIsWikidataModalOpen(true);
  };

  const handleOpenTopicalAudit = () => {
    if (!checkSubscription("Auditoria Tópica & Arestas")) return;
    setIsTopicalAuditModalOpen(true);
  };

  const handleEditEntity = (entity: SeoEntityDefinition) => {
    if (!checkSubscription("Editar Entidade")) return;
    setEditingEntity(entity);
    setIsSingleModalOpen(true);
  };

  const handleDeleteEntityWithAuth = (id: string) => {
    if (!checkSubscription("Excluir Entidade")) return;
    handleDeleteEntity(id);
  };

  const handleRegenerateEntityWithAuth = (id: string) => {
    if (!checkSubscription("Regenerar Entidade com IA")) return;
    handleRegenerateEntity(id);
  };

  const handleUpdateEntityWithAuth = (updated: SeoEntityDefinition) => {
    if (!checkSubscription("Atualizar Entidade")) return;
    handleUpdateEntity(updated);
  };

  const handleClearWikidataWithAuth = (entityId: string) => {
    if (!checkSubscription("Desvincular Wikidata")) return;
    handleClearWikidataReconciliation(entityId);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error(e);
    }
    setUserProfile(null);
    setAuthSession(null);
    showToast("Sessão encerrada com sucesso.", "info");
  };

  const totalCategories = new Set(definitions.map((d) => d.category).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-graph-grid text-slate-800 font-sans flex flex-col selection:bg-[#f5be38] selection:text-slate-950">
      
      {/* Top Two-Tier Navbar */}
      <Navbar
        totalEntities={definitions.length}
        totalCategories={totalCategories}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedModel={settings.model}
        setSelectedModel={(model: GenerationModel) =>
          setSettings((prev) => ({ ...prev, model }))
        }
        onOpenSingleModal={handleOpenSingleNew}
        onOpenBatchModal={handleOpenBatch}
        onOpenPromptModal={handleOpenPrompt}
        onOpenExportModal={handleOpenExport}
        onOpenRelationshipSuggester={handleOpenRelationshipSuggester}
        onOpenWikidataModal={handleOpenWikidata}
        onOpenTopicalAudit={handleOpenTopicalAudit}
        authSession={authSession}
        userProfile={userProfile}
        onLogout={handleLogout}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAuthModal={() => {
          setAuthModalMode("login");
          setIsAuthModalOpen(true);
        }}
        pendingCount={pendingCount}
        onScrollToSection={(sectionId) => {
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
        }}
      />

      {/* Main Container Content */}
      <main className="flex-1 w-full mx-auto">
        
        {/* Dynamic Views */}
        {activeView === "overview" && (
          <GraphStudioHero
            onStartTesting={() => setActiveView("table")}
            onOpenBatchModal={handleOpenBatch}
            onOpenSingleModal={handleOpenSingleNew}
          />
        )}

        {activeView === "table" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DefinitionsTable
              definitions={definitions}
              onSelectEntity={(entity) => setSelectedEntityForDetail(entity)}
              onEditEntity={handleEditEntity}
              onDeleteEntity={handleDeleteEntityWithAuth}
              onRegenerateEntity={handleRegenerateEntityWithAuth}
              onOpenBatchModal={handleOpenBatch}
              onOpenSingleModal={handleOpenSingleNew}
              onOpenTopicalAudit={handleOpenTopicalAudit}
              onOpenWikidataModal={handleOpenWikidata}
              onOpenPromptModal={handleOpenPrompt}
            />
          </div>
        )}

        {activeView === "graph" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Carregando Grafo de Conhecimento e Topologia...</span>
              </div>
            }>
              <KnowledgeGraphView
                definitions={definitions}
                onSelectEntity={(entity) => setSelectedEntityForDetail(entity)}
                onOpenRelationshipSuggester={handleOpenRelationshipSuggester}
              />
            </Suspense>
          </div>
        )}

        {activeView === "linking" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Carregando Arquitetura de Links Internos...</span>
              </div>
            }>
              <InternalLinkingView
                definitions={definitions}
                onSelectEntity={(entity) => setSelectedEntityForDetail(entity)}
                onOpenSingleModalWithTerm={(term, category) => {
                  if (!checkSubscription("Criar Entidade a partir de Menção")) return;
                  setEditingEntity({
                    id: `ent-${Date.now()}`,
                    entity: term,
                    category: category || "Geral",
                    definition: "",
                    shortSummary: "",
                    sources: [],
                    sourcesString: "",
                    lsiKeywords: [],
                    schemaType: "DefinedTerm",
                    status: "idle",
                    createdAt: new Date().toISOString(),
                  });
                  setIsSingleModalOpen(true);
                }}
              />
            </Suspense>
          </div>
        )}

        {activeView === "analysis" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Carregando Ideias e Possibilidades...</span>
              </div>
            }>
              <IdeasAndPossibilitiesView />
            </Suspense>
          </div>
        )}

      </main>

      {/* Editorial System Footer */}
      <Footer
        onOpenSingleModal={handleOpenSingleNew}
        onScrollToSection={(sectionId) => {
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
        }}
      />


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* On-demand Modals with React Suspense code-splitting */}
      <Suspense fallback={null}>
        {isSingleModalOpen && (
          <SingleGeneratorModal
            isOpen={isSingleModalOpen}
            onClose={() => {
              setIsSingleModalOpen(false);
              setEditingEntity(null);
            }}
            onSave={handleSaveSingleEntity}
            editingEntity={editingEntity}
            settings={settings}
            presets={presets}
          />
        )}

        {isBatchModalOpen && (
          <BatchGeneratorModal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onAddBatch={handleAddBatch}
            settings={settings}
            presets={presets}
          />
        )}

        {selectedEntityForDetail && (
          <EntityDetailModal
            entity={selectedEntityForDetail}
            isOpen={!!selectedEntityForDetail}
            onClose={() => setSelectedEntityForDetail(null)}
            onEdit={handleEditEntity}
            onRegenerate={handleRegenerateEntityWithAuth}
            onOpenWikidataReconcile={(ent) => {
              if (!checkSubscription("Reconciliação Wikidata")) return;
              setSelectedEntityForDetail(ent);
              setIsWikidataModalOpen(true);
            }}
            onUpdateEntity={handleUpdateEntityWithAuth}
            onClearReconciliation={handleClearWikidataWithAuth}
          />
        )}

        {isPromptModalOpen && (
          <PromptManagerModal
            isOpen={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            settings={settings}
            onSaveSettings={(newSettings) => {
              setSettings(newSettings);
              showToast("Configurações de prompt e modelo atualizadas!");
            }}
            presets={presets}
          />
        )}

        {isExportModalOpen && (
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            definitions={definitions}
          />
        )}

        {isSuggesterModalOpen && (
          <RelationshipSuggesterModal
            isOpen={isSuggesterModalOpen}
            onClose={() => setIsSuggesterModalOpen(false)}
            definitions={definitions}
            selectedModel={settings.model}
            onApplyRelationship={(sourceId, triplet) => {
              if (!checkSubscription("Conectar Entidades")) return;
              handleApplyRelationship(sourceId, triplet);
            }}
            onBulkApplyRelationships={(rels) => {
              if (!checkSubscription("Conectar Entidades em Massa")) return;
              handleBulkApplyRelationships(rels);
            }}
          />
        )}

        {isWikidataModalOpen && (
          <WikidataReconcileModal
            isOpen={isWikidataModalOpen}
            onClose={() => setIsWikidataModalOpen(false)}
            entity={selectedEntityForDetail || (definitions.length > 0 ? definitions[0] : null)}
            allEntities={definitions}
            onApplyReconciliation={(entityId, match) => {
              if (!checkSubscription("Reconciliação Wikidata")) return;
              handleApplyWikidataReconciliation(entityId, match);
            }}
            onBulkApplyReconciliation={(matches) => {
              if (!checkSubscription("Reconciliação em Lote")) return;
              handleBulkApplyWikidata(matches);
            }}
          />
        )}

        {isTopicalAuditModalOpen && (
          <TopicalAuditModal
            isOpen={isTopicalAuditModalOpen}
            onClose={() => setIsTopicalAuditModalOpen(false)}
            definitions={definitions}
            selectedModel={settings.model}
            onAddEntity={(newEntity) => {
              if (!checkSubscription("Adicionar Entidade")) return;
              handleSaveSingleEntity(newEntity);
              showToast(`Entidade "${newEntity.entity}" incorporada ao glossário.`);
            }}
            onAddTriplet={(sourceId, triplet) => {
              if (!checkSubscription("Conectar Aresta Ontológica")) return;
              handleApplyRelationship(sourceId, triplet);
              showToast(`Aresta ontológica [${triplet.predicate}] adicionada ao grafo.`);
            }}
            onOpenBatchWithTerms={() => {
              setIsTopicalAuditModalOpen(false);
              setIsBatchModalOpen(true);
            }}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authModalMode}
            onSuccess={(profile) => {
              setUserProfile(profile);
              showToast(`Bem-vindo, ${profile.displayName || profile.email}!`);
              if (profile.status === "active" || profile.role === "admin") {
                setIsPaywallOpen(false);
              }
            }}
          />
        )}

        {isPaywallOpen && (
          <SubscriptionPaywallModal
            isOpen={isPaywallOpen}
            onClose={() => setIsPaywallOpen(false)}
            user={userProfile}
            actionAttempted={paywallAction}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || "login");
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {userProfile && userProfile.role === "admin" && isAdminPanelOpen && (
          <AdminSubscriptionsModal
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            currentUser={userProfile}
          />
        )}
      </Suspense>

    </div>
  );
}
