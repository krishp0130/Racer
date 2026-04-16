import { NextResponse } from "next/server";
import { foundryCookieFlags } from "@/lib/foundryCookieOpts";
import {
  authorizeUrl,
  codeChallengeS256,
  COOKIE_OAUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  generateCodeVerifier,
  generateOAuthState,
  getFoundryOAuthConfig,
} from "@/lib/foundryOauth";

export const runtime = "nodejs";

const PKCE_MAX_AGE = 600;

/**
 * Starts Authorization Code + PKCE (public client). Redirects to Foundry Multipass.
 */
export async function GET(request: Request) {
  let cfg;
  try {
    cfg = getFoundryOAuthConfig();
  } catch {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      `${origin}/matchmaker?oauth=missing`,
      302,
    );
  }
  const verifier = generateCodeVerifier();
  const challenge = codeChallengeS256(verifier);
  const state = generateOAuthState();

  const location = authorizeUrl({
    baseUrl: cfg.baseUrl,
    clientId: cfg.clientId,
    redirectUri: cfg.redirectUri,
    scopes: cfg.scopes,
    codeChallenge: challenge,
    state,
  });

  const res = NextResponse.redirect(location);
  res.cookies.set(COOKIE_PKCE_VERIFIER, verifier, {
    ...foundryCookieFlags,
    maxAge: PKCE_MAX_AGE,
  });
  res.cookies.set(COOKIE_OAUTH_STATE, state, {
    ...foundryCookieFlags,
    maxAge: PKCE_MAX_AGE,
  });
  return res;
}
