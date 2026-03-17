# Activity workflows

Activity diagrams describe the step-by-step process within each system function, including decision branches, validation checks, and database interactions.

---

## P1 — Leave request workflow

1. Student opens the leave request form and picks a subject and a date
2. System checks for a duplicate — same student, same subject offering, same date
   - Duplicate found → reject with validation error, stop
3. System stores the request with status `PENDING`; request remains `PENDING` until a reviewer acts on it
4. Teacher opens the attendance table for their subject — leave request status is visible inline, no action required
5. Batch advisor opens the leave requests queue for their department, sees all `PENDING` and `REVIEW_REQUESTED` requests
6. Batch advisor reviews each request (individually or in bulk):
   - Requests more info → status set to `REVIEW_REQUESTED`, student notified with remarks; student updates details and resubmits → status resets to `PENDING`
   - Rejects → status set to `REJECTED`, student notified, workflow ends
   - Accepts → status set to `HOD_PENDING`, student notified, request moves to HOD queue
7. HOD opens the leave requests queue, sees all `HOD_PENDING` requests for their department
8. HOD reviews each request:
   - Rejects → status set to `REJECTED`, student notified, workflow ends
   - Accepts → status set to `APPROVED`, student notified
9. Admin sees the approved leave request flagged in the attendance record and can override the attendance status even if already marked by the teacher

---

## P2 — Announcement workflow

1. Author (HOD or Accountant) opens the announcement form and fills in title, content, type, and optional audience filters (department, program, batch, year) and optional banner image
2. Author chooses publish mode:
   - **Immediate** → status set to `PUBLISHED`, `publishedAt` stamped, workflow continues at step 5
   - **Draft** → status set to `DRAFT`, saved but not visible to students, workflow pauses until author returns
   - **Scheduled** → author picks a future datetime (must be within 2 days), status set to `SCHEDULED`
3. For scheduled announcements: system queues an inngest job with the target datetime
4. Inngest job sleeps until `scheduledFor` — at that point it flips status to `PUBLISHED` and stamps `publishedAt`
5. Students query the published feed — announcements are filtered by their department, program, batch, and year; pinned announcements surface first
6. Author can update content at any time while the announcement is in `DRAFT` or `SCHEDULED`
7. Author can change lifecycle status at any time:
   - `PUBLISHED` → `ARCHIVED` to hide from students without deleting
   - `ARCHIVED` → `PUBLISHED` to restore
   - Any status → deleted permanently

---

## P3 — Fee installment workflow _(planned)_

1. Accountant opens the installment management page and defines up to three installments for the current semester (amount, due date, description)
2. System stores each installment and makes them visible to all enrolled students
3. Student opens their installments page and sees each installment with its due date and amount
4. Student can download a pre-generated PDF voucher for any installment instantly
5. Student submits a custom split request if the default installment plan doesn't work — provides preferred amounts and dates with a reason
6. Request lands in the review queue for HOD and Accountant
7. Reviewer opens the request:
   - Rejects → request closed, student notified with remarks
   - Accepts → installment plan updated to reflect the new split, student notified, new vouchers generated

---

## P4 — Complaint workflow

1. Student opens the complaint form and fills in category, title, details, and an optional attachment
2. System stores the complaint with status `BA_PENDING` and `targetDepartment` set to the student's own department
3. Student can edit or delete the complaint while it is in `BA_PENDING`, `BA_REVIEW_REQUESTED`, or `BA_REJECTED`
4. Batch advisor opens the complaints queue for their department, sees all `BA_PENDING` and `BA_REVIEW_REQUESTED` complaints
5. Batch advisor reviews each complaint:
   - Requests more info → status set to `BA_REVIEW_REQUESTED`, remarks added, student notified; student updates details and resubmits → status resets to `BA_PENDING`
   - Rejects → status set to `BA_REJECTED`, review log entry created, student notified
     - Student can revise and resubmit → status resets to `BA_PENDING`, new review log entry created
     - Student can delete instead → complaint removed permanently
   - Accepts → status set to `HOD_PENDING`, review log entry created, student notified
6. HOD opens the complaints queue, sees all `HOD_PENDING` and `HOD_REVIEW_REQUESTED` complaints targeting their department
7. HOD reviews each complaint:
   - Requests more info → status set to `HOD_REVIEW_REQUESTED`, remarks added, student notified; student updates details and resubmits → status resets to `HOD_PENDING`
   - Rejects → status set to `HOD_REJECTED`, review log entry created, student notified, workflow ends
   - Accepts → status set to `HOD_ACCEPTED`, review log entry created, student notified, workflow ends
   - Reassigns → HOD picks a different target department and provides a reason; `targetDepartment` updated, assignment log entry created, status set to `REASSIGNED` then immediately to `HOD_PENDING` in the receiving department
8. Receiving HOD picks up the reassigned complaint and follows the same review step (step 7)

---

## P5 — Authentication and access control workflow

1. User navigates to any portal page — server checks for a valid session via `requireSession`
   - No session found → redirect to login
2. User submits login credentials (email and password)
3. better-auth validates credentials against the accounts store
   - Invalid → return error, user stays on login page
   - Valid → session created, session token stored, user redirected to their role-scoped dashboard
4. Every server action and data fetch runs `requireSession` to confirm the session is still valid, then runs `requirePermission` with the specific permission needed for that action
   - Session expired → user redirected to login
   - Permission denied → action blocked, error returned
5. Admin assigns or changes a user's role — user record updated, existing session reflects new role on next request
6. Each role sees a different layout and navigation: students see their portal, professors see attendance and leave queues, batch advisors see review queues, HODs see department-wide views, accountants see fee and announcement tools, admin sees the full system
