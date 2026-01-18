import { requireSession } from "@/app/data/session/require-session";
import { UserDetailsSection } from "@/components/user/user-details-section";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
        <UserDetailsSection user={user} />
      </div>
    </div>
  );
}
