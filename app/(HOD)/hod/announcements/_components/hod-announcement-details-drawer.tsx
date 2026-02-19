"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { HodAnnouncementRow } from "@/app/data/hod/get-announcements";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { GeneralImage } from "@/components/general/general-image";
import Link from "next/link";
import { Pencil } from "lucide-react";

const statusVariantMap: Record<
  AnnouncementStatus,
  "warning" | "info" | "success" | "destructive" | "secondary"
> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  PUBLISHED: "success",
  ARCHIVED: "destructive",
};

/// Drawer to show announcement details from the list.
export function HodAnnouncementDetailsDrawer({
  announcement,
  children,
}: {
  /// Announcement row data for details.
  announcement: HodAnnouncementRow;
  children?: React.ReactNode;
}) {
  return (
    <Drawer direction={"right"} closeThreshold={0.6}>
      <DrawerTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline">
            View
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="no-scrollbar overflow-y-auto px-4">
        <DrawerHeader>
          <DrawerTitle>Announcement details</DrawerTitle>
          <DrawerDescription>
            Review announcement metadata and message content.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 pb-6">
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{announcement.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusVariantMap[announcement.status]}
                appearance="light"
                size="sm"
              >
                {formatEnumLabel(announcement.status)}
              </Badge>
              <Badge variant="info" appearance="light" size="sm">
                {formatEnumLabel(announcement.type)}
              </Badge>
              {announcement.isPinned ? (
                <Badge variant="warning" appearance="light" size="sm">
                  Pinned
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Created</span>
              <span className="text-foreground">
                {formatDate(announcement.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Scheduled</span>
              <span className="text-foreground">
                {announcement.scheduledFor
                  ? formatDate(announcement.scheduledFor)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Published</span>
              <span className="text-foreground">
                {announcement.publishedAt
                  ? formatDate(announcement.publishedAt)
                  : "-"}
              </span>
            </div>
            <div className="">
              <span>Attachment</span>

              {announcement.imageKey && (
                <GeneralImage
                  height={180}
                  width={80}
                  className="aspect-video h-auto w-full rounded-md object-cover "
                  src={announcement.imageKey}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Message</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {announcement.content}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/hod/announcements/${announcement.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
