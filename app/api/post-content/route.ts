import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface PostRequest {
  uid: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduleAt?: string;
}

interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  pageId?: string;
  pageAccessToken?: string;
  accountId: string;
}

interface MetaApiError {
  error?: {
    message: string;
    type?: string;
    code?: number;
  };
}

interface MetaMediaResponse extends MetaApiError {
  id?: string;
}

interface MetaPublishResponse extends MetaApiError {
  id?: string;
}

/**
 * Post to Instagram via Meta Graph API
 * Two-step process:
 * 1. Create media container with image_url and caption
 * 2. Publish the container to Instagram
 */
async function postToInstagram(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accountId, accessToken, pageAccessToken } = credentials;
    const token = pageAccessToken || accessToken;

    if (!mediaUrls || mediaUrls.length === 0) {
      return { success: false, error: "Instagram requires at least one image" };
    }

    if (!accountId || !token) {
      return { success: false, error: "Invalid Instagram credentials" };
    }

    // Step 1: Create media container
    const containerParams = new URLSearchParams({
      image_url: mediaUrls[0],
      caption: content,
      access_token: token,
    });

    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: containerParams.toString(),
      }
    );

    const mediaData: MetaMediaResponse = await mediaResponse.json();

    if (mediaData.error) {
      console.error("[post-content] Container creation failed:", mediaData.error);
      return { success: false, error: mediaData.error.message };
    }

    if (!mediaData.id) {
      return { success: false, error: "Failed to create media container" };
    }

    const creationId = mediaData.id;

    // Step 2: Publish the container
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: token,
    });

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: publishParams.toString(),
      }
    );

    const publishData: MetaPublishResponse = await publishResponse.json();

    if (publishData.error) {
      console.error("[post-content] Publishing failed:", publishData.error);
      return { success: false, error: publishData.error.message };
    }

    if (!publishData.id) {
      return { success: false, error: "Failed to publish post" };
    }

    return { success: true, postId: publishData.id };
  } catch (error) {
    console.error("[post-content] Instagram post error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Post to Facebook Page via Meta Graph API
 */
async function postToFacebook(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { pageId, pageAccessToken, accessToken, accountId } = credentials;
    const targetPageId = pageId || accountId;
    const token = pageAccessToken || accessToken;

    if (!targetPageId || !token) {
      return { success: false, error: "Invalid Facebook credentials" };
    }

    let endpoint: string;
    let params: URLSearchParams;

    if (mediaUrls && mediaUrls.length > 0) {
      // Post with photo
      endpoint = `https://graph.facebook.com/v18.0/${targetPageId}/photos`;
      params = new URLSearchParams({
        url: mediaUrls[0],
        caption: content,
        access_token: token,
      });
    } else {
      // Text-only post
      endpoint = `https://graph.facebook.com/v18.0/${targetPageId}/feed`;
      params = new URLSearchParams({
        message: content,
        access_token: token,
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.error) {
      console.error("[post-content] Facebook post failed:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, postId: data.id || data.post_id };
  } catch (error) {
    console.error("[post-content] Facebook post error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken, accountId } = credentials;

    if (!accessToken || !accountId) {
      return { success: false, error: "Invalid LinkedIn credentials" };
    }

    const postBody: Record<string, unknown> = {
      author: `urn:li:person:${accountId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? "IMAGE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    if (mediaUrls && mediaUrls.length > 0) {
      (postBody.specificContent as Record<string, unknown>)["com.linkedin.ugc.ShareContent"] = {
        shareCommentary: { text: content },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            originalUrl: mediaUrls[0],
          },
        ],
      };
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    const data = await response.json();

    if (response.status >= 400) {
      return { success: false, error: data.message || "LinkedIn API error" };
    }

    return { success: true, postId: data.id };
  } catch (error) {
    console.error("[post-content] LinkedIn post error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Post to X (Twitter)
 */
async function postToTwitter(
  credentials: PlatformCredentials,
  content: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken } = credentials;

    if (!accessToken) {
      return { success: false, error: "Invalid Twitter credentials" };
    }

    const tweetBody = { text: content };

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    const data = await response.json();

    if (data.errors) {
      return { success: false, error: data.errors[0]?.message || "Twitter API error" };
    }

    return { success: true, postId: data.data?.id };
  } catch (error) {
    console.error("[post-content] Twitter post error:", error);
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PostRequest = await request.json();
    const { uid, platform, content, mediaUrls } = body;

    // Validate required fields
    if (!uid || !platform || !content) {
      return NextResponse.json(
        { success: false, error: "uid, platform, and content are required" },
        { status: 400 }
      );
    }

    // Get platform credentials from Firestore using Admin SDK
    const credDoc = await adminDb
      .collection("connectedPlatforms")
      .doc(uid)
      .collection("platforms")
      .doc(platform)
      .get();

    if (!credDoc.exists) {
      return NextResponse.json(
        { success: false, error: `${platform} is not connected` },
        { status: 400 }
      );
    }

    const credData = credDoc.data();
    if (!credData) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials data" },
        { status: 400 }
      );
    }

    const credentials: PlatformCredentials = {
      accessToken: credData.accessToken,
      refreshToken: credData.refreshToken,
      pageId: credData.pageId,
      pageAccessToken: credData.pageAccessToken,
      accountId: credData.accountId,
    };

    let result: { success: boolean; postId?: string; error?: string };

    switch (platform) {
      case "instagram":
        result = await postToInstagram(credentials, content, mediaUrls);
        break;
      case "facebook":
        result = await postToFacebook(credentials, content, mediaUrls);
        break;
      case "linkedin":
        result = await postToLinkedIn(credentials, content, mediaUrls);
        break;
      case "twitter":
        result = await postToTwitter(credentials, content);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported platform: ${platform}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to post content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      platform,
    });
  } catch (error) {
    console.error("[post-content] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
