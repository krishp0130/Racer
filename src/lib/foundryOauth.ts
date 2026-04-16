import { createHash, randomBytes } from "node:crypto";

/** HttpOnly cookies used for public-client (PKCE) OAuth. */
export const COOKIE_ACCESS = "foundry_access_token";
export const COOKIE_REFRESH = "foundry_refresh_token";
export const COOKIE_PKCE_VERIFIER = "foundry_pkce_verifier";
export const COOKIE_OAUTH_STATE = "foundry_oauth_state";

export function trimFoundryBase(url: string): string {
  return url.replace(/\/+$/, "");
}

export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function codeChallengeS256(verifier: string): string {
  return createHash("sha256").update(verifier, "utf8").digest("base64url");
}

export function generateOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

/** True when `.env` has both stack URL and OAuth client id (required for PKCE sign-in). */
export function isFoundryOAuthConfigured(): boolean {
  return Boolean(
    process.env.FOUNDRY_URL?.trim() && process.env.FOUNDRY_CLIENT_ID?.trim(),
  );
}

export function getFoundryOAuthConfig(): {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
} {
  const baseUrl = process.env.FOUNDRY_URL?.trim();
  const clientId = process.env.FOUNDRY_CLIENT_ID?.trim();
  const redirectUri =
    process.env.FOUNDRY_REDIRECT_URI?.trim() ||
    "http://localhost:3000/auth/callback";
  const scopes =
    process.env.FOUNDRY_OAUTH_SCOPES?.trim() ||
    "offline_access api:aip-agents-read api:aip-agents-write";

  if (!baseUrl || !clientId) {
    throw new Error(
      "FOUNDRY_URL and FOUNDRY_CLIENT_ID must be set for Foundry OAuth.",
    );
  }

  return {
    baseUrl: trimFoundryBase(baseUrl),
    clientId,
    redirectUri,
    scopes,
  };
}

export function authorizeUrl(params: {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
  codeChallenge: string;
  state: string;
}): string {
  const u = new URL(`${params.baseUrl}/multipass/api/oauth2/authorize`);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("scope", params.scopes);
  u.searchParams.set("code_challenge", params.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  u.searchParams.set("state", params.state);
  return u.toString();
}

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export async function exchangeAuthorizationCode(params: {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const tokenUrl = `${params.baseUrl}/multipass/api/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Token exchange failed (${res.status}): ${t.slice(0, 800)}`,
    );
  }

  return (await res.json()) as TokenResponse;
}

export async function exchangeRefreshToken(params: {
  baseUrl: string;
  clientId: string;
  refreshToken: string;
}): Promise<TokenResponse> {
  const tokenUrl = `${params.baseUrl}/multipass/api/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: params.clientId,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Refresh token failed (${res.status}): ${t.slice(0, 800)}`,
    );
  }

  return (await res.json()) as TokenResponse;
}
