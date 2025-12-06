import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const user = await auth.api.getSession({
    headers: await headers(),
  });

  // console.log(user?.user);

  return (
    <div>
      {user ? (
        <pre>{JSON.stringify(user.user, null, 2)}</pre>
      ) : (
        <div>
          Not Logged In
          <Link href="/login">go to login</Link>
        </div>
      )}
    </div>
  );
}
