/**
 * src/components/admin/admin-shell.js
 * Client shell for the admin area. Matches the public site's accent
 * treatment so the brand mark and control buttons feel consistent.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import AdminNav from "./admin-nav";
import ThemeToggle from "@/components/layout/theme-toggle";

export default function AdminShell({
  children,
  signOutForm,
  brandName = "HexaNova Luxury",
}) {
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  function openDrawer() {
    setDrawerMounted(true);
    requestAnimationFrame(() => setDrawerVisible(true));
  }

  function closeDrawer() {
    setDrawerVisible(false);
    setTimeout(() => setDrawerMounted(false), 300);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5 border-b border-border">
        {/* Brand mark in accent colour to match the public site. */}
        <p className="font-heading tracking-[0.2em] uppercase text-sm text-accent text-accent-stroked">
          {brandName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Admin</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AdminNav onNavigate={closeDrawer} />
      </div>

      <div className="border-t border-border py-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground rounded-md mx-2 transition-colors duration-150"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View site
        </Link>
        {signOutForm}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card/40">
        {sidebar}
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-4 h-14">
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open admin menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-accent/40 text-accent transition-colors duration-200 hover:bg-accent/10 hover:border-accent"
        >
          <Menu className="h-4 w-4" />
        </button>
        <p className="font-heading tracking-[0.2em] uppercase text-sm text-accent text-accent-stroked">
          {brandName}
        </p>
        <ThemeToggle />
      </header>

      <div className="hidden lg:block lg:pl-64">
        <div className="sticky top-0 z-30 flex justify-end px-8 py-4 border-b border-border bg-background/95 backdrop-blur">
          <ThemeToggle />
        </div>
      </div>

      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      {drawerMounted && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              drawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <aside
            className={`absolute inset-y-0 left-0 w-64 bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-out ${
              drawerVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-accent hover:bg-accent/10 transition-colors duration-150"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
    </div>
  );
}
