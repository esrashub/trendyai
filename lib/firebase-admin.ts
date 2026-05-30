import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin SDK - Server-side only
// Uses service account credentials from environment variable

const serviceAccount: ServiceAccount | null = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!serviceAccount) {
    console.warn(
      "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY not set. Server-side Firestore operations will fail."
    );
    // Initialize without credentials for development (will fail on actual operations)
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trendyai-ff106",
    });
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

const adminApp = initAdmin();

export const adminDb = getFirestore(adminApp);
export default adminApp;
