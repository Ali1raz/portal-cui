import { StudentSubject } from "@/app/data/student/get-student-subjects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function SubjectCard({ course }: { course: StudentSubject }) {
  return (
    <Card className="mx-auto w-full max-w-xl group">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">{course.name}</CardTitle>
        <Badge variant="primary" className="px-2 text-xs">
          {course.creditHours} Credits
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teacher:</span>
            <span className="font-medium">{course.teacherName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Class:</span>
            <span className="font-medium">{course.className}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href={`/student/subject/${course.offeringId}/attendance`}
                className="flex items-center gap-1 text-sm group-hover:text-primary hover:underline underline-offset-4"
              >
                Attendance <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <span
              className={`text-sm font-bold ${
                course.attendancePercentage < 80
                  ? "text-red-500/50"
                  : "text-green-500/50"
              }`}
            >
              {course.attendancePercentage}%
            </span>
          </div>
          <Progress
            value={course.attendancePercentage}
            className={`h-2 ${
              course.attendancePercentage < 80
                ? "[&>div]:bg-red-500"
                : "[&>div]:bg-green-500"
            }`}
          />

          {course.attendancePercentage < 80 && (
            <p className="text-xs text-red-500 font-medium">
              ⚠️ Below minimum requirement
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
