import { adminGetUserData } from "@/app/data/admin/get-user-data";
import { UserImage } from "@/components/user/user-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/app/data/permission/require-permission";
import { redirect } from "next/navigation";

export default async function UsersPage(
  props: PageProps<"/director/users/[userId]">
) {
  const userId = (await props.params).userId;
  const canSeeUser = await requirePermission({
    user: ["get"],
  });

  if (!canSeeUser) {
    redirect("/unauthorized");
  }

  const user = await adminGetUserData(userId);

  return (
    <div className="flex flex-col gap-4 md:gap-6 md:pb-6 px-4 lg:px-6 py-4 md:py-6">
      <h2 className="font-bold text-2xl">User Details</h2>

      <Card className="mx-auto max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="space-y-4">
            <UserImage
              image={user.image}
              name={user.name}
              className="md:size-24 size-16"
            />
            <span className="text-primary font-bold text-2xl">{user.name}</span>
          </CardTitle>
          <CardDescription className="flex items-center gap-8">
            <span>{user.email}</span>
            <Badge className="bg-primary text-primary-foreground">
              {user.role}
            </Badge>
          </CardDescription>
        </CardHeader>
        <Separator className="bg-primary/50 max-w-[80%] mx-auto" />
        <CardContent>
          <div>
            <h3 className="font-bold text-2xl mb-4">Additional Info</h3>
            {user.student && (
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "Registration Nr",
                    value: user.student.registrationNo,
                  },
                  { label: "Since", value: formatDate(user.student.createdAt) },
                ].map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <h2 className="font-bold">{field.label}:</h2>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {user.professor && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  { label: "Department", value: user.professor.department },
                  {
                    label: "Programs",
                    value: user.professor.programs?.join(", ") || "-",
                  },
                  {
                    label: "Since",
                    value: formatDate(user.professor.createdAt),
                  },
                ].map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <h2 className="font-bold">{field.label}:</h2>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {user.hod && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  { label: "Department", value: user.hod.department },
                  { label: "Since", value: formatDate(user.hod.createdAt) },
                ].map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <h2 className="font-bold">{field.label}:</h2>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {user.director && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  {
                    label: "Since",
                    value: formatDate(user.director.createdAt),
                  },
                ].map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <h2 className="font-bold">{field.label}:</h2>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {user.accountant && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  {
                    label: "Since",
                    value: formatDate(user.accountant.createdAt),
                  },
                ].map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <h2 className="font-bold">{field.label}:</h2>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
