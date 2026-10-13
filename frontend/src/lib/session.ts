import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "eventflow_session";
const TTL_SECONDS = 60 * 60 * 8;

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${TTL_SECONDS}s`).sign(key());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL_SECONDS });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let userId: string;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    userId = payload.sub;
  } catch { return null; }
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
}
