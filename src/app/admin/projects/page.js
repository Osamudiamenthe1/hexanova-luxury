/**
 * src/app/admin/projects/page.js
 * List all projects with edit and delete actions.
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listProjectsAdmin } from "@/lib/data/admin-projects";
import { deleteProject } from "@/lib/actions/projects";
import SavedBanner from "@/components/admin/saved-banner";
import DeleteButton from "@/components/admin/delete-button";
import Button from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const saved = params?.saved;

  const projects = await listProjectsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Completed interiors. Drafts are hidden from the public site.
          </p>
        </div>
        <Button href="/admin/projects/new" size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          New project
        </Button>
      </div>

      <SavedBanner
        message={
          saved === "created"
            ? "Project created."
            : saved === "updated"
              ? "Project updated."
              : null
        }
      />

      {projects.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">No projects yet.</p>
          <Button href="/admin/projects/new">Create your first project</Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Project
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Location
                </th>
                <th className="hidden md:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Year
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0 bg-muted rounded-sm overflow-hidden">
                        {project.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="font-medium hover:text-accent transition-colors line-clamp-1"
                        >
                          {project.title}
                        </Link>
                        {/* Mobile-only status badge */}
                        <span
                          className={`sm:hidden inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded-sm ${
                            project.status === "published"
                              ? "bg-accent/15 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground">
                    {project.location || "—"}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-right text-muted-foreground">
                    {project.year || "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${
                        project.status === "published"
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-xs text-foreground/80 hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProject.bind(null, project.id)}
                        confirmMessage={`Delete "${project.title}"? Its gallery images will also be removed. This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
