/**
 * Mock campus data for the frontend milestone.
 *
 * Everything here is sample content bundled with the UI. Nothing is persisted:
 * registrations, drafts and attendee lists reset on every page load. The AWS
 * milestone replaces these helpers with server-side queries against Amazon RDS
 * (PostgreSQL), with posters streamed from Amazon S3.
 */

import type {
  CampusEvent,
  CampusUser,
  DashboardActivity,
  Registration,
} from "@/types";

/* ------------------------------------------------------------------ users */

/** The signed-in student used by the mock student experience. */
export const CURRENT_STUDENT: CampusUser = {
  id: "stu-1042",
  name: "Maya Rodrigues",
  email: "maya.rodrigues@campus.edu",
  role: "student",
  programme: "B.Tech Computer Science",
  year: "3rd year",
  studentId: "2023CS0148",
  phone: "+1 (555) 014-8823",
  avatarTone: "berry",
};

/** The signed-in organizer used by the dashboard experience. */
export const CURRENT_ORGANIZER: CampusUser = {
  id: "org-201",
  name: "Amara Okafor",
  email: "amara.okafor@campus.edu",
  role: "organizer",
  programme: "Student Activities Office",
  year: "Events Coordinator",
  phone: "+1 (555) 010-7741",
  avatarTone: "brand",
};

export interface CampusStudent {
  id: string;
  name: string;
  email: string;
  programme: string;
  year: string;
}

/** Pool used to build realistic attendee lists. */
export const STUDENT_POOL: CampusStudent[] = [
  { id: "stu-1001", name: "Daniel Osei", email: "daniel.osei@campus.edu", programme: "B.Sc Information Systems", year: "2nd year" },
  { id: "stu-1002", name: "Hannah Lima", email: "hannah.lima@campus.edu", programme: "B.Des Communication Design", year: "3rd year" },
  { id: "stu-1003", name: "Ibrahim Kalil", email: "ibrahim.kalil@campus.edu", programme: "B.Tech Mechanical", year: "4th year" },
  { id: "stu-1004", name: "Sofia Marchetti", email: "sofia.marchetti@campus.edu", programme: "B.A Media Studies", year: "1st year" },
  { id: "stu-1005", name: "Kenji Watanabe", email: "kenji.watanabe@campus.edu", programme: "B.Tech Electronics", year: "3rd year" },
  { id: "stu-1006", name: "Grace Adeyemi", email: "grace.adeyemi@campus.edu", programme: "BBA Marketing", year: "2nd year" },
  { id: "stu-1007", name: "Tomas Novak", email: "tomas.novak@campus.edu", programme: "B.Sc Physics", year: "3rd year" },
  { id: "stu-1008", name: "Priya Nair", email: "priya.nair@campus.edu", programme: "B.Tech Computer Science", year: "2nd year" },
  { id: "stu-1009", name: "Liam Brennan", email: "liam.brennan@campus.edu", programme: "B.Sc Data Science", year: "4th year" },
  { id: "stu-1010", name: "Zainab Farouk", email: "zainab.farouk@campus.edu", programme: "B.Arch Architecture", year: "5th year" },
  { id: "stu-1011", name: "Elena Petrova", email: "elena.petrova@campus.edu", programme: "B.A Economics", year: "1st year" },
  { id: "stu-1012", name: "Marcus Reid", email: "marcus.reid@campus.edu", programme: "B.Sc Sports Science", year: "2nd year" },
  { id: "stu-1013", name: "Aisha Rahman", email: "aisha.rahman@campus.edu", programme: "B.Tech Civil", year: "3rd year" },
  { id: "stu-1014", name: "Noah Fischer", email: "noah.fischer@campus.edu", programme: "B.Sc Robotics", year: "4th year" },
  { id: "stu-1015", name: "Chiara Rossi", email: "chiara.rossi@campus.edu", programme: "B.A Music", year: "2nd year" },
  { id: "stu-1016", name: "Omar Haddad", email: "omar.haddad@campus.edu", programme: "B.Sc Cybersecurity", year: "3rd year" },
  { id: "stu-1017", name: "Rebecca Stone", email: "rebecca.stone@campus.edu", programme: "BBA Finance", year: "1st year" },
  { id: "stu-1018", name: "Jonas Meyer", email: "jonas.meyer@campus.edu", programme: "B.Tech Computer Science", year: "2nd year" },
  { id: "stu-1019", name: "Leila Haddad", email: "leila.haddad@campus.edu", programme: "B.Des Industrial Design", year: "3rd year" },
  { id: "stu-1020", name: "Victor Almeida", email: "victor.almeida@campus.edu", programme: "B.Sc Environmental Science", year: "4th year" },
  { id: "stu-1021", name: "Ananya Gupta", email: "ananya.gupta@campus.edu", programme: "B.Tech Computer Science", year: "1st year" },
  { id: "stu-1022", name: "Peter Lindqvist", email: "peter.lindqvist@campus.edu", programme: "B.Sc Mathematics", year: "2nd year" },
  { id: "stu-1023", name: "Fatima Zahra", email: "fatima.zahra@campus.edu", programme: "B.A Journalism", year: "3rd year" },
  { id: "stu-1024", name: "Andre Silva", email: "andre.silva@campus.edu", programme: "B.Sc Computer Engineering", year: "4th year" },
];

/* ----------------------------------------------------------------- events */

export const MOCK_EVENTS: CampusEvent[] = [
  {
    id: "evt-hack-night",
    title: "Campus Hack Night 2026",
    summary:
      "An overnight build sprint for student teams shipping campus tools, with mentors from the Cloud Computing Lab.",
    description: [
      "Campus Hack Night brings together 30 student teams for a single overnight sprint on real campus problems: hostel logistics, class scheduling, library discovery and event check-ins.",
      "Mentors from the Cloud Computing Lab float between tables to review architecture, help wire up cloud services and sanity-check your deployment before the 6:00 AM demo round.",
    ],
    category: "Technology",
    status: "published",
    startsAt: "2026-10-23T18:00:00",
    endsAt: "2026-10-24T09:00:00",
    registrationClosesAt: "2026-10-22T23:59:00",
    venue: "Innovation Hub, Level 2",
    building: "Engineering Block E",
    isOnline: false,
    capacity: 120,
    registered: 118,
    waitlisted: 14,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Hackathon", "Cloud", "Team event"],
    featured: true,
    posterArt: "tech",
    createdAt: "2026-09-02T11:20:00",
    highlights: [
      "Dinner, midnight snacks and unlimited coffee included",
      "Bring your own laptop and a charger",
      "Team size 2–4, solo entries get grouped on arrival",
    ],
  },
  {
    id: "evt-design-sprint",
    title: "Remote Design Sprint",
    summary:
      "A hands-on sprint for student designers and developers who want to learn how to federate product ideas fast.",
    description: [
      "Work through a compressed five-day design sprint in one afternoon: map the problem, sketch competing solutions, decide as a team and storyboard a testable prototype.",
      "Open to every programme. You will leave with a shareable sprint deck and a reusable facilitation kit for your own club projects.",
    ],
    category: "Workshops",
    status: "published",
    startsAt: "2026-10-24T10:00:00",
    endsAt: "2026-10-24T15:30:00",
    registrationClosesAt: "2026-10-23T18:00:00",
    venue: "Design Loft",
    building: "Arts Block A",
    isOnline: false,
    capacity: 60,
    registered: 47,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Design", "Workshop", "Beginner friendly"],
    featured: true,
    posterArt: "design",
    createdAt: "2026-09-11T09:05:00",
    highlights: [
      "Facilitated by the Design Collective",
      "Sketching materials provided",
      "Certificates for the full afternoon",
    ],
  },
  {
    id: "evt-design-thinking",
    title: "Design Thinking with Sprints",
    summary:
      "A framework session on how student teams take a product from idea to a tested prototype in five focused days.",
    description: [
      "Design thinking is not a buzzword when it is tied to a deliverable. This session walks through the sprint structure week by week with live examples from last semester's winning teams.",
      "Expect short talks, two rapid exercises and a clinic where you can bring an unfinished project for feedback.",
    ],
    category: "Workshops",
    status: "published",
    startsAt: "2026-10-28T18:30:00",
    endsAt: "2026-10-28T20:30:00",
    registrationClosesAt: "2026-10-27T23:59:00",
    venue: "Block C Auditorium",
    building: "Academic Block C",
    isOnline: false,
    capacity: 80,
    registered: 52,
    waitlisted: 0,
    priceUsd: 5,
    organizerId: "org-201",
    tags: ["Design", "Evening", "Certificate"],
    featured: false,
    posterArt: "design",
    createdAt: "2026-09-18T14:40:00",
    highlights: [
      "Guest speaker from the Innovation Cell",
      "Bring a project idea if you have one",
      "Refreshments at 18:00",
    ],
  },
  {
    id: "evt-career-fair",
    title: "Fall Career & Internship Fair",
    summary:
      "Meet 40+ recruiters for internships and graduate roles across engineering, design, analytics and finance.",
    description: [
      "The flagship careers event of the semester. Forty companies set up across the Central Atrium with open internship tracks, graduate schemes and campus ambassador roles.",
      "Bring printed résumés and a student ID. A résumé clinic runs all day in the mezzanine for walk-in reviews.",
    ],
    category: "Career",
    status: "published",
    startsAt: "2026-10-29T09:00:00",
    endsAt: "2026-10-29T16:00:00",
    registrationClosesAt: "2026-10-28T20:00:00",
    venue: "Central Atrium",
    building: "Main Campus",
    isOnline: false,
    capacity: 500,
    registered: 412,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Careers", "Networking", "All programmes"],
    featured: true,
    posterArt: "career",
    createdAt: "2026-08-30T10:10:00",
    highlights: [
      "40+ companies across four floors",
      "Free headshots in the north lobby",
      "Résumé clinic from 10:00 to 15:00",
    ],
  },
  {
    id: "evt-cultural-night",
    title: "Cultural Night: Rhythms of Home",
    summary:
      "An open-air evening of student performances, food stalls and poetry from across the campus community.",
    description: [
      "Twenty-two student groups take the amphitheatre stage for dance, spoken word, folk sets and a closing percussion jam that everyone joins.",
      "Food stalls from eight regional student societies open at 18:00, an hour before the first act.",
    ],
    category: "Arts & Culture",
    status: "published",
    startsAt: "2026-10-30T18:00:00",
    endsAt: "2026-10-30T22:30:00",
    registrationClosesAt: "2026-10-30T16:00:00",
    venue: "Open-Air Amphitheatre",
    building: "Lakeside Campus",
    isOnline: false,
    capacity: 300,
    registered: 268,
    waitlisted: 9,
    priceUsd: 8,
    organizerId: "org-201",
    tags: ["Performance", "Food stalls", "Open air"],
    featured: true,
    posterArt: "culture",
    createdAt: "2026-09-05T16:25:00",
    highlights: [
      "22 student performances",
      "Bring a light jacket, it gets cool by the lake",
      "Doors open 17:30",
    ],
  },
  {
    id: "evt-robotics-lab",
    title: "Intro to Robotics & Autonomous Bots",
    summary:
      "Build and race a line-following robot in the mechatronics lab, no prior hardware experience needed.",
    description: [
      "A practical lab session where you assemble a differential-drive bot from a pre-kitted chassis, load a starter firmware sketch and tune it on the arena track.",
      "The last hour is a friendly time-trial. Kits stay in the lab and are reused by the next cohort.",
    ],
    category: "Technology",
    status: "published",
    startsAt: "2026-10-31T11:00:00",
    endsAt: "2026-10-31T14:30:00",
    registrationClosesAt: "2026-10-30T18:00:00",
    venue: "Mechatronics Lab, Room 14",
    building: "Engineering Block E",
    isOnline: false,
    capacity: 40,
    registered: 40,
    waitlisted: 17,
    priceUsd: 12,
    organizerId: "org-201",
    tags: ["Robotics", "Hands-on", "Limited kits"],
    featured: false,
    posterArt: "robotics",
    createdAt: "2026-09-21T08:35:00",
    highlights: [
      "All hardware provided",
      "Safety goggles supplied",
      "Time trial at 13:30",
    ],
  },
  {
    id: "evt-music-fest",
    title: "Sundown Sessions Music Fest",
    summary:
      "Five student bands, a campus-wide open mic and a closing DJ set on the main lawn.",
    description: [
      "The semester's biggest music gathering: five student bands across indie, jazz and electronic sets, an open mic hour and a closing DJ set under the lawn lights.",
      "Ticketing is per person and includes a drink voucher from the campus café.",
    ],
    category: "Music",
    status: "published",
    startsAt: "2026-11-07T16:00:00",
    endsAt: "2026-11-07T23:00:00",
    registrationClosesAt: "2026-11-06T23:59:00",
    venue: "Main Lawn",
    building: "Main Campus",
    isOnline: false,
    capacity: 800,
    registered: 356,
    waitlisted: 0,
    priceUsd: 15,
    organizerId: "org-201",
    tags: ["Live music", "Open mic", "Outdoor"],
    featured: true,
    posterArt: "music",
    createdAt: "2026-09-09T13:15:00",
    highlights: [
      "Five student bands",
      "Open mic slots on the night",
      "One drink voucher included",
    ],
  },
  {
    id: "evt-pitch-night",
    title: "Startup Pitch Night: Demo Day",
    summary:
      "Twelve student teams pitch working prototypes to alumni investors and the campus incubator panel.",
    description: [
      "Twelve shortlisted teams get six minutes each to pitch a working prototype, followed by investor Q&A and a networking hour with the campus incubator.",
      "Attendance is open to all students; the pitch slots are already finalised for this semester.",
    ],
    category: "Career",
    status: "published",
    startsAt: "2026-11-12T17:30:00",
    endsAt: "2026-11-12T21:00:00",
    registrationClosesAt: "2026-11-11T23:59:00",
    venue: "Business School Hall",
    building: "Management Block",
    isOnline: false,
    capacity: 200,
    registered: 121,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Startups", "Pitching", "Networking"],
    featured: false,
    posterArt: "startup",
    createdAt: "2026-09-24T11:45:00",
    highlights: [
      "12 pitching teams",
      "Investor and alumni panel",
      "Networking hour from 20:00",
    ],
  },
  {
    id: "evt-documentary",
    title: "Documentary Screening: Cities in Motion",
    summary:
      "A filmed look at how four cities rebuilt their transit systems, followed by a discussion with the director.",
    description: [
      "Screening of the 94-minute documentary followed by a moderated conversation and open floor Q&A with the director and a campus urban-planning lecturer.",
      "The screening space has step-free access and captions are enabled throughout.",
    ],
    category: "Arts & Culture",
    status: "published",
    startsAt: "2026-11-18T19:00:00",
    endsAt: "2026-11-18T21:30:00",
    registrationClosesAt: "2026-11-18T17:00:00",
    venue: "Media Theatre",
    building: "Arts Block B",
    isOnline: false,
    capacity: 150,
    registered: 64,
    waitlisted: 0,
    priceUsd: 3,
    organizerId: "org-201",
    tags: ["Film", "Discussion", "Captioned"],
    featured: false,
    posterArt: "film",
    createdAt: "2026-09-27T15:50:00",
    highlights: [
      "Director Q&A after the screening",
      "Closed captions enabled",
      "Step-free access seating",
    ],
  },
  {
    id: "evt-photo-walk",
    title: "Golden Hour Photo Walk",
    summary:
      "A slow lakeside walk with the Photography Club, shooting the last hour of light and editing together after.",
    description: [
      "Meet at the lakeside gazebo for a guided walk through the golden hour. Club mentors cover light metering, framing and editing with whatever camera you have.",
      "Phones are very welcome — the editing session focuses on colour grading rather than gear.",
    ],
    category: "Arts & Culture",
    status: "published",
    startsAt: "2026-11-22T16:30:00",
    endsAt: "2026-11-22T18:30:00",
    registrationClosesAt: "2026-11-22T12:00:00",
    venue: "Lakeside Gazebo",
    building: "Lakeside Campus",
    isOnline: false,
    capacity: 30,
    registered: 27,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Photography", "Outdoors", "Edit session"],
    featured: false,
    posterArt: "photo",
    createdAt: "2026-10-01T10:30:00",
    highlights: [
      "Phone cameras welcome",
      "Editing session right after",
      "Weather backup: covered pavilion",
    ],
  },
  {
    id: "evt-wellness-yoga",
    title: "Exam Wellness Yoga Morning",
    summary:
      "A beginner-friendly yoga and breathing session to ease into the December assessment weeks.",
    description: [
      "A gentle 90-minute session led by a certified instructor from the sports complex, designed around desk fatigue and exam stress.",
      "Mats are provided. Arrive ten minutes early to settle in.",
    ],
    category: "Sports",
    status: "draft",
    startsAt: "2026-12-01T07:00:00",
    endsAt: "2026-12-01T08:30:00",
    registrationClosesAt: "2026-11-30T20:00:00",
    venue: "Sports Complex Studio 2",
    building: "Sports Complex",
    isOnline: false,
    capacity: 50,
    registered: 18,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Wellness", "Morning", "Beginner friendly"],
    featured: false,
    posterArt: "wellness",
    createdAt: "2026-10-06T07:20:00",
    highlights: ["Mats provided", "Poster art still pending", "Awaiting venue confirmation"],
  },
  {
    id: "evt-debate-finals",
    title: "Inter-College Debate Championship",
    summary:
      "Sixteen college teams, four rounds, and a live final judged by the department faculty.",
    description: [
      "The championship brings sixteen visiting teams to the Senate Hall for four knockout rounds of parliamentary debate.",
      "Draft listing: the schedule is still being confirmed with visiting colleges before publishing.",
    ],
    category: "Academic",
    status: "draft",
    startsAt: "2026-12-04T13:00:00",
    endsAt: "2026-12-04T18:30:00",
    registrationClosesAt: "2026-12-02T23:59:00",
    venue: "Senate Hall",
    building: "Academic Block A",
    isOnline: false,
    capacity: 180,
    registered: 0,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Debate", "Inter-college", "Faculty judged"],
    featured: false,
    posterArt: "debate",
    createdAt: "2026-10-08T12:05:00",
    highlights: ["Sixteen visiting colleges", "Live final at 17:00", "Publishing after schedule lock"],
  },
  {
    id: "evt-alumni-mixer",
    title: "Alumni Homecoming Mixer",
    summary:
      "An evening courtyard mixer connecting final-year students with alumni across eight industries.",
    description: [
      "Forty alumni return to campus for a relaxed courtyard mixer with final-year students, with industry tables marked for tech, design, healthcare and finance.",
      "Draft listing: catering numbers and the alumni confirmation list are still open.",
    ],
    category: "Social",
    status: "draft",
    startsAt: "2026-12-12T18:00:00",
    endsAt: "2026-12-12T21:30:00",
    registrationClosesAt: "2026-12-10T23:59:00",
    venue: "Alumni Courtyard",
    building: "Main Campus",
    isOnline: false,
    capacity: 250,
    registered: 88,
    waitlisted: 0,
    priceUsd: 10,
    organizerId: "org-201",
    tags: ["Networking", "Alumni", "Evening"],
    featured: false,
    posterArt: "startup",
    createdAt: "2026-10-09T17:35:00",
    highlights: ["40 alumni confirmed", "Industry tables", "Draft until catering locks"],
  },
  {
    id: "evt-cloud-study-jam",
    title: "Cloud Computing Study Jam",
    summary:
      "A guided revision jam on storage, compute and identity fundamentals ahead of the mid-semester paper.",
    description: [
      "An evening revision jam covering object storage, virtual compute and identity policies, run by senior students from the Cloud Computing Lab.",
      "Attended by 68 of the 70 registered students; the feedback survey averaged 4.6 out of 5.",
    ],
    category: "Academic",
    status: "completed",
    startsAt: "2026-09-18T17:00:00",
    endsAt: "2026-09-18T20:00:00",
    registrationClosesAt: "2026-09-18T12:00:00",
    venue: "Lecture Hall 204",
    building: "Academic Block C",
    isOnline: false,
    capacity: 70,
    registered: 68,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Revision", "Cloud", "Study group"],
    featured: false,
    posterArt: "tech",
    createdAt: "2026-08-22T09:00:00",
    highlights: ["Revision notes shared afterwards", "68 of 70 attended", "4.6 / 5 feedback score"],
  },
  {
    id: "evt-orientation-concert",
    title: "Freshers' Orientation Concert",
    summary:
      "The welcome-week concert that closed orientation with three student bands and a fireworks finale.",
    description: [
      "The largest event of the welcome week, closing orientation with three student bands and a light show on the main lawn.",
      "588 of 600 registered students attended, making it the best-attended campus event this year.",
    ],
    category: "Music",
    status: "completed",
    startsAt: "2026-08-28T19:00:00",
    endsAt: "2026-08-28T22:45:00",
    registrationClosesAt: "2026-08-27T23:59:00",
    venue: "Main Lawn",
    building: "Main Campus",
    isOnline: false,
    capacity: 600,
    registered: 588,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Concert", "Orientation", "Outdoor"],
    featured: false,
    posterArt: "music",
    createdAt: "2026-07-30T10:00:00",
    highlights: ["588 attendees", "Fireworks finale", "Closed the welcome week"],
  },
  {
    id: "evt-aws-workshop",
    title: "Intro to Cloud Workshop",
    summary:
      "A practical introduction to virtual machines, object storage and identity setup for first-time cloud users.",
    description: [
      "A sold-out hands-on workshop covering virtual machines, object storage buckets and least-privilege identity policies.",
      "All 55 seats were taken and every attendee completed the lab notebook.",
    ],
    category: "Technology",
    status: "completed",
    startsAt: "2026-10-02T14:00:00",
    endsAt: "2026-10-02T17:30:00",
    registrationClosesAt: "2026-10-01T23:59:00",
    venue: "Computer Lab 3",
    building: "Engineering Block E",
    isOnline: false,
    capacity: 55,
    registered: 55,
    waitlisted: 12,
    priceUsd: 0,
    organizerId: "org-201",
    tags: ["Cloud", "Hands-on", "Sold out"],
    featured: false,
    posterArt: "tech",
    createdAt: "2026-09-01T08:00:00",
    highlights: ["55 attendees, full house", "Lab notebook completed by all", "12 students waitlisted"],
  },
];

/* ---------------------------------------------------------- registrations */

interface RegistrationSeed {
  studentId: string;
  status: Registration["status"];
  registeredAt: string;
  checkedInAt?: string;
}

function buildRegistrations(eventId: string, seeds: RegistrationSeed[]): Registration[] {
  return seeds.map((seed, index) => {
    const student =
      seed.studentId === CURRENT_STUDENT.id
        ? {
            id: CURRENT_STUDENT.id,
            name: CURRENT_STUDENT.name,
            email: CURRENT_STUDENT.email,
            programme: CURRENT_STUDENT.programme,
            year: CURRENT_STUDENT.year,
          }
        : STUDENT_POOL.find((entry) => entry.id === seed.studentId);

    if (!student) {
      throw new Error(`Unknown student ${seed.studentId} for event ${eventId}`);
    }

    return {
      id: `${eventId}-reg-${index + 1}`,
      eventId,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      programme: student.programme,
      year: student.year,
      status: seed.status,
      registeredAt: seed.registeredAt,
      ticketCode: `EF-${eventId.split("-")[1]?.slice(0, 3).toUpperCase() ?? "EVT"}-${String(index + 1).padStart(3, "0")}`,
      checkedInAt: seed.checkedInAt,
    } satisfies Registration;
  });
}

export const MOCK_REGISTRATIONS: Registration[] = [
  ...buildRegistrations("evt-hack-night", [
    { studentId: "stu-1001", status: "confirmed", registeredAt: "2026-09-12T10:14:00" },
    { studentId: "stu-1003", status: "confirmed", registeredAt: "2026-09-12T11:02:00" },
    { studentId: "stu-1008", status: "confirmed", registeredAt: "2026-09-13T08:45:00" },
    { studentId: "stu-1014", status: "confirmed", registeredAt: "2026-09-14T16:20:00" },
    { studentId: "stu-1016", status: "confirmed", registeredAt: "2026-09-15T09:31:00" },
    { studentId: "stu-1018", status: "confirmed", registeredAt: "2026-09-18T19:05:00" },
    { studentId: "stu-1021", status: "waitlisted", registeredAt: "2026-10-05T13:44:00" },
    { studentId: "stu-1024", status: "waitlisted", registeredAt: "2026-10-07T21:09:00" },
    { studentId: "stu-1006", status: "pending", registeredAt: "2026-10-10T07:52:00" },
  ]),
  ...buildRegistrations("evt-design-sprint", [
    { studentId: "stu-1042", status: "confirmed", registeredAt: "2026-09-20T12:10:00" },
    { studentId: "stu-1002", status: "confirmed", registeredAt: "2026-09-20T12:31:00" },
    { studentId: "stu-1004", status: "confirmed", registeredAt: "2026-09-21T09:12:00" },
    { studentId: "stu-1010", status: "confirmed", registeredAt: "2026-09-23T14:48:00" },
    { studentId: "stu-1019", status: "confirmed", registeredAt: "2026-09-25T10:05:00" },
    { studentId: "stu-1023", status: "pending", registeredAt: "2026-10-09T18:30:00" },
  ]),
  ...buildRegistrations("evt-career-fair", [
    { studentId: "stu-1042", status: "confirmed", registeredAt: "2026-09-04T09:00:00" },
    { studentId: "stu-1005", status: "confirmed", registeredAt: "2026-09-05T10:22:00" },
    { studentId: "stu-1007", status: "confirmed", registeredAt: "2026-09-06T11:40:00" },
    { studentId: "stu-1009", status: "confirmed", registeredAt: "2026-09-08T15:15:00" },
    { studentId: "stu-1011", status: "confirmed", registeredAt: "2026-09-12T08:58:00" },
    { studentId: "stu-1013", status: "confirmed", registeredAt: "2026-09-19T17:26:00" },
    { studentId: "stu-1017", status: "confirmed", registeredAt: "2026-09-22T13:03:00" },
    { studentId: "stu-1020", status: "confirmed", registeredAt: "2026-09-28T09:47:00" },
    { studentId: "stu-1022", status: "pending", registeredAt: "2026-10-11T20:12:00" },
  ]),
  ...buildRegistrations("evt-cultural-night", [
    { studentId: "stu-1042", status: "confirmed", registeredAt: "2026-10-02T19:20:00" },
    { studentId: "stu-1015", status: "confirmed", registeredAt: "2026-10-02T19:44:00" },
    { studentId: "stu-1004", status: "confirmed", registeredAt: "2026-10-03T11:11:00" },
    { studentId: "stu-1010", status: "confirmed", registeredAt: "2026-10-04T16:02:00" },
    { studentId: "stu-1013", status: "confirmed", registeredAt: "2026-10-06T12:55:00" },
    { studentId: "stu-1023", status: "waitlisted", registeredAt: "2026-10-10T09:26:00" },
  ]),
  ...buildRegistrations("evt-robotics-lab", [
    { studentId: "stu-1042", status: "waitlisted", registeredAt: "2026-09-29T21:15:00" },
    { studentId: "stu-1014", status: "confirmed", registeredAt: "2026-09-23T10:10:00" },
    { studentId: "stu-1016", status: "confirmed", registeredAt: "2026-09-24T11:30:00" },
    { studentId: "stu-1018", status: "confirmed", registeredAt: "2026-09-26T14:45:00" },
    { studentId: "stu-1024", status: "confirmed", registeredAt: "2026-09-30T08:20:00" },
  ]),
  ...buildRegistrations("evt-documentary", [
    { studentId: "stu-1042", status: "attended", registeredAt: "2026-09-15T10:00:00", checkedInAt: "2026-11-18T18:52:00" },
    { studentId: "stu-1004", status: "confirmed", registeredAt: "2026-09-16T12:35:00" },
    { studentId: "stu-1007", status: "confirmed", registeredAt: "2026-09-20T14:10:00" },
  ]),
  ...buildRegistrations("evt-cloud-study-jam", [
    { studentId: "stu-1005", status: "attended", registeredAt: "2026-08-27T09:15:00", checkedInAt: "2026-09-18T16:52:00" },
    { studentId: "stu-1007", status: "attended", registeredAt: "2026-08-29T13:40:00", checkedInAt: "2026-09-18T16:55:00" },
    { studentId: "stu-1016", status: "attended", registeredAt: "2026-08-30T10:05:00", checkedInAt: "2026-09-18T17:01:00" },
    { studentId: "stu-1018", status: "attended", registeredAt: "2026-09-01T15:22:00", checkedInAt: "2026-09-18T17:04:00" },
    { studentId: "stu-1021", status: "confirmed", registeredAt: "2026-09-10T11:48:00" },
  ]),
  ...buildRegistrations("evt-aws-workshop", [
    { studentId: "stu-1001", status: "attended", registeredAt: "2026-09-02T08:30:00", checkedInAt: "2026-10-02T13:50:00" },
    { studentId: "stu-1003", status: "attended", registeredAt: "2026-09-03T09:12:00", checkedInAt: "2026-10-02T13:52:00" },
    { studentId: "stu-1009", status: "attended", registeredAt: "2026-09-05T16:40:00", checkedInAt: "2026-10-02T13:58:00" },
    { studentId: "stu-1014", status: "attended", registeredAt: "2026-09-08T10:25:00", checkedInAt: "2026-10-02T14:02:00" },
    { studentId: "stu-1022", status: "attended", registeredAt: "2026-09-11T18:05:00", checkedInAt: "2026-10-02T14:05:00" },
  ]),
];

export interface OrganizerProfile {
  id: string;
  name: string;
  focus: string;
  eventsHosted: number;
  tone: CampusUser["avatarTone"];
}

/** Clubs and labs shown in the "organizers to follow" rail. */
export const ORGANIZER_PROFILES: OrganizerProfile[] = [
  { id: "club-design", name: "Design Collective", focus: "Studio workshops", eventsHosted: 42, tone: "plum" },
  { id: "lab-cloud", name: "Cloud Computing Lab", focus: "Hands-on labs", eventsHosted: 18, tone: "sky" },
  { id: "club-music", name: "Music Society", focus: "Gigs & open mics", eventsHosted: 27, tone: "clay" },
  { id: "union-sports", name: "Sports Union", focus: "Tournaments & clinics", eventsHosted: 31, tone: "mint" },
];

/** Seeded activity used by the dashboard "recent activity" rail. */
export const MOCK_ACTIVITY: DashboardActivity[] = [
  {
    id: "act-1",
    label: "Hack Night reached capacity",
    detail: "120 of 120 seats confirmed · 14 on the waitlist",
    at: "2026-10-11T09:12:00",
    tone: "brand",
  },
  {
    id: "act-2",
    label: "Résumé clinic agenda updated",
    detail: "Fall Career & Internship Fair · 412 registrations",
    at: "2026-10-10T16:40:00",
    tone: "sky",
  },
  {
    id: "act-3",
    label: "New draft · Inter-College Debate",
    detail: "Awaiting schedule confirmation before publishing",
    at: "2026-10-08T12:05:00",
    tone: "plum",
  },
  {
    id: "act-4",
    label: "17 students joined the robotics waitlist",
    detail: "Intro to Robotics & Autonomous Bots is full",
    at: "2026-10-07T11:30:00",
    tone: "clay",
  },
  {
    id: "act-5",
    label: "Cultural Night ticket revenue posted",
    detail: "268 registrations · $2,144 estimated",
    at: "2026-10-05T08:15:00",
    tone: "mint",
  },
];
