import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6PiQPpd3vJ4gxCF8aN0wbgfN8iqaseY8",
  authDomain: "trendyai-ff106.firebaseapp.com",
  projectId: "trendyai-ff106",
  storageBucket: "trendyai-ff106.firebasestorage.app",
  messagingSenderId: "251662647862",
  appId: "1:251662647862:web:fd473be5ce5cf310548e97",
  measurementId: "G-EX6VSQN7EN",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth    = typeof window !== "undefined" ? getAuth(app)    : null as any;
export const db      = typeof window !== "undefined" ? getFirestore(app) : null as any;
export const storage = typeof window !== "undefined" ? getStorage(app)  : null as any;
export default app;