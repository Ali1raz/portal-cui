import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import { Batch, Department, Program } from "@/lib/generated/prisma/enums";
import type { SemesterSearchParams } from "../../(admin)/admin/semester/semester-search-params";

type GetAdminSemestersParams = Pick<
  SemesterSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "query"
  | "department"
  | "batch"
  | "status"
  | "year"
  | "semester"
>;

export async function adminGetSemesters({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  department,
  batch,
  status,
  year,
  semester,
}: GetAdminSemestersParams) {
  const can = await requirePermission({
    semesters: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toUpperCase().replace(/\s+/g, "");
  const numericQuery = Number.parseInt(trimmedQuery, 10);
  const queryIsNumber = Number.isFinite(numericQuery);
  const sessionCodeMatch = normalizedQuery.match(
    /^(?:SEM:?\d{1,2}-?)?(SP|FA)(\d{2,4})-?([BM])?(CS|EN|SE|MATH|BA)$/
  );
  const sessionBatchYearMatch = normalizedQuery.match(/^(SP|FA)(\d{2,4})$/);

  const queryOrClauses: Prisma.SemesterWhereInput[] = [];

  if (trimmedQuery.length > 0) {
    const upperQuery = trimmedQuery.toUpperCase();

    if (Object.values(Department).includes(upperQuery as never)) {
      queryOrClauses.push({ department: upperQuery as Department });
    }

    if (Object.values(Batch).includes(upperQuery as never)) {
      queryOrClauses.push({ batch: upperQuery as Batch });
    }

    if (queryIsNumber) {
      queryOrClauses.push({ year: numericQuery });
      queryOrClauses.push({ semester: numericQuery });
    }

    if (sessionCodeMatch) {
      const [, batchCode, yearCode, programCode, departmentCode] =
        sessionCodeMatch;

      const parsedYear =
        yearCode.length === 2 ? 2000 + Number(yearCode) : Number(yearCode);

      queryOrClauses.push({
        AND: [
          { batch: batchCode as Batch },
          { year: parsedYear },
          { department: departmentCode as Department },
          ...(programCode ? [{ program: programCode as Program }] : []),
        ],
      });
    }

    if (sessionBatchYearMatch) {
      const [, batchCode, yearCode] = sessionBatchYearMatch;
      const parsedYear =
        yearCode.length === 2 ? 2000 + Number(yearCode) : Number(yearCode);

      queryOrClauses.push({
        AND: [{ batch: batchCode as Batch }, { year: parsedYear }],
      });
    }
  }

  const where: Prisma.SemesterWhereInput = {
    ...(queryOrClauses.length > 0 ? { OR: queryOrClauses } : {}),
    ...(department ? { department } : {}),
    ...(batch ? { batch } : {}),
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {}),
    ...(typeof year === "number" ? { year } : {}),
    ...(typeof semester === "number" ? { semester } : {}),
  };

  const orderBy: Prisma.SemesterOrderByWithRelationInput =
    sortBy === "semester"
      ? { semester: direction }
      : sortBy === "year"
        ? { year: direction }
        : sortBy === "department"
          ? { department: direction }
          : sortBy === "batch"
            ? { batch: direction }
            : sortBy === "isActive"
              ? { isActive: direction }
              : sortBy === "startDate"
                ? { startDate: direction }
                : sortBy === "registrationStart"
                  ? { registrationStart: direction }
                  : sortBy === "enrollmentStart"
                    ? { enrollmentStart: direction }
                    : sortBy === "offerings"
                      ? { subjectOfferings: { _count: direction } }
                      : sortBy === "registrations"
                        ? { registrations: { _count: direction } }
                        : { createdAt: "desc" };

  const [semesters, totalCount] = await Promise.all([
    prisma.semester.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      where,
      orderBy,
      select: {
        id: true,
        semester: true,
        year: true,
        department: true,
        batch: true,
        program: true,
        isActive: true,
        startDate: true,
        endDate: true,
        registrationStart: true,
        registrationEnd: true,
        enrollmentStart: true,
        enrollmentEnd: true,
        addDeadline: true,
        dropDeadline: true,
        lateDropDeadline: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            subjectOfferings: true,
          },
        },
      },
    }),
    prisma.semester.count({ where }),
  ]);

  return { semesters, totalCount };
}

export type AdminSemester = Awaited<
  ReturnType<typeof adminGetSemesters>
>["semesters"][number];
