import { CUILogo } from "@/components/general/cui-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserAvatarDropdown from "@/components/user/user-avatar";
import { User } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import { SearchDialog } from "../general/search-dialog";

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
        <h1 className="text-base font-medium hidden sm:flex items-center gap-1">
          COMSATS University
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog role={user.role as Role} />
          <ThemeToggle />
          <div className="hidden min-[400px]:flex">
            <UserAvatarDropdown
              email={user.email}
              image={user.image}
              name={user.name}
              role={user.role}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
