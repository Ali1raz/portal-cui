import { Metadata } from "next";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { requireSession } from "../data/session/require-session";
import { StudentLayoutProvider } from "./student/_components/student-layout-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | Student Dashboard",
    default: "Student Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (session.user.role !== Role.STUDENT) {
    return redirect("/unauthorized");
  }

  return (
    <>
      <StudentLayoutProvider user={session.user}>
        {children}
      </StudentLayoutProvider>
    </>
  );
}
