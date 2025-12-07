import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full max-w-xl mx-auto">
      <Card className="p-8 w-full">
        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
        <CardDescription className="text-green-600 dark:text-green-400">
          We sent you an email with verification link, click on that link to
          verify your email.
        </CardDescription>
      </Card>
    </div>
  );
}
