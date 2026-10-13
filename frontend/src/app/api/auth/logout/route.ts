import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
import { originAllowed } from "@/lib/api-response";

export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  await clearSession();
  return NextResponse.json({ ok: true });
}
