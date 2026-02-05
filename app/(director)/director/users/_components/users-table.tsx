"use client";
import { getAllUsersType } from "@/app/data/admin/get-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./user-actions";
import Link from "next/link";

export function UsersTable({ users }: { users: getAllUsersType }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="font-bold text-lg text-primary">
          <TableHead className="w-[100px]">Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>
              <Link
                href={`/director/users/${user.id}`}
                className="hover:text-primary"
              >
                {user.name}
              </Link>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <UserActions
                userId={user.id}
                name={user.name}
                userRole={user.role}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
