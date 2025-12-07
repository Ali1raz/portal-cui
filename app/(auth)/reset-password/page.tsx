import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/reset-password-form";

interface iAppProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ searchParams }: iAppProps) {
  const { token } = await searchParams;
  if (!token) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center w-full max-w-xl mx-auto">
      <Card className="p-8 w-full">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Please enter your new password.
        </CardDescription>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
