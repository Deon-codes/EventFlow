import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbService } from "@/lib/db-service";

const COOKIE = "eventflow_session";
const TTL_SECONDS = 60 * 60 * 8;

const DEFAULT_DEV_SECRET = "default_development_session_secret_at_least_32_chars";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!secret || secret.trim() === "" || secret === DEFAULT_DEV_SECRET) {
    if (isProd) {
      throw new Error("SESSION_SECRET must be configured with a secure key (at least 32 characters) in production.");
    }
    return DEFAULT_DEV_SECRET;
  }

  if (secret.length < 32) {
    if (isProd) {
      throw new Error("SESSION_SECRET must be at least 32 characters long in production.");
    }
  }

  return secret;
}

function key() {
  return new TextEncoder().encode(getSessionSecret());
}

export function isSecureCookie(): boolean {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === "true";
  }
  return process.env.NODE_ENV === "production";
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
};

export async function createSession(userOrId: string | SessionUser) {
  let sub: string;
  let role: string = "STUDENT";
  let name: string = "";
  let email: string = "";

  if (typeof userOrId === "string") {
    sub = userOrId;
    const user = await dbService.findUserById(userOrId);
    if (user) {
      role = user.role;
      name = user.name;
      email = user.email;
    }
  } else {
    sub = userOrId.id;
    role = userOrId.role;
    name = userOrId.name;
    email = userOrId.email;
  }

  const token = await new SignJWT({ sub, role, name, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(key());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function currentUser(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;

    const dbUser = await dbService.findUserById(payload.sub).catch(() => null);
    if (dbUser) {
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as SessionUser["role"],
      };
    }

    // Fallback to verified JWT claims if db is temporarily slow
    if (payload.sub && payload.email) {
      return {
        id: payload.sub,
        name: (payload.name as string) || "Campus User",
        email: payload.email as string,
        role: ((payload.role as string) || "STUDENT") as SessionUser["role"],
      };
    }
    return null;
  } catch {
    return null;
  }
}
