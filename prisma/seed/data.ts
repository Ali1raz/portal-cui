import {
  Batch,
  Department,
  Program,
  Role,
} from "../../lib/generated/prisma/enums";

export const DEPARTMENTS = Object.values(Department);
export const BATCHES = Object.values(Batch);
export const PROGRAMS = Object.values(Program);

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  // Optional specific fields for generation/linking
  department?: Department;
  program?: Program;
  batch?: Batch;
  employeeNo?: string;

  // Relationships
  teaches?: string[]; // Array of Subject Codes
  enrolled?: string[]; // Array of Subject Codes
}

export const SEED_USERS: SeedUser[] = [
  // --- DIRECTORS ---
  {
    id: "user-director-01",
    name: "Director Fury",
    email: "director@example.com",
    role: Role.DIRECTOR,
  },

  // --- ACCOUNTANTS ---
  {
    id: "user-accountant-01",
    name: "Accountant Strange",
    email: "accountant@example.com",
    role: Role.ACCOUNTANT,
  },

  // --- PROFESSORS ---
  // HODs (One per department)
  {
    id: "user-hod-cs-01",
    name: "Dr. Tony Stark",
    email: "hod.cs@example.com",
    role: Role.PROFESSOR,
    department: Department.CS,
    employeeNo: "CS-HOD-01",
    teaches: ["CS101"], // Teaches Intro to Computing
  },
  {
    id: "user-hod-se-01",
    name: "Dr. Bruce Banner",
    email: "hod.se@example.com",
    role: Role.PROFESSOR,
    department: Department.SE,
    employeeNo: "SE-HOD-01",
    teaches: ["CS102"], // Teaches Programming Fundamentals
  },
  {
    id: "user-hod-en-01",
    name: "Dr. Stephen Strange",
    email: "hod.en@example.com",
    role: Role.PROFESSOR,
    department: Department.EN,
    employeeNo: "EN-HOD-01",
    teaches: ["ENG101"],
  },
  {
    id: "user-hod-math-01",
    name: "Dr. Hank Pym",
    email: "hod.math@example.com",
    role: Role.PROFESSOR,
    department: Department.MATH,
    employeeNo: "MATH-HOD-01",
    teaches: ["MTH101"],
  },
  {
    id: "user-hod-ba-01",
    name: "Dr. Pepper Potts",
    email: "hod.ba@example.com",
    role: Role.PROFESSOR,
    department: Department.BA,
    employeeNo: "BA-HOD-01",
    teaches: ["BA101"],
  },
  // Regular Professors
  {
    id: "user-prof-cs-02",
    name: "Dr. Peter Parker",
    email: "prof.cs@example.com",
    role: Role.PROFESSOR,
    department: Department.CS,
    employeeNo: "CS-EMP-02",
    teaches: [], // Removed CS102 to avoid conflict with HOD SE
  },
  {
    id: "user-prof-se-02",
    name: "Dr. Natasha Romanoff",
    email: "prof.se@example.com",
    role: Role.PROFESSOR,
    department: Department.SE,
    employeeNo: "SE-EMP-02",
    teaches: [], // Removed CS101 to avoid conflict with HOD CS
  },

  // --- STUDENTS ---
  {
    id: "user-std-cs-01",
    name: "Steve Rogers",
    email: "student.roger@example.com",
    role: Role.STUDENT,
    department: Department.CS,
    program: Program.B,
    batch: Batch.FA,
    enrolled: ["CS101", "CS102", "MTH101", "ENG101"],
  },
  {
    id: "user-std-se-01",
    name: "Nick Barton",
    email: "student.barton@example.com",
    role: Role.STUDENT,
    department: Department.SE,
    program: Program.B,
    batch: Batch.SP,
    enrolled: ["CS101", "CS102"],
  },
  {
    id: "user-std-math-01",
    name: "Wanda Maximoff",
    email: "student.wanda@example.com",
    role: Role.STUDENT,
    department: Department.MATH,
    program: Program.B,
    batch: Batch.FA,
    enrolled: ["MTH101", "ENG101"],
  },
];

export interface SeedSubject {
  id: string; // Fixed ID
  name: string;
  code: string;
  departments: Department[];
}

export const SEED_SUBJECTS: SeedSubject[] = [
  {
    id: "subj-cs-101",
    name: "Intro to Computing",
    code: "CS101",
    departments: [Department.CS, Department.SE],
  },
  {
    id: "subj-cs-102",
    name: "Programming Fundamentals",
    code: "CS102",
    departments: [Department.CS, Department.SE],
  },
  {
    id: "subj-math-101",
    name: "Calculus I",
    code: "MTH101",
    departments: [Department.CS, Department.SE, Department.MATH],
  },
  {
    id: "subj-eng-101",
    name: "Functional English",
    code: "ENG101",
    departments: [Department.CS, Department.SE, Department.EN, Department.BA],
  },
  {
    id: "subj-ba-101",
    name: "Intro to Business",
    code: "BA101",
    departments: [Department.BA],
  },
];
