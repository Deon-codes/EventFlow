import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  try {
    const rows = await prisma.registration.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, ticketCode: true, status: true, createdAt: true, checkedInAt: true, event: { select: { id: true, title: true, category: true, location: true, startsAt: true, endsAt: true, posterUrl: true } } } });
    return NextResponse.json(rows);
  } catch (error) { return apiError(error); }
}
