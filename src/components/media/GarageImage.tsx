"use client";

import Image from "next/image";

export function GarageImage({
  src,
  alt,
  fill,
  className,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        sizes={fill ? "(max-width: 768px) 100vw, 480px" : undefined}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={
        fill
          ? `absolute inset-0 h-full w-full object-cover ${className ?? ""}`
          : className
      }
    />
  );
}
