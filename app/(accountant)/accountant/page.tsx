import { requireSession } from "@/app/data/session/require-session";

export default async function AccountantDashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome,{" "}
          <span className="text-primary">
            {session.user.name.split(" ")[0]}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Manage fee announcements and financial communications for students.
        </p>
      </div>

      <div>dashboard</div>
    </div>
  );
}
