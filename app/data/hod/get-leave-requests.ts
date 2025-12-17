import "server-only";
import { requireHodSession } from "./require-hod-session";
import prisma from "@/lib/prisma";

export async function getLeaveRequests() {
  const session = await requireHodSession();

  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!hod) {
    throw new Error("HOD not found");
  }

  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
      student: {
        department: hod?.department,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      date: true,
      reasonTitle: true,
      status: true,
      createdAt: true,
      offering: {
        select: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
      student: {
        select: {
          registrationNo: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return requests;
}
