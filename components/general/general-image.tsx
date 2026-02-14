import { useConstructImageUrl } from "@/hooks/use-construct-url";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageZoom } from "../kibo-ui/image-zoom";

/**
 * GeneralImage component for rendering images with custom src, width, height, and className.
 * @param src - The image source URL
 * @param width - The width of the image
 * @param height - The height of the image
 * @param className - Additional CSS classes
 * @param alt - Alt text for the image
 */
export function GeneralImage({
  src,
  width,
  height,
  className,
  alt = "Image",
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  alt?: string;
}) {
  return (
    <ImageZoom
      canSwipeToUnzoom
      backdropClassName={cn(
        '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80'
      )}
    >
      <Image
        src={useConstructImageUrl(src)}
        width={width}
        height={height}
        className={className}
        alt={alt}
      />
    </ImageZoom>
  );
}
