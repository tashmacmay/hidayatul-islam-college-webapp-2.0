export function Section({
  tone = "white",       // white | cream | navy
  space = "md",         // sm | md | lg
  as: Tag = "section",
  id,
  className = "",
  children,
}) {
  const tones = {
    white: "bg-white",
    cream: "bg-cream",
    navy:  "bg-navy text-white",
  };
  const spaces = {
    sm: "py-14 md:py-20",
    md: "py-20 md:py-24",
    lg: "py-24 md:py-32",
  };
  return (
    <Tag
      id={id}
      className={`${tones[tone]} ${spaces[space]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

export function Container({
  size = "default",     // narrow | default | wide
  className = "",
  children,
}) {
  const sizes = {
    narrow:  "max-w-3xl",
    default: "max-w-6xl",
    wide:    "max-w-7xl",
  };
  // Note the px-6 md:px-10 here — this is what prevents the bleed!
  return (
    <div className={`mx-auto ${sizes[size]} px-6 md:px-10 ${className}`.trim()}>
      {children}
    </div>
  );
}