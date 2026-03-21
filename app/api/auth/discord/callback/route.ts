import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
  avatar?: string;
  global_name?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("discord_oauth_state")?.value;

  const redirectWithError = (msg: string) =>
    NextResponse.redirect(
      `${BASE_URL}/auth/callback?error=${encodeURIComponent(msg)}`
    );

  if (error) return redirectWithError(`Discord 錯誤: ${error}`);
  if (!code || !state) return redirectWithError("缺少必要參數");
  if (!storedState || state !== storedState)
    return redirectWithError("CSRF 驗證失敗");

  // Clear state cookie
  cookieStore.delete("discord_oauth_state");

  // Exchange code for Discord access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) return redirectWithError("無法取得 Discord token");

  const tokenData = await tokenRes.json() as { access_token: string };
  const accessToken: string = tokenData.access_token;

  // Fetch Discord user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) return redirectWithError("無法取得 Discord 用戶資訊");

  const discordUser = await userRes.json() as DiscordUser;

  // Find or create Firebase user
  const uid = await upsertFirebaseUser(discordUser);

  // Mint Firebase custom token
  const customToken = await adminAuth.createCustomToken(uid, {
    provider: "discord",
  });

  return NextResponse.redirect(`${BASE_URL}/auth/callback?token=${customToken}`);
}

async function upsertFirebaseUser(discordUser: DiscordUser): Promise<string> {
  const displayName =
    discordUser.global_name ?? discordUser.username;
  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : "";

  // Check if user already exists via discordId
  const existing = await adminDb
    .collection("users")
    .where("discordId", "==", discordUser.id)
    .limit(1)
    .get();

  if (!existing.empty) {
    const uid = existing.docs[0].id;
    await adminDb.doc(`users/${uid}`).update({
      displayName,
      avatarUrl,
      lastSeenAt: FieldValue.serverTimestamp(),
    });
    return uid;
  }

  // Create new Firebase Auth user
  let firebaseUser;
  try {
    firebaseUser = await adminAuth.createUser({
      displayName,
      photoURL: avatarUrl || undefined,
      email: discordUser.email || undefined,
    });
  } catch {
    // If email already exists, fetch that user
    if (discordUser.email) {
      firebaseUser = await adminAuth.getUserByEmail(discordUser.email);
    } else {
      throw new Error("無法建立 Firebase 用戶");
    }
  }

  // Create Firestore user document
  await adminDb.doc(`users/${firebaseUser.uid}`).set({
    displayName,
    email: discordUser.email ?? "",
    avatarUrl,
    provider: "discord",
    discordId: discordUser.id,
    stats: {
      bigTwo: { wins: 0, losses: 0, gamesPlayed: 0 },
      texasHoldem: { wins: 0, losses: 0, chipsWon: 0 },
    },
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
  });

  return firebaseUser.uid;
}
