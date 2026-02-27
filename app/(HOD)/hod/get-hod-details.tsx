import { requireSession } from "@/app/data/session/require-session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getHodDetails() {
  const session = await requireSession();

  const hod = await prisma.hod.findFirst({
    where: {
      userId: session.user.id, // Use the authenticated user's ID
    },
    select: {
      id: true,
      department: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!hod) {
    return redirect("/unauthorized");
  }

  return hod;
}
