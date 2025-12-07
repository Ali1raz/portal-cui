import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "./_components/forgot-password-form/page";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full max-w-xl mx-auto">
      <Card className="p-8 w-full">
        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
        <CardDescription className="text-muted-foreground">
          Please provide your Email to get password reset link.
        </CardDescription>

        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
