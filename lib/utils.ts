import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { Role } from "./generated/prisma/enums";
import { randomBytes } from "crypto";
import { SITE_INFO } from "./data/SITE";

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
  (r) => r !== Role.BATCH_ADVISOR
);

/**
 * Generates a random password.
 *
 * @param length - The length of the password to generate.
 * @returns A string generated password.
 */

export function generatePassword({ length = 8 }): string {
  return randomBytes(length).toString("base64").slice(0, length);
}

export function generateStudentEmail({ regNo }: { regNo: string }): string {
  return `${regNo.toLowerCase()}@${SITE_INFO.domain}`;
}
