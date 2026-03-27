"use client";

import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  color?: "green" | "blue";
  disabled?: boolean;
}

const COLOR_MAP = {
  green: {
    track: "peer-checked:bg-green-500 peer-focus:ring-green-300",
  },
  blue: {
    track: "peer-checked:bg-blue-500 peer-focus:ring-blue-300",
  },
} as const;

export function Toggle({
  checked,
  onChange,
  label,
  color = "blue",
  disabled = false,
}: ToggleProps) {
  const colorClass = COLOR_MAP[color];

  return (
    <label
      className={`relative inline-flex items-center min-h-[44px] min-w-[44px] ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        role="switch"
        aria-label={label}
        aria-checked={checked}
      />
      <div
        className={`w-9 h-5 bg-gray-200 rounded-full peer pointer-events-none ${colorClass.track} peer-focus:ring-2 transition-colors after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full`}
      />
    </label>
  );
}

export type { ToggleProps };
