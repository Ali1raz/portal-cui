import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
  width?: number;
  height?: number;
  showText?: boolean;
  imageClasses?: string | undefined;
  textClasses?: string | undefined;
  className?: string | undefined;
}

export function CUILogo({
  width = 70,
  height = 70,
  showText = true,
  imageClasses,
  textClasses,
  className,
}: iAppProps) {
  return (
    <Link href="/" aria-label="home" className={cn("space-x-2 ", className)}>
      <Image
        src="/image.png"
        alt="CUI"
        // fill
        width={width}
        height={height}
        className={cn(imageClasses)}
      />
      {showText && (
        <div
          className={cn(
            "text-xl no-underline font-bold uppercase",
            textClasses
          )}
        >
          comsats university
          <br />
          <span className="text-balance">islamabad</span>
        </div>
      )}
    </Link>
  );
}
