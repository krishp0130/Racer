import { NextRequest, NextResponse } from "next/server";
import { foundryCookieFlags } from "@/lib/foundryCookieOpts";
import {
  COOKIE_ACCESS,
  COOKIE_OAUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  COOKIE_REFRESH,
  exchangeAuthorizationCode,
  getFoundryOAuthConfig,
} from "@/lib/foundryOauth";

export const runtime = "nodejs";

/**
 * OAuth redirect_uri handler: exchanges `code` + PKCE verifier for tokens (public client).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const desc = url.searchParams.get("error_description");

  const failRedirect = (msg: string) =>
    NextResponse.redirect(
      new URL(
        `/radar?auth_error=${encodeURIComponent(msg)}`,
        url.origin,
      ).toString(),
    );

  if (oauthError) {
    return failRedirect(desc || oauthError);
  }

  if (!code || !state) {
    return failRedirect("missing_code_or_state");
  }

  const storedState = req.cookies.get(COOKIE_OAUTH_STATE)?.value;
  const verifier = req.cookies.get(COOKIE_PKCE_VERIFIER)?.value;

  if (!storedState || !verifier || state !== storedState) {
    return failRedirect("invalid_state");
  }

  let cfg: ReturnType<typeof getFoundryOAuthConfig>;
  try {
    cfg = getFoundryOAuthConfig();
  } catch {
    return failRedirect("oauth_not_configured");
  }

  let tokens: Awaited<ReturnType<typeof exchangeAuthorizationCode>>;
  try {
    tokens = await exchangeAuthorizationCode({
      baseUrl: cfg.baseUrl,
      clientId: cfg.clientId,
      redirectUri: cfg.redirectUri,
      code,
      codeVerifier: verifier,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "token_exchange_failed";
    return failRedirect(msg.slice(0, 200));
  }

  const accessMax = Math.min(
    Math.max(60, tokens.expires_in ?? 3600),
    60 * 60 * 24,
  );
  const refreshMax = 60 * 60 * 24 * 30;

  const res = NextResponse.redirect(new URL("/radar?auth=ok", url.origin).toString());
  res.cookies.set(COOKIE_ACCESS, tokens.access_token, {
    ...foundryCookieFlags,
    maxAge: accessMax,
  });
  if (tokens.refresh_token) {
    res.cookies.set(COOKIE_REFRESH, tokens.refresh_token, {
      ...foundryCookieFlags,
      maxAge: refreshMax,
    });
  }
  res.cookies.delete(COOKIE_PKCE_VERIFIER);
  res.cookies.delete(COOKIE_OAUTH_STATE);
  return res;
}
