import { CUILogo } from "@/components/general/cui-logo";
import { SignOutButton } from "@/components/general/signout-button";
import Link from "next/link";

export default function ClerkLayou({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between p-4 border-b">
          <CUILogo
            textClasses="block max-[490px]:hidden font-medium"
            className="flex items-center gap-1"
          />
          <div className="flex items-center gap-4">
            <Link href={"/clerk/applications"}>Applications</Link>
            <Link href={"/profile"}>Profile</Link>
            <SignOutButton />
          </div>
        </header>
      </nav>
      <main className="max-w-6xl w-full px-4 mx-auto md:px-8 py-4 space-y-4 md:space-y-6">
        {children}
      </main>
    </>
  );
}
