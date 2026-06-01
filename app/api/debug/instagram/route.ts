import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("debug_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({
      error: "No access token. First connect Instagram, then visit this page.",
      instructions: "Bu endpoint debug amaçlıdır. Instagram bağlantısını test etmek için kullanılır.",
    });
  }

  try {
    // Get user info
    const meResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`
    );
    const meData = await meResponse.json();

    // Get pages with instagram_business_account
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`
    );
    const accountsData = await accountsResponse.json();

    // If no instagram_business_account in initial response, query each page
    const pagesWithDetails = [];
    if (accountsData.data) {
      for (const page of accountsData.data) {
        const pageResponse = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${page.access_token || accessToken}`
        );
        const pageData = await pageResponse.json();
        pagesWithDetails.push({
          pageId: page.id,
          pageName: page.name,
          hasPageToken: !!page.access_token,
          instagramFromInitial: page.instagram_business_account || null,
          instagramFromPageQuery: pageData.instagram_business_account || null,
          pageQueryError: pageData.error || null,
        });
      }
    }

    return NextResponse.json({
      user: meData,
      accountsResponse: {
        pageCount: accountsData.data?.length || 0,
        error: accountsData.error || null,
      },
      pages: pagesWithDetails,
      rawAccountsData: accountsData,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Request failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
