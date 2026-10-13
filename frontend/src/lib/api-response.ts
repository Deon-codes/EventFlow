import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function apiError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "This record already exists." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "The requested record was not found." }, { status: 404 });
  }
  console.error("API request failed", error instanceof Error ? error.name : "unknown error");
  return NextResponse.json({ error: "The request could not be completed." }, { status: 500 });
}

export const unauthenticated = () => NextResponse.json({ error: "Sign-in is required." }, { status: 401 });

export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!origin) {
    // Check referer or sec-fetch-site if origin header is omitted in same-origin fetch
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refUrl = new URL(referer);
        const reqUrl = new URL(request.url);
        if (refUrl.origin === reqUrl.origin) return true;
        if (host && (refUrl.host === host)) return true;
        const isRefLocal = refUrl.hostname === "localhost" || refUrl.hostname === "127.0.0.1";
        const isReqLocal = reqUrl.hostname === "localhost" || reqUrl.hostname === "127.0.0.1";
        if (isRefLocal && isReqLocal) return true;
      } catch {}
    }
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite === "same-origin" || secFetchSite === "none") return true;
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const reqUrl = new URL(request.url);

    // Direct match
    if (originUrl.origin === reqUrl.origin) return true;

    // Check against Host header
    if (host) {
      if (originUrl.host === host) return true;
      const proto = request.headers.get("x-forwarded-proto") || reqUrl.protocol.replace(":", "");
      if (originUrl.origin === `${proto}://${host}`) return true;
    }

    // Local development loopback (e.g. localhost:3000 vs 127.0.0.1:3000)
    const isOriginLocal = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
    const isReqLocal = reqUrl.hostname === "localhost" || reqUrl.hostname === "127.0.0.1" || (host && (host.startsWith("localhost") || host.startsWith("127.0.0.1")));
    if (isOriginLocal && isReqLocal) {
      const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");
      const reqPort = reqUrl.port || (reqUrl.protocol === "https:" ? "443" : "80");
      if (originPort === reqPort) return true;
    }
  } catch {}

  return false;
}
