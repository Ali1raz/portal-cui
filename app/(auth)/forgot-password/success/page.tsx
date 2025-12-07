import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full max-w-xl mx-auto">
      <Card className="p-8 w-full">
        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
        <CardDescription className="text-muted-foreground">
          Reset password link sent successfully, click the link to create new
          passwword.
        </CardDescription>
      </Card>
    </div>
  );
}
