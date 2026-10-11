export default function PageHeader({
  icon: Icon,
  portalLabel,
  title,
  subtitle,
}) {
  return (
    <section className="mb-7">
      <div className="mb-1 flex items-center gap-2">
        <Icon
          size={21}
          className="text-gold"
        />

        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {portalLabel}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-navy md:text-3xl">
        {title}
      </h1>

      <p className="mt-1 max-w-2xl text-sm text-text-muted">
        {subtitle}
      </p>
    </section>
  );
}
