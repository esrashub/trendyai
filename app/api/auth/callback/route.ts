import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { oauthConfig } from "@/lib/oauth-config";

const FRONTEND_REDIRECT = "/onboarding/platforms";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
  followers_count?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const platform = cookieStore.get("oauth_platform")?.value || "instagram";

  // Clear OAuth cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_platform");

  // Handle user denial
  if (error || errorReason === "user_denied") {
    return NextResponse.redirect(
      new URL(`${FRONTEND_REDIRECT}?error=access_denied`, request.url)
    );
  }

  // Validate state to prevent CSRF
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL(`${FRONTEND_REDIRECT}?error=invalid_state`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`${FRONTEND_REDIRECT}?error=no_code`, request.url)
    );
  }

  // Meta (Instagram/Facebook) OAuth flow
  if (platform === "instagram" || platform === "facebook") {
    return handleMetaCallback(request, code, platform);
  }

  // Unsupported platform
  return NextResponse.redirect(
    new URL(`${FRONTEND_REDIRECT}?error=unsupported_platform`, request.url)
  );
}

async function handleMetaCallback(
  request: NextRequest,
  code: string,
  platform: string
) {
  const config = oauthConfig.meta;

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          code,
        }).toString()
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("[auth/callback] Token exchange failed:", tokenData.error);
      return NextResponse.redirect(
        new URL(`${FRONTEND_REDIRECT}?error=token_exchange_failed`, request.url)
      );
    }

    const userAccessToken = tokenData.access_token;

    // Step 2: Get long-lived access token (~60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          fb_exchange_token: userAccessToken,
        }).toString()
    );

    const longLivedData = await longLivedResponse.json();
    const longLivedToken = longLivedData.access_token || userAccessToken;
    const expiresIn = longLivedData.expires_in;

    // Step 3: Get user's Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?` +
        new URLSearchParams({
          access_token: longLivedToken,
          fields: "id,name,access_token,instagram_business_account",
        }).toString()
    );

    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        new URL(`${FRONTEND_REDIRECT}?error=no_facebook_page`, request.url)
      );
    }

    // Find a page with Instagram Business Account
    const pageWithInstagram = pagesData.data.find(
      (page: FacebookPage) => page.instagram_business_account?.id
    );

    if (!pageWithInstagram) {
      return NextResponse.redirect(
        new URL(`${FRONTEND_REDIRECT}?error=no_instagram_business`, request.url)
      );
    }

    const instagramAccountId = pageWithInstagram.instagram_business_account.id;
    const pageAccessToken = pageWithInstagram.access_token;
    const pageId = pageWithInstagram.id;

    // Step 4: Get Instagram account details
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}?` +
        new URLSearchParams({
          access_token: pageAccessToken,
          fields: "id,username,profile_picture_url,followers_count",
        }).toString()
    );

    const instagramData: InstagramAccount = await instagramResponse.json();

    // Prepare connection data to send to frontend
    const connectionData = {
      platform: "instagram",
      provider: "meta",
      accountId: instagramAccountId,
      accountName: instagramData.username,
      profilePicture: instagramData.profile_picture_url || "",
      accessToken: longLivedToken,
      pageId: pageId,
      pageAccessToken: pageAccessToken,
      followers: instagramData.followers_count || 0,
      expiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null,
    };

    // Encode connection data as base64 to pass via URL
    const encodedData = Buffer.from(JSON.stringify(connectionData)).toString(
      "base64"
    );

    // Redirect back to frontend with connection data
    return NextResponse.redirect(
      new URL(
        `${FRONTEND_REDIRECT}?connected=instagram&data=${encodedData}`,
        request.url
      )
    );
  } catch (error) {
    console.error("[auth/callback] Meta OAuth Error:", error);
    return NextResponse.redirect(
      new URL(`${FRONTEND_REDIRECT}?error=callback_failed`, request.url)
    );
  }
}
