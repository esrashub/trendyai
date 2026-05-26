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
  mockScheduledPosts,
  mockDashboardSummary,
  mockSettings,
} from "./mock-data";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

  const { getDocs, collection } = await import("firebase/firestore");
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

  const { deleteDoc } = await import("firebase/firestore");
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
 * Get dashboard summary
 * Future endpoint: GET /api/dashboard/summary
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(500);
  return mockDashboardSummary;
}

/**
 * Get recent content ideas
 * Future endpoint: GET /api/dashboard/recent-content
 */
export async function getRecentContentIdeas(): Promise<ContentIdea[]> {
  await delay(500);
  return mockContentIdeas.slice(0, 3);
}

/**
 * Get upcoming scheduled posts
 * Future endpoint: GET /api/dashboard/upcoming-scheduled
 */
export async function getUpcomingScheduledPosts(): Promise<ScheduledPost[]> {
  await delay(500);
  return mockScheduledPosts.filter((post) => post.status === "scheduled");
}

// ==========================================
// CONTENT IDEAS SERVICES
// ==========================================

/**
 * Get all content ideas
 * Future endpoint: GET /api/content-ideas
 * Database relation: This reads content_ideas table.
 */
export async function getContentIdeas(): Promise<ContentIdea[]> {
  await delay(600);
  return mockContentIdeas;
}

/**
 * Approve content idea
 * Future endpoint: POST /api/content-ideas/:id/approve
 */
export async function approveContentIdea(ideaId: string): Promise<{ success: boolean; idea: ContentIdea }> {
  await delay(500);
  const idea = mockContentIdeas.find((i) => i.id === ideaId);
  if (idea) {
    return {
      success: true,
      idea: { ...idea, status: "approved" },
    };
  }
  throw new Error("İçerik fikri bulunamadı");
}

/**
 * Reject content idea
 * Future endpoint: POST /api/content-ideas/:id/reject
 */
export async function rejectContentIdea(ideaId: string): Promise<{ success: boolean; idea: ContentIdea }> {
  await delay(500);
  const idea = mockContentIdeas.find((i) => i.id === ideaId);
  if (idea) {
    return {
      success: true,
      idea: { ...idea, status: "rejected" },
    };
  }
  throw new Error("İçerik fikri bulunamadı");
}

/**
 * Regenerate content idea with feedback
 * Future endpoint: POST /api/content-ideas/:id/feedback-regenerate
 * n8n webhook: POST /webhook/regenerate-content-idea
 */
export async function regenerateContentIdeaWithFeedback(
  ideaId: string,
  feedback: string
): Promise<{ success: boolean; idea: ContentIdea }> {
  await delay(2000);
  return {
    success: true,
    idea: {
      id: "idea-new-" + Date.now(),
      weeklyFlowId: "flow-1",
      suggestedDate: new Date().toISOString().split("T")[0],
      suggestedTime: "12:00",
      platform: "Instagram",
      contentFormat: "Post",
      title: "Yeniden Oluşturulan İçerik Fikri",
      description: "Feedback'inize göre yeniden oluşturulmuş içerik fikri.",
      trendSource: "Social Trend",
      trendKeyword: "yeni trend",
      status: "regenerated",
      feedback,
      createdAt: new Date().toISOString(),
    },
  };
}

// ==========================================
// CONTENT GENERATION SERVICES
// ==========================================

/**
 * Generate content for approved idea
 * Future endpoint: POST /api/content/:ideaId/generate
 * n8n webhook: POST /webhook/generate-content
 * Database relation: This creates generated_contents record.
 */
export async function generateContent(ideaId: string): Promise<{ success: boolean; content: GeneratedContent }> {
  await delay(2500);
  return {
    success: true,
    content: {
      ...mockGeneratedContent,
      contentIdeaId: ideaId,
    },
  };
}

/**
 * Regenerate text content
 * Future endpoint: POST /api/content/:contentId/regenerate-text
 * n8n webhook: POST /webhook/generate-content
 */
export async function regenerateText(contentId: string): Promise<{ success: boolean; content: GeneratedContent }> {
  await delay(2000);
  return {
    success: true,
    content: {
      ...mockGeneratedContent,
      id: contentId,
      text: {
        ...mockGeneratedContent.text,
        hook: "Yeni hook metni!",
        caption: "Yeniden oluşturulmuş caption metni...",
      },
    },
  };
}

/**
 * Regenerate visual content
 * Future endpoint: POST /api/content/:contentId/regenerate-visual
 * n8n webhook: POST /webhook/generate-visual
 */
export async function regenerateVisual(contentId: string): Promise<{ success: boolean; content: GeneratedContent }> {
  await delay(2500);
  return {
    success: true,
    content: {
      ...mockGeneratedContent,
      id: contentId,
      visual: {
        ...mockGeneratedContent.visual,
        prompt: "Yeni görsel prompt...",
      },
    },
  };
}

/**
 * Approve text content
 * Future endpoint: POST /api/content/:contentId/approve-text
 */
export async function approveText(contentId: string): Promise<{ success: boolean }> {
  await delay(300);
  return { success: true };
}

/**
 * Approve visual content
 * Future endpoint: POST /api/content/:contentId/approve-visual
 */
export async function approveVisual(contentId: string): Promise<{ success: boolean }> {
  await delay(300);
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
  await delay(1000);
  return {
    success: true,
    scheduledPost: {
      id: "scheduled-" + Date.now(),
      generatedContentId: contentId,
      platform: scheduleData.platform,
      scheduledDate: scheduleData.date,
      scheduledTime: scheduleData.time,
      title: "Programlanmış İçerik",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    },
  };
}

// ==========================================
// CALENDAR SERVICES
// ==========================================

/**
 * Get all scheduled posts
 * Future endpoint: GET /api/scheduled-posts
 * Database relation: This reads scheduled_posts table.
 */
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  await delay(500);
  return mockScheduledPosts;
}

/**
 * Update scheduled post
 * Future endpoint: PUT /api/scheduled-posts/:id
 */
export async function updateScheduledPost(
  postId: string,
  data: Partial<ScheduledPost>
): Promise<{ success: boolean; post: ScheduledPost }> {
  await delay(500);
  const post = mockScheduledPosts.find((p) => p.id === postId);
  if (post) {
    return {
      success: true,
      post: { ...post, ...data },
    };
  }
  throw new Error("Programlanmış içerik bulunamadı");
}

/**
 * Cancel scheduled post
 * Future endpoint: DELETE /api/scheduled-posts/:id
 */
export async function cancelScheduledPost(postId: string): Promise<{ success: boolean }> {
  await delay(500);
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
