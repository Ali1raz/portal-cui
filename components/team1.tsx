import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  url: string;
}

interface Team1Props {
  heading?: string;
  subheading?: string;
  description?: string;
  members?: TeamMember[];
  className?: string;
}

const Team = ({
  heading = "Team",
  description = "Built by a team of passionate individuals dedicated to creating innovative solutions.",
  members = [
    {
      id: "member-1",
      name: "Mr. Abdullah",
      role: "Supervisor",
      avatar: "https://avatars.githubusercontent.com/u/79458502?v=4",
      url: "https://github.com/githubprojectmine",
    },
    {
      id: "member-2",
      name: "Ali Raza",
      role: "Developer",
      avatar: "https://avatars.githubusercontent.com/u/129389379?v=4",
      url: "https://github.com/ali1raz",
    },
    {
      id: "member-3",
      name: "Syed Ahmar Hussain",
      role: "Documentation",
      avatar: "https://avatars.githubusercontent.com/u/199702728?v=4",
      url: "https://github.com/ahmar72",
    },
  ],
  className,
}: Team1Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container flex flex-col items-center text-center">
        <h2 className="my-6 text-2xl font-bold text-pretty lg:text-4xl">
          {heading}
        </h2>
        <p className="mb-8 max-w-3xl text-muted-foreground lg:text-xl">
          {description}
        </p>
      </div>
      <div className="container mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            <Avatar className="mb-4 size-28 md:mb-5 lg:size-36">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name}</AvatarFallback>
            </Avatar>
            <p className="text-center font-medium">{member.name}</p>
            <p className="text-center text-muted-foreground">{member.role}</p>
            <a
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 hover:underline"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export { Team };
