import { requireSession } from "@/app/data/session/require-session";
import { UserDetailsSection } from "@/components/user/user-details-section";
import { getHodDetails } from "./get-hod-details";

export default async function HODPage() {
  const [session, hod] = await Promise.all([requireSession(), getHodDetails()]);

  const hodDetails = [{ label: "Department", value: hod.department }];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="p-4 md:py-6">
          <UserDetailsSection user={session.user} details={hodDetails} />
          <h1>
            Welcome back!{" "}
            <span className="font-bold text-primary">{session.user.name}</span>{" "}
            Here is your department overview.
          </h1>
        </div>
      </div>
    </div>
  );
}
