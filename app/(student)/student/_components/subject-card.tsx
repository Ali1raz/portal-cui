import { StudentSubject } from "@/app/data/student/get-student-subjects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SubjectCard({ course }: { course: StudentSubject }) {
  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{course.name}</CardTitle>
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
            <span className="text-sm font-medium">Attendance</span>
            {/* <span
              className={`text-sm font-bold ${
                (course.attendance ?? 70) < 80
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {course.attendance}%
            </span> */}
          </div>

          {/* {(course.attendance ?? 70) < 80 && (
            <p className="text-xs text-red-600 font-medium">
              ⚠️ Below minimum requirement
            </p>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
