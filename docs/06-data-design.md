# Data design

## Database type

The system uses **PostgreSQL** — a relational SQL database. The choice is deliberate:

- Every module in this portal is built around multi-step approval workflows with strict ordering and status constraints. Relational integrity (foreign keys, unique constraints, cascading deletes) enforces those rules at the DB layer, not just the application layer.
- Audit trails (`ComplaintReview`, `ComplaintAssignment`) are append-only relational log tables. Joining them back to parent records for timeline queries is straightforward in SQL and would be awkward in a document store.
- Enum types (`Role`, `ComplaintStatus`, `LeaveStatus`, `AnnouncementStatus`, etc.) are defined at the DB level, so invalid status values are rejected before they reach application logic.
- Prisma ORM sits in front of PostgreSQL and handles query building, migrations, and type safety end-to-end.

---

## Schema structure

The schema is normalized into distinct domains. Tables within each domain are joined by foreign keys rather than embedding data.

**Identity and roles**

- `user` is the single source of truth for every person in the system. Auth columns (`emailVerified`, `banned`, `banReason`, `banExpires`) and the `role` enum live here.
- `session` and `account` are owned by better-auth and hold tokens and OAuth credentials respectively. They reference `user` with cascade-delete so removing a user cleans up all auth records.
- `verification` holds time-limited tokens for email verification flows, also owned by better-auth.
- Each role profile (`student`, `professor`, `hod`, `batch_advisor`, `accountant`, `director`) is a separate table with a 1:1 unique FK to `user`. Domain-specific columns stay out of the `user` table.

**Academic**

- `subject` is the catalogue — name, code, credit hours. No semester context here.
- `subject_offering` binds a subject to a semester, year, and department. This is the central join point that attendance records, enrollments, teaching assignments, and leave requests all reference.
- `enrollment` is the student ↔ offering join table with an optional section column.
- `teaching_assignment` is the professor ↔ offering join table. A unique constraint on `offeringId` enforces the one-professor-per-offering rule at the DB level.
- `registration` tracks a student's semester registration with a `RegistrationStatus` enum. Unique on `studentId` — one active registration per student.

**Attendance and leave**

- `attendance_record` captures one lecture per row: date, time window, topic, and the offering it belongs to.
- `student_attendance` is the per-student row inside a record. Unique on `(recordId, studentId)` — one status per student per lecture.
- `leave_request` references both the student and the subject offering (not the attendance record). Unique on `(studentId, offeringId, date)` — prevents duplicate requests for the same class. Status values progress as: `PENDING` (initial) → `REVIEW_REQUESTED` (BA requests more info; student resubmits to reset back to `PENDING`) → `HOD_PENDING` (BA accepts) → `APPROVED` (HOD accepts) or `REJECTED` (BA or HOD rejects).

**Announcements**

- `announcement` is self-contained — content, lifecycle status, scheduling metadata, and all four audience-targeting columns (`targetDepartment`, `targetProgram`, `targetBatch`, `targetYear`) live in a single table. Nullable targeting columns mean a single `WHERE` clause covers every audience scope.

**Complaints**

- `complaint` holds current state. The `targetDepartment` column is mutable — it changes on each reassignment. Status values: `BA_PENDING` → `BA_REVIEW_REQUESTED` (BA requests more info; student resubmits to reset to `BA_PENDING`) → `BA_REJECTED` (student can revise & resubmit or delete) → `HOD_PENDING` (BA accepts) → `HOD_REVIEW_REQUESTED` (HOD requests more info; student resubmits to reset to `HOD_PENDING`) → `HOD_ACCEPTED` (resolved) or `HOD_REJECTED` (workflow ends). `REASSIGNED` is a transient state set when HOD routes to another department; it immediately transitions to `HOD_PENDING` in the receiving department.
- `complaint_review` is an append-only audit log. Every actor action creates one immutable row with `fromStatus`, `toStatus`, `actorRole`, and `action`. Never updated. This covers all transitions including `REVIEW_REQUESTED` states and resubmissions, making the full edit history reconstructable.
- `complaint_assignment` is an append-only routing log. Each reassignment creates one row with `fromDepartment` and `toDepartment`.

---

## Indexing strategy

Indexes are chosen around the queries each module actually runs, not as a blanket coverage strategy.

**Primary keys** — all tables use `uuid()` as the primary key. UUIDs avoid sequential ID enumeration in URLs and are safe to expose.

**Unique constraints (also function as indexes)**

- `user.email` — login lookup
- `student.registrationNo` — student search and import
- `professor.employeeNo` — professor search
- `hod.department` — one HOD per department enforced at DB
- `batch_advisor.department` — one BA per department enforced at DB
- `enrollment(studentId, offeringId)` — prevents double enrollment
- `teaching_assignment(offeringId)` — one professor per offering
- `leave_request(studentId, offeringId, date)` — prevents duplicate leave requests
- `student_attendance(recordId, studentId)` — prevents duplicate attendance rows
- `session.token` — session lookup on every authenticated request

**Explicit indexes**

- `session(userId)` — fetch all sessions for a user (used by better-auth on logout and session invalidation)
- `account(userId)` — fetch linked OAuth accounts for a user
- `verification(identifier)` — look up pending verifications by email
- `hod(department)` — department-scoped HOD queries
- `professor(department, employeeNo)` — professor search filtered by department
- `leave_request(studentId)` and `leave_request(offeringId)` — the two most common access patterns for leave queries
- `complaint(studentId)` — student's own complaint listing
- `complaint(targetDepartment, status)` — the main queue query for BA and HOD: filter by department and status together
- `complaint_review(complaintId)` — fetch the full timeline for a complaint
- `complaint_review(batchAdvisorId)` — BA's own review history independent of complaint
- `complaint_assignment(complaintId)` — fetch routing history for a complaint
- `announcement(status, publishedAt)` — student feed query
- `announcement(authorId)` — author's own announcement listing
- `announcement(targetDepartment)` — HOD-scoped queries
- `announcement(status, isPinned, publishedAt)` — pinned-first ordering on the student feed

---

## Security mechanisms

**Authentication** — handled entirely by better-auth. The portal never stores or compares raw passwords. Credentials are validated by better-auth against hashed values in the `account` table. Session tokens are set as HTTP-only cookies; the application code only reads the session object, not the raw token.

**Session validation** — `requireSession` runs at the top of every server action and protected data fetch. It confirms the session token is valid and not expired before any DB query or mutation runs. Unauthenticated requests are rejected before they reach any business logic.

**Permission checks** — `requirePermission` runs after session validation on every mutation. It checks the authenticated user's role against the specific resource and action (e.g. `complaints: ["update"]`), not just a broad role gate. This means a student cannot call a BA action even if they craft a direct POST to the server action.

**Row-level scoping** — queries are scoped in the application layer by the authenticated user's profile:

- BA queries filter by `targetDepartment = ba.department` — a BA cannot see another department's complaints or leave requests
- HOD queries filter by `targetDepartment = hod.department` — same rule applies
- Students can only read and mutate their own records (`studentId = student.id`)
- Authors can only update and delete their own announcements (`authorId = session.user.id`)

**Cascade deletes** — `onDelete: Cascade` is set on all profile FKs that reference `user`. Deleting a user removes their sessions, accounts, and role profiles cleanly. Complaint cascades also clean up reviews and assignments. This prevents orphaned rows that could leak data.

**Input validation** — every server action runs `zod.safeParse` on incoming data before touching the DB. Schema validation happens server-side; client-side validation is a UX convenience only.

**Enum constraints** — status enums (`LeaveStatus`, `ComplaintStatus`, `AnnouncementStatus`, etc.) are defined at the DB level via Prisma enums. The DB rejects any value outside the defined set, so a tampered request cannot insert an arbitrary status string.

**User banning** — the `user` table has `banned`, `banReason`, and `banExpires` columns managed by better-auth. Banned users cannot create new sessions regardless of credential validity.

---

## Scalability considerations

**Connection pooling** — Prisma connects to PostgreSQL over a standard TCP connection. In a serverless or edge deployment (Next.js on Vercel), each function invocation can open a new connection. A connection pooler (e.g. PgBouncer or Supabase's built-in pooler) should sit in front of PostgreSQL to cap concurrent connections and prevent exhaustion under load.

**Background jobs** — time-sensitive operations (announcement auto-publish, leave request auto-expiry) are handled by Inngest rather than cron jobs or inline `setTimeout` calls. Inngest persists job state externally, so a server restart or cold start does not lose scheduled work. This also means the main request path returns immediately — the job runs asynchronously.

**Read-heavy queries** — the student announcement feed and attendance tables are read far more often than they are written. The compound indexes on `announcement(status, isPinned, publishedAt)` and `complaint(targetDepartment, status)` are designed specifically for these high-frequency reads. If feed query latency becomes a concern, a Redis cache layer on published announcements is a natural next step since announcements change infrequently once published.

**Append-only audit tables** — `complaint_review` and `complaint_assignment` only grow. They are never updated or deleted (except via cascade when the parent complaint is deleted). This makes them safe to archive or partition by `createdAt` if they grow large, without affecting the live query patterns which filter by `complaintId`.

**UUID primary keys** — UUIDs are random, which means inserts do not cause B-tree index hot spots the way sequential integer IDs can at high write volume. The trade-off is slightly larger index size, which is acceptable at the expected scale of a university portal.

**Schema migrations** — Prisma Migrate tracks all schema changes as versioned SQL migration files. Migrations are applied in order and are idempotent when run via CI, making deployments predictable and rollback straightforward.

**Soft deletes vs. hard deletes** — the system currently hard-deletes rejected complaints and leave requests. If audit requirements change (e.g. compliance needs a record of every submission), adding a `deletedAt` nullable timestamp and converting to soft deletes is a localized schema change that does not affect any other table.
