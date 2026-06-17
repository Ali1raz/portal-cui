# COMSATS University Portal

This is a feature extension for the existing COMSATS student portal. The base system handles enrollment, grades, and timetables well enough. What it doesn't have: structured leave requests, announcements that actually reach the right people, flexible fee installments, or any way for students to raise complaints through proper channels. These modules cover that.

---

## Table of contents

### Chapters

| #   | Chapter                                             | Description                                                              |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | [Modules](docs/01-modules.md)                       | Module overviews and state transition diagrams                           |
| 2   | [Data flow](docs/02-data-flow.md)                   | Level 0 system context and Level 1 process breakdown                     |
| 3   | [Activity workflows](docs/03-activity-workflows.md) | Step-by-step process flows with decision branches and DB interactions    |
| 4   | [Class diagrams](docs/04-class-diagrams.md)         | Domain model structure with key classes, relationships, responsibilities |
| 5   | [Sequence diagrams](docs/05-sequence-diagrams.md)   | Actor-to-system interaction flows over time                              |
| 6   | [Data design](docs/06-data-design.md)               | Database type, schema structure, indexing, security, scalability         |
| 7   | [Entity relationship diagram](docs/07-erd.md)       | Full ERD with PKs, FKs, cardinalities, and entity category tables        |

---

### Quick reference

#### Modules

- [Leave module](docs/01-modules.md#1-leave-module)
- [Announcement module](docs/01-modules.md#2-announcement-module)
- [Fee installments module](docs/01-modules.md#3-fee-installments-module)
- [Complaints module](docs/01-modules.md#4-complaints-module)

#### Data flow

- [Level 0 — system context](docs/02-data-flow.md#level-0--system-context)
- [Level 1 — main processes](docs/02-data-flow.md#level-1--main-processes)

#### Activity workflows

- [P1 — Leave request](docs/03-activity-workflows.md#p1--leave-request-workflow)
- [P2 — Announcement](docs/03-activity-workflows.md#p2--announcement-workflow)
- [P3 — Fee installments](docs/03-activity-workflows.md#p3--fee-installment-workflow-planned)
- [P4 — Complaint](docs/03-activity-workflows.md#p4--complaint-workflow)
- [P5 — Authentication and access control](docs/03-activity-workflows.md#p5--authentication-and-access-control-workflow)

#### Class diagrams

- [User and roles](docs/04-class-diagrams.md#1-user-and-roles)
- [Academic domain](docs/04-class-diagrams.md#2-academic-domain)
- [Attendance and leave](docs/04-class-diagrams.md#3-attendance-and-leave)
- [Announcements](docs/04-class-diagrams.md#4-announcements)
- [Complaints](docs/04-class-diagrams.md#5-complaints)

#### Sequence diagrams

- [Leave request](docs/05-sequence-diagrams.md#1-leave-request)
- [Announcement](docs/05-sequence-diagrams.md#2-announcement)
- [Fee installments](docs/05-sequence-diagrams.md#3-fee-installments-planned)
- [Complaint](docs/05-sequence-diagrams.md#4-complaint)
- [Authentication and access control](docs/05-sequence-diagrams.md#5-authentication-and-access-control)

#### Data design

- [Database type](docs/06-data-design.md#database-type)
- [Schema structure](docs/06-data-design.md#schema-structure)
- [Indexing strategy](docs/06-data-design.md#indexing-strategy)
- [Security mechanisms](docs/06-data-design.md#security-mechanisms)
- [Scalability considerations](docs/06-data-design.md#scalability-considerations)

#### Entity relationship diagram

- [ERD diagram](docs/07-erd.md#entity-relationship-diagram)
- [User entity](docs/07-erd.md#user-entity)
- [Core functional entities](docs/07-erd.md#core-functional-entities)
- [Transaction and log entities](docs/07-erd.md#transaction-and-log-entities)
- [Administrative entities](docs/07-erd.md#administrative-entities)
- [Relationship summary](docs/07-erd.md#relationship-summary)

---

## Tech stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Language        | TypeScript              |
| Styling         | Tailwind CSS            |
| UI components   | shadcn/ui               |
| ORM             | Prisma                  |
| Database        | PostgreSQL              |
| Auth            | better-auth             |
| Forms           | react-hook-form + zod   |
| Tables          | TanStack Table          |
| URL state       | nuqs                    |
| Background jobs | Inngest                 |
| Email           | Nodemailer              |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v9 or later)
- [PostgreSQL](https://www.postgresql.org/) (v15 or later)
- [Bun](https://bun.sh/) (used by the database seed script)

### 1. Clone the repository

```bash
git clone https://github.com/Ali1raz/portal-cui.git
cd portal-cui
```

### 2. Install dependencies

```bash
pnpm install
```

> This also runs `postinstall` which generates the Prisma client automatically.

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and update the following:

| Variable                      | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string                          |
| `BETTER_AUTH_SECRET`          | Secret key for better-auth (generate a random string) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`)   |
| `DIRECTOR_EMAILS`             | Semicolon-separated director email addresses          |
| `ADMIN_EMAILS`                | Semicolon-separated admin email addresses             |
| `NODEMAILER_USER`             | Gmail address used for sending emails                 |
| `NODEMAILER_APP_PASSWORD`     | Google app password for the email above               |
| `NEXT_PUBLIC_S3_BUCKET_NAME`  | S3-compatible bucket name                             |
| `AWS_ACCESS_KEY_ID`           | AWS / S3 access key                                   |
| `AWS_SECRET_ACCESS_KEY`       | AWS / S3 secret key                                   |
| `AWS_ENDPOINT_URL_S3`         | S3 endpoint URL                                       |
| `AWS_ENDPOINT_URL_IAM`        | IAM endpoint URL                                      |
| `AWS_REGION`                  | AWS region (default: `auto`)                          |
| `ARCJET_KEY`                  | Arcjet API key from the Arcjet dashboard              |
| `ARCJET_ENV`                  | `development` or `production`                         |

### 4. Set up the database

Create a PostgreSQL database, then push the schema and seed it:

```bash
# Push the Prisma schema to your database
pnpm db:push

# Seed the database with initial data
pnpm db:seed
```

> Alternatively, use `pnpm db:migrate` to apply migrations instead of `db:push`.

### 5. Run the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 6. Run Inngest (background jobs)

In a separate terminal:

```bash
pnpm inngest:dev
```

---

## Available scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Start the Next.js dev server      |
| `pnpm build`        | Production build                  |
| `pnpm start`        | Start the production server       |
| `pnpm lint`         | Run ESLint                        |
| `pnpm lint:fix`     | Run ESLint with auto-fix          |
| `pnpm format`       | Check formatting with Prettier    |
| `pnpm format:write` | Fix formatting with Prettier      |
| `pnpm db:migrate`   | Run Prisma migrations             |
| `pnpm db:generate`  | Generate Prisma client            |
| `pnpm db:push`      | Push Prisma schema to database    |
| `pnpm db:sync`      | Push schema and regenerate client |
| `pnpm db:seed`      | Seed the database                 |
| `pnpm db:studio`    | Open Prisma Studio                |
| `pnpm test`         | Run tests (Vitest)                |
| `pnpm test:watch`   | Run tests in watch mode           |
