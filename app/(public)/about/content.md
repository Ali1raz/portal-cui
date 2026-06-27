# COMSATS University Portal Enhancement

## Built by

- Ali Raza (FA22-BSE-118),
- Syed Ahmar Hussain (FA22-BSE-095)
- Supervised by Mr. Abdullah.

## Problem

The existing COMSATS student portal handles enrollment and grades but has no structured workflows for leave requests, departmental complaints, fee installment requests, or targeted announcements requires staff coordinated these over email and WhatsApp with no audit trail.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- PostgreSQL
- Prisma
- Better-auth
- Arcjet
- Inngest
- Nodemailer
- Shadcn/ui
- TailwindCSS
- React Hook Form
- Zod
- TanStack Table
- nuqs
- Recharts

---

## Architecture & Access Control

- Designed a multi-role approval engine covering Student, Batch Advisor, HOD, Accountant, Clerk, Director, and Admin — each with scoped queues and permission-gated server actions
- Modeled HOD and Batch Advisor as appointment roles with a `professorId` FK rather than separate user types — a BA reuses the professor's `employeeNo` and identity without duplicating the user record
- Enforced row-level scoping in every server action — BA queries filter by `ba.department`, HOD by `hod.department`, students by `studentId` — so no cross-department data leaks at the application layer

---

## Leave Requests

- Built BA → HOD two-stage review workflow with duplicate guard on `(studentId, offeringId, date)` and admin attendance override unlocked only after HOD approval

---

## Complaints

- Built complaint pipeline with append-only `ComplaintReview` audit log on every state transition so the full back-and-forth between student, BA, and HOD is reconstructable without guessing from status history
- Designed HOD-to-department routing that writes three rows atomically — `Complaint` update, `ComplaintAssignment` log, `ComplaintReview` entry — so routing history survives indefinitely

---

## Announcements

- Built three publish paths (immediate, draft, scheduled via Inngest sleep) with four nullable audience filters so one query covers department-only, program-wide, and portal-wide broadcasts without separate handling

---

## Fee Installments

- Designed schema where `FeeInstallment` is a shared accountant-defined template and per-student payment state lives exclusively in `StudentFeeInstallment` — prevents one student's split approval from corrupting others' views
- Implemented sequential voucher numbering using a counter-table pattern with upsert inside a transaction to eliminate race conditions under concurrent requests
- Built fine policy as pure read-time math using `fineType`, `fineAmount`, `fineMaxDays`, and `fineCapAmount` — no DB writes on overdue, no background sync jobs

---

## Security

- Integrated Arcjet `shield` + `slidingWindow` + `detectBot` in middleware with per-action isolated rate-limit buckets using `"role:resource:userId"` key prefixing to prevent bucket bleed across actions
