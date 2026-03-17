# Modules

## 1. Leave module

Students submit leave requests tied to a specific subject and date. The system rejects duplicates upfront. From there, requests go up a chain of review:

- **Student** submits form → status: `PENDING`
- **Teacher** sees the leave status inline in the attendance table (read-only)
- **Batch advisor** reviews all requests from their department:
  - Requests more info → `REVIEW_REQUESTED`, student notified with remarks; student updates and resubmits → back to `PENDING`
  - Accepts → forwarded to HOD (`HOD_PENDING`), student notified
  - Rejects → `REJECTED`, student notified
- **HOD** makes the final call:
  - Accepts → `APPROVED`; admin can update attendance retroactively, even if already marked
  - Rejects → `REJECTED`, student notified

**State transition:**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> PENDING : Student submits

    PENDING --> PENDING : Teacher views (read-only)
    PENDING --> REVIEW_REQUESTED : BA requests more info · student notified
    PENDING --> HOD_PENDING : BA accepts · student notified
    PENDING --> REJECTED : BA rejects · student notified

    REVIEW_REQUESTED --> PENDING : Student resubmits

    HOD_PENDING --> APPROVED : HOD accepts · admin can edit attendance
    HOD_PENDING --> REJECTED : HOD rejects · student notified

    APPROVED --> [*]
    REJECTED --> [*]
```

---

## 2. Announcement module

HODs post to their department. Accountants post to everyone. Students read.

- HOD announcements are scoped to their department only
- Accountant announcements reach all students across departments
- Announcements can be created immediately or scheduled ahead of time

**State transition:**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> DRAFT : Author saves draft

    DRAFT --> PUBLISHED : Author publishes immediately
    DRAFT --> SCHEDULED : Author sets a future datetime
    DRAFT --> [*] : Author deletes

    SCHEDULED --> PUBLISHED : Auto-publish at scheduledFor · system (inngest)
    SCHEDULED --> DRAFT : Author cancels schedule

    PUBLISHED --> ARCHIVED : Author archives / expires
    PUBLISHED --> [*] : Author deletes

    ARCHIVED --> PUBLISHED : Author restores
    ARCHIVED --> [*] : Author deletes
```

---

## 3. Fee installments module

Accountants define a base installment structure (e.g., 70+30). Students can request to further split any due installment, provided the total count doesn't exceed 3. These requests follow a two-step approval chain.

- **Accountant** pre-defines base installments (70+30, etc.)
- **Student** can request a split (e.g., pay 50 of 70) → status: `PENDING`
- **HOD** reviews the split request:
  - Accepts → forwarded to Accountant (`HOD_APPROVED`)
  - Rejects → status: `REJECTED`, student notified
- **Accountant** makes the final call on HOD-approved requests:
  - Accepts → status: `APPROVED`, new vouchers generated
  - Rejects → status: `REJECTED`, student notified

**State transition:**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> PENDING : Student requests split

    PENDING --> HOD_APPROVED : HOD accepts
    PENDING --> REJECTED : HOD rejects

    HOD_APPROVED --> APPROVED : Accountant accepts
    HOD_APPROVED --> REJECTED : Accountant rejects

    APPROVED --> [*] : Balance zero
    REJECTED --> [*] : Student deletes/ends
```

---

## 4. Complaints module

Students file complaints with a category, description, and an optional attachment. There are two stages of review before anything gets acted on:

- **Student** submits → status: `BA_PENDING`; can edit or delete while in `BA_PENDING`, `BA_REVIEW_REQUESTED`, or `BA_REJECTED`
- **Batch advisor** reviews complaints from their department:
  - Requests more info → `BA_REVIEW_REQUESTED`, remarks added, student notified; student updates and resubmits → back to `BA_PENDING`
  - Accepts → forwarded to HOD (`HOD_PENDING`), student notified
  - Rejects → `BA_REJECTED`, student notified; student can revise & resubmit → back to `BA_PENDING`, or delete permanently
- **HOD** reviews batch-advisor-approved complaints:
  - Requests more info → `HOD_REVIEW_REQUESTED`, remarks added, student notified; student updates and resubmits → back to `HOD_PENDING`
  - Accepts → resolved (`HOD_ACCEPTED`), student notified
  - Rejects → `HOD_REJECTED`, student notified
  - Reassigns → routed to another department (`REASSIGNED`)

**State transition:**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> BA_PENDING : Student submits

    BA_PENDING --> BA_PENDING : Student edits (still pending)
    BA_PENDING --> BA_REVIEW_REQUESTED : BA requests more info · student notified
    BA_PENDING --> HOD_PENDING : BA accepts · student notified
    BA_PENDING --> BA_REJECTED : BA rejects · student notified

    BA_REVIEW_REQUESTED --> BA_PENDING : Student resubmits

    BA_REJECTED --> BA_PENDING : Student revises & resubmits
    BA_REJECTED --> [*] : Student deletes

    HOD_PENDING --> HOD_REVIEW_REQUESTED : HOD requests more info · student notified
    HOD_PENDING --> HOD_ACCEPTED : HOD accepts · resolved · student notified
    HOD_PENDING --> HOD_REJECTED : HOD rejects · student notified
    HOD_PENDING --> REASSIGNED : HOD reassigns to another dept

    HOD_REVIEW_REQUESTED --> HOD_PENDING : Student resubmits

    REASSIGNED --> HOD_PENDING : Receiving HOD picks up

    HOD_ACCEPTED --> [*]
    HOD_REJECTED --> [*]
```
