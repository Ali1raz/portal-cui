import { CUILogo } from "@/components/general/cui-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatarDropdown from "@/components/user/user-avatar";
import { User } from "@/lib/auth";

export function StudentSiteHeader({ user }: { user: User }) {
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
          <ThemeToggle />
          {/* <div className="hidden min-[400px]:flex"> */}
          <UserAvatarDropdown
            email={user.email}
            image={user.image}
            name={user.name}
            role={user.role}
          />
          {/* </div> */}
          <Tooltip>
            <TooltipContent>
              <Kbd>Ctrl</Kbd>
              <Kbd>m</Kbd>
            </TooltipContent>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1" side="right" />
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
