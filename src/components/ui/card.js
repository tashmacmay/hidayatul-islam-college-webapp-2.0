import Link from "next/link";

export function Card({
  variant = "light",      // light | pale | navy | ghost
  href,
  media,                  // Top slot: image OR <FileBadge/>
  icon,                   // Top icon (optional)
  centered = false,       // Centers the icon
  padded = true,          // p-6 by default
  className = "",
  children,
}) {
  const base = "rounded-2xl overflow-hidden transition flex flex-col w-full h-full";
  
  const variants = {
    light: "bg-white border border-gray-200 shadow-sm",
    pale:  "bg-cream border border-gold/30 shadow-sm",
    navy:  "bg-navy text-white shadow-md border border-navy/10",
    ghost: "bg-transparent border border-gray-200",
  };

  const hover = href
    ? "hover:-translate-y-1 hover:shadow-md hover:border-gold group"
    : "";

  const inner = (
    <div className={`${base} ${variants[variant]} ${hover} ${className}`}>
      {media && (
        <div className="aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-100 relative">
          {media}
        </div>
      )}
      
      <div className={padded ? "p-6 flex flex-col flex-1" : "flex flex-col flex-1"}>
        {icon && (
          <div className={centered ? "mx-auto flex justify-center mb-4" : "mb-4"}>
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}