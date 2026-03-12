# Sequence diagrams

Sequence diagrams show interaction between actors and system components over time. Each diagram includes the actor on the left, the request-response flow through Next.js server actions, and database/API interactions.

---

## 1. Leave request

```mermaid
sequenceDiagram
    actor Student
    actor BA as Batch Advisor
    actor HOD
    actor Admin
    participant Portal as Next.js (Server Actions)
    participant DB as PostgreSQL (Prisma)
    participant Inngest as Inngest (Background Jobs)

    Student->>Portal: Submit leave form (subject, date, reason, image?)
    Portal->>Portal: Validate schema (zod)
    Portal->>DB: SELECT LeaveRequest WHERE studentId + offeringId + date (duplicate check)
    DB-->>Portal: No duplicate found
    Portal->>DB: INSERT LeaveRequest (status = PENDING)
    Portal->>Inngest: Emit leaveRequest/status.changed { leaveRequestId, requestDate }
    Portal-->>Student: Success – request submitted

    Note over Inngest: Job sleeps until requestDate
    Inngest->>DB: UPDATE LeaveRequest SET status = REJECTED WHERE status = PENDING AND date = requestDate
    Note over Inngest: Auto-expires if no human acts before the request date

    BA->>Portal: GET leave requests queue
    Portal->>DB: SELECT LeaveRequest WHERE department = BA.dept AND status = PENDING
    DB-->>Portal: Pending requests list
    Portal-->>BA: Render queue

    alt BA rejects
        BA->>Portal: POST reject { requestId }
        Portal->>DB: UPDATE LeaveRequest SET status = REJECTED
        Portal-->>Student: Notify – request rejected
    else BA accepts
        BA->>Portal: POST accept { requestId }
        Portal->>DB: UPDATE LeaveRequest SET status = HOD_PENDING
        Portal-->>Student: Notify – forwarded to HOD
    end

    HOD->>Portal: GET leave requests queue
    Portal->>DB: SELECT LeaveRequest WHERE department = HOD.dept AND status = HOD_PENDING
    DB-->>Portal: Pending requests list
    Portal-->>HOD: Render queue

    alt HOD rejects
        HOD->>Portal: POST reject { requestId }
        Portal->>DB: UPDATE LeaveRequest SET status = REJECTED
        Portal-->>Student: Notify – request rejected
    else HOD approves
        HOD->>Portal: POST approve { requestId }
        Portal->>DB: UPDATE LeaveRequest SET status = APPROVED
        Portal-->>Student: Notify – leave approved
        Admin->>Portal: POST override attendance { recordId, studentId }
        Portal->>DB: UPDATE StudentAttendance SET status = LEAVE
        Portal-->>Admin: Attendance updated
    end
```

**Actors:** Student, Batch Advisor, HOD, Admin
**System components:** Next.js server actions, PostgreSQL via Prisma, Inngest background jobs
**Key interactions:**

- Student submits → Portal validates and duplicate-checks against DB before inserting
- Inngest fires at submission and sleeps until the request date — auto-rejects if no human has acted
- BA and HOD each query their own department slice; status gates which queue the request appears in
- Admin attendance override only becomes available after HOD approval — it writes directly to `StudentAttendance`

---

## 2. Announcement

```mermaid
sequenceDiagram
    actor Author as Author (HOD / Accountant)
    actor Student
    participant Portal as Next.js (Server Actions)
    participant DB as PostgreSQL (Prisma)
    participant Inngest as Inngest (Background Jobs)

    Author->>Portal: POST create announcement (title, content, type, audience filters, scheduledFor?)
    Portal->>Portal: Validate schema (zod) + verify author profile in DB
    Portal->>DB: SELECT Hod or Accountant WHERE userId = session.user.id
    DB-->>Portal: Author profile confirmed

    alt Publish immediately
        Portal->>DB: INSERT Announcement (status = PUBLISHED, publishedAt = now())
        Portal-->>Author: Published
    else Save as draft
        Portal->>DB: INSERT Announcement (status = DRAFT)
        Portal-->>Author: Saved as draft
    else Schedule for future
        Portal->>Portal: Validate scheduledFor is future and within 2 days
        Portal->>DB: INSERT Announcement (status = SCHEDULED, scheduledFor = datetime)
        Portal->>Inngest: Emit announcement/scheduled { announcementId, scheduleDate }
        Portal-->>Author: Scheduled – will publish at datetime
        Note over Inngest: Job sleeps until scheduledFor
        Inngest->>DB: UPDATE Announcement SET status = PUBLISHED, publishedAt = now(), scheduledFor = null
    end

    Student->>Portal: GET announcement feed
    Portal->>DB: SELECT Announcement WHERE status = PUBLISHED AND matches student profile (dept, program, batch, year) ORDER BY isPinned DESC, publishedAt DESC
    DB-->>Portal: Filtered announcement list
    Portal-->>Student: Render feed (pinned first)

    Author->>Portal: PATCH update lifecycle status { announcementId, newStatus }
    Portal->>DB: UPDATE Announcement SET status = newStatus (+ publishedAt if PUBLISHED)
    Portal-->>Author: Status updated
```

**Actors:** Author (HOD or Accountant), Student
**System components:** Next.js server actions, PostgreSQL via Prisma, Inngest background jobs
**Key interactions:**

- Author profile is verified against DB on every write — HOD gets department auto-scoped, Accountant sets targeting manually
- Three publish paths branch at creation: immediate, draft, or scheduled
- Inngest sleeps between scheduling and publish time; no polling — it wakes at exactly `scheduledFor`
- Student feed query filters by all four targeting columns at once; `null` columns match any value, so portal-wide announcements require no special handling

---

## 3. Fee installments _(planned)_

```mermaid
sequenceDiagram
    actor Accountant
    actor Student
    actor Reviewer as Reviewer (HOD / Accountant)
    participant Portal as Next.js (Server Actions)
    participant DB as PostgreSQL (Prisma)
    participant PDF as PDF Generator

    Accountant->>Portal: POST create installments (up to 3 per semester, amount + due date each)
    Portal->>Portal: Validate schema (zod)
    Portal->>DB: INSERT Installments
    Portal-->>Accountant: Installments created and visible to students

    Student->>Portal: GET my installments
    Portal->>DB: SELECT Installments WHERE semester = student.currentSemester
    DB-->>Portal: Installment list
    Portal-->>Student: Render installments with due dates and amounts

    Student->>Portal: GET download voucher { installmentId }
    Portal->>DB: SELECT Installment + Student details
    DB-->>Portal: Data for voucher
    Portal->>PDF: Generate PDF voucher
    PDF-->>Portal: PDF stream
    Portal-->>Student: Download PDF

    Student->>Portal: POST custom split request (preferred amounts, dates, reason)
    Portal->>DB: INSERT InstallmentRequest (status = PENDING)
    Portal-->>Student: Request submitted

    Reviewer->>Portal: GET installment requests queue
    Portal->>DB: SELECT InstallmentRequest WHERE status = PENDING
    DB-->>Portal: Request list
    Portal-->>Reviewer: Render queue

    alt Reviewer rejects
        Reviewer->>Portal: POST reject { requestId, remarks }
        Portal->>DB: UPDATE InstallmentRequest SET status = REJECTED
        Portal-->>Student: Notify – request rejected with remarks
    else Reviewer accepts
        Reviewer->>Portal: POST accept { requestId }
        Portal->>DB: UPDATE InstallmentRequest SET status = APPROVED
        Portal->>DB: UPDATE Installments with new split amounts and dates
        Portal-->>Student: Notify – new installment plan applied
    end
```

**Actors:** Accountant, Student, Reviewer (HOD or Accountant)
**System components:** Next.js server actions, PostgreSQL via Prisma, PDF generator
**Key interactions:**

- Accountant writes installments once per semester; all enrolled students read the same records
- PDF generation is on-demand at download time — no pre-generation or storage
- Student split requests land in a shared review queue for both HOD and Accountant
- Approval triggers two DB writes: the request status update and the actual installment record update

---

## 4. Complaint

```mermaid
sequenceDiagram
    actor Student
    actor BA as Batch Advisor
    actor HOD
    participant Portal as Next.js (Server Actions)
    participant DB as PostgreSQL (Prisma)

    Student->>Portal: POST complaint (category, title, details, attachment?)
    Portal->>Portal: Validate schema (zod) + check permission
    Portal->>DB: SELECT Student WHERE userId = session.user.id
    DB-->>Portal: Student profile (id, department)
    Portal->>DB: INSERT Complaint (status = BA_PENDING, targetDepartment = student.dept)
    Portal-->>Student: Complaint submitted

    BA->>Portal: GET complaints queue
    Portal->>DB: SELECT Complaint WHERE targetDepartment = BA.dept AND status = BA_PENDING
    DB-->>Portal: Complaint list
    Portal-->>BA: Render queue

    alt BA rejects
        BA->>Portal: POST reject { complaintId, remarks }
        Portal->>DB: UPDATE Complaint SET status = BA_REJECTED, baRemarks, baReviewedAt
        Portal->>DB: INSERT ComplaintReview (actorRole = BATCH_ADVISOR, action = BA_REJECTED, fromStatus = BA_PENDING, toStatus = BA_REJECTED)
        Portal-->>Student: Notify – complaint rejected
        alt Student revises and resubmits
            Student->>Portal: PATCH edit complaint { complaintId, updatedFields }
            Portal->>DB: UPDATE Complaint SET status = BA_PENDING, updated fields
            Portal->>DB: INSERT ComplaintReview (actorRole = STUDENT, action = SUBMITTED, fromStatus = BA_REJECTED, toStatus = BA_PENDING)
            Portal-->>Student: Resubmitted
        else Student deletes
            Student->>Portal: DELETE complaint { complaintId }
            Portal->>DB: DELETE Complaint (cascades to reviews)
            Portal-->>Student: Deleted
        end
    else BA accepts
        BA->>Portal: POST accept { complaintId, remarks }
        Portal->>DB: UPDATE Complaint SET status = HOD_PENDING, baRemarks, baReviewedAt
        Portal->>DB: INSERT ComplaintReview (actorRole = BATCH_ADVISOR, action = BA_ACCEPTED, fromStatus = BA_PENDING, toStatus = HOD_PENDING)
        Portal-->>Student: Notify – forwarded to HOD
    end

    HOD->>Portal: GET complaints queue
    Portal->>DB: SELECT Complaint WHERE targetDepartment = HOD.dept AND status = HOD_PENDING
    DB-->>Portal: Complaint list
    Portal-->>HOD: Render queue

    alt HOD rejects
        HOD->>Portal: POST reject { complaintId, remarks }
        Portal->>DB: UPDATE Complaint SET status = HOD_REJECTED, hodRemarks, hodReviewedAt
        Portal->>DB: INSERT ComplaintReview (actorRole = HOD, action = HOD_REJECTED, fromStatus = HOD_PENDING, toStatus = HOD_REJECTED)
        Portal-->>Student: Notify – complaint rejected
    else HOD accepts
        HOD->>Portal: POST accept { complaintId, remarks }
        Portal->>DB: UPDATE Complaint SET status = HOD_ACCEPTED, hodRemarks, hodReviewedAt
        Portal->>DB: INSERT ComplaintReview (actorRole = HOD, action = HOD_ACCEPTED, fromStatus = HOD_PENDING, toStatus = HOD_ACCEPTED)
        Portal-->>Student: Notify – complaint resolved
    else HOD reassigns to another department
        HOD->>Portal: POST reassign { complaintId, toDepartment, reason }
        Portal->>DB: UPDATE Complaint SET targetDepartment = toDepartment, status = REASSIGNED
        Portal->>DB: INSERT ComplaintAssignment (fromDept, toDept, reason)
        Portal->>DB: INSERT ComplaintReview (actorRole = HOD, action = HOD_REASSIGNED, fromStatus = HOD_PENDING, toStatus = REASSIGNED)
        Portal->>DB: UPDATE Complaint SET status = HOD_PENDING
        Note over DB: Complaint now appears in receiving HOD's queue
        Portal-->>HOD: Reassigned
    end
```

**Actors:** Student, Batch Advisor, HOD
**System components:** Next.js server actions, PostgreSQL via Prisma
**Key interactions:**

- Student's department is read from DB at submission — `targetDepartment` is never sent by the client
- Every state transition writes two DB rows in a transaction: the `Complaint` update and a `ComplaintReview` audit entry
- Reassignment writes three rows: `Complaint` update, `ComplaintAssignment` log, `ComplaintReview` entry — then immediately flips status back to `HOD_PENDING` for the receiving department
- The `BA_REJECTED → BA_PENDING` resubmit loop also creates a review entry so the full edit history is preserved

---

## 5. Authentication and access control

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Portal as Next.js (Middleware + Server Actions)
    participant BetterAuth as better-auth
    participant DB as PostgreSQL (Prisma)

    User->>Browser: Navigate to protected route
    Browser->>Portal: GET /student/dashboard
    Portal->>BetterAuth: requireSession() – read session cookie
    BetterAuth->>DB: SELECT Session WHERE token = cookie AND expiresAt > now()
    DB-->>BetterAuth: No valid session
    BetterAuth-->>Portal: Unauthorized
    Portal-->>Browser: Redirect to /login

    User->>Browser: Submit login form (email, password)
    Browser->>Portal: POST /api/auth/sign-in/email
    Portal->>BetterAuth: signInEmail({ email, password })
    BetterAuth->>DB: SELECT User + Account WHERE email = email
    DB-->>BetterAuth: User record

    alt Invalid credentials
        BetterAuth-->>Portal: Auth error
        Portal-->>Browser: 401 – invalid credentials
    else Valid credentials
        BetterAuth->>DB: INSERT Session (token, userId, expiresAt)
        DB-->>BetterAuth: Session created
        BetterAuth-->>Portal: Session token
        Portal-->>Browser: Set-Cookie (session token) + redirect to role dashboard
    end

    User->>Browser: Trigger server action (e.g. submit form)
    Browser->>Portal: POST server action payload
    Portal->>BetterAuth: requireSession()
    BetterAuth->>DB: SELECT Session JOIN User WHERE token = cookie
    DB-->>BetterAuth: Valid session { user: { id, role } }
    BetterAuth-->>Portal: Session confirmed

    Portal->>Portal: requirePermission({ resource: ["action"] })
    Portal->>DB: Evaluate role-based permission for user.role + requested action
    DB-->>Portal: Permission result

    alt Permission denied
        Portal-->>Browser: Error – unauthorized action
    else Permission granted
        Portal->>DB: Execute mutation (INSERT / UPDATE / DELETE)
        DB-->>Portal: Success
        Portal-->>Browser: Success response
    end
```

**Actors:** User (any role)
**System components:** Next.js middleware and server actions, better-auth, PostgreSQL via Prisma
**Key interactions:**

- Every protected route hits `requireSession` before any logic runs — unauthenticated requests never reach DB queries or mutations
- Login flow goes through better-auth which owns credential validation and session creation; the portal never handles raw passwords
- `requirePermission` runs after session validation on every server action — it checks the user's role against the specific resource and action being requested, not just a generic role gate
- Admin role changes take effect on the next request after the user record is updated; the current session is not invalidated, but the re-read role on the next `requireSession` call reflects the change
