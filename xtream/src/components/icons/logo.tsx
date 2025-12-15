
import Image from "next/image";
import type { HTMLAttributes } from "react";

interface LogoIconProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary";
  width?: number;
  height?: number;
}

export function LogoIcon({
  variant = "primary",
  width = 80,
  height = 80,
  className = "",
  ...props
}: LogoIconProps) {
  const logoSrc = variant === "primary" ? "/logo-primary.png" : "/logo-secondary.png";
  
  return (
    <div className={`relative ${className}`} style={{ width, height }} {...props}>
      <Image
        src={logoSrc}
        alt="Xtream Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
