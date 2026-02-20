import { studentGetAllAnnouncements } from "@/app/data/student/get-all-annoucements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PinIcon } from "lucide-react";
import { Suspense } from "react";
import { getRelativeTime } from "@/lib/utils";
import { UserImage } from "@/components/user/user-image";
import Link from "next/link";

export default function StudentAnnouncementsPage() {
  return (
    <div className="@container/main p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Announcements</h2>
        <p className="text-sm text-muted-foreground">
          View all announcements from your department HOD
        </p>
      </div>
      <Suspense fallback={<AnnouncementsSkeleton />}>
        <AnnouncementsList />
      </Suspense>
    </div>
  );
}

async function AnnouncementsList() {
  const announcements = await studentGetAllAnnouncements();

  if (!announcements || announcements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No announcements available at the moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {announcements.map((ann) => (
        <Link key={ann.id} href={`/student/announcements/${ann.id}`}>
          <Card className="relative hover:shadow-lg transition-shadow h-full cursor-pointer">
            {ann.isPinned && (
              <PinIcon
                className="absolute -top-1 right-2 text-muted-foreground rotate-45"
                size={20}
              />
            )}
            <CardHeader>
              <CardTitle className="flex items-start gap-2 justify-between">
                <h1 className="line-clamp-2 text-base">{ann.title}</h1>
                <span className="text-sm text-muted-foreground">
                  {getRelativeTime(new Date(ann.publishedAt || ann.createdAt))}
                </span>
              </CardTitle>
              <CardDescription className="">
                <p className="line-clamp-3 text-sm">{ann.content}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-auto">
              <div>
                <Badge>{ann.type}</Badge>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <UserImage
                  image={ann.author.image}
                  name={ann.author.name}
                  className="size-8"
                />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">{ann.author.name}</span>
                  <span className="mx-1">•</span>
                  <span>{ann.author.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
