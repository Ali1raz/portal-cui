import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StudentSidebarAnnouncementItemSkeleton,
  StudentSidebarAnnouncementsListItem,
} from "./student-sidebar-announcement-item";
import { studentGetSidebarAnnouncements } from "@/app/data/student/get-sidebar-announcements";

export async function StudentsSidebarAnnoucementsList() {
  const anns = await studentGetSidebarAnnouncements();

  if (anns.length === 0) {
    return (
      <Card className="w-full p-1 text-center">
        <CardHeader>
          <CardTitle className="font-medium text-base">
            No announcements found
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {anns.map((ann) => (
        <StudentSidebarAnnouncementsListItem key={ann.id} announcement={ann} />
      ))}
    </div>
  );
}

export function StudentsSidebarAnnouncementsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <StudentSidebarAnnouncementItemSkeleton key={i} />
      ))}
    </div>
  );
}
