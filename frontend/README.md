# EventFlow — campus event ticketing & management (frontend)

Cloud-Based Campus Event Ticketing & Management System — Cloud Computing Lab mini-project.

This milestone delivers the **complete frontend**: a student experience for discovering and
registering for events, and an organizer workspace for creating events and managing
registrations. Event data is realistic sample content; the AWS integrations (EC2, Amazon RDS
for PostgreSQL, Amazon S3) come in the next milestone.

## Tech stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4 (`@tailwindcss/turbopack` loader configured in `next.config.ts`)
- Lucide icons
- Poppins (display/UI) + Geist Mono (ticket codes) via `next/font`

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (includes type checking)
npm run lint    # eslint
npx tsc --noEmit
```

## Routes

| Route | Experience | What it does |
| --- | --- | --- |
| `/` | Student | Hero, search, featured events, category tiles, upcoming list, rail widgets |
| `/events` | Student | All published events with live search, category/date filters, sort, grid + list views |
| `/events/[id]` | Student | Event detail: poster, schedule, venue, capacity meter, registration action, related events |
| `/registrations` | Student | Ticket wallet with ticket codes, statuses, cancel action |
| `/profile` | Student | Editable profile, account actions, notification preferences |
| `/login` | Public | Sign in / sign up with role switch, validation, loading and error states |
| `/dashboard` | Organizer | Metrics, greeting band, upcoming events table, calendar, activity feed, quick actions |
| `/dashboard/events` | Organizer | Manage events: status tabs, search, category/sort filters, capacity, row actions |
| `/dashboard/events/new` | Organizer | Create event form with validation, poster picker, live card preview |
| `/dashboard/events/[id]/edit` | Organizer | Same form pre-filled from the selected event |
| `/dashboard/attendees` | Organizer | Attendee list per event, search, status filter, capacity, check-in actions |

## Architecture

```
src/
  app/
    (site)/            student routes (shared sidebar + header + rail shell)
    dashboard/         organizer routes (dark rail + workspace top bar shell)
    login/             standalone auth screen
    not-found.tsx      themed 404
  components/
    ui/                Button, Card, Badge, Field/Input/Select/Toggle, Avatar,
                       ProgressBar/CapacityMeter, MetricCard, EmptyState,
                       Skeleton, Notice, PillTabs/SegmentedControl
    events/            EventPoster, EventCard, EventListItem, EventFilters,
                       EventsBrowser, RegisterButton, status badges
    dashboard/         DashboardHero, EventsTable, CalendarCard,
                       RecentRegistrations, ManageEventsView, EventForm, AttendeeView
    layout/            SiteHeader, StudentSidebar, StudentRail, SiteFooter,
                       DashboardSidebar, DashboardTopbar, BrandLogo
    auth/              AuthForm
    student/           MyTickets, ProfileView
    illustrations/     flat SVG artwork (hero, dashboard, promo, offer)
  lib/
    mock-data.ts       sample users, 16 events, registrations, activity, organizers
    events.ts          selectors, search/filter/sort, capacity + summary maths, tone maps
    format.ts          deterministic campus date/time/price formatting
    utils.ts           cn / initials helpers
  types/index.ts       Event, User, Registration, statuses and categories
```

## Design system

Tokens live in `src/app/globals.css` under `@theme`:

- Canvas: warm creams (`cream-50…400`); type: warm inks (`ink-300…900`)
- Primary amber (`brand-*`), deep berry accent (`berry-*`) for prices and destructive hints
- Organizer rail charcoal (`bark-*`), warm workspace `cloud-*`, status colours for
  leaf/mint/sky/plum/clay
- Radii `rounded-card` / `rounded-panel`, soft shadows `shadow-soft` / `shadow-float` / `shadow-rail`

Student pages follow the amber-on-cream illustrated identity with a floating light sidebar, a
rounded search bar, pill tabs and list-style event rows. The organizer workspace switches to a
charcoal rail with amber highlight bars, an amber greeting band and dense data tables — the same
palette, a clearly different working mode. Event posters are flat vector illustrations until
posters are uploaded to Amazon S3; `EventPoster` already renders `event.posterUrl` through
`next/image` when one exists.

## Data & backend boundaries

- All content comes from `src/lib/mock-data.ts`. Nothing is persisted: reload restores the seed
  data, and every mutation (register, cancel, publish, check-in, profile save) is browser-only.
- `DEMO_TODAY` (`2026-10-12`) is the reference "now" so server render and client hydration stay
  byte-identical. It is replaced by the server clock once events come from RDS.
- There is **no authentication**. The login form only validates its fields; role permissions are
  not enforced and must not be trusted until server-side auth exists.
- No secrets or AWS credentials are stored anywhere in this project.
- Screens that depend on the backend show an explicit "not connected yet" notice naming the
  endpoint that will serve it (e.g. `POST /api/events/:id/registrations`,
  `GET /api/organizer/summary`, `PATCH /api/me`).

Next milestone: API route handlers on EC2, Prisma models against Amazon RDS (PostgreSQL), poster
upload to Amazon S3, IAM-scoped access, and server-side session handling.
