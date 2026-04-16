import { createPlatformClient } from "@osdk/client";
import type { PlatformClient } from "@osdk/client";

function trimBase(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Platform client for the **logged-in user**: bearer token from OAuth (PKCE) cookies.
 * No client secret — public SPA / Next.js pattern.
 */
export function createFoundryPlatformClientWithToken(
  accessToken: string,
): PlatformClient {
  const base = process.env.FOUNDRY_URL?.trim();
  if (!base) {
    throw new Error("FOUNDRY_URL is not set.");
  }
  const normalized = trimBase(base);
  const token = accessToken.trim();
  if (!token) {
    throw new Error("Missing access token.");
  }
  return createPlatformClient(normalized, async () => token);
}
