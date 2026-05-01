import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

type OpenEmailLinkProps = {
  userEmail?: string;
};

export function OpenEmailLink({ userEmail }: OpenEmailLinkProps) {
  const senderEmail = env.NODEMAILER_USER;

  const hasEmailContext = Boolean(userEmail && senderEmail);

  const gmailSearchUrl = hasEmailContext
    ? `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent(
        userEmail as string
      )}#search/from:${encodeURIComponent(senderEmail as string)}`
    : "https://mail.google.com/mail/u/0/";

  return (
    <Button asChild variant="link" className="mt-2">
      <a href={gmailSearchUrl} target="_blank" rel="noopener noreferrer">
        Open Email
      </a>
    </Button>
  );
}
