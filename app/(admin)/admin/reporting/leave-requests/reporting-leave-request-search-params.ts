import { APP } from "@/lib/data/utils";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const reportingLeaveRequestsSortByValues = [
  "studentName",
  "department",
  "subject",
  "reasonTitle",
  "date",
  "createdAt",
  "status",
] as const;

export const reportingLeaveRequestsSortDirValues = ["asc", "desc"] as const;

export const reportingLeaveRequestStatusValues = [
  "all",
  ...Object.values(LeaveStatus),
];

export const reportingLeaveRequestSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(reportingLeaveRequestsSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(reportingLeaveRequestsSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  studentName: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  requestNo: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  semesterId: parseAsString.withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(
    Object.values(reportingLeaveRequestStatusValues)
  ).withOptions({
    clearOnDefault: true,
  }),
  startDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
};

export const reportingLeaveRequestSearchParamsCache = createSearchParamsCache(
  reportingLeaveRequestSearchParamsParsers
);

export type ReportingLeaveRequestSearchParams = Awaited<
  ReturnType<typeof reportingLeaveRequestSearchParamsCache.parse>
>;
