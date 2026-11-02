import Link from "next/link";

export function Button({
  variant = "primary", // primary | secondary | outline-gold | ghost | dark
  size = "md",         // sm | md
  href,
  className = "",
  children,
  ...props
}) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 gap-2";
  
  const variants = {
    primary: "bg-gold text-navy hover:bg-gold-light",
    secondary: "border border-white/50 text-white hover:bg-white hover:text-navy",
    "outline-gold": "border border-gold text-gold hover:bg-gold hover:text-navy",
    dark: "bg-navy text-white hover:bg-navy-dark",
    ghost: "text-navy hover:bg-gold/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    if (href.includes(":") || href.startsWith("#")) {
      return <a href={href} className={classes} {...props}>{children}</a>;
    }
    return <Link href={href} className={classes} {...props}>{children}</Link>;
  }

  return <button className={classes} {...props}>{children}</button>;
}