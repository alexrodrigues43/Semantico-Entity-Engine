# 🔐 Guia Definitivo: Sistema de Autenticação, Perfis e Controle RBAC no Google AI Studio

Este documento contém a especificação técnica completa, regras, estruturas de dados, fluxos de código e instruções detalhadas para que o **Google AI Studio** (ou qualquer agente/desenvolvedor) consiga **emular de forma idêntica** a arquitetura de autenticação, cadastro e gestão de usuários implementada nesta aplicação.

---

## 📌 1. Visão Geral da Arquitetura

O sistema adota uma arquitetura híbrida de **Firebase Authentication + Cloud Firestore** com padrão **RBAC (Role-Based Access Control)** e aprovação manual/automática:

1. **Métodos de Entrada:**
   - **Google 1-Click Login:** `signInWithPopup(auth, googleProvider)` com seleção de conta forçada (`prompt: "select_account"`).
   - **E-mail e Senha Tradicional:** `signInWithEmailAndPassword` e `createUserWithEmailAndPassword` + atualização de `displayName`.
2. **Sincronização Automática com Firestore (`users/{uid}`):**
   - Ao logar ou cadastrar, a função central `syncUserProfile(user)` verifica se o documento do usuário já existe no Firestore.
   - Se for o **Super Administrador Master** (`alexrodrigues43@gmail.com`), o sistema concede imediatamente privilégios `role: "admin"`, `status: "active"`, `plan: "lifetime"`.
   - Se for um novo usuário comum, ele é criado como `role: "client"`, `status: "pending"`, `plan: "trial"`.
3. **Escuta Reativa em Tempo Real (`onSnapshot`):**
   - O aplicativo escuta em tempo real o documento do usuário logado. Quando o Admin altera o status de `pending` para `active`, a tela de bloqueio (Paywall) fecha instantaneamente e notifica o usuário via toast: *"🎉 Seu acesso foi liberado pelo Administrador!"*.
4. **Regras de Segurança Estritas no Firestore (`firestore.rules`):**
   - Usuários comuns **não conseguem** alterar seus próprios campos críticos (`role`, `status`, `plan`, `notes`).
   - Somente o Super Admin consegue listar todos os usuários ou promover/bloquear acessos.

---

## 📁 2. Mapeamento dos Arquivos Nesta Aplicação

Se você estiver em outra sessão do Google AI Studio ou quiser que o assistente analise esta aplicação, forneça estes arquivos de referência:

| Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `src/types.ts` | Interfaces TypeScript (`UserProfile`, `UserRole`, `UserStatus`, `UserPlan`, etc.) |
| `src/lib/firebase.ts` | Inicialização do Firebase Auth & Firestore, `syncUserProfile`, `loginWithGoogle`, `loginWithEmail`, `registerWithEmail`, helpers de admin |
| `src/components/AuthModal.tsx` | Modal com abas "Fazer Login" / "Criar Conta", botão do Google 1-Click, inputs de e-mail/senha com visualização |
| `src/App.tsx` | Listener global `onAuthStateChanged`, subscrição `onSnapshot` do perfil, badge de pendências do admin e gates de permissão |
| `src/components/UserManagementModal.tsx` | Painel de controle do Admin para aprovar clientes pendentes, mudar planos e bloquear contas |
| `src/components/SubscriptionPaywallModal.tsx` | Tela de bloqueio inteligente exibida para usuários não logados ou com status `pending` |
| `firestore.rules` | Regras de segurança no banco de dados para impedir escalonamento indevido de privilégios |
| `firebase-blueprint.json` | Esquema de dados formal aceito pelas skills de Firebase do AI Studio |

---

## 🧱 3. Modelo de Dados (TypeScript Interfaces)

Coloque em seu arquivo `src/types.ts`:

```typescript
export type UserRole = "admin" | "client";
export type UserStatus = "active" | "pending" | "blocked" | "expired";
export type UserPlan = "trial" | "monthly" | "annual" | "lifetime";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  createdAt: string;     // ISO String
  lastLoginAt?: string;   // ISO String
  notes?: string;         // Anotações internas do admin (ex: data do PIX, empresa, telefone)
  toolUsageCount: number; // Contador de execuções de ferramentas
}
```

---

## ⚙️ 4. Configuração Central do Firebase (`src/lib/firebase.ts`)

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  increment,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile } from "../types";

// E-MAIL DEFINIDO COMO SUPER ADMINISTRADOR MASTER
export const SUPER_ADMIN_EMAIL = "alexrodrigues43@gmail.com";

// Inicialização segura compatível com HMR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Provider do Google com seleção de conta forçada
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Sincroniza ou provisiona o documento do usuário em `users/{uid}`
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const isSuperAdmin = isSuperAdminEmail(user.email);

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || undefined,
      role: isSuperAdmin ? "admin" : "client",
      status: isSuperAdmin ? "active" : "pending",
      plan: isSuperAdmin ? "lifetime" : "trial",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      notes: isSuperAdmin ? "Super Administrador Master Automático" : "",
      toolUsageCount: 0,
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      lastLoginAt: new Date().toISOString(),
      displayName: user.displayName || existing.displayName || user.email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || existing.photoURL,
    };

    // Garante que o Super Admin nunca fique como client ou pending
    if (isSuperAdmin && (existing.role !== "admin" || existing.status !== "active")) {
      updates.role = "admin";
      updates.status = "active";
      updates.plan = "lifetime";
    }

    await updateDoc(userRef, updates);
    return { ...existing, ...updates };
  }
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return await syncUserProfile(result.user);
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name.trim()) {
    try {
      await updateProfile(result.user, { displayName: name.trim() });
    } catch (e) {
      console.warn("Could not update auth display name:", e);
    }
  }
  return await syncUserProfile(result.user);
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function incrementUserToolUsage(uid: string): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      toolUsageCount: increment(1),
    });
  } catch (err) {
    console.warn("Could not increment toolUsageCount:", err);
  }
}

export async function adminUpdateUser(
  uid: string, 
  updates: Partial<Pick<UserProfile, "status" | "plan" | "role" | "notes">>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
}

export async function adminDeleteUser(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}
```

---

## 🔄 5. Ciclo de Vida Reativo no `App.tsx`

No componente raiz (`src/App.tsx`), gerencie o estado global do usuário:

```tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { auth, db, syncUserProfile } from "./lib/firebase";
import { UserProfile } from "./types";

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeUsersList: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpa listeners anteriores
      if (unsubscribeDoc) { unsubscribeDoc(); unsubscribeDoc = null; }
      if (unsubscribeUsersList) { unsubscribeUsersList(); unsubscribeUsersList = null; }

      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUserProfile(profile);

          // Escuta reativa do documento do próprio usuário em tempo real
          const userDocRef = doc(db, "users", firebaseUser.uid);
          unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const updated = snap.data() as UserProfile;
              setUserProfile((prev) => {
                // Notificação e liberação automática caso o admin aprove o usuário
                if (prev?.status === "pending" && updated.status === "active") {
                  alert("🎉 Seu acesso foi liberado pelo Administrador!");
                  setIsPaywallOpen(false);
                }
                return updated;
              });

              // Se o usuário logado for Admin, escuta a contagem de clientes pendentes
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
          console.error("Erro ao sincronizar perfil:", err);
        }
      } else {
        setUserProfile(null);
        setPendingCount(0);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeUsersList) unsubscribeUsersList();
    };
  }, []);

  // Exemplo de verificação de permissão para executar ferramentas:
  const canUseTools = userProfile && userProfile.status === "active";

  return (
    <div>
      {/* Se canUseTools for false ao clicar em uma ação premium, abre o AuthModal ou Paywall */}
    </div>
  );
}
```

---

## 🛡️ 6. Regras de Segurança no Firestore (`firestore.rules`)

Essas regras devem ser colocadas em `firestore.rules` e implantadas via tool `deploy_firebase`:

```javascript
rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && (
        (request.auth.token.email != null && request.auth.token.email.lower() == "alexrodrigues43@gmail.com") ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin")
      );
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      // O usuário pode ler o próprio perfil; Super Admin pode ler todos
      allow get: if isOwner(userId) || isSuperAdmin();
      
      // Apenas o Super Admin pode listar toda a coleção de usuários
      allow list: if isSuperAdmin();
      
      // Criação de perfil:
      // Se for o Super Admin email, cria com admin e active.
      // Usuário comum só pode criar o documento correspondente ao seu próprio UID com role "client" e status "pending".
      allow create: if isAuthenticated() && isOwner(userId) && (
        (request.auth.token.email != null && request.auth.token.email.lower() == "alexrodrigues43@gmail.com") ||
        (
          request.resource.data.role == "client" &&
          request.resource.data.status == "pending" &&
          request.resource.data.uid == request.auth.uid
        )
      );
      
      // Edição:
      // Super admin pode atualizar qualquer campo.
      // Usuário comum só pode atualizar campos inofensivos (ex: toolUsageCount, displayName, lastLoginAt),
      // NUNCA alterando "role", "status", "plan" ou "notes".
      allow update: if isSuperAdmin() || (
        isOwner(userId) &&
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(["role", "status", "plan", "notes"])
      );
      
      // Exclusão: Apenas o Super Admin
      allow delete: if isSuperAdmin();
    }
  }
}
```

---

## 📋 7. Blueprint Formal (`firebase-blueprint.json`)

Para que o assistente do AI Studio reconheça a entidade e configure os índices corretamente:

```json
{
  "$schema": "https://firebase.google.com/docs/firestore/blueprint/v1",
  "entities": {
    "User": {
      "collection": "users",
      "fields": {
        "uid": { "type": "string", "description": "Unique user ID matching Firebase Auth UID" },
        "email": { "type": "string", "description": "User email address" },
        "displayName": { "type": "string", "description": "User full name or company" },
        "photoURL": { "type": "string", "description": "User avatar URL" },
        "role": { "type": "string", "description": "'admin' or 'client'" },
        "status": { "type": "string", "description": "'active', 'pending', 'blocked', or 'expired'" },
        "plan": { "type": "string", "description": "'trial', 'monthly', 'annual', or 'lifetime'" },
        "createdAt": { "type": "string", "description": "Creation ISO date" },
        "lastLoginAt": { "type": "string", "description": "Last login ISO date" },
        "notes": { "type": "string", "description": "Internal admin notes, e.g. PIX date, invoice or contact" },
        "toolUsageCount": { "type": "number", "description": "Count of AI tool and generation executions" }
      }
    }
  }
}
```

---

## 💡 8. Como instruir o Google AI Studio na outra aplicação

Basta copiar e colar o prompt abaixo no chat da sua nova aplicação no AI Studio:

> *"Leia o arquivo `REPLICACAO_AUTENTICACAO_FIREBASE.md` (ou siga a especificação técnica nele descrita) para implementar o sistema de autenticação completo usando Firebase Auth e Cloud Firestore. Garanta:
> 1. Suporte a Google 1-Click (`signInWithPopup`) e E-mail/Senha (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
> 2. Documento do perfil salvo em `users/{uid}` sincronizado com `syncUserProfile()`.
> 3. Super Admin automático para o e-mail `alexrodrigues43@gmail.com` com `role: 'admin'`, `status: 'active'`, `plan: 'lifetime'`.
> 4. Usuários normais registrados iniciam com `status: 'pending'` e `role: 'client'`.
> 5. Escuta reativa via `onSnapshot` no Firestore para desbloqueio instantâneo quando o admin aprovar.
> 6. Regras de segurança em `firestore.rules` impedindo que usuários alterem suas próprias roles e status."*
