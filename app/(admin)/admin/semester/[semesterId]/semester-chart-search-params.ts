import { createSearchParamsCache, parseAsInteger } from "nuqs/server";

export const semesterChartDaysValues = [7, 30, 60] as const;

export type SemesterChartDays = (typeof semesterChartDaysValues)[number];

export const semesterChartSearchParamsParsers = {
  chartDays: parseAsInteger
    .withDefault(30)
    .withOptions({ clearOnDefault: true }),
};

export const semesterChartSearchParamsCache = createSearchParamsCache(
  semesterChartSearchParamsParsers
);

export type SemesterChartSearchParams = Awaited<
  ReturnType<typeof semesterChartSearchParamsCache.parse>
>;

export function normalizeSemesterChartDays(value: number): SemesterChartDays {
  if (value === 7 || value === 30 || value === 60) {
    return value;
  }

  return 30;
}
