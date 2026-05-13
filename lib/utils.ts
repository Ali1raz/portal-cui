import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import {
  ComplaintCategory,
  DepartmentToAssignComplaintTo,
  Role,
} from "./generated/prisma/enums";

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string,
  dateFormat = "dd MMM yyyy"
): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return format(parsedDate, dateFormat);
}

export function formatEnumLabel(value: string): string {
  const label = value.toLowerCase().replaceAll("_", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getRelativeTime(date: Date) {
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const ASSIGNABLE_ROLES = Object.values(Role).filter(
  (r) => r !== Role.BATCH_ADVISOR && r !== Role.STUDENT
);

/**
 * Utility functions for date filtering and formatting
 */

export const USER_JOINED_AT_FILTER_DAYS = [7, 30, 60] as const;

export function isUserJoinedAtFilterDay(
  days: number
): days is (typeof USER_JOINED_AT_FILTER_DAYS)[number] {
  return (USER_JOINED_AT_FILTER_DAYS as readonly number[]).includes(days);
}

/**
 * Calculate the date range for "last N days" filter
 * @param days - Number of days back (e.g., 7, 30, 60)
 * @returns Object with startDate and endDate (all time today)
 */
export function getDateRangeFromDaysAgo(days: number): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

/**
 * Get label for joined date filter
 */
export function getJoinedAtLabel(
  days: (typeof USER_JOINED_AT_FILTER_DAYS)[number] | null
): string {
  if (days && USER_JOINED_AT_FILTER_DAYS.includes(days)) {
    return `Last ${days} days`;
  }

  return "All time";
}

export function categoryToDepartment(
  category: ComplaintCategory
): DepartmentToAssignComplaintTo {
  switch (category) {
    case "ACADEMIC":
      return "ACADEMIC_AFFAIRS";
    case "ADMINISTRATIVE":
      return "REGISTRAR";
    case "FACULTY":
      return "ACADEMIC_AFFAIRS"; // fallback
    case "FACILITY":
      return "FACILITIES";
    case "HARASSMENT":
      return "STUDENT_AFFAIRS";
    case "OTHER":
      return "DEAN_OF_STUDENTS";
  }
}
