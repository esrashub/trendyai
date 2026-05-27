// TrendyAI TypeScript Interfaces

export interface User {
  id: string;
  fullName: string;
  name?: string;               // Bazı eski mock veriler kullanır; fullName ile aynı
  email: string;
  profession: string;
  niche?: string;              // n8n workflow için (= profession ile senkron)
  businessType: string;
  language: string;
  timezone: string;
  country: string;
  city: string;
  createdAt: string;
  emailVerified: boolean;
  status?: 'active' | 'inactive' | string;
  avatar?: string;
  /**
   * Onboarding sırasında User belgesine gömülen kısa marka bilgisi.
   * Tam BrandIdentity ayrı `brandIdentities/{uid}` koleksiyonunda saklanır.
   */
  brandIdentity?: {
    brandName?: string;
    tagline?: string;
    primaryColor?: string;
    secondaryColor?: string;
    toneOfVoice?: string;
    keywords?: string[];
  };
}

export interface BrandIdentity {
  id: string;
  userId: string;
  brandName: string;
  sector: string;
  description: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  targetAudience: {
    description: string;
    ageRange: string;
    genderFocus: string;
    problems: string;
    expectations: string;
  };
  brandVoice: {
    tones: string[];
    emotionalKeywords: string;
    wordsToAvoid: string;
    communicationStyle: string;
  };
  contentStrategy: {
    goals: string[];
    themes: string;
    ctaPreference: string;
  };
  visualIdentity: {
    logoUrl?: string;
    mainColors: string;
    visualStyle: string;
    designNotes: string;
  };
  aiSummary?: string;
  createdAt: string;
}

export interface PlatformAccount {
  id: string;
  userId?: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'twitter' | 'facebook' | string;
  platformName?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'expired';
  accountName?: string;
  username?: string;
  profileImage?: string;
  followers?: number;
  connectedAt?: string;
}

export interface ContentPreferences {
  id: string;
  userId: string;
  weeklyFrequency: string;
  preferredDays: string[];
  preferredTimeRange: string;
  contentFormats: string[];
  weeklyGoal: string;
  specialCampaign?: string;
  customNotes?: string;
}

export interface WeeklyFlow {
  id: string;
  userId: string;
  brandIdentityId: string;
  status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  contentIdeasCount: number;
}

/**
 * ContentIdea — n8n "Start Weekly Flow" workflow tarafından
 * Firestore `contentIdeas/{ideaId}` belgesi olarak yazılır.
 */
export interface ContentIdea {
  id: string;
  ideaId?: string;             // Firestore doc id ile aynı (n8n bazen ayrı saklar)
  weeklyFlowId: string;
  userId?: string;
  weekId?: string;
  niche?: string;
  suggestedDate: string;
  suggestedTime: string;
  platform: string;
  contentFormat: string;
  contentType?: string;        // "post" | "carousel" | "story" | "reel" | "article"
  title: string;
  description: string;
  trendSource: 'SerpApi' | 'Apify' | 'Social Trend' | 'Search Trend' | string;
  trendKeyword: string;
  trendTopic?: string;
  linkedTrendTitle?: string;
  brandFitReason?: string;
  hashtags?: string[];
  targetAudience?: string;
  engagementScore?: number;
  status: 'pending' | 'approved' | 'rejected' | 'regenerated';
  feedback?: string;
  requestId?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * GeneratedContentStatus — içeriğin yaşam döngüsü
 * text_generated → visual_generated → ready_to_schedule → scheduled → published
 */
export type GeneratedContentStatus =
  | 'text_generated'
  | 'visual_generated'
  | 'ready_to_schedule'
  | 'scheduled'
  | 'published'
  | 'failed';

/**
 * GeneratedContent — UI dostu birleşik tip.
 *
 * Firestore'da iki ayrı koleksiyondan oluşur:
 *  - `generatedContents/{contentId}` — metin alanları (FLAT) + status
 *  - `generatedVisuals/{visualId}`   — görsel alanları
 *
 * `getGeneratedContent()` fonksiyonu iki belgeyi birleştirir ve aşağıdaki
 * yapıya dönüştürür. UI bileşenleri bu nested yapıyı kullanır.
 *
 * NOT: Firestore'da `hashtags` JSON string olarak saklanır;
 *      API katmanı okurken `JSON.parse` eder.
 */
export interface GeneratedContent {
  id: string;                  // contentId (Firestore doc id)
  contentIdeaId: string;       // ideaId — contentIdeas/{ideaId} bağlantısı
  userId?: string;
  weekId?: string;
  niche?: string;
  platform: string;            // "instagram" | "linkedin" | "twitter" | "facebook"
  contentType: string;         // "post" | "carousel" | "story" | "reel"

  text: {
    hook: string;
    caption: string;
    body: string;
    cta: string;
    hashtags: string[];
    carouselSlides?: string[];           // Sadece carousel için
    reelScript?: Record<string, unknown>; // Sadece reel için
    contentNotes?: string;
  };

  visual: {
    visualId?: string;
    prompt?: string;          // n8n: visualPrompt
    negativePrompt?: string;
    designStyle?: string;     // n8n: style
    aspectRatio?: string;
    imageUrl?: string;
    canvaUrl?: string;
    provider?: string;        // "openai" (DALL-E)
  };

  textApproved: boolean;
  visualApproved: boolean;
  status: GeneratedContentStatus;
  generatedVisualRef?: string; // "generatedVisuals/{visualId}"

  requestId?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Firestore'daki ham `generatedContents/{contentId}` belgesinin yapısı.
 * Sadece API katmanında (transformasyon öncesi) kullanılır.
 */
export interface GeneratedContentDoc {
  contentId: string;
  ideaId: string;
  userId: string;
  weekId?: string;
  niche?: string;
  platform?: string;
  contentType?: string;
  hook: string;
  caption: string;
  body: string;
  cta: string;
  hashtags: string;            // JSON string!
  carouselSlides?: string;     // JSON string!
  reelScript?: string;         // JSON string!
  contentNotes?: string;
  textApproved: boolean;
  visualApproved: boolean;
  status: GeneratedContentStatus;
  generatedVisualRef?: string;
  requestId?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Firestore'daki ham `generatedVisuals/{visualId}` belgesinin yapısı.
 */
export interface GeneratedVisualDoc {
  visualId: string;
  contentId: string;
  userId: string;
  provider: string;
  imageUrl: string;
  visualPrompt: string;
  negativePrompt?: string;
  style?: string;
  aspectRatio?: string;
  status: string;
  visualApproved: boolean;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  generatedContentId: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  title: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface DashboardSummary {
  totalContent: number;
  pendingApproval: number;
  thisWeekPlanned: number;
  connectedPlatforms: number;
  weeklyFlowStatus?: string;
  brandProfile: number;
}

export interface Settings {
  profile: {
    fullName: string;
    email: string;
    profession: string;
    timezone: string;
    language: string;
  };
  security: {
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  notifications: {
    weeklySummary: boolean;
    failedPublishing: boolean;
    contentApproval: boolean;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profession: string;
}

export interface UserInfoFormData {
  fullName: string;
  email: string;
  profession: string;
  businessType: string;
  language: string;
  timezone: string;
  country: string;
  city: string;
}

export interface BrandIdentityFormData {
  brandName: string;
  sector: string;
  description: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  targetAudienceDescription: string;
  ageRange: string;
  genderFocus: string;
  problems: string;
  expectations: string;
  tones: string[];
  emotionalKeywords: string;
  wordsToAvoid: string;
  communicationStyle: string;
  goals: string[];
  themes: string;
  ctaPreference: string;
  mainColors: string;
  visualStyle: string;
  designNotes: string;
  aiSummary?: string;
}

export interface ContentPreferencesFormData {
  weeklyFrequency: string;
  preferredDays: string[];
  preferredTimeRange: string;
  contentFormats: string[];
  weeklyGoal: string;
  specialCampaign?: string;
  customNotes?: string;
}
