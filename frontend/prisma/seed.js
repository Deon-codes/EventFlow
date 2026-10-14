const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_STUDENT_HASH = "$2b$10$nWYXeAPnapj0M0p2aeH4A.dOHprmon1kbXs61Il/KmAUAHTQGKlSe"; // Student@123
const DEFAULT_ORGANIZER_HASH = "$2b$10$mlPi1OHK3YvPZDX8pptJL.silJQBXCjjshlNlU6s.sj/1U7v7DIs6"; // Organizer@123

async function main() {
  console.log("Seeding demo accounts into database...");

  // Upsert demo student (preserves existing if already present)
  const student = await prisma.user.upsert({
    where: { email: "maya.rodrigues@campus.edu" },
    update: {},
    create: {
      name: "Maya Rodrigues",
      email: "maya.rodrigues@campus.edu",
      passwordHash: DEFAULT_STUDENT_HASH,
      role: "STUDENT",
    },
  });
  console.log(`Student demo account ensured: ${student.email} (${student.role})`);

  // Upsert demo organizer (preserves existing if already present)
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@campus.edu" },
    update: {},
    create: {
      name: "David Kalu",
      email: "organizer@campus.edu",
      passwordHash: DEFAULT_ORGANIZER_HASH,
      role: "ORGANIZER",
    },
  });
  console.log(`Organizer demo account ensured: ${organizer.email} (${organizer.role})`);

  // Check if events exist; if not, seed initial published events
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    console.log("No events found in database. Seeding initial campus events...");
    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.event.createMany({
      data: [
        {
          title: "Cloud Computing Hands-on Workshop",
          description: "Explore serverless architectures, container deployment on AWS ECS, and database reliability patterns.",
          category: "Technology",
          location: "Lab Complex 402",
          startsAt: inThreeDays,
          endsAt: new Date(inThreeDays.getTime() + 3 * 60 * 60 * 1000),
          capacity: 60,
          status: "PUBLISHED",
          organizerId: organizer.id,
        },
        {
          title: "Annual Campus Tech & Innovation Summit",
          description: "Keynotes from industry leaders, startup showcases, and networking sessions for engineering students.",
          category: "Career",
          location: "Campus Main Auditorium",
          startsAt: inSevenDays,
          endsAt: new Date(inSevenDays.getTime() + 6 * 60 * 60 * 1000),
          capacity: 250,
          status: "PUBLISHED",
          organizerId: organizer.id,
        },
      ],
    });
    console.log("Initial events created successfully.");
  } else {
    console.log(`Database already has ${eventCount} events. Preserving existing events.`);
  }

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Database seed failed:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
