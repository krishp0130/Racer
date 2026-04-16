import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/foundryOauth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/radar", url.origin).toString());
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
  return res;
}
