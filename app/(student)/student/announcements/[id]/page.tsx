import { studentGetAnnouncementById } from "@/app/data/student/get-announcement-by-id";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserImage } from "@/components/user/user-image";
import { getRelativeTime } from "@/lib/utils";
import { PinIcon, ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GeneralImage } from "@/components/general/general-image";

export default async function AnnouncementDetailPage(
  props: PageProps<"/student/announcements/[id]">
) {
  const { id } = await props.params;

  return (
    <div className="@container/main p-4 space-y-4">
      <Link
        href="/student/announcements"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "flex items-center gap-2",
        })}
      >
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Announcements
      </Link>
      <h1 className="text-2xl font-bold">Announcement Details</h1>
      <Suspense fallback={<AnnouncementDetailSkeleton />}>
        <AnnouncementDetail id={id} />
      </Suspense>
    </div>
  );
}

async function AnnouncementDetail({ id }: { id: string }) {
  await new Promise((res) => setTimeout(res, 3500));
  const announcement = await studentGetAnnouncementById(id);

  return (
    <div className="max-w-5xl space-y-4">
      <h2 className="text-xl font-bold">{announcement.title}</h2>

      <div className="text-sm text-muted-foreground ml-auto">
        Created{" "}
        {getRelativeTime(
          new Date(announcement.publishedAt || announcement.createdAt)
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Badge>{announcement.type}</Badge>
        {announcement.isPinned && (
          <Badge variant="secondary" className="gap-1">
            <PinIcon className="h-3 w-3" />
            Pinned
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-base">
        <UserImage
          image={announcement.author.image}
          name={announcement.author.name}
          className="size-10"
        />
        <span className="font-medium text-foreground">
          {announcement.author.name}
        </span>
        <div className="text-sm text-primary">{announcement.author.role}</div>
      </div>

      <div className="space-y-6">
        {announcement.imageKey && (
          <div className="rounded-lg overflow-hidden border">
            <GeneralImage
              height={600}
              width={600}
              src={announcement.imageKey}
              alt={announcement.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h1 className="text-xl font-bold">Announcement Details</h1>
          <p className="whitespace-pre-wrap">{announcement.content}</p>
        </div>
        <div className="pt-4 border-t text-xs text-muted-foreground">
          Published on{" "}
          {new Date(
            announcement.publishedAt || announcement.createdAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

function AnnouncementDetailSkeleton() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}
