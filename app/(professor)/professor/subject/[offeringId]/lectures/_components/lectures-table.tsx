"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  XIcon,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { formatDate } from "@/lib/utils";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import { APP } from "@/lib/data/utils";
import type { GetOfferingLecturesType } from "@/app/data/professor/get-lectures";
import { LectureActions } from "./lecture-actions";
import {
  lecturesSearchParamsParsers,
  type LecturesSortBy,
} from "../lectures-search-params";

interface LecturesTableProps {
  lectures: GetOfferingLecturesType[];
  offeringId: string;
  totalCount: number;
}

export function LecturesTable({ lectures, offeringId }: LecturesTableProps) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  const [queryState, setQueryState] = useQueryStates(
    lecturesSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
    }
  );

  const pagination = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "date" ||
    queryState.sortDir !== "desc" ||
    queryState.topic.length > 0;

  const filteredLectures = React.useMemo(() => {
    let result = [...lectures];

    // Filter by topic
    if (queryState.topic.trim()) {
      const query = queryState.topic.toLowerCase();
      result = result.filter((lecture) =>
        lecture.topic.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let compare = 0;
      if (queryState.sortBy === "topic") {
        compare = a.topic.localeCompare(b.topic);
      } else if (queryState.sortBy === "createdAt") {
        compare = a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        // date (default)
        compare = a.date.getTime() - b.date.getTime();
      }

      return queryState.sortDir === "asc" ? compare : -compare;
    });

    return result;
  }, [lectures, queryState.topic, queryState.sortBy, queryState.sortDir]);

  const paginatedLectures = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredLectures.slice(start, end);
  }, [filteredLectures, pagination.pageIndex, pagination.pageSize]);

  const maxPages = Math.ceil(filteredLectures.length / pagination.pageSize);

  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < maxPages - 1;

  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-56">
          <Label htmlFor="lectures-search" className="sr-only">
            Search by topic
          </Label>
          <Input
            id="lectures-search"
            placeholder="Search by topic..."
            value={queryState.topic}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => {
                void setQueryState({
                  topic: nextValue.trim().length > 0 ? nextValue : "",
                  page: 1,
                });
              });
            }}
          />
        </div>

        <Select
          value={queryState.sortBy}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                sortBy: value as LecturesSortBy,
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="topic">Topic</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={queryState.sortDir}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                sortDir: value as "asc" | "desc",
              });
            });
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveParams && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              startTransition(() => {
                void setQueryState(null);
              });
            }}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLectures.length > 0 ? (
              paginatedLectures.map((lecture) => {
                const presents = lecture.attendances.filter(
                  (a) => a.status === "PRESENT"
                ).length;
                const absents = lecture.attendances.filter(
                  (a) => a.status === "ABSENT"
                ).length;
                const leaves = lecture.attendances.filter(
                  (a) => a.status === "LEAVE"
                ).length;

                return (
                  <TableRow key={lecture.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(lecture.date.toISOString())}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {lecture.startTime} - {lecture.endTime}
                    </TableCell>
                    <TableCell>
                      <MiddleTruncateText text={lecture.topic} maxLength={30} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center text-sm">
                        <span className="text-green-600 font-medium">
                          {presents} P
                        </span>
                        <span className="text-red-600 font-medium">
                          {absents} A
                        </span>
                        <span className="text-amber-600 font-medium">
                          {leaves} L
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <LectureActions
                        offeringId={offeringId}
                        recordId={lecture.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No lectures found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Label htmlFor={tableId} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  pageSize: Number(value),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id={tableId} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto">
              {APP.page_sizes.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min(
                pagination.pageIndex * pagination.pageSize +
                  pagination.pageSize,
                filteredLectures.length
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground">{filteredLectures.length}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => {
                    startTransition(() => {
                      void setQueryState({ page: 1 });
                    });
                  }}
                  disabled={!canPreviousPage}
                  aria-label="Go to first page"
                >
                  <ChevronFirst aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => {
                    startTransition(() => {
                      void setQueryState({ page: pagination.pageIndex });
                    });
                  }}
                  disabled={!canPreviousPage}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => {
                    startTransition(() => {
                      void setQueryState({ page: pagination.pageIndex + 2 });
                    });
                  }}
                  disabled={!canNextPage}
                  aria-label="Go to next page"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => {
                    startTransition(() => {
                      void setQueryState({ page: maxPages });
                    });
                  }}
                  disabled={!canNextPage}
                  aria-label="Go to last page"
                >
                  <ChevronLast aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
