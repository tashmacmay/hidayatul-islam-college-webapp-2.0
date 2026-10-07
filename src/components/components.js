import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const pageHeroVariants = {
  standard: {
    hero: "page-hero--standard",
    content: "page-hero-content--standard",
  },
  about: {
    hero: "page-hero--about",
    content: "page-hero-content--about",
  },
};

export function PageHero({
  image,
  imageAlt,
  breadcrumb,
  title,
  description,
  variant = "standard",
  pattern = "stripes",
  className = "",
}) {
  const heroVariant = pageHeroVariants[variant] || pageHeroVariants.standard;

  return (
    <section className={`page-hero ${heroVariant.hero} ${className}`}>
      <img src={image} alt={imageAlt} className="page-hero-image" />
      <div className="page-hero-overlay" />
      <div className={`page-hero-pattern page-hero-pattern--${pattern}`} />
      <div className={`page-hero-content ${heroVariant.content}`}>
        <p className="page-breadcrumb">
          <Link href="/" className="page-breadcrumb-link">Home</Link>
          <span aria-hidden="true" className="page-breadcrumb-separator">›</span>
          <span aria-current="page" className="page-breadcrumb-current">{breadcrumb}</span>
        </p>
        <h1 className="page-hero-title">{title}</h1>
        <p className="page-hero-copy">{description}</p>
      </div>
    </section>
  );
}

export function SectionHeader({
  label,
  title,
  description,
  className = "",
  labelClassName = "section-label",
  titleClassName = "section-title",
  descriptionClassName = "section-subtitle",
  dividerClassName = "section-header-divider",
}) {
  return (
    <div className={className}>
      {label && <p className={labelClassName}>{label}</p>}
      <h2 className={titleClassName}>{title}</h2>
      {dividerClassName && <div className={dividerClassName} />}
      {description && <p className={descriptionClassName}>{description}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  className = "empty-state-card",
  iconClassName = "empty-state-icon",
  titleClassName = "empty-state-title",
  descriptionClassName = "empty-state-copy",
  titleElement = "h2",
}) {
  const TitleElement = titleElement;

  return (
    <div className={className}>
      <div className={iconClassName}>{icon}</div>
      <TitleElement className={titleClassName}>{title}</TitleElement>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}

export function IconCard({
  icon,
  title,
  children,
  className,
  iconClassName,
  contentClassName,
  titleClassName,
  groupContent = false,
}) {
  return (
    <div className={className}>
      <div className={iconClassName}>{icon}</div>
      {groupContent ? (
        <div className={contentClassName}>
          <h3 className={titleClassName}>{title}</h3>
          {children}
        </div>
      ) : (
        <>
          <h3 className={titleClassName}>{title}</h3>
          {children}
        </>
      )}
    </div>
  );
}

export function PopiaNote({ title = "POPIA Notice", children, variant = "gallery", className = "" }) {
  return (
    <div className={`popia-note popia-note--${variant} ${className}`}>
      <div className="popia-note-icon"><ShieldCheck className="h-4 w-4" /></div>
      <div>
        <p className="popia-note-title">{title}</p>
        <p className="popia-note-copy">{children}</p>
      </div>
    </div>
  );
}

export function Button({ href, children, variant = "primary", className = "" }) {
  const baseStyles = "inline-block rounded-lg px-5 py-3 text-sm font-semibold transition";

  const variantStyles =
    variant === "secondary"
      ? "border border-navy text-navy hover:bg-navy hover:text-white"
      : "bg-gold text-navy hover:bg-gold-light";

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${variantStyles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ title, children, href }) {
  const cardContent = (
    <div className="card-surface h-full transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-text-muted">{children}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export function HeroBanner() {
  return (
    <section className="bg-navy px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-gold">
          Welcome to Hidayatul Islam College
        </p>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          A caring school community rooted in learning and values.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
          Hidayatul Islam College offers primary school education focused on
          academic growth, character development, and community connection.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/contact">Contact Us</Button>
          <Button
            href="/academics"
            variant="secondary"
            className="border-white text-white hover:bg-white hover:text-navy"
          >
            View Academics
          </Button>
        </div>
      </div>
    </section>
  );
}