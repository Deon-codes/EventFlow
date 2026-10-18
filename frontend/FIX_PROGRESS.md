# EventFlow Bug Fix Progress

_Session: 2026-10-18 — Strict maintenance task, zero scope creep._

---

## Checklist

| # | Task | Status |
|---|------|--------|
| 1 | S3 Poster Upload Integration | FIXED — MANUAL VERIFICATION REQUIRED |
| 2 | Incorrect Organizer Identity | FIXED — MANUAL VERIFICATION REQUIRED |
| 3 | `/registrations` Ticket Page | NO CODE CHANGE — logic was already correct (see notes) |
| 4 | Event Registration Status "Closed" | FIXED — MANUAL VERIFICATION REQUIRED |
| 5 | DynamoDB Activity Logging | BLOCKED |

---

## Task 1 — S3 Poster Upload Integration

### Root Cause
The frontend `event-form.tsx` correctly:
1. POSTs to `/api/events/[id]/poster-upload` to get a presigned PUT URL.
2. PUTs the file directly to S3 via the presigned URL.
3. PATCHes `/api/events/[id]` with `{ posterKey: target.key, ... }`.

But `PATCH /api/events/[id]/route.ts` **did not extract `posterKey`** from the request body — it was silently discarded. Additionally, `dbService.updateEvent` did not include `posterUrl` in its parameter type or update logic.

### Files Changed
- `src/app/api/events/[id]/route.ts` — Added extraction of `posterKey` from PATCH body and maps it to `posterUrl`.
- `src/lib/db-service.ts` — Added `posterUrl` to `updateEvent()` type signature and local-store branch. Prisma branch already works via spread (`{ ...data }`).

### MANUAL VERIFICATION REQUIRED
1. Log in as organizer. Create or edit an event.
2. Save the event (draft or publish) so the event ID is set.
3. Use the "Choose file" button to select a JPEG/PNG/WebP <= 5 MB.
4. Click "Upload poster." The status message should read "Poster uploaded securely to private S3 storage."
5. In AWS console -> S3 -> your bucket -> `events/<event-id>/` prefix: confirm the object appears.
6. Confirm no error message appears in the UI or server logs.

### Remaining Uncertainty
- Bucket CORS must allow `PUT` from the deployed origin. No CORS change was made.
- EC2 IAM role must have `s3:PutObject` on `<bucket>/events/*`. This was not confirmed.
- If either is missing, the upload step (browser -> S3) will fail with a network error shown in the UI.

---

## Task 2 — Incorrect Organizer Identity

### Root Cause
`DashboardHero` imported `CURRENT_ORGANIZER` from mock-data and used its hardcoded name `"Amara Okafor"` for the greeting — regardless of who was actually authenticated.

### Files Changed
- `src/components/dashboard/dashboard-hero.tsx` — Removed mock import; added `organizerName: string` prop.
- `src/app/dashboard/page.tsx` — Passes `organizerName={user?.name ?? "Organizer"}`.

### MANUAL VERIFICATION REQUIRED
1. Sign in as Organizer A. Visit `/dashboard`. Confirm the greeting shows Organizer A's first name.
2. Sign in as a second organizer account. Visit `/dashboard`. Confirm that account's first name appears, NOT Organizer A's name.

---

## Task 3 — /registrations Ticket Page

### Root Cause
After code inspection, **no bug was found in the code path itself**:
- Page calls `currentUser()` (redirects to login if not authenticated), then calls `dbService.getStudentRegistrations(user.id)`.
- The cancel endpoint enforces user ownership via `cancelRegistration(id, user.id)`.
- No cross-user data exposure risk found in the code.

### No Code Change Made
If the page shows an empty ticket list, the cause is that no registrations exist in the database for the authenticated student — not a code defect.

### MANUAL VERIFICATION REQUIRED
1. Sign in as a student. Register for a published event.
2. Navigate to `/registrations`. Confirm the ticket appears with correct event title, date, location, and ticket code.
3. Open the "View Digital Pass" modal. Confirm the attendee name and email match the logged-in student.
4. Sign in as a different student. Confirm you see only that student's tickets, not the first student's.

---

## Task 4 — Event Registration Status

### Root Cause
`toCampusEvent()` in `src/lib/event-mapper.ts` used `new Date()` (real server time) to downgrade `PUBLISHED` DB events to UI status `"completed"` if `endsAt` had passed in real time. Since `DEMO_TODAY = "2026-10-12"` but the actual date is Oct 18 2026, any event with `endsAt` between Oct 12-18 would be mapped as `"completed"` even if it was `PUBLISHED` in the database.

`register-button.tsx` then checks `event.status === "completed"` -> shows "Registration Closed."

This meant events with dates in that window could not be registered for even though the backend `createRegistration` would have accepted them (it checks DB status `PUBLISHED`).

### File Changed
- `src/lib/event-mapper.ts` — Removed the `endsDate < new Date()` -> `"completed"` branch. `PUBLISHED` DB events now consistently map to UI status `"published"`. The unused `endsDate` variable was also removed.

### Risk Assessment
Low. `"completed"` was never a DB state (schema only has PUBLISHED, DRAFT, CANCELLED). Organizer summary `completedEvents` will now always be 0 for DB-backed events. Mock data events are unaffected.

### MANUAL VERIFICATION REQUIRED
1. Log in as a student. Navigate to an event that is `PUBLISHED` in the DB.
2. Confirm the "Book Free Ticket" button is visible (not "Registration Closed").
3. Click the button. Confirm registration succeeds and a ticket code is shown.

---

## Task 5 — DynamoDB Activity Logging

### Status: BLOCKED

### Evidence Available
- `package.json` has NO `@aws-sdk/client-dynamodb` or `@aws-sdk/lib-dynamodb` dependency.
- No DynamoDB code exists anywhere in `src/`.
- The `EventFlowActivity` table existence cannot be confirmed from available code.
- `AWS-HANDOVER.md` states: "Bucket existence, IAM policies, Parameter Store contents... are unverified."

### What You Must Confirm Before Implementation
1. Confirm the `EventFlowActivity` DynamoDB table exists in `eu-north-1` with partition key `eventKey` (String) and sort key `activityTime` (String).
2. Confirm the `EventFlow-EC2-SSM-Role` has `dynamodb:PutItem` on the exact table ARN.
3. Confirm you want the `@aws-sdk/lib-dynamodb` package added as a dependency.

Implementation will not proceed until these are confirmed.

---

## Commands Run

| Command | Purpose |
|---------|---------|
| `npx tsc --noEmit` | Validate TypeScript for all changed files |

## Previously Completed Checks Skipped

- Prisma schema validation — schema unchanged; no migration.
- `npm install` — no new dependencies added.
- Database connection test — established in prior session, config unchanged.
- Full project rebuild — not needed; targeted type check is sufficient.

---

## Regression Risks

1. **Organizer completedEvents count** — always 0 for DB-backed workspace data. Acceptable since "completed" was never a real DB concept.
2. **Poster upload S3 PUT** — depends on bucket CORS and IAM role; the code fix enables the key to be saved, but network-layer prerequisites are unverified.
3. **DashboardHero fallback** — safe; fallback "Organizer" only fires if `user` is null (impossible in practice past the auth gate).

---

## Session 2: Strict Frontend Bug-Fixes (Issues 1 – 4)

### Issue 1: Registration Page (`/registrations`) Does Not Load Correctly
- **Root Cause**:
  1. `getStudentRegistrations()` from Prisma returned raw JavaScript `Date` instances (`createdAt`, `checkedInAt`, `event.startsAt`, `event.endsAt`). Passing these across the Server Component boundary into `<MyTicketsView />` caused `formatFullDate` / `parseCampusDate` to call `iso.split("T")`, throwing a runtime `TypeError: iso.split is not a function`.
  2. If an organizer visited `/registrations`, they were shown the student ticket wallet without a role-appropriate redirect, contradicting `auth-form.js` which routes organizers to `/dashboard`.
  3. No error boundary or safe fallback existed if registration queries threw transient database errors.
- **Files Modified**:
  - `src/lib/format.ts`: `parseCampusDate()` now safely accepts `Date | string` without throwing on Date instances.
  - `src/app/(site)/registrations/page.tsx`: Role guard added (`redirect("/dashboard")` for organizers/admins); query wrapped in try/catch; dates explicitly serialized to ISO strings.
  - `src/components/student/my-tickets-view.tsx`: Added `initialRegistrations || []` fallback.

### Issue 2: Incorrect Organizer Name
- **Root Cause**:
  - `DashboardTopbar` and `DashboardSidebar` still imported `CURRENT_ORGANIZER` from `mock-data.ts` and hardcoded `"Amara Okafor"`.
- **Files Modified**:
  - `src/components/layout/dashboard-topbar.tsx`: Removed `CURRENT_ORGANIZER` import; accepted `organizer` prop; displays real user name and role.
  - `src/components/layout/dashboard-sidebar.tsx`: Removed `CURRENT_ORGANIZER` import; accepted `organizer` prop; displays real user name and email.
  - `src/app/dashboard/layout.tsx`: Fetches authenticated `user = await currentUser()`, validates role, and passes organizer details to topbar and sidebar.

### Issue 3: Student and Organizer Dashboards Appear Identical
- **Root Cause**:
  - `/dashboard` had no auth or role gate; students visiting `/dashboard` were served the organizer dashboard with organizer-only actions ("Create event", "Attendees", draft tables).
  - Profile actions offered "Open organizer dashboard" unconditionally to students.
  - Navigation showed student-specific "My Tickets" to organizers and organizer links to students.
- **Files Modified**:
  - `src/app/dashboard/layout.tsx` & `src/app/dashboard/page.tsx`: Added authentication and student role guards (redirecting unauthenticated users to `/login?redirect=/dashboard` and students to `/registrations`).
  - `src/components/layout/site-header.tsx`: Desktop nav, user dropdown, and mobile drawer show "Dashboard" to organizers and "My Tickets" to students.
  - `src/components/student/profile-view.tsx`: Students only see "Review my tickets"; organizers only see "Open organizer dashboard".

### Issue 4: Incorrect Email and Profile Details
- **Root Cause**:
  - `ProfilePage` synthesized mock student identities (`studentId: "STU-..."`, `programme: "Computer Science & Engineering"`, `year: "3rd Year"`, phone: `"+91 98765 43210"`) and student ticket counts for organizers.
  - Profile validation forced campus email regex validation and required a student ID even for organizers.
- **Files Modified**:
  - `src/app/(site)/profile/page.tsx`: Distinct data models for student vs organizer profiles; removed fake student IDs and mock phone numbers.
  - `src/components/student/profile-view.tsx`: Organizers receive "Organizer account" badge; student-specific fields (Student ID, Programme, Year, ticket stats) are hidden; email validation accepts standard emails without assuming campus domains.

### Verification Performed
- `node scripts/verify-auth.js`: 10/10 passed.
- `npx tsc --noEmit`: 0 errors (clean exit code 0).
- `npm run build`: All 34 Next.js routes built and statically/dynamically generated successfully (exit code 0).
