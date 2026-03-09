import "server-only";
import { requirePermission } from "../permission/require-permission";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function baGetComplaintForUpdate({ id }: { id: string }) {
  const can = await requirePermission({
    complaints: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const compl = await prisma.complaint.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      hodRemarks: true,
      createdAt: true,
      student: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!compl) {
    return notFound();
  }

  return compl;
}
