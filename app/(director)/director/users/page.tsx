import { getAllUsers } from "@/app/data/admin/get-users";
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
import { requirePermission } from "@/app/data/permission/require-permission";
import { redirect } from "next/navigation";

async function UsersTableWrapper() {
  const has = await requirePermission({
    user: ["list", "get"],
  });
  if (!has) {
    return redirect("/unauthorized");
  }
  const users = await getAllUsers();

  return <UsersTable users={users} />;
}

/// Loading skeleton for users table
function UsersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-6 w-[200px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[250px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[220px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[200px]" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-6 w-[150px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[250px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[220px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[150px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function UsersPage() {
  return (
    <div className="w-full overflow-hidden flex flex-col gap-4 md:gap-6">
      <div className="flex flex-1 flex-col py-4 md:py-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6 px-4 lg:px-6">
            <div>
              <h2 className="font-bold text-2xl">Students</h2>
            </div>
            <div className="">
              <Suspense fallback={<UsersTableSkeleton />}>
                <UsersTableWrapper />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
