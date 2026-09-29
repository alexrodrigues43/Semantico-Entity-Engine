/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { 
  auth, 
  db, 
  syncUserProfile, 
  logoutUser, 
  incrementUserToolUsage 
} from "./lib/firebase";
import { Navbar } from "./components/Navbar";
import { DefinitionsTable } from "./components/DefinitionsTable";
import { SingleGeneratorModal } from "./components/SingleGeneratorModal";
import { BatchGeneratorModal } from "./components/BatchGeneratorModal";
import { EntityDetailModal } from "./components/EntityDetailModal";
import { PromptManagerModal } from "./components/PromptManagerModal";
import { ExportModal } from "./components/ExportModal";
import { KnowledgeGraphView } from "./components/KnowledgeGraphView";
import { InternalLinkingView } from "./components/InternalLinkingView";
import { IdeasAndPossibilitiesView } from "./components/IdeasAndPossibilitiesView";
import { RelationshipSuggesterModal } from "./components/RelationshipSuggesterModal";
import { WikidataReconcileModal } from "./components/WikidataReconcileModal";
import { TopicalAuditModal } from "./components/TopicalAuditModal";
import { AuthModal } from "./components/AuthModal";
import { SubscriptionPaywallModal } from "./components/SubscriptionPaywallModal";
import { AdminSubscriptionsModal } from "./components/AdminSubscriptionsModal";
import { GraphStudioHero } from "./components/GraphStudioHero";
import { Footer } from "./components/Footer";
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

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      if (unsubscribeUsersList) {
        unsubscribeUsersList();
        unsubscribeUsersList = null;
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
    showToast(`Entidade "${entity.entity}" salva com sucesso!`);
  };

  const handleAddBatch = (newEntities: SeoEntityDefinition[]) => {
    setDefinitions((prev) => [...newEntities, ...prev]);
    showToast(`${newEntities.length} entidades geradas e adicionadas ao glossário!`);
  };

  const handleDeleteEntity = (id: string) => {
    setDefinitions((prev) => prev.filter((d) => d.id !== id));
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
          return {
            ...item,
            semanticTriplets: [...currentTriplets, triplet],
          };
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

          return {
            ...item,
            wikidataId: match.wikidataId,
            wikidataUrl: match.wikidataUrl,
            wikipediaUrl: match.wikipediaUrl,
            wikidataDescription: match.description,
            sameAs: combinedSameAs,
          };
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
    showToast("Entidade atualizada com sucesso!");
  };

  const handleClearWikidataReconciliation = (entityId: string) => {
    setDefinitions((prev) =>
      prev.map((item) => {
        if (item.id === entityId) {
          return {
            ...item,
            wikidataId: undefined,
            wikidataUrl: undefined,
            wikipediaUrl: undefined,
            wikidataDescription: undefined,
            sameAs: [],
          };
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
      setDefinitions((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                definition: data.definition || data.expandedDefinition || data.shortDefinition || d.definition,
                shortSummary: data.shortSummary || data.shortDefinition || d.shortSummary,
                sources: data.sources || d.sources || [],
                sourcesString: data.sourcesString || d.sourcesString,
                lsiKeywords: data.lsiKeywords || data.synonyms || d.lsiKeywords || [],
                schemaType: data.schemaType || d.schemaType,
                sameAs: data.sameAs || data.sameAsLinks || d.sameAs || [],
                semanticTriplets: data.semanticTriplets || d.semanticTriplets || [],
                wikidataId: data.wikidataId || d.wikidataId,
                wikidataUrl: data.wikidataUrl || d.wikidataUrl,
                wikipediaUrl: data.wikipediaUrl || d.wikipediaUrl,
                wikidataDescription: data.wikidataDescription || d.wikidataDescription,
                status: "completed",
              }
            : d
        )
      );
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
            <KnowledgeGraphView
              definitions={definitions}
              onSelectEntity={(entity) => setSelectedEntityForDetail(entity)}
              onOpenRelationshipSuggester={handleOpenRelationshipSuggester}
            />
          </div>
        )}

        {activeView === "linking" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          </div>
        )}

        {activeView === "analysis" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <IdeasAndPossibilitiesView />
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

      {/* Modals */}
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

      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onAddBatch={handleAddBatch}
        settings={settings}
        presets={presets}
      />

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

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        definitions={definitions}
      />

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

      {/* Auth Modal (Login / Register / 1-Click Google) */}
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

      {/* Subscription Paywall & Graceful Blocking Modal */}
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

      {/* Admin Subscriptions & Access Management Panel (Super Admin only) */}
      {userProfile && userProfile.role === "admin" && (
        <AdminSubscriptionsModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          currentUser={userProfile}
        />
      )}

    </div>
  );
}
