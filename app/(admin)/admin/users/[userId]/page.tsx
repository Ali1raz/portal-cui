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
import { redirect } from "next/navigation";
import { requirePermission } from "@/app/data/permission/require-permission";
import { ChangeUserRoleDialog } from "../_components/change-role";
import { SetDepartmentDialog } from "../_components/set-department-dialog";
import { MakeBatchAdvisorDialog } from "../_components/make-batchadvisor-dialog";

export default async function AdminUserDetailsPage(
  props: PageProps<"/admin/users/[userId]">
) {
  const userId = (await props.params).userId;

  const canSeeUser = await requirePermission({ user: ["get"] });
  if (!canSeeUser) redirect("/unauthorized");

  const user = await adminGetUserData(userId);

  return (
    <div className="@container/main">
      <Card>
        <CardHeader>
          <CardTitle className="space-y-4">
            <UserImage
              image={user.image}
              name={user.name}
              className="md:size-24 size-16"
            />
            <span className="text-primary font-bold text-2xl">{user.name}</span>
          </CardTitle>
          <CardDescription className="flex sm:items-center sm:flex-row flex-col sm:gap-8 gap-4">
            <span>{user.email}</span>
            <div className="flex items-center flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">
                {user.role}
              </Badge>
              {user.role === "PROFESSOR" && !user.professor?.department && (
                <Badge>Department not specified</Badge>
              )}
            </div>
          </CardDescription>
          <div className="flex items-center flex-wrap w-full gap-2 mt-4">
            <ChangeUserRoleDialog
              userRole={user.role}
              userId={userId}
              name={user.name}
            />
            {user.role === "PROFESSOR" && !user.professor?.department ? (
              <SetDepartmentDialog userId={userId} name={user.name} />
            ) : null}
            {user.role === "PROFESSOR" &&
            user.professor?.department &&
            !user.batchAdvisor ? (
              <MakeBatchAdvisorDialog userId={userId} name={user.name} />
            ) : null}
          </div>
        </CardHeader>
        <Separator className="bg-primary/50 max-w-[80%] mx-auto" />
        <CardContent>
          <div>
            <h3 className="font-bold text-2xl mb-4">Additional Info</h3>
            {/* ── Student ── */}
            {user.student && (
              <InfoGrid
                fields={[
                  {
                    label: "Registration No",
                    value: user.student.registrationNo,
                  },
                  { label: "Since", value: formatDate(user.student.createdAt) },
                ]}
              />
            )}
            {/* ── Professor ── */}
            {user.professor && (
              <InfoGrid
                fields={[
                  {
                    label: "Department",
                    value: user.professor.department || "Not specified",
                  },

                  {
                    label: "Since",
                    value: formatDate(user.professor.createdAt),
                  },
                ]}
              />
            )}
            {/* ── HOD ── */}
            {user.hod && (
              <InfoGrid
                fields={[
                  {
                    label: "Department",
                    value: user.hod.department || "Not specified",
                  },
                  { label: "Since", value: formatDate(user.hod.createdAt) },
                ]}
              />
            )}
            {/* ── Director ── */}
            {user.director && (
              <InfoGrid
                fields={[
                  {
                    label: "Since",
                    value: formatDate(user.director.createdAt),
                  },
                ]}
              />
            )}
            {/* ── Accountant ── */}
            {user.accountant && (
              <InfoGrid
                fields={[
                  {
                    label: "Since",
                    value: formatDate(user.accountant.createdAt),
                  },
                ]}
              />
            )}
            {/* ── Batch Advisor ── */}
            {user.batchAdvisor && (
              <>
                <Separator className="my-4 max-w-[60%]" />
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Batch Advisor Appointment
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
                <InfoGrid
                  fields={[
                    {
                      label: "Department",
                      value: user.batchAdvisor.department,
                    },
                    {
                      label: "Employee No",
                      value: user.batchAdvisor.professor.employeeNo,
                    },
                    {
                      label: "Appointed",
                      value: formatDate(user.batchAdvisor.appointedAt),
                    },
                  ]}
                />
              </>
            )}
            {!user.student &&
              !user.professor &&
              !user.hod &&
              !user.director &&
              !user.accountant &&
              !user.batchAdvisor && (
                <p className="text-muted-foreground text-sm mt-2">
                  No additional profile information available for this user.
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type InfoField = {
  label: string;
  value: string;
};

// ── Shared display component ────────────────────────────────────────────────
function InfoGrid({ fields }: { fields: InfoField[] }) {
  return (
    <div className="grid items-baseline grid-cols-2 gap-2 mt-4">
      {fields.map((field) => (
        <div
          key={field.label}
          className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2"
        >
          <h2 className="font-bold">{field.label}:</h2>
          <span>{field.value}</span>
        </div>
      ))}
    </div>
  );
}
