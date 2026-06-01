import { NextRequest, NextResponse } from "next/server";
import { oauthConfig, platformInfo, type PlatformId } from "@/lib/oauth-config";
import { cookies } from "next/headers";

// Generate a random state for CSRF protection
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Generate PKCE code verifier and challenge for Twitter
function generatePKCE(): { verifier: string; challenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  // For simplicity, using plain method (S256 requires crypto.subtle which is async)
  return { verifier, challenge: verifier };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get("platform") as PlatformId | null;

  if (!platform || !platformInfo[platform]) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const provider = platformInfo[platform].provider;
  const config = oauthConfig[provider];

  if (!config.clientId) {
    return NextResponse.json(
      { error: `${provider} OAuth not configured. Please set up API credentials.` },
      { status: 500 }
    );
  }

  // State formatı: `${platform}-${randomNonce}`
  // Platform bilgisini state'e encode ederiz — cookie kaybolursa bile
  // callback platform'u state'ten parse edebilir.
  const nonce = generateState();
  const state = `${platform}-${nonce}`;
  const cookieStore = await cookies();

  // Cookie fallback olarak hâlâ tutulur (uyumluluk + CSRF kontrolü)
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600, // 60 dk
    path: "/",   // tüm path'lerde geçerli (callback dahil)
  });

  cookieStore.set("oauth_platform", platform, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/",
  });

  let authUrl: string;

  if (provider === "meta") {
    // Facebook ve Instagram için farklı scope setleri kullan.
    // instagram_basic / instagram_content_publish Facebook bağlantısında
    // /me/accounts API'sini bozuyor — sadece Instagram bağlarken gönder.
    const facebookScopes = [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
    ];
    const instagramScopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
    ];
    const scopes = platform === "instagram" ? instagramScopes : facebookScopes;

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: scopes.join(","),
      response_type: "code",
      state,
      // rerequest: eksik sayfa iznini yeniden ister
      auth_type: "rerequest",
      // enable_profile_selector: sayfa seçim adımını zorla göster
      enable_profile_selector: "true",
    });
    authUrl = `${config.authUrl}?${params.toString()}`;
  } else if (provider === "linkedin") {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(" "),
      response_type: "code",
      state,
    });
    authUrl = `${config.authUrl}?${params.toString()}`;
  } else if (provider === "twitter") {
    const { verifier, challenge } = generatePKCE();
    
    cookieStore.set("oauth_code_verifier", verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(" "),
      response_type: "code",
      state,
      code_challenge: challenge,
      code_challenge_method: "plain",
    });
    authUrl = `${config.authUrl}?${params.toString()}`;
  } else {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}
