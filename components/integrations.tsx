import { cn } from "@/lib/utils";
import {
  AwsS3,
  BetterAuth,
  GitHub,
  Inngest,
  Neon,
  PostgreSQL,
  PostHog,
  Vercel,
} from "./companies";
import Image from "next/image";
import { DecorIcon } from "./decoricon";

type Integration = {
  logo: React.ReactElement;
  name: string;
  description: string;
  icon?: React.ReactNode;
};

const data: Integration[] = [
  {
    logo: <Vercel className="invert dark:invert-0" />,
    name: "Vercel",
    description:
      "Deploy instantly with zero-configuration. Automatic previews for every commit with unmatched performance and reliability.",
    icon: <DecorIcon position="top-left" />,
  },
  {
    logo: <GitHub className="invert dark:invert-0" />,
    name: "GitHub",
    description:
      "Version control and collaboration platform. Manage code, track issues, and automate workflows with GitHub Actions.",
    icon: <DecorIcon position="bottom-left" />,
  },
  {
    logo: <Inngest className="size-16 invert dark:invert-0" />,
    name: "Inngest",
    description:
      "Serverless event-driven background jobs. Build durable workflows with automatic retries and observability.",
    icon: <DecorIcon position="bottom-left" />,
  },
  {
    logo: <BetterAuth />,
    name: "Better Auth",
    description:
      "TypeScript-first authentication framework. Secure, flexible, and easy to integrate with any database.",
  },
  {
    logo: <AwsS3 className="size-8" />,
    name: "AWS S3",
    description:
      "Object storage service with industry-leading scalability and durability. Store and retrieve any amount of data.",
    icon: <DecorIcon position="bottom-left" />,
  },
  {
    logo: (
      <Image src="/arcjet.jpg" alt="Arcjet" className="object-cover" fill />
    ),
    name: "Arcjet",
    description:
      "Security layer for applications. Protection against bots, rate limiting, and email validation out of the box.",
    icon: <DecorIcon position="bottom-left" />,
  },
  {
    logo: <PostHog />,
    name: "PostHog",
    description:
      "Product analytics and feature management. Understand user behavior with session replays and feature flags.",
  },
  {
    logo: <Neon />,
    name: "Neon",
    description:
      "Serverless Postgres with instant branching. Scale to zero, pay for what you use with modern developer experience.",
  },
  {
    logo: <PostgreSQL />,
    name: "PostgreSQL",
    description:
      "Open-source relational database system. Reliable, scalable, and feature-rich for enterprise applications.",
  },
];

export function Integrations() {
  return (
    <section className="mx-auto max-w-5xl">
      <h1
        id="integrations"
        className="text-center text-2xl tracking-tight mb-8 font-semibold md:text-4xl"
      >
        Integrated with Popular Tools
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Our platform integrates seamlessly with popular tools and services to
        enhance workflow.
      </p>
      <div className="relative border">
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
          {data.map((item) => (
            <IntegrationCard integration={item} key={item.name}>
              {item.icon}
            </IntegrationCard>
          ))}
        </div>
        <DecorIcon position="top-left" />
        <DecorIcon position="top-right" />
        <DecorIcon position="bottom-left" />
        <DecorIcon position="bottom-right" />
      </div>
    </section>
  );
}

function IntegrationCard({
  integration,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  integration: Integration;
}) {
  const { logo } = integration;
  return (
    <div
      className={cn(
        "relative flex flex-col items-start gap-4 bg-background p-4 text-start md:p-6 md:even:bg-background/75",
        className
      )}
      {...props}
    >
      <span className="size-8 mb-auto relative">{logo}</span>
      <div className="space-y-1">
        <h3 className="font-semibold">{integration.name}</h3>
        <p className="text-muted-foreground text-xs md:text-sm">
          {integration.description}
        </p>
      </div>
      {children}
    </div>
  );
}
