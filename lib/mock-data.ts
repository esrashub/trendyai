import type {
  User,
  BrandIdentity,
  PlatformAccount,
  ContentPreferences,
  WeeklyFlow,
  ContentIdea,
  GeneratedContent,
  ScheduledPost,
  DashboardSummary,
  Settings,
} from "@/types";

export const mockUser: User = {
  id: "user-1",
  fullName: "Ayşe Yılmaz",
  name: "Ayşe Yılmaz",
  email: "ayse@example.com",
  profession: "Diyetisyen",
  niche: "diyetisyen",
  businessType: "Kişisel Marka",
  language: "Türkçe",
  timezone: "Europe/Istanbul",
  country: "Türkiye",
  city: "İstanbul",
  createdAt: "2026-01-15T10:00:00Z",
  emailVerified: true,
  avatar: "",
  brandIdentity: {
    brandName: "Dyt. Ayşe Yılmaz",
    tagline: "Bilimsel beslenme, sürdürülebilir yaşam",
    primaryColor: "#10b981",
    secondaryColor: "#f0fdf4",
    toneOfVoice: "profesyonel",
    keywords: ["sağlık", "beslenme", "diyetisyen", "wellness", "doğal"],
  },
};

export const mockBrandIdentity: BrandIdentity = {
  id: "brand-1",
  userId: "user-1",
  brandName: "Dyt. Ayşe Yılmaz",
  sector: "Sağlık & Beslenme",
  description:
    "Sağlıklı beslenme ve kilo yönetimi konusunda uzmanlaşmış, bilimsel temelli beslenme danışmanlığı sunan diyetisyen.",
  websiteUrl: "https://dytayseyilmaz.com",
  instagramUrl: "https://instagram.com/dytayseyilmaz",
  linkedinUrl: "https://linkedin.com/in/ayseyilmaz",
  targetAudience: {
    description:
      "Sağlıklı yaşam isteyenler, kilo vermek isteyenler, sporla ilgilenenler",
    ageRange: "25-45",
    genderFocus: "Çoğunlukla kadın",
    problems:
      "Kilo kontrolü, sağlıksız beslenme alışkanlıkları, enerji eksikliği",
    expectations:
      "Sürdürülebilir beslenme programı, bilimsel yaklaşım, kişiselleştirilmiş öneriler",
  },
  brandVoice: {
    tones: ["Profesyonel", "Samimi", "Eğitici", "Motive edici"],
    emotionalKeywords: "güven, sağlık, mutluluk, enerji, dönüşüm",
    wordsToAvoid: "diyet hapı, hızlı kilo verme, mucize",
    communicationStyle: "Uzman ama sade",
  },
  contentStrategy: {
    goals: ["Eğitim", "Güven oluşturma", "Randevu"],
    themes: "Sağlıklı tarifler, beslenme mitleri, mevsimsel öneriler",
    ctaPreference: "Randevu al",
  },
  visualIdentity: {
    mainColors: "Yeşil, beyaz, açık kahverengi",
    visualStyle: "Modern",
    designNotes: "Doğal, temiz, taze görünüm",
  },
  aiSummary: `**Marka Kişiliği:** Güvenilir, bilgili ve samimi bir sağlık uzmanı.\n**Hedef Kitle:** 25-45 yaş arası, sağlıklı yaşam hedefleyen, çoğunlukla kadın bireyler.\n**Marka Tonu:** Profesyonel ama ulaşılabilir, eğitici ve motive edici.\n**İçerik Dili:** Türkçe, sade ve anlaşılır.\n**Görsel Yön:** Modern, doğal renkler, temiz tasarım.`,
  createdAt: "2026-01-15T11:00:00Z",
};

export const mockPlatformAccounts: PlatformAccount[] = [
  {
    id: "platform-1",
    userId: "user-1",
    platform: "instagram",
    status: "connected",
    accountName: "@dytayseyilmaz",
    connectedAt: "2026-01-15T12:00:00Z",
  },
  {
    id: "platform-2",
    userId: "user-1",
    platform: "linkedin",
    status: "connected",
    accountName: "Ayşe Yılmaz",
    connectedAt: "2026-01-15T12:05:00Z",
  },
  {
    id: "platform-3",
    userId: "user-1",
    platform: "x",
    status: "disconnected",
  },
  {
    id: "platform-4",
    userId: "user-1",
    platform: "facebook",
    status: "disconnected",
  },
];

export const mockContentPreferences: ContentPreferences = {
  id: "pref-1",
  userId: "user-1",
  weeklyFrequency: "Haftada 3",
  preferredDays: ["Pazartesi", "Çarşamba", "Cuma"],
  preferredTimeRange: "Öğle",
  contentFormats: ["Post", "Carousel", "Reel scripti"],
  weeklyGoal: "Eğitim",
  specialCampaign: "Yaz diyeti önerileri",
  customNotes: "Ramazan ayına özel içerikler de eklenebilir",
};

export const mockWeeklyFlow: WeeklyFlow = {
  id: "flow-1",
  userId: "user-1",
  brandIdentityId: "brand-1",
  status: "completed",
  startedAt: "2026-05-19T09:00:00Z",
  completedAt: "2026-05-19T09:05:00Z",
  contentIdeasCount: 5,
};

export const mockContentIdeas: ContentIdea[] = [
  {
    id: "idea-1",
    weeklyFlowId: "flow-1",
    suggestedDate: "2026-05-26",
    suggestedTime: "12:00",
    platform: "instagram",
    contentFormat: "Carousel",
    contentType: "carousel",
    title: "Metabolizmayı Hızlandıran 5 Besin",
    description:
      "Metabolizma hızını artıran ve kilo kontrolüne yardımcı olan 5 süper besini tanıtan carousel içerik. Bu içerik, takipçilerinize sağlıklı beslenme konusunda değerli bilgiler sunarak etkileşimi artırmak için tasarlandı.",
    trendSource: "Search Trend",
    trendKeyword: "metabolizma hızlandırma",
    trendTopic: "Sağlıklı Beslenme Trendleri 2026",
    hashtags: ["#metabolizma", "#sağlıklıbeslenme", "#diyetisyen", "#kiloverme", "#sağlıklı"],
    targetAudience: "25-45 yaş arası, sağlıklı yaşam ve kilo kontrolüyle ilgilenen kadınlar",
    engagementScore: 87,
    status: "approved",
    createdAt: "2026-05-19T09:02:00Z",
  },
  {
    id: "idea-2",
    weeklyFlowId: "flow-1",
    suggestedDate: "2026-05-28",
    suggestedTime: "12:30",
    platform: "instagram",
    contentFormat: "Post",
    contentType: "post",
    title: "Ofiste Sağlıklı Atıştırmalıklar",
    description:
      "İş yerinde sağlıklı beslenme için pratik atıştırmalık önerileri. Çalışanların gün içinde enerjilerini yüksek tutmalarını sağlayacak besleyici ve pratik seçenekler.",
    trendSource: "Social Trend",
    trendKeyword: "ofis beslenme",
    trendTopic: "İş Yerinde Wellness",
    hashtags: ["#ofisbeslenme", "#sağlıklıofis", "#atıştırmalık", "#işyaşamı", "#sağlık"],
    targetAudience: "Ofis çalışanları, 25-40 yaş arası profesyoneller",
    engagementScore: 72,
    status: "pending",
    createdAt: "2026-05-19T09:02:30Z",
  },
  {
    id: "idea-3",
    weeklyFlowId: "flow-1",
    suggestedDate: "2026-05-30",
    suggestedTime: "11:00",
    platform: "linkedin",
    contentFormat: "Makale",
    contentType: "article",
    title: "Kurumsal Beslenme Programları",
    description:
      "Şirketler için kurumsal beslenme danışmanlığının faydaları hakkında profesyonel içerik. Çalışan sağlığının verimliliğe etkisi ve yatırım getirisi üzerine verilerle desteklenen bir yazı.",
    trendSource: "Apify",
    trendKeyword: "kurumsal sağlık",
    trendTopic: "Kurumsal Wellness Programları",
    hashtags: ["#kurumsalsağlık", "#wellness", "#HR", "#çalışansağlığı", "#işdünyası"],
    targetAudience: "İK yöneticileri, şirket sahipleri ve üretim müdürleri",
    engagementScore: 65,
    status: "pending",
    createdAt: "2026-05-19T09:03:00Z",
  },
  {
    id: "idea-4",
    weeklyFlowId: "flow-1",
    suggestedDate: "2026-05-27",
    suggestedTime: "13:00",
    platform: "instagram",
    contentFormat: "Reel scripti",
    contentType: "reel",
    title: "Diyet Mitleri: Akşam Yemeği",
    description:
      "Akşam yemeği yemenin kilo aldırdığı mitini çürüten eğlenceli ve bilgilendirici reel. Bilimsel verilere dayalı mizahi bir yaklaşımla yaygın yanılgıları düzelten kısa video içeriği.",
    trendSource: "SerpApi",
    trendKeyword: "diyet mitleri",
    trendTopic: "Beslenme Efsaneleri",
    hashtags: ["#diyetmiti", "#sağlıkbilgisi", "#beslenme", "#diyetisyen", "#gerçekler"],
    targetAudience: "Diyet yapan veya kilo kontrolüyle ilgilenen 18-35 yaş arası bireyler",
    engagementScore: 91,
    status: "rejected",
    feedback: "Daha güncel bir konu tercih ediyorum",
    createdAt: "2026-05-19T09:03:30Z",
  },
  {
    id: "idea-5",
    weeklyFlowId: "flow-1",
    suggestedDate: "2026-05-29",
    suggestedTime: "12:00",
    platform: "instagram",
    contentFormat: "Story",
    contentType: "story",
    title: "Haftalık Motivasyon",
    description: "Takipçileri motive eden, sağlıklı yaşam hedeflerini hatırlatan story serisi. Hafta başında enerji veren, hedef odaklı motivasyon içerikleri.",
    trendSource: "Social Trend",
    trendKeyword: "motivasyon",
    trendTopic: "Wellness Motivasyonu",
    hashtags: ["#motivasyon", "#sağlıklıhedefler", "#haftabaşla", "#pozitif", "#sağlık"],
    targetAudience: "Sağlıklı yaşam hedefi olan tüm yaş grupları",
    engagementScore: 78,
    status: "regenerated",
    createdAt: "2026-05-19T09:04:00Z",
  },
];

export const mockGeneratedContent: GeneratedContent = {
  id: "content-1",
  contentIdeaId: "idea-1",
  userId: "mock-user-id",
  weekId: "2026-W21",
  niche: "Beslenme ve Diyetetik",
  platform: "instagram",
  contentType: "carousel",
  text: {
    hook: "Metabolizmanızı hızlandırmak mı istiyorsunuz?",
    caption:
      "Metabolizma hızınızı doğal yollarla artırabilirsiniz! İşte size yardımcı olacak 5 süper besin...",
    body: `1. Yeşil Çay - Antioksidan deposu ve termojenik etkisi ile metabolizmayı hızlandırır.\n2. Biber - Capsaicin içeriği sayesinde kalori yakımını artırır.\n3. Zencefil - Sindirim sistemini destekler ve metabolizmayı canlandırır.\n4. Protein - Sindirimi için daha fazla enerji harcatır (termik etki).\n5. Su - Yeterli su tüketimi metabolizma hızını %30 artırabilir!`,
    cta: "Kişiselleştirilmiş beslenme programı için randevu alın!",
    hashtags: [
      "#metabolizma",
      "#sağlıklıbeslenme",
      "#diyetisyen",
      "#kiloverme",
      "#sağlıklıyaşam",
    ],
    contentNotes: "5 slaytlık carousel önerisi; her slayt için kısa başlık + 1-2 cümle açıklama.",
  },
  visual: {
    prompt:
      "Modern, clean infographic showing 5 metabolism boosting foods: green tea, pepper, ginger, protein sources, and water. Green and white color scheme, minimalist design, professional nutrition content style.",
    designStyle: "Modern minimalist",
    aspectRatio: "4:5",
    imageUrl: "/placeholder-content.jpg",
    canvaUrl: "https://canva.com/design/placeholder",
    provider: "openai",
  },
  textApproved: false,
  visualApproved: false,
  status: "text_generated",
  createdAt: "2026-05-26T10:00:00Z",
  updatedAt: "2026-05-26T10:00:00Z",
};

export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: "scheduled-1",
    generatedContentId: "content-1",
    platform: "instagram",
    scheduledDate: "2026-05-26",
    scheduledTime: "12:00",
    title: "Metabolizmayı Hızlandıran 5 Besin",
    status: "scheduled",
    createdAt: "2026-05-25T15:00:00Z",
  },
  {
    id: "scheduled-2",
    generatedContentId: "content-2",
    platform: "linkedin",
    scheduledDate: "2026-05-27",
    scheduledTime: "10:00",
    title: "Kurumsal Beslenme Danışmanlığı",
    status: "published",
    createdAt: "2026-05-24T14:00:00Z",
  },
  {
    id: "scheduled-3",
    generatedContentId: "content-3",
    platform: "instagram",
    scheduledDate: "2026-05-29",
    scheduledTime: "13:00",
    title: "Sağlıklı Atıştırmalık Fikirleri",
    status: "scheduled",
    createdAt: "2026-05-25T11:00:00Z",
  },
];

export const mockDashboardSummary: DashboardSummary = {
  totalContent: 128,
  pendingApproval: 5,
  thisWeekPlanned: 12,
  connectedPlatforms: 2,
  weeklyFlowStatus: "completed",
  brandProfile: 1,
};

export const mockSettings: Settings = {
  profile: {
    fullName: "Ayşe Yılmaz",
    email: "ayse@example.com",
    profession: "Diyetisyen",
    timezone: "Europe/Istanbul",
    language: "Türkçe",
  },
  security: {
    emailVerified: true,
    twoFactorEnabled: false,
  },
  notifications: {
    weeklySummary: true,
    failedPublishing: true,
    contentApproval: true,
  },
};

export const professionOptions = [
  { value: "diyetisyen", label: "Diyetisyen" },
  { value: "psikolog", label: "Psikolog" },
  { value: "veteriner", label: "Veteriner" },
  { value: "dis-hekimi", label: "Diş Hekimi" },
  { value: "koc-danisman", label: "Koç / Danışman" },
  { value: "klinik", label: "Klinik" },
  { value: "kucuk-isletme", label: "Küçük İşletme" },
  { value: "diger", label: "Diğer" },
];

export const businessTypeOptions = [
  { value: "kisisel-marka", label: "Kişisel Marka" },
  { value: "klinik", label: "Klinik" },
  { value: "sirket", label: "Şirket" },
  { value: "freelancer", label: "Freelancer" },
  { value: "ajans", label: "Ajans" },
];

export const languageOptions = [
  { value: "turkce", label: "Türkçe" },
  { value: "ingilizce", label: "İngilizce" },
];

export const genderFocusOptions = [
  { value: "herkes", label: "Herkes" },
  { value: "cogunlukla-kadin", label: "Çoğunlukla kadın" },
  { value: "cogunlukla-erkek", label: "Çoğunlukla erkek" },
  { value: "belirli-degil", label: "Belirli değil" },
];

export const toneOptions = [
  { value: "profesyonel", label: "Profesyonel" },
  { value: "samimi", label: "Samimi" },
  { value: "egitici", label: "Eğitici" },
  { value: "motive-edici", label: "Motive edici" },
  { value: "premium", label: "Premium" },
  { value: "enerjik", label: "Enerjik" },
  { value: "guven-veren", label: "Güven veren" },
];

export const communicationStyleOptions = [
  { value: "resmi", label: "Resmi" },
  { value: "yari-resmi", label: "Yarı resmi" },
  { value: "samimi", label: "Samimi" },
  { value: "uzman-sade", label: "Uzman ama sade" },
];

export const contentGoalOptions = [
  { value: "bilinirlik", label: "Bilinirlik" },
  { value: "etkilesim", label: "Etkileşim" },
  { value: "randevu", label: "Randevu" },
  { value: "satis", label: "Satış" },
  { value: "egitim", label: "Eğitim" },
  { value: "guven-olusturma", label: "Güven oluşturma" },
];

export const ctaOptions = [
  { value: "randevu-al", label: "Randevu al" },
  { value: "mesaj-gonder", label: "Mesaj gönder" },
  { value: "web-sitesi-ziyaret", label: "Web sitesini ziyaret et" },
  { value: "yorum-yap", label: "Yorum yap" },
  { value: "kaydet", label: "Kaydet" },
  { value: "paylas", label: "Paylaş" },
];

export const visualStyleOptions = [
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Modern" },
  { value: "kurumsal", label: "Kurumsal" },
  { value: "sicak", label: "Sıcak" },
  { value: "dinamik", label: "Dinamik" },
  { value: "premium", label: "Premium" },
];

export const weeklyFrequencyOptions = [
  { value: "haftada-1", label: "Haftada 1" },
  { value: "haftada-2", label: "Haftada 2" },
  { value: "haftada-3", label: "Haftada 3" },
  { value: "haftada-5", label: "Haftada 5" },
  { value: "ozel", label: "Özel" },
];

export const dayOptions = [
  { value: "pazartesi", label: "Pazartesi" },
  { value: "sali", label: "Salı" },
  { value: "carsamba", label: "Çarşamba" },
  { value: "persembe", label: "Perşembe" },
  { value: "cuma", label: "Cuma" },
  { value: "cumartesi", label: "Cumartesi" },
  { value: "pazar", label: "Pazar" },
];

export const timeRangeOptions = [
  { value: "sabah", label: "Sabah (08:00 - 10:00)" },
  { value: "ogle", label: "Öğle (12:00 - 14:00)" },
  { value: "ogleden-sonra", label: "Öğleden sonra (15:00 - 17:00)" },
  { value: "aksam", label: "Akşam (19:00 - 21:00)" },
  { value: "ozel", label: "Özel saat aralığı" },
];

export const contentFormatOptions = [
  { value: "post", label: "Post" },
  { value: "story", label: "Story" },
  { value: "reel-scripti", label: "Reel scripti" },
  { value: "carousel", label: "Carousel" },
  { value: "makale", label: "Makale" },
];

export const nicheSamples = {
  diyetisyen: {
    brandName: "Dyt. Ayşe Yılmaz",
    sector: "Sağlık & Beslenme",
    description: "Bilimsel temelli beslenme danışmanlığı",
    contentIdeas: [
      "Metabolizmayı Hızlandıran 5 Besin",
      "Ofiste Sağlıklı Atıştırmalıklar",
      "Yaz Diyeti İpuçları",
    ],
  },
  psikolog: {
    brandName: "Psk. Mehmet Kaya",
    sector: "Psikoloji & Kişisel Gelişim",
    description: "Bireylere ve çiftlere psikolojik danışmanlık",
    contentIdeas: [
      "Kaygı ile Başa Çıkma Yöntemleri",
      "Sağlıklı İletişim Teknikleri",
      "Öz-bakım Rutinleri",
    ],
  },
  veteriner: {
    brandName: "Vet. Zeynep Demir",
    sector: "Veterinerlik",
    description: "Evcil hayvan sağlığı ve bakımı",
    contentIdeas: [
      "Köpeklerde Aşı Takvimi",
      "Kedilerde Beslenme İpuçları",
      "Yaz Aylarında Evcil Hayvan Bakımı",
    ],
  },
};