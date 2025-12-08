import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserImage({
  image,
  name,
  className,
}: {
  image?: string | null;
  name: string;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={
          image ??
          `https://avatar.vercel.sh/${name && name.length > 0 ? name[0] : "U"}`
        }
        alt="Profile image"
      />
      <AvatarFallback>{name && name.length > 0 ? name[0] : "U"}</AvatarFallback>
    </Avatar>
  );
}
