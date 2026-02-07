import { getAdminUsers } from "@/app/data/admin/get-admin-users";
import { UsersTable } from "./_components/users-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usersSearchParamsCache,
  type UsersSearchParams,
} from "./users-search-params";

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">All Users</h1>
      </div>
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function UsersList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/users">["searchParams"];
}) {
  const parsedParams: UsersSearchParams =
    await usersSearchParamsCache.parse(searchParams);
  const { users, totalCount } = await getAdminUsers(parsedParams);

  return <UsersTable users={users} totalCount={totalCount} />;
}

/// Loading skeleton for users table.
function UsersTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 5 }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
