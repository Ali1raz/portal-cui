---
name: table
description: Create production-ready tables with TanStack Table, featuring URL-based filtering, sorting, pagination, and drag-and-drop column reordering using nuqs
---

# Data Table Implementation Guide

Create feature-rich, accessible data tables with server-side filtering, sorting, pagination, and draggable columns. All state is synced to URL search params for shareable links and browser navigation.

## Architecture Overview

**4-File Pattern:**

1. **Search Params Types** (`{entity}-search-params.ts`) - Shared types and nuqs parsers
2. **Data Fetching** (`data/{role}/get-{entities}.ts`) - Server-side query with filters
3. **Table Component** (`_components/{entities}-table.tsx`) - Client component with TanStack Table
4. **Page Component** (`page.tsx`) - Server component that coordinates everything

## Step-by-Step Implementation

### Step 1: Define Search Params Types

Create `{entity}-search-params.ts` in the page directory.

**Purpose:** Define reusable types and nuqs parsers for URL state management.

**Required Elements:**

- Sort column enum with all sortable columns
- Sort direction enum (`asc`, `desc`)
- Filter value enums (departments, statuses, etc.)
- nuqs parsers with sensible defaults
- Search params cache for server-side parsing
- TypeScript type exports

**Example Structure:**

```typescript
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

// 1. Define allowed values as const arrays
export const sortByValues = ["name", "createdAt", "status"] as const;
export const sortDirValues = ["asc", "desc"] as const;
export const statusValues = ["ACTIVE", "INACTIVE", "PENDING"] as const;

// 2. Export types
export type SortBy = (typeof sortByValues)[number];
export type SortDir = (typeof sortDirValues)[number];
export type Status = (typeof statusValues)[number];

// 3. Define parsers with defaults
export const searchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(sortByValues)
    .withDefault("name")
    .withOptions({ clearOnDefault: true }),

  // Add more filters as needed
};

// 4. Create cache for server-side parsing
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

// 5. Export inferred type
export type SearchParams = Awaited<ReturnType<typeof searchParamsCache.parse>>;
```

**Key Patterns:**

- Use `clearOnDefault: true` to keep URLs clean
- Make filters optional with `.withOptions({ clearOnDefault: true })` only (no `.withDefault()`)
- Use `parseAsInteger` for numeric filters (IDs, years, semester numbers)
- Use `parseAsStringEnum` for known value sets

### Step 2: Create Data Fetching Function

Create `data/{role}/get-{entities}.ts` for server-side queries.

**Purpose:** Fetch filtered, sorted, paginated data from database.

**Required Elements:**

- Import search params type
- Build Prisma `where` clause from filters
- Build Prisma `orderBy` from sort params
- Implement pagination with `skip`/`take`
- Return both data array and total count
- Include permission checks

**Example Structure:**

```typescript
import "server-only";

type GetEntitiesParams = Pick<
  SearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query" | "status"
>;

/// Fetches paginated, filtered, and sorted entities for admin view
export async function getEntities({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
}: GetEntitiesParams) {
  // 1. Check permissions
  await requirePermission({ resource: ["list"] });

  // 2. Sanitize inputs

  // 3. Build where clause
  const where: Prisma.EntityWhereInput = {
    // Text search
    ...(trimmedQuery
      ? {
          OR: [
            { name: { contains: trimmedQuery, mode: "insensitive" } },
            { email: { contains: trimmedQuery, mode: "insensitive" } },
          ],
        }
      : {}),
    // Exact filters
    ...(status ? { status } : {}),
  };

  // 4. Build orderBy (handle relation sorting)

  // 5. Fetch data + count in parallel
  const [entities, totalCount] = await Promise.all([
    prisma.entity.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        // Only select needed fields
        //...
      },
    }),
    prisma.entity.count({ where }),
  ]);

  return { entities, totalCount };
}

export type GetEntitiesType = Awaited<
  ReturnType<typeof getEntities>
>["entities"][number];
```

**Key Patterns:**

- Use `Promise.all()` for data + count (eliminates waterfall)
- Handle relation sorting with nested orderBy
- Use `mode: "insensitive"` for case-insensitive search
- Export inferred type for table component
- Always sanitize page/pageSize with `Math.max()`

### Step 3: Build Table Component

Create `_components/{entities}-table.tsx` as client component.

**Purpose:** Interactive table with drag-and-drop, sorting, filtering UI.

**Required Elements:**

- `"use client"` directive
- `useQueryStates` from nuqs for URL state
- `useReactTable` with manual pagination/sorting
- DnD Kit setup for column reordering
- Filter UI (Input, Select, etc.)
- Clear filters button
- Pagination controls
- Loading states with `useTransition`

**Key Patterns:**

- Wrap state updates in `startTransition()` for loading states
- Reset page to 1 when filters/sorting change
- Use `"use no memo"` at component top for React Compiler
- Add `aria-busy={isPending}` for accessibility
- Throttle URL updates to prevent excessive history entries

### Step 4: Create Page Component

Create `page.tsx` as server component with Suspense.

**Purpose:** Coordinate data fetching and rendering.

**Required Elements:**

- Parse search params on server
- Pass params to data function
- Wrap table in Suspense with skeleton
- Handle TypeScript with PageProps type

**Key Patterns:**

- Separate data fetching into async component inside Suspense
- Use descriptive JSDoc comments for components
- Match skeleton structure to actual table
- Keep page component simple and declarative

## Best Practices

### Performance

- ✅ Use `Promise.all()` in data fetching (parallel queries)
- ✅ Throttle URL updates (`limitUrlUpdates: { method: "throttle", timeMs: 1000 }`)
- ✅ Use `startTransition()` for non-urgent updates
- ✅ Select only required fields in Prisma queries
- ✅ Reset page to 1 when filters change

### Accessibility

- ✅ Add `aria-busy={isPending}` to table container
- ✅ Add `aria-live="polite"` to pagination info
- ✅ Add `aria-label` to icon-only buttons
- ✅ Use semantic HTML (Label for inputs)
- ✅ Support keyboard navigation for drag-and-drop

### URL State Management

- ✅ Use `clearOnDefault: true` to keep URLs clean
- ✅ Use `history: "replace"` to avoid cluttering browser history
- ✅ Store all filter state in URL (shareable links!)
- ✅ Use `shallow: false` for proper Next.js navigation

### Developer Experience

- ✅ Export inferred types from data functions
- ✅ Use TypeScript const enums for allowed values
- ✅ Add JSDoc comments to server functions
- ✅ Separate concerns (search params, data, UI)

## Common Patterns

### Relation Sorting (Sort by Related Entity)

```typescript
const orderBy: Prisma.EntityOrderByWithRelationInput =
  sortBy === "userName"
    ? { user: { name: direction } }
    : sortBy === "departmentName"
      ? { department: { name: direction } }
      : { createdAt: "desc" };
```

### Count-Based Sorting (Sort by Relation Count)

```typescript
const orderBy: Prisma.EntityOrderByWithRelationInput =
  sortBy === "enrollments"
    ? { enrollments: { _count: direction } }
    : { name: "asc" };
```

### Multi-Field Search

```typescript
const where: Prisma.EntityWhereInput = {
  ...(trimmedQuery
    ? {
        OR: [
          { name: { contains: trimmedQuery, mode: "insensitive" } },
          { email: { contains: trimmedQuery, mode: "insensitive" } },
          { code: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      }
    : {}),
};
```

### Date Range Filtering

```typescript
// In search params
startDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
endDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),

// In where clause
...(startDate || endDate
  ? {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    }
  : {}),
```

## What to Avoid

❌ **Don't use client-side filtering/sorting** - Use server-side for large datasets
❌ **Don't forget to reset page** - Always reset to page 1 when filters change
❌ **Don't skip Suspense** - Required for loading states
❌ **Don't mutate arrays** - Use `.toSorted()` instead of `.sort()`
❌ **Don't forget permission checks** - Always validate in data functions
❌ **Don't select unnecessary fields** - Only fetch what you render
❌ **Don't hardcode sortable columns** - Use type-safe enums

## Reference Files

**Complete Implementation Examples:**

- Table Component: `app\(admin)\admin\offering\_components\offerings-table.tsx`
- Search Params: `app\(admin)\admin\offering\offering-search-params.ts`
- Page Component: `app\(admin)\admin\offering\page.tsx`
- Data Fetching: `app\data\admin\get-offerings.ts`
- Date in table filters: `app\(student)\student\complaints\_components\complaints-table.tsx`
- for bulk actions in table: `app\(student)\student\complaints\_components\complaints-table.tsx` and `app\(HOD)\hod\announcements\_components\announcements-table.tsx`

Study these files for complete patterns including:

- Draggable column headers with grip handles
- Custom filter UI (Select, Input, DatePicker)
- Pagination controls with first/previous/next/last buttons
- Empty states and loading skeletons
- Row actions menus
- Custom cell rendering
- bulk actions
- calender
- dates filter
