import { Metadata } from "next";
import { adminGetOfferingDetails } from "@/app/data/admin/get-offering-details";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserImage } from "@/components/user/user-image";
import { IconTrendingUp } from "@tabler/icons-react";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

export const metadata: Metadata = {
  title: "Offering Details",
  description: "Review subject offering details, assigned teachers.",
};

export default async function OfferingIdPage(
  props: PageProps<"/admin/offering/[offeringId]">
) {
  const { offeringId } = await props.params;
  const { offeringDetails, teachingAssignments, totalEnrollments } =
    await adminGetOfferingDetails(offeringId);

  return (
    <main className="@container/main">
      <h1 className="text-2xl font-bold mb-4">Offering Details</h1>
      <section className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Enrollmetns</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalEnrollments}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total number of student enrolled in this offering{" "}
              <IconTrendingUp className="size-4" />
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Teachers Assignments</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {teachingAssignments.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Teachers assigned to this offering
            </div>
            {teachingAssignments.length === 0 ? (
              <Link
                href={
                  `/admin/offering/${offeringId}/assign` as ComponentProps<
                    typeof Link
                  >["href"]
                }
                className="underline"
              >
                Assign a teacher to this offering
              </Link>
            ) : null}
          </CardFooter>
        </Card>
      </section>

      <section className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>More info about this offering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm flex flex-wrap gap-4 w-full">
              {/* add links to each here */}
              <Badge variant="secondary">
                Department: {offeringDetails?.department}
              </Badge>
              <Badge variant="secondary">
                Semester: {offeringDetails?.semester?.semester}
              </Badge>
              <Badge variant="secondary">
                Year: {offeringDetails?.semester?.year}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="max-w-[400px]">
                <CardHeader>
                  <CardTitle>Subject Info</CardTitle>
                  <CardDescription>
                    Info about the subject for this offering.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value={offeringDetails?.subject.id ?? "subject"}
                    >
                      <AccordionTrigger>
                        <h1 className="flex items-center gap-2">
                          {offeringDetails?.subject.name} -{" "}
                          {offeringDetails?.subject.code}
                        </h1>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                          <p> Subject Name</p>
                          <Link
                            href={`/admin/subjects/${offeringDetails?.subject.id}`}
                            className="hover:underline hover:text-primary underline-offset-4 flex items-center gap-2"
                          >
                            {offeringDetails?.subject.name}
                            <ArrowUpRightIcon className="size-4" />
                          </Link>
                          <div>
                            Subject Code: {offeringDetails?.subject.code}
                          </div>
                          <div>
                            Credit Hrs: {offeringDetails?.subject.creditHours}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card className="max-w-[400px]">
                <CardHeader>
                  <CardTitle>Teacher Info</CardTitle>
                  <CardDescription>
                    Info about the profesor assigned to this subject offering.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {teachingAssignments.length === 0 ? (
                      <div className="text-sm">
                        <p>No teacher assigned to this offering.</p>
                        <Link
                          href={
                            `/admin/offering/${offeringId}/assign` as ComponentProps<
                              typeof Link
                            >["href"]
                          }
                          className="underline"
                        >
                          Assign a teacher
                        </Link>
                      </div>
                    ) : (
                      teachingAssignments.map(({ professor, section }) => (
                        <AccordionItem
                          key={professor.employeeNo}
                          value={professor.employeeNo}
                        >
                          <AccordionTrigger>
                            <h1 className="flex items-center gap-4">
                              <UserImage
                                image={professor.user.image}
                                className="w-8 h-8"
                              />
                              {professor.user.name}
                            </h1>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2">
                            <div className="flex items-center gap-2">
                              Name:{" "}
                              <Link
                                href={`/admin/users/${professor.user.id}`}
                                className="hover:text-primary hover:underline underline-offset-4"
                              >
                                {professor.user.name}
                              </Link>{" "}
                              <ArrowUpRightIcon className="size-4" />
                            </div>
                            <div>Emp Nr: {professor.employeeNo}</div>
                            <div>Class: {section ?? "A"}</div>
                            <div>
                              Total Subjects Teaching:{" "}
                              {professor._count.teachingAssignments}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
