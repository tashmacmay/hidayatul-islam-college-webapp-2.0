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

const sectionHeaderVariants = {
  centered: {
    wrapper: "text-center",
    divider: "gold-divider mx-auto",
    description: "mx-auto mt-6 max-w-3xl text-gray-600",
  },
  "centered--tight": {
    wrapper: "text-center",
    divider: "mx-auto mt-4 h-1 w-16 rounded-full bg-gold",
    description: "mx-auto mt-6 max-w-3xl text-gray-600",
  },
  left: {
    wrapper: "text-left",
    divider: "gold-divider",
    description: "max-w-prose text-gray-600",
  },
  onNavy: {
    wrapper: "text-center",
    divider: "gold-divider mx-auto",
    description: "mx-auto mt-6 max-w-3xl text-blue-100",
  },
};

export function SectionHeader({
  label,
  title,
  description,
  variant = "centered",
  divider = true,
  className = "",
}) {
  const styles = sectionHeaderVariants[variant] || sectionHeaderVariants.centered;
  const titleClass = variant === "onNavy" ? "section-title text-white" : "section-title";
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <p className="section-label">{label}</p>}
      <h2 className={titleClass}>{title}</h2>
      {divider && <div className={styles.divider} />}
      {description && <p className={`section-subtitle ${styles.description}`}>{description}</p>}
    </div>
  );
}

const iconCardVariants = {
  dark: {
    card: "card-academic-dark",
    icon: "",
    title: "mt-3 text-base font-semibold text-gold",
    description: "mt-3 text-sm leading-6 text-blue-100",
  },
  light: {
    card: "card-academic-light",
    icon: "text-2xl",
    title: "mt-4 text-base font-semibold text-navy",
    description: "mt-4 text-sm leading-7 text-gray-600",
  },
  assessment: {
    card: "card-assessment",
    icon: "",
    title: "mt-3 font-bold text-navy",
    description: "mt-2 text-sm text-gray-600",
  },
  community: {
    card: "card-community",
    icon: "text-gold",
    title: "font-bold text-navy",
    description: "mt-2 text-sm text-gray-600",
  },
  person: {
    card: "card-person",
    icon: "mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold",
    title: "mt-5 text-base font-semibold text-navy",
    description: "mt-3 text-sm leading-6 text-gray-600",
  },
  language: {
    card: "card-academic-light text-center",
    icon: "text-2xl",
    title: "mt-4 text-base font-semibold text-navy",
    description: "mt-4 text-sm leading-7 text-gray-600",
  },
};

export function IconCard({
  icon,
  title,
  description,
  variant = "light",
  className = "",
  children,
}) {
  const styles = iconCardVariants[variant] || iconCardVariants.light;
  const content = (
    <>
      <h3 className={styles.title}>{title}</h3>
      {variant === "language" && children}
      {description && <p className={styles.description}>{description}</p>}
      {variant !== "language" && children}
    </>
  );

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      {variant === "community" ? <div className="flex items-center gap-3">{content}</div> : content}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  variant = "default",
  titleElement = "h2",
}) {
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

export function StatStrip({ items, tone = "gold" }) {
  return (
    <section className={`section-shell--${tone} grid text-navy md:grid-cols-4`}>
      {items.map(({ icon, title, text }) => (
        <div key={`${title}-${text}`} className="flex items-center justify-center gap-4 border-r border-navy/15 px-6 py-6 last:border-r-0">
          {icon && <div className="text-navy [&>svg]:h-8 [&>svg]:w-8">{icon}</div>}
          <div>
            <h3 className={icon ? "text-base font-semibold" : "text-lg font-bold"}>{title}</h3>
            <p className={icon ? "text-sm" : "mt-1 text-sm"}>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function CtaBanner({ title, description, actions }) {
  return (
    <section className="section-shell section-shell--navy">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeader title={title} description={description} variant="onNavy" />
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {actions.map(({ label, href, variant = "primary" }) => (
            <Link key={label} href={href} className={variant === "secondary-dark" ? "button-secondary-dark" : `button-${variant}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InfoRow({ icon, title, children }) {
  return (
    <div className="card-muted flex gap-4">
      <div className="info-badge">{icon}</div>
      <div>
        <h3 className="font-semibold text-navy">{title}</h3>
        {children}
      </div>
    </div>
  );
}
