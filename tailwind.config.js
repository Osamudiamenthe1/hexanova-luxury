/**
 * tailwind.config.js
 * Tailwind CSS v3.4 configuration for Deval Luxury.
 *
 * Two rules keep this project easy to re-theme:
 *  1. darkMode is "class" - next-themes adds/removes the "dark" class on <html>.
 *  2. Every colour is a CSS variable defined in src/app/globals.css.
 *     That means we never hardcode a hex value inside a component.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  // Tailwind scans these files and only ships the classes it actually finds.
  // If you ever add a folder with class names in it, add the path here too.
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        // Page background and default text colour.
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Surfaces that sit on top of the background (cards, panels).
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        // De-emphasised text and subtle fills.
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // Hairlines and dividers.
        border: "var(--border)",

        // Form field borders and focus rings.
        input: "var(--input)",
        ring: "var(--ring)",

        // The single brand accent (from the client's logo).
        // Used sparingly: buttons, links, small highlights.
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          hover: "var(--accent-hover)",
        },
      },

      // Make the plain `border` utility use our border token by default,
      // so we can write `border` instead of `border-border` everywhere.
      // This merges with Tailwind's defaults, so `border-accent` still works.
      borderColor: {
        DEFAULT: "var(--border)",
      },

      // Fonts are wired up in src/app/layout.js with next/font/google,
      // which exposes them as CSS variables.
      // To change the brand fonts, edit BOTH this file and src/app/layout.js.
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },

      // A quiet, luxury-appropriate scale. Headings breathe.
      fontSize: {
        "display-lg": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display":    ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },

      // Slightly generous radii. Luxury reads as soft, not boxy.
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },

      // Extra vertical rhythm for large, airy sections.
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },

      // Subtle entrance animation. globals.css disables it automatically
      // when the visitor has "reduce motion" turned on.
            // Subtle entrance animations. globals.css disables them automatically
      // when the visitor has "reduce motion" turned on.
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Slides a small panel down from the top. Used by the mobile menu.
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0)   scale(1)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s ease-out both",
        "fade-in":    "fade-in 0.4s ease-out both",
        "slide-down": "slide-down 0.2s ease-out both",
      },

      // Keeps long-form copy comfortable to read.
      maxWidth: {
        prose: "68ch",
      },
    },
  },

  plugins: [],
};