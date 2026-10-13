import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { currentUser } from "@/lib/session";
import { originAllowed } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const contentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { contentType, size } = body as Record<string, unknown>;
  if (typeof contentType !== "string" || !contentTypes.has(contentType) || !Number.isInteger(size) || (size as number) < 1 || (size as number) > 5 * 1024 * 1024) return NextResponse.json({ error: "Choose a JPEG, PNG, or WebP poster no larger than 5 MB." }, { status: 400 });
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) return NextResponse.json({ error: "Poster storage is not configured." }, { status: 503 });
  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.organizerId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "You cannot upload a poster for this event." }, { status: 403 });
  try {
    const ext = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
    const key = `events/${id}/${randomUUID()}.${ext}`;
    const client = new S3Client({ region: process.env.AWS_REGION || "eu-north-1" });
    const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size as number }), { expiresIn: 300 });
    return NextResponse.json({ key, uploadUrl, expiresIn: 300 });
  } catch {
    return NextResponse.json({ error: "Poster upload could not be prepared." }, { status: 503 });
  }
}
