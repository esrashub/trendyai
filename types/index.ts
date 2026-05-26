// TrendyAI TypeScript Interfaces

export interface User {
  id: string;
  fullName: string;
  email: string;
  profession: string;
  businessType: string;
  language: string;
  timezone: string;
  country: string;
  city: string;
  createdAt: string;
  emailVerified: boolean;
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
  userId: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'facebook';
  status: 'disconnected' | 'connecting' | 'connected' | 'expired';
  accountName?: string;
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

export interface ContentIdea {
  id: string;
  weeklyFlowId: string;
  suggestedDate: string;
  suggestedTime: string;
  platform: string;
  contentFormat: string;
  title: string;
  description: string;
  trendSource: 'SerpApi' | 'Apify' | 'Social Trend' | 'Search Trend';
  trendKeyword: string;
  status: 'pending' | 'approved' | 'rejected' | 'regenerated';
  feedback?: string;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  contentIdeaId: string;
  text: {
    hook: string;
    caption: string;
    body: string;
    cta: string;
    hashtags: string[];
  };
  visual: {
    prompt: string;
    designStyle: string;
    imageUrl?: string;
    canvaUrl?: string;
  };
  textApproved: boolean;
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
