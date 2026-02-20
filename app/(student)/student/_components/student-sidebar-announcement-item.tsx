import { StudentSidebarAnnouncementType } from "@/app/data/student/get-sidebar-announcements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserImage } from "@/components/user/user-image";
import { getRelativeTime } from "@/lib/utils";
import { PinIcon } from "lucide-react";

export function StudentSidebarAnnouncementsListItem({
  announcement,
}: {
  announcement: StudentSidebarAnnouncementType;
}) {
  return (
    <Card className="p-1 *:p-2 hover:bg-sidebar/85 gap-0 space-y-0 relative">
      <CardHeader>
        {announcement.isPinned && (
          <PinIcon
            className="text-muted-foreground absolute rotate-60 -top-1 left-1"
            size={16}
          />
        )}
        <CardTitle className="flex items-start justify-between gap-2">
          <h1 className="line-clamp-2">{announcement.title}</h1>
          <span className="text-xs text-muted-foreground">
            {getRelativeTime(
              new Date(announcement.publishedAt || announcement.createdAt)
            )}
          </span>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {announcement.content}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 items-center">
        <UserImage
          image={announcement.author.image}
          name={announcement.author.name}
          className="size-6"
        />
        <span className="text-sm line-clamp-1">{announcement.author.name}</span>
        <span className="text-sm ml-auto">{announcement.author.role}</span>
      </CardContent>
    </Card>
  );
}

export function StudentSidebarAnnouncementItemSkeleton() {
  return (
    <Card className="p-1 *:p-2 gap-0 space-y-0 animate-pulse">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </CardTitle>
        <CardDescription className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 items-center">
        <div className="size-6 rounded-full bg-muted"></div>
        <div className="h-3 bg-muted rounded w-1/4"></div>
        <div className="h-3 bg-muted rounded w-1/6 ml-auto"></div>
      </CardContent>
    </Card>
  );
}
