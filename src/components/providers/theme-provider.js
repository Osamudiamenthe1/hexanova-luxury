/**
 * src/components/providers/theme-provider.js
 * A tiny wrapper around next-themes so the root layout can stay a Server
 * Component. All this file does is mark ThemeProvider as a client component.
 *
 * The important settings:
 *   - attribute="class"    : next-themes toggles a "dark" class on <html>.
 *                            Our CSS variables in globals.css respond to it.
 *   - defaultTheme="system": Respect the visitor's OS setting on first visit.
 *   - enableSystem          : Keep following the OS setting until they choose.
 *   - disableTransitionOnChange : Stop buttons and cards from flickering
 *                            when the theme changes.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}