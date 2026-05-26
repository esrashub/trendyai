"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, sendEmailVerification, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  fullName: string;
  email: string;
  profession: string;
  createdAt: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
  resendVerificationEmail: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data as UserProfile);
        // Eski kullanıcılarda niche / status yoksa ekle
        const needsPatch = !data.status || !data.niche;
        if (needsPatch && data.profession) {
          try {
            await updateDoc(doc(db, "users", firebaseUser.uid), {
              ...(!data.status && { status: "active" }),
              ...(!data.niche  && { niche: data.profession }),
            });
          } catch {
            // patch başarısız olursa sessizce devam et
          }
        }
      } else {
        setProfile({
          fullName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Kullanıcı",
          email: firebaseUser.email || "",
          profession: "",
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      setProfile({
        fullName: firebaseUser.displayName || "Kullanıcı",
        email: firebaseUser.email || "",
        profession: "",
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
