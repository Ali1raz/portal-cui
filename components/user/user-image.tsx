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
  console.log(image, "---->>> user image prop");
  const constructedImageUrl = useConstructImageUrl(image || "");

  const imageUrl = !image
    ? `https://avatar.vercel.sh/${name && name.length > 0 ? name : "U"}`
    : image.includes("avatars.vercel.sh")
      ? image
      : constructedImageUrl;

  console.log(imageUrl, "---->>> user image url");

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt="Profile image" />
      <AvatarFallback>{name && name.length > 0 ? name[0] : "U"}</AvatarFallback>
    </Avatar>
  );
}
