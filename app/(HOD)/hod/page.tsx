import { requireSession } from "@/app/data/session/require-session";

export default async function HODPage() {
  const user = await requireSession();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <h1>
            Welcome back!{" "}
            <span className="font-bold text-primary">{user.user.name}</span>{" "}
            Here is your department overview.
          </h1>
          <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"></div>
        </div>
      </div>
    </div>
  );
}
