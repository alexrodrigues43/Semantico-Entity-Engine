import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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
  query, 
  orderBy, 
  increment,
  deleteDoc,
  writeBatch,
  getDocs
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile, UserRole, UserStatus, UserPlan, SeoEntityDefinition } from "../types";

export const SUPER_ADMIN_EMAIL = "alexrodrigues43@gmail.com";

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (using custom firestoreDatabaseId if provided in config for local entities)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Central Database for the Suite (Single Source of Truth for Credits, Users and Transactions)
export const centralDb = getFirestore(app, "semantico-suite-core");

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/**
 * Checks if a given email belongs to the Super Admin
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Sanitiza recursivamente objetos removendo campos undefined para compatibilidade com o Firestore
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

/**
 * Creates or retrieves user profile from Central Firestore (semantico-suite-core),
 * guaranteeing Super Admin privileges for alexrodrigues43@gmail.com and trial credits for new clients.
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(centralDb, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const isSuperAdmin = isSuperAdminEmail(user.email);
  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    // New user document in Central Suite
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || "",
      role: isSuperAdmin ? "admin" : "client",
      status: "active",
      plan: isSuperAdmin ? "lifetime" : "trial",
      creditsBalance: isSuperAdmin ? 999999 : 10,
      creditsUsed: 0,
      createdAt: now,
      lastLoginAt: now,
      lastAppUsed: "Glossário de Entidades",
      notes: isSuperAdmin ? "Super Administrador Master Automático" : "Trial inicial da Suíte",
      toolUsageCount: 0,
    };

    await setDoc(userRef, sanitizeForFirestore(newProfile));

    // Registra transação inicial de degustação
    if (!isSuperAdmin) {
      try {
        const txRef = doc(collection(centralDb, "credit_transactions"));
        await setDoc(txRef, {
          id: txRef.id,
          uid: user.uid,
          userEmail: user.email || "",
          type: "trial",
          app: "Glossário de Entidades",
          amount: 10,
          balanceAfter: 10,
          description: "Bônus de degustação da Suíte Semântico (10 créditos)",
          timestamp: now,
        });
      } catch (txErr) {
        console.warn("[Carteira] Falha ao gravar transação de trial:", txErr);
      }
    }

    return newProfile;
  } else {
    // Existing user: update last login and ensure super admin if email matches
    const existing = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      lastLoginAt: now,
      lastAppUsed: "Glossário de Entidades",
      displayName: user.displayName || existing.displayName || user.email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || existing.photoURL || "",
    };

    // If super admin email, enforce role, status and unlimited credits
    if (isSuperAdmin) {
      updates.role = "admin";
      updates.status = "active";
      updates.plan = "lifetime";
      updates.creditsBalance = 999999;
    }

    await updateDoc(userRef, sanitizeForFirestore(updates));
    return { ...existing, ...updates };
  }
}

/**
 * Escuta em tempo real o saldo da carteira central no semantico-suite-core
 */
export function subscribeCentralWallet(
  uid: string,
  onUpdate: (profile: UserProfile) => void
): () => void {
  const userRef = doc(centralDb, "users", uid);
  return onSnapshot(
    userRef, 
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      }
    },
    (err) => {
      console.warn("[Carteira Central] Erro ao sincronizar carteira:", err);
    }
  );
}

/**
 * Debita créditos atomicamente na base central semantico-suite-core e registra no extrato
 */
export async function deductCredits(
  uid: string,
  amount: number,
  actionDescription: string,
  userEmail: string
): Promise<boolean> {
  const isSuperAdmin = isSuperAdminEmail(userEmail);
  if (isSuperAdmin) return true; // Super Admin possui créditos infinitos

  const userRef = doc(centralDb, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;

  const currentData = snap.data() as UserProfile;
  const currentBalance = currentData.creditsBalance ?? 0;
  if (currentBalance < amount) {
    return false; // Saldo insuficiente
  }

  const now = new Date().toISOString();
  await updateDoc(userRef, {
    creditsBalance: increment(-amount),
    creditsUsed: increment(amount),
    lastAppUsed: "Glossário de Entidades",
    lastLoginAt: now,
  });

  // Registra no extrato de transações
  try {
    const txRef = doc(collection(centralDb, "credit_transactions"));
    await setDoc(txRef, {
      id: txRef.id,
      uid,
      userEmail,
      type: "usage",
      app: "Glossário de Entidades",
      amount: -amount,
      balanceAfter: currentBalance - amount,
      description: actionDescription,
      timestamp: now,
    });
  } catch (err) {
    console.warn("[Carteira] Falha ao registrar transação no extrato:", err);
  }

  return true;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

/**
 * Sign in with Google Redirect (full-page fallback para navegadores com restrições rígidas de popup)
 */
export async function loginWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

export { getRedirectResult };

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return await syncUserProfile(result.user);
}

/**
 * Register with Email, Password and Name
 */
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

/**
 * Logout
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}
export const logoutUser = logoutFirebase;

/**
 * Increment tool execution count for user
 */
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

/**
 * Update user UI Language preference in centralDb
 */
export async function updateUserUiLang(uid: string, uiLang: string): Promise<void> {
  try {
    const userRef = doc(centralDb, "users", uid);
    await updateDoc(userRef, { uiLang });
  } catch (err) {
    console.warn("Could not update user uiLang in centralDb:", err);
  }
}

/**
 * Admin: Update user status or plan or notes
 */
export async function adminUpdateUser(
  uid: string, 
  updates: Partial<Pick<UserProfile, "status" | "plan" | "role" | "notes">>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
}

/**
 * Admin: Delete user profile
 */
export async function adminDeleteUser(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}

/**
 * Obtains authentication headers for secure backend API communication
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        return headers;
      }
    }

    // Fallback: Check if there is a passcode session stored
    const sessStr =
      localStorage.getItem("semantico_auth_session") ||
      sessionStorage.getItem("semantico_auth_session");
    if (sessStr) {
      const sess = JSON.parse(sessStr);
      if (sess?.passcodeUsed) {
        headers["Authorization"] = `Bearer passcode:${sess.passcodeUsed}`;
        headers["x-passcode"] = sess.passcodeUsed;
      }
    }
  } catch (err) {
    console.warn("[Auth] Não foi possível obter o token de autorização:", err);
  }

  return headers;
}

/**
 * Salva ou atualiza uma entidade individual no Firestore em /users/{userId}/definitions/{entityId}
 */
export async function saveUserEntity(userId: string, entity: SeoEntityDefinition): Promise<void> {
  const defRef = doc(db, "users", userId, "definitions", entity.id);
  await setDoc(defRef, sanitizeForFirestore(entity), { merge: true });
}

/**
 * Salva múltiplas entidades no Firestore em lotes atômicos de até 400 documentos
 */
export async function batchSaveUserDefinitions(
  userId: string,
  entities: SeoEntityDefinition[]
): Promise<void> {
  if (!entities || entities.length === 0) return;
  const chunks: SeoEntityDefinition[][] = [];
  for (let i = 0; i < entities.length; i += 400) {
    chunks.push(entities.slice(i, i + 400));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const entity of chunk) {
      const defRef = doc(db, "users", userId, "definitions", entity.id);
      batch.set(defRef, sanitizeForFirestore(entity), { merge: true });
    }
    await batch.commit();
  }
}

/**
 * Remove uma entidade do Firestore
 */
export async function deleteUserEntity(userId: string, entityId: string): Promise<void> {
  const defRef = doc(db, "users", userId, "definitions", entityId);
  await deleteDoc(defRef);
}

/**
 * Escuta alterações em tempo real nas entidades do usuário logado
 */
export function subscribeUserDefinitions(
  userId: string,
  onUpdate: (definitions: SeoEntityDefinition[]) => void,
  onError?: (err: Error) => void
): () => void {
  const defsCol = collection(db, "users", userId, "definitions");
  return onSnapshot(
    defsCol,
    (snapshot) => {
      const list: SeoEntityDefinition[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SeoEntityDefinition);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("[Firestore] Erro ao sincronizar definições do usuário:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Recupera todas as entidades do usuário de uma só vez
 */
export async function getUserDefinitionsOnce(userId: string): Promise<SeoEntityDefinition[]> {
  const defsCol = collection(db, "users", userId, "definitions");
  const snap = await getDocs(defsCol);
  const list: SeoEntityDefinition[] = [];
  snap.forEach((docSnap) => {
    list.push(docSnap.data() as SeoEntityDefinition);
  });
  return list;
}
