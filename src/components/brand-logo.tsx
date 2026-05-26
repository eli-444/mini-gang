import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({ href = "/", className = "", imageClassName = "", priority = false }: BrandLogoProps) {
  const logo = (
    <Image
      src="/brand/logo.avif"
      alt="Mini Gang"
      width={180}
      height={96}
      priority={priority}
      className={`h-auto w-20 object-contain ${imageClassName}`}
      sizes="(max-width: 768px) 80px, 112px"
    />
  );

  if (!href) {
    return <div className={className}>{logo}</div>;
  }

  return (
    <Link href={href} className={className} aria-label="Accueil Mini Gang">
      {logo}
    </Link>
  );
}
