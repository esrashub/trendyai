import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

// Post to Instagram (via Meta Graph API)
async function postToInstagram(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accountId, accessToken, pageAccessToken } = credentials;
    const token = pageAccessToken || accessToken;

    if (!mediaUrls || mediaUrls.length === 0) {
      // Text-only posts not supported on Instagram, need media
      return { success: false, error: "Instagram requires at least one image" };
    }

    // Step 1: Create media container
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: mediaUrls[0],
          caption: content,
          access_token: token,
        }),
      }
    );
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      return { success: false, error: mediaData.error.message };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: token,
        }),
      }
    );
    const publishData = await publishResponse.json();

    if (publishData.error) {
      return { success: false, error: publishData.error.message };
    }

    return { success: true, postId: publishData.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Post to Facebook Page
async function postToFacebook(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { pageId, pageAccessToken, accessToken, accountId } = credentials;
    const targetPageId = pageId || accountId;
    const token = pageAccessToken || accessToken;

    let endpoint: string;
    let body: Record<string, string | string[]>;

    if (mediaUrls && mediaUrls.length > 0) {
      // Post with photo
      endpoint = `https://graph.facebook.com/v21.0/${targetPageId}/photos`;
      body = {
        url: mediaUrls[0],
        caption: content,
        access_token: token,
      };
    } else {
      // Text-only post
      endpoint = `https://graph.facebook.com/v21.0/${targetPageId}/feed`;
      body = {
        message: content,
        access_token: token,
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, postId: data.id || data.post_id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Post to LinkedIn
async function postToLinkedIn(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken, accountId } = credentials;

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

    // If there are images, we need to upload them first
    if (mediaUrls && mediaUrls.length > 0) {
      // For simplicity, using article share with image URL
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
    return { success: false, error: String(error) };
  }
}

// Post to X (Twitter)
async function postToTwitter(
  credentials: PlatformCredentials,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken } = credentials;

    // Twitter API v2 - text only for now
    // Media upload requires additional steps
    const tweetBody: Record<string, unknown> = {
      text: content,
    };

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
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PostRequest = await request.json();
    const { uid, platform, content, mediaUrls } = body;

    if (!uid || !platform || !content) {
      return NextResponse.json(
        { error: "uid, platform, and content are required" },
        { status: 400 }
      );
    }

    // Get platform credentials from Firestore
    const credSnap = await getDoc(
      doc(db, "connectedPlatforms", uid, "platforms", platform)
    );

    if (!credSnap.exists()) {
      return NextResponse.json(
        { error: `${platform} is not connected` },
        { status: 400 }
      );
    }

    const credentials: PlatformCredentials = {
      accessToken: credSnap.data().accessToken,
      refreshToken: credSnap.data().refreshToken,
      pageId: credSnap.data().pageId,
      pageAccessToken: credSnap.data().pageAccessToken,
      accountId: credSnap.data().accountId,
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
        result = await postToTwitter(credentials, content, mediaUrls);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported platform: ${platform}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to post" },
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
