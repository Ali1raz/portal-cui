---
description: Data tables with TanStack Table, nuqs URL state, server-side filtering/sorting/pagination, draggable columns. Follow 4-file pattern from .github/prompts/table.prompt.md.
globs: "**/*-table*.tsx"
alwaysApply: false
---

# Data Table Implementation

When creating or editing feature tables, use the **4-file pattern** and sync all state to URL via nuqs.

## 4-File Pattern

1. **Search params** – `{entity}-search-params.ts`: sort/filter enums, nuqs parsers, `createSearchParamsCache` for server. Use `clearOnDefault: true`, optional filters without `.withDefault()`.
2. **Data** – `app/data/{role}/get-{entities}.ts`: accept params from search params type, build Prisma `where`/`orderBy`, `Promise.all([findMany, count])`, permission checks, export `GetEntitiesType` from return type.
3. **Table** – `_components/{entities}-table.tsx`: `"use client"`, `useQueryStates(parsers)`, `useReactTable` with manual pagination/sorting, DnD Kit for column reorder, filters (Input/Select/DatePicker), `startTransition` for updates, `aria-busy={isPending}`.
4. **Page** – `page.tsx`: parse search params on server, pass to data function, wrap table in `<Suspense fallback={<Skeleton />}>`.

## Must-dos

- **Server-side only**: filtering, sorting, pagination in the data layer (no client-side for large lists).
- **URL state**: filters, sort, page, pageSize in nuqs; reset page to 1 when filters/sort change.
- **Performance**: `Promise.all()` for data + count; throttle URL updates (`limitUrlUpdates: { method: "throttle", timeMs: 1000 }`).
- **Types**: Use inferred row type from data function, e.g. `ColumnDef<GetLeaveRequestsType>[]`; for nested fields use `accessorFn: (row) => row.relation.field` and `row.original` in cells.
- **Avoid**: client-side filter/sort, skipping Suspense, mutating arrays (use `.toSorted()`), missing permission checks in data layer.

## Reference

Full guide: `.github/prompts/table.prompt.md`. Examples: `app/(admin)/admin/offering/_components/offerings-table.tsx`, `app/(admin)/admin/offering/offering-search-params.ts`, `app/(HOD)/hod/leave-requests/_components/leave-requests-table.tsx`, `app/data/hod/get-leave-requests.ts`.
