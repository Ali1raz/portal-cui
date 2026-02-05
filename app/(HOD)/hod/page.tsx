import { requireHodSession } from "@/app/data/hod/require-hod-session";

export default async function HODPage() {
  const user = await requireHodSession();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <h1>
            Welcome back!{" "}
            <span className="font-bold text-primary">{user.user.name}</span>{" "}
            Here is your department overview.
          </h1>
        </div>
      </div>
    </div>
  );
}
