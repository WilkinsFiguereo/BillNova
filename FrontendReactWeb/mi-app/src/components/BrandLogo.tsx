import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  priority?: boolean;
  className?: string;
};

export function BrandLogo({
  size = 40,
  priority = false,
  className,
}: BrandLogoProps) {
  return (
    <Image
      src="/logos/logo.png"
      alt="Logo de BillNova"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
