import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { EventStatus } from "@prisma/client";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { posterUrl: true, status: true, organizerId: true } });
  if (!event?.posterUrl) return NextResponse.json({ error: "Poster not found." }, { status: 404 });
  if (event.status !== EventStatus.PUBLISHED) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
    if (user.role !== "ADMIN" && event.organizerId !== user.id) return NextResponse.json({ error: "You cannot view this poster." }, { status: 403 });
  }
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) return NextResponse.json({ error: "Poster storage is not configured." }, { status: 503 });
  try {
    const client = new S3Client({ region: process.env.AWS_REGION || "eu-north-1" });
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: event.posterUrl }), { expiresIn: 300 });
    return NextResponse.json({ url, expiresIn: 300 });
  } catch { return NextResponse.json({ error: "Poster could not be retrieved." }, { status: 503 }); }
}
