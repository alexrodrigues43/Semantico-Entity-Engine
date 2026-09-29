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
  query, 
  orderBy, 
  increment,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile, UserRole, UserStatus, UserPlan } from "../types";

export const SUPER_ADMIN_EMAIL = "alexrodrigues43@gmail.com";

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (using custom firestoreDatabaseId if provided in config)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
 * Creates or retrieves user profile from Firestore, guaranteeing Super Admin privileges for alexrodrigues43@gmail.com
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const isSuperAdmin = isSuperAdminEmail(user.email);

  if (!userSnap.exists()) {
    // New user document
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
    // Existing user: update last login and ensure super admin if email matches
    const existing = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      lastLoginAt: new Date().toISOString(),
      displayName: user.displayName || existing.displayName || user.email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || existing.photoURL,
    };

    // If super admin email, enforce role and status
    if (isSuperAdmin && (existing.role !== "admin" || existing.status !== "active")) {
      updates.role = "admin";
      updates.status = "active";
      updates.plan = "lifetime";
    }

    await updateDoc(userRef, updates);
    return { ...existing, ...updates };
  }
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

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
