import { CUILogo } from "@/components/general/cui-logo";
import UserAvatarDropdown from "@/components/general/user-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@/lib/auth";

export function SiteHeader({ user }: { user: User }) {
  return (
    <header className="flex shrink-0 items-center border-b transition-[width,height] ease-linear ">
      <div className="flex w-full items-center py-2 gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-8"
        />
        <CUILogo showText={false} width={60} height={60} />
        <h1 className="text-base font-medium">Students Portal</h1>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserAvatarDropdown
            email={user.email}
            image={user.image}
            name={user.name}
          />
        </div>
      </div>
    </header>
  );
}
