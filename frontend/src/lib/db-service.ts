import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { MOCK_EVENTS, CURRENT_STUDENT, CURRENT_ORGANIZER } from "@/lib/mock-data";
import type { CampusEvent } from "@/types";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  createdAt: string;
};

export type StoredEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  posterUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  registered?: number;
};

export type StoredRegistration = {
  id: string;
  userId: string;
  eventId: string;
  ticketCode: string;
  status: "REGISTERED" | "CANCELLED" | "CHECKED_IN";
  checkedInAt: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  event?: StoredEvent;
};

type StoreData = {
  users: StoredUser[];
  events: StoredEvent[];
  registrations: StoredRegistration[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

// Hashes for: Student@123 and Organizer@123
const DEFAULT_STUDENT_HASH = "$2b$10$nWYXeAPnapj0M0p2aeH4A.dOHprmon1kbXs61Il/KmAUAHTQGKlSe";
const DEFAULT_ORGANIZER_HASH = "$2b$10$mlPi1OHK3YvPZDX8pptJL.silJQBXCjjshlNlU6s.sj/1U7v7DIs6";

function getInitialStore(): StoreData {
  const users: StoredUser[] = [
    {
      id: CURRENT_STUDENT.id,
      name: CURRENT_STUDENT.name,
      email: CURRENT_STUDENT.email.toLowerCase(),
      passwordHash: DEFAULT_STUDENT_HASH,
      role: "STUDENT",
      createdAt: new Date().toISOString(),
    },
    {
      id: CURRENT_ORGANIZER.id,
      name: CURRENT_ORGANIZER.name,
      email: "organizer@campus.edu",
      passwordHash: DEFAULT_ORGANIZER_HASH,
      role: "ORGANIZER",
      createdAt: new Date().toISOString(),
    },
  ];

  const events: StoredEvent[] = MOCK_EVENTS.map((e: CampusEvent) => ({
    id: e.id,
    title: e.title,
    description: Array.isArray(e.description) ? e.description.join("\n\n") : (e.summary || e.title),
    category: e.category,
    location: e.venue,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    capacity: e.capacity,
    posterUrl: null,
    status: (e.status === "draft" ? "DRAFT" : e.status === "cancelled" ? "CANCELLED" : "PUBLISHED") as any,
    organizerId: e.organizerId || CURRENT_ORGANIZER.id,
    createdAt: e.createdAt,
    updatedAt: e.createdAt,
    registered: e.registered || 0,
  }));

  const registrations: StoredRegistration[] = [
    {
      id: "reg-seed-1",
      userId: CURRENT_STUDENT.id,
      eventId: MOCK_EVENTS[0].id,
      ticketCode: "TKT-CS-78210",
      status: "REGISTERED",
      checkedInAt: null,
      createdAt: new Date().toISOString(),
    },
  ];

  return { users, events, registrations };
}

function loadLocalStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial = getInitialStore();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Local store read error, resetting:", err);
    return getInitialStore();
  }
}

function saveLocalStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Local store write error:", err);
  }
}

function shouldUsePrisma(): boolean {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be configured in production.");
    }
    return true;
  }
  if (process.env.USE_LOCAL_STORE === "true") {
    return false;
  }
  return Boolean(process.env.DATABASE_URL);
}

export const dbService = {
  async findUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (shouldUsePrisma()) {
      return await prisma.user.findFirst({
        where: { email: { equals: normalized, mode: "insensitive" } },
        select: { id: true, name: true, email: true, role: true, passwordHash: true },
      });
    }
    const store = loadLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string) {
    if (shouldUsePrisma()) {
      return await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true },
      });
    }
    const store = loadLocalStore();
    const u = store.users.find((u) => u.id === id);
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, role: u.role };
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role: "STUDENT" | "ORGANIZER" }) {
    const normalized = data.email.trim().toLowerCase();
    if (shouldUsePrisma()) {
      return await prisma.user.create({
        data: {
          name: data.name,
          email: normalized,
          passwordHash: data.passwordHash,
          role: data.role as any,
        },
        select: { id: true, name: true, email: true, role: true },
      });
    }
    const store = loadLocalStore();
    if (store.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new Error("An account with this email already exists.");
    }
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: normalized,
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  },

  async getPublishedEvents(): Promise<StoredEvent[]> {
    if (shouldUsePrisma()) {
      const events = await prisma.event.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { startsAt: "asc" },
      });
      const counts = events.length
        ? await prisma.registration.groupBy({
            by: ["eventId"],
            where: {
              eventId: { in: events.map((e: any) => e.id) },
              status: { in: ["REGISTERED", "CHECKED_IN"] },
            },
            _count: { eventId: true },
          })
        : [];
      const byEvent = new Map(counts.map((c: any) => [c.eventId, c._count.eventId]));
      return events.map((e: any) => ({
        ...e,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        registered: byEvent.get(e.id) ?? 0,
      })) as StoredEvent[];
    }
    const store = loadLocalStore();
    return store.events
      .filter((e) => e.status === "PUBLISHED")
      .map((e) => {
        const regCount = store.registrations.filter(
          (r) => r.eventId === e.id && (r.status === "REGISTERED" || r.status === "CHECKED_IN")
        ).length;
        return { ...e, registered: regCount };
      });
  },

  async getEventById(id: string): Promise<StoredEvent | null> {
    if (shouldUsePrisma()) {
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) return null;
      const registered = await prisma.registration.count({
        where: { eventId: id, status: { in: ["REGISTERED", "CHECKED_IN"] } },
      });
      return {
        ...event,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        registered,
      } as StoredEvent;
    }
    const store = loadLocalStore();
    const event = store.events.find((e) => e.id === id);
    if (!event) return null;
    const regCount = store.registrations.filter(
      (r) => r.eventId === id && (r.status === "REGISTERED" || r.status === "CHECKED_IN")
    ).length;
    return { ...event, registered: regCount };
  },

  async getOrganizerEvents(organizerId: string): Promise<StoredEvent[]> {
    if (shouldUsePrisma()) {
      const events = await prisma.event.findMany({
        where: { organizerId },
        orderBy: { createdAt: "desc" },
      });
      const counts = events.length
        ? await prisma.registration.groupBy({
            by: ["eventId"],
            where: {
              eventId: { in: events.map((e: any) => e.id) },
              status: { in: ["REGISTERED", "CHECKED_IN"] },
            },
            _count: { eventId: true },
          })
        : [];
      const byEvent = new Map(counts.map((c: any) => [c.eventId, c._count.eventId]));
      return events.map((e: any) => ({
        ...e,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        registered: byEvent.get(e.id) ?? 0,
      })) as StoredEvent[];
    }
    const store = loadLocalStore();
    return store.events
      .filter((e) => e.organizerId === organizerId)
      .map((e) => {
        const regCount = store.registrations.filter(
          (r) => r.eventId === e.id && (r.status === "REGISTERED" || r.status === "CHECKED_IN")
        ).length;
        return { ...e, registered: regCount };
      });
  },

  async createEvent(data: {
    title: string;
    description: string;
    category: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    status: "DRAFT" | "PUBLISHED";
    organizerId: string;
  }) {
    if (shouldUsePrisma()) {
      return await prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          capacity: data.capacity,
          status: data.status as any,
          organizerId: data.organizerId,
        },
      });
    }
    const store = loadLocalStore();
    const newEvent: StoredEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      startsAt: data.startsAt.toISOString(),
      endsAt: data.endsAt.toISOString(),
      capacity: data.capacity,
      posterUrl: null,
      status: data.status,
      organizerId: data.organizerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registered: 0,
    };
    store.events.unshift(newEvent);
    saveLocalStore(store);
    return newEvent;
  },

  async updateEvent(
    id: string,
    organizerId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      location: string;
      startsAt: Date;
      endsAt: Date;
      capacity: number;
      status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    }>
  ) {
    if (shouldUsePrisma()) {
      const updateData: any = { ...data };
      return await prisma.event.update({
        where: { id },
        data: updateData,
      });
    }
    const store = loadLocalStore();
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Event not found.");
    const existing = store.events[idx];
    const updated: StoredEvent = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.startsAt !== undefined && { startsAt: data.startsAt.toISOString() }),
      ...(data.endsAt !== undefined && { endsAt: data.endsAt.toISOString() }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date().toISOString(),
    };
    store.events[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async getStudentRegistrations(userId: string) {
    if (shouldUsePrisma()) {
      return await prisma.registration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketCode: true,
          status: true,
          createdAt: true,
          checkedInAt: true,
          event: {
            select: {
              id: true,
              title: true,
              category: true,
              location: true,
              startsAt: true,
              endsAt: true,
              posterUrl: true,
            },
          },
        },
      });
    }
    const store = loadLocalStore();
    const userRegs = store.registrations.filter((r) => r.userId === userId);
    return userRegs.map((r) => {
      const event = store.events.find((e) => e.id === r.eventId);
      return {
        id: r.id,
        ticketCode: r.ticketCode,
        status: r.status,
        createdAt: r.createdAt,
        checkedInAt: r.checkedInAt,
        event: event
          ? {
              id: event.id,
              title: event.title,
              category: event.category,
              location: event.location,
              startsAt: event.startsAt,
              endsAt: event.endsAt,
              posterUrl: event.posterUrl,
            }
          : undefined,
      };
    });
  },

  async getEventRegistrations(eventId: string) {
    if (shouldUsePrisma()) {
      return await prisma.registration.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketCode: true,
          status: true,
          checkedInAt: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }
    const store = loadLocalStore();
    const regs = store.registrations.filter((r) => r.eventId === eventId);
    return regs.map((r) => {
      const user = store.users.find((u) => u.id === r.userId);
      return {
        id: r.id,
        ticketCode: r.ticketCode,
        status: r.status,
        checkedInAt: r.checkedInAt,
        createdAt: r.createdAt,
        user: user ? { id: user.id, name: user.name, email: user.email } : { id: r.userId, name: "Student", email: "" },
      };
    });
  },

  async getOrganizerRegistrations(organizerId: string) {
    if (shouldUsePrisma()) {
      return await prisma.registration.findMany({
        where: { event: { organizerId } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketCode: true,
          status: true,
          checkedInAt: true,
          createdAt: true,
          eventId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }
    const store = loadLocalStore();
    const eventIds = new Set(
      store.events.filter((e) => e.organizerId === organizerId).map((e) => e.id)
    );
    return store.registrations
      .filter((r) => eventIds.has(r.eventId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => {
        const user = store.users.find((u) => u.id === r.userId);
        return {
          id: r.id,
          ticketCode: r.ticketCode,
          status: r.status,
          checkedInAt: r.checkedInAt,
          createdAt: r.createdAt,
          eventId: r.eventId,
          user: user
            ? { id: user.id, name: user.name, email: user.email }
            : { id: r.userId, name: "Student", email: "" },
        };
      });
  },

  async createRegistration(eventId: string, userId: string) {
    if (shouldUsePrisma()) {
      return await prisma.$transaction(async (tx: any) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event || event.status !== "PUBLISHED") throw new Error("Event is not open for registration.");
        const existing = await tx.registration.findUnique({
          where: { userId_eventId: { userId, eventId } },
        });
        if (existing && existing.status !== "CANCELLED") throw new Error("You are already registered.");
        const count = await tx.registration.count({
          where: { eventId, status: { in: ["REGISTERED", "CHECKED_IN"] } },
        });
        if (count >= event.capacity) throw new Error("This event is full.");

        if (existing) {
          return tx.registration.update({
            where: { id: existing.id },
            data: { status: "REGISTERED", checkedInAt: null },
            select: { id: true, eventId: true, ticketCode: true, status: true, createdAt: true },
          });
        }
        return tx.registration.create({
          data: { eventId, userId },
          select: { id: true, eventId: true, ticketCode: true, status: true, createdAt: true },
        });
      });
    }

    const store = loadLocalStore();
    const event = store.events.find((e) => e.id === eventId);
    if (!event || event.status !== "PUBLISHED") {
      throw new Error("Event is not open for registration.");
    }
    const existing = store.registrations.find((r) => r.eventId === eventId && r.userId === userId);
    if (existing && existing.status !== "CANCELLED") {
      throw new Error("You are already registered.");
    }
    const activeCount = store.registrations.filter(
      (r) => r.eventId === eventId && (r.status === "REGISTERED" || r.status === "CHECKED_IN")
    ).length;
    if (activeCount >= event.capacity) {
      throw new Error("This event is full.");
    }

    if (existing) {
      existing.status = "REGISTERED";
      existing.checkedInAt = null;
      saveLocalStore(store);
      return { id: existing.id, eventId, ticketCode: existing.ticketCode, status: existing.status, createdAt: existing.createdAt };
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const categoryPrefix = (event.category || "EVT").slice(0, 3).toUpperCase();
    const newReg: StoredRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      eventId,
      ticketCode: `TKT-${categoryPrefix}-${randomSuffix}`,
      status: "REGISTERED",
      checkedInAt: null,
      createdAt: new Date().toISOString(),
    };
    store.registrations.unshift(newReg);
    saveLocalStore(store);
    return { id: newReg.id, eventId, ticketCode: newReg.ticketCode, status: newReg.status, createdAt: newReg.createdAt };
  },

  async cancelRegistration(registrationId: string, userId: string) {
    if (shouldUsePrisma()) {
      const res = await prisma.registration.updateMany({
        where: { id: registrationId, userId, status: "REGISTERED" },
        data: { status: "CANCELLED" },
      });
      if (res.count > 0) return { ok: true };
      throw new Error("Active registration not found.");
    }
    const store = loadLocalStore();
    const reg = store.registrations.find((r) => r.id === registrationId && r.userId === userId);
    if (!reg) throw new Error("Active registration not found.");
    reg.status = "CANCELLED";
    saveLocalStore(store);
    return { ok: true };
  },

  async checkInRegistration(registrationId: string, eventId: string) {
    if (shouldUsePrisma()) {
      return await prisma.registration.update({
        where: { id: registrationId },
        data: { status: "CHECKED_IN", checkedInAt: new Date() },
      });
    }
    const store = loadLocalStore();
    const reg = store.registrations.find((r) => r.id === registrationId && r.eventId === eventId);
    if (!reg) throw new Error("Registration not found.");
    reg.status = "CHECKED_IN";
    reg.checkedInAt = new Date().toISOString();
    saveLocalStore(store);
    return reg;
  },
};
