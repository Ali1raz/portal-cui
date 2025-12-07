import { requireSession } from "@/app/data/session/require-session";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UserImage } from "@/components/user-image";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <Card className="max-w-xl mx-auto pt-18">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <UserImage name={user.name} image={user.image} className="size-24" />
          <div className="mt-4 text-2xl font-bold">{user.name}</div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
