import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged, 
  User, 
  signInAnonymously 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  Firestore,
  writeBatch
} from "firebase/firestore";

// User's provided Firebase configuration for Nexora
export const firebaseConfig = {
  apiKey: "AIzaSyBIYghq3nLSTtjaQFodOTrLDALflNnq4Os",
  authDomain: "nexora-62e8c.firebaseapp.com",
  projectId: "nexora-62e8c",
  storageBucket: "nexora-62e8c.firebasestorage.app",
  messagingSenderId: "339287340509",
  appId: "1:339287340509:web:322adaa361a2e8e92f7234"
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: Firestore | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn("Nexora Firebase initialization warning:", err);
}

export { app, auth, db };

export async function loginWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized.");
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized.");
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized.");
  }
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
