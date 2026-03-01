import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { requireSession } from "../session/require-session";
import type { AtRiskStudentsSearchParams } from "@/app/(HOD)/hod/at-risk-students-search-params";
import { APP } from "@/lib/data/utils";

type AggKey = `${string}|${string}`;

type AtRiskStudentsParams = Pick<
  AtRiskStudentsSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query"
>;

/**
 * At-risk = effective attendance < 80%.
 * Effective % = (PRESENT + LEAVE) / total × 100
 * Raw % = PRESENT / total × 100
 */
export async function hodGetAtRiskStudents({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
}: AtRiskStudentsParams) {
  const session = await requireSession();
  const hod = await prisma.hod.findFirst({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!hod) {
    return redirect("/unauthorized");
  }

  const rows = await prisma.studentAttendance.findMany({
    where: {
      student: { department: hod.department },
    },
    select: {
      studentId: true,
      status: true,
      record: {
        select: {
          offeringId: true,
          offering: {
            select: {
              id: true,
              subject: { select: { name: true, code: true } },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          registrationNo: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  const agg = new Map<
    AggKey,
    {
      present: number;
      leave: number;
      absent: number;
      studentName: string;
      registrationNo: string;
      subjectName: string;
      subjectCode: string;
    }
  >();

  for (const r of rows) {
    const offeringId = r.record.offering.id;
    const key: AggKey = `${r.studentId}|${offeringId}`;
    const subj = r.record.offering.subject;
    const existing = agg.get(key);

    if (!existing) {
      agg.set(key, {
        present: 0,
        leave: 0,
        absent: 0,
        studentName: r.student.user.name ?? "",
        registrationNo: r.student.registrationNo,
        subjectName: subj.name,
        subjectCode: subj.code,
      });
    }

    const cur = agg.get(key)!;
    if (r.status === AttendanceStatus.PRESENT) cur.present += 1;
    else if (r.status === AttendanceStatus.LEAVE) cur.leave += 1;
    else cur.absent += 1;
  }

  let result = [];

  for (const [key, v] of agg) {
    const total = v.present + v.leave + v.absent;
    if (total === 0) continue;

    const effectivePct = (100 * (v.present + v.leave)) / total;
    const rawPct = (100 * v.present) / total;

    if (effectivePct >= APP.EFFECTIVE_THRESHOLD_PCT) continue;

    const [studentId, offeringId] = key.split("|") as [string, string];
    result.push({
      studentId,
      studentName: v.studentName,
      registrationNo: v.registrationNo,
      offeringId,
      subjectName: v.subjectName,
      subjectCode: v.subjectCode,
      total,
      present: v.present,
      leave: v.leave,
      absent: v.absent,
      effectivePct: Math.round(effectivePct * 10) / 10,
      rawPct: Math.round(rawPct * 10) / 10,
    });
  }

  // Apply client-side search filter
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase();
    result = result.filter((row) => {
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.registrationNo.toLowerCase().includes(q) ||
        row.subjectCode.toLowerCase().includes(q) ||
        row.subjectName.toLowerCase().includes(q)
      );
    });
  }

  const totalCount = result.length;

  // Apply sorting
  result.sort((a, b) => {
    let compareResult = 0;

    switch (sortBy) {
      case "student":
        compareResult = a.studentName.localeCompare(b.studentName);
        break;
      case "subject":
        compareResult = a.subjectCode.localeCompare(b.subjectCode);
        break;
      case "effectivePct":
        compareResult = a.effectivePct - b.effectivePct;
        break;
      case "rawPct":
        compareResult = a.rawPct - b.rawPct;
        break;
      case "total":
        compareResult = a.total - b.total;
        break;
      case "present":
        compareResult = a.present - b.present;
        break;
      case "leave":
        compareResult = a.leave - b.leave;
        break;
      case "absent":
        compareResult = a.absent - b.absent;
        break;
      default:
        compareResult = a.effectivePct - b.effectivePct;
    }

    if (sortDir === "desc") {
      compareResult = -compareResult;
    }

    return compareResult;
  });

  // Apply pagination
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const startIndex = (safePage - 1) * safePageSize;
  const paginatedResult = result.slice(startIndex, startIndex + safePageSize);

  return {
    students: paginatedResult,
    totalCount,
  };
}

/// Return type for at-risk students query result.
export type HodAtRiskStudentType = Awaited<
  ReturnType<typeof hodGetAtRiskStudents>
>["students"][number];
