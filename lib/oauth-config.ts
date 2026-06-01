// OAuth Configuration for Social Media Platforms

export const oauthConfig = {
  // Meta (Instagram & Facebook)
  meta: {
    clientId: process.env.META_APP_ID || "",
    clientSecret: process.env.META_APP_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/meta`,
    scopes: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
    ],
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
  },

  // LinkedIn
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/linkedin`,
    scopes: ["openid", "profile", "email", "w_member_social"],
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
  },

  // X (Twitter)
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/twitter`,
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
  },
};

export type OAuthProvider = "meta" | "linkedin" | "twitter";

// Platform display info
export const platformInfo: Record<string, {
  id: string;
  name: string;
  color: string;
  provider: OAuthProvider;
}> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    provider: "meta",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    provider: "meta",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    provider: "linkedin",
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    color: "#000000",
    provider: "twitter",
  },
};

export type PlatformId = keyof typeof platformInfo;
