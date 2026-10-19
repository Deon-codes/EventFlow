<p align="center">
  <img src="frontend/public/logo.png   " width="110" alt="Kampus Logo" />
</p>

<h1 align="center">Kampus: Campus Event Management Platform</h1>

<p align="center">
  <b>v1.0.0 (Production Release)</b><br/>
  A cloud-based event platform where organizers publish events and students discover them and grab tickets, with two tailored experiences running on AWS.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-4c1?style=flat-square" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white&style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x%20Strict-3178c6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma&logoColor=white&style=flat-square" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Amazon%20RDS-336791?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL on RDS" />
  <img src="https://img.shields.io/badge/Deployed%20on-AWS%20EC2-ff9900?logo=amazonaws&logoColor=white&style=flat-square" alt="AWS EC2" />
  <img src="https://img.shields.io/badge/Storage-Private%20S3-569a31?logo=amazons3&logoColor=white&style=flat-square" alt="Private S3" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License MIT" />
</p>

---

## 📸 Visual Showcase

### 🎟️ Student Experience
Browse published events, register in a click, and keep all your tickets in one wallet.
<p align="center">
  <img src="screenshots/student-tickets.png" width="850" alt="Student ticket wallet" />
</p>

---

### 🧑‍💼 Organizer Studio
Capacity, registrations and attendance for every event, at a glance.
<p align="center">
  <img src="screenshots/organizer-dashboard.png" width="850" alt="Organizer dashboard" />
</p>

---

### 🖼️ Event Creation & Poster Uploads
Create events, save drafts, publish when ready, and attach a poster.
<p align="center">
  <img src="screenshots/event-form.png" width="850" alt="Event creation form" />
</p>

---

### 👤 Role-Aware Profiles
Students and organizers each get their own profile and navigation.
<p align="center">
  <img src="screenshots/student-profile.png" width="420" alt="Student profile" />
  &nbsp;&nbsp;
  <img src="screenshots/organizer-profile.png" width="420" alt="Organizer profile" />
</p>

---

## ✨ Features

### For Students
- **🔍 Event Discovery**: Explore published campus events with search and categories.
- **🎫 My Tickets**: A personal ticket wallet showing your registrations.
- **👤 Student Profile**: Personal details and notification preferences.

### For Organizers
- **📝 Event Management**: Create, edit, draft and publish events (title, description, category, venue, schedule, capacity).
- **🖼️ Poster Uploads**: JPEG, PNG and WebP posters up to 5 MB, uploaded straight from the browser to private cloud storage.
- **📊 Dashboard**: Upcoming events, capacity usage, recent registrations and attendance.
- **👥 Attendee Management**: See who registered for each event.

### Platform
- **🔐 Authentication & Role-Based Access**: Students and organizers are routed to the right workspace, and protected routes are checked on the server.
- **🧭 Role-Aware Navigation**: Each role only sees the links and controls that apply to it.
- **🔒 Private Media**: Posters live in a private bucket and are served through short-lived signed URLs.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    U[Students & Organizers] --> B[Web Browser]
    B --> APP[Next.js App on Amazon EC2]
    APP --> API[Server Routes & Actions]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL on Amazon RDS)]
    API --> S3[Private Amazon S3 Bucket]
    B -->|Signed upload| S3
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js server components, route handlers and server actions |
| **Database** | PostgreSQL on Amazon RDS, accessed via Prisma |
| **Storage** | Amazon S3 (private, signed URLs) |
| **Compute** | Amazon EC2 inside a custom VPC |
| **Access & Ops** | IAM instance roles, Security Groups, Systems Manager |

---

## 🔒 Security Highlights

- Private storage bucket with Block Public Access enabled
- Time-limited signed URLs for poster uploads and downloads
- IAM instance roles instead of long-lived access keys in code
- Database reachable only from the application tier
- Server-side authentication and role checks on protected routes
- Secrets kept in environment variables and never committed

---

## 🛠️ Requirements

| Specification | Requirement |
| :--- | :--- |
| **Node.js** | 20 or newer |
| **Package manager** | npm |
| **Database** | PostgreSQL (local or hosted) |
| **Git** | Any recent version |

---

## 📦 Getting Started

1. **Clone the repository**
```bash
   git clone https://github.com/Deon-codes/EventFlow.git
   cd EventFlow/frontend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment variables**
   Create a `.env` file in `frontend/`:
```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   AWS_REGION="your-aws-region"
   S3_BUCKET_NAME="your-poster-bucket"
   # Plus the auth secret variable(s) your setup requires
```
   > Never commit `.env`. It's already covered by `.gitignore`.

4. **Set up the database**
```bash
   npx prisma generate
   npx prisma migrate deploy
```

5. **Run the app**
```bash
   npm run dev
```
   Open `http://localhost:3000`.

6. **Production build**
```bash
   npm run build
   npm run start
```

---

## 📁 Project Structure

```text
EventFlow/
└── frontend/
    ├── prisma/            # Schema & migrations
    ├── scripts/           # Utility & verification scripts
    └── src/
        ├── app/           # Routes (pages, layouts, API routes)
        ├── components/    # UI: dashboard, events, profile, tickets
        └── lib/           # Auth, formatting helpers, shared logic
```

---

## 🗺️ Roadmap

- [ ] Custom domain with HTTPS
- [ ] Stable public endpoint (Elastic IP or load balancer)
- [ ] CloudWatch dashboards and alarms
- [ ] Automated tests for registration flows
- [ ] CI/CD pipeline
- [ ] Email notifications for reminders

---

## 👥 Team

| Name | Role |
| :--- | :--- |
| _Your name_ | _e.g. Frontend & AWS deployment_ |
| _Teammate_ | _e.g. Backend & database_ |

---

## 📄 License

Released under the [MIT License](LICENSE).