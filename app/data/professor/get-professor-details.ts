import "server-only";
import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";

export async function isProfessorBA() {
  const session = await requireSession();

  const professor = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: { batchAdvisor: { select: { id: true } } },
  });

  return !!professor?.batchAdvisor;
}
