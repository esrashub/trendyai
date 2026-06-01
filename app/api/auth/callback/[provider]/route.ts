import { NextRequest, NextResponse } from "next/server";
import { oauthConfig } from "@/lib/oauth-config";
import { cookies } from "next/headers";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("[OAuth Callback] Provider:", provider);
  console.log("[OAuth Callback] State:", state);
  console.log("[OAuth Callback] Code exists:", !!code);
  console.log("[OAuth Callback] Error:", error);

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const cookiePlatform = cookieStore.get("oauth_platform")?.value;
  const codeVerifier = cookieStore.get("oauth_code_verifier")?.value;

  console.log("[OAuth Callback] Stored state cookie:", storedState);
  console.log("[OAuth Callback] Platform cookie:", cookiePlatform);

  // Platform'u state'ten parse et (cookie kaybolursa fallback).
  // State formatı: `${platform}-${nonce}` — connect route'unda set edildi.
  const platformFromState = state?.includes("-")
    ? state.split("-")[0]
    : undefined;
  const platform = platformFromState || cookiePlatform;
  
  console.log("[OAuth Callback] Platform from state:", platformFromState);
  console.log("[OAuth Callback] Final platform:", platform);

  // Clean up cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_platform");
  cookieStore.delete("oauth_code_verifier");

  // Error from provider
  if (error) {
    console.error(`[OAuth] Error from ${provider}:`, error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=${encodeURIComponent(error)}`
    );
  }

  // Validate state
  // Cookie-based CSRF check: if cookie exists, require exact match.
  // If cookie is missing (common in Vercel/browser cross-site redirect scenarios),
  // fall back to format validation — state must be "${platform}-{32+ char nonce}".
  if (!state) {
    console.error("[OAuth] No state parameter received");
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=invalid_state`
    );
  }

  if (storedState) {
    // Cookie present → strict match required
    if (state !== storedState) {
      console.error("[OAuth] State mismatch (cookie present but differs)");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=invalid_state`
      );
    }
  } else {
    // Cookie missing (Vercel edge / browser cross-site cookie issue) → validate format
    console.warn("[OAuth] State cookie missing, falling back to format validation");
    const validPlatforms = ["instagram", "facebook", "linkedin", "twitter"];
    const noncePart = platformFromState ? state.slice(platformFromState.length + 1) : "";
    if (
      !platformFromState ||
      !validPlatforms.includes(platformFromState) ||
      noncePart.length < 32
    ) {
      console.error("[OAuth] State format invalid (no cookie fallback failed)");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=invalid_state`
      );
    }
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=no_code`
    );
  }

  const config = oauthConfig[provider as keyof typeof oauthConfig];
  if (!config) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=invalid_provider`
    );
  }

  try {
    // Exchange code for access token
    let tokenData: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (provider === "meta") {
      const tokenParams = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code,
      });

      console.log("[OAuth/Meta] Token request redirect_uri:", config.redirectUri);

      const tokenResponse = await fetch(`${config.tokenUrl}?${tokenParams.toString()}`);
      tokenData = await tokenResponse.json();

      console.log("[OAuth/Meta] Token response status:", tokenResponse.status);
      console.log("[OAuth/Meta] Token response:", JSON.stringify(tokenData, null, 2));

      if (!tokenData.access_token) {
        throw new Error("No access token received from Meta");
      }

      // Exchange for long-lived token
      const longLivedParams = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: tokenData.access_token,
      });

      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?${longLivedParams.toString()}`
      );
      const longLivedData = await longLivedResponse.json();
      
      if (longLivedData.access_token) {
        tokenData.access_token = longLivedData.access_token;
        tokenData.expires_in = longLivedData.expires_in;
      }
    } else if (provider === "linkedin") {
      const tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });
      tokenData = await tokenResponse.json();
    } else if (provider === "twitter") {
      const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
      
      const tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
          code_verifier: codeVerifier || "",
        }),
      });
      tokenData = await tokenResponse.json();
    } else {
      throw new Error("Invalid provider");
    }

    if (!tokenData.access_token) {
      console.error("[OAuth] Token exchange failed:", tokenData);
      throw new Error("Failed to obtain access token");
    }

    // Get user info and page/account info based on platform
    let accountInfo: {
      accountId: string;
      accountName: string;
      profilePicture?: string;
      pageId?: string;
      pageAccessToken?: string;
    };

    if (provider === "meta") {
      // Get user info
      const meResponse = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name,picture&access_token=${tokenData.access_token}`
      );
      const meData = await meResponse.json();

      if (platform === "instagram") {
        // Get Instagram Business Account
        const accountsResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${tokenData.access_token}`
        );
        const accountsData = await accountsResponse.json();
        
        const pageWithInstagram = accountsData.data?.find(
          (page: { instagram_business_account?: { id: string } }) => page.instagram_business_account
        );

        if (!pageWithInstagram?.instagram_business_account) {
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=no_instagram_business`
          );
        }

        accountInfo = {
          accountId: pageWithInstagram.instagram_business_account.id,
          accountName: pageWithInstagram.instagram_business_account.username || meData.name,
          profilePicture: pageWithInstagram.instagram_business_account.profile_picture_url,
          pageId: pageWithInstagram.id,
        };
      } else {
        // Facebook Page
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,picture,access_token&access_token=${tokenData.access_token}`
        );
        const pagesData = await pagesResponse.json();

        console.log("[OAuth/Facebook] /me/accounts response:", JSON.stringify({
          pageCount: pagesData.data?.length ?? 0,
          error: pagesData.error ?? null,
          paging: pagesData.paging ?? null,
        }));

        if (pagesData.error) {
          console.error("[OAuth/Facebook] API error:", pagesData.error);
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=facebook_api_error`
          );
        }

        const firstPage = pagesData.data?.[0];
        if (!firstPage) {
          console.warn("[OAuth/Facebook] No pages returned. Token scopes may lack pages_show_list or no page was selected.");
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=no_facebook_page`
          );
        }

        accountInfo = {
          accountId: firstPage.id,
          accountName: firstPage.name,
          profilePicture: firstPage.picture?.data?.url,
          pageAccessToken: firstPage.access_token,
        };
      }
    } else if (provider === "linkedin") {
      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      const profileData = await profileResponse.json();

      accountInfo = {
        accountId: profileData.sub,
        accountName: profileData.name || `${profileData.given_name} ${profileData.family_name}`,
        profilePicture: profileData.picture,
      };
    } else {
      // Twitter
      const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      const userData = await userResponse.json();

      accountInfo = {
        accountId: userData.data?.id,
        accountName: userData.data?.username || userData.data?.name,
        profilePicture: userData.data?.profile_image_url,
      };
    }

    // Return connection data as a message to the opener window
    const connectionData = {
      platform,
      provider,
      accountId: accountInfo.accountId,
      accountName: accountInfo.accountName,
      profilePicture: accountInfo.profilePicture,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      pageId: accountInfo.pageId,
      pageAccessToken: accountInfo.pageAccessToken,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      connectedAt: new Date().toISOString(),
    };

    // Redirect back with success
    const successUrl = new URL(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms`
    );
    successUrl.searchParams.set("connected", platform || "");
    successUrl.searchParams.set("data", btoa(JSON.stringify(connectionData)));

    return NextResponse.redirect(successUrl.toString());
  } catch (err) {
    console.error(`[OAuth] Error exchanging code for ${provider}:`, err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/platforms?error=token_exchange_failed`
    );
  }
}
