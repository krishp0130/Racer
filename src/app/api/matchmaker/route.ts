/**
 * Matchmaker proxy: **OSDK Platform client** uses the **user’s OAuth access token**
 * (public client, Authorization Code + PKCE). Token is read from an HttpOnly cookie set
 * by `/auth/callback` — no client secret.
 *
 * Sign in: `GET /auth/signin` → Foundry → `GET /auth/callback` → cookies → this route.
 */
import { PalantirApiError } from "@osdk/client";
import { AipAgents } from "@osdk/foundry";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { foundryCookieFlags } from "@/lib/foundryCookieOpts";
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  exchangeRefreshToken,
  getFoundryOAuthConfig,
  isFoundryOAuthConfigured,
} from "@/lib/foundryOauth";
import { getAipAgentRid } from "@/lib/aipAgentConfig";
import { createFoundryPlatformClientWithToken } from "@/lib/foundryServerAuth";

export const runtime = "nodejs";

type Body = {
  message?: string;
  sessionRid?: string;
};

/**
 * Lightweight config probe (no Foundry call). Use to verify agent RID + env in dev.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    agentRid: getAipAgentRid(),
    foundryUrlSet: Boolean(process.env.FOUNDRY_URL?.trim()),
    foundryOAuthReady: isFoundryOAuthConfigured(),
  });
}

async function resolveAccessToken(): Promise<{
  token: string;
  stampCookies: (res: NextResponse) => void;
} | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(COOKIE_ACCESS)?.value?.trim();
  if (access) {
    return {
      token: access,
      stampCookies: () => {},
    };
  }

  const refresh = cookieStore.get(COOKIE_REFRESH)?.value?.trim();
  if (!refresh) return null;

  try {
    const cfg = getFoundryOAuthConfig();
    const tokens = await exchangeRefreshToken({
      baseUrl: cfg.baseUrl,
      clientId: cfg.clientId,
      refreshToken: refresh,
    });

    const accessMax = Math.min(
      Math.max(60, tokens.expires_in ?? 3600),
      60 * 60 * 24,
    );
    const refreshMax = 60 * 60 * 24 * 30;

    return {
      token: tokens.access_token,
      stampCookies(res) {
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
      },
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.message?.trim();
  if (!text) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const agentRid = getAipAgentRid() as AipAgents.AgentRid;

  const auth = await resolveAccessToken();

  if (!auth?.token) {
    return NextResponse.json(
      {
        error: "not_authenticated",
        description:
          "Sign in with Foundry (public client + PKCE). Visit /auth/signin in this browser.",
        signInPath: "/auth/signin",
      },
      { status: 401 },
    );
  }

  try {
    const client = createFoundryPlatformClientWithToken(auth.token);

    let sessionRid = body.sessionRid as AipAgents.SessionRid | undefined;

    if (!sessionRid) {
      const session = await AipAgents.Sessions.create(client, agentRid, {});
      sessionRid = session.rid;
    }

    const sessionTraceId = randomUUID() as AipAgents.SessionTraceId;

    const result = await AipAgents.Sessions.blockingContinue(
      client,
      agentRid,
      sessionRid,
      {
        userInput: { text },
        parameterInputs: {},
        sessionTraceId,
      },
    );

    const reply = String(result.agentMarkdownResponse ?? "");

    const res = NextResponse.json({
      reply,
      sessionRid,
      sessionTraceId: result.sessionTraceId,
      interruptedOutput: result.interruptedOutput,
    });

    auth.stampCookies(res);
    return res;
  } catch (e) {
    if (e instanceof PalantirApiError) {
      const code =
        e.statusCode != null && e.statusCode >= 400 && e.statusCode < 600
          ? e.statusCode
          : 502;
      return NextResponse.json(
        {
          error: e.errorName ?? "PalantirApiError",
          description: e.errorDescription ?? e.message,
        },
        { status: code },
      );
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[matchmaker]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
