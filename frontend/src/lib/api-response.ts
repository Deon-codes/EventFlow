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

export function originAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
