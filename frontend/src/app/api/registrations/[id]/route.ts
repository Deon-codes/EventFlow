import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { originAllowed } from "@/lib/api-response";
import { dbService } from "@/lib/db-service";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });

  const { id } = await params;
  try {
    const res = await dbService.cancelRegistration(id, user.id);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not cancel registration." }, { status: 404 });
  }
}
