import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";

export async function GET() {
  const user = await currentUser();
  return user ? NextResponse.json({ user }) : NextResponse.json({ user: null }, { status: 401 });
}
