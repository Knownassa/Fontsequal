import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type HugeIconProps = {
  icon: IconSvgElement;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function HugeIcon({
  icon,
  className,
  size = 18,
  strokeWidth = 1.7,
}: HugeIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  );
}
