import { initializeApp, getApps, cert, type ServiceAccount, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Firebase Admin SDK - Server-side only
// Uses service account credentials from environment variable
// Lazy initialization to avoid JSON.parse errors during build

let adminApp: App | null = null;
let adminDbInstance: Firestore | null = null;

function getServiceAccount(): ServiceAccount | null {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) return null;
  
  try {
    return JSON.parse(key) as ServiceAccount;
  } catch (error) {
    console.error("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    return null;
  }
}

function initAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    console.warn(
      "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY not set or invalid. Using project ID only."
    );
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trendyai-ff106",
    });
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initAdmin();
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    adminDbInstance = getFirestore(getAdminApp());
  }
  return adminDbInstance;
}

// For backwards compatibility
export const adminDb = {
  collection: (path: string) => getAdminDb().collection(path),
  doc: (path: string) => getAdminDb().doc(path),
};

export default { getAdminApp, getAdminDb };
