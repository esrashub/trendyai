import type {
  User,
  BrandIdentity,
  PlatformAccount,
  ContentPreferences,
  ContentIdea,
  GeneratedContent,
  ScheduledPost,
  DashboardSummary,
  Settings,
  LoginFormData,
  RegisterFormData,
  UserInfoFormData,
  BrandIdentityFormData,
  ContentPreferencesFormData,
} from "@/types";

import {
  mockUser,
  mockBrandIdentity,
  mockPlatformAccounts,
  mockContentPreferences,
  mockContentIdeas,
  mockGeneratedContent,
  mockDashboardSummary,
  mockSettings,
} from "./mock-data";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fixContentIdeaText, fixGeneratedContentText } from "@/lib/text-fix";
import type {
  GeneratedContentDoc,
  GeneratedVisualDoc,
} from "@/types";

/**
 * Firebase Auth state'i hazır olana kadar bekler ve uid döner.
 * auth.currentUser, auth initialize olmadan null dönebilir.
 */
async function getUid(): Promise<string | null> {
  return new Promise((resolve) => {
    // onAuthStateChanged, mevcut state ile anında tetiklenir
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user?.uid ?? null);
    });
  });
}

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// AUTH SERVICES
// ==========================================

/**
 * Register a new user
 * Future endpoint: POST /api/auth/register
 */
export async function registerUser(data: RegisterFormData): Promise<{ success: boolean; user: User }> {
  await delay(1000);
  return {
    success: true,
    user: {
      ...mockUser,
      fullName: data.fullName,
      email: data.email,
      profession: data.profession,
    },
  };
}

/**
 * Login user
 * Future endpoint: POST /api/auth/login
 */
export async function loginUser(data: LoginFormData): Promise<{ success: boolean; user: User }> {
  await delay(800);
  // Mock validation
  if (data.email && data.password) {
    return { success: true, user: mockUser };
  }
  throw new Error("Geçersiz email veya şifre");
}

/**
 * Logout user
 * Future endpoint: POST /api/auth/logout
 */
export async function logoutUser(): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

// ==========================================
// USER SERVICES
// ==========================================

/**
 * Get user information for onboarding
 * Reads from Firestore: users/{uid}
 */
export async function getUserInfo(): Promise<UserInfoFormData | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  
  const data = snap.data();
  return {
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    profession: data.profession ?? "",
    businessType: data.businessType ?? "",
    language: data.language ?? "turkce",
    timezone: data.timezone ?? "Europe/Istanbul",
    country: data.country ?? "Türkiye",
    city: data.city ?? "",
  };
}

/**
 * Save user information (onboarding step 1)
 * Writes to Firestore: users/{uid}
 */
export async function saveUserInfo(data: UserInfoFormData): Promise<{ success: boolean; user: User }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  await updateDoc(doc(db, "users", uid), {
    fullName: data.fullName,
    email: data.email,
    profession: data.profession,
    niche: data.profession,   // n8n workflow için
    status: "active",
    ...(data.businessType && { businessType: data.businessType }),
    ...(data.language     && { language: data.language }),
    ...(data.timezone     && { timezone: data.timezone }),
    ...(data.country      && { country: data.country }),
    ...(data.city         && { city: data.city }),
  });

  return {
    success: true,
    user: { ...mockUser, ...data },
  };
}

// ==========================================
// BRAND IDENTITY SERVICES
// ==========================================

/**
 * Save brand identity (onboarding)
 * Writes to Firestore: brandIdentities/{uid}
 */
export async function saveBrandIdentity(data: BrandIdentityFormData): Promise<{ success: boolean; brand: BrandIdentity }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  const brand: BrandIdentity = {
    id: uid,
    userId: uid,
    brandName: data.brandName,
    sector: data.sector,
    description: data.description,
    websiteUrl: data.websiteUrl ?? "",
    instagramUrl: data.instagramUrl ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
    targetAudience: {
      description: data.targetAudienceDescription ?? "",
      ageRange: data.ageRange ?? "",
      genderFocus: data.genderFocus ?? "",
      problems: data.problems ?? "",
      expectations: data.expectations ?? "",
    },
    brandVoice: {
      tones: data.tones ?? [],
      emotionalKeywords: data.emotionalKeywords ?? "",
      wordsToAvoid: data.wordsToAvoid ?? "",
      communicationStyle: data.communicationStyle ?? "",
    },
    contentStrategy: {
      goals: data.goals ?? [],
      themes: data.themes ?? "",
      ctaPreference: data.ctaPreference ?? "",
    },
    visualIdentity: {
      mainColors: data.mainColors ?? "",
      visualStyle: data.visualStyle ?? "",
      designNotes: data.designNotes ?? "",
    },
    ...(data.aiSummary && { aiSummary: data.aiSummary }),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "brandIdentities", uid), brand);
  return { success: true, brand };
}

/**
 * Get brand identity form data for current user (for onboarding)
 * Reads from Firestore: brandIdentities/{uid}
 */
export async function getBrandIdentityFormData(): Promise<BrandIdentityFormData | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "brandIdentities", uid));
  if (!snap.exists()) return null;
  
  const data = snap.data() as BrandIdentity;
  return {
    brandName: data.brandName ?? "",
    sector: data.sector ?? "",
    description: data.description ?? "",
    websiteUrl: data.websiteUrl ?? "",
    instagramUrl: data.instagramUrl ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
    targetAudienceDescription: data.targetAudience?.description ?? "",
    ageRange: data.targetAudience?.ageRange ?? "",
    genderFocus: data.targetAudience?.genderFocus ?? "",
    problems: data.targetAudience?.problems ?? "",
    expectations: data.targetAudience?.expectations ?? "",
    tones: data.brandVoice?.tones ?? [],
    emotionalKeywords: data.brandVoice?.emotionalKeywords ?? "",
    wordsToAvoid: data.brandVoice?.wordsToAvoid ?? "",
    communicationStyle: data.brandVoice?.communicationStyle ?? "",
    goals: data.contentStrategy?.goals ?? [],
    themes: data.contentStrategy?.themes ?? "",
    ctaPreference: data.contentStrategy?.ctaPreference ?? "",
    mainColors: data.visualIdentity?.mainColors ?? "",
    visualStyle: data.visualIdentity?.visualStyle ?? "",
    designNotes: data.visualIdentity?.designNotes ?? "",
    aiSummary: data.aiSummary,
  };
}

/**
 * Get brand identity for current user
 * Reads from Firestore: brandIdentities/{uid}
 */
export async function getBrandIdentity(): Promise<BrandIdentity | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "brandIdentities", uid));
  if (!snap.exists()) return null;
  return snap.data() as BrandIdentity;
}

/**
 * Update brand identity
 * Writes to Firestore: brandIdentities/{uid}
 */
export async function updateBrandIdentity(data: BrandIdentity): Promise<{ success: boolean; brand: BrandIdentity }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  await setDoc(doc(db, "brandIdentities", uid), { ...data, userId: uid });
  return { success: true, brand: { ...data, userId: uid } };
}

/**
 * Create brand identity if missing
 * Writes to Firestore: brandIdentities/{uid}
 */
export async function createBrandIdentityIfMissing(data: BrandIdentity): Promise<{ success: boolean; brand: BrandIdentity }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  const brand: BrandIdentity = {
    ...data,
    id: uid,
    userId: uid,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "brandIdentities", uid), brand);
  return { success: true, brand };
}

/**
 * Generate AI brand summary from form data
 * Endpoint: POST /api/brand-summary → Gemini 1.5 Flash
 */
export async function generateBrandSummary(data: BrandIdentityFormData): Promise<{ success: boolean; summary: string }> {
  const response = await fetch("/api/brand-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Özet oluşturulamadı");
  }

  const result = await response.json();
  return { success: true, summary: result.summary };
}

// ==========================================
// PLATFORM SERVICES
// ==========================================

/**
 * Get platform accounts
 * Future endpoint: GET /api/platform-accounts
 * Database relation: This reads platform_accounts table.
 */
export async function getPlatformAccounts(): Promise<PlatformAccount[]> {
  await delay(500);
  return mockPlatformAccounts;
}

/**
 * Save connected platform to Firestore
 * Writes to Firestore: connectedPlatforms/{uid}/platforms/{platformId}
 */
export async function saveConnectedPlatform(platformData: {
  platform: string;
  provider: string;
  accountId: string;
  accountName: string;
  profilePicture?: string;
  accessToken: string;
  refreshToken?: string;
  pageId?: string;
  pageAccessToken?: string;
  expiresAt?: string | null;
}): Promise<{ success: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Kullanıcı girişi gerekli");

  await setDoc(
    doc(db, "connectedPlatforms", uid, "platforms", platformData.platform),
    {
      ...platformData,
      status: "connected",
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // Also update the parent doc to mark that platforms exist
  await setDoc(
    doc(db, "connectedPlatforms", uid),
    { hasConnections: true, updatedAt: new Date().toISOString() },
    { merge: true }
  );

  return { success: true };
}

/**
 * Get all connected platforms for current user
 * Reads from Firestore: connectedPlatforms/{uid}/platforms
 */
export async function getConnectedPlatforms(): Promise<PlatformAccount[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const snapshot = await getDocs(collection(db, "connectedPlatforms", uid, "platforms"));
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    platform: doc.data().platform,
    platformName: doc.data().accountName,
    username: doc.data().accountName,
    profileImage: doc.data().profilePicture,
    status: doc.data().status,
    connectedAt: doc.data().connectedAt,
    followers: doc.data().followers || 0,
  })) as PlatformAccount[];
}

/**
 * Disconnect platform - removes from Firestore
 * Deletes from Firestore: connectedPlatforms/{uid}/platforms/{platformId}
 */
export async function disconnectPlatform(platformId: string): Promise<{ success: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Kullanıcı girişi gerekli");

  await deleteDoc(doc(db, "connectedPlatforms", uid, "platforms", platformId));
  
  return { success: true };
}

/**
 * Get platform access token for posting
 * Reads from Firestore: connectedPlatforms/{uid}/platforms/{platformId}
 */
export async function getPlatformCredentials(platformId: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  pageId?: string;
  pageAccessToken?: string;
  accountId: string;
} | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "connectedPlatforms", uid, "platforms", platformId));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    pageId: data.pageId,
    pageAccessToken: data.pageAccessToken,
    accountId: data.accountId,
  };
}

// ==========================================
// CONTENT PREFERENCES SERVICES
// ==========================================

/**
 * Get content preferences for current user
 * Reads from Firestore: weeklyPreferences/{uid}
 */
export async function getContentPreferences(): Promise<ContentPreferences | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "weeklyPreferences", uid));
  if (!snap.exists()) return null;
  return { id: uid, userId: uid, ...snap.data() } as ContentPreferences;
}

/**
 * Get full user profile data
 * Reads from Firestore: users/{uid}
 */
export async function getUserData(): Promise<User | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

/**
 * Save content preferences
 * Writes to Firestore: weeklyPreferences/{uid}  (n8n Personalized Planner bu koleksiyonu okur)
 */
export async function saveContentPreferences(data: ContentPreferencesFormData): Promise<{ success: boolean; preferences: ContentPreferences }> {
  const uid = auth.currentUser?.uid;
  if (uid) {
    try {
      await setDoc(doc(db, "weeklyPreferences", uid), {
        weeklyFrequency:  data.weeklyFrequency  ?? "",
        preferredDays:    data.preferredDays    ?? [],
        preferredTimeRange: data.preferredTimeRange ?? "",
        contentFormats:   data.contentFormats   ?? [],
        weeklyGoal:       data.weeklyGoal       ?? "",
        specialCampaign:  data.specialCampaign  ?? "",
        customNotes:      data.customNotes      ?? "",
        updatedAt:        new Date().toISOString(),
      });
    } catch (err) {
      console.warn("weeklyPreferences Firestore yazma hatası:", err);
      // Firestore'a yazılamazsa sessizce devam et
    }
  }

  return {
    success: true,
    preferences: {
      ...mockContentPreferences,
      ...data,
    },
  };
}

// ==========================================
// WEEKLY FLOW SERVICES
// ==========================================

/**
 * Start weekly content flow
 * Calls Next.js API route → n8n webhook: POST /webhook/start-weekly-flow
 * n8n workflow: "Start Weekly Flow / Personalized Planner"
 * Creates: weeklyPlans/{userId}_{weekId}, contentIdeas/{ideaId}, weeklyFlows/{userId}_{weekId}
 */
/**
 * Türkçe niche string'ini slug'a çevirir (n8n workflow ile aynı normalizasyon).
 * Firestore trendPools/{weekId}_{slug} doküman ID'lerinde kullanılır.
 */
function nicheToSlug(raw: string): string {
  if (!raw) return "";
  return raw
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * ISO 8601 week number (n8n Create Unique Niche List ile birebir aynı algoritma).
 * Örnek: "2026-W22"
 */
function getCurrentWeekId(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Kullanıcının niche'i için trend pool'un bu hafta için Firestore'da var olduğundan emin olur.
 *
 * Akış:
 *   1. Brand identity'den niche oku (eksikse hata)
 *   2. Firestore'da trendPools/{weekId}_{slug} kontrol et
 *   3. Varsa → erken çıkış (skipped: true)
 *   4. Yoksa → POST /api/trend-pool/ensure → n8n Weekly Trend Pool Builder webhook
 *   5. ~60-90 sn bekle, sonra döner
 *
 * Frontend startWeeklyFlow ÖNCESİ çağırır.
 */
export async function ensureTrendPool(): Promise<{
  success: boolean;
  skipped: boolean;
  niche?: string;
  weekId?: string;
  reason?: string;
}> {
  const uid = await getUid();
  if (!uid) throw new Error("Oturum açık değil");

  // 1. users/{uid}'den niche oku — Start Weekly Flow ile BİREBİR AYNI kaynak
  //    Mismatch'i önler: ensureTrendPool ile Start Weekly Flow farklı niche kullanırsa
  //    pool oluştuğu hâlde Start Weekly Flow başka yerde arar → "Trend havuzu bulunamadı"
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) {
    throw new Error("Kullanıcı profili bulunamadı.");
  }
  const userData = userSnap.data() as { niche?: string; profession?: string };
  let nicheRaw = userData.niche || userData.profession || "";

  // Fallback: yine boşsa brand identity'den oku
  if (!nicheRaw) {
    const brandSnap = await getDoc(doc(db, "brandIdentities", uid));
    if (brandSnap.exists()) {
      const brand = brandSnap.data() as { niche?: string; sector?: string };
      nicheRaw = brand.niche || brand.sector || "";
    }
  }

  if (!nicheRaw) {
    throw new Error(
      "Niche/profession bilgisi bulunamadı. Onboarding'i tamamla."
    );
  }
  const slug = nicheToSlug(nicheRaw);
  const weekId = getCurrentWeekId();
  const poolId = `${weekId}_${slug}`;

  // 2. Mevcut pool var mı?
  try {
    const poolSnap = await getDoc(doc(db, "trendPools", poolId));
    if (poolSnap.exists()) {
      return {
        success: true,
        skipped: true,
        niche: slug,
        weekId,
        reason: "trend pool already exists for this week",
      };
    }
  } catch (err) {
    console.warn("[ensureTrendPool] pool check failed:", err);
    // Devam et — webhook builder yine de tetiklenecek
  }

  // 3. Webhook'a tetikle
  const res = await fetch("/api/trend-pool/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ niche: nicheRaw, userId: uid }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error || j.detail || "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || "Trend pool oluşturulamadı");
  }

  return {
    success: true,
    skipped: false,
    niche: slug,
    weekId,
    reason: "trend pool built via webhook",
  };
}

export async function startWeeklyFlow(): Promise<{ success: boolean; flowId: string; ideasCount?: number }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  const response = await fetch("/api/weekly-flow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid }),
  });

  if (!response.ok) {
    let msg = "Haftalık akış başlatılamadı";
    try {
      const err = await response.json();
      msg = err.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  const data = await response.json();

  return {
    success: data.success ?? true,
    flowId:  data.weeklyPlanId ?? `flow-${Date.now()}`,
    ideasCount: data.ideasCount,
  };
}

// ==========================================
// DASHBOARD SERVICES
// ==========================================

/**
 * Get dashboard summary — Firestore'dan gerçek veri
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const uid = await getUid();
  if (!uid) return mockDashboardSummary;

  try {
    const [ideasSnap, platformsSnap] = await Promise.all([
      getDocs(query(collection(db, "contentIdeas"), where("userId", "==", uid))),
      getDocs(collection(db, "connectedPlatforms", uid, "platforms")),
    ]);

    const totalContent = ideasSnap.size;
    const pendingApproval = ideasSnap.docs.filter(
      (d) => d.data().status === "pending"
    ).length;
    const thisWeekPlanned = ideasSnap.docs.filter(
      (d) => d.data().status === "approved"
    ).length;
    const connectedPlatformsCount = platformsSnap.size;

    return {
      totalContent,
      pendingApproval,
      thisWeekPlanned,
      connectedPlatforms: connectedPlatformsCount,
      weeklyFlowStatus: totalContent > 0 ? "completed" : "pending",
      brandProfile: 100,
    };
  } catch (err) {
    console.warn("getDashboardSummary hata:", err);
    return mockDashboardSummary;
  }
}

/**
 * Get recent content ideas — Firestore'dan son 3 fikir
 */
export async function getRecentContentIdeas(): Promise<ContentIdea[]> {
  const ideas = await getContentIdeas();
  return ideas.slice(0, 3);
}

/**
 * Get upcoming scheduled posts — Firestore: scheduledPosts (userId == uid, status == scheduled)
 * Dashboard'da "Yaklaşan Paylaşımlar" kartı için kullanılır.
 */
export async function getUpcomingScheduledPosts(): Promise<ScheduledPost[]> {
  const all = await getScheduledPosts();
  const now = new Date();
  return all
    .filter((p) => p.status === "scheduled")
    .filter((p) => {
      try {
        const dt = new Date(`${p.scheduledDate}T${p.scheduledTime}:00`);
        return dt.getTime() >= now.getTime() - 24 * 60 * 60 * 1000; // bugünden geriye 1 gün toleranslı
      } catch {
        return true;
      }
    })
    .slice(0, 5);
}

// ==========================================
// CONTENT IDEAS SERVICES
// ==========================================

/**
 * Get all content ideas — Firestore: contentIdeas (userId == uid)
 */
export async function getContentIdeas(): Promise<ContentIdea[]> {
  const uid = await getUid();
  if (!uid) return [];

  const q = query(
    collection(db, "contentIdeas"),
    where("userId", "==", uid)
  );
  const snapshot = await getDocs(q);
  const ideas = snapshot.docs.map((d) => {
    const raw = { id: d.id, ...d.data() } as ContentIdea;
    // n8n task runner Türkçe karakterleri bozuyor; Firestore'dan okurken düzelt
    return fixContentIdeaText(raw) as ContentIdea;
  });
  // createdAt'a göre azalan sıra (index gerekmeden client-side)
  return ideas.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Tek bir içerik fikrini Firestore'dan oku.
 * `content-create/[id]` sayfası tarafından kullanılır.
 *
 * @param ideaId - contentIdeas/{ideaId} doküman ID
 * @returns ContentIdea veya bulunamazsa null
 */
export async function getContentIdeaById(
  ideaId: string
): Promise<ContentIdea | null> {
  const snap = await getDoc(doc(db, "contentIdeas", ideaId));
  if (!snap.exists()) return null;

  const raw = { id: snap.id, ...snap.data() } as ContentIdea;
  return fixContentIdeaText(raw) as ContentIdea;
}

/**
 * Approve content idea — Firestore güncelleme
 */
export async function approveContentIdea(
  ideaId: string
): Promise<{ success: boolean; idea: ContentIdea }> {
  await updateDoc(doc(db, "contentIdeas", ideaId), {
    status: "approved",
    updatedAt: new Date().toISOString(),
  });
  return { success: true, idea: { id: ideaId, status: "approved" } as ContentIdea };
}

/**
 * Reject content idea — Firestore güncelleme
 */
export async function rejectContentIdea(
  ideaId: string
): Promise<{ success: boolean; idea: ContentIdea }> {
  await updateDoc(doc(db, "contentIdeas", ideaId), {
    status: "rejected",
    updatedAt: new Date().toISOString(),
  });
  return { success: true, idea: { id: ideaId, status: "rejected" } as ContentIdea };
}

/**
 * Delete content idea — Firestore'dan sil
 */
export async function deleteContentIdea(
  ideaId: string
): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, "contentIdeas", ideaId));
  return { success: true };
}

/**
 * Regenerate content idea with feedback
 * Firestore'da feedback + status="regenerated" kaydeder.
 * n8n webhook: POST /webhook/regenerate-content-idea (gelecekte bağlanacak)
 */
export async function regenerateContentIdeaWithFeedback(
  ideaId: string,
  feedback: string
): Promise<{ success: boolean; idea: ContentIdea }> {
  await updateDoc(doc(db, "contentIdeas", ideaId), {
    feedback,
    status: "regenerated",
    updatedAt: new Date().toISOString(),
  });

  // n8n webhook'u çağır (henüz kurulmadıysa sessizce devam et)
  try {
    await fetch("/api/regenerate-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, feedback }),
    });
  } catch {
    // n8n akışı henüz hazır olmayabilir
  }

  const snap = await getDoc(doc(db, "contentIdeas", ideaId));
  return {
    success: true,
    idea: { id: snap.id, ...snap.data() } as ContentIdea,
  };
}

// ==========================================
// CONTENT GENERATION SERVICES
// ==========================================

/**
 * n8n workflow `Generate Content Text` deterministic ID üretir:
 *   contentId = "content_" + ideaId
 * Frontend bu sayede daha n8n tetiklenmeden listener'ı kurabilir.
 */
function computeContentId(ideaId: string): string {
  return `content_${ideaId}`;
}

/**
 * Firestore'daki ham generatedContents/{contentId} dokümanını
 * + ilgili generatedVisuals/{visualId}'i okuyup UI dostu nested
 * `GeneratedContent` nesnesine dönüştürür.
 *
 * Türkçe karakter düzeltmesi (fixGeneratedContentText) otomatik uygulanır.
 */
async function mergeContentDocWithVisual(
  contentId: string,
  raw: GeneratedContentDoc
): Promise<GeneratedContent> {
  // hashtags, carouselSlides, reelScript Firestore'da JSON string olarak saklanır
  let hashtags: string[] = [];
  try {
    hashtags = JSON.parse(raw.hashtags || "[]");
  } catch {
    hashtags = [];
  }

  let carouselSlides: string[] = [];
  try {
    carouselSlides = JSON.parse(raw.carouselSlides || "[]");
  } catch {
    carouselSlides = [];
  }

  let reelScript: Record<string, unknown> = {};
  try {
    reelScript = JSON.parse(raw.reelScript || "{}");
  } catch {
    reelScript = {};
  }

  // Visual bağlantısı varsa ayrı koleksiyondan oku
  let visual: GeneratedContent["visual"] = {};
  if (raw.generatedVisualRef) {
    const visualId = raw.generatedVisualRef.replace(/^generatedVisuals\//, "");
    try {
      const vSnap = await getDoc(doc(db, "generatedVisuals", visualId));
      if (vSnap.exists()) {
        const v = vSnap.data() as GeneratedVisualDoc;
        visual = {
          visualId: v.visualId,
          prompt: v.visualPrompt,
          negativePrompt: v.negativePrompt,
          designStyle: v.style,
          aspectRatio: v.aspectRatio,
          imageUrl: v.imageUrl,
          provider: v.provider,
        };
      }
    } catch (err) {
      console.warn("[mergeContentDocWithVisual] visual okunamadı:", err);
    }
  }

  const merged: GeneratedContent = {
    id: contentId,
    contentIdeaId: raw.ideaId,
    userId: raw.userId,
    weekId: raw.weekId,
    niche: raw.niche,
    platform: raw.platform || "",
    contentType: raw.contentType || "",
    text: {
      hook: raw.hook || "",
      caption: raw.caption || "",
      body: raw.body || "",
      cta: raw.cta || "",
      hashtags,
      carouselSlides: carouselSlides.length ? carouselSlides : undefined,
      reelScript: Object.keys(reelScript).length ? reelScript : undefined,
      contentNotes: raw.contentNotes,
    },
    visual,
    textApproved: raw.textApproved || false,
    visualApproved: raw.visualApproved || false,
    status: raw.status,
    generatedVisualRef: raw.generatedVisualRef,
    requestId: raw.requestId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };

  return fixGeneratedContentText(merged);
}

/**
 * Firestore'dan oluşturulmuş içeriği oku.
 * Önce ideaId'den deterministic contentId hesaplar, sonra okur.
 *
 * @returns Mevcutsa GeneratedContent, yoksa null (henüz üretilmemiş)
 */
export async function getGeneratedContent(
  ideaId: string
): Promise<GeneratedContent | null> {
  const contentId = computeContentId(ideaId);
  const snap = await getDoc(doc(db, "generatedContents", contentId));
  if (!snap.exists()) return null;

  const raw = snap.data() as GeneratedContentDoc;
  return mergeContentDocWithVisual(contentId, raw);
}

/**
 * Tüm generatedContents'i giriş yapan kullanıcı için Firestore'dan oku.
 * İçerik Oluşturma index sayfası (üzerinde çalışılan içerikleri listele) kullanır.
 *
 * Sıra: en son güncellenen üstte.
 */
export async function getAllGeneratedContents(): Promise<GeneratedContent[]> {
  const uid = await getUid();
  if (!uid) return [];

  const q = query(
    collection(db, "generatedContents"),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  const results: GeneratedContent[] = [];
  for (const d of snap.docs) {
    try {
      const merged = await mergeContentDocWithVisual(
        d.id,
        d.data() as GeneratedContentDoc
      );
      results.push(merged);
    } catch (err) {
      console.warn("[getAllGeneratedContents] merge failed for", d.id, err);
    }
  }
  // En son güncellenen üstte
  return results.sort((a, b) => {
    const aT = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bT = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bT - aT;
  });
}

/**
 * Firestore listener — generatedContents/{contentId} değişikliklerini izler.
 * n8n workflow doc'u güncellediğinde callback çağrılır.
 *
 * Kullanım:
 *   const unsub = subscribeToGeneratedContent(contentId, (content) => {
 *     if (content) setContent(content);
 *   });
 *   // Cleanup: useEffect dönüşünde unsub()
 */
export function subscribeToGeneratedContent(
  contentId: string,
  callback: (content: GeneratedContent | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "generatedContents", contentId),
    async (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const raw = snap.data() as GeneratedContentDoc;
      try {
        const merged = await mergeContentDocWithVisual(contentId, raw);
        callback(merged);
      } catch (err) {
        console.error(
          "[subscribeToGeneratedContent] merge error:",
          err
        );
        callback(null);
      }
    },
    (err) => {
      console.error(
        "[subscribeToGeneratedContent] snapshot error:",
        err
      );
      callback(null);
    }
  );
}

/**
 * İçerik üretimini tetikle (fire-and-forget).
 *
 * Süreç:
 *  1. /api/content/generate'i çağırır (Vercel kısa sürede döner)
 *  2. n8n arka planda Gemini ile metni üretir
 *  3. n8n Firestore'a yazar
 *  4. Frontend `subscribeToGeneratedContent(contentId, ...)` ile sonucu bekler
 *
 * @returns Hesaplanan contentId — frontend listener kurmak için kullanır
 */
export async function generateContent(
  ideaId: string
): Promise<{ success: boolean; contentId: string; status: string }> {
  const uid = await getUid();
  if (!uid) throw new Error("Oturum açık değil");

  const response = await fetch("/api/content/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid, ideaId }),
  });

  if (!response.ok) {
    let msg = "İçerik üretimi başlatılamadı";
    try {
      const err = await response.json();
      msg = err.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    success: data.success ?? true,
    contentId: data.contentId ?? computeContentId(ideaId),
    status: data.status ?? "generating",
  };
}

/**
 * Metni feedback ile yeniden ürettir (fire-and-forget).
 *
 * @param contentId - generatedContents/{contentId} doc id
 * @param feedback  - Kullanıcı geri bildirimi (zorunlu, boş olamaz)
 */
export async function regenerateText(
  contentId: string,
  feedback: string
): Promise<{ success: boolean; contentId: string; status: string }> {
  const uid = await getUid();
  if (!uid) throw new Error("Oturum açık değil");
  if (!feedback || !feedback.trim()) {
    throw new Error("Feedback boş olamaz");
  }

  const response = await fetch("/api/content/regenerate-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid, contentId, feedback }),
  });

  if (!response.ok) {
    let msg = "Metin yeniden üretilemedi";
    try {
      const err = await response.json();
      msg = err.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    success: data.success ?? true,
    contentId: data.contentId ?? contentId,
    status: data.status ?? "regenerating",
  };
}

/**
 * Görseli yeniden ürettir (fire-and-forget).
 * Aynı endpoint hem ilk üretim hem yeniden üretim için kullanılır.
 *
 * NOT: n8n öncesinde textApproved kontrolü yapar.
 */
export async function regenerateVisual(
  contentId: string
): Promise<{ success: boolean; contentId: string; status: string }> {
  const uid = await getUid();
  if (!uid) throw new Error("Oturum açık değil");

  const response = await fetch("/api/content/generate-visual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid, contentId }),
  });

  if (!response.ok) {
    let msg = "Görsel üretilemedi";
    try {
      const err = await response.json();
      msg = err.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    success: data.success ?? true,
    contentId: data.contentId ?? contentId,
    status: data.status ?? "generating_visual",
  };
}

/**
 * Metni onayla — Firestore'da textApproved: true set eder.
 * n8n gerek yok, basit doc update.
 *
 * Eğer hem text hem visual onaylıysa status = "ready_to_schedule" olur.
 */
export async function approveText(
  contentId: string
): Promise<{ success: boolean }> {
  const ref = doc(db, "generatedContents", contentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("İçerik bulunamadı");
  }
  const data = snap.data();
  const visualApproved = data?.visualApproved === true;
  const newStatus = visualApproved ? "ready_to_schedule" : data?.status;

  await updateDoc(ref, {
    textApproved: true,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Görseli onayla — Firestore'da visualApproved: true set eder.
 * Eğer hem text hem visual onaylıysa status = "ready_to_schedule" olur.
 */
export async function approveVisual(
  contentId: string
): Promise<{ success: boolean }> {
  const ref = doc(db, "generatedContents", contentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("İçerik bulunamadı");
  }
  const data = snap.data();
  const textApproved = data?.textApproved === true;
  const newStatus = textApproved ? "ready_to_schedule" : data?.status;

  await updateDoc(ref, {
    visualApproved: true,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Schedule content for publishing
 * Future endpoint: POST /api/content/:contentId/schedule
 * n8n webhook: POST /webhook/schedule-content
 * Database relation: This creates scheduled_posts record.
 */
export async function scheduleContent(
  contentId: string,
  scheduleData: { date: string; time: string; platform: string }
): Promise<{ success: boolean; scheduledPost: ScheduledPost }> {
  const uid = await getUid();
  if (!uid) throw new Error("Kullanıcı oturumu bulunamadı");

  // İçeriğin başlığını/hook'unu al (calendar'da göstermek için)
  let title = "Programlanmış İçerik";
  try {
    const cSnap = await getDoc(doc(db, "generatedContents", contentId));
    if (cSnap.exists()) {
      const c = cSnap.data() as GeneratedContentDoc;
      title = c.hook || "Programlanmış İçerik";
    }
  } catch {
    // Başlık alınamadıysa default kalsın
  }

  const post = {
    generatedContentId: contentId,
    userId: uid,
    platform: scheduleData.platform,
    scheduledDate: scheduleData.date,
    scheduledTime: scheduleData.time,
    title,
    status: "scheduled" as const,
    createdAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, "scheduledPosts"), post);

  // Generated content'in status'unu güncelle
  try {
    await updateDoc(doc(db, "generatedContents", contentId), {
      status: "scheduled",
      scheduledPostId: ref.id,
      scheduledDate: scheduleData.date,
      scheduledTime: scheduleData.time,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[scheduleContent] generatedContents update failed:", err);
  }

  return {
    success: true,
    scheduledPost: { id: ref.id, ...post },
  };
}

// ==========================================
// CALENDAR SERVICES
// ==========================================

/**
 * Tüm programlanmış postları Firestore'dan oku.
 * Sadece giriş yapan kullanıcının post'ları gelir.
 */
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const uid = await getUid();
  if (!uid) return [];

  const q = query(
    collection(db, "scheduledPosts"),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduledPost));
  // En yakın tarihten en uzağa
  return posts.sort((a, b) => {
    const da = `${a.scheduledDate} ${a.scheduledTime}`;
    const db_ = `${b.scheduledDate} ${b.scheduledTime}`;
    return da.localeCompare(db_);
  });
}

/**
 * Real-time scheduledPosts dinleyici (Firestore onSnapshot).
 * Calendar sayfası kullanır — yeni post eklenirse otomatik UI güncellenir.
 */
export function subscribeToScheduledPosts(
  callback: (posts: ScheduledPost[]) => void
): Unsubscribe {
  let unsub: Unsubscribe = () => {};
  let cancelled = false;

  (async () => {
    const uid = await getUid();
    if (cancelled || !uid) return;

    const q = query(
      collection(db, "scheduledPosts"),
      where("userId", "==", uid)
    );
    unsub = onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as ScheduledPost))
          .sort((a, b) => {
            const da = `${a.scheduledDate} ${a.scheduledTime}`;
            const db_ = `${b.scheduledDate} ${b.scheduledTime}`;
            return da.localeCompare(db_);
          });
        callback(posts);
      },
      (err) => {
        console.warn("[subscribeToScheduledPosts]", err.message);
      }
    );
  })();

  return () => {
    cancelled = true;
    unsub();
  };
}

/**
 * Programlanmış post'u güncelle (tarih, saat, platform vb).
 */
export async function updateScheduledPost(
  postId: string,
  data: Partial<ScheduledPost>
): Promise<{ success: boolean; post: ScheduledPost }> {
  const ref = doc(db, "scheduledPosts", postId);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  const snap = await getDoc(ref);
  return {
    success: true,
    post: { id: snap.id, ...snap.data() } as ScheduledPost,
  };
}

/**
 * Programlanmış post'u iptal et (status: cancelled).
 * Gerçek silme yerine soft-delete — geçmiş için kayıt kalır.
 */
export async function cancelScheduledPost(
  postId: string
): Promise<{ success: boolean }> {
  await updateDoc(doc(db, "scheduledPosts", postId), {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { success: true };
}

/**
 * Programlanmış post'u tamamen sil (kullanıcı "Sil" derse).
 */
export async function deleteScheduledPost(
  postId: string
): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, "scheduledPosts", postId));
  return { success: true };
}

// ==========================================
// SETTINGS SERVICES
// ==========================================

/**
 * Get user settings
 * Future endpoint: GET /api/settings
 */
export async function getSettings(): Promise<Settings> {
  await delay(500);
  return mockSettings;
}

/**
 * Update user profile
 * Writes to Firestore: users/{uid}
 */
export async function updateProfile(data: Partial<Settings["profile"]>): Promise<{ success: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Oturum açık değil");

  await updateDoc(doc(db, "users", uid), {
    ...(data.fullName   !== undefined && { fullName: data.fullName }),
    ...(data.email      !== undefined && { email: data.email }),
    ...(data.profession !== undefined && {
      profession: data.profession,
      niche: data.profession,  // n8n workflow için senkronize tut
    }),
    status: "active",          // Eksik olabilir, her güncellemeye ekle
  });
  return { success: true };
}

/**
 * Change password
 * Future endpoint: POST /api/settings/change-password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  await delay(1000);
  if (currentPassword && newPassword) {
    return { success: true };
  }
  throw new Error("Şifre değiştirme başarısız");
}
