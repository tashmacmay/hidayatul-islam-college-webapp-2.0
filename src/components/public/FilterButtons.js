"use client";

import { useState } from "react";

export default function FilterButtons({
  items,
  initialValue = items[0],
  value,
  onChange,
  tone = "default",
  className = "",
}) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const selected = value ?? internalValue;
  const baseClass = tone === "navy" ? "filter-chip--on-navy" : "filter-chip";

  return (
    <div className={className}>
      {items.map((item) => {
        const active = selected === item;
        const stateClass = tone === "navy"
          ? active ? "filter-chip--on-navy-active" : "filter-chip--on-navy-inactive"
          : active ? "filter-chip--active" : "filter-chip--inactive";
        return (
          <button
            key={item}
            onClick={() => {
              setInternalValue(item);
              onChange?.(item);
            }}
            className={`${baseClass} ${stateClass}`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
