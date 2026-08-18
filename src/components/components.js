import Link from "next/link";

export function Button({ href, children, variant = "primary", className = "" }) {
  const baseStyles =
    "inline-block rounded-lg px-5 py-3 text-sm font-semibold transition";

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
    <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
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