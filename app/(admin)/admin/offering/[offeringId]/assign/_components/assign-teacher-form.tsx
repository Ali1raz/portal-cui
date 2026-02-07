"use client";

import {
  AdminOfferingAssignOffering,
  AdminOfferingAssignProfessor,
} from "@/app/data/admin/get-offering-assign-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserImage } from "@/components/user/user-image";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { assignTeacherToOffering } from "../actions";
import { assignTeacherSchema, AssignTeacherSchemaType } from "../schema";

/// Props for the assign teacher form.
type AssignTeacherFormProps = {
  offering: AdminOfferingAssignOffering;
  professors: AdminOfferingAssignProfessor[];
};

export function AssignTeacherForm({
  offering,
  professors,
}: AssignTeacherFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentAssignment = offering.teachingAssignments[0]?.professor;

  const form = useForm<AssignTeacherSchemaType>({
    resolver: zodResolver(assignTeacherSchema),
    defaultValues: {
      professorId: currentAssignment?.id ?? "",
    },
    mode: "onChange",
  });

  function onSubmit(values: AssignTeacherSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        assignTeacherToOffering(offering.id, values)
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/admin/offering/${offering.id}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Teacher</CardTitle>
        <CardDescription>
          Select a professor to teach {offering.subject.name} for this offering.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select professor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          <div className="flex items-center gap-2">
                            <UserImage
                              image={professor.user.image}
                              className="h-6 w-6"
                            />
                            <span>
                              {professor.user.name} · {professor.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Assigning..." : "Assign teacher"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
