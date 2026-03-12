---
# Data flow

## Level 0 — system context

The portal is a single system. Everything flows through it.

- **Inputs:**
- Students send leave requests, complaints, fee installment requests, and registration data
- HODs send announcements and review decisions (leave, complaints)
- Batch advisors send review decisions (leave, complaints)
- Accountants send announcements and fee installment definitions
- Admin sends attendance corrections

- **Outputs:**
- Students receive status notifications, announcements, PDF vouchers, and attendance records
- Teachers receive leave request visibility inside attendance records
- HODs receive escalated leave requests and complaints from their department
- Batch advisors receive pending leave requests and complaints from their department
- Accountants receive fee installment requests from students

- **Data stores touched:**
- Users, Students, Professors, HODs, Batch Advisors, Accountants
- Leave requests, Attendance records
- Announcements
- Fee installments (planned)
- Complaints, Complaint reviews, Complaint assignments
---

## Level 1 — main processes

### P1 — Manage leave requests

- **Inputs:** Leave request form (student) · subject and date (student) · review decision + remarks (BA, HOD)
- **Outputs:** Leave status updates → student · leave visibility → teacher attendance table · attendance correction permission → admin
- **Stores read:** Students, Subject offerings, Enrollments
- **Stores written:** Leave requests, Student attendance

### P2 — Manage announcements

- **Inputs:** Announcement content, type, audience targeting, schedule datetime (HOD, Accountant)
- **Outputs:** Published announcements → students (scoped by department, program, batch, year) · scheduled publish trigger → system job (inngest)
- **Stores read:** Users (author), HOD profile, Accountant profile
- **Stores written:** Announcements

### P3 — Manage fee installments

- **Inputs:** Installment definitions (Accountant) · custom split requests (Student)
- **Outputs:** PDF vouchers → student · request status updates → student · review queue → HOD, Accountant
- **Stores read:** Students, Installments (planned)
- **Stores written:** Installments, Installment requests (planned)

### P4 — Manage complaints

- **Inputs:** Complaint form with category, details, attachment (Student) · review decision + remarks (BA, HOD) · department assignment (HOD)
- **Outputs:** Complaint status updates → student · full audit trail (review log) → HOD, BA · reassignment routing → receiving HOD
- **Stores read:** Students, Batch advisors, HODs
- **Stores written:** Complaints, Complaint reviews, Complaint assignments

### P5 — Manage authentication and access control

- **Inputs:** Login credentials (all users) · role assignment (Admin) · session tokens (all users)
- **Outputs:** Session tokens → users · permission checks → all processes (P1–P4) · role-scoped views → each role
- **Stores read:** Users, Accounts, Sessions
- **Stores written:** Sessions, Verifications, User roles

---
