import prisma from "@/lib/prisma";

export default async function Home() {
  const user = await prisma.user.findFirst({
    select: { id: true, name: true },
  });

  return (
    <div className="">
      {user && (
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome, {user.name}!
        </h1>
      )}
    </div>
  );
}
