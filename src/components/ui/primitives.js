import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Section, Container } from "./layout";

const pageHeroVariants = {
  standard: { hero: "page-hero--standard", content: "page-hero-content--standard" },
};

export function PageHero({ image, imageAlt, breadcrumb, title, description, variant = "standard", pattern = "stripes", className = "" }) {
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

const sectionHeaderVariants = {
  centered: { wrapper: "text-center", divider: "section-header-divider", description: "mx-auto mt-6 max-w-3xl text-gray-600" },
  "centered--tight": { wrapper: "text-center", divider: "mx-auto mt-4 h-1 w-16 rounded-full bg-gold", description: "mx-auto mt-6 max-w-3xl text-gray-600" },
  "centered--roomy": { wrapper: "text-center", divider: "section-header-divider", description: "mx-auto mt-6 max-w-3xl leading-8 text-gray-600" },
  left: { wrapper: "text-left", divider: "gold-divider", description: "max-w-prose text-gray-600" },
  onNavy: { wrapper: "text-center", divider: "section-header-divider", description: "mx-auto mt-6 max-w-3xl text-blue-100" },
  "onNavy--large-label": { wrapper: "text-center", divider: "section-header-divider", description: "mx-auto mt-6 max-w-3xl text-blue-100", label: "text-sm font-semibold uppercase tracking-[3px] text-gold" },
};

export function SectionHeader({ label, title, description, variant = "centered", divider = true, className = "" }) {
  const styles = sectionHeaderVariants[variant] || sectionHeaderVariants.centered;
  const titleClass = variant === "onNavy" ? "section-title text-white" : "section-title";
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <p className={styles.label || "section-label"}>{label}</p>}
      <h2 className={titleClass}>{title}</h2>
      {divider && <div className={styles.divider} />}
      {description && <p className={`section-subtitle ${styles.description}`}>{description}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, description, variant = "default", titleElement = "h2" }) {
  const TitleElement = titleElement;
  const cardClass = variant === "gallery" ? "empty-state-gallery" : "empty-state-card";
  return (
    <div className={cardClass}>
      <div className="empty-state-icon">{icon}</div>
      <TitleElement className="empty-state-title">{title}</TitleElement>
      <p className="empty-state-copy">{description}</p>
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

export function SubjectList({ items }) {
  return (
    <ul className="mt-6 space-y-3 text-sm text-blue-100">
      {items.map((item) => <li key={item}><span className="mr-2 text-gold">•</span>{item}</li>)}
    </ul>
  );
}

export function StatStrip({ items }) {
  return (
    <section className="grid bg-gold text-navy md:grid-cols-4">
      {items.map(({ icon, title, text }) => (
        <div key={`${title}-${text}`} className="flex items-center justify-center gap-4 border-r border-navy/15 px-6 py-6 last:border-r-0">
          {icon && <div className="text-navy [&>svg]:h-8 [&>svg]:w-8">{icon}</div>}
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function CtaBanner({ eyebrow, title, description, actions = [] }) {
  return (
    <Section tone="navy">
      <Container size="narrow" className="text-center">
        <SectionHeader label={eyebrow} title={title} description={description} variant="onNavy" />
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {actions.map(({ label, href, variant = "primary" }) => {
            const className = variant === "secondary-dark" ? "button-secondary-dark" : `button-${variant}`;
            return href?.includes(":") ? (
              <a key={label} href={href} className={className}>{label}</a>
            ) : (
              <Link key={label} href={href} className={className}>{label}</Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function InfoRow({ icon, title, children }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-navy">{title}</h3>
        {children}
      </div>
    </div>
  );
}