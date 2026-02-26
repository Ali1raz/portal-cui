import { StudentSubject } from "@/app/data/student/get-student-subjects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function SubjectCard({ subject }: { subject: StudentSubject }) {
  return (
    <Card className="mx-auto w-full max-w-xl group">
      <CardHeader className="flex items-baseline justify-between">
        <CardTitle className="text-base">{subject.name}</CardTitle>
        <Badge variant="primary" className="px-2 text-xs bg-primary/80">
          {subject.creditHours} Credits
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 mt-auto">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Code:</span>
            <span className="font-medium">{subject.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teacher:</span>
            <span className="font-medium">{subject.teacherName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Class:</span>
            <span className="font-medium">{subject.className}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href={`/student/subject/${subject.offeringId}/attendance`}
                className="flex items-center gap-1 text-sm group-hover:text-primary hover:underline underline-offset-4"
              >
                Attendance <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <span
              className={`text-sm font-bold ${
                subject.attendancePercentage < 80
                  ? "text-red-500/50"
                  : "text-green-500/50"
              }`}
            >
              {subject.attendancePercentage}%
            </span>
          </div>
          <Progress
            value={subject.attendancePercentage}
            className={`h-2 ${
              subject.attendancePercentage < 80
                ? "[&>div]:bg-red-500"
                : "[&>div]:bg-green-500"
            }`}
          />

          {subject.attendancePercentage < 80 && (
            <p className="text-xs text-red-500 font-medium">
              ⚠️ Below minimum requirement
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
