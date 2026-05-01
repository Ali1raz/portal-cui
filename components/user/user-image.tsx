import { useConstructImageUrl } from "@/hooks/use-construct-url";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserImage({
  image,
  name,
  className,
}: {
  image?: string | null;
  name?: string | null;
  className?: string;
}) {
  const constructedImageUrl = useConstructImageUrl(image ?? "");

  const imageUrl = !image
    ? `https://avatar.vercel.sh/${name ?? "U"}`
    : image.includes("avatars.vercel.sh")
      ? image
      : constructedImageUrl;

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt="Profile image" />
      <AvatarFallback>{name && name.length > 0 ? name[0] : "U"}</AvatarFallback>
    </Avatar>
  );
}
