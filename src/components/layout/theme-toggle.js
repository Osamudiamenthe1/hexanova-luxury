/**
 * src/components/layout/theme-toggle.js
 * A button that cycles through light / dark / system.
 *
 * Uses next-themes. Styled with the accent colour (gold) so it matches
 * the brand mark and the hamburger beside it. Hover fills with a soft
 * accent tint instead of just changing the border.
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-accent/40"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const nextTheme =
    theme === "system" ? "light" : theme === "light" ? "dark" : "system";

  const label =
    theme === "system"
      ? "Theme: system. Click to switch to light."
      : theme === "light"
      ? "Theme: light. Click to switch to dark."
      : "Theme: dark. Click to switch to system.";

  const iconKey =
    theme === "system" ? "system" : resolvedTheme === "dark" ? "dark" : "light";

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-accent/40 text-accent hover:bg-accent/10 hover:border-accent transition-colors duration-200"
    >
      <span className="relative h-4 w-4">
        <Monitor
          className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${
            iconKey === "system" ? "opacity-100" : "opacity-0"
          }`}
        />
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${
            iconKey === "light" ? "opacity-100" : "opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${
            iconKey === "dark" ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </button>
  );
}