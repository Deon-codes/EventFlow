import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });

  try {
    const rows = await dbService.getStudentRegistrations(user.id);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json({ error: "Could not retrieve registrations." }, { status: 500 });
  }
}
