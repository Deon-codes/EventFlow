import { NextResponse } from "next/server";
import { RegistrationStatus } from "@prisma/client";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  const { id } = await params;
  try {
    const result = await prisma.registration.updateMany({ where: { id, userId: user.id, status: RegistrationStatus.REGISTERED }, data: { status: RegistrationStatus.CANCELLED } });
    return result.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Active registration not found." }, { status: 404 });
  } catch (error) { return apiError(error); }
}
