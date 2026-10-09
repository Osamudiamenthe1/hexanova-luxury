/**
 * src/components/admin/admin-nav.js
 * The admin sidebar navigation.
 *
 * Client component because it uses usePathname to highlight the current
 * section. The list of sections is defined once at the top of the file
 * so adding a new section is a one-line change.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Briefcase,
  Quote,
  Inbox,
  Settings,
} from "lucide-react";

const SECTIONS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/**
 * Is the given link the current section?
 * "exact" is used for the dashboard, so it isn't highlighted when the
 * user is on any sub-page.
 */
function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 py-4">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const active = isActive(pathname, section.href, section.exact);
        return (
          <Link
            key={section.href}
            href={section.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md mx-2 transition-colors duration-150 ${
              active
                ? "bg-muted/70 text-foreground font-medium"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}