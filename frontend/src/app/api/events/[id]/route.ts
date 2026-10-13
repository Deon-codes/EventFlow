import { NextResponse } from "next/server";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!id || id.length > 128) return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.status !== EventStatus.PUBLISHED) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const registered = await prisma.registration.count({ where: { eventId: id, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } } });
    return NextResponse.json({ ...event, registered });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const location = typeof input.location === "string" ? input.location.trim() : "";
  const startsAt = typeof input.startsAt === "string" ? new Date(input.startsAt) : new Date(NaN);
  const endsAt = typeof input.endsAt === "string" ? new Date(input.endsAt) : new Date(NaN);
  const capacity = input.capacity;
  const status = input.status === "published" ? EventStatus.PUBLISHED : input.status === "draft" ? EventStatus.DRAFT : null;
  if (!title || title.length > 160 || !description || description.length > 12000 || !category || category.length > 80 || !location || location.length > 200 || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt || !Number.isInteger(capacity) || (capacity as number) < 1 || (capacity as number) > 100000 || !status) return NextResponse.json({ error: "Event fields are invalid." }, { status: 400 });
  try {
    const existing = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
    if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (existing.organizerId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "You cannot edit this event." }, { status: 403 });
    const posterKey = input.posterKey;
    if (posterKey !== undefined && (typeof posterKey !== "string" || !posterKey.startsWith(`events/${id}/`) || posterKey.includes(".."))) return NextResponse.json({ error: "Invalid poster object key." }, { status: 400 });
    if (typeof posterKey === "string") {
      const bucket = process.env.S3_BUCKET_NAME;
      if (!bucket) return NextResponse.json({ error: "Poster storage is not configured." }, { status: 503 });
      const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-north-1" });
      const metadata = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: posterKey }));
      if (!metadata.ContentLength || metadata.ContentLength > 5 * 1024 * 1024 || !metadata.ContentType || !["image/jpeg", "image/png", "image/webp"].includes(metadata.ContentType)) return NextResponse.json({ error: "Uploaded poster type or size is not allowed." }, { status: 400 });
      const stored = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: posterKey, Range: "bytes=0-11" }));
      const bytes = Buffer.from(await stored.Body?.transformToByteArray() ?? []);
      const valid = metadata.ContentType === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : metadata.ContentType === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
      if (!valid) return NextResponse.json({ error: "Poster contents do not match the selected image type." }, { status: 400 });
    }
    const event = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Event" WHERE "id" = ${id} FOR UPDATE`;
      const activeCount = await tx.registration.count({ where: { eventId: id, status: { in: ["REGISTERED", "CHECKED_IN"] } } });
      if ((capacity as number) < activeCount) throw new Error("CAPACITY_BELOW_ACTIVE_REGISTRATIONS");
      return tx.event.update({ where: { id }, data: { title, description, category, location, startsAt, endsAt, capacity: capacity as number, status, ...(typeof posterKey === "string" ? { posterUrl: posterKey } : {}) } });
    });
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof Error && error.message === "CAPACITY_BELOW_ACTIVE_REGISTRATIONS") return NextResponse.json({ error: "Capacity cannot be lower than the current active registrations." }, { status: 409 });
    return apiError(error);
  }
}
